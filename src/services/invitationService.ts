import http from './http'
import { extractError, type AppError } from './api-error'
import type { ApiResponse } from '@/types/common'
import type {
  CreateInvitationRequest,
  InvitationResponse,
} from '@/types/invitation'

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
