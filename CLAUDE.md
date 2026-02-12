# CLAUDE.md - The Vault

## Project Overview

SaaS resource library platform ("The Vault") inspired by OSMO Supply. Users browse a categorized vault of code snippets, UI components, animations, and design assets. Features live previews, copy-to-clipboard code, sidebar category navigation with resource counts, search, and a freemium subscription model.

Dark-first UI with card-based grid layout.

## UI Reference (OSMO Supply)

Reference screenshots from the original OSMO Supply app are stored in `docs/reference-screenshots/`. These serve as the visual target for all UI implementation. Always consult these when building UI components.

### Screenshot Index

| # | File | Screen | Key UI Elements |
|---|------|--------|-----------------|
| 01 | `01-vault-main-menu-open.png` | Vault main, sidebar open | Logo + green star top-left. Sidebar: "The Vault" expandable section with categories (name + count badge). Below: Icons, Learn, Easings ("Soon" badge). Content: greeting "Hello David", "Welcome to the Vault" hero text, search input "Search 152 resources", handwritten "Type and find!" annotation. 5-column card grid with thumbnails + "New" badges. User name + 3-dot menu bottom-left. Search (Cmd+K) + bookmark icon top-right. |
| 02 | `02-vault-main-menu-closed.png` | Vault main, sidebar collapsed | Sidebar shows only narrow icon strip (no text labels). Same content but wider. Green star visible, category icons only. |
| 03 | `03-vault-main-user-menu-open.png` | User menu popup | Bottom-left popup: "Lifetime Member" badge, "Dark mode" toggle (active), "Join Community (Discord)", "License + Invoices (Stripe)", "Settings". Triggered by 3-dot menu on user name. |
| 04 | `04-vault-main-light-mode-switch.png` | Light mode | Full app in light theme. Sidebar has light background. User menu open with "Light mode" toggle active (purple icon). Cards have lighter thumbnails. |
| 05 | `05-account-profile.png.png` | Account modal: Profile | Modal dialog over vault background. Left: vertical tabs (Profile, Account, Plan, Billing). Right: avatar photo + "Remove profile photo", NAME + "Change name", EMAIL + "Change email", PASSWORD + "Change password". |
| 06 | `06-account-account.png` | Account modal: Account | Address section: "BILLING ADDRESS" (street, city, country) + "Change address". Organization section: ORGANIZATION name, TAX ID, INVOICE NOTES + "Change organization". |
| 07 | `07-account-plan.png` | Account modal: Plan | "Lifetime Member", "Billed once", 599.00 EUR, "Change plan" link, "Edit options" link. Minimal layout. |
| 08 | `08-account-billing.png` | Account modal: Billing | Payment info: card icon + "Mastercard Ending in 7307 Expires 5/2026" + Update/Remove. Discount: "Add a discount code". Invoices: table (Date, Status, Amount) + download icon. "Edit recipients" button. |
| 09 | `09-vault-search-active.png` | Search overlay | Search field focused center-screen: "Search for pages or resources", filter icon + "Enter". Background dimmed (overlay). Sidebar visible but grayed out. |
| 10 | `10-vault-category-buttons.png` | Category view: Buttons | Breadcrumb "The Vault > Buttons". Title "Buttons" with superscript count "15". Grid shows category-specific resources. Each card has colored background matching the button type. Sidebar highlights "Buttons" as active category. |
| 11 | `11-resource-detail-top.png` | Resource detail: top | Breadcrumb "The Vault > Buttons > Elastic Pulse Button (Bouncy)". Title. Top-right: "Live preview" button (red indicator), Figma icon, bookmark, 3-dot menu. Large preview area (light pink bg, orange buttons). Right sidebar: "Resource details" (Last updated, Category, Need help?: Join Slack), Tags (Button, Bounce, Hover, Animation, Elastic, Blob, Pulse), "Original source" link, Author with avatar. Below preview: "Documentation" with tabs "Webflow" / "Code". Setup: External Scripts section. |
| 12 | `12-resource-code-html-css.png` | Resource detail: HTML+CSS | "Step 1: Add HTML" with code block (syntax highlighting, Copy button top-right). "Step 2: Add CSS" with CSS code block. Dark theme code blocks with colored syntax. Right sidebar identical to 11. |
| 13 | `13-resource-code-js.png` | Resource detail: JavaScript | "Step 3: Add Javascript" with full JS code block. Below: "Implementation" docs with sections: Container, Target, Stretch. Inline code blocks in descriptions. |
| 14 | `14-resource-implementation.png` | Resource detail: bottom | JS init code block, Implementation docs (Container, Target, Stretch, Lock sections), "Related resources" grid with 2 cards. |

