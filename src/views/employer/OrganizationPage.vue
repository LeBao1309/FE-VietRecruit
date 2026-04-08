<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { departmentService, locationService, categoryService } from '@/services/organizationService'
import { companyService } from '@/services/companyService'
import type { DepartmentResponse } from '@/types/organization'
import type { LocationResponse } from '@/types/organization'
import type { CategoryResponse } from '@/types/organization'
import type { CompanyResponse } from '@/types/company'

const ui = useUiStore()

// ── Active tab ──
type Tab = 'profile' | 'departments' | 'locations' | 'categories'
const activeTab = ref<Tab>('profile')

// ── Data ──
const departments = ref<DepartmentResponse[]>([])
const locations = ref<LocationResponse[]>([])
const categories = ref<CategoryResponse[]>([])
const loading = ref(true)

// ── Company profile ──
const company = ref<CompanyResponse | null>(null)
const companyForm = ref({ name: '', domain: '', website: '' })
const companyFormErrors = ref<Record<string, string>>({})
const companySaving = ref(false)
const companyLoading = ref(false)

// ── Modal ──
const showModal = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const modalSaving = ref(false)
const editId = ref<string | null>(null)

const formName = ref('')
const formExtra = ref('') // description for dept, address for location
const formErrors = ref<Record<string, string>>({})

// ── Delete confirmation ──
const showDeleteConfirm = ref(false)
const deleteTarget = ref<{ id: string; name: string } | null>(null)
const deleting = ref(false)

// ── Load data ──
async function loadAll(): Promise<void> {
 loading.value = true
 try {
 const [depts, locs, cats] = await Promise.all([
 departmentService.list(),
 locationService.list(),
 categoryService.list(),
 ])
 if (depts.data) departments.value = depts.data.content
 if (locs.data) locations.value = locs.data.content
 if (cats.data) categories.value = cats.data.content
 } finally {
 loading.value = false
 }
}

async function loadCompany(): Promise<void> {
 companyLoading.value = true
 try {
 const result = await companyService.getCompany()
 if (result.data) {
 company.value = result.data
 companyForm.value = {
 name: result.data.name,
 domain: result.data.domain ?? '',
 website: result.data.website ?? '',
 }
 }
 } finally {
 companyLoading.value = false
 }
}

function validateCompanyForm(): boolean {
 companyFormErrors.value = {}
 if (!companyForm.value.name.trim()) {
 companyFormErrors.value.name = 'Tên công ty là bắt buộc.'
 } else if (companyForm.value.name.length > 255) {
 companyFormErrors.value.name = 'Tên công ty không dài quá 255 ký tự.'
 }
 if (companyForm.value.website && !/^https?:\/\/.+/.test(companyForm.value.website)) {
 companyFormErrors.value.website = 'Vui lòng nhập URL hợp lệ (https://...).'
 }
 return Object.keys(companyFormErrors.value).length === 0
}

async function saveCompanyProfile(): Promise<void> {
 if (!validateCompanyForm()) return
 companySaving.value = true
 try {
 const result = await companyService.updateCompany({
 name: companyForm.value.name.trim(),
 domain: companyForm.value.domain.trim() || undefined,
 website: companyForm.value.website.trim() || undefined,
 })
 if (result.error) {
 ui.toastError('Cập nhật thất bại', result.error.message)
 return
 }
 company.value = result.data!
 ui.toastSuccess('Đã cập nhật', 'Thông tin công ty đã được lưu.')
 } finally {
 companySaving.value = false
 }
}

// ── Modal helpers ──
function openCreate(): void {
 modalMode.value = 'create'
 editId.value = null
 formName.value = ''
 formExtra.value = ''
 formErrors.value = {}
 showModal.value = true
}

function openEdit(item: { id: string; name: string; description?: string | null; address?: string | null }): void {
 modalMode.value = 'edit'
 editId.value = item.id
 formName.value = item.name
 formExtra.value = (item.description ?? item.address) || ''
 formErrors.value = {}
 showModal.value = true
}

function closeModal(): void {
 showModal.value = false
}

function validate(): boolean {
 formErrors.value = {}
 if (!formName.value.trim()) {
 formErrors.value.name = 'Tên không được bỏ trống.'
 } else if (formName.value.length > 255) {
 formErrors.value.name = 'Tên không dài quá 255 ký tự.'
 }
 return Object.keys(formErrors.value).length === 0
}

