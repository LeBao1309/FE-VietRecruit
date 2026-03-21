// src/core/stores/org.store.ts
import { getErrorMessage } from '@/core/utils/error'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orgService } from '@/features/company/services/org.service'
import type {
  DepartmentRequest,
  DepartmentResponse,
  LocationRequest,
  LocationResponse,
  CategoryRequest,
  CategoryResponse
} from '@/features/company/types/org.dto'
import type { AxiosError } from 'axios'

export const useOrgStore = defineStore('org', () => {
  // Common states
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const error = ref<string | null>(null)

  // Departments
  const departments = ref<DepartmentResponse[]>([])
  const deptPage = ref(0)
  const deptTotalPages = ref(0)
  const deptTotalElements = ref(0)

  // Locations
  const locations = ref<LocationResponse[]>([])
  const locPage = ref(0)
  const locTotalPages = ref(0)
  const locTotalElements = ref(0)

  // Categories
  const categories = ref<CategoryResponse[]>([])
  const catPage = ref(0)
  const catTotalPages = ref(0)
  const catTotalElements = ref(0)

  // -- Departments Methods --
  async function fetchDepartments(page = 0, size = 10) {
    isLoading.value = true
    error.value = null
    try {
      const res = await orgService.getDepartments(page, size)
      departments.value = res.content
      deptPage.value = res.number
      deptTotalPages.value = res.totalPages
      deptTotalElements.value = res.totalElements
    } catch (err: any) {
      error.value = err.message || 'Lỗi tải phòng ban'
    } finally {
      isLoading.value = false
    }
  }

  async function createDepartment(payload: DepartmentRequest): Promise<boolean> {
    isSaving.value = true
    error.value = null
    try {
      await orgService.createDepartment(payload)
      await fetchDepartments(deptPage.value)
      return true
    } catch (err: any) {
      error.value = err.message || 'Lỗi thêm phòng ban'
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function updateDepartment(id: string, payload: DepartmentRequest): Promise<boolean> {
    isSaving.value = true
    error.value = null
    try {
      await orgService.updateDepartment(id, payload)
      await fetchDepartments(deptPage.value)
      return true
    } catch (err: any) {
      error.value = err.message || 'Lỗi sửa phòng ban'
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function deleteDepartment(id: string): Promise<boolean> {
    isDeleting.value = true
    error.value = null
    try {
      await orgService.deleteDepartment(id)
      await fetchDepartments(0) // Reset to page 0
      return true
    } catch (err: unknown) {
      const axiosErr = err as AxiosError
      if (axiosErr.response?.status === 409 || axiosErr.response?.status === 500) {
        error.value = getErrorMessage(err)
      } else {
        error.value = getErrorMessage(err)
      }
      return false
    } finally {
      isDeleting.value = false
    }
  }

  // -- Locations Methods --
  async function fetchLocations(page = 0, size = 10) {
    isLoading.value = true
    error.value = null
    try {
      const res = await orgService.getLocations(page, size)
      locations.value = res.content
      locPage.value = res.number
      locTotalPages.value = res.totalPages
      locTotalElements.value = res.totalElements
    } catch (err: any) {
      error.value = err.message || 'Lỗi tải địa điểm'
    } finally {
      isLoading.value = false
    }
  }

  async function createLocation(payload: LocationRequest): Promise<boolean> {
    isSaving.value = true
    error.value = null
    try {
      await orgService.createLocation(payload)
      await fetchLocations(locPage.value)
      return true
    } catch (err: any) {
      error.value = err.message || 'Lỗi thêm địa điểm'
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function updateLocation(id: string, payload: LocationRequest): Promise<boolean> {
    isSaving.value = true
    error.value = null
    try {
      await orgService.updateLocation(id, payload)
      await fetchLocations(locPage.value)
      return true
    } catch (err: any) {
      error.value = err.message || 'Lỗi sửa địa điểm'
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function deleteLocation(id: string): Promise<boolean> {
    isDeleting.value = true
    error.value = null
    try {
      await orgService.deleteLocation(id)
      await fetchLocations(0)
      return true
    } catch (err: unknown) {
      const axiosErr = err as AxiosError
      if (axiosErr.response?.status === 409 || axiosErr.response?.status === 500) {
        error.value = getErrorMessage(err)
      } else {
        error.value = getErrorMessage(err)
      }
      return false
    } finally {
      isDeleting.value = false
    }
  }

  // -- Categories Methods --
  async function fetchCategories(page = 0, size = 10) {
    isLoading.value = true
    error.value = null
    try {
      const res = await orgService.getCategories(page, size)
      categories.value = res.content
      catPage.value = res.number
      catTotalPages.value = res.totalPages
      catTotalElements.value = res.totalElements
    } catch (err: any) {
      error.value = err.message || 'Lỗi tải danh mục'
    } finally {
      isLoading.value = false
    }
  }

  async function createCategory(payload: CategoryRequest): Promise<boolean> {
    isSaving.value = true
    error.value = null
    try {
      await orgService.createCategory(payload)
      await fetchCategories(catPage.value)
      return true
    } catch (err: any) {
      error.value = err.message || 'Lỗi thêm danh mục'
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function updateCategory(id: string, payload: CategoryRequest): Promise<boolean> {
    isSaving.value = true
    error.value = null
    try {
      await orgService.updateCategory(id, payload)
      await fetchCategories(catPage.value)
      return true
    } catch (err: any) {
      error.value = err.message || 'Lỗi sửa danh mục'
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function deleteCategory(id: string): Promise<boolean> {
    isDeleting.value = true
    error.value = null
    try {
      await orgService.deleteCategory(id)
      await fetchCategories(0)
      return true
    } catch (err: unknown) {
      const axiosErr = err as AxiosError
      if (axiosErr.response?.status === 409 || axiosErr.response?.status === 500) {
        error.value = getErrorMessage(err)
      } else {
        error.value = getErrorMessage(err)
      }
      return false
    } finally {
      isDeleting.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    isLoading, isSaving, isDeleting, error, clearError,
    departments, deptPage, deptTotalPages, deptTotalElements,
    fetchDepartments, createDepartment, updateDepartment, deleteDepartment,
    locations, locPage, locTotalPages, locTotalElements,
    fetchLocations, createLocation, updateLocation, deleteLocation,
    categories, catPage, catTotalPages, catTotalElements,
    fetchCategories, createCategory, updateCategory, deleteCategory
  }
})