### Critical UI Patterns (from screenshots)

**Account = Modal Dialog, NOT a separate page**
- Opens as overlay on top of vault
- Vertical tab navigation: Profile, Account, Plan, Billing
- Use `UModal` + `UTabs` with vertical orientation
- Renders in light mode style (white background) even when app is in dark mode

**User Menu = Sidebar Popup**
- Triggered by 3-dot menu next to user name at bottom of sidebar
- Shows: subscription status badge, dark mode toggle, community links, settings
- Use `UDropdownMenu` or `UPopover` anchored to sidebar footer

**Sidebar = Collapsible**
- Open state: icon + label + count badge for each category
- Collapsed state: only icons, no text
- `UDashboardSidebar` with `collapsible` + `resizable` props

**Search = Full-Screen Overlay**
- Centered search input with dimmed background
- Placeholder: "Search for pages or resources"
- Filter icon + keyboard shortcut hint
- Use `UDashboardSearch` (Meta+K trigger)

**Resource Detail = 3-Column Layout**
- Left: sidebar (same as vault)
- Center: preview + documentation/code (scrollable)
- Right: resource metadata sidebar (fixed)
- Code presented as numbered steps: "Step 1: Add HTML", "Step 2: Add CSS", "Step 3: Add Javascript"
- Each code block has language label top-left + Copy button top-right

**Category Page = Breadcrumb + Count**
- Breadcrumb: "The Vault > {Category}"
- Title with superscript count badge
- Same grid layout as main vault but filtered

**Card Grid = 5 Columns**
- Responsive: 5 cols on desktop, fewer on smaller screens
- Each card: thumbnail (colored background), optional "New" badge, title below
- Thumbnail aspect ratio ~4:3

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Nuxt | 4.3.1 |
| UI Library | @nuxt/ui | 4.4.0 |
| CSS | Tailwind CSS | 4.1.18 |
| State | Pinia (@pinia/nuxt) | 0.11.3 |
| Backend | Appwrite (appwrite SDK) | 22.0.0 |
| Payments | Stripe | TBD |
| Content | @nuxt/content | 3.11.2 |
| Images | @nuxt/image | 2.0.0 |
| Scripts | @nuxt/scripts | 0.13.2 |
| Icons | Lucide + Simple Icons (Iconify) | - |
| TypeScript | typescript | 5.9.3 |
| Package Manager | pnpm | 10.29.2 |

