<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import type { AdminUserResponse, UserRequest } from '@/types/user'

const admin = useAdminStore()

// ── Pagination ──
const currentPage = ref(0)
const pageSize = 20

// ── Modals ──
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const showDeleteConfirm = ref(false)
const targetUser = ref<AdminUserResponse | null>(null)

// ── Form ──
const form = ref<UserRequest>({
 fullName: '',
 email: '',
 phone: '',
 location: '',
 dob: '',
 gender: '',
})

function resetForm(): void {
 form.value = { fullName: '', email: '', phone: '', location: '', dob: '', gender: '' }
}

// ── Create ──
function openCreate(): void {
 resetForm()
 showCreateModal.value = true
}

async function submitCreate(): Promise<void> {
 const success = await admin.createUser(form.value)
 if (success) {
 showCreateModal.value = false
 await admin.fetchUsers(currentPage.value, pageSize)
 }
}

// ── Edit ──
function openEdit(user: AdminUserResponse): void {
 targetUser.value = user
 form.value = {
 fullName: user.fullName,
 email: user.email,
 phone: user.phone ?? '',
 location: user.location ?? '',
 dob: user.dob ?? '',
 gender: user.gender ?? '',
 }
 showEditModal.value = true
}

async function submitEdit(): Promise<void> {
 if (!targetUser.value) return
 const success = await admin.updateUser(targetUser.value.id, form.value)
 if (success) {
 showEditModal.value = false
 await admin.fetchUsers(currentPage.value, pageSize)
 }
}

// ── Detail ──
function openDetail(user: AdminUserResponse): void {
 targetUser.value = user
 showDetailModal.value = true
}

// ── Delete ──
function confirmDelete(user: AdminUserResponse): void {
 targetUser.value = user
 showDeleteConfirm.value = true
}

async function submitDelete(): Promise<void> {
 if (!targetUser.value) return
 const success = await admin.deleteUser(targetUser.value.id)
 if (success) {
 showDeleteConfirm.value = false
 await admin.fetchUsers(currentPage.value, pageSize)
 }
}

// ── Pagination ──
function goToPage(page: number): void {
 currentPage.value = page
 admin.fetchUsers(page, pageSize)
}

// ── Helpers ──
function formatDate(dateStr: string | null): string {
 if (!dateStr) return '—'
 return new Date(dateStr).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })
}

function getRoleBadgeClass(role: string): string {
 switch (role) {
 case 'SYSTEM_ADMIN': return 'bg-amber-50 text-amber-700 border-amber-200 '
 case 'COMPANY_ADMIN': return 'bg-blue-50 text-blue-700 border-blue-200 '
 case 'HR': return 'bg-indigo-50 text-indigo-700 border-indigo-200 '
 case 'INTERVIEWER': return 'bg-purple-50 text-purple-700 border-purple-200 '
 case 'CANDIDATE': return 'bg-emerald-50 text-emerald-700 border-emerald-200 '
 case 'CUSTOMER_SERVICE': return 'bg-pink-50 text-pink-700 border-pink-200 '
 default: return 'bg-slate-50 text-slate-700 border-slate-200 '
 }
}

