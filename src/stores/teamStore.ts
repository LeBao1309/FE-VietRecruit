import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CreateInvitationRequest, InvitationResponse } from '@/types/invitation'
import { invitationService } from '@/services/invitationService'
import { useUiStore } from './uiStore'

// TODO: BE does not yet expose endpoints for listing team members, revoking invitations,
// or updating member roles. These actions are stubbed until BE support is added.

export const useTeamStore = defineStore('team', () => {
  // ── State ──────────────────────────────────────────────────────────
  // TODO: members will be populated once GET /company/me/members is available
  const members = ref<unknown[]>([])
  // TODO: invitations list will be populated once GET /invitations is available
  const invitations = ref<InvitationResponse[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  // ── Actions ────────────────────────────────────────────────────────

  // TODO: implement when BE exposes GET /company/me/members
  async function fetchAll(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      // No BE endpoint available yet
      members.value = []
      invitations.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function sendInvitation(body: CreateInvitationRequest): Promise<boolean> {
    const ui = useUiStore()
    isSaving.value = true
    error.value = null
    try {
      const result = await invitationService.createInvitation(body)
      if (result.error) {
        error.value = result.error.message
        ui.toastError('Invitation Failed', result.error.message)
        return false
      }
      if (result.data) {
        invitations.value = [...invitations.value, result.data]
      }
      ui.toastSuccess('Success', `Invitation sent to ${body.email}.`)
      return true
    } finally {
      isSaving.value = false
    }
  }

  // TODO: implement when BE exposes DELETE /invitations/:id
  async function revokeInvitation(_invitationId: string): Promise<boolean> {
    const ui = useUiStore()
    ui.toastWarning('Not Yet Supported', 'The invitation revocation feature has not been implemented yet.')
    return false
  }

  // TODO: implement when BE exposes PUT /company/me/members/:id/role
  async function updateRole(_memberId: string, _role: string): Promise<boolean> {
    const ui = useUiStore()
    ui.toastWarning('Not Yet Supported', 'The role change feature has not been implemented yet.')
    return false
  }

  // TODO: implement when BE exposes DELETE /company/me/members/:id
  async function removeMember(_memberId: string): Promise<boolean> {
    const ui = useUiStore()
    ui.toastWarning('Not Yet Supported', 'The member removal feature has not been implemented yet.')
    return false
  }

  function clearError(): void {
    error.value = null
  }

  return {
    members,
    invitations,
    isLoading,
    isSaving,
    error,
    fetchAll,
    sendInvitation,
    revokeInvitation,
    updateRole,
    removeMember,
    clearError,
  }
})
