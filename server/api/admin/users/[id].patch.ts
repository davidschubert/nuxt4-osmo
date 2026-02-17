interface UpdateBody {
  name?: string
  email?: string
  labels?: string[]
  status?: boolean
}

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id')
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const body = await readBody<UpdateBody>(event)
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

  // Apply updates
  try {
    if (body.name !== undefined) {
      await users.updateName(userId, body.name)
    }

    if (body.email !== undefined) {
      await users.updateEmail(userId, body.email)
    }

    if (body.labels !== undefined) {
      await users.updateLabels(userId, body.labels)
    }

    if (body.status !== undefined) {
      await users.updateStatus(userId, body.status)
    }

    // Also update user-profiles document if name changed
    if (body.name !== undefined) {
      try {
        await databases.updateDocument(
          APPWRITE_DB.DATABASE_ID,
          APPWRITE_DB.COLLECTIONS.USER_PROFILES,
          userId,
          { displayName: body.name }
        )
      } catch {
        // Profile may not exist — that's okay
      }
    }

    // Fetch updated user
    const updated = await users.get(userId)

    return {
      $id: updated.$id,
      name: updated.name,
      email: updated.email,
      emailVerification: updated.emailVerification,
      status: updated.status,
      labels: updated.labels || [],
      registration: updated.registration
    }
  } catch (err: unknown) {
    const error = err as { message?: string }
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to update user'
    })
  }
})
