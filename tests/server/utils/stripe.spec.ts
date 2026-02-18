import { describe, it, expect } from 'vitest'
import { mapStripeStatus } from '../../../server/utils/stripe'

describe('mapStripeStatus', () => {
  it('maps "active" to "active"', () => {
    expect(mapStripeStatus('active')).toBe('active')
  })

  it('maps "trialing" to "active"', () => {
    expect(mapStripeStatus('trialing')).toBe('active')
  })

  it('maps "past_due" to "past_due"', () => {
    expect(mapStripeStatus('past_due')).toBe('past_due')
  })

  it('maps "canceled" to "canceled"', () => {
    expect(mapStripeStatus('canceled')).toBe('canceled')
  })

  it('maps "unpaid" to "canceled"', () => {
    expect(mapStripeStatus('unpaid')).toBe('canceled')
  })

  it('maps "incomplete_expired" to "canceled"', () => {
    expect(mapStripeStatus('incomplete_expired')).toBe('canceled')
  })

  it('maps "incomplete" to "free" (default)', () => {
    expect(mapStripeStatus('incomplete')).toBe('free')
  })

  it('maps "paused" to "free" (default)', () => {
    expect(mapStripeStatus('paused')).toBe('free')
  })
})
