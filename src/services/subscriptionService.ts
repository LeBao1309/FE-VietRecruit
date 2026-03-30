import http from './http'
import { ok, fail, type ServiceResult } from './api-error'
import type { ApiResponse } from '@/types/common'
import type { SubscriptionResponse, QuotaResponse } from '@/types/subscription'

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
