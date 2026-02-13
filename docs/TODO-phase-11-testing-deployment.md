# Phase 11: Testing & Deployment

Test-Infrastruktur aufbauen, CI/CD erweitern und Production Deployment konfigurieren.

## Test Setup

- [ ] Vitest installieren und konfigurieren (`pnpm add -D vitest @vue/test-utils happy-dom`)
- [ ] `vitest.config.ts` erstellen (Nuxt-kompatibel, Auto-Imports)
- [ ] Test-Script in `package.json` hinzufuegen (`"test": "vitest"`, `"test:run": "vitest run"`)

## Unit Tests

- [ ] `composables/useAuth.ts` – Login, Register, Logout, Session Check
- [ ] `composables/useResources.ts` – List, Get, Filter
- [ ] `composables/useCategories.ts` – List, Counts
- [ ] `composables/useSearch.ts` – Search Logic, Filtering
- [ ] `stores/auth.ts` – State Management, Actions
- [ ] `stores/vault.ts` – State Management, Getters
- [ ] `utils/constants.ts` – Konstanten-Validierung
- [ ] `utils/markdown.ts` – Markdown Rendering

## Component Tests

- [ ] `VaultCard.vue` – Rendering, Badge, Click
- [ ] `VaultGrid.vue` – Grid Layout, Empty State
- [ ] `ResourceCode.vue` – Code Display, Copy Button
- [ ] `AuthLogin.vue` / `AuthRegister.vue` – Form Validation, Submit
- [ ] `AdminResourceForm.vue` – Form Fields, Validation

## E2E Tests

- [ ] Playwright installieren und konfigurieren (`pnpm add -D @playwright/test`)
- [ ] `playwright.config.ts` erstellen
- [ ] E2E: Landing Page laden + Navigation
- [ ] E2E: Register -> Login -> Vault Browse
- [ ] E2E: Resource Detail anzeigen + Code kopieren
- [ ] E2E: Search oeffnen + Ergebnis auswaehlen
- [ ] E2E: Checkout Flow (mit Stripe Test Mode)

## CI/CD Pipeline

- [ ] `.github/workflows/ci.yml` erweitern:
  - Build-Step hinzufuegen (`pnpm build`)
  - Unit Tests ausfuehren (`pnpm test:run`)
  - E2E Tests ausfuehren (Playwright)
- [ ] Deployment Workflow erstellen (`.github/workflows/deploy.yml`)
  - Trigger: Push auf `main` oder Release Tag
  - Build + Deploy zum gewaehlten Provider

## Deployment

- [ ] Deployment Provider waehlen (Vercel / Cloudflare / Netlify)
- [ ] Provider-spezifische Config erstellen (`vercel.json` / `netlify.toml` / etc.)
- [ ] Environment Variables im Provider konfigurieren
  - Appwrite Endpoint + Project ID
  - Stripe Keys (Secret, Webhook Secret, Price ID)
  - Appwrite API Key (fuer Server Routes)
- [ ] Domain + SSL konfigurieren
- [ ] Stripe Live Mode aktivieren
  - Live API Keys eintragen
  - Webhook Endpoint auf Production URL umstellen
  - Produkt + Preis in Stripe Dashboard erstellen

## Pre-Launch Checkliste

- [ ] `pnpm lint` – keine Fehler
- [ ] `pnpm typecheck` – keine Fehler
- [ ] `pnpm build` – erfolgreicher Build
- [ ] `pnpm test:run` – alle Tests gruen
- [ ] Manueller Walkthrough: Register -> Login -> Browse -> Checkout -> Premium Content
