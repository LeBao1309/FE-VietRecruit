// src/features/job/services/job.service.ts
// One async method per API endpoint. No business logic — HTTP calls only.
// Pattern mirrors src/features/auth/services/auth.service.ts

import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type {
  CreateJobRequest,
  UpdateJobRequest,
  JobListParams,
  JobListResponse,
  JobEsSearchParams,
} from '@/features/job/types/job.dto'
import type { Job } from '@/features/workspace/types'
import type { JobSummaryResponse } from '@/features/candidate/types/job.schema'

const BASE = '/vietrecruit/jobs'

export const jobService = {
  /**
   * GET /vietrecruit/jobs
   * Returns a paginated list of jobs. Optionally filtered by status.
   */
  async getJobs(params?: JobListParams): Promise<JobListResponse> {
    const { data } = await apiClient.get<ApiResponse<JobListResponse>>(BASE, {
      params,
    })
    return data.data
  },

  /**
   * GET /vietrecruit/jobs/:id
   * Returns a single job by ID (authenticated, employer-facing).
   */
  async getJob(id: string): Promise<Job> {
    const { data } = await apiClient.get<ApiResponse<Job>>(`${BASE}/${id}`)
    return data.data
  },

  /**
   * POST /vietrecruit/jobs
   * Creates a new Job in DRAFT status.
   */
  async createJob(payload: CreateJobRequest): Promise<Job> {
    const { data } = await apiClient.post<ApiResponse<Job>>(BASE, payload)
    return data.data
  },

  /**
   * PUT /vietrecruit/jobs/:id
   * Updates an existing Job. Returns the updated Job.
   */
  async updateJob(id: string, payload: UpdateJobRequest): Promise<Job> {
    const { data } = await apiClient.put<ApiResponse<Job>>(`${BASE}/${id}`, payload)
    return data.data
  },

  /**
   * PUT /vietrecruit/jobs/:id/publish
   * Transitions a DRAFT Job to PUBLISHED.
   * Backend returns 402 when the company's active job quota is exceeded.
   */
  async publishJob(id: string): Promise<Job> {
    const { data } = await apiClient.put<ApiResponse<Job>>(`${BASE}/${id}/publish`)
    return data.data
  },

  /**
   * PUT /vietrecruit/jobs/:id/close
   * Closes a PUBLISHED Job (status → CLOSED). Quota is restored.
   */
  async closeJob(id: string): Promise<Job> {
    const { data } = await apiClient.put<ApiResponse<Job>>(`${BASE}/${id}/close`)
    return data.data
  },

  /**
   * GET /vietrecruit/jobs/search
   * Elasticsearch full-text search for jobs (public). Returns paged JobSummary list.
   */
  async searchJobs(params: JobEsSearchParams): Promise<{ content: JobSummaryResponse[]; totalPages: number; totalElements: number }> {
    const { data } = await apiClient.get<ApiResponse<{ content: JobSummaryResponse[]; totalPages: number; totalElements: number }>>(`${BASE}/search`, { params })
    return data.data
  },

  /**
   * GET /vietrecruit/jobs/autocomplete
   * Returns autocomplete suggestions for the search bar. Silent-fails to [].
   */
  async autocomplete(q: string): Promise<string[]> {
    const { data } = await apiClient.get<ApiResponse<string[]>>(`${BASE}/autocomplete`, {
      params: { q },
    })
    return data.data
  },
}
