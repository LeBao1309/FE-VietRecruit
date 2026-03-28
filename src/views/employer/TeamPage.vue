<script setup lang="ts">
import { ref } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { invitationService } from '@/services/invitationService'

const ui = useUiStore()

// ── Invite form ──
const showInviteModal = ref(false)
const inviteLoading = ref(false)
const inviteForm = ref({ email: '', role: 'HR' as 'HR' | 'INTERVIEWER' })
const inviteErrors = ref<Record<string, string>>({})

// ── Sent invitations (stored locally after sending) ──
interface SentInvite {
  email: string
  role: string
  invitationId: string
  expiresAt: string
  sentAt: string
}
const sentInvites = ref<SentInvite[]>([])

function openInviteModal(): void {
  inviteForm.value = { email: '', role: 'HR' }
  inviteErrors.value = {}
  showInviteModal.value = true
}

function closeInviteModal(): void {
  showInviteModal.value = false
}

function validate(): boolean {
  inviteErrors.value = {}
  if (!inviteForm.value.email.trim()) {
    inviteErrors.value.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.value.email)) {
    inviteErrors.value.email = 'Please enter a valid email.'
  }
  return Object.keys(inviteErrors.value).length === 0
}

async function handleInvite(): Promise<void> {
  if (!validate()) return
  inviteLoading.value = true
  try {
    const result = await invitationService.createInvitation({
      email: inviteForm.value.email,
      role: inviteForm.value.role,
    })
    if (result.error) {
      ui.toastError('Invitation failed', result.error.message)
      return
    }
    sentInvites.value.unshift({
      email: inviteForm.value.email,
      role: inviteForm.value.role,
      invitationId: result.data!.invitationId,
      expiresAt: result.data!.expiresAt,
      sentAt: new Date().toISOString(),
    })
    ui.toastSuccess('Invitation sent', `An invite has been sent to ${inviteForm.value.email}`)
    closeInviteModal()
  } finally {
    inviteLoading.value = false
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function roleBadgeClass(role: string): string {
  return role === 'HR'
    ? 'bg-blue-50 text-blue-700'
    : 'bg-purple-50 text-purple-700'
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Team</h1>
        <p class="text-sm text-gray-500 mt-1">Invite HR managers and interviewers to collaborate</p>
      </div>
      <button
        @click="openInviteModal"
        class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition flex items-center gap-1.5"
      >
        <span class="text-lg leading-none">+</span> Invite member
      </button>
    </div>

    <!-- Info callout -->
    <div class="bg-info-bg border border-info/20 rounded-lg p-4 mb-6">
      <div class="flex gap-3">
        <span class="text-info text-lg">ℹ</span>
        <div>
          <p class="text-sm font-medium text-info">How invitations work</p>
          <p class="text-sm text-gray-600 mt-1">
            When you invite a team member, they'll receive an email with a link to set up their account.
            Invitations expire after 7 days.
          </p>
        </div>
      </div>
    </div>

    <!-- Sent invitations table -->
    <div class="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
      <div class="p-4 border-b border-border">
        <h2 class="text-sm font-semibold text-gray-900">Pending Invitations</h2>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-border bg-gray-50/50">
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Email</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Role</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Sent</th>
            <th class="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Expires</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="sentInvites.length === 0">
            <td colspan="4" class="text-center text-sm text-gray-400 py-12">
              <div class="space-y-2">
                <span class="text-3xl">👥</span>
                <p>No invitations sent yet</p>
                <p class="text-xs text-gray-300">Click "Invite member" to get started</p>
              </div>
            </td>
          </tr>
          <tr v-for="invite in sentInvites" :key="invite.invitationId" class="border-b border-border last:border-0 hover:bg-gray-50/50 transition">
            <td class="px-4 py-3 text-sm text-gray-900">{{ invite.email }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full" :class="roleBadgeClass(invite.role)">
                {{ invite.role }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(invite.sentAt) }}</td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(invite.expiresAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Invite Modal -->
    <Teleport to="body">
      <div v-if="showInviteModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="closeInviteModal" />
        <div class="relative bg-surface rounded-lg shadow-xl border border-border w-full max-w-md p-6 animate-slide-up">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Invite team member</h2>

          <form @submit.prevent="handleInvite" class="space-y-4">
            <!-- Email -->
            <div>
              <label for="invite-email" class="block text-sm font-medium text-gray-700 mb-1">
                Email <span class="text-error">*</span>
              </label>
              <input
                id="invite-email"
                v-model="inviteForm.email"
                type="email"
                placeholder="colleague@company.com"
                class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
                :class="inviteErrors.email ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
              />
              <p v-if="inviteErrors.email" class="text-xs text-error mt-1">{{ inviteErrors.email }}</p>
            </div>

            <!-- Role -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  @click="inviteForm.role = 'HR'"
                  class="p-3 border rounded-lg text-left transition"
                  :class="inviteForm.role === 'HR'
                    ? 'border-primary bg-primary-bg'
                    : 'border-border hover:border-gray-300'"
                >
                  <div class="text-sm font-semibold" :class="inviteForm.role === 'HR' ? 'text-primary' : 'text-gray-900'">HR Manager</div>
                  <p class="text-xs text-gray-500 mt-0.5">Manage jobs, candidates & pipelines</p>
                </button>
                <button
                  type="button"
                  @click="inviteForm.role = 'INTERVIEWER'"
                  class="p-3 border rounded-lg text-left transition"
                  :class="inviteForm.role === 'INTERVIEWER'
                    ? 'border-primary bg-primary-bg'
                    : 'border-border hover:border-gray-300'"
                >
                  <div class="text-sm font-semibold" :class="inviteForm.role === 'INTERVIEWER' ? 'text-primary' : 'text-gray-900'">Interviewer</div>
                  <p class="text-xs text-gray-500 mt-0.5">Conduct interviews & submit scorecards</p>
                </button>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                @click="closeInviteModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="inviteLoading"
                class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 flex items-center gap-2"
              >
                <span v-if="inviteLoading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {{ inviteLoading ? 'Sending…' : 'Send invitation' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
