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
  // REAL ENDPOINT
  async createInvitation(payload: CreateInvitationRequest): Promise<InvitationResponse> {
    const { data } = await apiClient.post<ApiResponse<InvitationResponse>>('/vietrecruit/invitations', payload)
    return data.data
  },

  // MOCK ENDPOINTS (API Missing)
  _mockMembers: [
    { id: 'm1', userId: 'u1', email: 'admin@company.com', fullName: 'Alice Admin', role: 'COMPANY_ADMIN', joinedAt: new Date().toISOString() },
    { id: 'm2', userId: 'u2', email: 'hr@company.com', fullName: 'Bob HR', role: 'HR', joinedAt: new Date().toISOString() }
  ] as MemberResponse[],
  
  _mockInvitations: [
    { id: 'i1', email: 'newguy@company.com', role: 'INTERVIEWER', invitedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000 * 7).toISOString() }
  ] as PendingInvitationResponse[],

  async getMembers(): Promise<MemberResponse[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...this._mockMembers]), 800))
  },

  async updateMemberRole(id: string, role: Role): Promise<MemberResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const m = this._mockMembers.find(member => member.id === id)
        if (!m) return reject(new Error('Member not found'))
        m.role = role
        resolve({ ...m } as MemberResponse)
      }, 500)
    })
  },

  async removeMember(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._mockMembers = this._mockMembers.filter(m => m.id !== id)
        resolve()
      }, 500)
    })
  },

  async getPendingInvitations(): Promise<PendingInvitationResponse[]> {
    return new Promise((resolve) => setTimeout(() => resolve([...this._mockInvitations]), 600))
  },

  async revokeInvitation(id: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._mockInvitations = this._mockInvitations.filter(i => i.id !== id)
        resolve()
      }, 500)
    })
  }
}
