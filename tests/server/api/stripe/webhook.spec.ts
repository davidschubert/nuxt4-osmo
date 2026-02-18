import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mapStripeStatus } from '../../../../server/utils/stripe'

// --- Mock Nitro globals and server utils ---

const mockUpdateDocument = vi.fn()
const mockListDocuments = vi.fn()

vi.stubGlobal('useAppwriteAdmin', () => ({
  databases: {
    updateDocument: mockUpdateDocument,
    listDocuments: mockListDocuments
  },
  Query: {
    equal: (field: string, value: string) => `${field}=${value}`,
    limit: (n: number) => `limit=${n}`
  }
}))

vi.stubGlobal('APPWRITE_DB', {
  DATABASE_ID: 'vault-db',
  COLLECTIONS: {
    USER_PROFILES: 'user-profiles'
  }
})

const mockConstructEvent = vi.fn()

vi.stubGlobal('useStripe', () => ({
  webhooks: {
    constructEvent: mockConstructEvent
  }
}))

const mockUseRuntimeConfig = vi.fn(() => ({
  stripeWebhookSecret: 'whsec_test_secret'
}))
vi.stubGlobal('useRuntimeConfig', mockUseRuntimeConfig)

const mockReadRawBody = vi.fn()
vi.stubGlobal('readRawBody', mockReadRawBody)

const mockGetHeader = vi.fn()
vi.stubGlobal('getHeader', mockGetHeader)

