import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  DepartmentRequest,
  DepartmentResponse,
  LocationResponse,
  CategoryResponse,
} from '@/types/organization'
import type { PageResponse } from '@/types/common'
import { departmentService, locationService, categoryService } from '@/services/organizationService'
import { useUiStore } from './uiStore'

export const useOrgStore = defineStore('org', () => {
  // ── State ──────────────────────────────────────────────────────────
  const isLoading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const error = ref<string | null>(null)

  // Departments
  const departments = ref<DepartmentResponse[]>([])
  const deptPage = ref(0)
  const deptTotalPages = ref(0)
  const deptTotalElements = ref(0)

  // Locations (reference data — fetch only)
  const locations = ref<LocationResponse[]>([])
  const locPage = ref(0)
  const locTotalPages = ref(0)
  const locTotalElements = ref(0)

  // Categories (reference data — fetch only)
  const categories = ref<CategoryResponse[]>([])
  const catPage = ref(0)
  const catTotalPages = ref(0)
  const catTotalElements = ref(0)

  // ── Department Actions ─────────────────────────────────────────────
  async function fetchDepartments(page = 0, size = 20): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const result = await departmentService.list({ page, size })
      if (result.error) {
        error.value = result.error.message
        return
      }
      const page_data = result.data as PageResponse<DepartmentResponse>
      departments.value = page_data.content
      deptPage.value = page_data.page
      deptTotalPages.value = page_data.totalPages
      deptTotalElements.value = page_data.totalElements
    } finally {
      isLoading.value = false
    }
  }

  async function createDepartment(body: DepartmentRequest): Promise<boolean> {
    const ui = useUiStore()
    isSaving.value = true
    error.value = null
    try {
      const result = await departmentService.create(body)
      if (result.error) {
        error.value = result.error.message
        ui.toastError('Creation Failed', result.error.message)
        return false
      }
      ui.toastSuccess('Success', 'Department created successfully.')
      await fetchDepartments(deptPage.value)
      return true
    } finally {
      isSaving.value = false
    }
  }

  async function updateDepartment(id: string, body: DepartmentRequest): Promise<boolean> {
    const ui = useUiStore()
    isSaving.value = true
    error.value = null
    try {
      const result = await departmentService.update(id, body)
      if (result.error) {
        error.value = result.error.message
        ui.toastError('Update Failed', result.error.message)
        return false
      }
      const idx = departments.value.findIndex((d) => d.id === id)
      if (idx !== -1 && result.data) departments.value[idx] = result.data
      ui.toastSuccess('Success', 'Department updated successfully.')
      return true
    } finally {
      isSaving.value = false
    }
  }

  async function deleteDepartment(id: string): Promise<boolean> {
    const ui = useUiStore()
    isDeleting.value = true
    error.value = null
    try {
      const result = await departmentService.delete(id)
      if (result.error) {
        error.value = result.error.message
        ui.toastError('Delete Failed', result.error.message)
        return false
      }
      departments.value = departments.value.filter((d) => d.id !== id)
      ui.toastSuccess('Success', 'Department deleted successfully.')
      return true
    } finally {
      isDeleting.value = false
    }
  }

  // ── Location Actions ───────────────────────────────────────────────
  async function fetchLocations(page = 0, size = 100): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const result = await locationService.list({ page, size })
      if (result.error) {
        error.value = result.error.message
        return
      }
      const page_data = result.data as PageResponse<LocationResponse>
      locations.value = page_data.content
      locPage.value = page_data.page
      locTotalPages.value = page_data.totalPages
      locTotalElements.value = page_data.totalElements
    } finally {
      isLoading.value = false
    }
  }

  async function createLocation(body: { name: string; address?: string }): Promise<boolean> {
    const ui = useUiStore()
    isSaving.value = true
    error.value = null
    try {
      const result = await locationService.create(body)
      if (result.error) {
        error.value = result.error.message
        ui.toastError('Creation Failed', result.error.message)
        return false
      }
      ui.toastSuccess('Success', 'Location created successfully.')
      await fetchLocations()
      return true
    } finally {
      isSaving.value = false
    }
  }

  async function updateLocation(id: string, body: { name: string; address?: string }): Promise<boolean> {
    const ui = useUiStore()
    isSaving.value = true
    error.value = null
    try {
      const result = await locationService.update(id, body)
      if (result.error) {
        error.value = result.error.message
        ui.toastError('Update Failed', result.error.message)
        return false
      }
      const idx = locations.value.findIndex((l) => l.id === id)
      if (idx !== -1 && result.data) locations.value[idx] = result.data
      ui.toastSuccess('Success', 'Location updated successfully.')
      return true
    } finally {
      isSaving.value = false
    }
  }

  async function deleteLocation(id: string): Promise<boolean> {
    const ui = useUiStore()
    isDeleting.value = true
    error.value = null
    try {
      const result = await locationService.delete(id)
      if (result.error) {
        error.value = result.error.message
        ui.toastError('Delete Failed', result.error.message)
        return false
      }
      locations.value = locations.value.filter((l) => l.id !== id)
      ui.toastSuccess('Success', 'Location deleted successfully.')
      return true
    } finally {
      isDeleting.value = false
    }
  }

  // ── Category Actions ───────────────────────────────────────────────
  async function fetchCategories(page = 0, size = 100): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const result = await categoryService.list({ page, size })
      if (result.error) {
        error.value = result.error.message
        return
      }
      const page_data = result.data as PageResponse<CategoryResponse>
      categories.value = page_data.content
      catPage.value = page_data.page
      catTotalPages.value = page_data.totalPages
      catTotalElements.value = page_data.totalElements
    } finally {
      isLoading.value = false
    }
  }

  async function createCategory(body: { name: string }): Promise<boolean> {
    const ui = useUiStore()
    isSaving.value = true
    error.value = null
    try {
      const result = await categoryService.create(body)
      if (result.error) {
        error.value = result.error.message
        ui.toastError('Creation Failed', result.error.message)
        return false
      }
      ui.toastSuccess('Success', 'Category created successfully.')
      await fetchCategories()
      return true
    } finally {
      isSaving.value = false
    }
  }

  async function updateCategory(id: string, body: { name: string }): Promise<boolean> {
    const ui = useUiStore()
    isSaving.value = true
    error.value = null
    try {
      const result = await categoryService.update(id, body)
      if (result.error) {
        error.value = result.error.message
        ui.toastError('Update Failed', result.error.message)
        return false
      }
      const idx = categories.value.findIndex((c) => c.id === id)
      if (idx !== -1 && result.data) categories.value[idx] = result.data
      ui.toastSuccess('Success', 'Category updated successfully.')
      return true
    } finally {
      isSaving.value = false
    }
  }

  async function deleteCategory(id: string): Promise<boolean> {
    const ui = useUiStore()
    isDeleting.value = true
    error.value = null
    try {
      const result = await categoryService.delete(id)
      if (result.error) {
        error.value = result.error.message
        ui.toastError('Delete Failed', result.error.message)
        return false
      }
      categories.value = categories.value.filter((c) => c.id !== id)
      ui.toastSuccess('Success', 'Category deleted successfully.')
      return true
    } finally {
      isDeleting.value = false
    }
  }

  function clearError(): void {
    error.value = null
  }

  return {
    isLoading,
    isSaving,
    isDeleting,
    error,
    // departments
    departments,
    deptPage,
    deptTotalPages,
    deptTotalElements,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    // locations
    locations,
    locPage,
    locTotalPages,
    locTotalElements,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    // categories
    categories,
    catPage,
    catTotalPages,
    catTotalElements,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
  }
})
