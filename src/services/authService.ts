import http from './http'
import { ok, fail, type ServiceResult } from './api-error'
import type { ApiResponse } from '@/types/common'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterByInviteRequest,
  TokenRefreshRequest,
  TokenRefreshResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyOtpRequest,
  ResendOtpRequest,
  OAuth2CodeExchangeRequest,
} from '@/types/auth'
import type { UserProfileResponse } from '@/types/user'
import { setTokens, clearTokens } from './http'

// ── Auth Service ─────────────────────────────────────────────────────
export const authService = {
  async login(body: LoginRequest): Promise<ServiceResult<LoginResponse>> {
    try {
      const { data } = await http.post<ApiResponse<LoginResponse>>('/auth/login', body)
      const result = data.data
      setTokens(result.accessToken, result.refreshToken)
      return ok(result)
    } catch (error) {
      return fail(error)
    }
  },

  async register(body: RegisterRequest): Promise<ServiceResult<Record<string, unknown>>> {
    try {
      const { data } = await http.post<ApiResponse<Record<string, unknown>>>('/auth/register', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  async registerByInvite(body: RegisterByInviteRequest): Promise<ServiceResult<void>> {
    try {
      await http.post<ApiResponse<void>>('/auth/register/invite', body)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },

  async refresh(body: TokenRefreshRequest): Promise<ServiceResult<TokenRefreshResponse>> {
    try {
      const { data } = await http.post<ApiResponse<TokenRefreshResponse>>('/auth/refresh', body)
      const result = data.data
      setTokens(result.accessToken, result.refreshToken)
      return ok(result)
    } catch (error) {
      return fail(error)
    }
  },

  async logout(): Promise<ServiceResult<void>> {
    try {
      await http.post<ApiResponse<void>>('/auth/logout')
      clearTokens()
      return ok(undefined as unknown as void)
    } catch (error) {
      clearTokens()
      return fail(error)
    }
  },

  async forgotPassword(body: ForgotPasswordRequest): Promise<ServiceResult<void>> {
    try {
      await http.post<ApiResponse<void>>('/auth/forgot-password', body)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },

  async resetPassword(body: ResetPasswordRequest): Promise<ServiceResult<void>> {
    try {
      await http.post<ApiResponse<void>>('/auth/reset-password', body)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },

  async changePassword(body: ChangePasswordRequest): Promise<ServiceResult<void>> {
    try {
      await http.post<ApiResponse<void>>('/auth/change-password', body)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },

  async verifyOtp(body: VerifyOtpRequest): Promise<ServiceResult<void>> {
    try {
      await http.post<ApiResponse<void>>('/auth/verify-otp', body)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },

  async resendOtp(body: ResendOtpRequest): Promise<ServiceResult<void>> {
    try {
      await http.post<ApiResponse<void>>('/auth/resend-otp', body)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },

  async oauth2Exchange(body: OAuth2CodeExchangeRequest): Promise<ServiceResult<LoginResponse>> {
    try {
      const { data } = await http.post<ApiResponse<LoginResponse>>('/auth/oauth2/exchange', body)
      const result = data.data
      setTokens(result.accessToken, result.refreshToken)
      return ok(result)
    } catch (error) {
      return fail(error)
    }
  },

  async getProfile(): Promise<ServiceResult<UserProfileResponse>> {
    try {
      const { data } = await http.get<ApiResponse<UserProfileResponse>>('/users/me')
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },
}
