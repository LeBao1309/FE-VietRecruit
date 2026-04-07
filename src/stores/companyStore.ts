import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CompanyResponse, CompanyUpdateRequest } from '@/types/company'
import { companyService } from '@/services/companyService'
import { useUiStore } from './uiStore'

export const useCompanyStore = defineStore('company', () => {
  // ── State ──────────────────────────────────────────────────────────
  const company = ref<CompanyResponse | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  // ── Actions ────────────────────────────────────────────────────────
  async function fetchCompany(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const result = await companyService.getCompany()
      if (result.error) {
        error.value = result.error.message
      } else {
        company.value = result.data
      }
    } finally {
      isLoading.value = false
    }
  }

  async function updateCompany(body: CompanyUpdateRequest): Promise<boolean> {
    const ui = useUiStore()
    isSaving.value = true
    error.value = null
    try {
      const result = await companyService.updateCompany(body)
      if (result.error) {
        error.value = result.error.message
        ui.toastError('Cập nhật thất bại', result.error.message)
        return false
      }
      company.value = result.data
      ui.toastSuccess('Thành công', 'Thông tin công ty đã được cập nhật.')
      return true
    } finally {
      isSaving.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    company,
    isLoading,
    isSaving,
    error,
    fetchCompany,
    updateCompany,
    clearError,
  }
})
