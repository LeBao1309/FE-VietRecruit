// src/features/onboarding/stores/onboarding.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { onboardingService } from '@/features/onboarding/services/onboarding.service'
import { parseApiError } from '@/core/utils/error.utils'
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
    } catch (err) {
      handleApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  async function updateCompany(payload: CompanyUpdateRequest): Promise<boolean> {
    clearError()
    isLoading.value = true
    try {
      companyProfile.value = await onboardingService.updateCompany(payload)
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
      await router.push('/workspace')
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
    // getters
    hasError,
    // actions
    loadCompany,
    updateCompany,
    loadCandidateProfile,
    updateCandidateProfile,
    clearError,
  }
})
