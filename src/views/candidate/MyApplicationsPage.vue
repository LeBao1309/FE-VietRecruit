<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { applicationService } from '@/services/applicationService'
import type { PageResponse } from '@/types/common'
import type { ApplicationSummaryResponse } from '@/types/application'
import type { ApplicationStatus } from '@/types/enums'

const router = useRouter()

// ── State ──
const loading = ref(true)
const applications = ref<PageResponse<ApplicationSummaryResponse> | null>(null)
const page = ref(0)
const pageSize = ref(10)
const statusFilter = ref<string>('')

// ── Status config ──
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; class: string; dotClass: string }> = {
  NEW: { label: 'Applied', class: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-400' },
  SCREENING: { label: 'Screening', class: 'bg-amber-50 text-amber-600', dotClass: 'bg-amber-400' },
  INTERVIEW: { label: 'Interview', class: 'bg-purple-50 text-purple-600', dotClass: 'bg-purple-500' },
  OFFER: { label: 'Offer', class: 'bg-primary-bg text-primary', dotClass: 'bg-primary' },
  HIRED: { label: 'Hired', class: 'bg-success-bg text-success', dotClass: 'bg-green-500' },
  REJECTED: { label: 'Rejected', class: 'bg-error-bg text-error', dotClass: 'bg-red-400' },
}

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
    const result = await applicationService.listMyApplications({
      page: page.value,
      size: pageSize.value,
      sort: 'createdAt,desc',
    })
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
  <div class="max-w-4xl mx-auto px-6 py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">My Applications</h1>
        <p class="text-sm text-gray-500 mt-1">Track the progress of your job applications.</p>
      </div>
      <router-link
        to="/jobs"
        class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition"
      >
        Browse Jobs
      </router-link>
    </div>

    <!-- Status filter pills -->
    <div class="flex items-center gap-2 mb-5 flex-wrap">
      <button
        v-for="filter in STATUS_FILTERS"
        :key="filter.value"
        @click="statusFilter = filter.value; page = 0; loadApplications()"
        class="px-3 py-1.5 text-xs font-medium rounded-full border transition"
        :class="statusFilter === filter.value
          ? 'bg-primary text-white border-primary'
          : 'bg-surface text-gray-600 border-border hover:border-gray-300'"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="bg-surface border border-border rounded-lg p-4 shadow-sm animate-pulse">
        <div class="flex items-center justify-between">
          <div class="space-y-2 flex-1">
            <div class="h-4 bg-gray-100 rounded w-48" />
            <div class="h-3 bg-gray-100 rounded w-24" />
          </div>
          <div class="h-5 bg-gray-100 rounded w-16" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="appList.length === 0" class="bg-surface border border-border rounded-lg p-12 shadow-sm text-center">
      <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-2xl mx-auto mb-4">
        📋
      </div>
      <h2 class="text-lg font-bold text-gray-900 mb-2">No Applications Yet</h2>
      <p class="text-sm text-gray-500 mb-5">Start applying to jobs to see your applications here.</p>
      <router-link
        to="/jobs"
        class="inline-block px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition"
      >
        Browse Jobs
      </router-link>
    </div>

    <!-- Application List -->
    <div v-else class="space-y-3">
      <div
        v-for="app in appList"
        :key="app.id"
        @click="router.push(`/candidate/applications/${app.id}`)"
        class="bg-surface border border-border rounded-lg p-4 shadow-sm hover:border-primary/30 hover:shadow-md transition cursor-pointer group"
      >
        <div class="flex items-center justify-between">
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold text-gray-900 group-hover:text-primary transition truncate">
              {{ app.jobTitle }}
            </h3>
            <p class="text-xs text-gray-400 mt-0.5">
              Applied {{ formatDate(app.createdAt) }}
            </p>
          </div>
          <div class="flex items-center gap-3 shrink-0 ml-4">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
              :class="STATUS_CONFIG[app.status].class"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="STATUS_CONFIG[app.status].dotClass" />
              {{ STATUS_CONFIG[app.status].label }}
            </span>
            <span class="text-gray-300 group-hover:text-gray-400 transition text-sm">→</span>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between pt-4">
        <span class="text-xs text-gray-400">
          {{ totalElements }} application{{ totalElements !== 1 ? 's' : '' }}
        </span>
        <div class="flex items-center gap-1">
          <button
            @click="goToPage(page - 1)"
            :disabled="page === 0"
            class="px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-surface border border-border rounded-md hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹ Prev
          </button>
          <button
            v-for="p in totalPages"
            :key="p"
            @click="goToPage(p - 1)"
            class="w-8 h-8 text-xs font-medium rounded-md transition"
            :class="page === p - 1
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-50'"
          >
            {{ p }}
          </button>
          <button
            @click="goToPage(page + 1)"
            :disabled="page >= totalPages - 1"
            class="px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-surface border border-border rounded-md hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next ›
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
