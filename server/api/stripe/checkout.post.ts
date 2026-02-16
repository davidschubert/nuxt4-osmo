interface CheckoutBody {
  userId: string
  userEmail: string
  priceId: string
  checkoutMode?: 'subscription' | 'payment'
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CheckoutBody>(event)

  if (!body.userId || !body.userEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId and userEmail are required'
    })
  }

  if (!body.priceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'priceId is required'
    })
  }

  const stripe = useStripe()
  const { databases } = useAppwriteAdmin()
  const config = useRuntimeConfig()

  // Validate priceId against known price IDs from config
  const allowedPriceIds = [
    config.public.stripeSoloQuarterlyPriceId,
    config.public.stripeSoloYearlyPriceId,
    config.public.stripeTeamQuarterlyPriceId,
    config.public.stripeTeamYearlyPriceId,
    config.public.stripeLifetimePriceId
  ].filter(Boolean) as string[]

  if (!allowedPriceIds.includes(body.priceId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid price ID'
    })
  }

  // Auto-determine checkout mode: lifetime = one-time payment, others = subscription
  const mode = body.priceId === config.public.stripeLifetimePriceId
    ? 'payment' as const
    : (body.checkoutMode || 'subscription')

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
    mode,
    line_items: [{ price: body.priceId, quantity: 1 }],
    success_url: `${appUrl}/checkout/success`,
    cancel_url: `${appUrl}/plans?checkout=canceled`,
    metadata: {
      appwriteUserId: body.userId,
      checkoutMode: mode
    }
  })

  return { url: session.url }
})
