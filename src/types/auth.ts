import type { AccountType } from './enums'

// ── Requests ─────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  phone?: string
  accountType?: AccountType
}

export interface RegisterByInviteRequest {
  token: string
  password: string
  fullName: string
}

export interface TokenRefreshRequest {
  refreshToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  newPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface VerifyOtpRequest {
  email: string
  code: string
}

export interface ResendOtpRequest {
  email: string
}

export interface OAuth2CodeExchangeRequest {
  code: string
}

// ── Responses ────────────────────────────────────────────────────────
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

export interface TokenRefreshResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
