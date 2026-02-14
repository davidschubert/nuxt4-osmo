# E2E Testing Checklist

Manual end-to-end testing checklist for **The Vault**. Run through each section before a release.

---

## Prerequisites

- [ ] Dev server running (`pnpm dev`)
- [ ] Mock mode active (no `NUXT_PUBLIC_APPWRITE_PROJECT` set) **or** Appwrite backend accessible
- [ ] Modern browser (Chrome/Firefox/Safari latest)
- [ ] Desktop viewport (1440px+) for initial tests, then responsive checks

---

## 1. Public Pages

### Landing Page (`/`)

- [ ] Page loads without errors
- [ ] Hero section displays correctly (title, description, CTA buttons)
- [ ] Feature sections render with icons and descriptions
- [ ] "Get Started" / "Browse Vault" CTA navigates to `/vault` or `/register`
- [ ] Footer links work (if present)
- [ ] SEO meta tags present (`<title>`, `<meta name="description">`)

### Pricing Page (`/pricing`)

- [ ] Page loads and displays pricing tiers
- [ ] Free tier shows included features
- [ ] Premium tier shows price and features
- [ ] CTA buttons navigate correctly (to `/register` or checkout)
- [ ] Toggle between monthly/annual works (if implemented)

---

## 2. Authentication

### Registration (`/register`)

- [ ] Form renders with Name, Email, Password fields
- [ ] Validation: empty fields show error messages
- [ ] Validation: invalid email shows error
- [ ] Validation: password too short shows error
- [ ] Successful registration redirects to `/vault`
- [ ] Toast notification shows "Welcome!"
- [ ] User appears logged in after registration (sidebar shows name)

### Login (`/login`)

- [ ] Form renders with Email, Password fields
- [ ] Validation: empty fields show error messages
- [ ] Invalid credentials show error toast
- [ ] Successful login redirects to `/vault`
- [ ] Toast notification shows "Welcome back!"
- [ ] OAuth buttons render (GitHub, Google, Apple)
- [ ] OAuth flow initiates correctly (redirects to provider)

### Auth Middleware

- [ ] Unauthenticated user accessing `/vault` is redirected to `/login`
- [ ] Unauthenticated user accessing `/vault/[slug]` is redirected to `/login`
- [ ] Authenticated user accessing `/login` is redirected to `/vault`
- [ ] Authenticated user accessing `/register` is redirected to `/vault`

### Logout

- [ ] Logout via user menu works
- [ ] Redirects to `/` after logout
- [ ] Toast notification shows "Logged out"
- [ ] Cannot access `/vault` after logout (redirects to `/login`)

---

## 3. Vault Browsing

### Main Grid (`/vault`)

- [ ] Page loads and displays greeting ("Hello [Name]")
- [ ] Resource count shown in search placeholder ("Search X resources")
- [ ] Card grid renders with thumbnails and titles
- [ ] "New" badges display on marked resources
- [ ] Grid is 5 columns on desktop (1440px+)
- [ ] Grid reduces to 3 columns on tablet (~768px)
- [ ] Grid reduces to 1-2 columns on mobile (~375px)

### Sidebar Navigation

- [ ] Sidebar shows "The Vault" section with categories
- [ ] Each category shows icon, name, and resource count badge
- [ ] Clicking a category filters the grid
- [ ] URL updates with `?category=` query param
- [ ] Active category is highlighted in sidebar
- [ ] "All" / clicking "The Vault" removes filter
- [ ] Sidebar collapses to icon-only on toggle
- [ ] Collapsed sidebar shows only icons (no labels)
- [ ] Sidebar is resizable (drag handle)

### Search (Meta+K)

- [ ] `Cmd+K` / `Ctrl+K` opens search overlay
- [ ] Search input is auto-focused
- [ ] Typing filters resources by title, description, tags
- [ ] Results show resource name and category
- [ ] Clicking a result navigates to `/vault/[slug]`
- [ ] `Escape` closes the search overlay
- [ ] Background is dimmed when search is open

### Keyboard Shortcuts

- [ ] `g` then `h` navigates to `/vault`
- [ ] `g` then `p` navigates to `/pricing`
- [ ] `g` then `a` navigates to `/account`

---

## 4. Resource Detail (`/vault/[slug]`)

### Layout

- [ ] Breadcrumb shows "The Vault > [Category] > [Resource Title]"
- [ ] Resource title displays correctly
- [ ] Left sidebar matches vault sidebar
- [ ] Right metadata sidebar shows resource details

### Preview

- [ ] Live preview area renders (if preview available)
- [ ] "Live preview" button works
- [ ] External scripts badge shows linked scripts (e.g., GSAP)

