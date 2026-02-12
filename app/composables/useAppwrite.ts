import { Client, Account, Databases, Storage, Query, ID, Permission, Role, OAuthProvider } from 'appwrite'

let client: Client | null = null
let account: Account | null = null
let databases: Databases | null = null
let storage: Storage | null = null

function getClient(): Client {
  if (client) return client

  const config = useRuntimeConfig()
  const endpoint = config.public.appwriteEndpoint as string || 'https://cloud.appwrite.io/v1'
  const project = config.public.appwriteProject as string || ''

  client = new Client()
    .setEndpoint(endpoint)
    .setProject(project)

  return client
}

export function useAppwrite() {
  const c = getClient()

  if (!account) account = new Account(c)
  if (!databases) databases = new Databases(c)
  if (!storage) storage = new Storage(c)

  return {
    client: c,
    account,
    databases,
    storage,
    Query,
    ID,
    Permission,
    Role,
    OAuthProvider
  }
}
