import http from './http'
import { extractError, type AppError } from './api-error'
import type { ApiResponse, SpringPageResponse, PageResponse, PaginationParams } from '@/types/common'
import { normalizeSpringPage } from '@/types/common'
import type {
  CheckoutRequest,
  CheckoutResponse,
  PaymentStatusResponse,
  TransactionHistoryResponse,
} from '@/types/subscription'

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

// ── Payment Service ──────────────────────────────────────────────────
export const paymentService = {
  /** POST /payment/checkout — create PayOS payment link */
  async checkout(body: CheckoutRequest): Promise<ServiceResult<CheckoutResponse>> {
    try {
      const { data } = await http.post<ApiResponse<CheckoutResponse>>('/payment/checkout', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /payment/payment-status/:orderCode — poll payment status */
  async getPaymentStatus(orderCode: number): Promise<ServiceResult<PaymentStatusResponse>> {
    try {
      const { data } = await http.get<ApiResponse<PaymentStatusResponse>>(
        `/payment/payment-status/${orderCode}`,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /payment/transactions — paginated transaction history for company */
  async getTransactions(
    params?: PaginationParams,
  ): Promise<ServiceResult<PageResponse<TransactionHistoryResponse>>> {
    try {
      const { data } = await http.get<
        ApiResponse<SpringPageResponse<TransactionHistoryResponse>>
      >('/payment/transactions', { params })
      return ok(normalizeSpringPage(data.data))
    } catch (error) {
      return fail(error)
    }
  },
}
