import http from './http'
import { extractError, type AppError } from './api-error'
import type { ApiResponse, PageResponse, PaginationParams, SpringPageResponse } from '@/types/common'
import { normalizeSpringPage } from '@/types/common'
import type {
  ApplicationCreateRequest,
  ApplicationResponse,
  ApplicationSummaryResponse,
  ApplicationStatusUpdateRequest,
  ApplicationStatusHistoryResponse,
  ApplicationScreeningResponse,
} from '@/types/application'

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

// ── Application Service ──────────────────────────────────────────────
export const applicationService = {
  /** POST /applications — Candidate applies to a job */
  async apply(body: ApplicationCreateRequest): Promise<ServiceResult<ApplicationResponse>> {
    try {
      const { data } = await http.post<ApiResponse<ApplicationResponse>>('/applications', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /applications — Employer: list applications (filter by jobId, status) */
  async listApplications(params?: PaginationParams & {
    jobId?: string
    status?: string
  }): Promise<ServiceResult<PageResponse<ApplicationSummaryResponse>>> {
    try {
      const { data } = await http.get<ApiResponse<SpringPageResponse<ApplicationSummaryResponse>>>('/applications', { params })
      return ok(normalizeSpringPage(data.data))
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /applications/mine — Candidate: list own applications */
  async listMyApplications(params?: PaginationParams): Promise<ServiceResult<PageResponse<ApplicationSummaryResponse>>> {
    try {
      const { data } = await http.get<ApiResponse<SpringPageResponse<ApplicationSummaryResponse>>>('/applications/mine', { params })
      return ok(normalizeSpringPage(data.data))
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /applications/:id — Get single application */
  async getApplication(id: string): Promise<ServiceResult<ApplicationResponse>> {
    try {
      const { data } = await http.get<ApiResponse<ApplicationResponse>>(`/applications/${id}`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /applications/:id/status — HR: update application status */
  async updateStatus(id: string, body: ApplicationStatusUpdateRequest): Promise<ServiceResult<ApplicationResponse>> {
    try {
      const { data } = await http.put<ApiResponse<ApplicationResponse>>(`/applications/${id}/status`, body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /applications/:id/status-history — Full status audit log */
  async getStatusHistory(id: string): Promise<ServiceResult<ApplicationStatusHistoryResponse[]>> {
    try {
      const { data } = await http.get<ApiResponse<ApplicationStatusHistoryResponse[]>>(`/applications/${id}/status-history`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /applications/jobs/:jobId/screening — AI screening results */
  async getScreeningResults(jobId: string): Promise<ServiceResult<ApplicationScreeningResponse[]>> {
    try {
      const { data } = await http.get<ApiResponse<ApplicationScreeningResponse[]>>(`/applications/jobs/${jobId}/screening`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** POST /applications/jobs/:jobId/screening/trigger — Trigger AI screening */
  async triggerScreening(jobId: string): Promise<ServiceResult<string>> {
    try {
      const { data } = await http.post<ApiResponse<string>>(`/applications/jobs/${jobId}/screening/trigger`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },
}
