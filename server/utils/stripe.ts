import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

/**
 * Singleton Stripe client for server API routes.
 * Reads NUXT_STRIPE_SECRET_KEY from runtime config.
 */
export function useStripe(): Stripe {
  if (stripeInstance) return stripeInstance

  const config = useRuntimeConfig()
  const secretKey = config.stripeSecretKey as string

  if (!secretKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_STRIPE_SECRET_KEY is not configured'
    })
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2026-01-28.clover'
  })

  return stripeInstance
}
