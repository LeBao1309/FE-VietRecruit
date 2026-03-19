import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { JobSummaryResponse, JobResponse, JobSearchParams } from '../types/job.schema'

export const useJobBoardStore = defineStore('jobBoard', () => {
  const jobs = ref<JobSummaryResponse[]>([])
  const selectedJob = ref<JobResponse | null>(null)
  const searchParams = ref<JobSearchParams>({ page: 0, size: 10 })
  const totalElements = ref(0)
  const totalPages = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  return {
    jobs,
    selectedJob,
    searchParams,
    totalElements,
    totalPages,
    isLoading,
    error,
  }
})
