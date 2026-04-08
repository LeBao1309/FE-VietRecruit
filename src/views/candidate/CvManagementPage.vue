<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { candidateService } from '@/services/candidateService'
import type { CandidateProfileResponse } from '@/types/candidate'
import type { CvImprovementResponse } from '@/types/ai'

const ui = useUiStore()

// ── State ──
const loading = ref(true)
const profile = ref<CandidateProfileResponse | null>(null)

// ── Upload state ──
const uploading = ref(false)
const deleting = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

// ── AI Improvement ──
const analyzing = ref(false)
const analysisUsed = ref(false)
const improvement = ref<CvImprovementResponse | null>(null)

// ── Computed ──
const hasCv = computed(() => !!profile.value?.defaultCvUrl)
const cvInfo = computed(() => {
 if (!profile.value) return null
 return {
 filename: profile.value.cvOriginalFilename ?? 'Unknown file',
 type: profile.value.cvContentType ?? '',
 size: profile.value.cvFileSizeBytes ?? 0,
 uploadedAt: profile.value.cvUploadedAt ?? '',
 }
})

// ── Constants ──
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

// ── Load ──
async function loadProfile(): Promise<void> {
 loading.value = true
 try {
 const result = await candidateService.getProfile()
 if (result.data) profile.value = result.data
 } finally {
 loading.value = false
 }
}

// ── Upload ──
function triggerFileInput(): void {
 fileInputRef.value?.click()
}

function onFileSelect(e: Event): void {
 const input = e.target as HTMLInputElement
 if (input.files?.[0]) {
 processFile(input.files[0])
 }
 input.value = '' // Reset for re-upload
}

function onDrop(e: DragEvent): void {
 e.preventDefault()
 dragOver.value = false
 const file = e.dataTransfer?.files?.[0]
 if (file) processFile(file)
}

async function processFile(file: File): Promise<void> {
 // Validate type
 if (!ALLOWED_TYPES.includes(file.type)) {
 ui.toastError('Định dạng không hợp lệ', 'Vui lòng tải lên file PDF, DOCX, JPEG hoặc PNG.')
 return
 }
 // Validate size
 if (file.size > MAX_SIZE_BYTES) {
 ui.toastError('File quá lớn', `Dung lượng tối đa là ${MAX_SIZE_MB}MB.`)
 return
 }

 uploading.value = true
 try {
 const result = await candidateService.uploadCv(file)
 if (result.data) {
 // Update profile with new CV info
 if (profile.value) {
 profile.value.defaultCvUrl = result.data.cvUrl
 profile.value.cvOriginalFilename = result.data.cvOriginalFilename
 profile.value.cvContentType = result.data.cvContentType
 profile.value.cvFileSizeBytes = result.data.cvFileSizeBytes
 profile.value.cvUploadedAt = result.data.cvUploadedAt
 }
 improvement.value = null // Clear previous analysis
 ui.toastSuccess('Tải lên hoàn tất', `Hồ sơ "${result.data.cvOriginalFilename}" đã được tải lên thành công.`)
 } else {
 ui.toastError('Tải lên thất bại', result.error?.message)
 }
 } finally {
 uploading.value = false
 }
}

// ── Delete ──
async function handleDelete(): Promise<void> {
 if (!confirm('Bạn có chắc chắn muốn xóa CV không? Thao tác này không thể hoàn tác.')) return
 deleting.value = true
 try {
 const result = await candidateService.deleteCv()
 if (!result.error) {
 if (profile.value) {
 profile.value.defaultCvUrl = null
 profile.value.cvOriginalFilename = null
 profile.value.cvContentType = null
 profile.value.cvFileSizeBytes = null
 profile.value.cvUploadedAt = null
 }
 improvement.value = null
 ui.toastSuccess('Đã xóa CV')
 } else {
 ui.toastError('Xóa thất bại', result.error.message)
 }
 } finally {
 deleting.value = false
 }
}

// ── AI Improvement ──
async function runAnalysis(): Promise<void> {
 if (!hasCv.value) {
 ui.toastWarning('Chưa có CV', 'Vui lòng tải lên CV trước khi phân tích.')
 return
 }
 analysisUsed.value = true
 analyzing.value = true
 try {
 const result = await candidateService.getCvImprovement()
 if (result.data) {
 improvement.value = result.data
 ui.toastSuccess('Đã hoàn thành phân tích')
 } else {
 ui.toastError('Phân tích thất bại', result.error?.message)
 }
 } finally {
 analyzing.value = false
 }
}

// ── Formatting ──
function formatFileSize(bytes: number): string {
 if (bytes < 1024) return `${bytes} B`
 if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
 return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
 return new Date(iso).toLocaleDateString('vi-VN', {
 day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
 })
}

const PRIORITY_MAP: Record<string, string> = {
 HIGH: 'Cao',
 MEDIUM: 'Trung bình',
 LOW: 'Thấp',
}

