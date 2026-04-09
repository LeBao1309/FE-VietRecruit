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
  AUTH_INVALID_CREDENTIALS: 'Incorrect email address or password.',
  AUTH_ACCOUNT_LOCKED: 'Your account has been locked. Please try again later.',
  AUTH_EMAIL_NOT_VERIFIED: 'Please verify your email address before signing in.',
  AUTH_TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  AUTH_INVALID_TOKEN: 'Invalid token. Please request a new token.',
  AUTH_OTP_EXPIRED: 'OTP code has expired. Please request a new code.',
  AUTH_OTP_INVALID: 'Invalid OTP code. Please try again.',
  // Subscription & quota
  QUOTA_EXCEEDED: 'Active listing limit reached. Please upgrade your plan.',
  SUBSCRIPTION_REQUIRED: 'You must activate a service plan to use this feature.',
  // General
  VALIDATION_FAILED: 'Invalid data. Please review your input.',
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  PAYMENT_ALREADY_PENDING: 'You already have a pending transaction.',
  STORAGE_UNAVAILABLE: 'Storage service is temporarily unavailable.',
  INVALID_INVITATION_ROLE: 'Only the HR Manager or Interviewer roles may be invited.',
  // Job
  JOB_NOT_DRAFT: 'Only job listings in Draft status may be edited.',
  JOB_NOT_PUBLISHED: 'This job listing has not been published.',
  JOB_ALREADY_PUBLISHED: 'This job listing has already been published.',
  JOB_NOT_FOUND: 'Job listing not found.',
  // AI
  AI_SERVICE_UNAVAILABLE: 'AI service is temporarily unavailable. Please try again later.',
  // Application
  APPLICATION_ALREADY_EXISTS: 'You have already applied for this position.',
  APPLICATION_NO_CV: 'Please upload your CV before applying.',
  APPLICATION_NOT_FOUND: 'Application not found.',
  // Offer
  OFFER_NOT_FOUND: 'Job offer letter not found.',
  OFFER_NOT_DRAFT: 'Only offer letters in Draft status may be edited.',
  OFFER_ALREADY_SENT: 'This offer letter has already been sent.',
  OFFER_ALREADY_RESPONDED: 'This offer letter has already received a response.',
  OFFER_NOT_SENT: 'This offer letter has not been sent yet.',
  // Server errors
  INTERNAL_ERROR: 'The server encountered an error. Please try again later.',
  INTERNAL_SERVER_ERROR: 'The server encountered an error. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.',
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
