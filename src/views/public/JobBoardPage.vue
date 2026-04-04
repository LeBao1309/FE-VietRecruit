<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { jobService } from '@/services/jobService'
import { candidateService } from '@/services/candidateService'
import PublicNavbar from '@/components/common/PublicNavbar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import type { JobSearchResponse, JobSummaryResponse } from '@/types/job'
import type { SearchPageResponse, PageResponse } from '@/types/common'

const router = useRouter()
const auth = useAuthStore()

// ── CV guard: only show match scores when candidate has uploaded a CV ──
const hasCv = ref(false)
async function loadCvStatus(): Promise<void> {
 if (!auth.isCandidate) return
 const result = await candidateService.getProfile()
 if (result.data) hasCv.value = !!result.data.defaultCvUrl
}

// ── Search mode ──
type Mode = 'browse' | 'search'
const mode = ref<Mode>('browse')

// ── Search state ──
const searchQuery = ref('')
const locationQuery = ref('')
const debouncedQuery = ref('')
const autocompleteResults = ref<string[]>([])
const showAutocomplete = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let autocompleteSeq = 0
let searchSeq = 0

function onSearchBlur(): void {
 setTimeout(() => { showAutocomplete.value = false }, 200)
}

// ── Filters ──
const salaryMin = ref('')
const salaryMax = ref('')
const currency = ref('VND')

// ── Pagination ──
const currentPage = ref(0)
const pageSize = ref(24)

// ── Browse results (GET /jobs/public) ──
const browseData = ref<PageResponse<JobSummaryResponse> | null>(null)
const browseLoading = ref(false)

// ── Search results (GET /jobs/search) ──
const searchData = ref<SearchPageResponse<JobSearchResponse> | null>(null)
const searchLoading = ref(false)

// ── Computed ──
const isLoading = computed(() => browseLoading.value || searchLoading.value)
const isEmpty = computed(() => {
 if (mode.value === 'browse') return browseData.value?.empty ?? true
 return searchData.value?.empty ?? true
})
const totalPages = computed(() => {
 if (mode.value === 'browse') return browseData.value?.totalPages ?? 0
 return searchData.value?.totalPages ?? 0
})
const totalElements = computed(() => {
 if (mode.value === 'browse') return browseData.value?.totalElements ?? 0
 return searchData.value?.totalElements ?? 0
})
const canGoPrev = computed(() => currentPage.value > 0)
const canGoNext = computed(() => currentPage.value < totalPages.value - 1)
const pageNumbers = computed<(number | '...')[]>(() => {
  const total = totalPages.value
  const cur = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i)
  const pages: (number | '...')[] = [0]
  if (cur > 2) pages.push('...')
  for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) pages.push(i)
  if (cur < total - 3) pages.push('...')
  pages.push(total - 1)
  return pages
})

// ── Browse: load published jobs ──
async function loadPublicJobs(): Promise<void> {
 browseLoading.value = true
 try {
 const result = await jobService.listPublicJobs({
 page: currentPage.value,
 size: pageSize.value,
 sort: 'createdAt,desc',
 })
 if (result.data) browseData.value = result.data
 } finally {
 browseLoading.value = false
 }
}

// ── Search: full-text search ──
async function loadSearchResults(): Promise<void> {
 if (!debouncedQuery.value.trim()) {
 mode.value = 'browse'
 loadPublicJobs()
 return
 }
 const seq = ++searchSeq
 searchLoading.value = true
 mode.value = 'search'
 try {
 const result = await jobService.searchJobs({
 q: debouncedQuery.value.trim(),
 salaryMin: salaryMin.value ? Number(salaryMin.value) : undefined,
 salaryMax: salaryMax.value ? Number(salaryMax.value) : undefined,
 currency: currency.value || undefined,
 page: currentPage.value,
 size: pageSize.value,
 })
 if (seq !== searchSeq) return
 if (result.data) searchData.value = result.data
 } finally {
 if (seq === searchSeq) searchLoading.value = false
 }
}

// ── Autocomplete ──
async function fetchAutocomplete(): Promise<void> {
 if (searchQuery.value.trim().length < 2) {
 autocompleteResults.value = []
 showAutocomplete.value = false
 return
 }
 const seq = ++autocompleteSeq
 const result = await jobService.autocomplete(searchQuery.value.trim(), 6)
 if (seq !== autocompleteSeq) return
 if (result.data) {
 autocompleteResults.value = result.data
 showAutocomplete.value = result.data.length > 0
 }
}

function selectAutocomplete(text: string): void {
 searchQuery.value = text
 showAutocomplete.value = false
 handleSearch()
}

function onSearchInput(): void {
 if (debounceTimer) clearTimeout(debounceTimer)
 debounceTimer = setTimeout(() => {
 fetchAutocomplete()
 }, 250)
}

