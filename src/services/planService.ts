import http from './http'
import { ok, fail, type ServiceResult } from './api-error'
import type { ApiResponse } from '@/types/common'
import type { PlanResponse } from '@/types/subscription'

// ── Plan Service ─────────────────────────────────────────────────────
export const planService = {
  /** GET /plans — list all active subscription plans (public) */
  async listPlans(): Promise<ServiceResult<PlanResponse[]>> {
    try {
      const { data } = await http.get<ApiResponse<PlanResponse[]>>('/plans')
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /plans/:planId — get a single plan by ID */
  async getPlan(planId: string): Promise<ServiceResult<PlanResponse>> {
    try {
      const { data } = await http.get<ApiResponse<PlanResponse>>(`/plans/${planId}`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },
}
