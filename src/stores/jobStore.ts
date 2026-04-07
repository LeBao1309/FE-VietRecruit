import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { JobResponse, JobSummaryResponse } from '@/types/job'
import type { PageResponse, PaginationParams } from '@/types/common'
import type { JobStatus } from '@/types/enums'
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
      ui.toastWarning('Chưa kích hoạt gói dịch vụ', 'Vui lòng chọn một gói (kể cả gói miễn phí) để bắt đầu đăng tuyển.')
      return false
    }

    // Quota guard
    if (sub.isQuotaFull) {
      ui.toastWarning('Đã đạt giới hạn quota', 'Bạn đã đạt giới hạn tin đang hoạt động. Hãy nâng cấp gói để đăng thêm.')
      return false
    }

    actionLoading.value = true
    try {
      const result = await jobService.publishJob(id)
      if (result.data) {
        currentJob.value = result.data
        subscriptionRequired.value = false
        ui.toastSuccess('Đăng tuyển thành công', 'Tin tuyển dụng đã hiển thị công khai tới ứng viên.')
        // Refresh quota
        await sub.fetchCurrentQuota()
        return true
      }
      if (result.error?.code === 'SUBSCRIPTION_REQUIRED') {
        subscriptionRequired.value = true
        ui.toastWarning('Yêu cầu gói đăng ký', result.error.message)
      } else {
        ui.toastError('Đăng tuyển thất bại', result.error?.message)
      }
      return false
    } finally {
      actionLoading.value = false
    }
  }

  async function closeJob(id: string): Promise<boolean> {
    const ui = useUiStore()
    actionLoading.value = true
    try {
      const result = await jobService.closeJob(id)
      if (result.data) {
        currentJob.value = result.data
        ui.toastSuccess('Job closed', 'The job listing has been closed.')
        // Refresh quota (slot released)
        const sub = useSubscriptionStore()
        await sub.fetchCurrentQuota()
        return true
      }
      ui.toastError('Close failed', result.error?.message)
      return false
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
