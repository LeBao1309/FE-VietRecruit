// src/features/company/services/org.service.ts
import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type {
  DepartmentRequest,
  DepartmentResponse,
  LocationRequest,
  LocationResponse,
  CategoryRequest,
  CategoryResponse,
  PageResponse
} from '../types/org.dto'

export const orgService = {
  // Departments
  async getDepartments(page = 0, size = 10): Promise<PageResponse<DepartmentResponse>> {
    const { data } = await apiClient.get<ApiResponse<PageResponse<DepartmentResponse>>>('/vietrecruit/departments', { params: { page, size } })
    return data.data
  },
  async createDepartment(payload: DepartmentRequest): Promise<DepartmentResponse> {
    const { data } = await apiClient.post<ApiResponse<DepartmentResponse>>('/vietrecruit/departments', payload)
    return data.data
  },
  async updateDepartment(id: string, payload: DepartmentRequest): Promise<DepartmentResponse> {
    const { data } = await apiClient.put<ApiResponse<DepartmentResponse>>(`/vietrecruit/departments/${id}`, payload)
    return data.data
  },
  async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/vietrecruit/departments/${id}`)
  },

  // Locations
  async getLocations(page = 0, size = 10): Promise<PageResponse<LocationResponse>> {
    const { data } = await apiClient.get<ApiResponse<PageResponse<LocationResponse>>>('/vietrecruit/locations', { params: { page, size } })
    return data.data
  },
  async createLocation(payload: LocationRequest): Promise<LocationResponse> {
    const { data } = await apiClient.post<ApiResponse<LocationResponse>>('/vietrecruit/locations', payload)
    return data.data
  },
  async updateLocation(id: string, payload: LocationRequest): Promise<LocationResponse> {
    const { data } = await apiClient.put<ApiResponse<LocationResponse>>(`/vietrecruit/locations/${id}`, payload)
    return data.data
  },
  async deleteLocation(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/vietrecruit/locations/${id}`)
  },

  // Categories
  async getCategories(page = 0, size = 10): Promise<PageResponse<CategoryResponse>> {
    const { data } = await apiClient.get<ApiResponse<PageResponse<CategoryResponse>>>('/vietrecruit/categories', { params: { page, size } })
    return data.data
  },
  async createCategory(payload: CategoryRequest): Promise<CategoryResponse> {
    const { data } = await apiClient.post<ApiResponse<CategoryResponse>>('/vietrecruit/categories', payload)
    return data.data
  },
  async updateCategory(id: string, payload: CategoryRequest): Promise<CategoryResponse> {
    const { data } = await apiClient.put<ApiResponse<CategoryResponse>>(`/vietrecruit/categories/${id}`, payload)
    return data.data
  },
  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/vietrecruit/categories/${id}`)
  }
}
