export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const { users, databases } = useAppwriteAdmin()

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
    const error = err as { statusCode?: number }
    if (error.statusCode === 403) throw err
    throw createError({ statusCode: 401, statusMessage: 'Invalid user' })
  }

  // Prevent self-deletion
  if (userId === callerId) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot delete your own account' })
  }

  try {
    // Delete user-profiles document first
    try {
      await databases.deleteDocument(
        APPWRITE_DB.DATABASE_ID,
        APPWRITE_DB.COLLECTIONS.USER_PROFILES,
        userId
      )
    } catch {
      // Profile may not exist — continue
    }

    // Delete the user
    await users.delete(userId)

    return { success: true }
  } catch (err: unknown) {
    const error = err as { message?: string }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to delete user'
    })
  }
})
