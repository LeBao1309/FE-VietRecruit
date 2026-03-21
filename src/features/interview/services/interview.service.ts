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

const BASE = '/vietrecruit/interviews'

export const interviewService = {
  /**
   * GET /vietrecruit/interviews
   * applicationId is required for HR/COMPANY_ADMIN view.
   */
  async getInterviews(params: InterviewListParams): Promise<Interview[]> {
    const { data } = await apiClient.get<ApiResponse<Interview[]>>(BASE, { params })
    return data.data
  },

  /**
   * GET /vietrecruit/interviews/my-interviews
   * Returns interviews where the current user is in interviewerIds.
   */
  async getMyInterviews(params?: Pick<InterviewListParams, 'status'>): Promise<Interview[]> {
    const { data } = await apiClient.get<ApiResponse<Interview[]>>(`${BASE}/my-interviews`, {
      params,
    })
    return data.data
  },

  /**
   * POST /vietrecruit/interviews
   * Schedule a new interview. Returns HTTP 201 with the created Interview.
   */
  async scheduleInterview(payload: ScheduleInterviewRequest): Promise<Interview> {
    const { data } = await apiClient.post<ApiResponse<Interview>>(BASE, payload)
    return data.data
  },

  /**
   * PUT /vietrecruit/interviews/{id}/status
   * Update interview status to COMPLETED or CANCELED.
   */
  async updateStatus(id: string, payload: UpdateInterviewStatusRequest): Promise<Interview> {
    const { data } = await apiClient.put<ApiResponse<Interview>>(
      `${BASE}/${id}/status`,
      payload,
    )
    return data.data
  },
}
