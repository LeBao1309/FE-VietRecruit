<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/uiStore'
import { jobService } from '@/services/jobService'
import { departmentService, locationService, categoryService } from '@/services/organizationService'
import type { JobCreateRequest, JobUpdateRequest, JobResponse } from '@/types/job'
import type { JdGenerateRequest, JdGenerateResponse } from '@/types/ai'
import type { DepartmentResponse, LocationResponse, CategoryResponse } from '@/types/organization'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

// ── Mode ──
const jobId = computed(() => route.params.id as string | undefined)
const isEditMode = computed(() => !!jobId.value)
const pageTitle = computed(() => isEditMode.value ? 'Chỉnh Sửa Công Việc' : 'Tạo Công Việc Mới')

// ── State ──
const loading = ref(false)
const saving = ref(false)
const existingJob = ref<JobResponse | null>(null)

// ── Organization data ──
const departments = ref<DepartmentResponse[]>([])
const locations = ref<LocationResponse[]>([])
const categories = ref<CategoryResponse[]>([])

// ── Form fields ──
const form = ref<{
 title: string
 description: string
 requirements: string
 departmentId: string
 locationId: string
 categoryId: string
 minSalary: string
 maxSalary: string
 currency: string
 isNegotiable: boolean
 deadline: string
}>({
 title: '',
 description: '',
 requirements: '',
 departmentId: '',
 locationId: '',
 categoryId: '',
 minSalary: '',
 maxSalary: '',
 currency: 'VND',
 isNegotiable: false,
 deadline: '',
})

const errors = ref<Record<string, string>>({})

// ── AI JD Generator ──
const showAiPanel = ref(false)
const aiGenerating = ref(false)
const aiApplying = ref(false)
const aiResult = ref<JdGenerateResponse | null>(null)

const aiForm = ref<{
 employmentType: string
 keyResponsibilities: string
 requiredSkills: string
 niceToHaveSkills: string
 yearsOfExperience: string
 tone: 'PROFESSIONAL' | 'STARTUP' | 'CORPORATE'
}>({
 employmentType: 'FULL_TIME',
 keyResponsibilities: '',
 requiredSkills: '',
 niceToHaveSkills: '',
 yearsOfExperience: '',
 tone: 'PROFESSIONAL',
})

// ── Load organization data ──
async function loadOrgData(): Promise<void> {
 try {
   const [depts, locs, cats] = await Promise.all([
   departmentService.list(),
   locationService.list(),
   categoryService.list(),
   ])
   if (depts.data) departments.value = depts.data.content ?? []
   if (locs.data) locations.value = locs.data.content ?? []
   if (cats.data) categories.value = cats.data.content ?? []
 } catch {
   // Non-critical — dropdowns stay empty, form is still usable
 }
}

// ── Load existing job (edit mode) ──
async function loadJob(): Promise<void> {
 if (!jobId.value) return
 loading.value = true
 try {
 const result = await jobService.getJob(jobId.value)
 if (result.data) {
 existingJob.value = result.data
 const j = result.data

 // Only DRAFT can be edited
 if (j.status !== 'DRAFT') {
 ui.toastWarning('Không Thể Sửa', 'Chỉ có thể sửa đổi những tin tuyển dụng còn đang là bản nháp.')
 router.push(`/employer/jobs/${jobId.value}`)
 return
 }

 form.value = {
 title: j.title ?? '',
 description: j.description ?? '',
 requirements: j.requirements ?? '',
 departmentId: j.departmentId ?? '',
 locationId: j.locationId ?? '',
 categoryId: j.categoryId ?? '',
 minSalary: j.minSalary?.toString() ?? '',
 maxSalary: j.maxSalary?.toString() ?? '',
 currency: j.currency ?? 'VND',
 isNegotiable: j.isNegotiable ?? false,
 deadline: j.deadline?.split('T')[0] ?? '',
 }
 } else {
 ui.toastError('Không Tìm Thấy Công Việc', result.error?.message)
 router.push('/employer/jobs')
 }
 } catch {
 ui.toastError('Có Lỗi Xảy Ra', 'Không thể tải thông tin công việc. Vui lòng thử lại.')
 router.push('/employer/jobs')
 } finally {
 loading.value = false
 }
}

