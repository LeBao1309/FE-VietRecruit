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
  AUTH_INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác.',
  AUTH_ACCOUNT_LOCKED: 'Tài khoản của bạn đã bị khoá. Vui lòng thử lại sau.',
  AUTH_ACCOUNT_INACTIVE: 'Tài khoản chưa được kích hoạt. Vui lòng xác minh email.',
  AUTH_EMAIL_NOT_VERIFIED: 'Vui lòng xác minh địa chỉ email trước khi đăng nhập.',
  AUTH_TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  AUTH_INVALID_TOKEN: 'Token không hợp lệ. Vui lòng yêu cầu token mới.',
  AUTH_TOKEN_INVALID: 'Token không hợp lệ. Vui lòng đăng nhập lại.',
  AUTH_REFRESH_TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  AUTH_REFRESH_TOKEN_INVALID: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  AUTH_OTP_EXPIRED: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',
  AUTH_OTP_INVALID: 'Mã OTP không đúng. Vui lòng thử lại.',
  AUTH_OTP_COOLDOWN: 'Vui lòng chờ trước khi yêu cầu mã OTP mới.',
  AUTH_OTP_LOCKED: 'Bạn đã nhập sai mã OTP quá nhiều lần. Vui lòng thử lại sau.',
  AUTH_PASSWORD_MISMATCH: 'Mật khẩu hiện tại không chính xác.',
  AUTH_RESET_TOKEN_INVALID: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',

  // User
  USER_USERNAME_CONFLICT: 'Tên người dùng này đã được sử dụng.',
  USER_EMAIL_CONFLICT: 'Địa chỉ email này đã được đăng ký.',
  USER_AVATAR_INVALID_TYPE: 'Định dạng ảnh đại diện không được hỗ trợ. Vui lòng dùng JPEG hoặc PNG.',
  USER_AVATAR_SIZE_EXCEEDED: 'Ảnh đại diện vượt quá dung lượng cho phép.',
  USER_BANNER_INVALID_TYPE: 'Định dạng ảnh bìa không được hỗ trợ. Vui lòng dùng JPEG hoặc PNG.',
  USER_BANNER_SIZE_EXCEEDED: 'Ảnh bìa vượt quá dung lượng cho phép.',

  // Subscription & quota
  QUOTA_EXCEEDED: 'Đã đạt giới hạn số lượng tin tuyển dụng. Vui lòng nâng cấp gói dịch vụ.',
  SUBSCRIPTION_REQUIRED: 'Bạn cần kích hoạt gói dịch vụ để sử dụng tính năng này.',
  SUBSCRIPTION_EXPIRED: 'Gói dịch vụ của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục.',
  SUBSCRIPTION_ALREADY_ACTIVE: 'Công ty của bạn đang có gói dịch vụ hoạt động.',

  // Payment
  PAYMENT_ALREADY_PENDING: 'Bạn đang có giao dịch chờ thanh toán.',
  PAYMENT_CREATION_FAILED: 'Không thể tạo giao dịch thanh toán. Vui lòng thử lại.',
  PAYMENT_NOT_FOUND: 'Không tìm thấy giao dịch thanh toán.',
  PAYMENT_EXPIRED: 'Giao dịch thanh toán đã hết hạn.',
  PAYMENT_ACTIVATION_FAILED: 'Kích hoạt gói dịch vụ sau thanh toán thất bại. Vui lòng liên hệ hỗ trợ.',
  PAYMENT_WEBHOOK_INVALID_SIGNATURE: 'Chữ ký webhook không hợp lệ.',

  // Candidate / File
  CANDIDATE_NOT_FOUND: 'Không tìm thấy hồ sơ ứng viên.',
  CANDIDATE_CV_INVALID_TYPE: 'Định dạng CV không được hỗ trợ. Vui lòng tải lên PDF, DOCX, JPEG hoặc PNG.',
  CANDIDATE_CV_SIZE_EXCEEDED: 'Tệp CV vượt quá dung lượng tối đa 5MB.',
  FILE_TOO_LARGE: 'Tệp vượt quá dung lượng cho phép.',
  FILE_TYPE_NOT_ALLOWED: 'Định dạng tệp này không được hỗ trợ.',
  STORAGE_UNAVAILABLE: 'Dịch vụ lưu trữ tạm thời không khả dụng.',

  // Application
  APPLICATION_ALREADY_EXISTS: 'Bạn đã ứng tuyển vị trí này trước đó.',
  APPLICATION_NO_CV: 'Vui lòng tải lên CV trước khi ứng tuyển.',
  APPLICATION_NOT_FOUND: 'Không tìm thấy đơn ứng tuyển.',
  APPLICATION_DUPLICATE: 'Bạn đã ứng tuyển vị trí này trước đó.',
  APPLICATION_INVALID_TRANSITION: 'Không thể chuyển trạng thái đơn ứng tuyển ở bước này.',
  APPLICATION_CV_REQUIRED: 'Ứng viên chưa tải lên CV. Không thể tiếp tục.',

  // Interview
  INTERVIEW_NOT_FOUND: 'Không tìm thấy lịch phỏng vấn.',
  INTERVIEW_INVALID_STATUS: 'Trạng thái phỏng vấn không hợp lệ.',
  INTERVIEW_INVALID_INTERVIEWER: 'Người phỏng vấn được chỉ định không hợp lệ.',
  INTERVIEW_INVALID_STATUS_TRANSITION: 'Không thể cập nhật trạng thái phỏng vấn ở bước này.',

  // Scorecard
  SCORECARD_NOT_FOUND: 'Không tìm thấy phiếu đánh giá.',
  SCORECARD_DUPLICATE: 'Bạn đã nộp phiếu đánh giá cho buổi phỏng vấn này.',
  SCORECARD_NOT_ELIGIBLE: 'Bạn không được phép nộp phiếu đánh giá cho buổi phỏng vấn này.',
  SCORECARD_INTERVIEW_NOT_READY: 'Buổi phỏng vấn chưa hoàn thành. Không thể nộp phiếu đánh giá.',

  // Offer
  OFFER_NOT_FOUND: 'Không tìm thấy thư đề nghị.',
  OFFER_NOT_DRAFT: 'Chỉ có thể chỉnh sửa thư đề nghị ở trạng thái Nháp.',
  OFFER_ALREADY_SENT: 'Thư đề nghị này đã được gửi.',
  OFFER_ALREADY_RESPONDED: 'Thư đề nghị này đã có phản hồi.',
  OFFER_NOT_SENT: 'Thư đề nghị chưa được gửi.',
  OFFER_ALREADY_EXISTS: 'Đã tồn tại thư đề nghị cho đơn ứng tuyển này.',
  OFFER_INVALID_TRANSITION: 'Không thể cập nhật trạng thái thư đề nghị ở bước này.',
  OFFER_APPLICATION_NOT_READY: 'Đơn ứng tuyển chưa ở trạng thái phù hợp để tạo thư đề nghị.',

  // Invitation / Role
  INVALID_INVITATION_ROLE: 'Chỉ có thể mời thành viên với vai trò HR hoặc Phỏng vấn viên.',
  INVITATION_NOT_FOUND: 'Không tìm thấy lời mời.',
  INVITATION_EXPIRED: 'Lời mời đã hết hạn.',
  INVITATION_ALREADY_ACCEPTED: 'Lời mời này đã được chấp nhận.',
  INVALID_ACCOUNT_TYPE: 'Loại tài khoản không phù hợp với lời mời.',
  ROLE_GROUP_VIOLATION: 'Vai trò được chỉ định không thuộc nhóm quyền hợp lệ.',

  // Job
  JOB_NOT_DRAFT: 'Chỉ có thể chỉnh sửa tin tuyển dụng ở trạng thái Nháp.',
  JOB_NOT_PUBLISHED: 'Tin tuyển dụng này chưa được đăng.',
  JOB_ALREADY_PUBLISHED: 'Tin tuyển dụng này đã được đăng.',
  JOB_NOT_FOUND: 'Không tìm thấy tin tuyển dụng.',

  // AI
  AI_SERVICE_UNAVAILABLE: 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.',
  AI_INVALID_RESPONSE: 'Dịch vụ AI trả về kết quả không hợp lệ. Vui lòng thử lại.',
  CV_NOT_PARSED: 'Không thể phân tích nội dung CV. Vui lòng kiểm tra định dạng tệp.',
  CV_IMPROVEMENT_UNAVAILABLE: 'Tính năng gợi ý cải thiện CV hiện không khả dụng.',
  INTERVIEW_QUESTIONS_UNAVAILABLE: 'Không thể tạo câu hỏi phỏng vấn lúc này. Vui lòng thử lại sau.',
  SALARY_BENCHMARK_UNAVAILABLE: 'Dữ liệu tham chiếu mức lương hiện không khả dụng.',
  JD_GENERATION_UNAVAILABLE: 'Tính năng tạo mô tả công việc bằng AI hiện không khả dụng.',

  // Reference data
  DEPARTMENT_NOT_FOUND: 'Không tìm thấy phòng ban.',
  PLAN_NOT_FOUND: 'Không tìm thấy gói dịch vụ.',

  // Generic / Server
  VALIDATION_FAILED: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
  RESOURCE_NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  RATE_LIMITED: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
  BAD_REQUEST: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
  NOT_FOUND: 'Không tìm thấy tài nguyên yêu cầu.',
  UNAUTHORIZED: 'Bạn chưa đăng nhập hoặc phiên đã hết hạn.',
  TOO_MANY_REQUESTS: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
  CONCURRENT_MODIFICATION: 'Dữ liệu đã được thay đổi bởi người khác. Vui lòng tải lại trang.',
  CONFLICT: 'Xung đột dữ liệu. Vui lòng tải lại trang và thử lại.',
  NOTIFICATION_SEND_FAILED: 'Không thể gửi thông báo. Vui lòng thử lại sau.',
  SERVICE_UNAVAILABLE: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
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
        message: ERROR_MESSAGES[code] ?? 'The server encountered an error. Please try again later.',
        status,
      }
    }

    const code = (data as ApiResponse<unknown>)?.code ?? 'UNKNOWN_ERROR'
    const message =
      ERROR_MESSAGES[code] ??
      (data as ApiResponse<unknown>)?.message ??
      'An unknown error occurred. Please try again.'

    return { code, message, status }
  }

  if (axiosError.request) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to the server. Please check your connection.',
      status: 0,
    }
  }

  return {
    code: 'CLIENT_ERROR',
    message: 'An unknown error occurred. Please try again.',
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
