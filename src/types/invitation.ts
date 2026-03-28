export interface CreateInvitationRequest {
  email: string     // @Email @NotBlank
  role: string      // 'HR' | 'INTERVIEWER'
}

export interface InvitationResponse {
  invitationId: string
  expiresAt: string
}
