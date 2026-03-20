// src/features/job/stores/useJobStore.ts
// Pinia Setup Store for Job Management.
// Pattern mirrors src/stores/useWorkspaceStore.ts (defineStore Setup syntax).

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { isAxiosError } from 'axios'
import { jobService } from '@/features/job/services/job.service'
import { QuotaExceededError } from '@/features/job/types/job.dto'
import type { Job, JobStatus } from '@/features/workspace/types'
import type { CreateJobRequest, JobListParams } from '@/features/job/types/job.dto'

export const useJobStore = defineStore('job', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const jobs = ref<Job[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const totalPages = ref(0)
  const currentPage = ref(0)
  const activeStatusFilter = ref<JobStatus | undefined>(undefined)

  // ── Computed ──────────────────────────────────────────────────────────────
  const draftJobs = computed(() => jobs.value.filter((j) => j.status === 'DRAFT'))
  const publishedJobs = computed(() => jobs.value.filter((j) => j.status === 'PUBLISHED'))
  const closedJobs = computed(() => jobs.value.filter((j) => j.status === 'CLOSED'))

  // ── Helpers ───────────────────────────────────────────────────────────────
  function setError(e: unknown): void {
    if (e instanceof Error) {
      error.value = e.message
    } else {
      error.value = 'An unexpected error occurred.'
    }
  }

  function updateJobInList(updated: Job): void {
    const index = jobs.value.findIndex((j) => j.id === updated.id)
    if (index !== -1) {
      jobs.value[index] = updated
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Fetch the paginated job list, optionally filtered by status.
   * Replaces the current jobs array.
   */
  async function fetchJobs(params?: JobListParams): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const response = await jobService.getJobs(params)
      jobs.value = response.content
      totalPages.value = response.totalPages
      currentPage.value = response.number
      if (params?.status !== undefined) {
        activeStatusFilter.value = params.status
      }
    } catch (e) {
      setError(e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Submit the create-job form. Returns the created Job on success.
   * The newly created job is prepended to the local list.
   */
  async function createJob(payload: CreateJobRequest): Promise<Job> {
    isLoading.value = true
    error.value = null
    try {
      const created = await jobService.createJob(payload)
      jobs.value.unshift(created)
      return created
    } catch (e) {
      setError(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Publish a DRAFT job (status → PUBLISHED).
   * Throws QuotaExceededError when the backend responds with 402,
   * so the view layer can render a specific quota-exceeded banner.
   */
  async function publishJob(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await jobService.updateJobStatus(id, { status: 'PUBLISHED' })
      updateJobInList(updated)
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 402) {
        const serverMessage: string =
          (e.response.data as { message?: string })?.message ??
          'Job quota exceeded for the current subscription plan.'
        throw new QuotaExceededError(serverMessage)
      }
      setError(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Close a PUBLISHED job (status → CLOSED).
   */
  async function closeJob(id: string): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const updated = await jobService.updateJobStatus(id, { status: 'CLOSED' })
      updateJobInList(updated)
    } catch (e) {
      setError(e)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    jobs,
    isLoading,
    error,
    totalPages,
    currentPage,
    activeStatusFilter,
    // Computed
    draftJobs,
    publishedJobs,
    closedJobs,
    // Actions
    fetchJobs,
    createJob,
    publishJob,
    closeJob,
  }
})
