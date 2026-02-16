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

  const { databases } = useAppwriteAdmin()
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

  const appUrl = config.public.appUrl as string || 'http://localhost:3000'
  const inviteToken = crypto.randomUUID()

  // Token expires in 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const inviteUrl = `${appUrl}/invite?token=${inviteToken}&teamId=${body.teamId}&expires=${expiresAt}`

  // In a production app, you would send an email here via Appwrite Messaging
  // or a third-party email service. For now, we return the invite URL.
  console.log(`Team invite created for ${body.email} (expires: ${expiresAt})`)

  return {
    success: true,
    inviteUrl,
    message: 'Invitation sent to the provided email'
  }
})
