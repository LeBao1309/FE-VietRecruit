<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { companyService } from '@/services/companyService'
import type { CompanySearchResponse } from '@/types/company'
import type { SearchPageResponse } from '@/types/common'
import PublicNavbar from '@/components/common/PublicNavbar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import BaseSkeleton from '@/components/common/BaseSkeleton.vue'
import BaseEmptyState from '@/components/common/BaseEmptyState.vue'
import { useUiStore } from '@/stores/uiStore'

const ui = useUiStore()

// ── State ──
const loading = ref(false)
const results = ref<CompanySearchResponse[]>([])
const totalElements = ref(0)
const totalPages = ref(0)
const currentPage = ref(0)
const pageSize = 12

const query = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// ── Search ──
async function search(page = 0): Promise<void> {
  loading.value = true
  try {
    const result = await companyService.searchCompanies({
      q: query.value || undefined,
      page,
      size: pageSize,
    })
    if (result.error) {
      ui.toastError('Tìm kiếm thất bại', result.error.message)
      return
    }
    const data = result.data as SearchPageResponse<CompanySearchResponse>
    results.value = data.content
    totalElements.value = data.totalElements
    totalPages.value = data.totalPages
    currentPage.value = data.page
  } finally {
    loading.value = false
  }
}

function onQueryInput(): void {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    currentPage.value = 0
    search(0)
  }, 400)
}

// ── Pagination ──
const canGoPrev = computed(() => currentPage.value > 0)
const canGoNext = computed(() => currentPage.value < totalPages.value - 1)

function prevPage(): void {
  if (canGoPrev.value) search(currentPage.value - 1)
}
function nextPage(): void {
  if (canGoNext.value) search(currentPage.value + 1)
}

// ── Helpers ──
function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

onMounted(() => search(0))
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <PublicNavbar />

    <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-10 md:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Khám Phá Doanh Nghiệp</h1>
        <p class="text-slate-500 mt-2 text-sm">Tìm hiểu về các công ty đang tuyển dụng tại VietRecruit</p>
      </div>

      <!-- Search bar -->
      <div class="relative mb-8 max-w-xl mx-auto">
        <svg
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input
          v-model="query"
          @input="onQueryInput"
          type="text"
          placeholder="Tìm kiếm công ty..."
          class="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-white shadow-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
        />
      </div>

      <!-- Result count -->
      <p v-if="!loading" class="text-sm text-slate-500 mb-6 text-center">
        Tìm thấy <span class="font-semibold text-slate-700">{{ totalElements }}</span> doanh nghiệp
      </p>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <BaseSkeleton v-for="i in 9" :key="i" class="h-44 rounded-2xl" />
      </div>

      <!-- Empty state -->
      <BaseEmptyState
        v-else-if="results.length === 0"
        title="Không tìm thấy doanh nghiệp"
        description="Thử thay đổi từ khóa tìm kiếm."
        icon="🏢"
      />

      <!-- Company cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="company in results"
          :key="company.id"
          class="bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-4"
        >
          <!-- Logo / Initials -->
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
              <span class="text-teal-700 font-extrabold text-base">{{ getInitials(company.name) }}</span>
            </div>
            <div class="min-w-0">
              <p class="text-sm font-bold text-slate-900 leading-snug truncate">{{ company.name }}</p>
              <p v-if="company.domain" class="text-xs text-slate-500 truncate mt-0.5">{{ company.domain }}</p>
            </div>
          </div>

          <!-- Website -->
          <div v-if="company.website" class="text-xs">
            <a
              :href="company.website"
              target="_blank"
              rel="noopener noreferrer"
              class="text-teal-600 hover:text-teal-700 hover:underline transition-colors"
              @click.stop
            >
              {{ company.website }}
            </a>
          </div>

          <!-- Footer -->
          <div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-[10px] text-slate-400 font-medium">
              Tham gia {{ company.createdAt ? new Date(company.createdAt).toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }) : '—' }}
            </span>
            <a
              :href="`/jobs?company=${company.id}`"
              class="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
            >
              Xem việc làm →
            </a>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 mt-10">
        <button
          @click="prevPage"
          :disabled="!canGoPrev"
          class="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          ‹ Trước
        </button>
        <span class="text-sm text-slate-500 font-medium">{{ currentPage + 1 }} / {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="!canGoNext"
          class="px-4 py-2 border border-slate-200 rounded-lg bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          Sau ›
        </button>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
