// src/features/interview/services/interview.service.ts
// One async method per endpoint. No business logic — HTTP calls only.

import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type {
  Interview,
  InterviewListParams,
  ScheduleInterviewRequest,
  UpdateInterviewStatusRequest,
} from '@/features/interview/types/interview.dto'

const APPLICATIONS_BASE = '/vietrecruit/applications'
const INTERVIEWS_BASE = '/vietrecruit/interviews'

export const interviewService = {
  /**
   * GET /vietrecruit/applications/{applicationId}/interviews
   * applicationId is required. Returns all interviews for the given application.
   */
  async getInterviews(params: InterviewListParams): Promise<Interview[]> {
    const { applicationId, ...rest } = params
    const { data } = await apiClient.get<ApiResponse<Interview[]>>(
      `${APPLICATIONS_BASE}/${applicationId}/interviews`,
      { params: rest },
    )
    return data.data
  },

  /**
   * GET /vietrecruit/interviews/{id}
   * Returns a single interview by its own ID.
   */
  async getInterview(id: string): Promise<Interview> {
    const { data } = await apiClient.get<ApiResponse<Interview>>(`${INTERVIEWS_BASE}/${id}`)
    return data.data
  },

  /**
   * POST /vietrecruit/applications/{applicationId}/interviews
   * Schedule a new interview. Returns HTTP 201 with the created Interview.
   */
  async scheduleInterview(payload: ScheduleInterviewRequest): Promise<Interview> {
    const { applicationId, ...body } = payload
    const { data } = await apiClient.post<ApiResponse<Interview>>(
      `${APPLICATIONS_BASE}/${applicationId}/interviews`,
      body,
    )
    return data.data
  },

  /**
   * PUT /vietrecruit/interviews/{id}/status
   * Update interview status to COMPLETED or CANCELED.
   */
  async updateStatus(id: string, payload: UpdateInterviewStatusRequest): Promise<Interview> {
    const { data } = await apiClient.put<ApiResponse<Interview>>(
      `${INTERVIEWS_BASE}/${id}/status`,
      payload,
    )
    return data.data
  },
}
