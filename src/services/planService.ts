import http from './http'
import { extractError, type AppError } from './api-error'
import type { ApiResponse } from '@/types/common'
import type { PlanResponse } from '@/types/subscription'

// ── Result wrapper ───────────────────────────────────────────────────
interface ServiceResult<T> {
  data: T | null
  error: AppError | null
}

function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null }
}

function fail<T>(error: unknown): ServiceResult<T> {
  return { data: null, error: extractError(error) }
}

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
