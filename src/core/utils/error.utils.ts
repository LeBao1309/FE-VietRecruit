// src/core/utils/error.utils.ts
// Parse backend API errors into user-readable Vietnamese strings

import type { AxiosError } from 'axios'

interface BackendError {
  success: boolean
  code:    string
  message: string
}

/** Map backend error codes to Vietnamese messages */
const ERROR_CODE_MAP: Record<string, string> = {
  // Generic
  'VALIDATION_ERROR':          'Dữ liệu gửi lên không hợp lệ.',
  'BAD_REQUEST':               'Yêu cầu không hợp lệ.',
  'NOT_FOUND':                 'Không tìm thấy dữ liệu yêu cầu.',
  'FORBIDDEN':                 'Bạn không có quyền truy cập.',
  'UNAUTHORIZED':              'Vui lòng đăng nhập để tiếp tục.',
  'INTERNAL_ERROR':            'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
  'TOO_MANY_REQUESTS':         'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.',
  'SERVICE_UNAVAILABLE':       'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',

  // Auth (14)
  'AUTH_INVALID_CREDENTIALS':  'Email hoặc mật khẩu không chính xác.',
  'AUTH_TOKEN_EXPIRED':        'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'AUTH_TOKEN_INVALID':        'Phiên đăng nhập không hợp lệ.',
  'AUTH_REFRESH_TOKEN_EXPIRED':'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'AUTH_REFRESH_TOKEN_INVALID':'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  'AUTH_ACCOUNT_LOCKED':       'Tài khoản đã bị khóa tạm thời do đăng nhập sai quá nhiều lần.',
  'AUTH_ACCOUNT_INACTIVE':     'Tài khoản không hoạt động.',
  'AUTH_PASSWORD_MISMATCH':    'Mật khẩu hiện tại không chính xác.',
  'AUTH_RESET_TOKEN_INVALID':  'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
  'AUTH_OTP_INVALID':          'Mã xác thực không chính xác.',
  'AUTH_OTP_EXPIRED':          'Mã xác thực đã hết hạn.',
  'AUTH_OTP_COOLDOWN':         'Vui lòng chờ trước khi yêu cầu mã mới.',
  'AUTH_OTP_LOCKED':           'Quá nhiều lần thử. Vui lòng thử lại sau.',
  'AUTH_EMAIL_NOT_VERIFIED':   'Địa chỉ email chưa được xác thực.',

  // User (2)
  'USER_USERNAME_CONFLICT':    'Tên người dùng đã tồn tại.',
  'USER_EMAIL_CONFLICT':       'Email này đã được đăng ký.',

  // Subscription (3) + Quota/Plan
  'SUBSCRIPTION_REQUIRED':     'Cần có gói đăng ký để sử dụng tính năng này.',
  'SUBSCRIPTION_EXPIRED':      'Gói đăng ký của bạn đã hết hạn.',
  'SUBSCRIPTION_ALREADY_ACTIVE':'Bạn đã có gói đăng ký đang hoạt động.',
  'QUOTA_EXCEEDED':            'Đã đạt giới hạn số lượng tin tuyển dụng cho gói của bạn.',
  'PLAN_NOT_FOUND':            'Không tìm thấy gói đăng ký.',

  // Payment (6)
  'PAYMENT_CREATION_FAILED':   'Không thể tạo liên kết thanh toán. Vui lòng thử lại.',
  'PAYMENT_NOT_FOUND':         'Không tìm thấy giao dịch thanh toán.',
  'PAYMENT_ALREADY_PENDING':   'Đã có giao dịch đang chờ xử lý.',
  'PAYMENT_EXPIRED':           'Liên kết thanh toán đã hết hạn.',
  'PAYMENT_ACTIVATION_FAILED': 'Không thể kích hoạt gói đăng ký. Vui lòng liên hệ hỗ trợ.',
  'PAYMENT_WEBHOOK_INVALID_SIGNATURE': 'Chữ ký webhook không hợp lệ.',

  // Candidate/File (10)
  'CANDIDATE_NOT_FOUND':       'Không tìm thấy hồ sơ ứng viên.',
  'CANDIDATE_CV_INVALID_TYPE': 'Chỉ chấp nhận file CV định dạng PDF.',
  'CANDIDATE_CV_SIZE_EXCEEDED':'Kích thước file CV vượt quá giới hạn cho phép.',
  'STORAGE_UNAVAILABLE':       'Dịch vụ lưu trữ tạm thời không khả dụng.',
  'FILE_TOO_LARGE':            'Kích thước file vượt quá giới hạn cho phép.',
  'FILE_TYPE_NOT_ALLOWED':     'Định dạng file không được hỗ trợ.',
  'USER_AVATAR_INVALID_TYPE':  'Định dạng ảnh đại diện không hợp lệ.',
  'USER_AVATAR_SIZE_EXCEEDED': 'Kích thước ảnh đại diện vượt quá giới hạn.',
  'USER_BANNER_INVALID_TYPE':  'Định dạng ảnh bìa không hợp lệ.',
  'USER_BANNER_SIZE_EXCEEDED': 'Kích thước ảnh bìa vượt quá giới hạn.',

  // Application (5)
  'APPLICATION_NOT_FOUND':     'Không tìm thấy đơn ứng tuyển.',
  'APPLICATION_DUPLICATE':     'Bạn đã ứng tuyển cho vị trí này rồi.',
  'APPLICATION_INVALID_TRANSITION': 'Không thể chuyển trạng thái đơn ứng tuyển.',
  'APPLICATION_CV_REQUIRED':   'Cần tải lên CV trước khi ứng tuyển.',
  'JOB_NOT_PUBLISHED':         'Tin tuyển dụng không còn khả dụng.',

  // Interview (4)
  'INTERVIEW_NOT_FOUND':       'Không tìm thấy lịch phỏng vấn.',
  'INTERVIEW_INVALID_STATUS':  'Trạng thái phỏng vấn không hợp lệ.',
  'INTERVIEW_INVALID_INTERVIEWER': 'Người phỏng vấn không hợp lệ.',
  'INTERVIEW_INVALID_STATUS_TRANSITION': 'Không thể chuyển trạng thái phỏng vấn.',

  // Scorecard (4)
  'SCORECARD_NOT_FOUND':       'Không tìm thấy phiếu đánh giá.',
  'SCORECARD_DUPLICATE':       'Bạn đã nộp phiếu đánh giá cho buổi phỏng vấn này.',
  'SCORECARD_NOT_ELIGIBLE':    'Bạn không được phân công cho buổi phỏng vấn này.',
  'SCORECARD_INTERVIEW_NOT_READY': 'Buổi phỏng vấn chưa hoàn thành.',

  // Offer (4)
  'OFFER_NOT_FOUND':           'Không tìm thấy thư mời làm việc.',
  'OFFER_ALREADY_EXISTS':      'Đã có thư mời đang hoạt động cho đơn ứng tuyển này.',
  'OFFER_INVALID_TRANSITION':  'Không thể chuyển trạng thái thư mời.',
  'OFFER_APPLICATION_NOT_READY': 'Đơn ứng tuyển chưa sẵn sàng để tạo thư mời.',

  // Invitation (6)
  'INVITATION_NOT_FOUND':      'Không tìm thấy lời mời.',
  'INVITATION_EXPIRED':        'Lời mời đã hết hạn.',
  'INVITATION_ALREADY_ACCEPTED':'Lời mời đã được chấp nhận.',
  'INVALID_ACCOUNT_TYPE':      'Loại tài khoản phải là Ứng viên hoặc Nhà tuyển dụng.',
  'INVALID_INVITATION_ROLE':   'Chỉ có thể mời vai trò HR hoặc Người phỏng vấn.',
  'ROLE_GROUP_VIOLATION':      'Vi phạm nhóm vai trò.',

  // AI (8)
  'AI_SERVICE_UNAVAILABLE':    'Dịch vụ AI tạm thời không khả dụng.',
  'AI_INVALID_RESPONSE':       'Dịch vụ AI trả về kết quả không hợp lệ.',
  'CV_NOT_PARSED':             'Chưa có nội dung CV. Vui lòng tải lên CV trước.',
  'CV_IMPROVEMENT_UNAVAILABLE':'Phân tích CV tạm thời không khả dụng.',
  'INTERVIEW_QUESTIONS_UNAVAILABLE': 'Tạo câu hỏi phỏng vấn tạm thời không khả dụng.',
  'CV_NOT_AVAILABLE_FOR_INTERVIEW': 'Không có CV để tạo câu hỏi phỏng vấn.',
  'SALARY_BENCHMARK_UNAVAILABLE': 'So sánh lương tạm thời không khả dụng.',
  'JD_GENERATION_UNAVAILABLE': 'Tạo mô tả công việc tạm thời không khả dụng.',

  // Other (4)
  'DEPARTMENT_NOT_FOUND':      'Không tìm thấy phòng ban.',
  'NOTIFICATION_SEND_FAILED':  'Gửi thông báo thất bại.',
  'CONCURRENT_MODIFICATION':   'Dữ liệu đã bị thay đổi bởi yêu cầu khác. Vui lòng thử lại.',
  'CONFLICT':                  'Dữ liệu đã tồn tại.',
}

