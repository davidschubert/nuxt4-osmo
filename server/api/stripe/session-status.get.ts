export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sessionId = query.session_id as string

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'session_id is required'
    })
  }

  const stripe = useStripe()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return {
    status: session.status,
    paymentStatus: session.payment_status,
    customerEmail: session.customer_details?.email
  }
})
