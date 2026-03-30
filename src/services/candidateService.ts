import http from './http'
import { ok, fail, type ServiceResult } from './api-error'
import type { ApiResponse, SearchPageResponse } from '@/types/common'
import type {
  CandidateUpdateRequest,
  CandidateProfileResponse,
  CandidateSearchRequest,
  CandidateSearchResponse,
  CvUploadResponse,
} from '@/types/candidate'
import type { JobRecommendationResponse } from '@/types/job'
import type { CvImprovementResponse, SalaryBenchmarkResponse } from '@/types/ai'

// ── Candidate Service ────────────────────────────────────────────────
export const candidateService = {
  /** GET /candidates/me */
  async getProfile(): Promise<ServiceResult<CandidateProfileResponse>> {
    try {
      const { data } = await http.get<ApiResponse<CandidateProfileResponse>>('/candidates/me')
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /candidates/me */
  async updateProfile(body: CandidateUpdateRequest): Promise<ServiceResult<CandidateProfileResponse>> {
    try {
      const { data } = await http.put<ApiResponse<CandidateProfileResponse>>('/candidates/me', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** POST /candidates/me/cv — multipart/form-data */
  async uploadCv(file: File): Promise<ServiceResult<CvUploadResponse>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await http.post<ApiResponse<CvUploadResponse>>('/candidates/me/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** DELETE /candidates/me/cv */
  async deleteCv(): Promise<ServiceResult<void>> {
    try {
      await http.delete<ApiResponse<void>>('/candidates/me/cv')
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /candidates/me/job-recommendations?limit= */
  async getRecommendations(limit = 10): Promise<ServiceResult<JobRecommendationResponse[]>> {
    try {
      const { data } = await http.get<ApiResponse<JobRecommendationResponse[]>>(
        '/candidates/me/job-recommendations',
        { params: { limit } },
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** POST /candidates/me/cv/improvement — AI CV analysis */
  async getCvImprovement(): Promise<ServiceResult<CvImprovementResponse>> {
    try {
      const { data } = await http.post<ApiResponse<CvImprovementResponse>>('/candidates/me/cv/improvement')
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /candidates/me/salary-benchmark?jobTitle=&locationId= */
  async getSalaryBenchmark(params: {
    jobTitle?: string
    locationId?: string
  }): Promise<ServiceResult<SalaryBenchmarkResponse>> {
    try {
      const { data } = await http.get<ApiResponse<SalaryBenchmarkResponse>>(
        '/candidates/me/salary-benchmark',
        { params },
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /candidates/search — Employer: search candidates */
  async searchCandidates(params: CandidateSearchRequest): Promise<ServiceResult<SearchPageResponse<CandidateSearchResponse>>> {
    try {
      const { data } = await http.get<ApiResponse<SearchPageResponse<CandidateSearchResponse>>>(
        '/candidates/search',
        { params },
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /candidates/:id — Employer: view candidate */
  async getCandidate(id: string): Promise<ServiceResult<CandidateProfileResponse>> {
    try {
      const { data } = await http.get<ApiResponse<CandidateProfileResponse>>(`/candidates/${id}`)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },
}
