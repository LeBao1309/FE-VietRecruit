import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/common'

// ── Typed API Error ──────────────────────────────────────────────────
export interface AppError {
  code: string
  message: string
  status: number
}

// ── Error message mapping (backend code → user-friendly message) ─────
const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  AUTH_INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  AUTH_ACCOUNT_LOCKED: 'Tài khoản của bạn đã bị khoá. Vui lòng thử lại sau.',
  AUTH_EMAIL_NOT_VERIFIED: 'Vui lòng xác minh email trước khi đăng nhập.',
  AUTH_TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  AUTH_INVALID_TOKEN: 'Token không hợp lệ. Vui lòng yêu cầu token mới.',
  AUTH_OTP_EXPIRED: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
  AUTH_OTP_INVALID: 'Mã OTP không hợp lệ. Vui lòng thử lại.',
  // Subscription & quota
  QUOTA_EXCEEDED: 'Đã đạt giới hạn tin đang hoạt động. Vui lòng nâng cấp gói.',
  SUBSCRIPTION_REQUIRED: 'Bạn cần kích hoạt một gói dịch vụ để sử dụng tính năng này.',
  // General
  VALIDATION_FAILED: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  RESOURCE_NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  RATE_LIMITED: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
  PAYMENT_ALREADY_PENDING: 'Bạn đã có một giao dịch đang chờ xử lý.',
  STORAGE_UNAVAILABLE: 'Dịch vụ lưu trữ tạm thời không khả dụng.',
  INVALID_INVITATION_ROLE: 'Chỉ có thể mời vai trò HR hoặc Phỏng viên.',
  // Job
  JOB_NOT_DRAFT: 'Chỉ có thể chỉnh sửa tin tuyển dụng ở trạng thái nháp.',
  JOB_NOT_PUBLISHED: 'Tin tuyển dụng này chưa được đăng.',
  JOB_ALREADY_PUBLISHED: 'Tin tuyển dụng này đã được đăng rồi.',
  JOB_NOT_FOUND: 'Không tìm thấy tin tuyển dụng.',
  // AI
  AI_SERVICE_UNAVAILABLE: 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.',
  // Application
  APPLICATION_ALREADY_EXISTS: 'Bạn đã nộp đơn cho công việc này rồi.',
  APPLICATION_NO_CV: 'Vui lòng tải CV lên trước khi ứng tuyển.',
  APPLICATION_NOT_FOUND: 'Không tìm thấy đơn ứng tuyển.',
  // Offer
  OFFER_NOT_FOUND: 'Không tìm thấy thư mời làm việc.',
  OFFER_NOT_DRAFT: 'Chỉ có thể chỉnh sửa thư mời ở trạng thái nháp.',
  OFFER_ALREADY_SENT: 'Thư mời này đã được gửi rồi.',
  OFFER_ALREADY_RESPONDED: 'Thư mời này đã được phản hồi rồi.',
  OFFER_NOT_SENT: 'Thư mời này chưa được gửi.',
  // Server errors
  INTERNAL_ERROR: 'Máy chủ gặp sự cố. Vui lòng thử lại sau.',
  INTERNAL_SERVER_ERROR: 'Máy chủ gặp sự cố. Vui lòng thử lại sau.',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
}

/**
 * Extracts a user-friendly AppError from an Axios error.
 * Never exposes raw backend error messages to the UI directly.
 */
export function extractError(error: unknown): AppError {
  const axiosError = error as AxiosError<ApiResponse<unknown>>

  if (axiosError.response) {
    const { status, data } = axiosError.response

    // 5xx — server-side failures; don't leak internal details to the UI
    if (status >= 500) {
      const code = (data as ApiResponse<unknown>)?.code ?? 'INTERNAL_ERROR'
      return {
        code,
        message: ERROR_MESSAGES[code] ?? 'Máy chủ gặp sự cố. Vui lòng thử lại sau.',
        status,
      }
    }

    const code = (data as ApiResponse<unknown>)?.code ?? 'UNKNOWN_ERROR'
    const message =
      ERROR_MESSAGES[code] ??
      (data as ApiResponse<unknown>)?.message ??
      'Đã xảy ra lỗi không xác định. Vui lòng thử lại.'

    return { code, message, status }
  }

  if (axiosError.request) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối.',
      status: 0,
    }
  }

  return {
    code: 'CLIENT_ERROR',
    message: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    status: 0,
  }
}

/**
 * Type guard: unwraps a successful ApiResponse<T> or throws a typed AppError.
 */
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw {
      code: response.code,
      message: ERROR_MESSAGES[response.code] ?? response.message,
      status: 0,
    } satisfies AppError
  }
  return response.data
}

// ── Service Result Wrapper ───────────────────────────────────────────
// Shared across all service files to avoid duplicating this pattern.

export interface ServiceResult<T> {
  data: T | null
  error: AppError | null
}

export function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null }
}

export function fail<T>(error: unknown): ServiceResult<T> {
  return { data: null, error: extractError(error) }
}
