import http from './http'
import { extractError, type AppError } from './api-error'
import type { ApiResponse } from '@/types/common'
import type { SubscriptionResponse, QuotaResponse } from '@/types/subscription'

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

// ── Subscription Service ─────────────────────────────────────────────
export const subscriptionService = {
  /** GET /subscriptions/current — current active subscription */
  async getCurrentSubscription(): Promise<ServiceResult<SubscriptionResponse>> {
    try {
      const { data } = await http.get<ApiResponse<SubscriptionResponse>>('/subscriptions/current')
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /subscriptions/current/quota — current quota usage */
  async getCurrentQuota(): Promise<ServiceResult<QuotaResponse>> {
    try {
      const { data } = await http.get<ApiResponse<QuotaResponse>>('/subscriptions/current/quota')
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /subscriptions/current/cancel — cancel subscription */
  async cancelSubscription(): Promise<ServiceResult<void>> {
    try {
      await http.put<ApiResponse<void>>('/subscriptions/current/cancel')
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },
}
