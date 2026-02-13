interface CheckoutBody {
  userId: string
  userEmail: string
  priceId?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CheckoutBody>(event)

  if (!body.userId || !body.userEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId and userEmail are required'
    })
  }

  const stripe = useStripe()
  const { databases } = useAppwriteAdmin()
  const config = useRuntimeConfig()
  const priceId = body.priceId || config.public.stripePriceId as string

  if (!priceId) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe price ID is not configured'
    })
  }

  // Check if user already has a Stripe customer ID
  let stripeCustomerId: string | undefined
  try {
    const profile = await databases.getDocument(
      APPWRITE_DB.DATABASE_ID,
      APPWRITE_DB.COLLECTIONS.USER_PROFILES,
      body.userId
    )
    stripeCustomerId = (profile.stripeCustomerId as string) || undefined
  } catch {
    // Profile may not exist yet – that is fine
  }

  // Create or reuse Stripe customer
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: body.userEmail,
      metadata: { appwriteUserId: body.userId }
    })
    stripeCustomerId = customer.id

    // Save customer ID to Appwrite profile
    try {
      await databases.updateDocument(
        APPWRITE_DB.DATABASE_ID,
        APPWRITE_DB.COLLECTIONS.USER_PROFILES,
        body.userId,
        { stripeCustomerId }
      )
    } catch {
      // Profile does not exist yet – will be created when webhook fires
      console.warn(`Could not update profile for user ${body.userId}, customer ${stripeCustomerId}`)
    }
  }

  // Create Checkout Session
  const appUrl = config.public.appUrl as string || 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/checkout/success`,
    cancel_url: `${appUrl}/pricing?checkout=canceled`,
    metadata: { appwriteUserId: body.userId }
  })

  return { url: session.url }
})
