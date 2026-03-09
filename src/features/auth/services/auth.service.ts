// src/features/auth/services/auth.service.ts
// One function per API endpoint. No business logic here — only HTTP calls.

import { apiClient } from '@/core/api/axios.instance'
import type {
  LoginRequest,
  LoginResponse,
  RegisterApiPayload,
  VerifyOtpRequest,
  TokenRefreshResponse,
} from '@/features/auth/types/auth.dto'

const BASE = '/vietrecruit/auth'

export const authService = {
  /** 1. Login → returns both tokens */
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<{ data: LoginResponse }>(
      `${BASE}/login`,
      payload,
    )
    return data.data
  },

  /** 2. Register → 201, no response data */
  async register(payload: RegisterApiPayload): Promise<void> {
    await apiClient.post(`${BASE}/register`, payload)
  },

  /** 3. Verify OTP — field name is "code" per spec */
  async verifyOtp(payload: VerifyOtpRequest): Promise<void> {
    await apiClient.post(`${BASE}/verify-otp`, payload)
  },

  /** 4. Resend OTP */
  async resendOtp(email: string): Promise<void> {
    await apiClient.post(`${BASE}/resend-otp`, { email })
  },

  /** 5. Refresh token — called by interceptor, exposed here for completeness */
  async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const { data } = await apiClient.post<{ data: TokenRefreshResponse }>(
      `${BASE}/refresh`,
      { refreshToken },
    )
    return data.data
  },

  /** 6. Logout — no body, uses Authorization header from interceptor */
  async logout(): Promise<void> {
    await apiClient.post(`${BASE}/logout`)
  },

  /** 7. Forgot password — triggers email */
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post(`${BASE}/forgot-password`, { email })
  },
}
