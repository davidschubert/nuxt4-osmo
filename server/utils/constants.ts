/**
 * Server-side Appwrite constants.
 * Duplicated from app/utils/constants.ts because ~/utils/ is not resolvable in server/ context.
 */
export const APPWRITE_DB = {
  DATABASE_ID: 'vault-db',
  COLLECTIONS: {
    USER_PROFILES: 'user-profiles'
  }
} as const
