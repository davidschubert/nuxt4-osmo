# OSMO — The Vault

[![Nuxt](https://img.shields.io/badge/Nuxt-4.3.1-00DC82?logo=nuxt&labelColor=020420)](https://nuxt.com)
[![Nuxt UI](https://img.shields.io/badge/Nuxt%20UI-4.4.0-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1-38BDF8?logo=tailwindcss&labelColor=020420)](https://tailwindcss.com)
[![Appwrite](https://img.shields.io/badge/Appwrite-22.0-FD366E?logo=appwrite&labelColor=020420)](https://appwrite.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&labelColor=020420)](https://typescriptlang.org)

SaaS resource library platform inspired by [OSMO Supply](https://osmosupply.com). Browse a categorized vault of code snippets, UI components, animations and design assets with live previews, copy-to-clipboard code, sidebar category navigation and a freemium subscription model.

Dark-first UI with card-based grid layout.

## Features

- Categorized resource vault with live previews and code snippets (HTML / CSS / JS)
- Copy-to-clipboard code blocks with syntax highlighting
- Collapsible sidebar navigation with category counts
- Command palette search (Meta+K)
- Dark/light mode with toggle
- Freemium model with premium resource gating
- Admin panel for resource and user management
- Team management with invite system
- Notification center (slide-over panel)
- OAuth login (GitHub, Google)
- Responsive 2 → 5 column card grid

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Nuxt | 4.3.1 |
| UI Library | @nuxt/ui | 4.4.0 |
| CSS | Tailwind CSS | 4.1.18 |
| State | Pinia (@pinia/nuxt) | 0.11.3 |
| Backend | Appwrite | 22.0.0 |
| Payments | Stripe | TBD |
| Images | @nuxt/image | 2.0.0 |
| Scripts | @nuxt/scripts | 0.13.2 |
| Icons | Lucide + Simple Icons (Iconify) | — |
| TypeScript | typescript | 5.9.3 |
| Package Manager | pnpm | 10.29.2 |

## Nuxt UI Components in Use

Complete inventory of all `@nuxt/ui` components and composables used in this project — **31 components** and **6 composables** across **36 Vue files**.

### Layout & Dashboard (8)

| Component | Description | Used In |
|---|---|---|
| `UApp` | Root application wrapper | `app.vue` |
| `UDashboardGroup` | Dashboard layout container | `layouts/vault.vue`, `layouts/admin.vue` |
| `UDashboardSidebar` | Collapsible sidebar (resizable, cookie-persisted) | `VaultSidebar`, `AdminSidebar` |
| `UDashboardPanel` | Main content panel | `layouts/vault.vue`, `layouts/admin.vue` |
| `UDashboardNavbar` | Top navbar in dashboard layouts | `layouts/vault.vue`, `layouts/admin.vue` |
| `UDashboardSidebarCollapse` | Sidebar toggle button | `layouts/vault.vue`, `layouts/admin.vue` |
| `UDashboardSearch` | Command palette (Meta+K) | `AppSearch` |
| `UDashboardSearchButton` | Search trigger button in navbar | `layouts/vault.vue` |

### Public Layout (3)

| Component | Description | Used In |
|---|---|---|
| `UHeader` | Page header with navigation | `layouts/default.vue` |
| `UMain` | Main content wrapper | `layouts/default.vue` |
| `UFooter` | Page footer with links | `layouts/default.vue` |

### Data Display (6)

| Component | Description | Used In |
|---|---|---|
| `UIcon` | Iconify icons (Lucide, Simple Icons) | 25+ files |
| `UBadge` | Status and count badges | `VaultCard`, vault pages, admin |
| `UAvatar` | User avatars | `AppUserMenu`, `AppNotifications`, admin |
| `UTable` | Data tables with sorting/selection | Admin users, admin resources |
| `UCard` | Card containers | Admin dashboard stats |
| `USkeleton` | Loading placeholders | `VaultGrid`, resource detail, team |

### Navigation (3)

| Component | Description | Used In |
|---|---|---|
| `UNavigationMenu` | Vertical/horizontal navigation | `VaultSidebar`, `AdminSidebar`, header |
| `UBreadcrumb` | Breadcrumb navigation | Vault category, resource detail |
| `UTabs` | Tab navigation | Account page, plans page |

### Forms & Inputs (4)

| Component | Description | Used In |
|---|---|---|
| `UButton` | Buttons and link-buttons | 22+ files |
| `UInput` | Text input fields | Vault search, account, team |
| `UCheckbox` | Checkboxes | Admin user table (row selection) |
| `USwitch` | Toggle switch | Dark mode toggle in user menu |

### Overlays & Popups (3)

| Component | Description | Used In |
|---|---|---|
| `UModal` | Modal dialogs | Keyboard shortcuts help |
| `USlideover` | Slide-over panel | `AppNotifications` |
| `UDropdownMenu` | Dropdown menu | `AppUserMenu` |

### Other (4)

| Component | Description | Used In |
|---|---|---|
| `USeparator` | Horizontal dividers | Sidebar, layouts, account |
| `UColorModeButton` | Built-in dark/light toggle button | `layouts/default.vue` |
| `UPageCard` | Centered form card | Login, register, verify-email, invite |
| `UAuthForm` | Login/register form with OAuth | `pages/login.vue`, `pages/register.vue` |

### Composables (6)

| Composable | Description | Used In |
|---|---|---|
| `useColorMode()` | Dark/light mode state | `AppUserMenu`, `app.vue` |
| `useToast()` | Toast notifications | `ResourceCode`, `invite` |
| `useRoute()` | Current route and query params | Vault pages, account, sidebar |
| `useRouter()` | Programmatic navigation | Account tabs, search |
| `useHead()` | HTML head metadata | `app.vue` |
| `useSeoMeta()` | SEO meta tags | All pages |

## Project Structure

```
app/
├── app.vue                     # Root: UApp wrapper
├── app.config.ts               # Nuxt UI theme (primary=green, neutral=slate)
├── assets/css/main.css         # Tailwind + custom green palette
├── components/
│   ├── App/                    # App-level (AppLogo, AppSearch, AppUserMenu, AppNotifications)
│   ├── Vault/                  # Vault feature (VaultCard, VaultGrid, VaultSidebar)
│   ├── Resource/               # Resource detail (ResourcePreview, ResourceCode, ResourceMeta)
│   ├── Account/                # Account sections (AccountTeam)
│   ├── Admin/                  # Admin panel (AdminSidebar)
│   └── Auth/                   # Auth forms
├── composables/                # useAuth, useResources, useCategories, useSearch, ...
├── layouts/
│   ├── default.vue             # Public pages (landing, auth)
│   ├── vault.vue               # Dashboard layout with sidebar
│   └── admin.vue               # Admin layout with sidebar
├── pages/
│   ├── index.vue               # Landing page
│   ├── login.vue / register.vue
│   ├── vault/
│   │   ├── index.vue           # Main vault grid
│   │   └── [slug].vue          # Resource detail
│   ├── account.vue             # User account settings
│   ├── plans.vue               # Pricing page
│   └── admin/                  # Admin panel pages
├── stores/                     # Pinia stores (auth, vault)
├── types/                      # TypeScript interfaces
└── utils/                      # Constants, helpers
server/
├── api/stripe/                 # Stripe checkout + webhooks
```

## Setup

```bash
# Install dependencies
pnpm install

# Start dev server (http://localhost:3000)
pnpm dev

# Production build
pnpm build

# Preview production build
pnpm preview

# Lint
pnpm lint

# Type check
pnpm typecheck
```

## Environment Variables

```env
NUXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NUXT_PUBLIC_APPWRITE_PROJECT=<project-id>
```

## License

Private project. All rights reserved.
