# Deployment & Operations Guide

Complete guide for deploying **The Vault** to production.

---

## Architecture Overview

The Vault is a **Nuxt 4 SPA** (`ssr: false`) with server-side API routes:

```
Client (SPA)           Server Routes              External Services
┌──────────────┐      ┌─────────────────┐        ┌──────────────┐
│  Nuxt 4 SPA  │──────│ /api/stripe/*   │────────│ Stripe API   │
│  (Static)    │      │ checkout.post   │        │              │
│              │      │ webhook.post    │        └──────────────┘
│              │      │ portal.post     │
│              │      └─────────────────┘        ┌──────────────┐
│              │──────────────────────────────────│ Appwrite     │
│              │  (Client SDK, direct)            │ Cloud / Self │
└──────────────┘                                  └──────────────┘
```

**Requirements:**
- Node.js 22+ runtime (for server routes)
- Cannot be deployed as a purely static site (Stripe API routes need a server)

---

## Environment Variables

### Required Variables

| Variable | Where | Description | Example |
|----------|-------|-------------|---------|
| `NUXT_PUBLIC_APPWRITE_ENDPOINT` | Client + Server | Appwrite API endpoint | `https://cloud.appwrite.io/v1` |
| `NUXT_PUBLIC_APPWRITE_PROJECT` | Client + Server | Appwrite project ID | `6789abcdef012345` |
| `NUXT_PUBLIC_STRIPE_PRICE_ID` | Client | Stripe Price ID for subscription | `price_1234567890` |
| `NUXT_PUBLIC_APP_URL` | Client + Server | Production app URL (for OAuth redirects) | `https://vault.example.com` |
| `NUXT_STRIPE_SECRET_KEY` | Server only | Stripe secret key | `sk_live_...` |
| `NUXT_STRIPE_WEBHOOK_SECRET` | Server only | Stripe webhook signing secret | `whsec_...` |
| `NUXT_APPWRITE_API_KEY` | Server only | Appwrite server API key | `standard_...` |

### Security Notes

- **Never** commit `.env` to version control (already in `.gitignore`)
- Server-only variables (`NUXT_STRIPE_SECRET_KEY`, `NUXT_STRIPE_WEBHOOK_SECRET`, `NUXT_APPWRITE_API_KEY`) are never exposed to the client
- `NUXT_PUBLIC_*` variables are embedded in the client bundle and visible to users
- Use the hosting provider's environment variable UI to set secrets
- Rotate API keys immediately if accidentally exposed

### Local Development

```bash
cp .env.example .env
# Fill in your development values
```

`.env.example`:
```env
# Appwrite
NUXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NUXT_PUBLIC_APPWRITE_PROJECT=
NUXT_APPWRITE_API_KEY=

# Stripe (test mode)
NUXT_PUBLIC_STRIPE_PRICE_ID=
NUXT_STRIPE_SECRET_KEY=sk_test_...
NUXT_STRIPE_WEBHOOK_SECRET=whsec_...

# App
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Deployment Providers

### Vercel (Recommended)

1. **Connect repository** to Vercel via GitHub integration

2. **Configure build settings:**
   - Framework Preset: Nuxt
   - Build Command: `pnpm build`
   - Output Directory: `.output`
   - Install Command: `pnpm install`
   - Node.js Version: 22.x

3. **Set environment variables** in Vercel dashboard (Settings > Environment Variables)

4. **Deploy:** Push to `main` branch triggers auto-deployment

5. **Serverless functions** are auto-detected from `server/api/` routes

```bash
# Or deploy via CLI
npx vercel --prod
```

### Netlify

1. **Connect repository** to Netlify via GitHub integration

2. **Configure build settings:**
   - Build Command: `pnpm build`
   - Publish Directory: `.output/public`
   - Functions Directory: auto-detected

3. **Set environment variables** in Netlify dashboard (Site Settings > Environment Variables)

4. **Add `netlify.toml`** (optional):
   ```toml
   [build]
     command = "pnpm build"
     publish = ".output/public"

   [build.environment]
     NODE_VERSION = "22"
   ```

### Cloudflare Pages

1. **Connect repository** to Cloudflare Pages

2. **Configure build settings:**
   - Build Command: `pnpm build`
   - Build Output Directory: `.output/public`
   - Node.js Version: 22

3. **Set environment variables** in Cloudflare dashboard

4. **Note:** Server routes run as Cloudflare Workers (edge functions). Set `NITRO_PRESET=cloudflare-pages` if needed:
   ```ts
   // nuxt.config.ts (for Cloudflare)
   export default defineNuxtConfig({
     nitro: {
       preset: 'cloudflare-pages'
     }
   })
   ```

### Node.js Self-Hosted

1. **Build the application:**
   ```bash
   pnpm build
   ```

2. **Start the production server:**
   ```bash
   node .output/server/index.mjs
   ```

3. **Environment variables** can be set via:
   - System environment variables
   - `.env` file in the project root
   - Process manager (PM2, systemd)

4. **PM2 example:**
   ```bash
   pm2 start .output/server/index.mjs --name "the-vault"
   ```

5. **systemd service example:**
   ```ini
   [Unit]
   Description=The Vault
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/opt/the-vault
   EnvironmentFile=/opt/the-vault/.env
   ExecStart=/usr/bin/node .output/server/index.mjs
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

