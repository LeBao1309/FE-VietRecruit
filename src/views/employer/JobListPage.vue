<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useJobStore } from '@/stores/jobStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import type { JobStatus } from '@/types/enums'
import BaseSkeleton from '@/components/common/BaseSkeleton.vue'
import BaseEmptyState from '@/components/common/BaseEmptyState.vue'

const router = useRouter()
const jobStore = useJobStore()
const subStore = useSubscriptionStore()

// ── Filter / Pagination ──
const currentPage = ref(0)
const pageSize = ref(10)
const statusFilter = ref<JobStatus | ''>('')

const statusOptions: { label: string; value: JobStatus | '' }[] = [
 { label: 'Tất Cả', value: '' },
 { label: 'Bản Nháp', value: 'DRAFT' },
 { label: 'Đang Mở', value: 'PUBLISHED' },
 { label: 'Đã Đóng', value: 'CLOSED' },
]

// ── Status display config ──
const statusConfig: Record<JobStatus, { label: string; class: string }> = {
 DRAFT: { label: 'Bản Nháp', class: 'bg-gray-100 text-gray-600' },
 PUBLISHED: { label: 'Đang Mở', class: 'bg-success-bg text-success' },
 CLOSED: { label: 'Đã Đóng', class: 'bg-error-bg text-error' },
}

// ── Load ──
async function loadJobs(): Promise<void> {
 await jobStore.fetchJobs({
 page: currentPage.value,
 size: pageSize.value,
 status: statusFilter.value || undefined,
 sort: 'createdAt,desc',
 })
}

// Reload when filters change
watch(statusFilter, () => {
 currentPage.value = 0
 loadJobs()
})
watch(currentPage, () => loadJobs())

// ── Pagination helpers ──
const canGoPrev = computed(() => currentPage.value > 0)
const canGoNext = computed(() => currentPage.value < jobStore.totalPages - 1)
function prevPage(): void {
 if (canGoPrev.value) currentPage.value--
}
function nextPage(): void {
 if (canGoNext.value) currentPage.value++
}

// ── Quota info ──
const quotaText = computed(() => {
 const q = subStore.currentQuota
 if (!q) return null
 if (q.maxActiveJobs < 0) return 'Không giới hạn bài rải'
 return `Đã dùng ${q.jobsActive} / ${q.maxActiveJobs} bài đăng`
})

// ── Navigation ──
function goToCreate(): void {
 router.push('/employer/jobs/new')
}
function goToDetail(id: string): void {
 router.push(`/employer/jobs/${id}`)
}

