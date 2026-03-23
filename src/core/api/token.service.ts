// src/core/api/token.service.ts
// Centralized read/write/clear for localStorage tokens.
// All other files import from here — never access localStorage directly.

import { STORAGE_KEYS } from '@/core/constants/storage-keys'
import type { AuthUser } from '@/features/auth/types/auth.dto'

export const tokenService = {
  /** Save both tokens after login or token rotation */
  setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN,  accessToken)
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    localStorage.setItem(STORAGE_KEYS.EXPIRES_IN,    String(expiresAt))
  },

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  },

  /** Returns true if accessToken exists and has not expired */
  isAccessTokenValid(): boolean {
    const token     = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_IN)
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
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_IN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  },

  /** Persist authenticated user to storage */
  setUser(user: AuthUser): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  },

  /** Retrieve persisted user, or null if not stored */
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER)
    if (!raw) return null
    try { return JSON.parse(raw) as AuthUser } catch { return null }
  },

  /** Returns true if any token exists (user was logged in) */
  hasSession(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  },
}
