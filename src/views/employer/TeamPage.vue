<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { invitationService } from '@/services/invitationService'

const ui = useUiStore()
const auth = useAuthStore()

// ── Persisted invitation storage key ──
const INVITES_KEY = 'vr_sent_invitations'

// ── Invite form ──
const showInviteModal = ref(false)
const inviteLoading = ref(false)
const inviteForm = ref({ email: '', role: 'HR' as 'HR' | 'INTERVIEWER' })
const inviteErrors = ref<Record<string, string>>({})

// ── Sent invitations (persisted in localStorage) ──
interface SentInvite {
  email: string
  role: string
  invitationId: string
  expiresAt: string
  sentAt: string
}
const sentInvites = ref<SentInvite[]>([])

// ── Computed ──
const pendingInvites = computed(() =>
  sentInvites.value.filter((i) => new Date(i.expiresAt) > new Date()),
)
const expiredInvites = computed(() =>
  sentInvites.value.filter((i) => new Date(i.expiresAt) <= new Date()),
)

// ── Current user as team member ──
const currentUserRole = computed(() => {
  if (auth.isCompanyAdmin) return 'COMPANY_ADMIN'
  if (auth.isHR) return 'HR'
  if (auth.isInterviewer) return 'INTERVIEWER'
  return 'MEMBER'
})

// ── Persistence helpers ──
function loadInvites(): void {
  try {
    const raw = localStorage.getItem(INVITES_KEY)
    if (raw) sentInvites.value = JSON.parse(raw)
  } catch {
    sentInvites.value = []
  }
}

function saveInvites(): void {
  localStorage.setItem(INVITES_KEY, JSON.stringify(sentInvites.value))
}

// ── Invite modal ──
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
    inviteErrors.value.email = 'Please provide an email address.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.value.email)) {
    inviteErrors.value.email = 'Please enter a valid email address.'
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
      ui.toastError('Invitation Failed', result.error.message)
      return
    }
    sentInvites.value.unshift({
      email: inviteForm.value.email,
      role: inviteForm.value.role,
      invitationId: result.data!.invitationId,
      expiresAt: result.data!.expiresAt,
      sentAt: new Date().toISOString(),
    })
    saveInvites()
    ui.toastSuccess('Invitation Email Sent', `Invitation successfully sent to ${inviteForm.value.email}`)
    closeInviteModal()
  } finally {
    inviteLoading.value = false
  }
}

function removeExpired(id: string): void {
  sentInvites.value = sentInvites.value.filter((i) => i.invitationId !== id)
  saveInvites()
}

// ── Helpers ──
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function roleLabel(role: string): string {
  switch (role) {
    case 'COMPANY_ADMIN': return 'Admin'
    case 'HR': return 'Recruitment Manager'
    case 'INTERVIEWER': return 'Interviewer'
    default: return role
  }
}

