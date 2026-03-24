// src/features/interview/services/ai-interview.service.ts
// HTTP layer for AI interview question generation. No business logic.

import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type {
  GenerateInterviewQuestionsRequest,
  GenerateInterviewQuestionsResponse,
} from '@/features/interview/types/ai-interview.dto'

const BASE = '/vietrecruit/ai/interview-questions'

export const aiInterviewService = {
  /**
   * POST /vietrecruit/ai/interview-questions
   * Generates a list of interview questions tailored to the job and candidate profile.
   */
  async generateQuestions(
    payload: GenerateInterviewQuestionsRequest,
  ): Promise<GenerateInterviewQuestionsResponse> {
    const { data } = await apiClient.post<ApiResponse<GenerateInterviewQuestionsResponse>>(
      BASE,
      payload,
    )
    return data.data
  },
}
