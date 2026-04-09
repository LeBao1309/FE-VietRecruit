import http from './http'
import { ok, fail, type ServiceResult } from './api-error'
import type { ApiResponse, PageResponse, SearchPageResponse, PaginationParams, SpringPageResponse } from '@/types/common'
import { normalizeSpringPage } from '@/types/common'
import type {
  JobCreateRequest,
  JobUpdateRequest,
  JobSearchRequest,
  JobResponse,
  JobSummaryResponse,
  JobSearchResponse,
} from '@/types/job'
import type {
  JdGenerateRequest,
  JdGenerateResponse,
  ApplyDescriptionRequest,
  SalaryBenchmarkResponse,
} from '@/types/ai'

// ── Job Service ──────────────────────────────────────────────────────
export const jobService = {
  /** POST /jobs — Create a new DRAFT job */
  async createJob(body: JobCreateRequest): Promise<ServiceResult<JobResponse>> {
    try {
      const { data } = await http.post<ApiResponse<JobResponse>>('/jobs', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /jobs/:id — Update a DRAFT job */
  async updateJob(id: string, body: JobUpdateRequest): Promise<ServiceResult<JobResponse>> {
    try {
      const { data } = await http.put<ApiResponse<JobResponse>>(`/jobs/${id}`, body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /jobs/:id/publish — DRAFT → PUBLISHED (quota deducted) */
  async publishJob(id: string): Promise<ServiceResult<JobResponse>> {
    try {
      const { data } = await http.put<ApiResponse<JobResponse>>(`/jobs/${id}/publish`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /jobs/:id/close — PUBLISHED → CLOSED (quota released) */
  async closeJob(id: string): Promise<ServiceResult<JobResponse>> {
    try {
      const { data } = await http.put<ApiResponse<JobResponse>>(`/jobs/${id}/close`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /jobs — Employer's company-scoped job list (paginated) */
  async listJobs(params?: PaginationParams & { status?: string }): Promise<ServiceResult<PageResponse<JobSummaryResponse>>> {
    try {
      const { data } = await http.get<ApiResponse<SpringPageResponse<JobSummaryResponse>>>('/jobs', { params })
      return ok(normalizeSpringPage(data.data))
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /jobs/:id — Single job (company-scoped) */
  async getJob(id: string): Promise<ServiceResult<JobResponse>> {
    try {
      const { data } = await http.get<ApiResponse<JobResponse>>(`/jobs/${id}`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /jobs/search — Full-text search (public, Vietnamese support) */
  async searchJobs(params: JobSearchRequest): Promise<ServiceResult<SearchPageResponse<JobSearchResponse>>> {
    try {
      const { data } = await http.get<ApiResponse<SearchPageResponse<JobSearchResponse>>>('/jobs/search', { params })
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /jobs/autocomplete?q=&limit= — Type-ahead */
  async autocomplete(q: string, limit = 5): Promise<ServiceResult<string[]>> {
    try {
      const { data } = await http.get<ApiResponse<string[]>>('/jobs/autocomplete', {
        params: { q, limit },
      })
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /jobs/public — Published jobs list (no auth) */
  async listPublicJobs(params?: PaginationParams): Promise<ServiceResult<PageResponse<JobSearchResponse>>> {
    try {
      const { data } = await http.get<ApiResponse<SpringPageResponse<JobSearchResponse>>>('/jobs/public', { params })
      return ok(normalizeSpringPage(data.data))
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /jobs/public/:id — Single published job (no auth) */
  async getPublicJob(id: string): Promise<ServiceResult<JobResponse>> {
    try {
      const { data } = await http.get<ApiResponse<JobResponse>>(`/jobs/public/${id}`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  // ── AI Features ────────────────────────────────────────────────────

  /** POST /jobs/ai/generate-description — Generate JD with AI */
  async generateDescription(body: JdGenerateRequest): Promise<ServiceResult<JdGenerateResponse>> {
    try {
      const { data } = await http.post<ApiResponse<JdGenerateResponse>>('/jobs/ai/generate-description', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** POST /jobs/:id/ai/apply-description — Apply generated JD to a job */
  async applyDescription(id: string, body: ApplyDescriptionRequest): Promise<ServiceResult<void>> {
    try {
      await http.post<ApiResponse<void>>(`/jobs/${id}/ai/apply-description`, body)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /jobs/:id/salary-benchmark — Salary benchmark for a job */
  async getSalaryBenchmark(id: string): Promise<ServiceResult<SalaryBenchmarkResponse>> {
    try {
      const { data } = await http.get<ApiResponse<SalaryBenchmarkResponse>>(`/jobs/${id}/salary-benchmark`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },
}
