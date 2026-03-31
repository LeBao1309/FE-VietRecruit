import http from './http'
import { ok, fail, type ServiceResult } from './api-error'
import type { ApiResponse, SpringPageResponse, PageResponse, PaginationParams } from '@/types/common'
import { normalizeSpringPage } from '@/types/common'
import type { AdminUserResponse, UserRequest } from '@/types/user'

// ── Admin User Service ───────────────────────────────────────────────
export const adminUserService = {
  /** POST /admin/users — create user (USER:MANAGE) */
  async createUser(body: UserRequest): Promise<ServiceResult<AdminUserResponse>> {
    try {
      const { data } = await http.post<ApiResponse<AdminUserResponse>>('/admin/users', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /admin/users — paginated list (USER:MANAGE) */
  async listUsers(
    params?: PaginationParams,
  ): Promise<ServiceResult<PageResponse<AdminUserResponse>>> {
    try {
      const { data } = await http.get<
        ApiResponse<SpringPageResponse<AdminUserResponse>>
      >('/admin/users', { params })
      return ok(normalizeSpringPage(data.data))
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /admin/users/:id — get single user (USER:MANAGE) */
  async getUser(id: string): Promise<ServiceResult<AdminUserResponse>> {
    try {
      const { data } = await http.get<ApiResponse<AdminUserResponse>>(`/admin/users/${id}`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /admin/users/:id — update user (USER:MANAGE) */
  async updateUser(
    id: string,
    body: UserRequest,
  ): Promise<ServiceResult<AdminUserResponse>> {
    try {
      const { data } = await http.put<ApiResponse<AdminUserResponse>>(
        `/admin/users/${id}`,
        body,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** DELETE /admin/users/:id — delete user (USER:DELETE) */
  async deleteUser(id: string): Promise<ServiceResult<void>> {
    try {
      await http.delete<ApiResponse<void>>(`/admin/users/${id}`)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },
}
