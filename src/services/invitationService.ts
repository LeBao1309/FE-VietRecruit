import http from './http'
import { ok, fail, type ServiceResult } from './api-error'
import type { ApiResponse } from '@/types/common'
import type {
  CreateInvitationRequest,
  InvitationResponse,
} from '@/types/invitation'

// ── Invitation Service ───────────────────────────────────────────────
export const invitationService = {
  /** POST /invitations */
  async createInvitation(body: CreateInvitationRequest): Promise<ServiceResult<InvitationResponse>> {
    try {
      const { data } = await http.post<ApiResponse<InvitationResponse>>('/invitations', body)
      return ok(data.data)
    } catch (error) {
      return fail(error)
    }
  },
}
