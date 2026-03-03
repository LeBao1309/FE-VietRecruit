// src/core/api/token.service.ts
// Centralized read/write/clear for localStorage tokens.
// All other files import from here — never access localStorage directly.

const KEYS = {
  ACCESS_TOKEN:  'vr_access_token',
  REFRESH_TOKEN: 'vr_refresh_token',
  EXPIRES_AT:    'vr_expires_at',     // unix ms timestamp
} as const

export const tokenService = {
  /** Save both tokens after login or token rotation */
  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000
    localStorage.setItem(KEYS.ACCESS_TOKEN,  accessToken)
    localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken)
    localStorage.setItem(KEYS.EXPIRES_AT,    String(expiresAt))
  },

  getAccessToken(): string | null {
    return localStorage.getItem(KEYS.ACCESS_TOKEN)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(KEYS.REFRESH_TOKEN)
  },

  /** Returns true if accessToken exists and has not expired */
  isAccessTokenValid(): boolean {
    const token     = localStorage.getItem(KEYS.ACCESS_TOKEN)
    const expiresAt = localStorage.getItem(KEYS.EXPIRES_AT)
    if (!token || !expiresAt) return false
    // 30-second buffer to prevent edge-case expired requests
    return Date.now() < Number(expiresAt) - 30_000
  },

  /** Update only the access token (and expiry) after rotation */
  updateAccessToken(accessToken: string, refreshToken: string, expiresIn: number): void {
    this.setTokens(accessToken, refreshToken, expiresIn)
  },

  /** Remove all auth data — called on logout or refresh failure */
  clearAll(): void {
    localStorage.removeItem(KEYS.ACCESS_TOKEN)
    localStorage.removeItem(KEYS.REFRESH_TOKEN)
    localStorage.removeItem(KEYS.EXPIRES_AT)
  },

  /** Returns true if any token exists (user was logged in) */
  hasSession(): boolean {
    return !!localStorage.getItem(KEYS.ACCESS_TOKEN)
  },
}
