// src/features/pipeline/services/application.service.ts
// One async method per endpoint. No business logic — HTTP calls only.
// Pattern mirrors src/features/job/services/job.service.ts exactly.

import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type {
  Application,
  ApplicationDetail,
  ApplicationListParams,
  ApplicationListResponse,
  UpdateStatusRequest,
} from '@/features/pipeline/types/application.dto'
import type { ScreeningResult } from '@/features/pipeline/types/screening.dto'

const BASE = '/vietrecruit/applications'

export const applicationService = {
  /**
   * GET /vietrecruit/applications
   * jobId is required. Returns a paginated list for Kanban grouping.
   */
  async getApplications(params: ApplicationListParams): Promise<ApplicationListResponse> {
    const { data } = await apiClient.get<ApiResponse<ApplicationListResponse>>(BASE, { params })
    return data.data
  },

  /**
   * PUT /vietrecruit/applications/{id}/status
   * Drag-and-drop trigger. Backend runs @Transactional (status + history in one tx).
   */
  async updateStatus(id: string, payload: UpdateStatusRequest): Promise<Application> {
    const { data } = await apiClient.put<ApiResponse<Application>>(
      `${BASE}/${id}/status`,
      payload,
    )
    return data.data
  },

  /**
   * POST /vietrecruit/applications/jobs/{jobId}/screening/trigger
   * Triggers async AI screening for all applications of a job.
   * Backend returns 202 Accepted immediately; scoring is computed asynchronously.
   */
  async triggerAiScreening(jobId: string): Promise<void> {
    await apiClient.post(`${BASE}/jobs/${jobId}/screening/trigger`)
  },

  /**
   * GET /vietrecruit/applications/jobs/{jobId}/screening
   */
  async getScreeningResults(jobId: string): Promise<ScreeningResult> {
    const { data } = await apiClient.get<ApiResponse<ScreeningResult>>(
      `${BASE}/jobs/${jobId}/screening`,
    )
    return data.data
  },

  /**
   * GET /vietrecruit/applications/{id}
   * Returns full detail: coverLetter, cvUrl, statusHistory ordered by changedAt DESC.
   */
  async getApplicationDetail(id: string): Promise<ApplicationDetail> {
    const { data } = await apiClient.get<ApiResponse<ApplicationDetail>>(`${BASE}/${id}`)
    return data.data
  },
}
