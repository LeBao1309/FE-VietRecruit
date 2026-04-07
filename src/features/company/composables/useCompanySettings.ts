// src/features/company/composables/useCompanySettings.ts
// Thin wrapper for useCompanyStore — exposes state + actions to SettingsProfileTab.

import { storeToRefs } from 'pinia'
import { useCompanyStore } from '@/stores/companyStore'
import type { CompanyUpdateRequest } from '@/types/company'

export function useCompanySettings() {
  const store = useCompanyStore()
  const { company, isLoading, isSaving, error } = storeToRefs(store)

  return {
    // reactive state
    company,
    isLoading,
    isSaving,
    error,
    // actions
    fetchCompany:  ()                          => store.fetchCompany(),
    updateCompany: (p: CompanyUpdateRequest)   => store.updateCompany(p),
    clearError:    ()                          => store.clearError(),
  }
}
