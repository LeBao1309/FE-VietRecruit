import http from './http'
import { extractError, type AppError } from './api-error'
import type { ApiResponse } from '@/types/common'
import type {
  UserProfileResponse,
  UpdateProfileRequest,
  AvatarUploadResponse,
  BannerUploadResponse,
  ExternalUrlRequest,
} from '@/types/user'

// ── Result wrapper ───────────────────────────────────────────────────
interface ServiceResult<T> {
  data: T | null
  error: AppError | null
}

function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null }
}

function fail<T>(error: unknown): ServiceResult<T> {
  return { data: null, error: extractError(error) }
}

// ── User Service ─────────────────────────────────────────────────────
export const userService = {
  /** GET /users/me */
  async getProfile(): Promise<ServiceResult<UserProfileResponse>> {
    try {
      const { data } = await http.get<ApiResponse<UserProfileResponse>>('/users/me')
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /users/me */
  async updateProfile(body: UpdateProfileRequest): Promise<ServiceResult<UserProfileResponse>> {
    try {
      const { data } = await http.put<ApiResponse<UserProfileResponse>>('/users/me', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** POST /users/me/avatar — multipart/form-data */
  async uploadAvatar(file: File): Promise<ServiceResult<AvatarUploadResponse>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await http.post<ApiResponse<AvatarUploadResponse>>(
        '/users/me/avatar',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /users/me/avatar/url — external URL */
  async setAvatarUrl(url: string): Promise<ServiceResult<void>> {
    try {
      await http.put<ApiResponse<void>>('/users/me/avatar/url', { url } satisfies ExternalUrlRequest)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },

  /** DELETE /users/me/avatar */
  async deleteAvatar(): Promise<ServiceResult<void>> {
    try {
      await http.delete<ApiResponse<void>>('/users/me/avatar')
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },

  /** POST /users/me/banner — multipart/form-data */
  async uploadBanner(file: File): Promise<ServiceResult<BannerUploadResponse>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await http.post<ApiResponse<BannerUploadResponse>>(
        '/users/me/banner',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /users/me/banner/url — external URL */
  async setBannerUrl(url: string): Promise<ServiceResult<void>> {
    try {
      await http.put<ApiResponse<void>>('/users/me/banner/url', { url } satisfies ExternalUrlRequest)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },

  /** DELETE /users/me/banner */
  async deleteBanner(): Promise<ServiceResult<void>> {
    try {
      await http.delete<ApiResponse<void>>('/users/me/banner')
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },
}
