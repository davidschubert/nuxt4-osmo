# Phase 9: Stripe & Premium

Stripe-Integration fuer Subscription-basiertes Freemium-Modell. Stripe Webhooks sind die Source of Truth fuer den Subscription-Status.

## Voraussetzungen

- [ ] `stripe` Paket installieren (`pnpm add stripe`)
- [ ] `node-appwrite` Paket installieren (`pnpm add node-appwrite`)
- [ ] `.env` Variablen konfigurieren:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NUXT_PUBLIC_STRIPE_PRICE_ID`
  - `APPWRITE_API_KEY` (fuer Server-Side node-appwrite)

## Server-Side

- [ ] `server/utils/stripe.ts` – Stripe Client Singleton (via `useRuntimeConfig()`)
- [ ] `server/utils/appwrite.ts` – node-appwrite Admin Client Singleton (via `useRuntimeConfig()`)
- [ ] `server/api/stripe/checkout.post.ts` – Checkout Session erstellen
  - Erwartet: `userId`, `email`, `successUrl`, `cancelUrl`
  - Erstellt Stripe Customer falls noetig
  - Gibt `sessionUrl` zurueck
- [ ] `server/api/stripe/webhook.post.ts` – Webhook Handler
  - Signatur-Verifizierung mit `STRIPE_WEBHOOK_SECRET`
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Aktualisiert `UserProfile.subscriptionStatus` in Appwrite via node-appwrite
- [ ] `server/api/stripe/portal.post.ts` – Customer Portal Session erstellen

## Client-Side

- [ ] `composables/useSubscription.ts` – Subscription Composable
  - `subscriptionStatus` (aus UserProfile lesen)
  - `startCheckout()` – ruft `/api/stripe/checkout` auf, redirected zu Stripe
  - `openPortal()` – ruft `/api/stripe/portal` auf, redirected zum Portal
  - `hasAccess` computed (free resources immer, premium nur bei `active`)
- [ ] Pricing Page (`pages/pricing.vue`) an Stripe anbinden
  - CTA Button ruft `startCheckout()` auf
  - Zeigt aktuellen Plan fuer eingeloggte User

## Premium Gating

- [ ] Premium Gating auf Resource Detail aktivieren
  - Blur-Overlay + Upgrade-CTA fuer gesperrte Resources
  - `isFree || subscriptionStatus === 'active'` Logik
- [ ] Appwrite Document-Level Permissions fuer Premium-Code
  - Sicherstellen dass Premium-Code nie an unautorisierte Clients gesendet wird

## Post-Checkout

- [ ] Success Page (`pages/checkout/success.vue`) – Bestaetigung nach erfolgreichem Checkout
- [ ] Cancel Page (`pages/checkout/cancel.vue`) – Abbruch-Seite mit Retry-Option
