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
  debouncedQuery.value = searchQuery.value
  if (debouncedQuery.value.trim()) {
    loadSearchResults()
  } else {
    mode.value = 'browse'
    loadPublicJobs()
  }
}

function clearSearch(): void {
  searchQuery.value = ''
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
    <header class="bg-surface border-b border-border px-6 py-4 sticky top-0 z-30">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <router-link to="/" class="text-xl font-bold text-primary">VietRecruit</router-link>
        <nav class="flex items-center gap-3">
          <router-link
            to="/jobs"
            class="px-3 py-2 text-sm font-medium text-primary bg-primary-bg rounded-md"
          >
            Browse Jobs
          </router-link>
          <router-link
            to="/login"
            class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 transition"
          >
            Login
          </router-link>
          <router-link
            to="/register"
            class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition"
          >
            Get Started
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Hero / Search Section -->
    <section class="bg-gradient-to-b from-primary-bg to-page px-6 pt-10 pb-8">
      <div class="max-w-3xl mx-auto text-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Find Your Next Opportunity</h1>
        <p class="text-sm text-gray-500">Search through open positions from top companies in Vietnam</p>
      </div>

      <!-- Search bar -->
      <div class="max-w-2xl mx-auto relative">
        <form @submit.prevent="handleSearch" class="flex gap-2">
          <div class="relative flex-1">
            <input
              v-model="searchQuery"
              @input="onSearchInput"
              @focus="showAutocomplete = autocompleteResults.length > 0"
              @blur="onSearchBlur"
              type="text"
              placeholder="Search jobs by title, skills, company…"
              class="w-full px-4 py-3 text-sm border border-border rounded-lg bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition pr-8"
            />
            <!-- Clear button -->
            <button
              v-if="searchQuery"
              type="button"
              @click="clearSearch"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm transition"
            >
              ✕
            </button>

            <!-- Autocomplete dropdown -->
            <div
              v-if="showAutocomplete && autocompleteResults.length > 0"
              class="absolute left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-20 overflow-hidden animate-fade-in"
            >
              <button
                v-for="(item, i) in autocompleteResults"
                :key="i"
                type="button"
                @mousedown.prevent="selectAutocomplete(item)"
                class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-bg hover:text-primary transition"
              >
                {{ item }}
              </button>
            </div>
          </div>
          <button
            type="submit"
            class="px-6 py-3 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition shrink-0"
          >
            Search
          </button>
        </form>

        <!-- Active search indicator -->
        <div v-if="mode === 'search' && debouncedQuery" class="flex items-center gap-2 mt-3">
          <span class="text-xs text-gray-500">
            Showing results for "<span class="font-medium text-gray-700">{{ debouncedQuery }}</span>"
          </span>
          <span v-if="searchData?.tookMs" class="text-[10px] text-gray-400">({{ searchData.tookMs }}ms)</span>
          <button @click="clearSearch" class="text-xs text-primary hover:text-primary-hover font-medium ml-1">
            Clear
          </button>
        </div>
      </div>
    </section>

    <!-- Results -->
    <main class="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
      <!-- Results count -->
      <div class="flex items-center justify-between mb-4">
        <span class="text-xs text-gray-400">
          {{ totalElements }} job{{ totalElements !== 1 ? 's' : '' }} found
        </span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="bg-surface border border-border rounded-lg p-5 shadow-sm animate-pulse">
          <div class="h-5 bg-gray-100 rounded w-3/4 mb-3" />
          <div class="h-3 bg-gray-100 rounded w-1/2 mb-4" />
          <div class="h-3 bg-gray-100 rounded w-full mb-2" />
          <div class="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="isEmpty" class="text-center py-20">
        <div class="text-gray-400 text-sm">
          <p class="font-medium mb-1">
            {{ mode === 'search' ? 'No jobs match your search' : 'No open positions right now' }}
          </p>
          <p class="text-xs">
            {{ mode === 'search' ? 'Try different keywords or clear your filters.' : 'Check back soon for new opportunities.' }}
          </p>
          <button v-if="mode === 'search'" @click="clearSearch" class="mt-3 text-primary hover:text-primary-hover text-xs font-medium transition">
            Clear Search
          </button>
        </div>
      </div>

      <!-- Browse mode: card grid -->
      <template v-else-if="mode === 'browse' && browseData">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="job in browseData.content"
            :key="job.id"
            @click="goToJob(job.id)"
            class="bg-surface border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition cursor-pointer group"
          >
            <h3 class="text-sm font-semibold text-gray-900 group-hover:text-primary transition mb-1 line-clamp-2">
              {{ job.title }}
            </h3>
            <p class="text-xs text-gray-400 mb-3">{{ timeAgo(job.createdAt) }}</p>
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">
                  {{ formatSalary(job.minSalary, job.maxSalary, job.currency, job.isNegotiable) }}
                </span>
              </div>
              <div v-if="job.deadline" class="text-[10px] text-gray-400">
                Deadline: {{ formatDate(job.deadline) }}
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Search mode: list with highlights -->
      <template v-else-if="mode === 'search' && searchData">
        <div class="space-y-3">
          <div
            v-for="job in searchData.content"
            :key="job.id"
            @click="goToJob(job.id)"
            class="bg-surface border border-border rounded-lg p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition cursor-pointer group"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <h3 class="text-sm font-semibold text-gray-900 group-hover:text-primary transition mb-0.5">
                  {{ job.title }}
                </h3>
                <div class="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
                  <span v-if="job.companyName" class="font-medium text-gray-500">{{ job.companyName }}</span>
                  <span v-if="job.locationName">· {{ job.locationName }}</span>
                  <span v-if="job.categoryName">· {{ job.categoryName }}</span>
                </div>
                <!-- Description snippet -->
                <p v-if="job.description" class="text-xs text-gray-500 line-clamp-2 mb-2">
                  {{ job.description }}
                </p>
                <!-- Highlights -->
                <div v-if="job.highlights" class="flex flex-wrap gap-1">
                  <template v-for="(values, field) in job.highlights" :key="field">
                    <span
                      v-for="(val, i) in values"
                      :key="`${field}-${i}`"
                      class="inline-block px-1.5 py-0.5 text-[10px] bg-primary-bg text-primary rounded"
                      v-html="val"
                    />
                  </template>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="text-xs font-medium text-gray-700">
                  {{ formatSalary(job.minSalary, job.maxSalary, job.currency, job.isNegotiable) }}
                </p>
                <p class="text-[10px] text-gray-400 mt-0.5">{{ timeAgo(job.createdAt) }}</p>
                <div v-if="job.score !== null && job.score !== undefined" class="mt-1">
                  <span class="text-[10px] text-primary font-medium">{{ Math.round(job.score * 100) }}% match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-8 pt-4 border-t border-border">
        <span class="text-xs text-gray-400">
          Page {{ currentPage + 1 }} of {{ totalPages }}
        </span>
        <div class="flex items-center gap-1">
          <button
            @click="prevPage"
            :disabled="!canGoPrev"
            class="px-3 py-1.5 text-xs font-medium border border-border rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ‹ Prev
          </button>
          <button
            @click="nextPage"
            :disabled="!canGoNext"
            class="px-3 py-1.5 text-xs font-medium border border-border rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next ›
          </button>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-surface border-t border-border px-6 py-6 mt-auto">
      <div class="max-w-6xl mx-auto text-center text-xs text-gray-400">
        © {{ new Date().getFullYear() }} VietRecruit. All rights reserved.
      </div>
    </footer>
  </div>
</template>
