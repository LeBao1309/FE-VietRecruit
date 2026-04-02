<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { applicationService } from '@/services/applicationService'
import type { PageResponse } from '@/types/common'
import type { ApplicationSummaryResponse } from '@/types/application'

const router = useRouter()

// ── State ──
const loading = ref(true)
const applications = ref<PageResponse<ApplicationSummaryResponse> | null>(null)
const page = ref(0)
const pageSize = ref(10)
const statusFilter = ref<string>('')

import MiniStepper from '@/components/candidate/MiniStepper.vue'

const STATUS_FILTERS: { label: string; value: string }[] = [
 { label: 'All', value: '' },
 { label: 'Applied', value: 'NEW' },
 { label: 'Screening', value: 'SCREENING' },
 { label: 'Interview', value: 'INTERVIEW' },
 { label: 'Offer', value: 'OFFER' },
 { label: 'Hired', value: 'HIRED' },
 { label: 'Rejected', value: 'REJECTED' },
]

// ── Computed ──
const appList = computed(() => applications.value?.content ?? [])
const totalElements = computed(() => applications.value?.totalElements ?? 0)
const totalPages = computed(() => applications.value?.totalPages ?? 0)

// ── Load ──
async function loadApplications(): Promise<void> {
 loading.value = true
 try {
 const params: Record<string, unknown> = {
 page: page.value,
 size: pageSize.value,
 sort: 'createdAt,desc',
 }
 if (statusFilter.value) {
 params.status = statusFilter.value
 }
 const result = await applicationService.listMyApplications(params)
 if (result.data) {
 applications.value = result.data
 }
 } finally {
 loading.value = false
 }
}

// ── Pagination ──
function goToPage(p: number): void {
 page.value = p
}

watch([page], () => loadApplications())

// ── Helpers ──
function formatDate(iso: string): string {
 return new Date(iso).toLocaleDateString('en-US', {
 month: 'short', day: 'numeric', year: 'numeric',
 })
}

onMounted(() => loadApplications())
</script>

<template>
 <div class="max-w-4xl mx-auto px-6 py-10">
 <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
 <div>
 <h1 class="text-3xl font-extrabold text-slate-900 mb-2">My Applications</h1>
 <p class="text-sm font-medium text-slate-500">Track the progress of your job applications.</p>
 </div>
 <router-link
 to="/jobs"
 class="btn-primary py-2.5 px-6 shrink-0"
 >
 Browse Jobs
 </router-link>
 </div>

 <!-- Status filter pills -->
 <div class="flex items-center gap-2.5 mb-8 flex-wrap">
 <button
 v-for="filter in STATUS_FILTERS"
 :key="filter.value"
 @click="statusFilter = filter.value; page = 0; loadApplications()"
 class="px-4 py-2 text-xs font-bold rounded-xl border transition-colors shadow-sm whitespace-nowrap outline-none focus:ring-2 focus:ring-teal-500/30"
 :class="statusFilter === filter.value
 ? 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700'
 : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 :border-teal-700'"
 >
 {{ filter.label }}
 </button>
 </div>

 <!-- Loading -->
 <div v-if="loading" class="space-y-4">
 <div v-for="i in 5" :key="i" class="premium-card p-6 animate-pulse">
 <div class="flex items-center justify-between mb-4">
 <div class="space-y-3 flex-1 pr-6">
 <div class="h-4 bg-slate-200 rounded w-48" />
 <div class="h-3 bg-slate-200 rounded w-32" />
 </div>
 <div class="w-8 h-8 bg-slate-200 rounded-full shrink-0" />
 </div>
 <div class="h-4 bg-slate-200 rounded w-full" />
 </div>
 </div>

 <!-- Empty -->
 <div v-else-if="appList.length === 0" class="premium-card p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
 <span class="text-5xl mb-4 opacity-50">📋</span>
 <h2 class="text-lg font-bold text-slate-900 mb-2">No Applications Yet</h2>
 <p class="text-sm font-medium text-slate-500 mb-6">Start applying to jobs to track your progress here.</p>
 <router-link
 to="/jobs"
 class="btn-primary py-2.5 px-8"
 >
 Browse Jobs
 </router-link>
 </div>

 <!-- Application List -->
 <div v-else class="space-y-4">
 <div
 v-for="app in appList"
 :key="app.id"
 @click="router.push(`/candidate/applications/${app.id}`)"
 class="premium-card p-6 flex flex-col gap-6 hover:shadow-lg hover:-translate-y-0.5 hover:border-teal-500/30 :border-teal-500/30 transition-all duration-300 cursor-pointer group"
 >
 <div class="flex items-start justify-between">
 <div class="min-w-0 pr-4">
 <h3 class="text-lg font-bold text-slate-900 group-hover:text-teal-600 :text-teal-400 transition-colors truncate mb-1">
 {{ app.jobTitle }}
 </h3>
 <p class="text-xs font-medium text-slate-500">
 Applied {{ formatDate(app.createdAt) }}
 </p>
 </div>
 <div class="shrink-0 flex items-center">
 <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-teal-50 :bg-teal-900/40 group-hover:text-teal-600 :text-teal-400 transition-colors">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </div>
 </div>
 
 <!-- Application Progress Visualization -->
 <MiniStepper :status-code="app.status" />
 </div>

 <!-- Pagination -->
 <div v-if="totalPages > 1" class="flex items-center justify-between pt-6 border-t border-slate-100 ">
 <span class="text-xs font-medium text-slate-500">
 Showing <span class="font-bold">{{ totalElements }}</span> application{{ totalElements !== 1 ? 's' : '' }}
 </span>
 <div class="flex items-center gap-1.5">
 <button
 @click="goToPage(page - 1)"
 :disabled="page === 0"
 class="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 :bg-slate-700 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
 >
 &larr; Prev
 </button>
 <button
 v-for="p in totalPages"
 :key="p"
 @click="goToPage(p - 1)"
 class="w-8 h-8 text-xs font-bold rounded-lg transition-colors border"
 :class="page === p - 1
 ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
 : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 :bg-slate-700 hover:border-slate-300'"
 >
 {{ p }}
 </button>
 <button
 @click="goToPage(page + 1)"
 :disabled="page >= totalPages - 1"
 class="px-3 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 :bg-slate-700 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
 >
 Next &rarr;
 </button>
 </div>
 </div>
 </div>
 </div>
</template>
