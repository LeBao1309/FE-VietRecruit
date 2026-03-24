import { apiClient } from '@/core/api/axios.instance'
import type { JobResponse, JobSearchParams, JobSummaryResponse } from '../types/job.schema'

const BASE = '/vietrecruit/jobs'

export const jobService = {
  listPublicJobs: async (params: JobSearchParams): Promise<{ content: JobSummaryResponse[]; totalElements: number; totalPages: number }> => {
    const response = await apiClient.get(`${BASE}/public`, { params })
    const payload = response.data.data || response.data
    return {
      content: payload.content || payload.data || [],
      totalElements: payload.totalElements || 0,
      totalPages: payload.totalPages || 0,
    }
  },

  getPublicJob: async (id: string): Promise<JobResponse> => {
    const response = await apiClient.get(`${BASE}/public/${id}`)
    return response.data.data
  },

  /**
   * GET /vietrecruit/jobs/search
   * Elasticsearch full-text search. Falls back gracefully when called through the store.
   */
  searchJobs: async (params: { q?: string; category?: string; location?: string; page?: number; size?: number }): Promise<{ content: JobSummaryResponse[]; totalElements: number; totalPages: number }> => {
    const response = await apiClient.get(`${BASE}/search`, { params })
    const payload = response.data.data || response.data
    return {
      content: payload.content || payload.data || [],
      totalElements: payload.totalElements || 0,
      totalPages: payload.totalPages || 0,
    }
  },

  /**
   * GET /vietrecruit/jobs/autocomplete
   * Returns title suggestions for the search bar. Returns [] on any error.
   */
  autocomplete: async (q: string): Promise<string[]> => {
    const response = await apiClient.get(`${BASE}/autocomplete`, { params: { q } })
    return response.data.data ?? []
  },
}