// ── Validation ──
function validate(): boolean {
 errors.value = {}

 if (!form.value.title.trim()) {
 errors.value.title = 'Vui lòng nhập tên vị trí.'
 } else if (form.value.title.length > 255) {
 errors.value.title = 'Tên vị trí phải dưới 255 ký tự.'
 }

 if (!form.value.description.trim()) {
 errors.value.description = 'Vui lòng cung cấp mô tả công việc.'
 } else if (form.value.description.length > 50000) {
 errors.value.description = 'Mô tả quá dài (tối đa 50,000 ký tự).'
 }

 if (form.value.requirements.length > 50000) {
 errors.value.requirements = 'Yêu cầu tham gia quá dài (tối đa 50,000 ký tự).'
 }

 const minSal = form.value.minSalary ? Number(form.value.minSalary) : null
 const maxSal = form.value.maxSalary ? Number(form.value.maxSalary) : null
 if (minSal !== null && isNaN(minSal)) errors.value.minSalary = 'Phải là dạng số.'
 if (maxSal !== null && isNaN(maxSal)) errors.value.maxSalary = 'Phải là dạng số.'
 if (minSal !== null && maxSal !== null && minSal > maxSal) {
 errors.value.minSalary = 'Mức lương tối thiểu không thể cao hơn tối đa.'
 }

 return Object.keys(errors.value).length === 0
}

// ── Save ──
async function handleSave(): Promise<void> {
 if (!validate()) return

 saving.value = true
 try {
 const payload: JobCreateRequest | JobUpdateRequest = {
 title: form.value.title.trim(),
 description: form.value.description.trim(),
 requirements: form.value.requirements.trim() || undefined,
 departmentId: form.value.departmentId || undefined,
 locationId: form.value.locationId || undefined,
 categoryId: form.value.categoryId || undefined,
 minSalary: form.value.minSalary ? Number(form.value.minSalary) : undefined,
 maxSalary: form.value.maxSalary ? Number(form.value.maxSalary) : undefined,
 currency: form.value.currency || undefined,
 isNegotiable: form.value.isNegotiable,
 deadline: form.value.deadline || undefined,
 }

 if (isEditMode.value) {
 const result = await jobService.updateJob(jobId.value!, payload)
 if (result.error) {
 ui.toastError('Xảy ra lỗi khi cập nhật', result.error.message)
 return
 }
 ui.toastSuccess('Cập nhật thành công')
 router.push(`/employer/jobs/${jobId.value}`)
 } else {
 const result = await jobService.createJob(payload as JobCreateRequest)
 if (result.error) {
 ui.toastError('Xảy ra lỗi khi tạo', result.error.message)
 return
 }
 ui.toastSuccess('Khởi tạo thành công', 'Công việc mới đã được lưu thành bản nháp.')
 router.push(`/employer/jobs/${result.data!.id}`)
 }
 } finally {
 saving.value = false
 }
}

// ── AI JD Generation ──
function splitLines(text: string): string[] {
 return text.split('\n').map((l) => l.trim()).filter(Boolean)
}