async function handleSave(): Promise<void> {
 if (!validate()) return
 modalSaving.value = true
 try {
 const tab = activeTab.value

 if (tab === 'departments') {
 const body = { name: formName.value.trim(), description: formExtra.value.trim() || undefined }
 const result = modalMode.value === 'create'
 ? await departmentService.create(body)
 : await departmentService.update(editId.value!, body)
 if (result.error) { ui.toastError('Xảy ra lỗi', result.error.message); return }
 ui.toastSuccess(modalMode.value === 'create' ? 'Đã tạo xong' : 'Đã cập nhật')
 } else if (tab === 'locations') {
 const body = { name: formName.value.trim(), address: formExtra.value.trim() || undefined }
 const result = modalMode.value === 'create'
 ? await locationService.create(body)
 : await locationService.update(editId.value!, body)
 if (result.error) { ui.toastError('Xảy ra lỗi', result.error.message); return }
 ui.toastSuccess(modalMode.value === 'create' ? 'Đã tạo xong' : 'Đã cập nhật')
 } else {
 const body = { name: formName.value.trim() }
 const result = modalMode.value === 'create'
 ? await categoryService.create(body)
 : await categoryService.update(editId.value!, body)
 if (result.error) { ui.toastError('Xảy ra lỗi', result.error.message); return }
 ui.toastSuccess(modalMode.value === 'create' ? 'Đã tạo xong' : 'Đã cập nhật')
 }

 closeModal()
 await loadAll()
 } finally {
 modalSaving.value = false
 }
}

// ── Delete ──
function confirmDelete(item: { id: string; name: string }): void {
 deleteTarget.value = item
 showDeleteConfirm.value = true
}

async function handleDelete(): Promise<void> {
 if (!deleteTarget.value) return
 deleting.value = true
 try {
 const tab = activeTab.value
 const id = deleteTarget.value.id

 const result = tab === 'departments'
 ? await departmentService.delete(id)
 : tab === 'locations'
 ? await locationService.delete(id)
 : await categoryService.delete(id)

 if (result.error) {
 ui.toastError('Xóa Thất Bại', result.error.message)
 return
 }
 ui.toastSuccess('Xóa Xong', `${deleteTarget.value.name} đã được dọn khỏi hệ thống.`)
 showDeleteConfirm.value = false
 deleteTarget.value = null
 await loadAll()
 } finally {
 deleting.value = false
 }
}

const tabLabel: Record<Tab, string> = {
 profile: 'Hồ Sơ',
 departments: 'Phòng Ban',
 locations: 'Địa Điểm',
 categories: 'Danh Mục',
}

const extraLabel: Record<Exclude<Tab, 'profile'>, string | null> = {
 departments: 'Mô Tả',
 locations: 'Địa Chỉ',
 categories: null,
}

onMounted(() => {
 loadCompany()
 loadAll()
})
</script>

