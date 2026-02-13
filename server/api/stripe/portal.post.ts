interface PortalBody {
  userId: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<PortalBody>(event)

  if (!body.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId is required'
    })
  }

  const stripe = useStripe()
  const { databases } = useAppwriteAdmin()
  const config = useRuntimeConfig()

  // Look up customer ID from Appwrite
  let stripeCustomerId: string | undefined
  try {
    const profile = await databases.getDocument(
      APPWRITE_DB.DATABASE_ID,
      APPWRITE_DB.COLLECTIONS.USER_PROFILES,
      body.userId
    )
    stripeCustomerId = (profile.stripeCustomerId as string) || undefined
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'User profile not found'
    })
  }

  if (!stripeCustomerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No Stripe customer found for this user. Subscribe first.'
    })
  }

  const appUrl = config.public.appUrl as string || 'http://localhost:3000'
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${appUrl}/account`
  })

  return { url: session.url }
})
