import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/common'
import type { TokenRefreshResponse } from '@/types/auth'
import type { RoleCode } from '@/types/enums'
import { useUiStore } from '@/stores/uiStore'

export interface JwtPayload {
  sub: string
  roles: RoleCode[]
  exp: number
  iat: number
  iss?: string
  aud?: string
}

// ── Axios Instance ───────────────────────────────────────────────────
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/vietrecruit',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Token Helpers ────────────────────────────────────────────────────
const TOKEN_KEY = 'vr_access_token'
const REFRESH_KEY = 'vr_refresh_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload) as JwtPayload
  } catch {
    return null
  }
}


// ── Request Interceptor (attach Bearer token) ────────────────────────
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// ── Response Interceptor (401 auto-refresh) ──────────────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return http(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post<ApiResponse<TokenRefreshResponse>>(
          `${import.meta.env.VITE_API_BASE_URL || '/vietrecruit'}/auth/refresh`,
          { refreshToken },
        )

        const newAccessToken = data.data.accessToken
        const newRefreshToken = data.data.refreshToken
        setTokens(newAccessToken, newRefreshToken)

        processQueue(null, newAccessToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }
        return http(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Global toast for 5xx errors so the user always gets feedback
    if (error.response && error.response.status >= 500) {
      try {
        useUiStore().toastError(
          'Lỗi máy chủ',
          'Máy chủ gặp sự cố. Vui lòng thử lại sau.',
        )
      } catch {
        // Pinia may not be ready in SSR or test contexts — safe to ignore
      }
    }

    // Redirect to company setup if user has no company association
    if (error.response?.status === 403) {
      const data = error.response.data as ApiResponse<unknown>
      if (
        data?.code === 'FORBIDDEN' &&
        typeof data?.message === 'string' &&
        data.message.toLowerCase().includes('not associated with any company') &&
        window.location.pathname.startsWith('/employer') &&
        window.location.pathname !== '/employer/company-setup'
      ) {
        window.location.href = '/employer/company-setup'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export default http
