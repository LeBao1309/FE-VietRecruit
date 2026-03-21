// src/features/interview/services/scorecard.service.ts
// One async method per endpoint. No business logic — HTTP calls only.

import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type {
  Scorecard,
  ScorecardSummaryResponse,
  SubmitScorecardRequest,
} from '@/features/interview/types/interview.dto'

const BASE = '/vietrecruit/interviews'

export const scorecardService = {
  /**
   * POST /vietrecruit/interviews/{id}/scorecards
   * Submit a scorecard for a COMPLETED interview.
   * One per reviewer; backend enforces uniqueness.
   */
  async submitScorecard(interviewId: string, payload: SubmitScorecardRequest): Promise<Scorecard> {
    const { data } = await apiClient.post<ApiResponse<Scorecard>>(
      `${BASE}/${interviewId}/scorecards`,
      payload,
    )
    return data.data
  },

  /**
   * GET /vietrecruit/interviews/{id}/scorecards
   * Returns aggregated scorecard summary for HR/COMPANY_ADMIN view.
   */
  async getScorecardSummary(interviewId: string): Promise<ScorecardSummaryResponse> {
    const { data } = await apiClient.get<ApiResponse<ScorecardSummaryResponse>>(
      `${BASE}/${interviewId}/scorecards`,
    )
    return data.data
  },
}
