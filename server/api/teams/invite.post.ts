interface InviteBody {
  teamId: string
  email: string
  inviterId: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<InviteBody>(event)

  if (!body.teamId || !body.email || !body.inviterId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'teamId, email, and inviterId are required'
    })
  }

  const { databases, Query } = useAppwriteAdmin()
  const config = useRuntimeConfig()

  // Verify the inviter is the team owner
  const teamDoc = await databases.getDocument(
    APPWRITE_DB.DATABASE_ID,
    APPWRITE_DB.COLLECTIONS.TEAMS,
    body.teamId
  )

  if (teamDoc.ownerId !== body.inviterId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only the team owner can send invitations'
    })
  }

  const memberIds = (teamDoc.memberIds as string[]) || []
  if (memberIds.length >= 2) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Team is already full (2/2 members)'
    })
  }

  // Check if the invited user already exists
  const existingUsers = await databases.listDocuments(
    APPWRITE_DB.DATABASE_ID,
    APPWRITE_DB.COLLECTIONS.USER_PROFILES,
    [Query.equal('email', body.email), Query.limit(1)]
  )

  const appUrl = config.public.appUrl as string || 'http://localhost:3000'
  const inviteToken = crypto.randomUUID()
  const inviteUrl = `${appUrl}/invite?token=${inviteToken}&teamId=${body.teamId}`

  // In a production app, you would send an email here via Appwrite Messaging
  // or a third-party email service. For now, we return the invite URL.
  console.log(`Team invite sent to ${body.email}: ${inviteUrl}`)

  // If user already exists, we could auto-add them, but for security
  // we always send an invite link so the user explicitly accepts
  const isExistingUser = (existingUsers.documents?.length ?? 0) > 0

  return {
    success: true,
    inviteUrl,
    isExistingUser,
    message: `Invitation sent to ${body.email}`
  }
})
