// src/features/plan/services/plan.service.ts
// One function per API endpoint. No business logic — only HTTP calls.

import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type { PlanResponse } from '@/features/plan/types/plan.dto'

const BASE = '/vietrecruit/plans'

export const planService = {
  /** GET /vietrecruit/plans → all active subscription plans */
  async listPlans(): Promise<PlanResponse[]> {
    const { data } = await apiClient.get<ApiResponse<PlanResponse[]>>(BASE)
    return data.data
  },

  /** GET /vietrecruit/plans/:planId → single plan details */
  async getPlan(planId: string): Promise<PlanResponse> {
    const { data } = await apiClient.get<ApiResponse<PlanResponse>>(
      `${BASE}/${planId}`,
    )
    return data.data
  },
}