## Development Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm lint         # ESLint check
pnpm typecheck    # TypeScript type check
```

## Project Structure

```
app/
├── app.vue                     # Root: UApp wrapper with NuxtLayout
├── app.config.ts               # Nuxt UI theme (primary=green, neutral=slate)
├── assets/css/main.css         # Tailwind + Nuxt UI imports, custom green palette
├── components/
│   ├── App/                    # App-level (AppLogo, AppSearch, AppUserMenu)
│   ├── Vault/                  # Vault feature (VaultCard, VaultGrid, VaultSidebar)
│   ├── Resource/               # Resource detail (ResourcePreview, ResourceCode, ResourceMeta)
│   └── Auth/                   # Auth forms (AuthLogin, AuthRegister)
├── composables/
│   ├── useAuth.ts              # Auth state and methods wrapping Appwrite account
│   ├── useResources.ts         # Resource CRUD and queries
│   ├── useCategories.ts        # Category data and counts
│   ├── useSearch.ts            # Search state and filtering
│   └── useSubscription.ts      # Stripe subscription state
├── layouts/
│   ├── default.vue             # Public pages (landing, auth)
│   └── vault.vue               # Dashboard layout with sidebar
├── middleware/
│   ├── auth.ts                 # Redirect unauthenticated users
│   └── guest.ts                # Redirect authenticated users away from auth pages
├── pages/
│   ├── index.vue               # Landing page (public)
│   ├── login.vue               # Login page
│   ├── register.vue            # Register page
│   ├── vault/
│   │   ├── index.vue           # Main vault grid (all resources)
│   │   └── [slug].vue          # Resource detail page
│   ├── pricing.vue             # Pricing/subscription page
│   └── account.vue             # User account/profile (NOTE: OSMO uses a modal, consider UModal)
├── stores/
│   ├── auth.ts                 # Pinia auth store (exports useAuthStore)
│   └── vault.ts                # Pinia vault/resource store (exports useVaultStore)
├── types/
│   └── index.ts                # Shared TypeScript interfaces
└── utils/
    └── constants.ts            # App constants (DB IDs, bucket IDs, categories)
server/
├── api/
│   ├── stripe/
│   │   ├── checkout.post.ts    # Create Stripe checkout session
│   │   └── webhook.post.ts     # Handle Stripe webhooks
│   └── resources/              # Server-side resource endpoints if needed
```

## Coding Standards

### TypeScript
- Strict mode. Always type props, emits, composable returns.
- Use `interface` for object shapes, `type` for unions/intersections.
- No `any`. Use `unknown` when type is truly unknown.

### Vue / Nuxt
- `<script setup lang="ts">` for all components. No Options API.
- Use Nuxt auto-imports: do NOT manually import `ref`, `computed`, `useRoute`, `useFetch`, `navigateTo`, composables, or components.
- Use `definePageMeta` for layout and middleware assignment.
- Use `useSeoMeta` for page-level SEO.
- Props: `defineProps<{}>()` generic syntax.
- Emits: `defineEmits<{}>()` generic syntax.

### ESLint (enforced)
- No trailing commas (`commaDangle: 'never'`).
- 1TBS brace style (`braceStyle: '1tbs'`).
- 2-space indentation, single quotes.
- Run `pnpm lint` before committing.

### Naming
- Components: PascalCase, feature-prefixed (`VaultCard.vue`, `ResourcePreview.vue`).
- Composables: camelCase with `use` prefix (`useAuth.ts`).
- Stores (Pinia): camelCase file, `useXxxStore` export.
- Pages: kebab-case. Dynamic params: `[param].vue`.
- Types/interfaces: PascalCase (`Resource`, `Category`, `UserProfile`).

### File Organization
- Group components by feature domain, not by type.
- One concern per composable.
- Constants (Appwrite IDs) in `utils/constants.ts`.

## Design System

### Theme
Defined in `app/app.config.ts`: primary = green, neutral = slate.
Custom green palette (green-50 through green-950) in `app/assets/css/main.css` via `@theme static`.
Font: Public Sans.

### Dark Mode (Default)
- App defaults to dark mode. Toggle with `useColorMode()`.
- Use Nuxt UI semantic color classes: `text-primary`, `bg-primary`, `text-muted`, `border-default`.
- Never hardcode hex colors in templates. Always use theme tokens.
- Subtle backgrounds: `bg-default` (surface), `bg-muted` (elevated).
- Borders: `border-default` (standard), `border-muted` (subtle).

### Icons
- Lucide: `i-lucide-{name}` (e.g., `i-lucide-search`, `i-lucide-copy`).
- Simple Icons (brands): `i-simple-icons-{name}` (e.g., `i-simple-icons-github`).
- Use Iconify string format in component props.

### Component Patterns

**Vault Layout** (`layouts/vault.vue`):
Uses `UDashboardGroup` > `UDashboardSidebar` (collapsible, resizable) + `UDashboardPanel` with `UDashboardNavbar`.

**Sidebar Navigation**:
`UNavigationMenu` with `orientation="vertical"`. Items: `{ label, icon, badge, to }[]` where badge shows resource count.

**Resource Cards**:
`UCard` with thumbnail image, `UBadge` for "New", title and category.

**Resource Detail Tabs**:
`UTabs` with `items: [{ label: 'HTML', slot: 'html' }, ...]` and named slot content for each code block.

**Search**:
`UDashboardSearch` triggered by `Meta+K` via `defineShortcuts`. Groups resources by title/description/tags.

**Auth Forms**:
`UAuthForm` inside `UPageCard` with schema validation, fields, and OAuth providers.

**Toasts**:
`useToast().add({ title, description })` for feedback (copy confirmation, errors, etc.).

## Appwrite Integration

Uses the official `appwrite` Web SDK (npm: `appwrite`) directly, **not** the unofficial `nuxt-appwrite` module. A custom composable `app/composables/useAppwrite.ts` initializes the SDK as singletons.

### Configuration

In `nuxt.config.ts` via `runtimeConfig.public`:
```ts
runtimeConfig: {
  public: {
    appwriteEndpoint: 'https://cloud.appwrite.io/v1',
    appwriteProject: ''
  }
}
```

`.env`:
```
NUXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NUXT_PUBLIC_APPWRITE_PROJECT=<project-id>
```

### useAppwrite() API

```ts
const { client, account, databases, storage, Query, ID, Permission, Role, OAuthProvider } = useAppwrite()
```

The composable is auto-imported by Nuxt. It returns singleton instances of `Client`, `Account`, `Databases`, `Storage` plus re-exports of `Query`, `ID`, `Permission`, `Role`, `OAuthProvider`.

**IMPORTANT**: The property is `databases` (plural), matching the official Appwrite SDK. All methods use **object syntax** (named parameters).

### Auth Pattern

```ts
// Login
await account.createEmailPasswordSession({ email, password })
const user = await account.get()

