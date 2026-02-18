import type Stripe from 'stripe'
import type { Databases } from 'node-appwrite'

/**
 * Find the Appwrite userId from a Stripe customerId by querying UserProfiles.
 */
async function resolveUserIdFromCustomer(
  databases: Databases,
  customerId: string
): Promise<string | null> {
  try {
    const { Query } = useAppwriteAdmin()
    const result = await databases.listDocuments(
      APPWRITE_DB.DATABASE_ID,
      APPWRITE_DB.COLLECTIONS.USER_PROFILES,
      [Query.equal('stripeCustomerId', customerId), Query.limit(1)]
    )
    const doc = result.documents[0]
    if (!doc) {
      console.warn(`No user found for Stripe customer ${customerId}`)
      return null
    }
    return doc.$id
  } catch (error) {
    console.error('Failed to resolve user from customer:', error)
    return null
  }
}

export default defineEventHandler(async (event) => {
  const stripe = useStripe()
  const config = useRuntimeConfig()
  const webhookSecret = config.stripeWebhookSecret as string

  if (!webhookSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe webhook secret is not configured'
    })
  }

  // Read raw body for signature verification
  const rawBody = await readRawBody(event)
  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing request body'
    })
  }

  const signature = getHeader(event, 'stripe-signature')
  if (!signature) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing stripe-signature header'
    })
  }

  // Verify webhook signature
  let stripeEvent: Stripe.Event
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook signature verification failed: ${message}`
    })
  }

  const { databases } = useAppwriteAdmin()

  // Handle relevant events
  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.appwriteUserId
      if (!userId) {
        console.warn('checkout.session.completed: no appwriteUserId in metadata')
        break
      }

      const checkoutMode = session.metadata?.checkoutMode || session.mode

      if (checkoutMode === 'payment') {
        // Lifetime / one-time payment
        await databases.updateDocument(
          APPWRITE_DB.DATABASE_ID,
          APPWRITE_DB.COLLECTIONS.USER_PROFILES,
          userId,
          {
            subscriptionStatus: 'active',
            stripeCustomerId: session.customer as string,
            planType: 'lifetime',
            subscribedAt: new Date().toISOString()
          }
        )
        console.log(`User ${userId} lifetime purchase activated`)
      } else {
        // Subscription (Solo or Team)
        const subscriptionId = session.subscription as string
        if (!subscriptionId) break

        await databases.updateDocument(
          APPWRITE_DB.DATABASE_ID,
          APPWRITE_DB.COLLECTIONS.USER_PROFILES,
          userId,
          {
            subscriptionStatus: 'active',
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: session.customer as string,
            subscribedAt: new Date().toISOString()
          }
        )
        console.log(`User ${userId} subscription activated`)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = stripeEvent.data.object as Stripe.Subscription
      const userId = await resolveUserIdFromCustomer(databases, subscription.customer as string)
      if (!userId) break

      const status = mapStripeStatus(subscription.status)
      await databases.updateDocument(
        APPWRITE_DB.DATABASE_ID,
        APPWRITE_DB.COLLECTIONS.USER_PROFILES,
        userId,
        { subscriptionStatus: status }
      )
      console.log(`User ${userId} subscription updated to ${status}`)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = stripeEvent.data.object as Stripe.Subscription
      const userId = await resolveUserIdFromCustomer(databases, subscription.customer as string)
      if (!userId) break

      await databases.updateDocument(
        APPWRITE_DB.DATABASE_ID,
        APPWRITE_DB.COLLECTIONS.USER_PROFILES,
        userId,
        {
          subscriptionStatus: 'free',
          stripeSubscriptionId: null,
          subscribedAt: null,
          planType: null
        }
      )
      console.log(`User ${userId} subscription deleted`)
      break
    }

    default:
      console.log(`Unhandled Stripe event: ${stripeEvent.type}`)
  }

  // Always return 200 to acknowledge receipt
  return { received: true }
})
