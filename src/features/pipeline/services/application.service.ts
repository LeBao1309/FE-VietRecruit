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
   * PATCH /vietrecruit/applications/{id}/status
   * Drag-and-drop trigger. Backend runs @Transactional (status + history in one tx).
   */
  async updateStatus(id: string, payload: UpdateStatusRequest): Promise<Application> {
    const { data } = await apiClient.patch<ApiResponse<Application>>(
      `${BASE}/${id}/status`,
      payload,
    )
    return data.data
  },

  /**
   * POST /vietrecruit/applications/{id}/ai-screening
   * Backend returns 202 Accepted immediately and computes score asynchronously.
   * TODO: confirm async completion callback mechanism with backend team.
   */
  async triggerAiScreening(id: string): Promise<void> {
    await apiClient.post(`${BASE}/${id}/ai-screening`)
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
