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
 inviteErrors.value.email = 'Vui lòng cung cấp email.'
 } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.value.email)) {
 inviteErrors.value.email = 'Vui lòng nhập định dạng email hợp lệ.'
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
 ui.toastError('Mời Không Thành Công', result.error.message)
 return
 }
 sentInvites.value.unshift({
 email: inviteForm.value.email,
 role: inviteForm.value.role,
 invitationId: result.data!.invitationId,
 expiresAt: result.data!.expiresAt,
 sentAt: new Date().toISOString(),
 })
 ui.toastSuccess('Gửi Lời Mời Về Mail', `Đã gửi lời mời thành công đến ${inviteForm.value.email}`)
 closeInviteModal()
 } finally {
 inviteLoading.value = false
 }
}

function formatDate(iso: string): string {
 return new Date(iso).toLocaleDateString('vi-VN', {
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
 <h1 class="text-xl font-bold text-gray-900">Nhân Sự & Đội Ngũ</h1>
 <p class="text-sm text-gray-500 mt-1">Mời thêm Quản lý tuyển dụng và Người phỏng vấn vào nền tảng</p>
 </div>
 <button
 @click="openInviteModal"
 class="btn-primary"
 >
 <span class="text-lg leading-none">+</span> Mời Đồng Nghiệp
 </button>
 </div>

 <!-- Info callout -->
 <div class="bg-teal-50 border border-teal-200 rounded-xl p-5 mb-8">
 <div class="flex gap-4">
 <span class="text-teal-600 text-xl font-bold">ℹ</span>
 <div>
 <p class="text-sm font-bold text-teal-800">Cách thức tính năng này hoạt động</p>
 <p class="text-sm text-teal-700/80 mt-1">
 Khi mời một đồng nghiệp, họ sẽ nhận được email hướng dẫn tự tạo tài khoản.
 Lời mời sẽ hết hiệu lực sau 7 ngày.
 </p>
 </div>
 </div>
 </div>

 <!-- Sent invitations table -->
 <div class="premium-card overflow-hidden">
 <div class="p-6 border-b border-slate-200">
 <h2 class="text-lg font-bold text-slate-900">Lời Mời Chờ Phản Hồi</h2>
 </div>

 <table class="w-full">
 <thead>
 <tr class="border-b border-slate-200 bg-slate-50">
 <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Email</th>
 <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Vai Trò</th>
 <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Ngày Gửi</th>
 <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Hạn Hiệu Lực</th>
 </tr>
 </thead>
 <tbody>
 <tr v-if="sentInvites.length === 0">
 <td colspan="4" class="text-center text-sm text-slate-400 py-16">
 <div class="space-y-3">
 <span class="text-4xl">👥</span>
 <p class="font-bold">Chưa có lời mời nào được gửi.</p>
 <p class="text-xs text-slate-400">Nhấn "Mời Đồng Nghiệp" để thêm thành viên vào nhóm.</p>
 </div>
 </td>
 </tr>
 <tr v-for="invite in sentInvites" :key="invite.invitationId" class="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
 <td class="px-6 py-4 text-sm font-bold text-slate-900">{{ invite.email }}</td>
 <td class="px-6 py-4">
 <span class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full" :class="roleBadgeClass(invite.role)">
 {{ invite.role }}
 </span>
 </td>
 <td class="px-6 py-4 text-sm font-medium text-slate-500">{{ formatDate(invite.sentAt) }}</td>
 <td class="px-6 py-4 text-sm font-medium text-slate-500">{{ formatDate(invite.expiresAt) }}</td>
 </tr>
 </tbody>
 </table>
 </div>

 <!-- Invite Modal -->
 <Teleport to="body">
 <div v-if="showInviteModal" class="premium-modal-backdrop" @click.self="closeInviteModal">
 <div class="premium-modal-content w-full max-w-lg">
 <!-- Modal header -->
 <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
 <h2 class="text-lg font-bold text-slate-900">Mời thành viên mới</h2>
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
 placeholder="dongnghiep@congty.vn"
 class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition"
 :class="inviteErrors.email ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'"
 />
 <p v-if="inviteErrors.email" class="text-xs text-rose-500 mt-1">{{ inviteErrors.email }}</p>
 </div>

 <!-- Role -->
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-3">Vai trò</label>
 <div class="grid grid-cols-2 gap-4">
 <button
 type="button"
 @click="inviteForm.role = 'HR'"
 class="p-4 rounded-xl text-left transition-all border-2"
 :class="inviteForm.role === 'HR'
 ? 'border-teal-500 bg-teal-50 ring-4 ring-teal-500/10'
 : 'border-slate-200 hover:border-slate-300'"
 >
 <div class="text-sm font-bold" :class="inviteForm.role === 'HR' ? 'text-teal-700' : 'text-slate-900'">Quản Lý Tuyển Dụng</div>
 <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">Quản lý tin tuyển dụng, sàng lọc hồ sơ và theo dõi quy trình ứng viên.</p>
 </button>
 <button
 type="button"
 @click="inviteForm.role = 'INTERVIEWER'"
 class="p-4 rounded-xl text-left transition-all border-2"
 :class="inviteForm.role === 'INTERVIEWER'
 ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-500/10'
 : 'border-slate-200 hover:border-slate-300'"
 >
 <div class="text-sm font-bold" :class="inviteForm.role === 'INTERVIEWER' ? 'text-purple-700' : 'text-slate-900'">Người Phỏng Vấn</div>
 <p class="text-[11px] text-slate-500 mt-1 leading-relaxed">Lên lịch phỏng vấn, gửi link cuộc họp và tổng hợp phiếu đánh giá.</p>
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
 Huỷ
 </button>
 <button
 type="submit"
 :disabled="inviteLoading"
 class="btn-primary"
 >
 <span v-if="inviteLoading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
<<<<<<< HEAD
 {{ inviteLoading ? 'Đang gửi lời mời…' : 'Gửi Lời Mời' }}
=======
 {{ inviteLoading ? 'Đang gửi…' : 'Gửi Lời Mời' }}
>>>>>>> 3315920 (style(UI): Refact language in employee)
 </button>
 </div>
 </form>
 </div>
 </div>
 </Teleport>
 </div>
</template>
