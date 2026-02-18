# Test Coverage Analysis

> Generated: 2026-02-18

## Current State

**7 test files | ~55 test cases | ~12% of source files covered**

Framework: Vitest 4.0.18 with dual-project config (`unit` + `nuxt` via `@nuxt/test-utils`).

### What's Tested

| Area | Files | Cases | Notes |
|------|-------|-------|-------|
| Pinia Stores | `auth.spec.ts`, `vault.spec.ts` | ~32 | State mutations, computed properties, filtering |
| Components | `VaultCard`, `VaultGrid`, `ResourceCode` | ~18 | Rendering, props, ARIA |
| Composables | `useSearch` | ~9 | Query binding, groups, navigation |
| Utilities | `constants` | ~5 | Structure validation |

### What's Not Tested

| Area | Files | Lines | Risk |
|------|-------|-------|------|
| Server API routes | 7 | ~391 | **Critical** — Stripe webhooks are source of truth for subscriptions |
| Auth composable | 1 | 481 | **Critical** — all auth flows, session management, profile creation |
| Middleware | 3 | ~50 | **High** — route protection for vault and admin |
| Subscription composable | 1 | 185 | **High** — checkout and portal flows |
| Components | 11 | ~1,200 | Medium — admin form, sidebar, user menu, premium lock |
| Other composables | 9 | ~1,500 | Medium — resources, categories, admin, team, notifications |
| Pages | 19 | ~3,740 | Low (covered by E2E if added) |

## Priority Recommendations

### P0: Stripe Webhook Handler

**File:** `server/api/stripe/webhook.post.ts` (184 lines)

Revenue-critical. Silent failures mean users pay but don't get access.

**Test targets:**
- `mapStripeStatus()` — pure function mapping 8 Stripe statuses to 4 internal ones
- `resolveUserIdFromCustomer()` — Appwrite query with null handling
- `checkout.session.completed` — two branches: payment (lifetime) vs subscription
- `customer.subscription.updated` — status mapping and profile update
- `customer.subscription.deleted` — nulls out subscription fields
- Error paths: missing signature, invalid signature, missing body, missing metadata

### P1: Auth Composable

**File:** `app/composables/useAuth.ts` (481 lines)

**Test targets:**
- `mapAppwriteUser()` (line 42) — pure function, fallback logic for missing fields
- `isAppwriteError()` (line 35) — type guard
- `ensureProfile()` (line 66) — profile exists, profile creation, 409 race condition retry
- `login()` / `register()` / `logout()` — with mocked Appwrite SDK
- `updatePassword()` — input validation (min 8 chars)
- Error handling in each method

### P1: Middleware

**Files:** `app/middleware/auth.ts`, `admin.ts`, `guest.ts`

**Test targets:**
- Redirect behavior for unauthenticated users
- Server-side skip (`import.meta.server`)
- Auth initialization when `initialized` is false
- Admin role check in `admin.ts`
- Guest middleware redirects authenticated users

### P2: Subscription Composable

**File:** `app/composables/useSubscription.ts` (185 lines)

**Test targets:**
- `startCheckout()` with no user → redirect to `/login`
- Mock mode checkout → store updates correctly
- `refreshStatus()` → maps Appwrite profile fields
- `openPortal()` with no user → early return

### P2: Coverage Reporting

No coverage config exists. Add to `vitest.config.ts`:

```ts
coverage: {
  provider: 'v8',
  include: ['app/**/*.{ts,vue}', 'server/**/*.ts'],
  exclude: ['app/utils/mock-data.ts'],
  thresholds: { lines: 50 }
}
```

### P3: Key Components

- `AdminResourceForm.vue` (335 lines) — form validation, file uploads
- `ResourceLock.vue` (54 lines) — premium gating correctness
- `VaultSidebar.vue` (100 lines) — navigation, collapse state
- `AppUserMenu.vue` (110 lines) — subscription display, dark mode toggle

### P3: Remaining Composables

- `useResources.ts` (140 lines) — core CRUD
- `useCategories.ts` (61 lines) — sidebar data
- `useAdmin.ts` (307 lines) — admin CRUD
- `useAdminUsers.ts` (217 lines) — user management
- `useTeam.ts` (237 lines) — team features

### P4: E2E Tests

No Playwright or Cypress setup. Add E2E for:
- Register → Verify Email → Login → Browse → Checkout → Premium Access
- Admin: Add Resource → Publish → Search → Display

## Quick Wins (Pure Functions, Zero Mocking)

These can be extracted and tested immediately:

1. `mapStripeStatus()` — `server/api/stripe/webhook.post.ts:7-23`
2. `mapAppwriteUser()` — `app/composables/useAuth.ts:42-59`
3. `isAppwriteError()` — `app/composables/useAuth.ts:35-37`