// Register
await account.create({ userId: ID.unique(), email, password, name })

// Logout
await account.deleteSession({ sessionId: 'current' })

// OAuth
account.createOAuth2Session({
  provider: OAuthProvider.Github,
  success: `${window.location.origin}/vault`,
  failure: `${window.location.origin}/login`
})

// Check session
try { user.value = await account.get() } catch { user.value = null }
```

### Database Queries

```ts
// List with filters
const result = await databases.listDocuments({
  databaseId: DB_ID,
  collectionId: COLLECTION_ID,
  queries: [
    Query.equal('category', 'buttons'),
    Query.orderDesc('$createdAt'),
    Query.limit(25)
  ]
})

// Get single document
const doc = await databases.getDocument({
  databaseId: DB_ID,
  collectionId: COLLECTION_ID,
  documentId: slug
})

// Create document
await databases.createDocument({
  databaseId: DB_ID,
  collectionId: COLLECTION_ID,
  documentId: ID.unique(),
  data: { ... },
  permissions: [Permission.read(Role.any())]
})
```

### Storage (Thumbnails)

```ts
const previewUrl = storage.getFilePreview({
  bucketId: BUCKET_ID,
  fileId: fileId,
  width: 400,
  height: 300
})
```

### Server-Side Note

The `appwrite` Web SDK is client-only. For server API routes (Stripe webhooks, admin operations), use the `node-appwrite` SDK with an API key via `useRuntimeConfig()`.

## Data Model

### Constants (`utils/constants.ts`)

```ts
export const APPWRITE = {
  DATABASE_ID: '<vault-db-id>',
  COLLECTIONS: {
    RESOURCES: '<resources-collection-id>',
    CATEGORIES: '<categories-collection-id>',
    USER_PROFILES: '<profiles-collection-id>'
  },
  BUCKETS: {
    THUMBNAILS: '<thumbnails-bucket-id>',
    ASSETS: '<assets-bucket-id>'
  }
} as const
```

### Interfaces (`types/index.ts`)

```ts
interface Resource {
  $id: string
  $createdAt: string
  $updatedAt: string
  title: string
  slug: string
  description: string
  category: string           // Category document ID
  tags: string[]
  thumbnailFileId: string    // Storage file ID
  isFree: boolean            // true = free tier, false = premium
  isNew: boolean             // "New" badge
  htmlCode: string
  cssCode: string
  jsCode: string
  previewUrl?: string
  sortOrder: number
}

