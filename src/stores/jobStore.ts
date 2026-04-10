import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { JobResponse, JobSummaryResponse } from '@/types/job'
import type { PageResponse, PaginationParams } from '@/types/common'
import type { SalaryBenchmarkResponse } from '@/types/ai'
import { jobService } from '@/services/jobService'
import { useUiStore } from './uiStore'
import { useSubscriptionStore } from './subscriptionStore'

export const useJobStore = defineStore('job', () => {
  // ── State ──────────────────────────────────────────────────────────
  const jobs = ref<PageResponse<JobSummaryResponse> | null>(null)
  const currentJob = ref<JobResponse | null>(null)
  const salaryBenchmark = ref<SalaryBenchmarkResponse | null>(null)
  const loading = ref(false)
  const detailLoading = ref(false)
  const actionLoading = ref(false)
  const benchmarkLoading = ref(false)
  const subscriptionRequired = ref(false)
  // Track last fetch params so actions can refresh the list
  const _lastFetchParams = ref<(PaginationParams & { status?: string }) | undefined>(undefined)

  // ── Getters ────────────────────────────────────────────────────────
  const jobList = computed(() => jobs.value?.content ?? [])
  const totalJobs = computed(() => jobs.value?.totalElements ?? 0)
  const totalPages = computed(() => jobs.value?.totalPages ?? 0)

  const isDraft = computed(() => currentJob.value?.status === 'DRAFT')
  const isPublished = computed(() => currentJob.value?.status === 'PUBLISHED')
  const isClosed = computed(() => currentJob.value?.status === 'CLOSED')
  const canEdit = computed(() => isDraft.value)
  const canPublish = computed(() => isDraft.value)
  const canClose = computed(() => isPublished.value)

  // ── Actions ────────────────────────────────────────────────────────
  async function fetchJobs(params?: PaginationParams & { status?: string }): Promise<void> {
    _lastFetchParams.value = params
    loading.value = true
    try {
      const result = await jobService.listJobs(params)
      if (result.data) {
        jobs.value = result.data
      } else {
        const ui = useUiStore()
        ui.toastError('Failed to load jobs', result.error?.message)
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchJob(id: string): Promise<boolean> {
    detailLoading.value = true
    try {
      const result = await jobService.getJob(id)
      if (result.data) {
        currentJob.value = result.data
        return true
      }
      const ui = useUiStore()
      ui.toastError('Job not found', result.error?.message)
      return false
    } finally {
      detailLoading.value = false
    }
  }

  async function publishJob(id: string): Promise<boolean> {
    const ui = useUiStore()
    const sub = useSubscriptionStore()

    // Subscription guard — must have an active plan (including free tier)
    if (!sub.hasActiveSubscription) {
      subscriptionRequired.value = true
      ui.toastWarning('No Active Subscription', 'Please select a plan (including the free plan) to begin posting jobs.')
      return false
    }

    // Quota guard
    if (sub.isQuotaFull) {
      ui.toastWarning('Quota Limit Reached', 'You have reached the active listing limit. Upgrade your plan to post more.')
      return false
    }

    actionLoading.value = true
    try {
      const result = await jobService.publishJob(id)
      if (result.error) {
        if (result.error.code === 'SUBSCRIPTION_REQUIRED') {
          subscriptionRequired.value = true
          ui.toastWarning('Subscription Required', result.error.message)
        } else {
          ui.toastError('Publish Failed', result.error.message)
        }
        return false
      }
      // Success — force PUBLISHED status immediately regardless of what data the backend returns
      if (result.data) {
        currentJob.value = { ...result.data, status: 'PUBLISHED' }
      } else if (currentJob.value) {
        currentJob.value = { ...currentJob.value, status: 'PUBLISHED' }
      }
      subscriptionRequired.value = false
      ui.toastSuccess('Published Successfully', 'The job listing is now publicly visible to candidates.')
      // Refresh list + quota in background (non-blocking)
      Promise.all([
        sub.fetchCurrentQuota(),
        ...(jobs.value ? [fetchJobs(_lastFetchParams.value)] : []),
      ]).catch(() => {})
      return true
    } finally {
      actionLoading.value = false
    }
  }

  async function closeJob(id: string): Promise<boolean> {
    const ui = useUiStore()
    actionLoading.value = true
    try {
      const result = await jobService.closeJob(id)
      if (result.error) {
        ui.toastError('Close Listing Failed', result.error.message)
        return false
      }
      // Success — force CLOSED status immediately regardless of what data the backend returns
      if (result.data) {
        currentJob.value = { ...result.data, status: 'CLOSED' }
      } else if (currentJob.value) {
        currentJob.value = { ...currentJob.value, status: 'CLOSED' }
      }
      ui.toastSuccess('Listing Closed', 'The job listing has been closed.')
      // Refresh list + quota in background (non-blocking)
      const sub = useSubscriptionStore()
      Promise.all([
        sub.fetchCurrentQuota(),
        ...(jobs.value ? [fetchJobs(_lastFetchParams.value)] : []),
      ]).catch(() => {})
      return true
    } finally {
      actionLoading.value = false
    }
  }

  async function fetchSalaryBenchmark(id: string): Promise<void> {
    benchmarkLoading.value = true
    try {
      const result = await jobService.getSalaryBenchmark(id)
      if (result.data) {
        salaryBenchmark.value = result.data
      } else {
        salaryBenchmark.value = null
      }
    } finally {
      benchmarkLoading.value = false
    }
  }

  function clearCurrentJob(): void {
    currentJob.value = null
    salaryBenchmark.value = null
    subscriptionRequired.value = false
  }

  return {
    // state
    jobs,
    currentJob,
    salaryBenchmark,
    loading,
    detailLoading,
    actionLoading,
    benchmarkLoading,
    subscriptionRequired,
    // getters
    jobList,
    totalJobs,
    totalPages,
    isDraft,
    isPublished,
    isClosed,
    canEdit,
    canPublish,
    canClose,
    // actions
    fetchJobs,
    fetchJob,
    publishJob,
    closeJob,
    fetchSalaryBenchmark,
    clearCurrentJob,
  }
})