// ── Date formatting (lean → no external dep) ──
function formatDate(iso: string): string {
 const d = new Date(iso)
 return d.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatSalary(min: number | null, max: number | null, currency: string | null, negotiable: boolean | null): string {
 if (!min && !max) return negotiable ? 'Thỏa thuận' : '—'
 const cur = currency ?? 'VND'
 const fmt = (n: number) => n.toLocaleString('vi-VN')
 if (min && max) return `${fmt(min)} – ${fmt(max)} ${cur}`
 if (min) return `Từ ${fmt(min)} ${cur}`
 if (max) return `Lên tới ${fmt(max)} ${cur}`
 return '—'
}

onMounted(() => {
 loadJobs()
 subStore.fetchCurrentQuota()
})
</script>

<template>
 <div class="max-w-6xl mx-auto px-6 pb-8 md:px-8">
 
 <!-- Header -->
 <div class="flex items-start justify-between mb-6">
 <div>
 <h1 class="text-xl font-bold text-slate-900 ">Tin Tuyển Dụng</h1>
 <p class="text-sm text-slate-500 mt-1">
 Quản lý bài tuyển dụng, đăng tin mới và theo dõi trạng thái.
 </p>
 <!-- Quota indicator -->
 <div v-if="quotaText" class="mt-3 flex items-center gap-2">
 <div class="flex-1 w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
 <div
 class="h-full rounded-full transition-all duration-700 ease-out"
 :class="subStore.isQuotaFull ? 'bg-rose-500' : 'bg-teal-500'"
 :style="{ width: `${Math.min(subStore.quotaUsagePercent, 100)}%` }"
 />
 </div>
 <span class="text-xs font-semibold" :class="subStore.isQuotaFull ? 'text-rose-500' : 'text-slate-400'">
 {{ quotaText }}
 </span>
 </div>
 </div>
 <button
 @click="goToCreate"
 class="px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 hover:-translate-y-0.5 hover:shadow-md rounded-lg transition-all flex items-center gap-1.5 shrink-0 outline-none focus:ring-2 focus:ring-teal-500/50"
 >
 <span class="text-lg leading-none">+</span> Tạo Mới
 </button>
 </div>

 <!-- Filters Bar -->
 <div class="flex items-center gap-3 mb-4">
 <div class="relative">
 <select
 v-model="statusFilter"
 @change="currentPage = 0"
 class="appearance-none pl-3 pr-8 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none cursor-pointer shadow-sm"
 >
 <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
 {{ opt.label }}
 </option>
 </select>
 <svg class="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
 </div>
 <span class="text-xs font-medium text-slate-400 ml-auto">
 Tổng {{ jobStore.totalJobs }} tin
 </span>
 </div>

 <!-- Loading skeleton -->
 <div v-if="jobStore.loading" class="bg-surface border border-border rounded-lg shadow-sm p-4">
 <BaseSkeleton height="40px" class="mb-4" />
 <BaseSkeleton v-for="i in 5" :key="i" height="50px" class="mb-2 last:mb-0" />
 </div>

 <!-- Table -->
 <div v-else class="bg-surface border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
 <div class="overflow-x-auto w-full">
 <table class="w-full whitespace-nowrap text-left">
 <thead>
 <tr class="border-b border-slate-200/60 bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
 <th class="px-5 py-3">Tiêu Đề Vị Trí</th>
 <th class="px-5 py-3 w-28">Trạng Thái</th>
 <th class="px-5 py-3">Thu Nhập</th>
 <th class="px-5 py-3 w-28">Hạn Chót</th>
 <th class="px-5 py-3 w-28 text-right">Ngày Tạo</th>
 </tr>
 </thead>
 <tbody>
 <tr v-if="jobStore.jobList.length === 0">
 <td colspan="5" class="p-4">
 <BaseEmptyState 
 title="Chưa có tin tuyển dụng nào" 
 description="Bạn hãy ấn tạo mới để bắt đầu tuyển ứng viên nhé." 
 icon="📝"
 >
 <template #action>
 <button @click="goToCreate" class="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-teal-500/50">
 + Tạo Mới
 </button>
 </template>
 </BaseEmptyState>
 </td>
 </tr>
 <tr
 v-for="job in jobStore.jobList"
 :key="job.id"
 @click="goToDetail(job.id)"
 class="border-b border-slate-100 last:border-0 hover:bg-slate-50 :bg-slate-800/50 transition-colors cursor-pointer group"
 >
 <td class="px-5 py-4">
 <span class="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">{{ job.title }}</span>
 </td>
 <td class="px-5 py-4">
 <span
 class="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide"
 :class="statusConfig[job.status].class"
 >
 {{ statusConfig[job.status].label }}
 </span>
 </td>
 <td class="px-5 py-4 text-sm font-medium text-slate-500 ">
 {{ formatSalary(job.minSalary, job.maxSalary, job.currency, job.isNegotiable) }}
 </td>
 <td class="px-5 py-4 text-sm font-medium text-slate-500 ">
 {{ job.deadline ? formatDate(job.deadline) : '—' }}
 </td>
 <td class="px-5 py-4 text-sm font-medium text-slate-400 text-right">
 {{ formatDate(job.createdAt) }}
 </td>
 </tr>
 </tbody>
 </table>
 </div>

 <!-- Pagination -->
 <div v-if="jobStore.totalPages > 1" class="flex items-center justify-between px-5 py-4 border-t border-slate-200/60 bg-slate-50/50 text-sm font-medium text-slate-500">
 <span>
 Trang {{ currentPage + 1 }} / {{ jobStore.totalPages }}
 </span>
 <div class="flex items-center gap-2">
 <button
 @click="prevPage"
 :disabled="!canGoPrev"
 class="px-3 py-1.5 border border-slate-200 rounded-lg transition-all shadow-sm outline-none focus:ring-2 focus:ring-slate-400/50 bg-white hover:bg-slate-50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
 >
 ‹ Trước
 </button>
 <button
 @click="nextPage"
 :disabled="!canGoNext"
 class="px-3 py-1.5 border border-slate-200 rounded-lg transition-all shadow-sm outline-none focus:ring-2 focus:ring-slate-400/50 bg-white hover:bg-slate-50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
 >
 Sau ›
 </button>
 </div>
 </div>
 </div>
 </div>
</template>