function roleBadgeClass(role: string): string {
  switch (role) {
    case 'COMPANY_ADMIN': return 'bg-teal-50 text-teal-700'
    case 'HR': return 'bg-blue-50 text-blue-700'
    case 'INTERVIEWER': return 'bg-purple-50 text-purple-700'
    default: return 'bg-gray-50 text-gray-700'
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

onMounted(() => {
  loadInvites()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 pb-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Personnel &amp; Team</h1>
        <p class="text-sm text-gray-500 mt-1">Manage your company team members and invite new colleagues</p>
      </div>
      <button
        v-if="auth.isCompanyAdmin"
        @click="openInviteModal"
        class="btn-primary"
      >
        <span class="text-lg leading-none">+</span> Invite Colleague
      </button>
    </div>

    <!-- ═══ Current Team Members ═══ -->
    <div class="premium-card overflow-hidden mb-6">
      <div class="p-6 border-b border-slate-200">
        <h2 class="text-lg font-bold text-slate-900">Team Members</h2>
        <p class="text-xs text-slate-400 mt-0.5">Your current workspace</p>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50">
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Member</th>
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Role</th>
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody>
          <!-- Current authenticated user -->
          <tr v-if="auth.user" class="border-b border-slate-100 hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  v-if="auth.user.avatarUrl"
                  class="w-9 h-9 rounded-full bg-cover bg-center shrink-0 ring-2 ring-white shadow-sm"
                  :style="{ backgroundImage: `url(${auth.user.avatarUrl})` }"
                />
                <div
                  v-else
                  class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm bg-teal-500"
                >
                  {{ initials(auth.user.fullName) }}
                </div>
                <div>
                  <div class="text-sm font-bold text-slate-900">
                    {{ auth.user.fullName }}
                    <span class="text-[10px] font-medium text-slate-400 ml-1">(you)</span>
                  </div>
                  <div class="text-xs text-slate-400">{{ auth.user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span
                class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                :class="roleBadgeClass(currentUserRole)"
              >
                {{ roleLabel(currentUserRole) }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-green-50 text-green-700">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
                Active
              </span>
            </td>
          </tr>

          <!-- Accepted invitations (tracked locally, showing as members) -->
          <!-- NOTE: Backend does not have a GET /companies/me/members endpoint.
               Other team members will appear here once the backend adds such an API. -->
        </tbody>
      </table>

      <div class="px-6 py-3 bg-slate-50 border-t border-slate-100">
        <p class="text-[11px] text-slate-400">
          ℹ Only your own account is displayed. A future backend API <code class="text-[10px] px-1 py-0.5 bg-slate-200 rounded">GET /companies/me/members</code> will enable showing all team members.
        </p>
      </div>
    </div>

    <!-- ═══ Pending Invitations ═══ -->
    <div class="premium-card overflow-hidden mb-6">
      <div class="p-6 border-b border-slate-200">
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-bold text-slate-900">Pending Invitations</h2>
          <span
            v-if="pendingInvites.length > 0"
            class="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-full"
          >
            {{ pendingInvites.length }}
          </span>
        </div>
      </div>

      <table v-if="pendingInvites.length > 0" class="w-full">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50">
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Email</th>
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Role</th>
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Date Sent</th>
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invite in pendingInvites"
            :key="invite.invitationId"
            class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
          >
            <td class="px-6 py-4 text-sm font-bold text-slate-900">{{ invite.email }}</td>
            <td class="px-6 py-4">
              <span
                class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full"
                :class="roleBadgeClass(invite.role)"
              >
                {{ roleLabel(invite.role) }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm font-medium text-slate-500">{{ formatDate(invite.sentAt) }}</td>
            <td class="px-6 py-4 text-sm font-medium text-slate-500">{{ formatDate(invite.expiresAt) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="text-center py-12 px-6">
        <div class="space-y-2">
          <p class="text-sm font-bold text-slate-400">No pending invitations.</p>
          <p class="text-xs text-slate-400">Click "Invite Colleague" to add members to your team.</p>
        </div>
      </div>
    </div>

    <!-- ═══ Expired Invitations ═══ -->
    <div v-if="expiredInvites.length > 0" class="premium-card overflow-hidden mb-6">
      <div class="p-6 border-b border-slate-200">
        <h2 class="text-base font-bold text-slate-500">Expired Invitations</h2>
      </div>

      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-200 bg-slate-50">
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Email</th>
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Role</th>
            <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3">Expired</th>
            <th class="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="invite in expiredInvites"
            :key="invite.invitationId"
            class="border-b border-slate-100 last:border-0 opacity-60"
          >
            <td class="px-6 py-3 text-sm text-slate-500">{{ invite.email }}</td>
            <td class="px-6 py-3">
              <span class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gray-100 text-gray-500">
                {{ roleLabel(invite.role) }}
              </span>
            </td>
            <td class="px-6 py-3 text-sm text-slate-400">{{ formatDate(invite.expiresAt) }}</td>
            <td class="px-6 py-3 text-right">
              <button
                @click="removeExpired(invite.invitationId)"
                class="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                Dismiss
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ═══ Info callout ═══ -->
    <div class="bg-teal-50 border border-teal-200 rounded-xl p-5">
      <div class="flex gap-4">
        <span class="text-teal-600 text-xl font-bold">ℹ</span>
        <div>
          <p class="text-sm font-bold text-teal-800">How invitations work</p>
          <p class="text-sm text-teal-700/80 mt-1">
            When you invite a colleague, they will receive an email with instructions to create their own account.
            Once they accept, they will be automatically assigned the selected role and associated with your company.
            Invitations expire after 7 days.
          </p>
        </div>
      </div>
    </div>

    <!-- ═══ Invite Modal ═══ -->
    <Teleport to="body">
      <div v-if="showInviteModal" class="premium-modal-backdrop" @click.self="closeInviteModal">
        <div class="premium-modal-content w-full max-w-lg">
          <!-- Modal header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 class="text-lg font-bold text-slate-900">Invite New Member</h2>
            <button
              type="button"
              @click="closeInviteModal"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal body -->
          <form @submit.prevent="handleInvite" class="px-6 py-5 space-y-5">
            <!-- Email -->
            <div>
              <label for="invite-email" class="block text-sm font-bold text-slate-700 mb-2">
                Email <span class="text-rose-500">*</span>
              </label>
              <input
                id="invite-email"
                v-model="inviteForm.email"
                type="email"
                placeholder="colleague@company.com"
                class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition"
                :class="inviteErrors.email ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'"
              />
              <p v-if="inviteErrors.email" class="text-xs text-rose-500 mt-1">{{ inviteErrors.email }}</p>
            </div>

            <!-- Role -->
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-3">Role</label>
              <div class="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  @click="inviteForm.role = 'HR'"
                  class="p-4 rounded-xl text-left transition-all border-2"
                  :class="inviteForm.role === 'HR'
                    ? 'border-teal-500 bg-teal-50 ring-4 ring-teal-500/10'
                    : 'border-slate-200 hover:border-slate-300'"
                >
                  <div class="text-sm font-bold" :class="inviteForm.role === 'HR' ? 'text-teal-700' : 'text-slate-900'">Recruitment Manager</div>
                  <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">Manage job listings, screen applications, and track the candidate pipeline.</p>
                </button>
                <button
                  type="button"
                  @click="inviteForm.role = 'INTERVIEWER'"
                  class="p-4 rounded-xl text-left transition-all border-2"
                  :class="inviteForm.role === 'INTERVIEWER'
                    ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-500/10'
                    : 'border-slate-200 hover:border-slate-300'"
                >
                  <div class="text-sm font-bold" :class="inviteForm.role === 'INTERVIEWER' ? 'text-purple-700' : 'text-slate-900'">Interviewer</div>
                  <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">Schedule interviews, send meeting links, and compile evaluation scorecards.</p>
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                @click="closeInviteModal"
                class="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="inviteLoading"
                class="btn-primary"
              >
                <span v-if="inviteLoading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {{ inviteLoading ? 'Sending invitation…' : 'Send Invitation' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