### Code Steps

- [ ] Code sections render as numbered steps ("Step 1: Add HTML", etc.)
- [ ] Syntax highlighting works (Shiki with `vitesse-dark` theme)
- [ ] Code is readable with colored syntax
- [ ] Fallback to plain text if highlighting not loaded
- [ ] Copy button per code block works
- [ ] Toast notification confirms copy ("Copied to clipboard!")
- [ ] Copied text is plain code (not HTML with highlighting)

### Metadata Sidebar

- [ ] "Last updated" date shows correctly
- [ ] Category name and link work
- [ ] Tags render as badges
- [ ] "Original source" link works (if set)
- [ ] Author name displays (if set)

### Implementation Notes

- [ ] Markdown implementation docs render below code
- [ ] Section headers (Container, Target, etc.) display correctly
- [ ] Inline code blocks render properly

### Related Resources

- [ ] Related resources grid shows at page bottom
- [ ] Cards link to correct resource detail pages

### Premium Gating

- [ ] Free resources: code and preview fully accessible
- [ ] Premium resources (non-subscriber): code is blurred/locked
- [ ] Lock overlay shows upgrade CTA
- [ ] Upgrade CTA links to `/pricing`
- [ ] Premium resources (subscriber): code fully accessible

---

## 5. Premium & Subscription

### Mock Mode Checkout

- [ ] Clicking "Subscribe" on pricing page triggers mock checkout
- [ ] After mock checkout, user profile updates to `subscriptionStatus: 'active'`
- [ ] Previously locked resources become accessible
- [ ] Toast notification confirms subscription

### Stripe Checkout (Live Mode)

- [ ] Clicking "Subscribe" creates Stripe Checkout session
- [ ] Redirects to Stripe Checkout page
- [ ] Successful payment redirects back to app
- [ ] Webhook updates user subscription status
- [ ] Premium content unlocked after webhook processes

### Customer Portal

- [ ] "Manage Subscription" opens Stripe Customer Portal
- [ ] User can cancel/update subscription
- [ ] Cancellation updates status via webhook

---

## 6. Admin Panel (`/admin`)

### Access Control

- [ ] Non-admin users cannot access `/admin` (redirected)
- [ ] Admin users (with `admin` label) can access `/admin`
- [ ] Admin sidebar/navigation renders

### Resource Management

- [ ] Resource list displays all resources
- [ ] Can create a new resource (title, slug, category, code, etc.)
- [ ] Can edit an existing resource
- [ ] Can delete a resource
- [ ] Changes reflect in vault immediately (or after refresh)

### Category Management

- [ ] Category list displays all categories
- [ ] Can create a new category
- [ ] Can edit an existing category
- [ ] Can delete a category (check for resources in category first)

---

## 7. Responsiveness

| Breakpoint | Expected Layout |
|------------|----------------|
| Desktop (1440px+) | 5-column grid, sidebar open, metadata sidebar visible |
| Laptop (1024px) | 4-column grid, sidebar collapsible |
| Tablet (768px) | 3-column grid, sidebar collapsed by default |
| Mobile (375px) | 1-2 column grid, sidebar hidden (hamburger menu) |

- [ ] Test each breakpoint above
- [ ] Cards maintain aspect ratio at all sizes
- [ ] Text remains readable (no overflow/truncation issues)
- [ ] Navigation is accessible on all screen sizes
- [ ] Resource detail adjusts (metadata sidebar stacks below on mobile)

---

## 8. Error Handling

### 404 Page

- [ ] Navigating to non-existent route shows 404 page
- [ ] 404 page has navigation back to vault
- [ ] `/vault/non-existent-slug` shows appropriate error

### Network Errors

- [ ] App handles Appwrite connection failure gracefully
- [ ] Error toast shown for failed API calls
- [ ] No unhandled promise rejections in console

### Form Errors

- [ ] All forms show validation errors inline
- [ ] Server-side errors (duplicate email, etc.) show toast notifications
- [ ] Forms don't submit when validation fails

---

## 9. Dark Mode / Light Mode

- [ ] App defaults to dark mode
- [ ] Toggle switches to light mode
- [ ] All components render correctly in both modes
- [ ] No hardcoded colors break in light mode
- [ ] User preference persists across page reloads

---

## 10. Performance

- [ ] Initial page load < 3s (dev) / < 1.5s (production build)
- [ ] No layout shifts (CLS) during load
- [ ] Images lazy-load (below the fold)
- [ ] No console errors or warnings in production build
- [ ] Lighthouse score > 80 (Performance, Accessibility, Best Practices)
