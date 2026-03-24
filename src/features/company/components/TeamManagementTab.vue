<script setup lang="ts">
import { ref } from 'vue'

type Role = 'COMPANY_ADMIN' | 'HR' | 'INTERVIEWER'

interface Member {
  id: string
  userId: string
  email: string
  fullName: string
  role: Role
  joinedAt: string
}

interface Invitation {
  id: string
  email: string
  role: Role
  invitedAt: string
  expiresAt: string
}

defineProps<{
  members: Member[]
  invitations: Invitation[]
  isLoading: boolean
  isSaving: boolean
  error: string | null
  successMessage: string | null
  currentUserRole: Role
}>()

const emit = defineEmits<{
  invite: [payload: { email: string; role: 'HR' | 'INTERVIEWER' }]
  updateRole: [memberId: string, role: Role]
  removeMember: [memberId: string]
  revokeInvitation: [invitationId: string]
}>()

const isInviteModalOpen = ref(false)
const inviteForm = ref({
  email: '',
  role: 'HR' as 'HR' | 'INTERVIEWER',
})

const openInviteModal = () => {
  inviteForm.value = { email: '', role: 'HR' }
  isInviteModalOpen.value = true
}

const handleInvite = () => {
  emit('invite', { ...inviteForm.value })
  isInviteModalOpen.value = false
}

const getRoleBadgeClass = (role: Role) => {
  switch (role) {
    case 'COMPANY_ADMIN':
      return 'bg-purple-100 text-purple-700'
    case 'HR':
      return 'bg-blue-100 text-blue-700'
    case 'INTERVIEWER':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getRoleLabel = (role: Role) => {
  switch (role) {
    case 'COMPANY_ADMIN':
      return 'Quản trị viên'
    case 'HR':
      return 'Nhân sự (HR)'
    case 'INTERVIEWER':
      return 'Người phỏng vấn'
    default:
      return role
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Success Message -->
    <div v-if="successMessage" class="p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center">
      <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      {{ successMessage }}
    </div>

    <!-- Error Message -->
    <div v-if="error" class="p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- Header Actions -->
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-bold text-gray-800">Quản lý Thành viên</h3>
      <button
        v-if="currentUserRole === 'COMPANY_ADMIN'"
        @click="openInviteModal"
        class="px-4 py-2 bg-[#009898] hover:bg-[#007a7a] text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Mời thành viên
      </button>
    </div>

    <!-- Section 1: Members -->
    <div class="space-y-4">
      <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Thành viên hiện tại ({{ members.length }})</h4>
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Họ tên</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th v-if="currentUserRole === 'COMPANY_ADMIN'" class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-if="isLoading" v-for="i in 3" :key="i" class="animate-pulse">
                <td class="px-6 py-4"><div class="h-4 bg-gray-100 rounded w-1/2"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-100 rounded w-3/4"></div></td>
                <td class="px-6 py-4"><div class="h-6 bg-gray-100 rounded w-24"></div></td>
                <td v-if="currentUserRole === 'COMPANY_ADMIN'" class="px-6 py-4 text-right"><div class="h-8 bg-gray-100 rounded w-20 ml-auto"></div></td>
              </tr>
              <tr v-for="member in members" :key="member.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[#009898] font-bold mr-3">
                      {{ member.fullName.charAt(0) }}
                    </div>
                    <span class="text-sm font-medium text-gray-900">{{ member.fullName }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ member.email }}</td>
                <td class="px-6 py-4">
                  <select
                    v-if="currentUserRole === 'COMPANY_ADMIN' && member.role !== 'COMPANY_ADMIN'"
                    :value="member.role"
                    @change="e => emit('updateRole', member.id, (e.target as HTMLSelectElement).value as Role)"
                    class="text-xs font-semibold px-2 py-1 rounded border border-gray-300 focus:ring-1 focus:ring-[#009898] outline-none"
                  >
                    <option value="HR">Nhân sự (HR)</option>
                    <option value="INTERVIEWER">Người phỏng vấn</option>
                  </select>
                  <span v-else :class="['text-xs font-semibold px-2.5 py-1 rounded-full', getRoleBadgeClass(member.role)]">
                    {{ getRoleLabel(member.role) }}
                  </span>
                </td>
                <td v-if="currentUserRole === 'COMPANY_ADMIN'" class="px-6 py-4 text-right">
                  <button
                    v-if="member.role !== 'COMPANY_ADMIN'"
                    @click="emit('removeMember', member.id)"
                    class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Gỡ thành viên"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Section 2: Invitations -->
    <div v-if="invitations.length > 0" class="space-y-4 pt-4">
      <h4 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">Lời mời đang chờ ({{ invitations.length }})</h4>
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden border-dashed">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50/50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày mời</th>
                <th v-if="currentUserRole === 'COMPANY_ADMIN'" class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 divide-dashed">
              <tr v-for="invite in invitations" :key="invite.id" class="hover:bg-gray-50/50 transition-colors italic">
                <td class="px-6 py-4 text-sm text-gray-600">{{ invite.email }}</td>
                <td class="px-6 py-4">
                  <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full opacity-60', getRoleBadgeClass(invite.role)]">
                    {{ getRoleLabel(invite.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ new Date(invite.invitedAt).toLocaleDateString('vi-VN') }}
                </td>
                <td v-if="currentUserRole === 'COMPANY_ADMIN'" class="px-6 py-4 text-right">
                  <button
                    @click="emit('revokeInvitation', invite.id)"
                    class="text-xs font-bold text-red-500 hover:text-red-700 underline transition-colors"
                  >
                    Thu hồi
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <div v-if="isInviteModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h4 class="text-lg font-bold text-gray-800">Mời thành viên mới</h4>
          <button @click="isInviteModalOpen = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">Email người nhận <span class="text-red-500">*</span></label>
            <input
              v-model="inviteForm.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] outline-none"
              placeholder="nhan-vien@congty.com"
            />
          </div>
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">Vai trò trong hệ thống <span class="text-red-500">*</span></label>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                @click="inviteForm.role = 'HR'"
                :class="['p-3 rounded-lg border text-sm font-semibold transition-all text-center', inviteForm.role === 'HR' ? 'border-[#009898] bg-[#009898]/5 text-[#009898]' : 'border-gray-200 text-gray-600 hover:border-gray-300']"
              >
                Nhân sự (HR)
              </button>
              <button
                type="button"
                @click="inviteForm.role = 'INTERVIEWER'"
                :class="['p-3 rounded-lg border text-sm font-semibold transition-all text-center', inviteForm.role === 'INTERVIEWER' ? 'border-[#009898] bg-[#009898]/5 text-[#009898]' : 'border-gray-200 text-gray-600 hover:border-gray-300']"
              >
                Phỏng vấn
              </button>
            </div>
          </div>
          <p class="text-xs text-gray-500 italic">
            * Lời mời sẽ được gửi qua email. Thành viên cần đăng ký tài khoản để tham gia.
          </p>
        </div>
        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button @click="isInviteModalOpen = false" class="px-4 py-2 text-gray-600 font-semibold hover:text-gray-800">Hủy</button>
          <button
            @click="handleInvite"
            :disabled="!inviteForm.email || isSaving"
            class="px-6 py-2 bg-[#009898] hover:bg-[#007a7a] text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
          >
            {{ isSaving ? 'Đang gửi...' : 'Gửi lời mời' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
