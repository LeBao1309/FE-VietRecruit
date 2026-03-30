import http from './http'
import { ok, fail, type ServiceResult } from './api-error'
import type { ApiResponse, PageResponse, PaginationParams, SpringPageResponse } from '@/types/common'
import { normalizeSpringPage } from '@/types/common'
import type {
  DepartmentRequest,
  DepartmentResponse,
  LocationRequest,
  LocationResponse,
  CategoryRequest,
  CategoryResponse,
} from '@/types/organization'

// ── Department Service ───────────────────────────────────────────────
export const departmentService = {
  async create(body: DepartmentRequest): Promise<ServiceResult<DepartmentResponse>> {
    try {
      const { data } = await http.post<ApiResponse<DepartmentResponse>>('/departments', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  async list(params?: PaginationParams): Promise<ServiceResult<PageResponse<DepartmentResponse>>> {
    try {
      const { data } = await http.get<ApiResponse<SpringPageResponse<DepartmentResponse>>>('/departments', { params })
      return ok(normalizeSpringPage(data.data))
    } catch (error) {
      return fail(error)
    }
  },

  async get(id: string): Promise<ServiceResult<DepartmentResponse>> {
    try {
      const { data } = await http.get<ApiResponse<DepartmentResponse>>(`/departments/${id}`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  async update(id: string, body: DepartmentRequest): Promise<ServiceResult<DepartmentResponse>> {
    try {
      const { data } = await http.put<ApiResponse<DepartmentResponse>>(`/departments/${id}`, body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      await http.delete<ApiResponse<void>>(`/departments/${id}`)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },
}

// ── Location Service ─────────────────────────────────────────────────
export const locationService = {
  async create(body: LocationRequest): Promise<ServiceResult<LocationResponse>> {
    try {
      const { data } = await http.post<ApiResponse<LocationResponse>>('/locations', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  async list(params?: PaginationParams): Promise<ServiceResult<PageResponse<LocationResponse>>> {
    try {
      const { data } = await http.get<ApiResponse<SpringPageResponse<LocationResponse>>>('/locations', { params })
      return ok(normalizeSpringPage(data.data))
    } catch (error) {
      return fail(error)
    }
  },

  async get(id: string): Promise<ServiceResult<LocationResponse>> {
    try {
      const { data } = await http.get<ApiResponse<LocationResponse>>(`/locations/${id}`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  async update(id: string, body: LocationRequest): Promise<ServiceResult<LocationResponse>> {
    try {
      const { data } = await http.put<ApiResponse<LocationResponse>>(`/locations/${id}`, body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      await http.delete<ApiResponse<void>>(`/locations/${id}`)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },
}

// ── Category Service ─────────────────────────────────────────────────
export const categoryService = {
  async create(body: CategoryRequest): Promise<ServiceResult<CategoryResponse>> {
    try {
      const { data } = await http.post<ApiResponse<CategoryResponse>>('/categories', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  async list(params?: PaginationParams): Promise<ServiceResult<PageResponse<CategoryResponse>>> {
    try {
      const { data } = await http.get<ApiResponse<SpringPageResponse<CategoryResponse>>>('/categories', { params })
      return ok(normalizeSpringPage(data.data))
    } catch (error) {
      return fail(error)
    }
  },

  async get(id: string): Promise<ServiceResult<CategoryResponse>> {
    try {
      const { data } = await http.get<ApiResponse<CategoryResponse>>(`/categories/${id}`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  async update(id: string, body: CategoryRequest): Promise<ServiceResult<CategoryResponse>> {
    try {
      const { data } = await http.put<ApiResponse<CategoryResponse>>(`/categories/${id}`, body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      await http.delete<ApiResponse<void>>(`/categories/${id}`)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },
}
