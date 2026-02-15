<script setup lang="ts">
const { user } = useAuth()
const {
  team,
  teamMembers,
  isTeamOwner,
  canInvite,
  teamLoading,
  inviteLoading,
  loadTeam,
  createTeam,
  inviteMember,
  removeMember
} = useTeam()

const inviteEmail = ref('')
const teamName = ref('')
const showCreateForm = ref(false)

onMounted(() => {
  loadTeam()
})

async function handleInvite() {
  if (!inviteEmail.value) return
  await inviteMember(inviteEmail.value)
  inviteEmail.value = ''
}

async function handleCreate() {
  if (!teamName.value) return
  await createTeam(teamName.value)
  teamName.value = ''
  showCreateForm.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- No team yet -->
    <template v-if="!user?.teamId">
      <div class="space-y-4">
        <p class="text-sm text-muted">
          You don't have a team yet. Create a team to invite a collaborator and share access.
        </p>

        <div v-if="showCreateForm">
          <div class="flex gap-2">
            <UInput
              v-model="teamName"
              placeholder="Team name"
              size="sm"
              class="flex-1"
            />
            <UButton
              label="Create"
              size="sm"
              :loading="teamLoading"
              @click="handleCreate"
            />
            <UButton
              label="Cancel"
              size="sm"
              variant="outline"
              color="neutral"
              @click="showCreateForm = false"
            />
          </div>
        </div>
        <UButton
          v-else
          label="Create Team"
          variant="outline"
          @click="showCreateForm = true"
        />
      </div>
    </template>

    <!-- Team exists -->
    <template v-else-if="team">
      <div class="space-y-2">
        <label class="text-xs font-medium text-muted uppercase tracking-wider">Team Name</label>
        <p class="text-sm font-medium">
          {{ team.name }}
        </p>
      </div>

      <USeparator />

      <!-- Members list -->
      <div class="space-y-3">
        <label class="text-xs font-medium text-muted uppercase tracking-wider">
          Members ({{ teamMembers.length }}/2)
        </label>

        <div
          v-for="memberId in teamMembers"
          :key="memberId"
          class="flex items-center justify-between gap-3 py-2"
        >
          <div class="flex items-center gap-3 min-w-0">
            <UAvatar
              size="sm"
              :text="memberId === user?.userId ? user?.displayName?.charAt(0) : '?'"
            />
            <div class="min-w-0">
              <p class="text-sm font-medium truncate">
                {{ memberId === user?.userId ? user?.displayName : memberId }}
              </p>
              <p
                v-if="memberId === team.ownerId"
                class="text-xs text-muted"
              >
                Owner
              </p>
            </div>
          </div>
          <UButton
            v-if="isTeamOwner && memberId !== user?.userId"
            icon="i-lucide-user-minus"
            variant="ghost"
            color="error"
            size="xs"
            aria-label="Remove member"
            :loading="teamLoading"
            @click="removeMember(memberId)"
          />
        </div>
      </div>

      <USeparator />

      <!-- Invite member -->
      <div
        v-if="canInvite"
        class="space-y-3"
      >
        <label class="text-xs font-medium text-muted uppercase tracking-wider">Invite Member</label>
        <div class="flex gap-2">
          <UInput
            v-model="inviteEmail"
            type="email"
            placeholder="colleague@example.com"
            size="sm"
            class="flex-1"
          />
          <UButton
            label="Send Invite"
            size="sm"
            :loading="inviteLoading"
            :disabled="!inviteEmail"
            @click="handleInvite"
          />
        </div>
        <p class="text-xs text-muted">
          Your team plan includes 2 seats. Invited members will have full access to all resources.
        </p>
      </div>

      <div
        v-else-if="!canInvite && isTeamOwner"
        class="text-sm text-muted"
      >
        All team seats are filled. Remove a member to invite someone new.
      </div>
    </template>

    <!-- Loading -->
    <div
      v-else-if="teamLoading"
      class="space-y-3"
    >
      <USkeleton class="h-4 w-32" />
      <USkeleton class="h-10 w-full" />
    </div>
  </div>
</template>
