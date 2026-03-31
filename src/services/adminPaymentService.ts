import http from './http'
import { ok, fail, type ServiceResult } from './api-error'
import type { ApiResponse, SpringPageResponse, PageResponse, PaginationParams } from '@/types/common'
import { normalizeSpringPage } from '@/types/common'
import type { TransactionHistoryResponse } from '@/types/subscription'

// ── Admin Payment Service ────────────────────────────────────────────
export const adminPaymentService = {
  /** GET /admin/payment/transactions — all transactions (TRANSACTION:VIEW_ALL) */
  async getTransactions(
    params?: PaginationParams & { companyId?: string },
  ): Promise<ServiceResult<PageResponse<TransactionHistoryResponse>>> {
    try {
      const { data } = await http.get<
        ApiResponse<SpringPageResponse<TransactionHistoryResponse>>
      >('/admin/payment/transactions', { params })
      return ok(normalizeSpringPage(data.data))
    } catch (error) {
      return fail(error)
    }
  },
}
