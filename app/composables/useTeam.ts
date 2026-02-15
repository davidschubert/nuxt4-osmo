import type { Team } from '~/types'
import { APPWRITE } from '~/utils/constants'

export function useTeam() {
  const authStore = useAuthStore()
  const toast = useToast()
  const MOCK_MODE = isMockMode()

  const team = ref<Team | null>(null)
  const teamLoading = ref(false)
  const inviteLoading = ref(false)

  const teamMembers = computed(() => team.value?.memberIds ?? [])
  const isTeamOwner = computed(() => {
    if (!team.value || !authStore.user) return false
    return team.value.ownerId === authStore.user.userId
  })
  const canInvite = computed(() => {
    if (!team.value) return false
    return team.value.memberIds.length < 2 && isTeamOwner.value
  })

  /**
   * Load the current user's team
   */
  async function loadTeam() {
    const user = authStore.user
    if (!user?.teamId) {
      team.value = null
      return
    }

    if (MOCK_MODE) {
      team.value = {
        $id: 'team-mock-1',
        name: 'My Team',
        ownerId: user.userId,
        memberIds: [user.userId],
        subscriptionStatus: user.subscriptionStatus,
        planType: 'team'
      }
      return
    }

    teamLoading.value = true
    try {
      const { databases } = useAppwrite()
      const doc = await databases.getDocument({
        databaseId: APPWRITE.DATABASE_ID,
        collectionId: APPWRITE.COLLECTIONS.TEAMS,
        documentId: user.teamId
      })

      team.value = {
        $id: doc.$id as string,
        name: doc.name as string,
        ownerId: doc.ownerId as string,
        memberIds: (doc.memberIds as string[]) || [],
        subscriptionStatus: (doc.subscriptionStatus as Team['subscriptionStatus']) || 'free',
        stripeCustomerId: (doc.stripeCustomerId as string) || undefined,
        stripeSubscriptionId: (doc.stripeSubscriptionId as string) || undefined,
        planType: 'team'
      }
    } catch {
      team.value = null
    } finally {
      teamLoading.value = false
    }
  }

  /**
   * Create a new team (called after Team plan checkout)
   */
  async function createTeam(name: string) {
    const user = authStore.user
    if (!user) return

    if (MOCK_MODE) {
      team.value = {
        $id: 'team-mock-1',
        name,
        ownerId: user.userId,
        memberIds: [user.userId],
        subscriptionStatus: 'active',
        planType: 'team'
      }
      authStore.setUser({ ...user, teamId: 'team-mock-1', planType: 'team' })
      toast.add({ title: 'Team created!', description: `Team "${name}" is ready.` })
      return
    }

    teamLoading.value = true
    try {
      const { databases, ID, Permission, Role } = useAppwrite()
      const doc = await databases.createDocument({
        databaseId: APPWRITE.DATABASE_ID,
        collectionId: APPWRITE.COLLECTIONS.TEAMS,
        documentId: ID.unique(),
        data: {
          name,
          ownerId: user.userId,
          memberIds: [user.userId],
          subscriptionStatus: user.subscriptionStatus,
          planType: 'team'
        },
        permissions: [
          Permission.read(Role.user(user.userId)),
          Permission.update(Role.user(user.userId))
        ]
      })

      // Update user profile with team reference
      await databases.updateDocument({
        databaseId: APPWRITE.DATABASE_ID,
        collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
        documentId: user.userId,
        data: { teamId: doc.$id, planType: 'team' }
      })

      authStore.setUser({ ...user, teamId: doc.$id as string, planType: 'team' })
      team.value = {
        $id: doc.$id as string,
        name,
        ownerId: user.userId,
        memberIds: [user.userId],
        subscriptionStatus: user.subscriptionStatus,
        planType: 'team'
      }

      toast.add({ title: 'Team created!', description: `Team "${name}" is ready.` })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create team'
      toast.add({ title: 'Error', description: message, color: 'error' })
    } finally {
      teamLoading.value = false
    }
  }

  /**
   * Invite a member by email
   */
  async function inviteMember(email: string) {
    const user = authStore.user
    if (!user?.teamId || !isTeamOwner.value) return

    if (MOCK_MODE) {
      toast.add({
        title: 'Invitation sent!',
        description: `Invitation sent to ${email} (mock mode).`
      })
      return
    }

    inviteLoading.value = true
    try {
      await $fetch('/api/teams/invite', {
        method: 'POST',
        body: {
          teamId: user.teamId,
          email,
          inviterId: user.userId
        }
      })
      toast.add({
        title: 'Invitation sent!',
        description: `An invitation has been sent to ${email}.`
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send invitation'
      toast.add({ title: 'Error', description: message, color: 'error' })
    } finally {
      inviteLoading.value = false
    }
  }

  /**
   * Remove a member from the team
   */
  async function removeMember(memberId: string) {
    const user = authStore.user
    if (!user?.teamId || !isTeamOwner.value) return
    if (memberId === user.userId) return // Can't remove yourself

    if (MOCK_MODE) {
      if (team.value) {
        team.value.memberIds = team.value.memberIds.filter(id => id !== memberId)
      }
      toast.add({ title: 'Member removed' })
      return
    }

    teamLoading.value = true
    try {
      const { databases } = useAppwrite()

      // Remove from team memberIds
      const updatedMembers = (team.value?.memberIds ?? []).filter(id => id !== memberId)
      await databases.updateDocument({
        databaseId: APPWRITE.DATABASE_ID,
        collectionId: APPWRITE.COLLECTIONS.TEAMS,
        documentId: user.teamId,
        data: { memberIds: updatedMembers }
      })

      // Remove team reference from the removed user's profile
      await databases.updateDocument({
        databaseId: APPWRITE.DATABASE_ID,
        collectionId: APPWRITE.COLLECTIONS.USER_PROFILES,
        documentId: memberId,
        data: { teamId: null, planType: null }
      })

      if (team.value) {
        team.value.memberIds = updatedMembers
      }
      toast.add({ title: 'Member removed' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove member'
      toast.add({ title: 'Error', description: message, color: 'error' })
    } finally {
      teamLoading.value = false
    }
  }

  return {
    team: computed(() => team.value),
    teamMembers,
    isTeamOwner,
    canInvite,
    teamLoading: computed(() => teamLoading.value),
    inviteLoading: computed(() => inviteLoading.value),
    loadTeam,
    createTeam,
    inviteMember,
    removeMember
  }
}
