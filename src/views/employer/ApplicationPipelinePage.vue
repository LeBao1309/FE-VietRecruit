<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApplicationStore } from '@/stores/applicationStore'
import { useJobStore } from '@/stores/jobStore'
import type { ApplicationStatus } from '@/types/enums'
// types used implicitly via store getters

const route = useRoute()
const router = useRouter()
const appStore = useApplicationStore()
const jobStore = useJobStore()

const jobId = computed(() => route.params.id as string)

// ── View mode toggle ──
const viewMode = ref<'kanban' | 'table'>('kanban')

// ── Table pagination / filter ──
const currentPage = ref(0)
const pageSize = ref(20)
const statusFilter = ref<ApplicationStatus | ''>('')

// ── Screening panel ──
const showScreening = ref(false)

// ── Kanban column config ──
const PIPELINE_COLUMNS: { status: ApplicationStatus; label: string; color: string; dotClass: string }[] = [
 { status: 'NEW', label: 'Ứng Tuyển', color: 'border-t-blue-400', dotClass: 'bg-blue-400' },
 { status: 'SCREENING', label: 'Sàng Lọc', color: 'border-t-amber-400', dotClass: 'bg-amber-400' },
 { status: 'INTERVIEW', label: 'Phỏng Vấn', color: 'border-t-purple-500', dotClass: 'bg-purple-500' },
 { status: 'OFFER', label: 'Thư Mời', color: 'border-t-primary', dotClass: 'bg-primary' },
 { status: 'HIRED', label: 'Đã Tuyển', color: 'border-t-green-500', dotClass: 'bg-green-500' },
 { status: 'REJECTED', label: 'Bị Từ Chối', color: 'border-t-red-400', dotClass: 'bg-red-400' },
]

// Status badge styling
const statusBadgeConfig: Record<ApplicationStatus, { label: string; class: string }> = {
 NEW: { label: 'Ứng Tuyển', class: 'bg-blue-50 text-blue-600' },
 SCREENING: { label: 'Sàng Lọc', class: 'bg-amber-50 text-amber-600' },
 INTERVIEW: { label: 'Phỏng Vấn', class: 'bg-purple-50 text-purple-600' },
 OFFER: { label: 'Thư Mời', class: 'bg-primary-bg text-primary' },
 HIRED: { label: 'Đã Tuyển', class: 'bg-success-bg text-success' },
 REJECTED: { label: 'Bị Từ Chối', class: 'bg-error-bg text-error' },
}

const statusFilterOptions: { label: string; value: ApplicationStatus | '' }[] = [
 { label: 'Mọi Trạng Thái', value: '' },
 { label: 'Mới Ứng Tuyển', value: 'NEW' },
 { label: 'Đang Sàng Lọc', value: 'SCREENING' },
 { label: 'Phỏng Vấn', value: 'INTERVIEW' },
 { label: 'Thư Mời', value: 'OFFER' },
 { label: 'Đã Tuyển', value: 'HIRED' },
 { label: 'Bị Từ Chối', value: 'REJECTED' },
]

// ── Load data ──
async function loadKanban(): Promise<void> {
 await appStore.fetchAllForJob(jobId.value)
}

async function loadTable(): Promise<void> {
 await appStore.fetchApplications({
 jobId: jobId.value,
 status: statusFilter.value || undefined,
 page: currentPage.value,
 size: pageSize.value,
 sort: 'createdAt,desc',
 })
}

function reload(): void {
 if (viewMode.value === 'kanban') {
 loadKanban()
 } else {
 loadTable()
 }
}

watch([viewMode], () => {
 reload()
})

watch([currentPage, statusFilter], () => {
 if (viewMode.value === 'table') {
 loadTable()
 }
})

// ── Screening ──
async function handleTriggerScreening(): Promise<void> {
 const success = await appStore.triggerScreening(jobId.value)
 if (success) {
 // Wait a beat then fetch results
 setTimeout(() => {
 appStore.fetchScreeningResults(jobId.value)
 }, 2000)
 }
}

async function loadScreeningResults(): Promise<void> {
 showScreening.value = true
 await appStore.fetchScreeningResults(jobId.value)
}

function getScoreColor(score: number | null): string {
 if (score === null) return 'text-gray-400'
 if (score >= 80) return 'text-green-600'
 if (score >= 60) return 'text-amber-600'
 return 'text-red-500'
}

function getScoreBarWidth(score: number | null): string {
 if (score === null) return '0%'
 return `${Math.min(100, Math.max(0, score))}%`
}