function getStatusIndicator(user: AdminUserResponse): { text: string; cls: string } {
 if (user.isLocked) return { text: 'Locked', cls: 'bg-rose-50 text-rose-600 border-rose-200 ' }
 if (!user.isActive) return { text: 'Inactive', cls: 'bg-slate-50 text-slate-600 border-slate-200 ' }
 return { text: 'Active', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200 ' }
}

const totalPages = computed(() => admin.users?.totalPages ?? 0)

onMounted(() => {
 admin.fetchUsers(0, pageSize)
})
</script>

<template>
 <div class="max-w-6xl mx-auto px-6 py-10">
 <!-- Header -->
 <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
 <div>
 <h1 class="text-2xl font-extrabold text-slate-900 ">User Management</h1>
 <p class="text-sm font-medium text-slate-500 mt-1">
 Showing {{ admin.users?.totalElements ?? 0 }} active accounts on the platform
 </p>
 </div>
 <button class="btn-primary py-3 px-6 flex items-center justify-center gap-2" @click="openCreate">
 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
 Add User
 </button>
 </div>

 <!-- Loading -->
 <div v-if="admin.loading && !admin.users" class="py-24 flex flex-col items-center justify-center text-center">
 <div class="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
 <p class="text-sm font-bold text-slate-500">Loading data…</p>
 </div>

 <!-- Empty -->
 <div v-else-if="admin.users && admin.users.empty" class="premium-card p-16 text-center">
 <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-3xl mx-auto mb-4">
 👥
 </div>
 <h2 class="text-lg font-bold text-slate-900 mb-2">No Data Available</h2>
 <p class="text-sm font-medium text-slate-500">No users found on the system.</p>
 </div>

 <!-- Table -->
 <template v-else-if="admin.users">
 <div class="premium-card overflow-hidden">
 <div class="overflow-x-auto">
 <table class="w-full text-left border-collapse whitespace-nowrap">
 <thead>
 <tr class="bg-slate-50/50 border-b border-slate-200 ">
 <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">User</th>
 <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">Email</th>
 <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">Role</th>
 <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">Status</th>
 <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">Last Login</th>
 <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-center">Actions</th>
 </tr>
 </thead>
 <tbody>
 <tr v-for="user in admin.userList" :key="user.id" class="border-b border-slate-100 hover:bg-slate-50 :bg-slate-800/50 transition-colors group">
 <td class="px-6 py-4">
 <div class="flex items-center gap-3">
 <div class="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
 <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.fullName" class="w-full h-full object-cover" />
 <span v-else class="text-xs font-bold text-slate-400">{{ user.fullName?.charAt(0)?.toUpperCase() ?? '?' }}</span>
 </div>
 <span class="text-sm font-bold text-slate-900 ">{{ user.fullName }}</span>
 </div>
 </td>
 <td class="px-6 py-4 text-xs font-medium text-slate-500">{{ user.email }}</td>
 <td class="px-6 py-4">
 <div class="flex gap-1.5 min-w-0 flex-wrap max-w-[200px]">
 <span v-for="role in user.roles" :key="role" :class="['inline-flex items-center px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide rounded-md border', getRoleBadgeClass(role)]">
 {{ role.replace('_', ' ') }}
 </span>
 </div>
 </td>
 <td class="px-6 py-4">
 <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border', getStatusIndicator(user).cls]">
 <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
 {{ getStatusIndicator(user).text }}
 </span>
 </td>
 <td class="px-6 py-4 text-xs font-medium text-slate-500">{{ formatDate(user.lastLoginAt) }}</td>
 <td class="px-6 py-4">
 <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
 <button class="p-2 text-slate-400 hover:text-teal-600 transition-colors rounded-lg hover:bg-teal-50 :bg-teal-500/10" title="View" aria-label="View" @click="openDetail(user)">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
 </button>
 <button class="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 :bg-blue-500/10" title="Edit" aria-label="Edit" @click="openEdit(user)">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
 </button>
 <button class="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50 :bg-rose-500/10" title="Delete" aria-label="Delete" @click="confirmDelete(user)">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
 </button>
 </div>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 <!-- Pagination -->
 <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 ">
 <span class="text-sm font-bold text-slate-500 order-2 sm:order-1">
 Page {{ currentPage + 1 }} / {{ totalPages }} <span class="mx-1 text-slate-300 ">·</span> Total accounts: {{ admin.users.totalElements }}
 </span>
 <div class="flex items-center gap-2 order-1 sm:order-2">
 <button class="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 :bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" :disabled="admin.users.first" @click="goToPage(currentPage - 1)">
 &larr; Previous Page
 </button>
 <button class="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 :bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" :disabled="admin.users.last" @click="goToPage(currentPage + 1)">
 Next Page &rarr;
 </button>
 </div>
 </div>
 </template>

 <!-- ═══ Create Modal ═══ -->
 <Teleport to="body">
 <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center">
 <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showCreateModal = false"></div>
 <div class="relative premium-card w-full max-w-lg p-6 sm:p-8 animate-slide-up mx-4 shadow-2xl overflow-y-auto max-h-[90vh]">
 <div class="flex items-center justify-between mb-6">
 <h2 class="text-xl font-extrabold text-slate-900 ">Add New User</h2>
 <button class="text-slate-400 hover:text-slate-600 transition-colors" @click="showCreateModal = false">
 <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
 </button>
 </div>
 <form @submit.prevent="submitCreate" class="space-y-5">
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">Full Name <span class="text-rose-500">*</span></label>
 <input v-model="form.fullName" type="text" required maxlength="255" placeholder="Enter full name" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium" />
 </div>
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
 <input v-model="form.email" type="email" maxlength="255" placeholder="Enter email address" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium" />
 </div>
 <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
 <input v-model="form.phone" type="text" maxlength="20" placeholder="e.g. +84..." class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium" />
 </div>
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">Gender</label>
 <select v-model="form.gender" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium appearance-none">
 <option value="">— Select —</option>
 <option value="MALE">Male</option>
 <option value="FEMALE">Female</option>
 <option value="OTHER">Other</option>
 </select>
 </div>
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">Date of Birth</label>
 <input v-model="form.dob" type="date" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium" />
 </div>
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">Address</label>
 <input v-model="form.location" type="text" maxlength="255" placeholder="City, Country" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium" />
 </div>
 </div>
 <div class="flex justify-end gap-3 pt-6 border-t border-slate-100 ">
 <button type="button" class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 :bg-slate-700 transition-colors" @click="showCreateModal = false">Cancel</button>
 <button type="submit" class="btn-primary py-2.5 px-6 min-w-[120px] flex justify-center items-center gap-2" :disabled="admin.userLoading || !form.fullName">
 <span v-if="admin.userLoading" class="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
 {{ admin.userLoading ? 'Creating…' : 'Add User' }}
 </button>
 </div>
 </form>
 </div>
 </div>
 </Teleport>

 <!-- ═══ Edit Modal ═══ -->
 <Teleport to="body">
 <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center">
 <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showEditModal = false"></div>
 <div class="relative premium-card w-full max-w-lg p-6 sm:p-8 animate-slide-up mx-4 shadow-2xl overflow-y-auto max-h-[90vh]">
 <div class="flex items-center justify-between mb-6">
 <h2 class="text-xl font-extrabold text-slate-900 ">Edit User</h2>
 <button class="text-slate-400 hover:text-slate-600 transition-colors" @click="showEditModal = false">
 <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
 </button>
 </div>
 <form @submit.prevent="submitEdit" class="space-y-5">
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">Full Name <span class="text-rose-500">*</span></label>
 <input v-model="form.fullName" type="text" required maxlength="255" placeholder="Enter full name" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium" />
 </div>
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
 <input v-model="form.email" type="email" maxlength="255" placeholder="Enter email address" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium" />
 </div>
 <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">Phone Number</label>
 <input v-model="form.phone" type="text" maxlength="20" placeholder="e.g. +84 ..." class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium" />
 </div>
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">Gender</label>
 <select v-model="form.gender" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium appearance-none">
 <option value="">— Select —</option>
 <option value="MALE">Male</option>
 <option value="FEMALE">Female</option>
 <option value="OTHER">Other</option>
 </select>
 </div>
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">Date of Birth</label>
 <input v-model="form.dob" type="date" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium" />
 </div>
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">Address</label>
 <input v-model="form.location" type="text" maxlength="255" placeholder="City, Country" class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium" />
 </div>
 </div>
 <div class="flex justify-end gap-3 pt-6 border-t border-slate-100 ">
 <button type="button" class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 :bg-slate-700 transition-colors" @click="showEditModal = false">Cancel</button>
 <button type="submit" class="btn-primary py-2.5 px-6 min-w-[120px] flex justify-center items-center gap-2" :disabled="admin.userLoading || !form.fullName">
 <span v-if="admin.userLoading" class="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
 {{ admin.userLoading ? 'Saving…' : 'Save Changes' }}
 </button>
 </div>
 </form>
 </div>
 </div>
 </Teleport>

 <!-- ═══ Detail Modal ═══ -->
 <Teleport to="body">
 <div v-if="showDetailModal && targetUser" class="fixed inset-0 z-50 flex items-center justify-center">
 <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showDetailModal = false"></div>
 <div class="relative premium-card w-full max-w-2xl p-6 sm:p-8 animate-slide-up mx-4 shadow-2xl overflow-y-auto max-h-[90vh]">
 <div class="flex items-center justify-between mb-6">
 <h2 class="text-xl font-extrabold text-slate-900 ">User Details</h2>
 <button class="text-slate-400 hover:text-slate-600 transition-colors" @click="showDetailModal = false">
 <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
 </button>
 </div>
 <div class="space-y-6">
 <!-- Profile Header -->
 <div class="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 ">
 <div class="w-20 h-20 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border-4 border-white shadow-sm">
 <img v-if="targetUser.avatarUrl" :src="targetUser.avatarUrl" :alt="targetUser.fullName" class="w-full h-full object-cover" />
 <span v-else class="text-2xl font-bold text-slate-400">{{ targetUser.fullName?.charAt(0)?.toUpperCase() ?? '?' }}</span>
 </div>
 <div class="text-center sm:text-left">
 <h3 class="text-xl font-extrabold text-slate-900 ">{{ targetUser.fullName }}</h3>
 <p class="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block mt-1">{{ targetUser.email }}</p>
 <div class="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-2">
 <span v-for="role in targetUser.roles" :key="role" :class="['inline-flex items-center px-2 py-0.5 text-xs font-bold rounded-md border', getRoleBadgeClass(role)]">
 {{ role.replace('_', ' ') }}
 </span>
 </div>
 </div>
 </div>

 <!-- Detail Grid -->
 <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
 <div class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</span>
 <div class="font-medium text-slate-900 ">
 <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border uppercase', getStatusIndicator(targetUser).cls]">
 <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
 {{ getStatusIndicator(targetUser).text }}
 </span>
 </div>
 </div>
 <div class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</span>
 <span class="font-medium text-slate-900 ">{{ targetUser.phone ?? '—' }}</span>
 </div>
 <div class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</span>
 <span class="font-medium text-slate-900 ">{{ targetUser.location ?? '—' }}</span>
 </div>
 <div class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</span>
 <span class="font-medium text-slate-900 ">{{ targetUser.gender ?? '—' }}</span>
 </div>
 <div class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</span>
 <span class="font-medium text-slate-900 ">{{ targetUser.dob ?? '—' }}</span>
 </div>
 <div class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company ID</span>
 <span class="font-medium text-slate-900 font-mono text-xs">{{ targetUser.companyId ?? '—' }}</span>
 </div>
 <div class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Failed Auth Attempts</span>
 <span class="font-medium text-slate-900 ">{{ targetUser.failedAttempts }}</span>
 </div>
 <div class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Locked Until</span>
 <span class="font-medium text-slate-900 ">{{ formatDate(targetUser.lockUntil) }}</span>
 </div>
 <div class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Last Login</span>
 <span class="font-medium text-slate-900 ">{{ formatDate(targetUser.lastLoginAt) }}</span>
 </div>
 <div class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registration Date</span>
 <span class="font-medium text-slate-900 ">{{ formatDate(targetUser.createdAt) }}</span>
 </div>
 </div>
 
 <div v-if="targetUser.linkedinUrl || targetUser.githubUrl || targetUser.portfolioUrl" class="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div v-if="targetUser.linkedinUrl" class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">LinkedIn</span>
 <a :href="targetUser.linkedinUrl" target="_blank" rel="noopener" class="text-teal-600 hover:text-teal-500 font-medium truncate">{{ targetUser.linkedinUrl }}</a>
 </div>
 <div v-if="targetUser.githubUrl" class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">GitHub</span>
 <a :href="targetUser.githubUrl" target="_blank" rel="noopener" class="text-teal-600 hover:text-teal-500 font-medium truncate">{{ targetUser.githubUrl }}</a>
 </div>
 <div v-if="targetUser.portfolioUrl" class="flex flex-col">
 <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Portfolio</span>
 <a :href="targetUser.portfolioUrl" target="_blank" rel="noopener" class="text-teal-600 hover:text-teal-500 font-medium truncate">{{ targetUser.portfolioUrl }}</a>
 </div>
 </div>
 </div>
 <div class="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100 ">
 <button class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 :bg-slate-700 transition-colors" @click="showDetailModal = false">Close</button>
 <button class="btn-primary py-2.5 px-6" @click="showDetailModal = false; openEdit(targetUser!)">Edit</button>
 </div>
 </div>
 </div>
 </Teleport>

 <!-- ═══ Delete Confirmation ═══ -->
 <Teleport to="body">
 <div v-if="showDeleteConfirm && targetUser" class="fixed inset-0 z-50 flex items-center justify-center">
 <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showDeleteConfirm = false"></div>
 <div class="relative premium-card w-full max-w-sm p-6 sm:p-8 animate-slide-up mx-4 shadow-2xl">
 <div class="text-center">
 <div class="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
 <svg class="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
 </div>
 <h2 class="text-xl font-extrabold text-slate-900 mb-2">Confirm Delete User</h2>
 <p class="text-sm font-medium text-slate-500">
 Are you sure you want to delete <strong>{{ targetUser.fullName }}</strong>? This action cannot be undone.
 </p>
 </div>
 <div class="flex justify-end gap-3 mt-8">
 <button class="flex-1 px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 :bg-slate-700 transition-colors" @click="showDeleteConfirm = false">Cancel</button>
 <button class="flex-1 btn-primary bg-rose-600 hover:bg-rose-700 shadow-rose-500/30 flex items-center justify-center" :disabled="admin.userLoading" @click="submitDelete">
 <span v-if="admin.userLoading" class="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin mr-2"></span>
 {{ admin.userLoading ? 'Deleting…' : 'Confirm Delete' }}
 </button>
 </div>
 </div>
 </div>
 </Teleport>
 </div>
</template>


