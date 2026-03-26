// src/features/onboarding/services/onboarding.service.ts
// HTTP calls for company and candidate profile management.

import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type {
  CompanyUpdateRequest,
  CompanyResponse,
  CandidateUpdateRequest,
  CandidateProfileResponse,
} from '@/features/onboarding/types/onboarding.dto'

export const onboardingService = {
  // ── Company ──────────────────────────────────────────────

  /** GET /vietrecruit/companies/me */
  async getCompany(): Promise<CompanyResponse> {
    const { data } = await apiClient.get<ApiResponse<CompanyResponse>>(
      '/vietrecruit/companies/me',
    )
    return data.data
  },

  /** POST /vietrecruit/companies — create a new company (for self-registered employers) */
  async createCompany(payload: CompanyUpdateRequest): Promise<CompanyResponse> {
    const { data } = await apiClient.post<ApiResponse<CompanyResponse>>(
      '/vietrecruit/companies',
      payload,
    )
    return data.data
  },

  /** PUT /vietrecruit/companies/me */
  async updateCompany(payload: CompanyUpdateRequest): Promise<CompanyResponse> {
    const { data } = await apiClient.put<ApiResponse<CompanyResponse>>(
      '/vietrecruit/companies/me',
      payload,
    )
    return data.data
  },

  // ── Candidate ────────────────────────────────────────────

  /** GET /vietrecruit/candidates/me */
  async getCandidateProfile(): Promise<CandidateProfileResponse> {
    const { data } = await apiClient.get<ApiResponse<CandidateProfileResponse>>(
      '/vietrecruit/candidates/me',
    )
    return data.data
  },

  /** PUT /vietrecruit/candidates/me */
  async updateCandidateProfile(payload: CandidateUpdateRequest): Promise<CandidateProfileResponse> {
    const { data } = await apiClient.put<ApiResponse<CandidateProfileResponse>>(
      '/vietrecruit/candidates/me',
      payload,
    )
    return data.data
  },
}
