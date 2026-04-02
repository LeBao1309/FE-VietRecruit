<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { jobService } from '@/services/jobService'
import type { JobSearchResponse, JobSummaryResponse } from '@/types/job'
import type { SearchPageResponse, PageResponse } from '@/types/common'

const router = useRouter()

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

function onSearchBlur(): void {
 setTimeout(() => { showAutocomplete.value = false }, 200)
}

// ── Filters ──
const salaryMin = ref('')
const salaryMax = ref('')
const currency = ref('VND')

// ── Pagination ──
const currentPage = ref(0)
const pageSize = ref(12)

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
 if (result.data) searchData.value = result.data
 } finally {
 searchLoading.value = false
 }
}

// ── Autocomplete ──
async function fetchAutocomplete(): Promise<void> {
 if (searchQuery.value.trim().length < 2) {
 autocompleteResults.value = []
 showAutocomplete.value = false
 return
 }
 const result = await jobService.autocomplete(searchQuery.value.trim(), 6)
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
 
 // Combine search and location for semantic text search
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

// ── Navigation ──
function goToJob(id: string): void {
 router.push(`/jobs/${id}`)
}

// ── Formatting ──
function formatSalary(min: number | null, max: number | null, cur: string | null, negotiable: boolean | null): string {
 if (!min && !max) return negotiable ? 'Negotiable' : '—'
 const c = cur ?? 'VND'
 const fmt = (n: number) => n.toLocaleString('en-US')
 if (min && max) return `${fmt(min)} – ${fmt(max)} ${c}`
 if (min) return `From ${fmt(min)} ${c}`
 if (max) return `Up to ${fmt(max)} ${c}`
 return '—'
}

function formatDate(iso: string): string {
 return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function timeAgo(iso: string): string {
 const diff = Date.now() - new Date(iso).getTime()
 const days = Math.floor(diff / (1000 * 60 * 60 * 24))
 if (days === 0) return 'Today'
 if (days === 1) return '1 day ago'
 if (days < 30) return `${days} days ago`
 const months = Math.floor(days / 30)
 return months === 1 ? '1 month ago' : `${months} months ago`
}

onMounted(() => {
 loadPublicJobs()
})
</script>

<template>
 <div class="min-h-screen flex flex-col">
 <!-- Header / Nav -->
 <header class="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-30 transition-all duration-300">
 <div class="max-w-6xl mx-auto flex items-center justify-between">
 <router-link to="/" class="text-2xl font-extrabold text-teal-600 tracking-tight transition-colors hover:text-teal-500">VietRecruit</router-link>
 <nav class="flex items-center gap-2 sm:gap-4">
 <router-link
 to="/jobs"
 class="px-4 py-2.5 text-sm font-bold text-teal-600 bg-teal-50 rounded-xl transition-colors hover:bg-teal-100 :bg-teal-500/20"
 >
 Browse Jobs
 </router-link>
 <router-link
 to="/login"
 class="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 :text-white rounded-xl hover:bg-slate-50 :bg-slate-800 transition-colors"
 >
 Login
 </router-link>
 <router-link
 to="/register"
 class="btn-primary py-2.5 px-6 shrink-0 shadow-sm hover:shadow-md"
 >
 Get Started
 </router-link>
 </nav>
 </div>
 </header>

 <!-- Hero / Search Section (Light Theme) -->
 <section class="bg-white px-6 pt-20 pb-16 relative overflow-hidden border-b border-slate-200 ">
 <!-- Decorative light blobs -->
 <div class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none" aria-hidden="true">
 <div class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-teal-50 to-emerald-50 opacity-60 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
 </div>

 <div class="max-w-4xl mx-auto text-center mb-12 animate-fade-in-up">
 <h1 class="text-4xl sm:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
 Find Your <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Next Opportunity</span>
 </h1>
 <p class="text-lg sm:text-xl font-medium text-slate-500 max-w-2xl mx-auto">
 Discover open positions from top companies and take the next step in your career.
 </p>
 </div>

 <!-- Search Box - Elevated -->
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
 placeholder="Job title, keywords, or company..."
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
 class="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 :bg-slate-800/50 hover:text-teal-600 transition-colors"
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
 placeholder="City, state, zip code, or remotely..."
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
 Search
 </button>
 </form>

 <!-- Active search indicator -->
 <div v-if="mode === 'search' && debouncedQuery" class="flex items-center justify-center gap-2 mt-6">
 <span class="text-sm font-medium text-slate-500">
 Showing results for "<span class="font-bold text-slate-900 ">{{ debouncedQuery }}</span>"
 </span>
 <button @click="clearSearch" class="text-sm text-teal-600 hover:text-teal-500 font-bold ml-2 transition-colors border-b border-teal-600/30">
 Clear All
 </button>
 </div>
 </div>
 </section>

 <!-- Results -->
 <main class="flex-1 max-w-6xl mx-auto w-full px-6 py-10 bg-white border-t border-slate-200 ">
 <!-- Results count -->
 <div class="flex items-center justify-between mb-6">
 <span class="text-sm font-bold text-slate-500">
 {{ totalElements }} job{{ totalElements !== 1 ? 's' : '' }} found
 </span>
 </div>

 <!-- Loading -->
 <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
 <div v-for="i in 6" :key="i" class="premium-card p-6 animate-pulse">
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
 {{ mode === 'search' ? 'No jobs match your search' : 'No open positions right now' }}
 </p>
 <p class="font-medium">
 {{ mode === 'search' ? 'Try different keywords or clear your filters.' : 'Check back soon for new opportunities.' }}
 </p>
 <button v-if="mode === 'search'" @click="clearSearch" class="mt-4 px-4 py-2 text-teal-600 bg-teal-50 hover:bg-teal-100 :bg-teal-500/20 rounded-xl font-bold transition-colors">
 Clear Search
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
 class="premium-card p-6 border-slate-200 transition-all duration-300 cursor-pointer group flex flex-col h-full bg-white hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(20,184,166,0.3)] hover:border-teal-400/50 :border-teal-500/50"
 >
 <div class="mb-5 flex-1">
 <h3 class="text-lg font-bold text-slate-900 group-hover:text-teal-600 :text-teal-400 transition-colors line-clamp-2 leading-snug">
 {{ job.title }}
 </h3>
 <p class="text-xs font-bold text-slate-400 mt-2 flex items-center gap-1.5">
 <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
 {{ timeAgo(job.createdAt) }}
 </p>
 </div>
 <div class="space-y-3 mt-auto pt-4 border-t border-slate-100 ">
 <div class="flex items-center justify-between">
 <span class="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-100 ">
 {{ formatSalary(job.minSalary, job.maxSalary, job.currency, job.isNegotiable) }}
 </span>
 </div>
 <div v-if="job.deadline" class="text-xs font-medium text-rose-500/80 flex items-center gap-1.5 pt-1">
 <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
 Deadline: {{ formatDate(job.deadline) }}
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
 class="premium-card p-6 md:p-8 hover:-translate-y-1 hover:shadow-[0_12px_24px_-10px_rgba(20,184,166,0.3)] hover:border-teal-400/50 transition-all duration-300 cursor-pointer group bg-white "
 >
 <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
 <div class="min-w-0 flex-1">
 <h3 class="text-xl font-extrabold text-slate-900 group-hover:text-teal-600 :text-teal-400 transition-colors mb-2">
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
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 14.5a3 3 0 10-6 0 3 3 0 006 0zm10 0a3 3 0 10-6 0 3 3 0 006 0zm-5-3.5v-4zm-5 0v-4z" /></svg>
 {{ job.categoryName }}
 </span>
 </div>
 <!-- Description snippet -->
 <p v-if="job.description" class="text-sm font-medium text-slate-600 line-clamp-2 mb-4 leading-relaxed">
 {{ job.description }}
 </p>
 <!-- Highlights -->
 <div v-if="job.highlights" class="flex flex-wrap gap-2 mt-auto">
 <template v-for="(values, field) in job.highlights" :key="field">
 <span
 v-for="(val, i) in values"
 :key="`${field}-${i}`"
 class="inline-flex items-center px-2.5 py-1 text-xs font-bold bg-teal-50 text-teal-700 rounded-lg border border-teal-100 "
 v-html="val"
 />
 </template>
 </div>
 </div>
 <div class="sm:text-right shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-4 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 ">
 <span class="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-100 shadow-sm">
 {{ formatSalary(job.minSalary, job.maxSalary, job.currency, job.isNegotiable) }}
 </span>
 <p class="text-xs font-bold text-slate-400 flex items-center justify-end gap-1.5">
 <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
 {{ timeAgo(job.createdAt) }}
 </p>
 <div v-if="job.score !== null && job.score !== undefined" class="mt-2 text-right">
 <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide"
 :class="job.score > 0.8 ? 'bg-emerald-100 text-emerald-700 ' : 'bg-blue-100 text-blue-700 '"
 >
 {{ Math.round(job.score * 100) }}% match
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </template>

 <!-- Pagination -->
 <div v-if="totalPages > 1" class="flex items-center justify-between mt-10 pt-6 border-t border-slate-200 ">
 <span class="text-sm font-bold text-slate-500">
 Page {{ currentPage + 1 }} of {{ totalPages }}
 </span>
 <div class="flex items-center gap-2">
 <button
 @click="prevPage"
 :disabled="!canGoPrev"
 class="px-4 py-2 text-sm font-bold border border-slate-200 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 :bg-slate-800 text-slate-600 "
 >
 &larr; Prev
 </button>
 <button
 @click="nextPage"
 :disabled="!canGoNext"
 class="px-4 py-2 text-sm font-bold border border-slate-200 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 :bg-slate-800 text-slate-600 "
 >
 Next &rarr;
 </button>
 </div>
 </div>
 </main>

 <!-- Footer -->
 <footer class="bg-white border-t border-slate-200 px-6 py-8 mt-auto">
 <div class="max-w-6xl mx-auto text-center text-sm font-bold text-slate-400">
 © {{ new Date().getFullYear() }} VietRecruit. All rights reserved.
 </div>
 </footer>
 </div>
</template>
