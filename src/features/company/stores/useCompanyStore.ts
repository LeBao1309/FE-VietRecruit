// src/features/company/stores/useCompanyStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { companyService } from '@/features/company/services/company.service'
import type { CompanyResponse, CompanyUpdateRequest } from '@/features/company/types/company.dto'

export const useCompanyStore = defineStore('company', () => {
  const company = ref<CompanyResponse | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  async function fetchCompany(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      company.value = await companyService.getCompany()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải thông tin công ty'
      error.value = msg
    } finally {
      isLoading.value = false
    }
  }

  async function updateCompany(payload: CompanyUpdateRequest): Promise<boolean> {
    isSaving.value = true
    error.value = null
    try {
      company.value = await companyService.updateCompany(payload)
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại'
      error.value = msg
      return false
    } finally {
      isSaving.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return { company, isLoading, isSaving, error, fetchCompany, updateCompany, clearError }
})
