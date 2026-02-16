/**
 * Appwrite SDK composable with lazy loading for SSR compatibility.
 * The `appwrite` npm package is browser-only — static imports break SSR/prerendering.
 * Instead, we dynamically import it on the client side via `initAppwriteSdk()`.
 */

// Type-only imports (stripped at build, SSR-safe)
import type { Client, Account, Databases, Storage } from 'appwrite'

// Cached SDK module reference
let _sdk: typeof import('appwrite') | null = null

// Singleton instances
let client: Client | null = null
let account: Account | null = null
let databases: Databases | null = null
let storage: Storage | null = null
let sdkLoaded = false

/**
 * Lazily load the Appwrite SDK. Must be called once on the client
 * (e.g. in app.vue onMounted) before using useAppwrite().
 */
export async function initAppwriteSdk() {
  if (sdkLoaded) return
  if (!import.meta.client) return

  _sdk = await import('appwrite')
  sdkLoaded = true
}

function getClient(): Client {
  if (client) return client

  if (!_sdk) {
    throw new Error('[useAppwrite] SDK not loaded — call await initAppwriteSdk() first')
  }

  const config = useRuntimeConfig()
  const endpoint = config.public.appwriteEndpoint as string || 'https://cloud.appwrite.io/v1'
  const project = config.public.appwriteProject as string || ''

  client = new _sdk.Client()
    .setEndpoint(endpoint)
    .setProject(project)

  return client
}

export function useAppwrite() {
  if (!_sdk) {
    throw new Error('[useAppwrite] SDK not loaded — call await initAppwriteSdk() first')
  }

  const c = getClient()

  if (!account) account = new _sdk.Account(c)
  if (!databases) databases = new _sdk.Databases(c)
  if (!storage) storage = new _sdk.Storage(c)

  return {
    client: c,
    account,
    databases,
    storage,
    Query: _sdk.Query,
    ID: _sdk.ID,
    Permission: _sdk.Permission,
    Role: _sdk.Role,
    OAuthProvider: _sdk.OAuthProvider
  }
}