function getScoreBarColor(score: number | null): string {
 if (score === null) return 'bg-gray-200'
 if (score >= 80) return 'bg-green-400'
 if (score >= 60) return 'bg-amber-400'
 return 'bg-red-400'
}

// ── Navigation ──
function goToDetail(appId: string): void {
 router.push(`/employer/applications/${appId}`)
}

// ── Helpers ──
function formatDate(iso: string): string {
 return new Date(iso).toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 })
}

function columnCount(status: ApplicationStatus): number {
 return appStore.applicationsByStatus[status]?.length ?? 0
}

// ── Pagination ──
const canGoPrev = computed(() => currentPage.value > 0)
const canGoNext = computed(() => currentPage.value < appStore.totalPages - 1)
function prevPage(): void { if (canGoPrev.value) currentPage.value-- }
function nextPage(): void { if (canGoNext.value) currentPage.value++ }

// ── Init ──
onMounted(async () => {
 await jobStore.fetchJob(jobId.value)
 loadKanban()
})
</script>

<template>
 <div class="max-w-[1400px] mx-auto px-6 py-8">
 <!-- Header -->
 <div class="flex items-center gap-3 mb-2">
 <button @click="router.push(`/employer/jobs/${jobId}`)" class="text-gray-400 hover:text-gray-600 transition text-sm">
 ‹ Về công việc
 </button>
 </div>

 <div class="flex items-start justify-between mb-6">
 <div>
 <h1 class="text-xl font-bold text-gray-900">
 Tuyển Dụng
 </h1>
 <p v-if="jobStore.currentJob" class="text-sm text-gray-500 mt-1">
 {{ jobStore.currentJob.title }}
 <span class="text-gray-300 mx-1">·</span>
 {{ appStore.totalApplications }} ứng viên
 </p>
 </div>

 <div class="flex items-center gap-2 shrink-0">
 <!-- AI Screening trigger -->
 <button
 @click="handleTriggerScreening"
 :disabled="appStore.triggerScreeningLoading"
 class="btn-secondary text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100"
 >
 <span v-if="appStore.triggerScreeningLoading" class="inline-block w-4 h-4 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
 <template v-else>⚡</template>
 AI Screen
 </button>

 <!-- View screening results -->
 <button
 @click="loadScreeningResults"
 class="btn-outline"
 >
 📊 Kết Quả
 </button>

 <!-- View mode toggle -->
 <div class="flex items-center bg-slate-100 rounded-xl p-1">
 <button
 @click="viewMode = 'kanban'"
 class="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all"
 :class="viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 :text-slate-300'"
 >
 Bảng
 </button>
 <button
 @click="viewMode = 'table'"
 class="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all"
 :class="viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 :text-slate-300'"
 >
 Danh Sách
 </button>
 </div>
 </div>
 </div>

 <!-- ─── Loading ─── -->
 <div v-if="appStore.loading" class="flex items-center justify-center py-24">
 <div class="text-center">
 <div class="inline-block w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
 <p class="text-sm text-gray-400">Đang tải hồ sơ…</p>
 </div>
 </div>

 <!-- ─── KANBAN VIEW ─── -->
 <div v-else-if="viewMode === 'kanban'" class="flex gap-5 overflow-x-auto pb-6" style="min-height: 400px">
 <div
 v-for="col in PIPELINE_COLUMNS"
 :key="col.status"
 class="flex-shrink-0 w-72 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col max-h-[750px] shadow-sm"
 :class="col.color"
 style="border-top-width: 4px"
 >
 <!-- Column Header -->
 <div class="px-3 py-3 flex items-center justify-between">
 <div class="flex items-center gap-2">
 <span class="w-2 h-2 rounded-full" :class="col.dotClass" />
 <span class="text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ col.label }}</span>
 </div>
 <span class="px-1.5 py-0.5 text-[10px] font-bold text-gray-500 bg-white rounded-full border border-border min-w-[20px] text-center">
 {{ columnCount(col.status) }}
 </span>
 </div>

 <!-- Column Cards -->
 <div class="px-3 pb-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
 <div
 v-for="app in appStore.applicationsByStatus[col.status]"
 :key="app.id"
 @click="goToDetail(app.id)"
 class="premium-card p-4 cursor-pointer group hover:border-teal-400 :border-teal-500 block"
 >
 <div class="flex items-start justify-between mb-3">
 <span class="text-sm font-bold text-slate-900 leading-tight group-hover:text-teal-600 :text-teal-400 transition-colors">
 {{ app.candidateName }}
 </span>
 </div>
 <div class="flex items-center justify-between pt-2 border-t border-slate-100 ">
 <span class="text-xs font-medium text-slate-400">{{ formatDate(app.createdAt) }}</span>
 <span class="text-teal-600 text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
 Chi Tiết →
 </span>
 </div>
 </div>

 <!-- Empty column -->
 <div v-if="columnCount(col.status) === 0" class="py-8 text-center">
 <p class="text-[11px] text-gray-400">Không có ứng viên</p>
 </div>
 </div>
 </div>
 </div>

 <!-- ─── TABLE VIEW ─── -->
 <div v-else>
 <!-- Filters -->
 <div class="flex items-center gap-3 mb-4">
 <select
 v-model="statusFilter"
 @change="currentPage = 0"
 class="px-3 py-2 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 >
 <option v-for="opt in statusFilterOptions" :key="opt.value" :value="opt.value">
 {{ opt.label }}
 </option>
 </select>
 <span class="text-xs text-gray-400 ml-auto">
 {{ appStore.totalApplications }} hồ sơ
 </span>
 </div>

 <!-- Table -->
 <div class="premium-card overflow-hidden">
 <table class="w-full">
 <thead>
 <tr class="border-b border-slate-200 bg-slate-50 ">
 <th class="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Ứng Viên</th>
 <th class="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-36">Trạng Thái</th>
 <th class="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Ngày Nộp</th>
 </tr>
 </thead>
 <tbody>
 <tr v-if="appStore.applicationList.length === 0">
 <td colspan="3" class="text-center py-16">
 <div class="text-gray-400 text-sm">
 <p class="font-medium mb-1">Không có hồ sơ nào</p>
 <p class="text-xs">Các hồ sơ ứng tuyển sẽ xuất hiện tại đây.</p>
 </div>
 </td>
 </tr>
 <tr
 v-for="app in appStore.applicationList"
 :key="app.id"
 @click="goToDetail(app.id)"
 class="border-b border-slate-100 last:border-0 hover:bg-slate-50 :bg-slate-800/50 transition-colors cursor-pointer group"
 >
 <td class="px-5 py-4">
 <span class="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{{ app.candidateName }}</span>
 <span class="block text-xs font-medium text-slate-500 mt-0.5">{{ app.jobTitle }}</span>
 </td>
 <td class="px-5 py-4">
 <span
 class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
 :class="statusBadgeConfig[app.status].class"
 >
 {{ statusBadgeConfig[app.status].label }}
 </span>
 </td>
 <td class="px-5 py-4 text-sm font-medium text-slate-500">
 {{ formatDate(app.createdAt) }}
 </td>
 </tr>
 </tbody>
 </table>

 <!-- Pagination -->
 <div v-if="appStore.totalPages > 1" class="flex items-center justify-between px-5 py-4 border-t border-slate-200 bg-slate-50/50 ">
 <span class="text-sm font-medium text-slate-500">
 Trang {{ currentPage + 1 }} / {{ appStore.totalPages }}
 </span>
 <div class="flex items-center gap-2">
 <button @click="prevPage" :disabled="!canGoPrev" class="btn-outline px-3 py-1 text-sm">
 ‹ Trước
 </button>
 <button @click="nextPage" :disabled="!canGoNext" class="btn-outline px-3 py-1 text-sm">
 Tiếp ›
 </button>
 </div>
 </div>
 </div>
 </div>

 <!-- ─── SCREENING RESULTS PANEL ─── -->
 <Teleport to="body">
 <div v-if="showScreening" class="fixed inset-0 z-50 flex items-start justify-end">
 <div class="absolute inset-0 bg-black/30" @click="showScreening = false" />
 <div class="relative bg-surface h-full w-full max-w-2xl shadow-2xl border-l border-border overflow-y-auto animate-slide-right">
 <!-- Header -->
 <div class="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
 <div>
 <h2 class="text-lg font-bold text-gray-900">Kết Quả Phân Tích AI</h2>
 <p class="text-xs text-gray-400 mt-0.5">
 {{ appStore.screeningResults.length }} ứng viên đã chấm điểm
 </p>
 </div>
 <div class="flex items-center gap-2">
 <button
 @click="handleTriggerScreening"
 :disabled="appStore.triggerScreeningLoading"
 class="px-3 py-1.5 text-xs font-medium text-primary bg-primary-bg border border-primary/10 rounded-md hover:bg-primary-light transition disabled:opacity-50 flex items-center gap-1.5"
 >
 <span v-if="appStore.triggerScreeningLoading" class="inline-block w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
 Chấm Lại
 </button>
 <button @click="showScreening = false" class="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
 ✕
 </button>
 </div>
 </div>

 <!-- Loading -->
 <div v-if="appStore.screeningLoading" class="flex items-center justify-center py-24">
 <div class="inline-block w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
 </div>

 <!-- Empty -->
 <div v-else-if="appStore.screeningResults.length === 0" class="text-center py-24 px-6">
 <p class="text-sm text-gray-400 mb-2">Chưa có kết quả phân tích.</p>
 <p class="text-xs text-gray-400">Bấm "Phân Tích AI" để đánh giá mức độ phù hợp của các ứng viên.</p>
 </div>

 <!-- Results -->
 <div v-else class="px-6 py-6 space-y-4">
 <div
 v-for="sr in appStore.screeningResults"
 :key="sr.applicationId"
 @click="goToDetail(sr.applicationId); showScreening = false"
 class="premium-card p-5 cursor-pointer block hover:border-teal-400"
 >
 <!-- Candidate info + score -->
 <div class="flex items-start justify-between mb-3">
 <div>
 <span class="text-sm font-semibold text-gray-900 group-hover:text-primary transition">
 {{ sr.candidateName }}
 </span>
 <span class="block text-xs text-gray-400 mt-0.5">{{ sr.candidateEmail }}</span>
 </div>
 <div class="text-right">
 <span
 class="text-2xl font-bold tabular-nums"
 :class="getScoreColor(sr.aiScore)"
 >
 {{ sr.aiScore !== null ? sr.aiScore : '—' }}
 </span>
 <span class="block text-[10px] text-gray-400 mt-0.5">Điểm AI</span>
 </div>
 </div>

 <!-- Score bar -->
 <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
 <div
 class="h-full rounded-full transition-all duration-500"
 :class="getScoreBarColor(sr.aiScore)"
 :style="{ width: getScoreBarWidth(sr.aiScore) }"
 />
 </div>

 <!-- Similarity score if available -->
 <div v-if="sr.similarityScore !== null" class="flex items-center gap-2 mb-2 text-xs text-gray-500">
 <span>Độ Tương Thích:</span>
 <span class="font-medium" :class="getScoreColor(sr.similarityScore)">
 {{ sr.similarityScore }}%
 </span>
 </div>

 <!-- Score breakdown -->
 <div v-if="sr.scoreBreakdown" class="grid grid-cols-3 gap-2 mb-3">
 <div
 v-for="(score, key) in sr.scoreBreakdown"
 :key="key"
 class="text-center bg-gray-50 rounded-md py-1.5"
 >
 <span class="block text-xs font-semibold text-gray-700">{{ score }}</span>
 <span class="block text-[10px] text-gray-400 capitalize">{{ key }}</span>
 </div>
 </div>

 <!-- Strengths & Gaps (collapsed preview) -->
 <div class="grid grid-cols-2 gap-3">
 <div v-if="sr.strengths.length">
 <span class="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Điểm Mạnh</span>
 <ul class="space-y-0.5">
 <li v-for="(s, i) in sr.strengths.slice(0, 2)" :key="i" class="text-[11px] text-gray-600 flex items-start gap-1">
 <span class="text-green-500 mt-px shrink-0">✓</span>
 <span class="line-clamp-1">{{ s }}</span>
 </li>
 <li v-if="sr.strengths.length > 2" class="text-[10px] text-gray-400">
 +{{ sr.strengths.length - 2 }} nữa
 </li>
 </ul>
 </div>
 <div v-if="sr.gaps.length">
 <span class="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Cần Cải Thiện</span>
 <ul class="space-y-0.5">
 <li v-for="(g, i) in sr.gaps.slice(0, 2)" :key="i" class="text-[11px] text-gray-600 flex items-start gap-1">
 <span class="text-red-400 mt-px shrink-0">✗</span>
 <span class="line-clamp-1">{{ g }}</span>
 </li>
 <li v-if="sr.gaps.length > 2" class="text-[10px] text-gray-400">
 +{{ sr.gaps.length - 2 }} nữa
 </li>
 </ul>
 </div>
 </div>

 <!-- Summary -->
 <p v-if="sr.summary" class="mt-2 text-[11px] text-gray-500 line-clamp-2 italic">
 {{ sr.summary }}
 </p>
 </div>
 </div>
 </div>
 </div>
 </Teleport>
 </div>
</template>


