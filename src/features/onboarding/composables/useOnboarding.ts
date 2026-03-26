// src/features/onboarding/composables/useOnboarding.ts
// Thin wrapper for onboarding store — keeps <script setup> blocks clean.

import { storeToRefs } from 'pinia'
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding.store'
import type {
  CompanyUpdateRequest,
  CandidateUpdateRequest,
} from '@/features/onboarding/types/onboarding.dto'

export function useOnboarding() {
  const store = useOnboardingStore()
  const { isLoading, error, hasError, companyProfile, candidateProfile } =
    storeToRefs(store)

  return {
    // reactive state
    isLoading,
    error,
    hasError,
    companyProfile,
    candidateProfile,
    // actions
    loadCompany:            ()                            => store.loadCompany(),
    createCompany:          (p: CompanyUpdateRequest)     => store.createCompany(p),
    updateCompany:          (p: CompanyUpdateRequest)     => store.updateCompany(p),
    loadCandidateProfile:   ()                            => store.loadCandidateProfile(),
    updateCandidateProfile: (p: CandidateUpdateRequest)   => store.updateCandidateProfile(p),
    clearError:             ()                            => store.clearError(),
  }
}
