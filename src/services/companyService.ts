import http from './http'
import { ok, fail, type ServiceResult } from './api-error'
import type { ApiResponse, SearchPageResponse } from '@/types/common'
import type {
  CompanyCreateRequest,
  CompanyUpdateRequest,
  CompanyResponse,
  CompanySearchResponse,
  CompanyMemberResponse,
} from '@/types/company'

// ── Company Service ──────────────────────────────────────────────────
export const companyService = {
  /** POST /companies */
  async createCompany(body: CompanyCreateRequest): Promise<ServiceResult<CompanyResponse>> {
    try {
      const { data } = await http.post<ApiResponse<CompanyResponse>>('/companies', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /companies/me */
  async getCompany(): Promise<ServiceResult<CompanyResponse>> {
    try {
      const { data } = await http.get<ApiResponse<CompanyResponse>>('/companies/me')
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /companies/me */
  async updateCompany(body: CompanyUpdateRequest): Promise<ServiceResult<CompanyResponse>> {
    try {
      const { data } = await http.put<ApiResponse<CompanyResponse>>('/companies/me', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /companies/me/members */
  async getMembers(): Promise<ServiceResult<CompanyMemberResponse[]>> {
    try {
      const { data } = await http.get<ApiResponse<CompanyMemberResponse[]>>('/companies/me/members')
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /companies/search?q=&page=&size= */
  async searchCompanies(params: {
    q?: string
    page?: number
    size?: number
  }): Promise<ServiceResult<SearchPageResponse<CompanySearchResponse>>> {
    try {
      const { data } = await http.get<ApiResponse<SearchPageResponse<CompanySearchResponse>>>(
        '/companies/search',
        { params },
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },
}
