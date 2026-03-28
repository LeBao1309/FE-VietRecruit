import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/common'
import type { TokenRefreshResponse } from '@/types/auth'

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

    return Promise.reject(error)
  },
)

export default http
