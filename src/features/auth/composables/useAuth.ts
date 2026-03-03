// src/features/auth/composables/useAuth.ts
// Thin wrapper exposing auth store to components.
// Keeps <script setup> blocks clean.

import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/core/stores/auth.store'
import type {
  LoginRequest,
  RegisterRequest,
  VerifyOtpRequest,
  ForgotPasswordRequest,
} from '@/features/auth/types/auth.dto'

export function useAuth() {
  const store = useAuthStore()
  const { isAuthenticated, isLoading, error, pendingVerificationEmail, hasError } =
    storeToRefs(store)

  return {
    // reactive state (refs)
    isAuthenticated,
    isLoading,
    error,
    pendingVerificationEmail,
    hasError,
    // actions (not refs — call directly)
    login:           (p: LoginRequest)          => store.login(p),
    register:        (p: RegisterRequest)       => store.register(p),
    verifyOtp:       (p: VerifyOtpRequest)      => store.verifyOtp(p),
    resendOtp:       (email: string)            => store.resendOtp(email),
    logout:          ()                         => store.logout(),
    forgotPassword:  (p: ForgotPasswordRequest) => store.forgotPassword(p),
    clearError:      ()                         => store.clearError(),
  }
}
