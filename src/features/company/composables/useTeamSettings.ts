// src/features/company/composables/useTeamSettings.ts
// Thin wrapper for useTeamStore — exposes state + actions to TeamManagementTab.

import { storeToRefs } from 'pinia'
import { useTeamStore } from '@/stores/teamStore'
import type { CreateInvitationRequest } from '@/types/invitation'

export function useTeamSettings() {
  const store = useTeamStore()
  const { members, invitations, isLoading, isSaving, error } = storeToRefs(store)

  return {
    // reactive state
    members,
    invitations,
    isLoading,
    isSaving,
    error,
    // actions
    fetchAll:         ()                                  => store.fetchAll(),
    sendInvitation:   (p: CreateInvitationRequest)        => store.sendInvitation(p),
    updateRole:       (memberId: string, role: string)     => store.updateRole(memberId, role),
    removeMember:     (memberId: string)                  => store.removeMember(memberId),
    revokeInvitation: (invitationId: string)              => store.revokeInvitation(invitationId),
    clearError:       ()                                  => store.clearError(),
  }
}
