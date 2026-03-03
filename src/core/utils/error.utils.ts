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
  'AUTH_001': 'Email hoặc mật khẩu không chính xác.',
  'AUTH_002': 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.',
  'AUTH_003': 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email.',
  'AUTH_004': 'Mã xác thực không đúng hoặc đã hết hạn.',
  'AUTH_005': 'Email này đã được đăng ký.',
  'AUTH_006': 'Refresh token không hợp lệ. Vui lòng đăng nhập lại.',
  'RATE_LIMIT': 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.',
}

const FALLBACK_MESSAGE = 'Đã xảy ra lỗi. Vui lòng thử lại sau.'

export function parseApiError(err: unknown): string {
  const axiosErr = err as AxiosError<BackendError>

  // Rate limiting (429)
  if (axiosErr.response?.status === 429) {
    return ERROR_CODE_MAP['RATE_LIMIT'] ?? FALLBACK_MESSAGE
  }

  // Backend returned a structured error with a code
  const backendCode = axiosErr.response?.data?.code
  if (backendCode && ERROR_CODE_MAP[backendCode]) {
    return ERROR_CODE_MAP[backendCode] ?? FALLBACK_MESSAGE
  }

  // Backend returned a message string
  const backendMessage = axiosErr.response?.data?.message
  if (backendMessage) return backendMessage

  // Network error (no response)
  if (axiosErr.code === 'ERR_NETWORK' || !axiosErr.response) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.'
  }

  return FALLBACK_MESSAGE
}
