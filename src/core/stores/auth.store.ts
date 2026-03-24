// src/core/stores/auth.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { tokenService } from '@/core/api/token.service'
import { authService } from '@/features/auth/services/auth.service'
import { parseApiError } from '@/core/utils/error.utils'
import type {
  AuthUser,
  LoginRequest,
  RegisterApiPayload,
  RegisterByInviteApiPayload,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/features/auth/types/auth.dto'

// ── Single source of truth for post-login redirect ────────────────────────────
// Used by: login action, router guard, App.vue session restore
export function resolvePostLoginRoute(user: AuthUser | null): string {
  if (!user) return '/auth/login'

  const primaryRole = user.roles?.[0]

  if (primaryRole === 'SYSTEM_ADMIN' || primaryRole === 'CUSTOMER_SERVICE') {
    return '/admin'
  }
  if (primaryRole === 'INTERVIEWER') {
    return '/workspace/my-interviews'
  }
  if (primaryRole === 'HR') {
    return '/workspace/jobs'
  }
  if (primaryRole === 'COMPANY_ADMIN') {
    // Must complete company profile before accessing dashboard
    if (!user.companyProfileComplete) return '/onboarding/employer'
    return '/workspace'
  }
  if (primaryRole === 'CANDIDATE') {
    return '/jobs'
  }

  return '/auth/login'
}

// ── Helper: extract AuthUser from a JWT access token ─────────────────────────
// Fallback when the login response does not include a user object
function parseUserFromJwt(token: string): AuthUser | null {
  try {
    const payloadStr = token.split('.')[1]
    if (!payloadStr) return null
    const payload = JSON.parse(atob(payloadStr))
    
    // Backend JWT uses "roles" (array) OR "role" (string)
    let parsedRoles: string[] = []
    if (payload.roles && Array.isArray(payload.roles)) {
      parsedRoles = payload.roles
    } else if (payload.role) {
      parsedRoles = [payload.role]
    } else if (payload.accountType === 'EMPLOYER') {
      parsedRoles = ['COMPANY_ADMIN'] // Fallback translation
    } else if (payload.accountType === 'CANDIDATE') {
      parsedRoles = ['CANDIDATE']
    }

    return {
      id:                     payload.sub ?? '',
      email:                  payload.email ?? '',
      fullName:               payload.fullName ?? '',
      roles:                  parsedRoles as AuthUser['roles'],
      companyId:              payload.companyId ?? null,
      companyProfileComplete: payload.companyProfileComplete ?? false,
      avatarUrl:              payload.avatarUrl ?? null,
    }
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  // ── State ──────────────────────────────────────────────────
  const isAuthenticated = ref<boolean>(tokenService.hasSession())
  const isLoading       = ref<boolean>(false)
  const error           = ref<string | null>(null)
  const user            = ref<AuthUser | null>(tokenService.getUser())

  // The email being verified — passed from RegisterPage → VerifyOtpPage
  const pendingVerificationEmail = ref<string | null>(null)

  // Tracks which OAuth provider is mid-redirect (null when idle)
  const loadingProvider = ref<'google' | 'github' | null>(null)

  // ── Getters ────────────────────────────────────────────────
  const hasError      = computed(() => error.value !== null)
  const hasPendingOtp = computed(() => pendingVerificationEmail.value !== null)

  // ── Helpers ────────────────────────────────────────────────
  function clearError() { error.value = null }

  function handleApiError(err: unknown): void {
    error.value = parseApiError(err)
  }

  function setUser(u: AuthUser): void {
    user.value = u
    tokenService.setUser(u)
  }

  function clearSession(): void {
    tokenService.clearAll()
    isAuthenticated.value = false
    user.value = null
  }

  // ── Actions ────────────────────────────────────────────────

  /** 1. Login — resolves post-login route based on user role */
  async function login(payload: LoginRequest): Promise<void> {
    clearError()
    isLoading.value = true
    try {
      const response = await authService.login(payload)
      tokenService.setTokens(
        response.accessToken,
        response.refreshToken,
        response.expiresIn,
      )
      isAuthenticated.value = true

      // Prefer user object from response body; fall back to JWT decode
      const resolvedUser = response.user ?? parseUserFromJwt(response.accessToken)
      if (resolvedUser) setUser(resolvedUser)

      const redirectPath = resolvePostLoginRoute(resolvedUser)
      await router.push(redirectPath)
    } catch (err) {
      handleApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  /** 2. Register
   *  Strips confirmPassword before sending — it's UI-only
   *  On success → store email → navigate to OTP verification page
   */
  async function register(payload: RegisterApiPayload & { confirmPassword: string }): Promise<boolean> {
    clearError()
    isLoading.value = true
    const { confirmPassword: _, ...apiPayload } = payload
    try {
      await authService.register(apiPayload)
      // Store email so OTP component knows which email to verify
      pendingVerificationEmail.value = payload.email
      // Removed router.push, letting the component handle step transition
      return true
    } catch (err) {
      handleApiError(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /** 2b. Register by Invite
   *  Strips confirmPassword before sending — it's UI-only
   *  On success → navigate to login DIRECTLY (NO OTP required per spec)
   */
  async function registerByInvite(payload: RegisterByInviteApiPayload & { confirmPassword: string }): Promise<boolean> {
    clearError()
    isLoading.value = true
    const { confirmPassword: _, ...apiPayload } = payload
    try {
      await authService.registerByInvite(apiPayload)
      // The user is ALREADY email-verified — do NOT show OTP screen
      await router.push({ name: 'Login', query: { invited: 'true' } })
      return true
    } catch (err) {
      handleApiError(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /** 3. Verify OTP
   *  On success → navigate to login (account now active)
   */
  async function verifyOtp(payload: VerifyOtpRequest): Promise<void> {
    clearError()
    isLoading.value = true
    try {
      await authService.verifyOtp(payload)
      pendingVerificationEmail.value = null
      await router.push({ name: 'Login', query: { verified: 'true' } })
    } catch (err) {
      handleApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  /** 4. Resend OTP
   *  Returns true on success so UI can show countdown timer
   */
  async function resendOtp(email: string): Promise<boolean> {
    clearError()
    isLoading.value = true
    try {
      await authService.resendOtp(email)
      return true
    } catch (err) {
      handleApiError(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /** 6. Logout
   *  Server invalidates token → clear local storage → redirect to login
   */
  async function logout(): Promise<void> {
    clearError()
    isLoading.value = true
    try {
      await authService.logout()
    } catch {
      // Even if server call fails, always clear local session
    } finally {
      clearSession()
      isLoading.value = false
      await router.push({ name: 'Login' })
    }
  }

  /** 7. Forgot Password */
  async function forgotPassword(payload: ForgotPasswordRequest): Promise<boolean> {
    clearError()
    isLoading.value = true
    try {
      await authService.forgotPassword(payload.email)
      return true // signals UI to show "email sent" state
    } catch (err) {
      handleApiError(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /** 8. Reset Password — uses token from email link */
  async function resetPassword(payload: ResetPasswordRequest): Promise<boolean> {
    clearError()
    isLoading.value = true
    try {
      await authService.resetPassword(payload)
      await router.push({ name: 'Login', query: { reset: 'true' } })
      return true
    } catch (err) {
      handleApiError(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /** 10. Social Login — direct browser redirect, no Axios */
  function socialLogin(provider: 'google' | 'github'): void {
    loadingProvider.value = provider
    const baseUrl = import.meta.env.VITE_API_BASE_URL ?? ''
    window.location.href = `${baseUrl}/vietrecruit/auth/oauth2/authorize/${provider}`
  }

  /** 11. Handle OAuth2 Callback — called by OAuthCallbackPage after browser returns with code+state
   *  View layer is responsible for navigation via resolvePostLoginRoute(store.user.value)
   */
  async function handleOAuthCallback(provider: string, code: string, state: string): Promise<void> {
    clearError()
    isLoading.value = true
    try {
      const response = await authService.oauthCallback(provider, code, state)
      tokenService.setTokens(response.accessToken, response.refreshToken, response.expiresIn)
      const resolvedUser = response.user ?? parseUserFromJwt(response.accessToken)
      if (resolvedUser) setUser(resolvedUser)
      isAuthenticated.value = true
    } catch (err) {
      handleApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  /** 9. Change Password — revokes all sessions, forces re-login */
  async function changePassword(payload: ChangePasswordRequest): Promise<boolean> {
    clearError()
    isLoading.value = true
    try {
      await authService.changePassword(payload)
      // Server revokes all sessions → force re-login
      clearSession()
      await router.push({ name: 'Login', query: { message: 'Đã đổi mật khẩu, vui lòng đăng nhập lại' } })
      return true
    } catch (err) {
      handleApiError(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    // state
    isAuthenticated,
    isLoading,
    error,
    user,
    pendingVerificationEmail,
    loadingProvider,
    // getters
    hasError,
    hasPendingOtp,
    // actions
    login,
    register,
    registerByInvite,
    verifyOtp,
    resendOtp,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    socialLogin,
    handleOAuthCallback,
    clearError,
    clearSession,
  }
})