<template>
 <div class="max-w-4xl mx-auto px-6 pb-8">
 <div class="flex items-center justify-between mb-6">
 <div>
 <h1 class="text-xl font-bold text-gray-900">Doanh Nghiệp</h1>
 <p class="text-sm text-gray-500 mt-1">Quản trị thông tin công ty, phòng ban, địa chỉ và lĩnh vực tuyển</p>
 </div>
 <button
 v-if="activeTab !== 'profile'"
 @click="openCreate"
 class="btn-primary"
 >
 <span class="text-lg leading-none">+</span> Tạo {{ tabLabel[activeTab] }}
 </button>
 </div>

 <!-- Tabs -->
 <div class="flex gap-1 border-b border-border mb-6">
 <button
 v-for="tab in (['profile', 'departments', 'locations', 'categories'] as Tab[])"
 :key="tab"
 @click="activeTab = tab"
 class="px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px"
 :class="activeTab === tab
 ? 'text-primary border-primary'
 : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'"
 >
 {{ tabLabel[tab] }}
 <span v-if="tab !== 'profile'" class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
 :class="activeTab === tab ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-400'">
 {{ tab === 'departments' ? departments.length : tab === 'locations' ? locations.length : categories.length }}
 </span>
 </button>
 </div>

 <!-- ─── Profile Tab ─── -->
 <div v-if="activeTab === 'profile'">
 <div v-if="companyLoading" class="premium-card p-6 animate-pulse space-y-4">
 <div v-for="i in 3" :key="i" class="h-12 bg-slate-100 rounded-lg" />
 </div>
 <div v-else class="premium-card p-8">
 <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">Thông Tin Công Ty</h2>
 <form @submit.prevent="saveCompanyProfile" class="space-y-5 max-w-lg">
 <!-- Name -->
 <div>
 <label for="cp-name" class="block text-sm font-medium text-slate-700 mb-1.5">
 Tên công ty <span class="text-rose-500">*</span>
 </label>
 <input
 id="cp-name"
 v-model="companyForm.name"
 type="text"
 placeholder="Acme Corporation"
 class="w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition"
 :class="companyFormErrors.name ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'"
 />
 <p v-if="companyFormErrors.name" class="text-xs text-rose-500 mt-1">{{ companyFormErrors.name }}</p>
 </div>

 <!-- Domain -->
 <div>
 <label for="cp-domain" class="block text-sm font-medium text-slate-700 mb-1.5">Ngành nghề / Lĩnh vực</label>
 <input
 id="cp-domain"
 v-model="companyForm.domain"
 type="text"
 placeholder="VD: Công nghệ, Y tế, Tài chính"
 class="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
 />
 </div>

 <!-- Website -->
 <div>
 <label for="cp-website" class="block text-sm font-medium text-slate-700 mb-1.5">Website công ty</label>
 <input
 id="cp-website"
 v-model="companyForm.website"
 type="text"
 placeholder="https://www.example.com"
 class="w-full px-4 py-2.5 text-sm border rounded-xl outline-none transition"
 :class="companyFormErrors.website ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'"
 />
 <p v-if="companyFormErrors.website" class="text-xs text-rose-500 mt-1">{{ companyFormErrors.website }}</p>
 </div>

 <!-- Meta -->
 <div v-if="company" class="pt-2 border-t border-slate-100 text-xs text-slate-400 space-y-1">
 <p>Tạo lúc: {{ company.createdAt ? new Date(company.createdAt).toLocaleString('vi-VN') : '—' }}</p>
 <p>Cập nhật lần cuối: {{ company.updatedAt ? new Date(company.updatedAt).toLocaleString('vi-VN') : '—' }}</p>
 </div>

 <div class="flex justify-end pt-2">
 <button
 type="submit"
 :disabled="companySaving"
 class="btn-primary"
 >
 <span v-if="companySaving" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ companySaving ? 'Đang lưu…' : 'Lưu Thay Đổi' }}
 </button>
 </div>
 </form>
 </div>
 </div>

 <!-- Loading -->
 <div v-if="activeTab !== 'profile' && loading" class="premium-card p-6 animate-pulse space-y-4">
 <div v-for="i in 4" :key="i" class="h-12 bg-slate-100 rounded-lg" />
 </div>

 <!-- Table -->
 <div v-else-if="activeTab !== 'profile'" class="premium-card overflow-hidden">
 <!-- Departments -->
 <table v-if="activeTab === 'departments'" class="w-full">
 <thead>
 <tr class="border-b border-slate-200 bg-slate-50 ">
 <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Tên</th>
 <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Giới Thiệu</th>
 <th class="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 w-32">Thao Tác</th>
 </tr>
 </thead>
 <tbody>
 <tr v-if="departments.length === 0">
 <td colspan="3" class="text-center text-sm text-slate-400 py-16">
 Chưa khai báo Phòng Ban nào. Mời bạn tiến hành tạo.
 </td>
 </tr>
 <tr v-for="dept in departments" :key="dept.id" class="border-b border-slate-100 last:border-0 hover:bg-slate-50 :bg-slate-800/50 transition-colors">
 <td class="px-6 py-4 text-sm font-bold text-slate-900 ">{{ dept.name }}</td>
 <td class="px-6 py-4 text-sm font-medium text-slate-500">{{ dept.description ?? '—' }}</td>
 <td class="px-6 py-4 text-right">
 <button @click="openEdit(dept)" class="text-xs text-teal-600 hover:text-teal-700 mr-4 font-bold uppercase tracking-wider">Sửa</button>
 <button @click="confirmDelete(dept)" class="text-xs text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider">Xóa</button>
 </td>
 </tr>
 </tbody>
 </table>

 <!-- Locations -->
 <table v-if="activeTab === 'locations'" class="w-full">
 <thead>
 <tr class="border-b border-slate-200 bg-slate-50 ">
 <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Tên</th>
 <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Địa Chỉ</th>
 <th class="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 w-32">Thao Tác</th>
 </tr>
 </thead>
 <tbody>
 <tr v-if="locations.length === 0">
 <td colspan="3" class="text-center text-sm text-slate-400 py-16">
 Chưa cấu hình địa chỉ nào. Xin vui lòng tạo mới.
 </td>
 </tr>
 <tr v-for="loc in locations" :key="loc.id" class="border-b border-slate-100 last:border-0 hover:bg-slate-50 :bg-slate-800/50 transition-colors">
 <td class="px-6 py-4 text-sm font-bold text-slate-900 ">{{ loc.name }}</td>
 <td class="px-6 py-4 text-sm font-medium text-slate-500">{{ loc.address ?? '—' }}</td>
 <td class="px-6 py-4 text-right">
 <button @click="openEdit(loc)" class="text-xs text-teal-600 hover:text-teal-700 mr-4 font-bold uppercase tracking-wider">Sửa</button>
 <button @click="confirmDelete(loc)" class="text-xs text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider">Xóa</button>
 </td>
 </tr>
 </tbody>
 </table>

 <!-- Categories -->
 <table v-if="activeTab === 'categories'" class="w-full">
 <thead>
 <tr class="border-b border-slate-200 bg-slate-50 ">
 <th class="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Tên</th>
 <th class="text-right text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4 w-32">Thao Tác</th>
 </tr>
 </thead>
 <tbody>
 <tr v-if="categories.length === 0">
 <td colspan="2" class="text-center text-sm text-slate-400 py-16">
 Vẫn chưa có cấu hình ngành nghề / kỹ năng nào. Vui lòng cập nhật.
 </td>
 </tr>
 <tr v-for="cat in categories" :key="cat.id" class="border-b border-slate-100 last:border-0 hover:bg-slate-50 :bg-slate-800/50 transition-colors">
 <td class="px-6 py-4 text-sm font-bold text-slate-900 ">{{ cat.name }}</td>
 <td class="px-6 py-4 text-right">
 <button @click="openEdit({ id: cat.id, name: cat.name })" class="text-xs text-teal-600 hover:text-teal-700 mr-4 font-bold uppercase tracking-wider">Sửa</button>
 <button @click="confirmDelete(cat)" class="text-xs text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider">Xóa</button>
 </td>
 </tr>
 </tbody>
 </table>
 </div>

 <!-- Create/Edit Modal -->
 <Teleport to="body">
 <div v-if="showModal" class="premium-modal-backdrop" @click.self="closeModal">
 <div class="premium-modal-content w-full max-w-md">
 <!-- header -->
 <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
 <h2 class="text-lg font-bold text-slate-900">
 {{ modalMode === 'create' ? `Tạo ${tabLabel[activeTab]}` : `Chỉnh sửa ${tabLabel[activeTab]}` }}
 </h2>
 <button type="button" @click="closeModal" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
 <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
 <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 <!-- body -->
 <form @submit.prevent="handleSave" class="px-6 py-5 space-y-5">
 <div>
 <label for="org-name" class="block text-sm font-bold text-slate-700 mb-1">Tên <span class="text-rose-500">*</span></label>
 <input
 id="org-name"
 v-model="formName"
 type="text"
 placeholder="Nhập tên..."
 class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition"
 :class="formErrors.name ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'"
 />
 <p v-if="formErrors.name" class="text-xs text-rose-500 mt-1">{{ formErrors.name }}</p>
 </div>

 <div v-if="activeTab !== 'profile' && extraLabel[activeTab as Exclude<Tab, 'profile'>]">
 <label for="org-extra" class="block text-sm font-bold text-slate-700 mb-1">{{ extraLabel[activeTab as Exclude<Tab, 'profile'>] }}</label>
 <input
 id="org-extra"
 v-model="formExtra"
 type="text"
 :placeholder="`Vui lòng ghi nhập ${extraLabel[activeTab as Exclude<Tab, 'profile'>]!.toLowerCase()}`"
 class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
 />
 </div>

 <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
 <button
 type="button"
 @click="closeModal"
 class="btn-secondary"
 >
 Huỷ
 </button>
 <button
 type="submit"
 :disabled="modalSaving"
 class="btn-primary"
 >
 <span v-if="modalSaving" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ modalSaving ? 'Đang lưu…' : modalMode === 'create' ? 'Tạo' : 'Lưu' }}
 </button>
 </div>
 </form>
 </div>
 </div>
 </Teleport>

 <!-- Delete Confirmation Modal -->
 <Teleport to="body">
 <div v-if="showDeleteConfirm" class="premium-modal-backdrop" @click.self="showDeleteConfirm = false">
 <div class="premium-modal-content w-full max-w-sm text-center">
 <div class="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 text-3xl font-bold mx-auto mb-5 rotate-3 shadow-sm">
 ⚠
 </div>
 <h2 class="text-xl font-extrabold text-slate-900 mb-2">Xóa {{ tabLabel[activeTab] }}?</h2>
 <p class="text-sm font-medium text-slate-500 mb-8">
 Xác nhận bạn muốn xóa <span class="text-slate-700 font-bold">{{ deleteTarget?.name }}</span>?
 Hành động này không thể hoàn tác.
 </p>
 <div class="flex justify-center gap-3">
 <button
 @click="showDeleteConfirm = false"
 class="btn-secondary"
 >
 Huỷ
 </button>
 <button
 @click="handleDelete"
 :disabled="deleting"
 class="px-6 py-2.5 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0 flex items-center gap-2"
 >
 <span v-if="deleting" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ deleting ? 'Đang xóa…' : 'Xóa' }}
 </button>
 </div>
 </div>
 </div>
 </Teleport>
 </div>
</template>
