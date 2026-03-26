// src/features/onboarding/stores/onboarding.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { onboardingService } from '@/features/onboarding/services/onboarding.service'
import { useAuthStore } from '@/core/stores/auth.store'
import { parseApiError } from '@/core/utils/error.utils'
import type { AxiosError } from 'axios'
import type {
  CompanyUpdateRequest,
  CompanyResponse,
  CandidateUpdateRequest,
  CandidateProfileResponse,
} from '@/features/onboarding/types/onboarding.dto'

export const useOnboardingStore = defineStore('onboarding', () => {
  const router = useRouter()

  // ── State ──
  const isLoading         = ref(false)
  const error             = ref<string | null>(null)
  const companyProfile    = ref<CompanyResponse | null>(null)
  const candidateProfile  = ref<CandidateProfileResponse | null>(null)
  const companyExists     = ref(true)

  // ── Getters ──
  const hasError = computed(() => error.value !== null)

  // ── Helpers ──
  function clearError() { error.value = null }

  function handleApiError(err: unknown): void {
    error.value = parseApiError(err)
  }

  // ── Company Actions ──

  async function loadCompany(): Promise<void> {
    clearError()
    isLoading.value = true
    try {
      companyProfile.value = await onboardingService.getCompany()
      companyExists.value = true

      // 🔴 TEMPORARY FE FIX: Missing companyId from BE token/profile
      const authStore = useAuthStore()
      if (authStore.user && companyProfile.value?.id) {
        authStore.user.companyId = companyProfile.value.id
      }
    } catch (err) {
      const axiosErr = err as AxiosError
      // 403 means user has no company yet — show creation form
      if (axiosErr.response?.status === 403) {
        companyExists.value = false
        companyProfile.value = null
      } else {
        handleApiError(err)
      }
    } finally {
      isLoading.value = false
    }
  }

  async function createCompany(payload: CompanyUpdateRequest): Promise<boolean> {
    clearError()
    isLoading.value = true
    try {
      companyProfile.value = await onboardingService.createCompany(payload)
      companyExists.value = true

      // Refresh auth user profile
      const authStore = useAuthStore()
      await authStore.fetchUserProfile()

      // 🔴 TEMPORARY FE FIX: BE does not yet return companyId in GET /users/me
      // or JWT. We manually inject the created company ID into the auth store 
      // so the router guard allows access to /workspace.
      if (authStore.user && companyProfile.value?.id) {
        authStore.user.companyId = companyProfile.value.id
      }

      await router.push('/workspace')
      return true
    } catch (err) {
      handleApiError(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateCompany(payload: CompanyUpdateRequest): Promise<boolean> {
    clearError()
    isLoading.value = true
    try {
      companyProfile.value = await onboardingService.updateCompany(payload)
      companyExists.value = true
      await router.push('/workspace')
      return true
    } catch (err) {
      handleApiError(err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ── Candidate Actions ──

  async function loadCandidateProfile(): Promise<void> {
    clearError()
    isLoading.value = true
    try {
      candidateProfile.value = await onboardingService.getCandidateProfile()
    } catch (err) {
      handleApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  async function updateCandidateProfile(payload: CandidateUpdateRequest): Promise<boolean> {
    clearError()
    isLoading.value = true
    try {
      candidateProfile.value = await onboardingService.updateCandidateProfile(payload)
      await router.push('/jobs')
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
    isLoading,
    error,
    companyProfile,
    candidateProfile,
    companyExists,
    // getters
    hasError,
    // actions
    loadCompany,
    createCompany,
    updateCompany,
    loadCandidateProfile,
    updateCandidateProfile,
    clearError,
  }
})
