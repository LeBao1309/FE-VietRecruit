<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useJobStore } from '@/stores/jobStore'
import BaseSkeleton from '@/components/common/BaseSkeleton.vue'

const router = useRouter()
const subStore = useSubscriptionStore()
const jobStore = useJobStore()

const loading = ref(true)

// ── Stats ──
const stats = computed(() => {
 const list = jobStore.jobList
 const draft = list.filter((j) => j.status === 'DRAFT').length
 const published = list.filter((j) => j.status === 'PUBLISHED').length
 const closed = list.filter((j) => j.status === 'CLOSED').length
 return { draft, published, closed, total: list.length }
})

const quota = computed(() => subStore.currentQuota)

// ── Load ──
onMounted(async () => {
 try {
 await Promise.all([
 subStore.fetchCurrentQuota(),
 subStore.fetchCurrentSubscription(),
 jobStore.fetchJobs({ size: 100 }),
 ])
 } finally {
 loading.value = false
 }
})
</script>

<template>
 <div class="max-w-6xl mx-auto px-6 pb-8 md:px-8">
 
 <div class="mb-6">
 <h1 class="text-xl font-bold text-gray-900 ">Bảng Điều Khiển Nhà Tuyển Dụng</h1>
 <p class="text-sm text-gray-500 mt-1">Tổng quan về quy trình tuyển dụng và các chỉ số chính.</p>
 </div>

 <!-- Loading -->
 <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 <div v-for="i in 4" :key="i" class="bg-surface border border-border rounded-lg p-5 shadow-sm">
 <BaseSkeleton width="80px" height="12px" class="mb-3" />
 <BaseSkeleton width="48px" height="24px" />
 </div>
 </div>

 <template v-else>
 <!-- Stats Cards -->
 <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 <!-- Total Jobs -->
 <div class="bg-surface border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out group">
 <div class="flex items-center gap-3 mb-3">
 <div class="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
 </div>
 <span class="text-xs font-bold uppercase tracking-wider text-slate-500 ">Tổng Số Công Việc</span>
 </div>
 <p class="text-3xl font-extrabold text-slate-900 tracking-tight">{{ stats.total }}</p>
 </div>

 <!-- Published -->
 <div class="bg-surface border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out group">
 <div class="flex items-center gap-3 mb-3">
 <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
 </div>
 <span class="text-xs font-bold uppercase tracking-wider text-slate-500 ">Đã Xuất Bản</span>
 </div>
 <p class="text-3xl font-extrabold text-emerald-600 tracking-tight">{{ stats.published }}</p>
 </div>

 <!-- Drafts -->
 <div class="bg-surface border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out group">
 <div class="flex items-center gap-3 mb-3">
 <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
 </div>
 <span class="text-xs font-bold uppercase tracking-wider text-slate-500 ">Bản Nháp</span>
 </div>
 <p class="text-3xl font-extrabold text-amber-600 tracking-tight">{{ stats.draft }}</p>
 </div>

 <!-- Closed -->
 <div class="bg-surface border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ease-out group">
 <div class="flex items-center gap-3 mb-3">
 <div class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
 </div>
 <span class="text-xs font-bold uppercase tracking-wider text-slate-500 ">Đã Đóng</span>
 </div>
 <p class="text-3xl font-extrabold text-rose-600 tracking-tight">{{ stats.closed }}</p>
 </div>
 </div>

 <!-- Quota Card -->
 <div v-if="quota" class="bg-surface border border-slate-200/60 rounded-2xl p-5 shadow-sm mb-6 hover:shadow-md transition-shadow duration-200">
 <div class="flex items-center justify-between mb-4">
 <h2 class="text-sm font-bold text-slate-900 ">Giới Hạn Công Việc Mở</h2>
 <span class="text-xs font-medium px-2 py-1 bg-slate-100 rounded-md text-slate-500 ">
 {{ subStore.hasActiveSubscription ? subStore.currentSubscription?.planName : 'Không có gói dịch vụ nào' }}
 </span>
 </div>
 <div class="flex items-center gap-4">
 <div class="flex-1">
 <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
 <div
 class="h-full rounded-full transition-all duration-700 ease-out"
 :class="subStore.isQuotaFull ? 'bg-rose-500' : 'bg-teal-500'"
 :style="{ width: `${Math.min(subStore.quotaUsagePercent, 100)}%` }"
 />
 </div>
 </div>
 <span class="text-sm font-bold shrink-0" :class="subStore.isQuotaFull ? 'text-rose-500' : 'text-slate-700 '">
 {{ quota.jobsActive }} <span class="text-slate-400 font-medium">/ {{ quota.maxActiveJobs < 0 ? '∞' : quota.maxActiveJobs }}</span>
 </span>
 </div>
 <p class="text-xs text-slate-400 mt-3 font-medium">
 Chu kỳ: {{ new Date(quota.cycleStart).toLocaleDateString() }} – {{ new Date(quota.cycleEnd).toLocaleDateString() }}
 </p>
 <div v-if="subStore.isQuotaFull" class="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-rose-50 text-rose-600 text-sm">
 <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
 <span class="font-medium">Đã đạt đến giới hạn số lượng công việc.</span>
 <router-link to="/employer/pricing" class="font-semibold underline hover:text-rose-700 transition-colors ml-auto">Nâng cấp gói dịch vụ</router-link>
 </div>
 </div>

 <!-- Quick Actions -->
 <div class="bg-surface border border-slate-200/60 rounded-2xl p-5 shadow-sm">
 <h2 class="text-sm font-bold text-slate-900 mb-4">Các Thao Tác Nhanh</h2>
 <div class="flex flex-wrap items-center gap-3">
 <button
 @click="router.push('/employer/jobs/new')"
 class="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 hover:-translate-y-0.5 hover:shadow-md rounded-lg transition-all focus:ring-2 focus:ring-teal-500/50 outline-none"
 >
 + Tạo Việc Mới
 </button>
 <button
 @click="router.push('/employer/jobs')"
 class="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 :bg-teal-900/50 hover:-translate-y-0.5 rounded-lg transition-all border border-teal-200/50 focus:ring-2 focus:ring-teal-500/50 outline-none"
 >
 Xem Tất Cả Công Việc
 </button>
 <button
 @click="router.push('/employer/organization')"
 class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 :bg-slate-700 hover:-translate-y-0.5 transition-all shadow-sm focus:ring-2 focus:ring-slate-400/50 outline-none"
 >
 Thông Tin Công Ty
 </button>
 </div>
 </div>
 </template>
 </div>
</template>
