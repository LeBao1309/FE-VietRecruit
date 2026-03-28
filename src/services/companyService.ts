import http from './http'
import { extractError, type AppError } from './api-error'
import type { ApiResponse, SearchPageResponse } from '@/types/common'
import type {
  CompanyCreateRequest,
  CompanyUpdateRequest,
  CompanyResponse,
  CompanySearchResponse,
} from '@/types/company'

// ── Result wrapper ───────────────────────────────────────────────────
interface ServiceResult<T> {
  data: T | null
  error: AppError | null
}

function ok<T>(data: T): ServiceResult<T> {
  return { data, error: null }
}

function fail<T>(error: unknown): ServiceResult<T> {
  return { data: null, error: extractError(error) }
}

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