const FALLBACK_MESSAGE = 'Đã xảy ra lỗi. Vui lòng thử lại sau.'

/** Category-based Vietnamese fallback for unmapped error codes */
function getCategoryFallback(code: string): string {
  if (code.startsWith('AUTH_'))        return 'Lỗi xác thực. Vui lòng thử lại.'
  if (code.startsWith('APPLICATION_')) return 'Lỗi xử lý đơn ứng tuyển.'
  if (code.startsWith('PAYMENT_'))     return 'Lỗi thanh toán. Vui lòng thử lại.'
  if (code.startsWith('AI_'))          return 'Dịch vụ AI tạm thời không khả dụng.'
  if (code.startsWith('INTERVIEW_'))   return 'Lỗi xử lý phỏng vấn.'
  if (code.startsWith('OFFER_'))       return 'Lỗi xử lý thư mời làm việc.'
  if (code.startsWith('CANDIDATE_'))   return 'Lỗi xử lý hồ sơ ứng viên.'
  if (code.startsWith('SUBSCRIPTION_'))return 'Lỗi gói đăng ký.'
  return FALLBACK_MESSAGE
}

export function parseApiError(err: unknown): string {
  const axiosErr = err as AxiosError<BackendError>

  // Rate limiting (429)
  if (axiosErr.response?.status === 429) {
    return ERROR_CODE_MAP['TOO_MANY_REQUESTS'] ?? FALLBACK_MESSAGE
  }

  // Backend returned a structured error with a code
  const backendCode = axiosErr.response?.data?.code
  if (backendCode) {
    return ERROR_CODE_MAP[backendCode] ?? getCategoryFallback(backendCode)
  }

  // Network error (no response)
  if (axiosErr.code === 'ERR_NETWORK' || !axiosErr.response) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.'
  }

  return FALLBACK_MESSAGE
}
