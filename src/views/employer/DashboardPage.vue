<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useJobStore } from '@/stores/jobStore'
import BaseSkeleton from '@/components/common/BaseSkeleton.vue'
import BaseBreadcrumbs from '@/components/common/BaseBreadcrumbs.vue'

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
  <div class="max-w-6xl mx-auto px-6 py-8 md:px-8">
    <BaseBreadcrumbs />
    
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">Employer Dashboard</h1>
      <p class="text-sm text-gray-500 mt-1">Hiring pipeline overview and key metrics.</p>
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
        <div class="bg-surface border border-border rounded-lg p-5 shadow-sm">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total Jobs</span>
          <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ stats.total }}</p>
        </div>
        <div class="bg-surface border border-border rounded-lg p-5 shadow-sm">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Published</span>
          <p class="text-2xl font-bold text-success mt-1">{{ stats.published }}</p>
        </div>
        <div class="bg-surface border border-border rounded-lg p-5 shadow-sm">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Drafts</span>
          <p class="text-2xl font-bold text-gray-500 mt-1">{{ stats.draft }}</p>
        </div>
        <div class="bg-surface border border-border rounded-lg p-5 shadow-sm">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Closed</span>
          <p class="text-2xl font-bold text-error mt-1">{{ stats.closed }}</p>
        </div>
      </div>

      <!-- Quota Card -->
      <div v-if="quota" class="bg-surface border border-border rounded-lg p-5 shadow-sm mb-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-gray-900">Active Job Quota</h2>
          <span class="text-xs text-gray-400">
            {{ subStore.hasActiveSubscription ? subStore.currentSubscription?.planName : 'No active plan' }}
          </span>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="subStore.isQuotaFull ? 'bg-error' : 'bg-primary'"
                :style="{ width: `${Math.min(subStore.quotaUsagePercent, 100)}%` }"
              />
            </div>
          </div>
          <span class="text-sm font-medium shrink-0" :class="subStore.isQuotaFull ? 'text-error' : 'text-gray-700'">
            {{ quota.jobsActive }} / {{ quota.maxActiveJobs < 0 ? '∞' : quota.maxActiveJobs }}
          </span>
        </div>
        <p class="text-xs text-gray-400 mt-2">
          Cycle: {{ new Date(quota.cycleStart).toLocaleDateString() }} – {{ new Date(quota.cycleEnd).toLocaleDateString() }}
        </p>
        <div v-if="subStore.isQuotaFull" class="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-warning-bg text-warning text-xs">
          <span class="font-medium">⚠ Quota limit reached.</span>
          <router-link to="/employer/pricing" class="font-medium underline">Upgrade your plan</router-link>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-surface border border-border rounded-lg p-5 shadow-sm">
        <h2 class="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div class="flex items-center gap-3">
          <button
            @click="router.push('/employer/jobs/new')"
            class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition"
          >
            + New Job
          </button>
          <button
            @click="router.push('/employer/jobs')"
            class="px-4 py-2 text-sm font-medium text-primary bg-primary-bg hover:bg-primary-light rounded-md transition border border-primary/10"
          >
            View All Jobs
          </button>
          <button
            @click="router.push('/employer/organization')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
          >
            Organization
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
