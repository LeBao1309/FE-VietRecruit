// src/features/job/services/job.service.ts
// One async method per API endpoint. No business logic — HTTP calls only.
// Pattern mirrors src/features/auth/services/auth.service.ts

import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type {
  CreateJobRequest,
  JobListParams,
  JobListResponse,
} from '@/features/job/types/job.dto'
import type { Job } from '@/features/workspace/types'

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
   * POST /vietrecruit/jobs
   * Creates a new Job in DRAFT status.
   */
  async createJob(payload: CreateJobRequest): Promise<Job> {
    const { data } = await apiClient.post<ApiResponse<Job>>(BASE, payload)
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
}