const SECTION_MAP: Record<string, string> = {
 'Work Experience': 'Kinh Nghiệm Làm Việc',
 'Experience': 'Kinh Nghiệm Làm Việc',
 'Professional Experience': 'Kinh Nghiệm Chuyên Môn',
 'Skills': 'Kỹ Năng',
 'Technical Skills': 'Kỹ Năng Kỹ Thuật',
 'Soft Skills': 'Kỹ Năng Mềm',
 'Education': 'Học Vấn',
 'Summary': 'Tóm Tắt',
 'Professional Summary': 'Tóm Tắt Chuyên Môn',
 'Objective': 'Mục Tiêu Nghề Nghiệp',
 'Career Objective': 'Mục Tiêu Nghề Nghiệp',
 'Certifications': 'Chứng Chỉ',
 'Certificates': 'Chứng Chỉ',
 'Languages': 'Ngôn Ngữ',
 'Projects': 'Dự Án',
 'Achievements': 'Thành Tích',
 'Accomplishments': 'Thành Tích',
 'Awards': 'Giải Thưởng',
 'References': 'Tài Liệu Tham Khảo',
 'Contact': 'Thông Tin Liên Hệ',
 'Contact Information': 'Thông Tin Liên Hệ',
 'Hobbies': 'Sở Thích',
 'Interests': 'Sở Thích',
 'Volunteer': 'Hoạt Động Tình Nguyện',
 'Volunteer Experience': 'Hoạt Động Tình Nguyện',
 'Publications': 'Bài Đăng / Nghiên Cứu',
 'Overall': 'Tổng Quan',
 'Format': 'Định Dạng',
 'Formatting': 'Định Dạng',
 'Layout': 'Bố Cục',
 'Length': 'Độ Dài',
}

function translatePriority(priority: string): string {
 return PRIORITY_MAP[priority.toUpperCase()] ?? priority
}

function translateSection(section: string): string {
 return SECTION_MAP[section] ?? section
}


onMounted(loadProfile)
</script>

