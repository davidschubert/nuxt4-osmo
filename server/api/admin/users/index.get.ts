export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { users, databases, Query: Q } = useAppwriteAdmin()

  // Verify caller is admin
  const callerId = getHeader(event, 'x-user-id')
  if (!callerId) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }

  try {
    const caller = await users.get(callerId)
    if (!caller.labels?.includes('admin')) {
      throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
    }
  } catch (err: unknown) {
    const error = err as { statusCode?: number, statusMessage?: string }
    if (error.statusCode === 403) throw err
    throw createError({ statusCode: 401, statusMessage: 'Invalid user' })
  }

  // Parse query params
  const search = (query.search as string) || ''
  const limit = Math.min(parseInt(query.limit as string) || 25, 100)
  const offset = parseInt(query.offset as string) || 0

  // Fetch users from Appwrite
  const queries = [Q.limit(limit), Q.offset(offset), Q.orderDesc('$createdAt')]

  const result = search
    ? await users.list(queries, search)
    : await users.list(queries)

  // Batch-fetch user profiles for subscription data
  const userIds = result.users.map((u: { $id: string }) => u.$id)
  let profileMap: Record<string, { subscriptionStatus?: string, planType?: string }> = {}

  if (userIds.length > 0) {
    try {
      const profiles = await databases.listDocuments(
        APPWRITE_DB.DATABASE_ID,
        APPWRITE_DB.COLLECTIONS.USER_PROFILES,
        [Q.equal('userId', userIds), Q.limit(100)]
      )
      profileMap = Object.fromEntries(
        profiles.documents.map((p: { userId: string, subscriptionStatus?: string, planType?: string }) => [
          p.userId,
          { subscriptionStatus: p.subscriptionStatus, planType: p.planType }
        ])
      )
    } catch {
      // Profiles collection may not exist yet — continue without profile data
    }
  }

  // Map to AdminUser shape
  const adminUsers = result.users.map((u: {
    $id: string
    name: string
    email: string
    emailVerification: boolean
    status: boolean
    labels: string[]
    registration: string
  }) => ({
    $id: u.$id,
    name: u.name,
    email: u.email,
    emailVerification: u.emailVerification,
    status: u.status,
    labels: u.labels || [],
    registration: u.registration,
    subscriptionStatus: profileMap[u.$id]?.subscriptionStatus || 'free',
    planType: profileMap[u.$id]?.planType
  }))

  return {
    users: adminUsers,
    total: result.total
  }
})
