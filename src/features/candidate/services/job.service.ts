import { apiClient } from '@/core/api/axios.instance'
import type { JobResponse, JobSearchParams, JobSummaryResponse } from '../types/job.schema'

export const jobService = {
  listPublicJobs: async (params: JobSearchParams): Promise<{ content: JobSummaryResponse[], totalElements: number, totalPages: number }> => {
    const response = await apiClient.get('/vietrecruit/jobs/public', { params })
    const payload = response.data.data || response.data
    return {
      content: payload.content || payload.data || [],
      totalElements: payload.totalElements || 0,
      totalPages: payload.totalPages || 0
    }
  },

  getPublicJob: async (id: string): Promise<JobResponse> => {
    const response = await apiClient.get(`/vietrecruit/jobs/public/${id}`)
    return response.data.data
  }
}
