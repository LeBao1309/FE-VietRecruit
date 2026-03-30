<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobStore } from '@/stores/jobStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useAuthStore } from '@/stores/authStore'
import type { JobStatus } from '@/types/enums'

const route = useRoute()
const router = useRouter()
const jobStore = useJobStore()
const subStore = useSubscriptionStore()
const auth = useAuthStore()

const jobId = computed(() => route.params.id as string)

// ── Confirmation modal ──
const showConfirm = ref(false)
const confirmAction = ref<'publish' | 'close' | null>(null)
const confirmProcessing = ref(false)

// ── Status config ──
const statusConfig: Record<JobStatus, { label: string; class: string; dot: string }> = {
  DRAFT: { label: 'Draft', class: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  PUBLISHED: { label: 'Published', class: 'bg-success-bg text-success', dot: 'bg-success' },
  CLOSED: { label: 'Closed', class: 'bg-error-bg text-error', dot: 'bg-error' },
}

// ── Computed helpers ──
const job = computed(() => jobStore.currentJob)
const benchmark = computed(() => jobStore.salaryBenchmark)

const canPubOrClose = computed(() => auth.isCompanyAdmin || auth.isHR)

// ── Format helpers ──
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatSalary(n: number | null): string {
  if (n === null) return '—'
  return n.toLocaleString('en-US')
}

// ── Actions ──
function openPublishConfirm(): void {
  confirmAction.value = 'publish'
  showConfirm.value = true
}

function openCloseConfirm(): void {
  confirmAction.value = 'close'
  showConfirm.value = true
}

async function handleConfirm(): Promise<void> {
  if (!confirmAction.value) return
  confirmProcessing.value = true
  try {
    let success = false
    if (confirmAction.value === 'publish') {
      success = await jobStore.publishJob(jobId.value)
    } else {
      success = await jobStore.closeJob(jobId.value)
    }
    if (success) {
      showConfirm.value = false
    }
  } finally {
    confirmProcessing.value = false
  }
}

onMounted(async () => {
  await jobStore.fetchJob(jobId.value)
  await subStore.fetchCurrentQuota()
  // Fetch salary benchmark
  jobStore.fetchSalaryBenchmark(jobId.value)
})

onBeforeUnmount(() => {
  jobStore.clearCurrentJob()
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <!-- Back link -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.push('/employer/jobs')" class="text-gray-400 hover:text-gray-600 transition text-sm">
        ‹ All Jobs
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="jobStore.detailLoading" class="space-y-4">
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm animate-pulse space-y-4">
        <div class="h-6 bg-gray-100 rounded w-64" />
        <div class="h-4 bg-gray-100 rounded w-32" />
        <div class="h-4 bg-gray-100 rounded w-full" />
        <div class="h-4 bg-gray-100 rounded w-3/4" />
      </div>
    </div>

    <div v-else-if="job" class="space-y-5">
      <!-- Header card -->
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h1 class="text-xl font-bold text-gray-900 mb-2">{{ job.title }}</h1>
            <div class="flex items-center gap-3 flex-wrap">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
                :class="statusConfig[job.status].class"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="statusConfig[job.status].dot" />
                {{ statusConfig[job.status].label }}
              </span>
              <span class="text-xs text-gray-400">Created {{ formatDateTime(job.createdAt) }}</span>
              <span v-if="job.deadline" class="text-xs text-gray-400">
                · Deadline: {{ formatDate(job.deadline) }}
              </span>
            </div>
          </div>

          <!-- Action buttons -->
          <div v-if="canPubOrClose" class="flex items-center gap-2 shrink-0">
            <!-- Edit (DRAFT only) -->
            <button
              v-if="jobStore.canEdit"
              @click="router.push(`/employer/jobs/${jobId}/edit`)"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
            >
              Edit
            </button>

            <!-- Publish (DRAFT only) -->
            <button
              v-if="jobStore.canPublish"
              @click="openPublishConfirm"
              :disabled="jobStore.actionLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 flex items-center gap-1.5"
              :class="{ 'opacity-50 cursor-not-allowed': subStore.isQuotaFull }"
            >
              Publish
            </button>

            <!-- Close (PUBLISHED only) -->
            <button
              v-if="jobStore.canClose"
              @click="openCloseConfirm"
              :disabled="jobStore.actionLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-error hover:bg-red-700 rounded-md transition disabled:opacity-50"
            >
              Close Listing
            </button>
          </div>
        </div>

        <!-- Quota warning (when trying to publish) -->
        <div
          v-if="jobStore.canPublish && subStore.isQuotaFull"
          class="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-md bg-warning-bg text-warning text-xs"
        >
          <span class="font-medium">⚠ Quota limit reached.</span>
          <span>You cannot publish more jobs. Close an existing job or</span>
          <router-link to="/employer/pricing" class="font-medium underline">upgrade your plan</router-link>.
        </div>

        <!-- Salary -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
          <div>
            <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Min Salary</span>
            <span class="text-sm font-medium text-gray-900">{{ formatSalary(job.minSalary) }}</span>
          </div>
          <div>
            <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Max Salary</span>
            <span class="text-sm font-medium text-gray-900">{{ formatSalary(job.maxSalary) }}</span>
          </div>
          <div>
            <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Currency</span>
            <span class="text-sm font-medium text-gray-900">{{ job.currency ?? '—' }}</span>
          </div>
          <div>
            <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Negotiable</span>
            <span class="text-sm font-medium" :class="job.isNegotiable ? 'text-success' : 'text-gray-500'">
              {{ job.isNegotiable ? 'Yes' : 'No' }}
            </span>
          </div>
        </div>

        <!-- Public link -->
        <div v-if="job.publicLink && job.status === 'PUBLISHED'" class="mt-4 pt-4 border-t border-border">
          <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Public Link</span>
          <a :href="job.publicLink" target="_blank" rel="noopener" class="text-xs text-primary hover:text-primary-hover break-all">
            {{ job.publicLink }}
          </a>
        </div>
      </div>

      <!-- Description -->
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <h2 class="text-sm font-semibold text-gray-900 mb-3">Job Description</h2>
        <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ job.description }}</div>
      </div>

      <!-- Requirements -->
      <div v-if="job.requirements" class="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <h2 class="text-sm font-semibold text-gray-900 mb-3">Requirements</h2>
        <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ job.requirements }}</div>
      </div>

      <!-- Salary Benchmark Widget -->
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-semibold text-gray-900">Salary Benchmark</h2>
          <button
            v-if="!jobStore.benchmarkLoading && !benchmark"
            @click="jobStore.fetchSalaryBenchmark(jobId)"
            class="text-xs text-primary hover:text-primary-hover font-medium transition"
          >
            Load Benchmark
          </button>
        </div>

        <!-- Loading -->
        <div v-if="jobStore.benchmarkLoading" class="animate-pulse space-y-3">
          <div class="h-4 bg-gray-100 rounded w-48" />
          <div class="h-16 bg-gray-100 rounded" />
        </div>

        <!-- No data -->
        <div v-else-if="!benchmark" class="text-sm text-gray-400 text-center py-6">
          No benchmark data available. Click "Load Benchmark" to fetch AI-generated salary insights.
        </div>

        <!-- Benchmark data -->
        <div v-else class="space-y-4">
          <!-- Range visualization -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>{{ benchmark.range.min.toLocaleString() }}</span>
              <span class="font-medium text-gray-700">{{ benchmark.range.median.toLocaleString() }} (median)</span>
              <span>{{ benchmark.range.max.toLocaleString() }}</span>
            </div>
            <div class="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <!-- Full range bar -->
              <div class="absolute inset-y-0 bg-primary/20 rounded-full" style="left: 0; right: 0" />
              <!-- Median marker -->
              <div
                class="absolute top-0 bottom-0 w-1 bg-primary rounded-full"
                :style="{
                  left: `${((benchmark.range.median - benchmark.range.min) / (benchmark.range.max - benchmark.range.min)) * 100}%`,
                }"
              />
              <!-- Current job salary indicators -->
              <div
                v-if="job.minSalary"
                class="absolute top-0 bottom-0 w-2 h-2 my-auto bg-info rounded-full border border-white"
                :style="{
                  left: `${Math.max(0, Math.min(100, ((job.minSalary - benchmark.range.min) / (benchmark.range.max - benchmark.range.min)) * 100))}%`,
                }"
                :title="`Your min: ${job.minSalary.toLocaleString()}`"
              />
              <div
                v-if="job.maxSalary"
                class="absolute top-0 bottom-0 w-2 h-2 my-auto bg-success rounded-full border border-white"
                :style="{
                  left: `${Math.max(0, Math.min(100, ((job.maxSalary - benchmark.range.min) / (benchmark.range.max - benchmark.range.min)) * 100))}%`,
                }"
                :title="`Your max: ${job.maxSalary.toLocaleString()}`"
              />
            </div>
            <div class="flex items-center gap-3 text-[10px] text-gray-400">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-primary inline-block" /> Market median
              </span>
              <span v-if="job.minSalary" class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-info inline-block" /> Your min
              </span>
              <span v-if="job.maxSalary" class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-success inline-block" /> Your max
              </span>
            </div>
          </div>

          <!-- Meta info -->
          <div class="grid grid-cols-3 gap-3 text-xs">
            <div>
              <span class="block text-gray-400 mb-0.5">Location</span>
              <span class="text-gray-700 font-medium">{{ benchmark.location ?? 'N/A' }}</span>
            </div>
            <div>
              <span class="block text-gray-400 mb-0.5">Experience</span>
              <span class="text-gray-700 font-medium">{{ benchmark.experienceLevel ?? 'N/A' }}</span>
            </div>
            <div>
              <span class="block text-gray-400 mb-0.5">Market Position</span>
              <span class="text-gray-700 font-medium">{{ benchmark.marketPosition ?? 'N/A' }}</span>
            </div>
          </div>

          <!-- Insights -->
          <div v-if="benchmark.insights.length" class="pt-3 border-t border-border">
            <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Insights</span>
            <ul class="space-y-1">
              <li v-for="(insight, i) in benchmark.insights" :key="i" class="text-xs text-gray-600 flex items-start gap-1.5">
                <span class="text-primary mt-0.5 shrink-0">•</span>
                {{ insight }}
              </li>
            </ul>
          </div>

          <!-- Disclaimer -->
          <p v-if="benchmark.disclaimer" class="text-[10px] text-gray-400 italic mt-2">
            {{ benchmark.disclaimer }}
          </p>
        </div>
      </div>

      <!-- Quick links -->
      <div v-if="job.status === 'PUBLISHED'" class="bg-surface border border-border rounded-lg p-5 shadow-sm">
        <h2 class="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div class="flex items-center gap-3">
          <router-link
            :to="`/employer/jobs/${jobId}/applications`"
            class="px-4 py-2 text-sm font-medium text-primary bg-primary-bg hover:bg-primary-light rounded-md transition border border-primary/10"
          >
            View Applications
          </router-link>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="bg-surface border border-border rounded-lg p-12 shadow-sm text-center">
      <p class="text-gray-400 text-sm">Job not found or you don't have access to view it.</p>
      <button @click="router.push('/employer/jobs')" class="mt-3 text-primary hover:text-primary-hover text-sm font-medium transition">
        ← Back to Jobs
      </button>
    </div>

    <!-- Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="showConfirm = false" />
        <div class="relative bg-surface rounded-lg shadow-xl border border-border w-full max-w-sm p-6 animate-slide-up">
          <div class="text-center">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-3"
              :class="confirmAction === 'publish' ? 'bg-primary-bg text-primary' : 'bg-error-bg text-error'"
            >
              {{ confirmAction === 'publish' ? '🚀' : '✕' }}
            </div>
            <h2 class="text-lg font-bold text-gray-900 mb-1">
              {{ confirmAction === 'publish' ? 'Publish Job?' : 'Close Listing?' }}
            </h2>
            <p class="text-sm text-gray-500 mb-6">
              <template v-if="confirmAction === 'publish'">
                This will make the job visible to all candidates and deduct one slot from your active quota.
              </template>
              <template v-else>
                This will remove the job from the public board. You cannot re-open a closed listing, but the quota slot will be released.
              </template>
            </p>
            <div class="flex justify-center gap-2">
              <button
                @click="showConfirm = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                @click="handleConfirm"
                :disabled="confirmProcessing"
                class="px-4 py-2 text-sm font-medium text-white rounded-md transition disabled:opacity-50 flex items-center gap-2"
                :class="confirmAction === 'publish' ? 'bg-primary hover:bg-primary-hover' : 'bg-error hover:bg-red-700'"
              >
                <span v-if="confirmProcessing" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {{ confirmProcessing ? 'Processing…' : confirmAction === 'publish' ? 'Publish' : 'Close' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
