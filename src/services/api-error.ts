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
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password.',
  AUTH_ACCOUNT_LOCKED: 'Your account has been locked. Please try again later.',
  AUTH_EMAIL_NOT_VERIFIED: 'Please verify your email before logging in.',
  AUTH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  AUTH_INVALID_TOKEN: 'Invalid token. Please request a new one.',
  AUTH_OTP_EXPIRED: 'OTP has expired. Please request a new code.',
  AUTH_OTP_INVALID: 'Invalid OTP. Please try again.',
  QUOTA_EXCEEDED: 'Active job limit reached. Upgrade your plan for more.',
  VALIDATION_FAILED: 'Please check your input and try again.',
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  RATE_LIMITED: 'Too many requests. Please wait and try again.',
  PAYMENT_ALREADY_PENDING: 'You already have a pending payment.',
  STORAGE_UNAVAILABLE: 'File upload service is temporarily unavailable.',
  INVALID_INVITATION_ROLE: 'Only HR and Interviewer roles can be invited.',
}

/**
 * Extracts a user-friendly AppError from an Axios error.
 * Never exposes raw backend error messages to the UI directly.
 */
export function extractError(error: unknown): AppError {
  const axiosError = error as AxiosError<ApiResponse<unknown>>

  if (axiosError.response) {
    const { status, data } = axiosError.response
    const code = data?.code ?? 'UNKNOWN_ERROR'
    const message =
      ERROR_MESSAGES[code] ??
      data?.message ??
      'An unexpected error occurred.'

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
    message: 'An unexpected error occurred.',
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
