// src/features/auth/composables/useAuth.ts
// Thin wrapper exposing auth store to components.
// Keeps <script setup> blocks clean.

import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/core/stores/auth.store'
import type {
  LoginRequest,
  RegisterRequest,
  RegisterByInviteRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/features/auth/types/auth.dto'

export function useAuth() {
  const store = useAuthStore()
  const { isAuthenticated, isLoading, error, pendingVerificationEmail, hasError, loadingProvider } =
    storeToRefs(store)

  return {
    // reactive state (refs)
    isAuthenticated,
    isLoading,
    error,
    pendingVerificationEmail,
    hasError,
    loadingProvider,
    // actions (not refs — call directly)
    login:                 (p: LoginRequest)              => store.login(p),
    register:              (p: RegisterRequest)           => store.register(p),
    registerByInvite:      (p: RegisterByInviteRequest)   => store.registerByInvite(p),
    verifyOtp:             (p: VerifyOtpRequest)          => store.verifyOtp(p),
    resendOtp:             (email: string)                => store.resendOtp(email),
    logout:                ()                             => store.logout(),
    forgotPassword:        (p: ForgotPasswordRequest)     => store.forgotPassword(p),
    resetPassword:         (p: ResetPasswordRequest)      => store.resetPassword(p),
    changePassword:        (p: ChangePasswordRequest)     => store.changePassword(p),
    socialLogin:           (provider: 'google' | 'github') => store.socialLogin(provider),
    handleOAuthCallback:   (provider: string, code: string, state: string) =>
                             store.handleOAuthCallback(provider, code, state),
    clearError:            ()                             => store.clearError(),
  }
}