function handleSearch(): void {
 showAutocomplete.value = false
 currentPage.value = 0
 
 const queryParts = []
 if (searchQuery.value.trim()) queryParts.push(searchQuery.value.trim())
 if (locationQuery.value.trim()) queryParts.push(locationQuery.value.trim())
 
 debouncedQuery.value = queryParts.join(' ')
 
 if (debouncedQuery.value) {
 loadSearchResults()
 } else {
 mode.value = 'browse'
 loadPublicJobs()
 }
}

function clearSearch(): void {
 searchQuery.value = ''
 locationQuery.value = ''
 debouncedQuery.value = ''
 autocompleteResults.value = []
 showAutocomplete.value = false
 mode.value = 'browse'
 currentPage.value = 0
 loadPublicJobs()
}

// ── Pagination ──
function prevPage(): void {
 if (canGoPrev.value) {
 currentPage.value--
 mode.value === 'search' ? loadSearchResults() : loadPublicJobs()
 }
}
function nextPage(): void {
 if (canGoNext.value) {
 currentPage.value++
 mode.value === 'search' ? loadSearchResults() : loadPublicJobs()
 }
}
function goToPage(p: number): void {
 currentPage.value = p
 mode.value === 'search' ? loadSearchResults() : loadPublicJobs()
}

// ── Navigation ──
function goToJob(id: string): void {
 router.push(`/jobs/${id}`)
}

// ── Formatting ──
function formatSalary(min: number | null, max: number | null, cur: string | null, negotiable: boolean | null): string {
 if (!min && !max) return negotiable ? 'Thỏa thuận' : '—'
 const c = cur ?? 'VND'
 const fmt = (n: number) => n.toLocaleString('en-US')
 if (min && max) return `${fmt(min)} – ${fmt(max)} ${c}`
 if (min) return `Từ ${fmt(min)} ${c}`
 if (max) return `Đến ${fmt(max)} ${c}`
 return '—'
}

function formatDate(iso: string): string {
 return new Date(iso).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })
}

function timeAgo(iso: string): string {
 const diff = Date.now() - new Date(iso).getTime()
 const days = Math.floor(diff / (1000 * 60 * 60 * 24))
 if (days === 0) return 'Hôm nay'
 if (days === 1) return '1 ngày trước'
 if (days < 30) return `${days} ngày trước`
 const months = Math.floor(days / 30)
 return months === 1 ? '1 tháng trước' : `${months} tháng trước`
}

// ── Score normalization & color ──
function normalizeScore(raw: number): number {
  return Math.min(Math.round(raw * 100), 100)
}
function scoreColorClass(pct: number): string {
  if (pct >= 70) return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
  if (pct >= 40) return 'bg-amber-100 text-amber-700 border border-amber-200'
  return 'bg-rose-100 text-rose-700 border border-rose-200'
}
function scoreDotColor(pct: number): string {
  if (pct >= 70) return 'bg-emerald-500'
  if (pct >= 40) return 'bg-amber-500'
  return 'bg-rose-500'
}

onMounted(() => {
 loadPublicJobs()
 loadCvStatus()
})

