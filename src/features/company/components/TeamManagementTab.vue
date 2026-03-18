<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTeamStore } from '@/core/stores/team.store'
import { CreateInvitationRequestSchema, type Role } from '@/features/company/types/team.dto'

const store = useTeamStore()

// Strict RBAC UI guard
const isCompanyAdmin = computed(() => {
  return true // MOCK: Assume true since no auth profile store exposes it yet
})

onMounted(() => {
  store.fetchAll()
})

const showInviteModal = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<'HR' | 'INTERVIEWER'>('INTERVIEWER')
const fieldErrors = ref<{ email?: string; role?: string }>({})
const successMsg = ref('')

function openInvite() {
  inviteEmail.value = ''
  inviteRole.value = 'INTERVIEWER'
  fieldErrors.value = {}
  store.clearError()
  successMsg.value = ''
  showInviteModal.value = true
}

async function handleInvite() {
  successMsg.value = ''
  const result = CreateInvitationRequestSchema.safeParse({
    email: inviteEmail.value,
    role: inviteRole.value
  })

  if (!result.success) {
    const errs: any = {}
    for (const issue of result.error.issues) {
      if (issue.path[0]) {
        errs[String(issue.path[0])] = issue.message
      }
    }
    fieldErrors.value = errs
    return
  }

  fieldErrors.value = {}
  
  // Real endpoint returns InvitationResponse, we assume it's sent.
  // Add a fake one to Mock for UI if needed natively, but the store calls fetchAll()
  const ok = await store.sendInvitation(result.data)
  if (ok) {
    showInviteModal.value = false
    successMsg.value = `Đã gửi lời mời tới ${result.data.email}`
  }
}

async function handleUpdateRole(memberId: string, currentRole: Role, newRole: Role) {
  if (currentRole === newRole) return
  if (confirm(`Bạn muốn đổi quyền thành ${newRole}?`)) {
    await store.updateRole(memberId, newRole)
  }
}

async function handleRemoveMember(memberId: string) {
  if (confirm('Xóa thành viên này khỏi tổ chức?')) {
    await store.removeMember(memberId)
  }
}

async function handleRevokeInvitation(inviteId: string) {
  if (confirm('Thu hồi lời mời này?')) {
    await store.revokeInvitation(inviteId)
  }
}
</script>

