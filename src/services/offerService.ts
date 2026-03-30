import http from './http'
import { ok, fail, type ServiceResult } from './api-error'
import type { ApiResponse } from '@/types/common'
import type {
  OfferCreateRequest,
  OfferRespondRequest,
  OfferResponse,
} from '@/types/application'

// ── Offer Service ────────────────────────────────────────────────────
export const offerService = {
  /** POST /applications/:id/offers — Create a DRAFT offer */
  async createOffer(
    applicationId: string,
    body: OfferCreateRequest,
  ): Promise<ServiceResult<OfferResponse>> {
    try {
      const { data } = await http.post<ApiResponse<OfferResponse>>(
        `/applications/${applicationId}/offers`,
        body,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /applications/:id/offers — List offers for an application */
  async listOffers(
    applicationId: string,
  ): Promise<ServiceResult<OfferResponse[]>> {
    try {
      const { data } = await http.get<ApiResponse<OfferResponse[]>>(
        `/applications/${applicationId}/offers`,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** GET /offers/:id — Get a single offer */
  async getOffer(id: string): Promise<ServiceResult<OfferResponse>> {
    try {
      const { data } = await http.get<ApiResponse<OfferResponse>>(
        `/offers/${id}`,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /offers/:id/send — Send a DRAFT offer to the candidate */
  async sendOffer(id: string): Promise<ServiceResult<OfferResponse>> {
    try {
      const { data } = await http.put<ApiResponse<OfferResponse>>(
        `/offers/${id}/send`,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** PUT /offers/:id/respond — Candidate accepts/declines an offer */
  async respondToOffer(
    id: string,
    body: OfferRespondRequest,
  ): Promise<ServiceResult<OfferResponse>> {
    try {
      const { data } = await http.put<ApiResponse<OfferResponse>>(
        `/offers/${id}/respond`,
        body,
      )
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },

  /** DELETE /offers/:id — Delete a DRAFT offer */
  async deleteOffer(id: string): Promise<ServiceResult<void>> {
    try {
      await http.delete<ApiResponse<void>>(`/offers/${id}`)
      return ok(undefined as unknown as void)
    } catch (error) {
      return fail(error)
    }
  },
}
