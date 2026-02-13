import { Client, Databases, Query } from 'node-appwrite'

let client: Client | null = null
let databases: Databases | null = null

/**
 * Singleton node-appwrite admin client for server API routes.
 * Uses API key auth for full database access (e.g. updating UserProfile from webhooks).
 */
export function useAppwriteAdmin() {
  if (client && databases) {
    return { client, databases, Query }
  }

  const config = useRuntimeConfig()
  const endpoint = config.public.appwriteEndpoint as string
  const project = config.public.appwriteProject as string
  const apiKey = config.appwriteApiKey as string

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'NUXT_APPWRITE_API_KEY is not configured'
    })
  }

  client = new Client()
    .setEndpoint(endpoint)
    .setProject(project)
    .setKey(apiKey)

  databases = new Databases(client)

  return { client, databases, Query }
}