<template>
 <div class="max-w-4xl mx-auto px-6 py-10">
 <div class="mb-8">
 <h1 class="text-3xl font-extrabold text-slate-900 mb-2">Quản Lý CV</h1>
 <p class="text-sm font-medium text-slate-500">Tải CV lên và nhận các gợi ý nâng cấp từ trợ lý AI.</p>
 </div>

 <!-- Loading -->
 <div v-if="loading" class="premium-card p-8 animate-pulse space-y-4">
 <div class="h-24 bg-slate-200 rounded-xl" />
 <div class="h-4 bg-slate-200 rounded w-48" />
 </div>

 <template v-else>
 <!-- Upload Area -->
 <div class="premium-card p-8 mb-8">
 <h2 class="text-lg font-bold text-slate-900 mb-6">CV Của Bạn</h2>

 <!-- Has CV -->
 <div v-if="hasCv && cvInfo" class="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-xl gap-6">
 <div class="flex items-center gap-4 min-w-0">
 <div class="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 text-sm font-black shrink-0 shadow-sm">
 {{ cvInfo.filename.split('.').pop()?.toUpperCase() ?? 'CV' }}
 </div>
 <div class="min-w-0">
 <p class="text-base font-bold text-slate-900 truncate">{{ cvInfo.filename }}</p>
 <p class="text-xs font-medium text-slate-500 mt-1">
 {{ formatFileSize(cvInfo.size) }} <span class="mx-1.5 opacity-50">•</span> Tải lên lúc {{ formatDate(cvInfo.uploadedAt) }}
 </p>
 </div>
 </div>
 <div class="flex items-center gap-3 shrink-0 sm:ml-4">
 <button
 @click="triggerFileInput"
 :disabled="uploading"
 class="btn-secondary px-4 py-2"
 >
 <span v-if="uploading" class="inline-block w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-1"></span>
 {{ uploading ? 'Đang tải…' : 'Thay Thế' }}
 </button>
 <button
 @click="handleDelete"
 :disabled="deleting"
 class="px-4 py-2 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 :bg-rose-900/40 transition-colors disabled:opacity-50"
 >
 {{ deleting ? 'Đang xóa…' : 'Xóa' }}
 </button>
 </div>
 </div>

 <!-- No CV — Drop zone -->
 <div
 v-else
 @click="triggerFileInput"
 @dragover.prevent="dragOver = true"
 @dragleave="dragOver = false"
 @drop="onDrop"
 class="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300"
 :class="dragOver ? 'border-teal-500 bg-teal-50 scale-[1.02]' : 'border-slate-300 hover:border-teal-400 :border-teal-500 hover:bg-slate-50 :bg-slate-800/50 bg-slate-50/50 '"
 >
 <div class="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center text-teal-500 text-2xl mb-4 group-hover:-translate-y-1 transition-transform">
 <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
 </svg>
 </div>
 <p class="text-base font-bold text-slate-800 mb-2 text-center">
 {{ uploading ? 'Đang tải…' : 'Kéo thả CV vào đây hoặc bấm để chọn file' }}
 </p>
 <p class="text-xs font-medium text-slate-500">PDF, DOCX, JPEG, hoặc PNG — tối đa {{ MAX_SIZE_MB }}MB</p>
 <div v-if="uploading" class="mt-4 inline-block w-6 h-6 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
 </div>

 <!-- Hidden file input -->
 <input
 ref="fileInputRef"
 type="file"
 accept=".pdf,.docx,.doc,.jpeg,.jpg,.png"
 class="hidden"
 @change="onFileSelect"
 />
 </div>

 <!-- AI Improvement Section -->
 <div class="premium-card p-8">
 <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
 <div>
 <h2 class="text-lg font-bold text-slate-900 mb-1">AI Phân Tích CV</h2>
 <p class="text-sm font-medium text-slate-500 max-w-lg">Nhận các gợi ý tối ưu từ AI giúp CV của bạn vượt qua các hệ thống sàng lọc và thu hút nhà tuyển dụng.</p>
 </div>
 <div class="flex flex-col items-end gap-1.5 shrink-0">
  <button
  @click="runAnalysis"
  :disabled="analyzing || !hasCv || analysisUsed"
  class="btn-primary py-2.5 px-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
  >
  <span v-if="analyzing" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  <svg v-else class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
  {{ analyzing ? 'Đang Phân Tích…' : 'Bắt Đầu Phân Tích CV' }}
  </button>
  <p v-if="analysisUsed && !analyzing" class="text-xs text-slate-400">
  Tạm thời không khả dụng — tải lại trang để dùng lại.
  </p>
 </div>
 </div>

 <div v-if="!hasCv" class="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center">
 <p class="text-sm font-bold text-slate-500">Tải lên CV trước để có thể phân tích bằng AI.</p>
 </div>

 <!-- Results -->
 <div v-else-if="improvement" class="space-y-8 animate-fade-in">
 <!-- Score -->
 <div class="flex items-center gap-6 p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
 <div class="relative w-24 h-24 shrink-0 drop-shadow-sm">
 <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
 <circle cx="18" cy="18" r="15.5" fill="none" class="stroke-slate-200 " stroke-width="3" />
 <circle
 cx="18" cy="18" r="15.5" fill="none" stroke-width="3" stroke-linecap="round"
 :stroke="improvement.overallScore >= 70 ? '#10b981' : improvement.overallScore >= 40 ? '#f59e0b' : '#f43f5e'"
 :stroke-dasharray="`${(improvement.overallScore / 100) * 97.4} 97.4`"
 class="transition-all duration-1000 ease-out"
 />
 </svg>
 <div class="absolute inset-0 flex flex-col items-center justify-center">
 <span class="text-2xl font-black text-slate-900 leading-none">
 {{ improvement.overallScore }}
 </span>
 </div>
 </div>
 <div>
 <p class="text-lg font-bold text-slate-900 mb-1">Điểm Đánh Giá CV</p>
 <p class="text-sm font-medium text-slate-500">
 Đã phân tích: {{ formatDate(improvement.analysedAt) }}
 </p>
 </div>
 </div>

 <!-- Strengths -->
 <div v-if="improvement.strengths.length">
 <h3 class="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-4 bg-slate-100 inline-block px-3 py-1 rounded-full">Điểm Mạnh Nổi Bật</h3>
 <ul class="grid grid-cols-1 md:grid-cols-2 gap-3">
 <li v-for="(s, i) in improvement.strengths" :key="i" class="flex items-start gap-3 p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-sm font-medium text-emerald-900 ">
 <span class="text-emerald-500 shrink-0 mt-0.5">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
 </span>
 <span class="leading-relaxed">{{ s }}</span>
 </li>
 </ul>
 </div>

 <!-- Suggestions -->
 <div v-if="improvement.suggestions.length">
 <div class="flex items-center gap-3 mb-4">
 <h3 class="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-100 inline-block px-3 py-1 rounded-full">
 Điểm Cần Cải Thiện
 </h3>
 <span class="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{{ improvement.suggestions.length }}</span>
 </div>
 
 <div class="space-y-4">
 <div
 v-for="(sug, i) in improvement.suggestions"
 :key="i"
 class="p-5 border border-slate-200 rounded-xl bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
 >
 <div class="flex items-center gap-3 mb-3">
 <span
 class="px-2 py-1 text-[10px] font-black tracking-wider uppercase rounded-md shadow-sm"
 :class="sug.priority === 'HIGH' ? 'bg-rose-100 text-rose-700 ' :
 (sug.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700 ' : 'bg-blue-100 text-blue-700 ')"
 >
 Ưu tiên {{ translatePriority(sug.priority) }}
 </span>
 <span class="text-sm font-bold text-slate-700 ">{{ translateSection(sug.section) }}</span>
 </div>
 <p class="text-sm text-slate-600 mb-2 leading-relaxed">
 <strong class="font-bold text-slate-900 mr-1">Vấn đề:</strong> {{ sug.issue }}
 </p>
 <div class="p-3 bg-teal-50 border border-teal-100 rounded-lg">
 <p class="text-sm text-teal-800 leading-relaxed">
 <strong class="font-bold text-teal-900 mr-1">Cách sửa:</strong> {{ sug.suggestion }}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div v-else-if="!analyzing" class="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center">
 <p class="text-sm font-bold text-slate-500">Bấm "Bắt Đầu Phân Tích CV" để nhận các gợi ý từ AI.</p>
 </div>
 </div>
 </template>
 </div>
</template>
