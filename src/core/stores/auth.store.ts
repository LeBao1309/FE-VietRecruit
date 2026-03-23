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

  // Invited staff — role takes priority over accountType
  if (user.role === 'HR' || user.role === 'INTERVIEWER') {
    return '/workspace/pipeline'
  }

  // Employer — check if company profile is complete
  if (user.accountType === 'EMPLOYER') {
    if (!user.companyProfileComplete) return '/onboarding/employer'
    return '/workspace'
  }

  // Candidate
  if (user.accountType === 'CANDIDATE') {
    return '/candidate/profile'
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
    return {
      id:                     payload.sub ?? '',
      email:                  payload.email ?? '',
      fullName:               payload.fullName ?? '',
      accountType:            payload.accountType ?? 'EMPLOYER',
      role:                   payload.role ?? null,
      companyProfileComplete: payload.companyProfileComplete ?? false,
    } satisfies AuthUser
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
  async function register(payload: RegisterApiPayload & { confirmPassword: string }): Promise<void> {
    clearError()
    isLoading.value = true
    const { confirmPassword: _, ...apiPayload } = payload
    try {
      await authService.register(apiPayload)
      // Store email so VerifyOtpPage knows which email to verify
      pendingVerificationEmail.value = payload.email
      await router.push({ name: 'VerifyOtp' })
    } catch (err) {
      handleApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  /** 2b. Register by Invite
   *  Strips confirmPassword before sending — it's UI-only
   *  On success → navigate to login with ?invited=true
   */
  async function registerByInvite(payload: RegisterByInviteApiPayload & { confirmPassword: string }): Promise<boolean> {
    clearError()
    isLoading.value = true
    const { confirmPassword: _, ...apiPayload } = payload
    try {
      await authService.registerByInvite(apiPayload)
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

  /** 9. Change Password — revokes all sessions, forces re-login */
  async function changePassword(payload: ChangePasswordRequest): Promise<boolean> {
    clearError()
    isLoading.value = true
    try {
      await authService.changePassword(payload)
      // Server revokes all sessions → force re-login
      clearSession()
      await router.push({ name: 'Login', query: { passwordChanged: 'true' } })
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
    clearError,
    clearSession,
  }
})
