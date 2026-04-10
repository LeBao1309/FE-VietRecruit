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
  AUTH_INVALID_CREDENTIALS: 'Incorrect email or password.',
  AUTH_ACCOUNT_LOCKED: 'Your account has been locked. Please try again later.',
  AUTH_ACCOUNT_INACTIVE: 'Account not yet activated. Please verify your email.',
  AUTH_EMAIL_NOT_VERIFIED: 'Please verify your email address before logging in.',
  AUTH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  AUTH_INVALID_TOKEN: 'Invalid token. Please request a new one.',
  AUTH_TOKEN_INVALID: 'Invalid token. Please log in again.',
  AUTH_REFRESH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  AUTH_REFRESH_TOKEN_INVALID: 'Invalid session. Please log in again.',
  AUTH_OTP_EXPIRED: 'OTP has expired. Please request a new code.',
  AUTH_OTP_INVALID: 'Incorrect OTP. Please try again.',
  AUTH_OTP_COOLDOWN: 'Please wait before requesting a new OTP.',
  AUTH_OTP_LOCKED: 'Too many incorrect OTP attempts. Please try again later.',
  AUTH_PASSWORD_MISMATCH: 'Current password is incorrect.',
  AUTH_RESET_TOKEN_INVALID: 'Password reset link is invalid or has expired.',

  // User
  USER_USERNAME_CONFLICT: 'This username is already taken.',
  USER_EMAIL_CONFLICT: 'This email address is already registered.',
  USER_AVATAR_INVALID_TYPE: 'Unsupported profile photo format. Please use JPEG or PNG.',
  USER_AVATAR_SIZE_EXCEEDED: 'Profile photo exceeds the allowed file size.',
  USER_BANNER_INVALID_TYPE: 'Unsupported cover photo format. Please use JPEG or PNG.',
  USER_BANNER_SIZE_EXCEEDED: 'Cover photo exceeds the allowed file size.',

  // Subscription & quota
  QUOTA_EXCEEDED: 'Active job listing limit reached. Please upgrade your plan.',
  SUBSCRIPTION_REQUIRED: 'An active subscription is required to use this feature.',
  SUBSCRIPTION_EXPIRED: 'Your subscription has expired. Please renew to continue.',
  SUBSCRIPTION_ALREADY_ACTIVE: 'Your company already has an active subscription.',

  // Payment
  PAYMENT_ALREADY_PENDING: 'You have a pending payment transaction.',
  PAYMENT_CREATION_FAILED: 'Unable to create payment transaction. Please try again.',
  PAYMENT_NOT_FOUND: 'Payment transaction not found.',
  PAYMENT_EXPIRED: 'Payment transaction has expired.',
  PAYMENT_ACTIVATION_FAILED: 'Subscription activation after payment failed. Please contact support.',
  PAYMENT_WEBHOOK_INVALID_SIGNATURE: 'Invalid webhook signature.',

  // Candidate / File
  CANDIDATE_NOT_FOUND: 'Candidate profile not found.',
  CANDIDATE_CV_INVALID_TYPE: 'Unsupported CV format. Please upload PDF, DOCX, JPEG, or PNG.',
  CANDIDATE_CV_SIZE_EXCEEDED: 'CV file exceeds the maximum size of 5MB.',
  FILE_TOO_LARGE: 'File exceeds the allowed size limit.',
  FILE_TYPE_NOT_ALLOWED: 'This file type is not supported.',
  STORAGE_UNAVAILABLE: 'Storage service is temporarily unavailable.',

  // Application
  APPLICATION_ALREADY_EXISTS: 'You have already applied for this position.',
  APPLICATION_NO_CV: 'Please upload a CV before applying.',
  APPLICATION_NOT_FOUND: 'Application not found.',
  APPLICATION_DUPLICATE: 'You have already applied for this position.',
  APPLICATION_INVALID_TRANSITION: 'Cannot change application status at this stage.',
  APPLICATION_CV_REQUIRED: 'Candidate has not uploaded a CV. Cannot proceed.',

  // Interview
  INTERVIEW_NOT_FOUND: 'Interview not found.',
  INTERVIEW_INVALID_STATUS: 'Invalid interview status.',
  INTERVIEW_INVALID_INTERVIEWER: 'The assigned interviewer is invalid.',
  INTERVIEW_INVALID_STATUS_TRANSITION: 'Cannot update interview status at this stage.',

  // Scorecard
  SCORECARD_NOT_FOUND: 'Scorecard not found.',
  SCORECARD_DUPLICATE: 'You have already submitted a scorecard for this interview.',
  SCORECARD_NOT_ELIGIBLE: 'You are not eligible to submit a scorecard for this interview.',
  SCORECARD_INTERVIEW_NOT_READY: 'Interview is not yet complete. Cannot submit scorecard.',

  // Offer
  OFFER_NOT_FOUND: 'Offer letter not found.',
  OFFER_NOT_DRAFT: 'Only draft offer letters can be edited.',
  OFFER_ALREADY_SENT: 'This offer letter has already been sent.',
  OFFER_ALREADY_RESPONDED: 'This offer letter has already received a response.',
  OFFER_NOT_SENT: 'Offer letter has not been sent yet.',
  OFFER_ALREADY_EXISTS: 'An offer letter already exists for this application.',
  OFFER_INVALID_TRANSITION: 'Cannot update offer letter status at this stage.',
  OFFER_APPLICATION_NOT_READY: 'Application is not in the correct state to create an offer.',

  // Invitation / Role
  INVALID_INVITATION_ROLE: 'Members can only be invited with the HR or Interviewer role.',
  INVITATION_NOT_FOUND: 'Invitation not found.',
  INVITATION_EXPIRED: 'Invitation has expired.',
  INVITATION_ALREADY_ACCEPTED: 'This invitation has already been accepted.',
  INVALID_ACCOUNT_TYPE: 'Account type does not match the invitation.',
  ROLE_GROUP_VIOLATION: 'The assigned role does not belong to a valid permission group.',

  // Job
  JOB_NOT_DRAFT: 'Only draft job listings can be edited.',
  JOB_NOT_PUBLISHED: 'This job listing has not been published.',
  JOB_ALREADY_PUBLISHED: 'This job listing has already been published.',
  JOB_NOT_FOUND: 'Job listing not found.',

  // AI
  AI_SERVICE_UNAVAILABLE: 'AI service is temporarily unavailable. Please try again later.',
  AI_INVALID_RESPONSE: 'AI service returned an invalid response. Please try again.',
  CV_NOT_PARSED: 'Unable to parse CV content. Please check the file format.',
  CV_IMPROVEMENT_UNAVAILABLE: 'CV improvement suggestions are currently unavailable.',
  INTERVIEW_QUESTIONS_UNAVAILABLE: 'Unable to generate interview questions right now. Please try again later.',
  SALARY_BENCHMARK_UNAVAILABLE: 'Salary benchmark data is currently unavailable.',
  JD_GENERATION_UNAVAILABLE: 'AI job description generation is currently unavailable.',

  // Reference data
  DEPARTMENT_NOT_FOUND: 'Department not found.',
  PLAN_NOT_FOUND: 'Subscription plan not found.',

  // Generic / Server
  VALIDATION_FAILED: 'Invalid data. Please check your input and try again.',
  RESOURCE_NOT_FOUND: 'The requested resource was not found.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  BAD_REQUEST: 'Invalid request. Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not logged in or your session has expired.',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  CONCURRENT_MODIFICATION: 'Data was modified by someone else. Please reload the page.',
  CONFLICT: 'Data conflict. Please reload the page and try again.',
  NOTIFICATION_SEND_FAILED: 'Unable to send notification. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
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
