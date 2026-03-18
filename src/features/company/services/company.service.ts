// src/features/company/services/company.service.ts
// HTTP calls for company profile. One function per endpoint — no business logic.

import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type { CompanyUpdateRequest, CompanyResponse } from '@/features/company/types/company.dto'

const BASE = '/vietrecruit/companies'

export const companyService = {
  /** GET /vietrecruit/companies/me */
  async getCompany(): Promise<CompanyResponse> {
    const { data } = await apiClient.get<ApiResponse<CompanyResponse>>(
      `${BASE}/me`,
    )
    return data.data
  },

  /** PUT /vietrecruit/companies/me */
  async updateCompany(payload: CompanyUpdateRequest): Promise<CompanyResponse> {
    const { data } = await apiClient.put<ApiResponse<CompanyResponse>>(
      `${BASE}/me`,
      payload,
    )
    return data.data
  },
}
