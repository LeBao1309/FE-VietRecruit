import http from './http'
import { ok, fail, type ServiceResult } from './api-error'
import type { ApiResponse } from '@/types/common'
import type {
  InterviewCreateRequest,
  InterviewResponse,
  InterviewStatusUpdateRequest,
  ScorecardCreateRequest,
  ScorecardResponse,
} from '@/types/application'
import type { InterviewQuestionResponse } from '@/types/ai'

// ── Interview Service ────────────────────────────────────────────────
export const interviewService = {
  /** POST /applications/:id/interviews — Schedule a new interview */
  async scheduleInterview(
    applicationId: string,
    body: InterviewCreateRequest,
  ): Promise<ServiceResult<InterviewResponse>> {
    try {
      const { data } = await http.post<ApiResponse<InterviewResponse>>(
        `/applications/${applicationId}/interviews`,
        body,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /applications/:id/interviews — List interviews for an application */
  async listInterviews(
    applicationId: string,
  ): Promise<ServiceResult<InterviewResponse[]>> {
    try {
      const { data } = await http.get<ApiResponse<InterviewResponse[]>>(
        `/applications/${applicationId}/interviews`,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /interviews/mine — List interviews assigned to the current user (INTERVIEWER) */
  async listMyInterviews(): Promise<ServiceResult<InterviewResponse[]>> {
    try {
      const { data } = await http.get<ApiResponse<InterviewResponse[]>>(
        '/interviews/mine',
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /interviews/:id — Get a single interview */
  async getInterview(id: string): Promise<ServiceResult<InterviewResponse>> {
    try {
      const { data } = await http.get<ApiResponse<InterviewResponse>>(
        `/interviews/${id}`,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /interviews/:id/status — Update interview status (COMPLETED/CANCELED) */
  async updateInterviewStatus(
    id: string,
    body: InterviewStatusUpdateRequest,
  ): Promise<ServiceResult<InterviewResponse>> {
    try {
      const { data } = await http.put<ApiResponse<InterviewResponse>>(
        `/interviews/${id}/status`,
        body,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  // ── Scorecards ───────────────────────────────────────────────────

  /** POST /interviews/:id/scorecards — Submit scorecard (INTERVIEWER) */
  async submitScorecard(
    interviewId: string,
    body: ScorecardCreateRequest,
  ): Promise<ServiceResult<ScorecardResponse>> {
    try {
      const { data } = await http.post<ApiResponse<ScorecardResponse>>(
        `/interviews/${interviewId}/scorecards`,
        body,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /interviews/:id/scorecards — List scorecards for an interview */
  async listScorecards(
    interviewId: string,
  ): Promise<ServiceResult<ScorecardResponse[]>> {
    try {
      const { data } = await http.get<ApiResponse<ScorecardResponse[]>>(
        `/interviews/${interviewId}/scorecards`,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  // ── AI Interview Questions ─────────────────────────────────────

  /** POST /interviews/:id/questions/generate — Generate AI questions */
  async generateQuestions(
    interviewId: string,
  ): Promise<ServiceResult<InterviewQuestionResponse>> {
    try {
      const { data } = await http.post<ApiResponse<InterviewQuestionResponse>>(
        `/interviews/${interviewId}/questions/generate`,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /interviews/:id/questions — Get previously generated questions */
  async getQuestions(
    interviewId: string,
  ): Promise<ServiceResult<InterviewQuestionResponse>> {
    try {
      const { data } = await http.get<ApiResponse<InterviewQuestionResponse>>(
        `/interviews/${interviewId}/questions`,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },
}