async function generateJd(): Promise<void> {
 if (!form.value.title.trim()) {
 ui.toastWarning('Thiếu Tiêu Đề', 'Hãy nhập vào ô Tiêu Đề Vị Trí trước khi nhờ AI phân tích.')
 return
 }

 aiGenerating.value = true
 try {
 const body: JdGenerateRequest = {
 title: form.value.title.trim(),
 departmentId: form.value.departmentId || undefined,
 employmentType: aiForm.value.employmentType,
 keyResponsibilities: splitLines(aiForm.value.keyResponsibilities),
 requiredSkills: splitLines(aiForm.value.requiredSkills),
 niceToHaveSkills: splitLines(aiForm.value.niceToHaveSkills) ?? undefined,
 yearsOfExperience: aiForm.value.yearsOfExperience ? Number(aiForm.value.yearsOfExperience) : undefined,
 tone: aiForm.value.tone,
 }
 const result = await jobService.generateDescription(body)
 if (result.data) {
 aiResult.value = result.data
 ui.toastSuccess('Khởi Tạo Xong', 'Mời bạn xem lại nội dung bản nháp do AI cung cấp.')
 } else {
 ui.toastError('Có Lỗi AI', result.error?.message)
 }
 } finally {
 aiGenerating.value = false
 }
}

function applyAiResult(): void {
 if (!aiResult.value) return
 const desc = aiResult.value.generatedDescription
 const sections = [
 `## Tổng Quan\n${desc.overview}`,
 `## Trách Nhiệm Vị Trí\n${desc.responsibilities.map((r) => `- ${r}`).join('\n')}`,
 `## Kỹ Năng / Yêu Cầu\n${desc.requirements.map((r) => `- ${r}`).join('\n')}`,
 desc.niceToHave.length > 0 ? `## Yêu Cầu Thêm (Ưu tiên)\n${desc.niceToHave.map((r) => `- ${r}`).join('\n')}` : '',
 desc.benefits ? `## Chế Độ Đãi Ngộ\n${desc.benefits}` : '',
 ].filter(Boolean)

 form.value.description = sections.join('\n\n')

 // Also apply to the backend if editing
 if (isEditMode.value && jobId.value) {
 aiApplying.value = true
 jobService.applyDescription(jobId.value, { generatedDescription: desc }).then((res) => {
 if (res.error) ui.toastWarning('Lưu Đồng Bộ Thất Bại', 'Đã chèn nội dung thành công nhưng chưa thể lưu đè lên máy chủ.')
 }).finally(() => { aiApplying.value = false })
 }

 aiResult.value = null
 showAiPanel.value = false
 ui.toastSuccess('Đã Áp Dụng', 'Bản mô tả do AI viết đã được đưa vào hộp văn bản thành công.')
}

onMounted(async () => {
 await loadOrgData()
 if (isEditMode.value) {
 await loadJob()
 }
})
</script>

