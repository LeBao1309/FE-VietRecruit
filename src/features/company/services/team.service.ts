// src/features/company/services/team.service.ts
import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type {
  CreateInvitationRequest,
  InvitationResponse,
  MemberResponse,
  PendingInvitationResponse,
  Role
} from '../types/team.dto'

export const teamService = {
  // ── Invitation endpoints (api.json: POST /vietrecruit/invitations) ──

  async createInvitation(payload: CreateInvitationRequest): Promise<InvitationResponse> {
    const { data } = await apiClient.post<ApiResponse<InvitationResponse>>('/vietrecruit/invitations', payload)
    return data.data
  },

  async getPendingInvitations(): Promise<PendingInvitationResponse[]> {
    const { data } = await apiClient.get<ApiResponse<PendingInvitationResponse[]>>('/vietrecruit/invitations')
    return data.data
  },

  async revokeInvitation(id: string): Promise<void> {
    await apiClient.delete(`/vietrecruit/invitations/${id}`)
  },

  // ── Member endpoints ──
  // ⚠️ BLOCKED: GET/PATCH/DELETE /companies/:id/members not defined in api.json.
  // These will be wired once the backend exposes the endpoints.

  async getMembers(): Promise<MemberResponse[]> {
    const { data } = await apiClient.get<ApiResponse<MemberResponse[]>>('/vietrecruit/companies/me/members')
    return data.data
  },

  async updateMemberRole(memberId: string, role: Role): Promise<MemberResponse> {
    const { data } = await apiClient.patch<ApiResponse<MemberResponse>>(
      `/vietrecruit/companies/me/members/${memberId}/role`,
      { role },
    )
    return data.data
  },

  async removeMember(memberId: string): Promise<void> {
    await apiClient.delete(`/vietrecruit/companies/me/members/${memberId}`)
  },
}

