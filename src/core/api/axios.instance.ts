// src/core/api/axios.instance.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { tokenService } from '@/core/api/token.service'
import type { TokenRefreshResponse } from '@/features/auth/types/auth.dto'

// ── Extend AxiosRequestConfig to track retry state ──
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// ── Lazy router import to avoid circular dependency ──
// router module imports axios instance; importing router here would create a cycle.
// Using a dynamic import inside the handler breaks the cycle safely.
const redirectToLogin = (redirectPath?: string) => {
  import('@/core/router/index').then(({ default: router }) => {
    router.push({
      name: 'Login',
      query: redirectPath ? { redirect: redirectPath } : undefined,
    })
  })
}

// ── Base Axios instance ──
// baseURL resolves from VITE_API_BASE_URL.
// Fallback to '/' ensures same-origin requests so Vercel/Vite proxy forwards /vietrecruit/* correctly.
const baseURL: string = import.meta.env.VITE_API_BASE_URL || '/'

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.debug('[apiClient] baseURL =', baseURL)
}

export const apiClient = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── REQUEST INTERCEPTOR ──
// Inject Bearer token on every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── RESPONSE INTERCEPTOR ──
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined

    // ── Handle 429 Rate Limit
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after']
      const msg = retryAfter 
        ? `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`
        : 'Quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.'
      error.message = msg
      return Promise.reject(error)
    }

    // ── Handle 403 Quota Exceeded
    // If we receive a 403 on specific paths (like publish jobs), we emit an event
    if (error.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('quota:exceeded'))
      // Pass the error back down so form loading states can reset
      return Promise.reject(error)
    }

    // ── Handle 401 Unauthorized (Token Refresh)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      // Guard: if the failing request IS the refresh endpoint → session expired
      if (originalRequest.url?.includes('/auth/refresh')) {
        tokenService.clearAll()
        redirectToLogin()
        return Promise.reject(error)
      }

      // Mark as retrying to prevent infinite loop
      originalRequest._retry = true

      const refreshToken = tokenService.getRefreshToken()
      if (!refreshToken) {
        tokenService.clearAll()
        redirectToLogin(originalRequest.url)
        return Promise.reject(error)
      }

      try {
        // Call refresh endpoint directly (bypass interceptor with a plain axios call)
        const { data } = await axios.post<{ data: TokenRefreshResponse }>(
          `${baseURL.replace(/\/$/, '')}/vietrecruit/auth/refresh`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        const { accessToken, refreshToken: newRefreshToken, expiresIn } = data.data

        // ⚠️ Token rotation: save BOTH the new accessToken AND newRefreshToken
        tokenService.updateAccessToken(accessToken, newRefreshToken, expiresIn)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }
        return apiClient(originalRequest)
      } catch {
        tokenService.clearAll()
        redirectToLogin()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)
