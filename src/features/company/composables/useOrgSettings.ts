// src/features/company/composables/useOrgSettings.ts
// Thin wrapper for useOrgStore — exposes paginated CRUD state + actions to
// DepartmentsTab, LocationsTab, and CategoriesTab.

import { storeToRefs } from 'pinia'
import { useOrgStore } from '@/stores/orgStore'
import type {
  DepartmentRequest,
  LocationRequest,
  CategoryRequest,
} from '@/types/organization'

export function useOrgSettings() {
  const store = useOrgStore()
  const {
    isLoading, isSaving, isDeleting, error,
    departments, deptPage, deptTotalPages, deptTotalElements,
    locations, locPage, locTotalPages, locTotalElements,
    categories, catPage, catTotalPages, catTotalElements,
  } = storeToRefs(store)

  return {
    // shared state
    isLoading,
    isSaving,
    isDeleting,
    error,

    // departments
    departments,
    deptPage,
    deptTotalPages,
    deptTotalElements,
    fetchDepartments:  (page?: number, size?: number)              => store.fetchDepartments(page, size),
    createDepartment:  (p: DepartmentRequest)                      => store.createDepartment(p),
    updateDepartment:  (id: string, p: DepartmentRequest)          => store.updateDepartment(id, p),
    deleteDepartment:  (id: string)                                => store.deleteDepartment(id),

    // locations
    locations,
    locPage,
    locTotalPages,
    locTotalElements,
    fetchLocations:    (page?: number, size?: number)              => store.fetchLocations(page, size),
    createLocation:    (p: LocationRequest)                        => store.createLocation(p),
    updateLocation:    (id: string, p: LocationRequest)            => store.updateLocation(id, p),
    deleteLocation:    (id: string)                                => store.deleteLocation(id),

    // categories
    categories,
    catPage,
    catTotalPages,
    catTotalElements,
    fetchCategories:   (page?: number, size?: number)              => store.fetchCategories(page, size),
    createCategory:    (p: CategoryRequest)                        => store.createCategory(p),
    updateCategory:    (id: string, p: CategoryRequest)            => store.updateCategory(id, p),
    deleteCategory:    (id: string)                                => store.deleteCategory(id),

    clearError:        ()                                          => store.clearError(),
  }
}