<template>
  <div class="card space-y-6">
    <div v-if="successMsg" class="p-3 rounded-lg bg-brand-light text-brand-dark text-sm">
      {{ successMsg }}
    </div>
    <div v-if="store.error" class="p-3 rounded-lg bg-danger/10 text-danger text-sm">
      {{ store.error }}
    </div>

    <!-- MEMBERS SECTION -->
    <div>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold text-text-primary">Thành viên hiện tại</h2>
        <button 
          v-if="isCompanyAdmin" 
          class="btn-primary px-4 py-2 text-sm" 
          @click="openInvite" 
          :disabled="store.isLoading || store.isSaving"
        >
          Mời thành viên
        </button>
      </div>

      <div class="overflow-x-auto border border-surface-muted rounded-lg">
        <table class="w-full text-left text-sm text-text-secondary">
          <thead class="bg-surface-soft text-text-primary border-b border-surface-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Họ tên</th>
              <th class="px-4 py-3 font-medium">Email</th>
              <th class="px-4 py-3 font-medium">Vai trò</th>
              <th v-if="isCompanyAdmin" class="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-muted">
            <tr v-if="store.isLoading" class="animate-pulse">
              <td :colspan="isCompanyAdmin ? 4 : 3" class="px-4 py-4 text-center">Đang tải...</td>
            </tr>
            <tr v-else-if="store.members.length === 0">
              <td :colspan="isCompanyAdmin ? 4 : 3" class="px-4 py-4 text-center">Không có dữ liệu</td>
            </tr>
            <tr v-else v-for="member in store.members" :key="member.id" class="hover:bg-surface-soft/50">
              <td class="px-4 py-3">{{ member.fullName }}</td>
              <td class="px-4 py-3">{{ member.email }}</td>
              <td class="px-4 py-3">
                <select 
                  v-if="isCompanyAdmin" 
                  :value="member.role" 
                  @change="e => handleUpdateRole(member.id, member.role, (e.target as HTMLSelectElement).value as Role)"
                  class="bg-transparent border border-surface-muted rounded text-sm p-1 focus:ring-1 focus:ring-brand-primary"
                  :disabled="store.isSaving"
                >
                  <option value="COMPANY_ADMIN">COMPANY_ADMIN</option>
                  <option value="HR">HR</option>
                  <option value="INTERVIEWER">INTERVIEWER</option>
                </select>
                <span v-else class="px-2 py-1 bg-surface-muted rounded text-xs font-semibold">{{ member.role }}</span>
              </td>
              <td v-if="isCompanyAdmin" class="px-4 py-3 text-right">
                <button 
                  class="text-danger hover:underline text-sm font-medium" 
                  @click="handleRemoveMember(member.id)"
                  :disabled="store.isLoading || store.isSaving"
                >
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PENDING INVITATIONS SECTION -->
    <div v-if="isCompanyAdmin">
      <h2 class="text-lg font-semibold text-text-primary mb-4 mt-8">Lời mời đang chờ</h2>
      <div class="overflow-x-auto border border-surface-muted rounded-lg">
        <table class="w-full text-left text-sm text-text-secondary">
          <thead class="bg-surface-soft text-text-primary border-b border-surface-muted">
            <tr>
              <th class="px-4 py-3 font-medium">Email</th>
              <th class="px-4 py-3 font-medium">Vai trò</th>
              <th class="px-4 py-3 font-medium">Ngày mời</th>
              <th class="px-4 py-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-muted">
            <tr v-if="store.isLoading" class="animate-pulse">
              <td colspan="4" class="px-4 py-4 text-center">Đang tải...</td>
            </tr>
            <tr v-else-if="store.invitations.length === 0">
              <td colspan="4" class="px-4 py-4 text-center">Không có lời mời nào</td>
            </tr>
            <tr v-else v-for="inv in store.invitations" :key="inv.id" class="hover:bg-surface-soft/50">
              <td class="px-4 py-3">{{ inv.email }}</td>
              <td class="px-4 py-3"><span class="px-2 py-1 bg-surface-muted rounded text-xs font-semibold">{{ inv.role }}</span></td>
              <td class="px-4 py-3">{{ new Date(inv.invitedAt).toLocaleDateString('vi-VN') }}</td>
              <td class="px-4 py-3 text-right">
                <button 
                  class="text-danger hover:underline text-sm font-medium" 
                  @click="handleRevokeInvitation(inv.id)"
                  :disabled="store.isLoading || store.isSaving"
                >
                  Thu hồi
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- INVITE MODAL -->
    <div v-if="showInviteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div class="bg-surface-base w-full max-w-md rounded-xl p-6 shadow-xl mx-4">
        <h3 class="text-lg font-semibold text-text-primary mb-4">Gửi lời mời</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Email <span class="text-danger">*</span>
            </label>
            <input 
              v-model="inviteEmail" 
              type="email" 
              class="input w-full" 
              :class="{'!border-danger': fieldErrors.email}" 
              placeholder="nhanvien@company.com" 
            />
            <p v-if="fieldErrors.email" class="text-danger text-xs mt-1.5">{{ fieldErrors.email }}</p>
          </div>
          <div>
            <label class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Vai trò <span class="text-danger">*</span>
            </label>
            <select v-model="inviteRole" class="input w-full" :class="{'!border-danger': fieldErrors.role}">
              <option value="HR">HR</option>
              <option value="INTERVIEWER">INTERVIEWER</option>
            </select>
            <p v-if="fieldErrors.role" class="text-danger text-xs mt-1.5">{{ fieldErrors.role }}</p>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button 
            class="px-4 py-2 text-sm text-text-secondary hover:text-text-primary" 
            @click="showInviteModal = false" 
            :disabled="store.isSaving"
          >
            Hủy
          </button>
          <button 
            class="btn-primary px-4 py-2 text-sm" 
            @click="handleInvite" 
            :disabled="store.isSaving"
          >
            <span v-if="store.isSaving">Đang xử lý...</span>
            <span v-else>Gửi lời mời</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