interface Category {
  $id: string
  name: string               // "Buttons"
  slug: string               // "buttons"
  icon: string               // "i-lucide-mouse-pointer-click"
  sortOrder: number
}

interface UserProfile {
  $id: string
  userId: string
  displayName: string
  subscriptionStatus: 'free' | 'active' | 'canceled' | 'past_due'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscribedAt?: string
}
```

## Key Feature Patterns

### Vault Browsing (`pages/vault/index.vue`)
- Sidebar: `UNavigationMenu` with categories + badge counts.
- Grid: Responsive CSS grid of `VaultCard` components.
- Filter by category via URL query params: `/vault?category=buttons`.
- Pagination with `UPagination` or infinite scroll.

### Resource Detail (`pages/vault/[slug].vue`)
- Live preview area (iframe or rendered HTML).
- `UTabs` for code sections (HTML / CSS / JS).
- Copy button per tab: `navigator.clipboard.writeText()` + `useToast()`.
- Sidebar metadata: last updated, category, tags (`UBadge`).
- Related resources at bottom.
- Premium gating: lock overlay for non-subscribers on premium resources.

### Search
- `UDashboardSearch` in sidebar, `Meta+K` shortcut.
- Groups: resources (by title/description/tags), categories.
- On select: `navigateTo('/vault/' + resource.slug)`.

### Premium Gating
- `isFree: boolean` on each resource.
- Free: visible + accessible to all.
- Premium: thumbnail visible, code/preview gated.
- Check: `computed(() => resource.isFree || userProfile.subscriptionStatus === 'active')`.
- Non-subscribers see blurred preview + upgrade CTA.
- **Security**: Appwrite document-level permissions ensure premium code is never sent to unauthorized clients.

### Stripe Integration (Server-Side)
- `server/api/stripe/checkout.post.ts`: Creates Stripe Checkout Session.
- `server/api/stripe/webhook.post.ts`: Handles `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
- Webhook updates `UserProfile.subscriptionStatus` in Appwrite via `node-appwrite` server SDK.
- Client reads subscription status from Appwrite user profile document.
- **Stripe webhooks are the source of truth** for subscription state.

## Architectural Decisions

1. **Dark-first**: `useColorMode` defaults to dark. All UI built dark-first.
2. **Client-side Appwrite**: Uses the official `appwrite` Web SDK (client-only). Server routes use `node-appwrite` with API key.
3. **Dashboard layout for vault**: `UDashboardGroup` + `UDashboardSidebar` + `UDashboardPanel` for the authenticated vault experience. Public pages use a simpler `default` layout.
4. **Pinia for global state**: Auth and vault filter state in Pinia stores. Composables wrap Appwrite calls and update stores.
5. **Slug-based routing**: Resources accessed by slug, not Appwrite document ID. Slug must be unique and indexed.
6. **Route rules**: Landing page prerendered. Vault pages are SSR/SPA.
7. **Freemium gating**: Display gating is client-side. Data security via Appwrite document-level permissions so premium content is never sent to unauthorized clients.
8. **Category counts**: Computed client-side from resources list or cached via Appwrite function. Not a static stored field.
9. **No SSR auth**: Auth is client-side only via the `appwrite` Web SDK. Middleware auth checks run client-side.
10. **Stripe webhooks = source of truth**: Client never directly modifies subscription state.