vi.stubGlobal('createError', (opts: { statusCode: number, statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
})
vi.stubGlobal('defineEventHandler', (handler: (...args: unknown[]) => unknown) => handler)

// Import mapStripeStatus so it's available as a global (Nitro auto-import)
vi.stubGlobal('mapStripeStatus', mapStripeStatus)

// Import the handler after all globals are stubbed
const { default: handler } = await import('../../../../server/api/stripe/webhook.post')

describe('Stripe Webhook Handler', () => {
  const fakeEvent = {} as unknown

  beforeEach(() => {
    vi.clearAllMocks()
    mockReadRawBody.mockResolvedValue('raw-body')
    mockGetHeader.mockReturnValue('sig_test')
    mockUseRuntimeConfig.mockReturnValue({
      stripeWebhookSecret: 'whsec_test_secret'
    })
  })

  describe('validation', () => {
    it('throws 500 when webhook secret is missing', async () => {
      mockUseRuntimeConfig.mockReturnValueOnce({
        stripeWebhookSecret: ''
      })

      await expect(handler(fakeEvent)).rejects.toThrow('Stripe webhook secret is not configured')
    })

    it('throws 400 when body is missing', async () => {
      mockReadRawBody.mockResolvedValueOnce(null)

      await expect(handler(fakeEvent)).rejects.toThrow('Missing request body')
    })

    it('throws 400 when stripe-signature header is missing', async () => {
      mockGetHeader.mockReturnValueOnce(undefined)

      await expect(handler(fakeEvent)).rejects.toThrow('Missing stripe-signature header')
    })

    it('throws 400 when signature verification fails', async () => {
      mockConstructEvent.mockImplementationOnce(() => {
        throw new Error('Invalid signature')
      })

      await expect(handler(fakeEvent)).rejects.toThrow('Webhook signature verification failed: Invalid signature')
    })
  })

  describe('checkout.session.completed', () => {
    it('activates lifetime purchase', async () => {
      mockConstructEvent.mockReturnValueOnce({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { appwriteUserId: 'user-1', checkoutMode: 'payment' },
            customer: 'cus_123',
            mode: 'payment'
          }
        }
      })

      const result = await handler(fakeEvent)

      expect(result).toEqual({ received: true })
      expect(mockUpdateDocument).toHaveBeenCalledWith(
        'vault-db',
        'user-profiles',
        'user-1',
        expect.objectContaining({
          subscriptionStatus: 'active',
          stripeCustomerId: 'cus_123',
          planType: 'lifetime'
        })
      )
    })

    it('activates subscription', async () => {
      mockConstructEvent.mockReturnValueOnce({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { appwriteUserId: 'user-2' },
            customer: 'cus_456',
            subscription: 'sub_789',
            mode: 'subscription'
          }
        }
      })

      const result = await handler(fakeEvent)

      expect(result).toEqual({ received: true })
      expect(mockUpdateDocument).toHaveBeenCalledWith(
        'vault-db',
        'user-profiles',
        'user-2',
        expect.objectContaining({
          subscriptionStatus: 'active',
          stripeSubscriptionId: 'sub_789',
          stripeCustomerId: 'cus_456'
        })
      )
    })

    it('skips when metadata has no appwriteUserId', async () => {
      mockConstructEvent.mockReturnValueOnce({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {},
            customer: 'cus_999',
            mode: 'subscription'
          }
        }
      })

      const result = await handler(fakeEvent)

      expect(result).toEqual({ received: true })
      expect(mockUpdateDocument).not.toHaveBeenCalled()
    })

    it('skips subscription mode when no subscriptionId', async () => {
      mockConstructEvent.mockReturnValueOnce({
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { appwriteUserId: 'user-3' },
            customer: 'cus_111',
            subscription: null,
            mode: 'subscription'
          }
        }
      })

      const result = await handler(fakeEvent)

      expect(result).toEqual({ received: true })
      expect(mockUpdateDocument).not.toHaveBeenCalled()
    })
  })

  describe('customer.subscription.updated', () => {
    it('updates subscription status', async () => {
      mockConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.updated',
        data: {
          object: {
            customer: 'cus_123',
            status: 'past_due'
          }
        }
      })
      mockListDocuments.mockResolvedValueOnce({
        documents: [{ $id: 'user-1' }]
      })

      const result = await handler(fakeEvent)

      expect(result).toEqual({ received: true })
      expect(mockUpdateDocument).toHaveBeenCalledWith(
        'vault-db',
        'user-profiles',
        'user-1',
        { subscriptionStatus: 'past_due' }
      )
    })

    it('skips when customer cannot be resolved', async () => {
      mockConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.updated',
        data: {
          object: {
            customer: 'cus_unknown',
            status: 'active'
          }
        }
      })
      mockListDocuments.mockResolvedValueOnce({
        documents: []
      })

      const result = await handler(fakeEvent)

      expect(result).toEqual({ received: true })
      expect(mockUpdateDocument).not.toHaveBeenCalled()
    })
  })

  describe('customer.subscription.deleted', () => {
    it('resets subscription fields to free', async () => {
      mockConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.deleted',
        data: {
          object: {
            customer: 'cus_123'
          }
        }
      })
      mockListDocuments.mockResolvedValueOnce({
        documents: [{ $id: 'user-1' }]
      })

      const result = await handler(fakeEvent)

      expect(result).toEqual({ received: true })
      expect(mockUpdateDocument).toHaveBeenCalledWith(
        'vault-db',
        'user-profiles',
        'user-1',
        {
          subscriptionStatus: 'free',
          stripeSubscriptionId: null,
          subscribedAt: null,
          planType: null
        }
      )
    })

    it('skips when customer cannot be resolved', async () => {
      mockConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.deleted',
        data: {
          object: {
            customer: 'cus_gone'
          }
        }
      })
      mockListDocuments.mockResolvedValueOnce({
        documents: []
      })

      const result = await handler(fakeEvent)

      expect(result).toEqual({ received: true })
      expect(mockUpdateDocument).not.toHaveBeenCalled()
    })
  })

  describe('unhandled events', () => {
    it('returns received: true for unknown event types', async () => {
      mockConstructEvent.mockReturnValueOnce({
        type: 'invoice.payment_succeeded',
        data: { object: {} }
      })

      const result = await handler(fakeEvent)

      expect(result).toEqual({ received: true })
      expect(mockUpdateDocument).not.toHaveBeenCalled()
    })
  })
})