<template>
 <div class="max-w-4xl mx-auto px-6 pb-8">
 <!-- Header -->
 <div class="flex items-center gap-3 mb-6">
 <button @click="router.back()" class="text-gray-400 hover:text-gray-600 transition text-sm">
 ‹ Quay Lại
 </button>
 <h1 class="text-xl font-bold text-gray-900">{{ pageTitle }}</h1>
 </div>

 <!-- Loading -->
 <div v-if="loading" class="premium-card p-6 animate-pulse space-y-4">
 <div class="h-10 bg-slate-100 rounded-xl" />
 <div class="h-40 bg-slate-100 rounded-xl" />
 <div class="h-10 bg-slate-100 rounded-xl" />
 </div>

 <!-- Form -->
 <form v-else @submit.prevent="handleSave" class="space-y-6">
 <!-- Title -->
 <div class="premium-card p-6 space-y-5">
 <h2 class="text-sm font-semibold text-gray-900 mb-4">Thông Tin Cơ Bản</h2>

 <div>
 <label for="job-title" class="block text-sm font-medium text-gray-700 mb-1">
 Tiêu Đề Vị Trí <span class="text-error">*</span>
 </label>
 <input
 id="job-title"
 v-model="form.title"
 type="text"
 placeholder="VD: Lập trình viên FrontEnd cấp cao"
 class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
 :class="errors.title ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <p v-if="errors.title" class="text-xs text-error mt-1">{{ errors.title }}</p>
 </div>

 <!-- Organization selects -->
 <div class="grid grid-cols-3 gap-4">
 <div>
 <label for="job-dept" class="block text-sm font-medium text-gray-700 mb-1">Phòng Ban</label>
 <select
 id="job-dept"
 v-model="form.departmentId"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 >
 <option value="">— Trống —</option>
 <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
 </select>
 </div>
 <div>
 <label for="job-loc" class="block text-sm font-medium text-gray-700 mb-1">Địa Chỉ</label>
 <select
 id="job-loc"
 v-model="form.locationId"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 >
 <option value="">— Trống —</option>
 <option v-for="l in locations" :key="l.id" :value="l.id">{{ l.name }}</option>
 </select>
 </div>
 <div>
 <label for="job-cat" class="block text-sm font-medium text-gray-700 mb-1">Ngành Tuyển</label>
 <select
 id="job-cat"
 v-model="form.categoryId"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 >
 <option value="">— Trống —</option>
 <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
 </select>
 </div>
 </div>

 <div>
 <label for="job-deadline" class="block text-sm font-medium text-gray-700 mb-1">Hạn Chót Ứng Tuyển</label>
 <input
 id="job-deadline"
 v-model="form.deadline"
 type="date"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 />
 </div>
 </div>

 <!-- Salary -->
 <div class="premium-card p-6 space-y-5">
 <h2 class="text-sm font-semibold text-gray-900 mb-4">Các Khoản Thu Nhập</h2>

 <div class="grid grid-cols-3 gap-4">
 <div>
 <label for="job-min-sal" class="block text-sm font-medium text-gray-700 mb-1">Mức Lương Tối Thiểu</label>
 <input
 id="job-min-sal"
 v-model="form.minSalary"
 type="text"
 inputmode="numeric"
 placeholder="VD: 15000000"
 class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
 :class="errors.minSalary ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <p v-if="errors.minSalary" class="text-xs text-error mt-1">{{ errors.minSalary }}</p>
 </div>
 <div>
 <label for="job-max-sal" class="block text-sm font-medium text-gray-700 mb-1">Mức Tối Đa</label>
 <input
 id="job-max-sal"
 v-model="form.maxSalary"
 type="text"
 inputmode="numeric"
 placeholder="VD: 30000000"
 class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
 :class="errors.maxSalary ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <p v-if="errors.maxSalary" class="text-xs text-error mt-1">{{ errors.maxSalary }}</p>
 </div>
 <div>
 <label for="job-currency" class="block text-sm font-medium text-gray-700 mb-1">Tiền Tệ</label>
 <select
 id="job-currency"
 v-model="form.currency"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 >
 <option value="VND">VND</option>
 <option value="USD">USD</option>
 <option value="EUR">EUR</option>
 </select>
 </div>
 </div>

 <label class="flex items-center gap-2 cursor-pointer">
 <input
 v-model="form.isNegotiable"
 type="checkbox"
 class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
 />
 <span class="text-sm text-gray-700">Mức lương có thể thương lượng sau.</span>
 </label>
 </div>

 <!-- Description -->
 <div class="premium-card p-6 space-y-5">
 <div class="flex items-center justify-between mb-4">
 <h2 class="text-sm font-semibold text-gray-900">Nội Dung Chi Tiết</h2>
 <button
 type="button"
 @click="showAiPanel = !showAiPanel"
 class="transition flex items-center gap-1.5"
 :class="showAiPanel
 ? 'btn-primary'
 : 'btn-secondary text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200'"
 >
 ✦ AI Tự Động Viết
 </button>
 </div>

 <!-- AI Panel (collapsible) -->
 <div v-if="showAiPanel" class="bg-slate-900 rounded-2xl p-6 space-y-5 shadow-inner border border-slate-800 animate-slide-up text-white">
 <p class="text-sm text-slate-400">
 Cung cấp một vài thông tin thiết yếu, AI sẽ tự viết nên một tin tuyển dụng chuyên nghiệp.
 Thông tin của vị trí trên sẽ được nạp tự động vào quá trình này.
 </p>

 <div class="grid grid-cols-2 gap-4">
 <div>
 <label class="block text-xs font-semibold text-slate-400 mb-1">Loại Hình Hợp Đồng</label>
 <select v-model="aiForm.employmentType" class="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:border-teal-500 transition">
 <option value="FULL_TIME">Toàn Thời Gian</option>
 <option value="PART_TIME">Bán Thời Gian</option>
 <option value="CONTRACT">Thời Vụ</option>
 <option value="INTERNSHIP">Thực Tập</option>
 </select>
 </div>
 <div>
 <label class="block text-xs font-semibold text-slate-400 mb-1">Văn Phong Môi Trường</label>
 <select v-model="aiForm.tone" class="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:border-teal-500 transition">
 <option value="PROFESSIONAL">Chuyên Nghiệp</option>
 <option value="STARTUP">Trẻ Trung Môi Trường Start-up</option>
 <option value="CORPORATE">Phong Cách Tập Đoàn</option>
 </select>
 </div>
 </div>

 <div>
 <label class="block text-xs font-semibold text-slate-400 mb-1">Nhiệm Vụ Chính (mỗi ý 1 dòng)</label>
 <textarea
 v-model="aiForm.keyResponsibilities"
 rows="3"
 placeholder="Phát triển giao diện web&#10;Phối hợp nhóm BackEnd&#10;Viết test case"
 class="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:border-teal-500 transition resize-none placeholder-slate-500"
 />
 </div>

 <div>
 <label class="block text-xs font-semibold text-slate-400 mb-1">Kỹ Năng Yêu Cầu (mỗi ý 1 dòng)</label>
 <textarea
 v-model="aiForm.requiredSkills"
 rows="3"
 placeholder="Vue.js / React&#10;TypeScript&#10;REST API integration"
 class="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:border-teal-500 transition resize-none placeholder-slate-500"
 />
 </div>

 <div class="grid grid-cols-2 gap-4">
 <div>
 <label class="block text-xs font-semibold text-slate-400 mb-1">Kỹ Năng Ưu Tiên Thêm (mỗi ý 1 dòng)</label>
 <textarea
 v-model="aiForm.niceToHaveSkills"
 rows="2"
 placeholder="Docker&#10;CI/CD"
 class="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:border-teal-500 transition resize-none placeholder-slate-500"
 />
 </div>
 <div>
 <label class="block text-xs font-semibold text-slate-400 mb-1">Số Năm Kinh Nghiệm</label>
 <input
 v-model="aiForm.yearsOfExperience"
 type="text"
 inputmode="numeric"
 placeholder="e.g. 3"
 class="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:border-teal-500 transition placeholder-slate-500"
 />
 </div>
 </div>

 <div class="flex items-center gap-3 pt-2">
 <button
 type="button"
 @click="generateJd"
 :disabled="aiGenerating"
 class="btn-primary"
 >
 <span v-if="aiGenerating" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ aiGenerating ? 'Đang Khởi Tạo…' : '✦ Sinh Văn Bản Bản Nháp' }}
 </button>
 <button
 type="button"
 @click="showAiPanel = false"
 class="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
 >
 Huỷ
 </button>
 </div>

 <!-- AI Result Preview -->
 <div v-if="aiResult" class="mt-6 bg-slate-800 border border-teal-500/30 rounded-xl p-5 space-y-4 animate-fade-in shadow-lg">
 <div class="flex items-center justify-between">
 <h3 class="text-sm font-bold text-teal-400">Xem Trước Nội Dung</h3>
 <span class="text-xs text-slate-500">{{ aiResult.generatedAt }}</span>
 </div>

 <div class="text-sm text-slate-300 space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
 <div>
 <strong class="text-white">Tổng Quan:</strong>
 <p class="mt-1 leading-relaxed">{{ aiResult.generatedDescription.overview }}</p>
 </div>
 <div>
 <strong class="text-white">Trách Nhiệm:</strong>
 <ul class="mt-1 list-disc list-inside space-y-1">
 <li v-for="(r, i) in aiResult.generatedDescription.responsibilities" :key="i">{{ r }}</li>
 </ul>
 </div>
 <div>
 <strong class="text-white">Yêu Cầu Tham Gia:</strong>
 <ul class="mt-1 list-disc list-inside space-y-1">
 <li v-for="(r, i) in aiResult.generatedDescription.requirements" :key="i">{{ r }}</li>
 </ul>
 </div>
 <div v-if="aiResult.generatedDescription.niceToHave.length">
 <strong class="text-white">Điểm Thêm:</strong>
 <ul class="mt-1 list-disc list-inside space-y-1">
 <li v-for="(r, i) in aiResult.generatedDescription.niceToHave" :key="i">{{ r }}</li>
 </ul>
 </div>
 <div v-if="aiResult.generatedDescription.benefits">
 <strong class="text-white">Lợi Ích Và Văn Hóa:</strong>
 <p class="mt-1 leading-relaxed">{{ aiResult.generatedDescription.benefits }}</p>
 </div>
 </div>

 <!-- Bias flags -->
 <div v-if="aiResult.biasFlags.length" class="flex flex-wrap gap-1.5 mt-2">
 <span
 v-for="(flag, i) in aiResult.biasFlags"
 :key="i"
 class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-warning-bg text-warning"
 >
 ⚠ {{ flag }}
 </span>
 </div>

 <div class="flex gap-3 pt-3 border-t border-slate-700">
 <button
 type="button"
 @click="applyAiResult"
 class="btn-primary"
 >
 Áp Dụng Nội Dung
 </button>
 <button
 type="button"
 @click="aiResult = null"
 class="btn-secondary "
 >
 Bỏ Qua
 </button>
 </div>
 </div>
 </div>

 <!-- Description textarea -->
 <div>
 <label for="job-desc" class="block text-sm font-medium text-gray-700 mb-1">
 Mô Tả Công Việc <span class="text-error">*</span>
 </label>
 <textarea
 id="job-desc"
 v-model="form.description"
 rows="12"
 placeholder="Trình bày ngắn gọn thông tin về vai trò công việc này..."
 class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition resize-y font-mono"
 :class="errors.description ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <div class="flex items-center justify-between mt-1">
 <p v-if="errors.description" class="text-xs text-error">{{ errors.description }}</p>
 <span class="text-[10px] text-gray-400 ml-auto">{{ (form.description?.length ?? 0).toLocaleString() }} / 50,000</span>
 </div>
 </div>

 <!-- Requirements textarea -->
 <div>
 <label for="job-req" class="block text-sm font-medium text-gray-700 mb-1">Yêu Cầu Từ Vị Trí Công Việc</label>
 <textarea
 id="job-req"
 v-model="form.requirements"
 rows="6"
 placeholder="Viết các tiêu chí để sàng lọc năng lực ứng viên…"
 class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition resize-y font-mono"
 :class="errors.requirements ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <div class="flex items-center justify-between mt-1">
 <p v-if="errors.requirements" class="text-xs text-error">{{ errors.requirements }}</p>
 <span class="text-[10px] text-gray-400 ml-auto">{{ (form.requirements?.length ?? 0).toLocaleString() }} / 50,000</span>
 </div>
 </div>
 </div>

 <!-- Actions -->
 <div class="flex items-center justify-between pt-4">
 <button
 type="button"
 @click="router.push('/employer/jobs')"
 class="btn-secondary"
 >
 Hủy Lên Máy Chủ
 </button>
 <button
 type="submit"
 :disabled="saving"
 class="btn-primary"
 >
 <span v-if="saving" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ saving ? 'Hệ thống Đang Đẩy…' : isEditMode ? 'Lưu Thông Tin ' : 'Gửi Yêu Cầu Tạo Nháp Mới' }}
 </button>
 </div>
 </form>
 </div>
</template>
