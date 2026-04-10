import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CompanyResponse, CompanyCreateRequest, CompanyUpdateRequest } from '@/types/company'
import { companyService } from '@/services/companyService'
import { useUiStore } from './uiStore'

export const useCompanyStore = defineStore('company', () => {
  // ── State ──────────────────────────────────────────────────────────
  const company = ref<CompanyResponse | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  // true when GET /companies/me returns 403 — user has no company yet
  const isNew = ref(false)

  // ── Actions ────────────────────────────────────────────────────────
  async function fetchCompany(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const result = await companyService.getCompany()
      if (result.error) {
        if (result.error.status === 403) {
          // User is not yet associated with a company — show creation flow
          isNew.value = true
        } else {
          error.value = result.error.message
        }
      } else {
        company.value = result.data
        isNew.value = false
      }
    } finally {
      isLoading.value = false
    }
  }

  async function createCompany(body: CompanyCreateRequest): Promise<boolean> {
    const ui = useUiStore()
    isSaving.value = true
    error.value = null
    try {
      const result = await companyService.createCompany(body)
      if (result.error) {
        error.value = result.error.message
        ui.toastError('Tạo công ty thất bại', result.error.message)
        return false
      }
      company.value = result.data
      isNew.value = false
      ui.toastSuccess('Thành công', 'Đã tạo hồ sơ công ty.')
      return true
    } finally {
      isSaving.value = false
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
        ui.toastError('Update Failed', result.error.message)
        return false
      }
      company.value = result.data
      ui.toastSuccess('Success', 'Company information has been updated.')
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
    isNew,
    isLoading,
    isSaving,
    error,
    fetchCompany,
    createCompany,
    updateCompany,
    clearError,
  }
})