onUnmounted(() => {
 if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
 <div class="min-h-screen flex flex-col">
 <!-- Header / Nav -->
 <PublicNavbar />

 <!-- Hero / Search Section -->
 <section class="bg-white px-6 pt-20 pb-16 relative overflow-hidden border-b border-slate-200">
 <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none" aria-hidden="true">
 <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-teal-50 to-emerald-50 opacity-60 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
 </div>

 <div class="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up">
 <h1 class="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
 Tìm Kiếm <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Cơ Hội Tiếp Theo</span>
 </h1>
 <p class="text-lg sm:text-xl font-medium text-slate-500 max-w-2xl mx-auto">
 Khám phá các vị trí mở từ những công ty hàng đầu và tiến xa hơn trong sự nghiệp.
 </p>
 </div>

 <!-- Search Box -->
 <div class="max-w-4xl mx-auto relative group animate-fade-in-up" style="animation-delay: 100ms;">
 <form @submit.prevent="handleSearch" class="bg-white p-2 sm:p-3 rounded-3xl shadow-xl border border-slate-200 flex flex-col sm:flex-row gap-2 transition-all hover:shadow-2xl">
 <!-- Keyword input -->
 <div class="relative flex-1 flex items-center border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0 mb-2 sm:mb-0">
 <div class="absolute left-4 text-slate-400 group-focus-within:text-teal-500 transition-colors">
 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
 </div>
 <input
 v-model="searchQuery"
 @input="onSearchInput"
 @focus="showAutocomplete = autocompleteResults.length > 0"
 @blur="onSearchBlur"
 type="text"
 placeholder="Chức danh, kỹ năng, hoặc công ty..."
 class="w-full pl-12 pr-10 py-3.5 text-base sm:text-lg bg-transparent border-0 outline-none focus:ring-0 text-slate-900 placeholder:text-slate-400 font-medium"
 />
 <button
 v-if="searchQuery"
 type="button"
 @click="searchQuery = ''"
 class="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
 >
 ✕
 </button>

 <!-- Autocomplete dropdown -->
 <div
 v-if="showAutocomplete && autocompleteResults.length > 0"
 class="absolute left-0 right-0 top-[calc(100%+16px)] premium-card overflow-hidden shadow-xl z-20 animate-slide-up origin-top"
 >
 <button
 v-for="(item, i) in autocompleteResults"
 :key="i"
 type="button"
 @mousedown.prevent="selectAutocomplete(item)"
 class="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors"
 >
 {{ item }}
 </button>
 </div>
 </div>

 <!-- Location input -->
 <div class="relative flex-1 flex items-center">
 <div class="absolute left-4 text-slate-400 transition-colors">
 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
 </div>
 <input
 v-model="locationQuery"
 type="text"
 placeholder="Thành phố, quận, hoặc remote..."
 class="w-full pl-12 pr-10 py-3.5 text-base sm:text-lg bg-transparent border-0 outline-none focus:ring-0 text-slate-900 placeholder:text-slate-400 font-medium"
 />
 <button
 v-if="locationQuery"
 type="button"
 @click="locationQuery = ''"
 class="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
 >
 ✕
 </button>
 </div>

 <!-- Submit Button -->
 <button
 type="submit"
 class="btn-primary py-3.5 px-8 shrink-0 rounded-2xl shadow-sm hover:shadow-md sm:w-auto w-full text-lg"
 >
 Tìm Kiếm
 </button>
 </form>

 <!-- Active search indicator -->
 <div v-if="mode === 'search' && debouncedQuery" class="flex items-center justify-center gap-2 mt-6">
 <span class="text-sm font-medium text-slate-500">
 Kết quả cho "<span class="font-bold text-slate-900">{{ debouncedQuery }}</span>"
 </span>
 <button @click="clearSearch" class="text-sm text-teal-600 hover:text-teal-500 font-bold ml-2 transition-colors border-b border-teal-600/30">
 Xóa Tất Cả
 </button>
 </div>
 </div>
 </section>

 <!-- Results -->
 <main class="flex-1 max-w-6xl mx-auto w-full px-6 py-10 bg-white border-t border-slate-200">
 <!-- Results count -->
 <div class="flex items-center justify-between mb-6">
 <span class="text-sm font-bold text-slate-500">
 {{ totalElements }} việc làm được tìm thấy
 </span>
 </div>

 <!-- Loading -->
 <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 <div v-for="i in 12" :key="i" class="premium-card p-6 animate-pulse">
 <div class="h-5 bg-slate-200 rounded-md w-3/4 mb-4" />
 <div class="h-3 bg-slate-200 rounded w-1/2 mb-5" />
 <div class="h-3 bg-slate-200 rounded w-full mb-2.5" />
 <div class="h-3 bg-slate-200 rounded w-2/3" />
 </div>
 </div>

 <!-- Empty state -->
 <div v-else-if="isEmpty" class="text-center py-24">
 <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-3xl mx-auto mb-4">
 🔍
 </div>
 <div class="text-slate-500 text-sm">
 <p class="font-bold text-slate-900 mb-1.5 text-base">
 {{ mode === 'search' ? 'Không tìm thấy việc làm phù hợp' : 'Chưa có vị trí mở nào' }}
 </p>
 <p class="font-medium">
 {{ mode === 'search' ? 'Thử từ khóa khác hoặc xóa bộ lọc.' : 'Quay lại sau để xem cơ hội mới.' }}
 </p>
 <button v-if="mode === 'search'" @click="clearSearch" class="mt-4 px-4 py-2 text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-xl font-bold transition-colors">
 Xóa Tìm Kiếm
 </button>
 </div>
 </div>

 <!-- Browse mode: card grid -->
 <template v-else-if="mode === 'browse' && browseData">
 <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 <div
 v-for="job in browseData.content"
 :key="job.id"
 @click="goToJob(job.id)"
 class="premium-card p-6 border-slate-200 transition-all duration-300 cursor-pointer group flex flex-col h-full bg-white hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(20,184,166,0.3)] hover:border-teal-400/50"
 >
 <div class="mb-5 flex-1">
 <h3 class="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
 {{ job.title }}
 </h3>
 <p class="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1.5">
 <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
 {{ timeAgo(job.createdAt) }}
 </p>
 </div>
 <div class="space-y-3 mt-auto pt-4 border-t border-slate-100">
 <div class="flex items-center justify-between">
 <span v-if="auth.isAuthenticated" class="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100">
 {{ formatSalary(job.minSalary, job.maxSalary, job.currency, job.isNegotiable) }}
 </span>
 <router-link v-else to="/login" @click.stop class="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold border border-slate-200 hover:border-teal-300 hover:text-teal-600 transition-colors">
 <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
 Đăng nhập để xem mức lương
 </router-link>
 </div>
 <div v-if="job.deadline" class="text-xs font-medium text-rose-500/80 flex items-center gap-1.5 pt-1">
 <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
 Hạn: {{ formatDate(job.deadline) }}
 </div>
 </div>
 </div>
 </div>
 </template>

 <!-- Search mode: list with highlights -->
 <template v-else-if="mode === 'search' && searchData">
 <div class="space-y-4">
 <div
 v-for="job in searchData.content"
 :key="job.id"
 @click="goToJob(job.id)"
 class="premium-card p-6 md:p-8 hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(20,184,166,0.3)] hover:border-teal-400/50 transition-all duration-300 cursor-pointer group bg-white"
 >
 <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
 <div class="min-w-0 flex-1">
 <h3 class="text-xl font-extrabold text-slate-900 group-hover:text-teal-600 transition-colors mb-2">
 {{ job.title }}
 </h3>
 <div class="flex items-center gap-3 text-sm font-semibold text-slate-500 mb-4 flex-wrap">
 <span v-if="job.companyName" class="text-slate-800 font-extrabold flex items-center gap-1.5">
 <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
 {{ job.companyName }}
 </span>
 <span v-if="job.locationName" class="flex items-center gap-1.5 text-slate-500">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
 {{ job.locationName }}
 </span>
 <span v-if="job.categoryName" class="flex items-center gap-1.5 text-slate-500">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
 {{ job.categoryName }}
 </span>
 </div>
 <!-- Description snippet (clean markdown) -->
 <p v-if="job.description" class="text-sm font-medium text-slate-500 line-clamp-2 mb-4 leading-relaxed">
 {{ job.description?.replace(/##\s*/g, '').substring(0, 200) }}
 </p>
 <!-- Highlights (max 3) -->
 <div v-if="job.highlights" class="flex flex-wrap gap-1.5 mt-auto">
 <template v-for="(values, field) in job.highlights" :key="field">
 <span
 v-for="(val, i) in values.slice(0, 3)"
 :key="`${field}-${i}`"
 class="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold bg-teal-50 text-teal-700 rounded-md border border-teal-100 max-w-[260px] truncate"
 v-html="val"
 />
 </template>
 </div>
 </div>
 <div class="sm:text-right shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-4 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
 <span v-if="auth.isAuthenticated" class="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100 shadow-sm">
 {{ formatSalary(job.minSalary, job.maxSalary, job.currency, job.isNegotiable) }}
 </span>
 <router-link v-else to="/login" @click.stop class="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold border border-slate-200 hover:border-teal-300 hover:text-teal-600 transition-colors shadow-sm">
 <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
 Đăng nhập để xem
 </router-link>
 <p class="text-xs font-bold text-slate-400 flex items-center justify-end gap-1.5">
 <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
 {{ timeAgo(job.createdAt) }}
 </p>
 <div v-if="hasCv && job.score !== null && job.score !== undefined" class="mt-2 text-right">
 <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide"
 :class="scoreColorClass(normalizeScore(job.score))"
 >
 <span class="w-1.5 h-1.5 rounded-full" :class="scoreDotColor(normalizeScore(job.score))"></span>
 {{ normalizeScore(job.score) }}% phù hợp
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </template>

 <!-- Pagination -->
 <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-slate-200">
 <span class="text-sm font-bold text-slate-500 order-2 sm:order-1">
 Trang {{ currentPage + 1 }} / {{ totalPages }} &mdash; {{ totalElements }} việc làm
 </span>
 <div class="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
 <button
 @click="prevPage"
 :disabled="!canGoPrev"
 class="px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600"
 >
 &larr;
 </button>
 <template v-for="(p, i) in pageNumbers" :key="i">
 <span v-if="p === '...'" class="px-2 py-2 text-sm text-slate-400 font-bold select-none">…</span>
 <button
 v-else
 @click="goToPage(p)"
 class="min-w-[36px] px-3 py-2 text-sm font-bold rounded-xl border transition-all"
 :class="p === currentPage
 ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
 : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
 >
 {{ p + 1 }}
 </button>
 </template>
 <button
 @click="nextPage"
 :disabled="!canGoNext"
 class="px-3 py-2 text-sm font-bold border border-slate-200 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-600"
 >
 &rarr;
 </button>
 </div>
 </div>
 </main>

 <!-- Footer -->
 <AppFooter />
 </div>
</template>
