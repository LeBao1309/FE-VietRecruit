import { defineStore } from 'pinia'
import { ref } from 'vue'
import { jobService } from '@/features/candidate/services/job.service'
import { getErrorMessage } from '@/core/utils/error'
import type { JobSummaryResponse, JobResponse, JobSearchParams } from '../types/job.schema'

export const useJobBoardStore = defineStore('jobBoard', () => {
  const jobs = ref<JobSummaryResponse[]>([])
  const selectedJob = ref<JobResponse | null>(null)
  const searchParams = ref<JobSearchParams>({ page: 0, size: 10 })
  const totalElements = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch jobs using the current searchParams.
   * Attempts Elasticsearch search first (/jobs/search). On ES error,
   * falls back to the standard public listing (/jobs/public).
   */
  async function fetchJobs(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const { keyword, categoryId, locationId, page, size } = searchParams.value
      let result: { content: JobSummaryResponse[]; totalElements: number; totalPages: number }

      if (keyword) {
        try {
          result = await jobService.searchJobs({
            q: keyword,
            category: categoryId,
            location: locationId,
            page: page ?? 0,
            size: size ?? 10,
          })
        } catch {
          // ES unavailable — fall back to standard public endpoint
          result = await jobService.listPublicJobs(searchParams.value)
        }
      } else {
        result = await jobService.listPublicJobs(searchParams.value)
      }

      jobs.value = result.content
      totalElements.value = result.totalElements
      totalPages.value = result.totalPages
      currentPage.value = searchParams.value.page ?? 0
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      isLoading.value = false
    }
  }

  return {
    jobs,
    selectedJob,
    searchParams,
    totalElements,
    totalPages,
    currentPage,
    isLoading,
    error,
    fetchJobs,
  }
})