6. **Reverse proxy** with nginx:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name vault.example.com;

       ssl_certificate     /etc/letsencrypt/live/vault.example.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/vault.example.com/privkey.pem;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }

   server {
       listen 80;
       server_name vault.example.com;
       return 301 https://$host$request_uri;
   }
   ```

---

## Domain & SSL Setup

### DNS Configuration

| Record Type | Name | Value | TTL |
|------------|------|-------|-----|
| A | `@` | Provider IP (see provider docs) | 300 |
| CNAME | `www` | `vault.example.com` | 300 |

**Provider-specific:**
- **Vercel:** Add domain in project settings, follow DNS instructions
- **Netlify:** Add custom domain in site settings, use Netlify DNS or external
- **Cloudflare:** Domain is already on Cloudflare, just add Pages custom domain

### SSL Certificate

- **Managed providers** (Vercel, Netlify, Cloudflare): SSL is automatic, no action needed
- **Self-hosted:** Use Let's Encrypt with certbot:
  ```bash
  sudo certbot --nginx -d vault.example.com -d www.vault.example.com
  ```

### HTTPS Redirect

- **Managed providers:** Automatic
- **Self-hosted:** Configure in nginx (see reverse proxy example above)

### Appwrite OAuth Redirect URLs

After setting up your domain, update OAuth providers in Appwrite Console:

1. Go to **Auth > Settings** in Appwrite Console
2. For each OAuth provider (GitHub, Google, Apple), add:
   - Success URL: `https://vault.example.com/vault`
   - Failure URL: `https://vault.example.com/login`
3. Update the OAuth app settings on each provider platform with the new domain

---

## Stripe Live Mode Setup

### 1. Switch API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) > **Developers > API Keys**
2. Copy the **live mode** publishable key and secret key
3. Set in production environment:
   ```
   NUXT_STRIPE_SECRET_KEY=sk_live_...
   NUXT_PUBLIC_STRIPE_PRICE_ID=price_live_...
   ```

### 2. Create Live Price

1. Go to **Products** in Stripe Dashboard
2. Create a product (e.g., "The Vault Premium")
3. Add a price (e.g., $9.99/month or $99/year)
4. Copy the Price ID and set as `NUXT_PUBLIC_STRIPE_PRICE_ID`

### 3. Set Up Webhook

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Set endpoint URL: `https://vault.example.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing Secret** and set as `NUXT_STRIPE_WEBHOOK_SECRET`

### 4. Test Live Mode

- [ ] Create a test subscription with a real card (use Stripe's test card numbers first via test mode toggle)
- [ ] Verify webhook receives events (check Stripe Dashboard > Webhooks > Recent Events)
- [ ] Verify user profile updates in Appwrite after successful checkout
- [ ] Test cancellation flow via Customer Portal
- [ ] Verify `customer.subscription.deleted` webhook processes correctly

### 5. API Version

- Check the Stripe API version in your dashboard (Developers > Overview)
- Pin the API version in your code if needed:
  ```ts
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2025-01-27.acacia' // pin to tested version
  })
  ```

---

## Post-Launch Checklist

### Smoke Test

- [ ] Landing page loads on production domain
- [ ] SSL certificate is valid (check browser padlock)
- [ ] Registration flow works
- [ ] Login flow works (email + OAuth)
- [ ] Vault grid loads with resources
- [ ] Resource detail page renders with code blocks
- [ ] Search (Meta+K) works
- [ ] Stripe checkout completes
- [ ] Stripe webhook processes events
- [ ] Premium content unlocks after payment
- [ ] Customer Portal accessible
- [ ] Logout works and redirects correctly

### Monitoring

- [ ] Set up uptime monitoring (e.g., UptimeRobot, Vercel Analytics)
- [ ] Enable error tracking (e.g., Sentry)
- [ ] Check Stripe webhook delivery health regularly
- [ ] Monitor Appwrite usage and quotas

### Security

- [ ] All secrets stored as environment variables (not in code)
- [ ] HTTPS enforced on all routes
- [ ] Appwrite document-level permissions verify premium content access
- [ ] Stripe webhook signature verification active
- [ ] OAuth redirect URLs point to production domain only
- [ ] No sensitive data in client-side console logs
