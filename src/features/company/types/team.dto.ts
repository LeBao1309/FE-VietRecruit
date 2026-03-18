// src/features/company/types/team.dto.ts
import { z } from 'zod'

export const RoleEnum = z.enum(['COMPANY_ADMIN', 'HR', 'INTERVIEWER'])
export type Role = z.infer<typeof RoleEnum>

export const CreateInvitationRequestSchema = z.object({
  email: z.string().email('Email không hợp lệ').max(255),
  role: z.enum(['HR', 'INTERVIEWER'], {
    message: 'Vai trò phải là HR hoặc INTERVIEWER'
  })
})
export type CreateInvitationRequest = z.infer<typeof CreateInvitationRequestSchema>

export interface InvitationResponse {
  invitationId: string
  expiresAt: string
}

// ── MOCK TYPES (API MISSING) ──
export interface MemberResponse {
  id: string
  userId: string
  email: string
  fullName: string
  role: Role
  joinedAt: string
}

export interface PendingInvitationResponse {
  id: string
  email: string
  role: Role
  invitedAt: string
  expiresAt: string
}
