// src/core/stores/team.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { teamService } from '@/features/company/services/team.service'
import type { 
  MemberResponse, 
  PendingInvitationResponse, 
  Role,
  CreateInvitationRequest 
} from '@/features/company/types/team.dto'
import { parseApiError } from '@/core/utils/error.utils'

export const useTeamStore = defineStore('team', () => {
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  const members = ref<MemberResponse[]>([])
  const invitations = ref<PendingInvitationResponse[]>([])

  async function fetchAll() {
    isLoading.value = true
    error.value = null
    try {
      const [m, i] = await Promise.all([
        teamService.getMembers(),
        teamService.getPendingInvitations()
      ])
      members.value = m
      invitations.value = i
    } catch (err) {
      error.value = parseApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  async function sendInvitation(payload: CreateInvitationRequest): Promise<boolean> {
    isSaving.value = true
    error.value = null
    try {
      await teamService.createInvitation(payload)
      // Attempt to refetch mocks (note: real api won't update our mock invitations list automatically, 
      // but let's simulate)
      await fetchAll()
      return true
    } catch (err) {
      error.value = parseApiError(err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function updateRole(memberId: string, role: Role): Promise<boolean> {
    isSaving.value = true
    error.value = null
    try {
      await teamService.updateMemberRole(memberId, role)
      await fetchAll()
      return true
    } catch (err) {
      error.value = parseApiError(err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function removeMember(memberId: string): Promise<boolean> {
    isSaving.value = true
    error.value = null
    try {
      await teamService.removeMember(memberId)
      await fetchAll()
      return true
    } catch (err) {
      error.value = parseApiError(err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  async function revokeInvitation(invitationId: string): Promise<boolean> {
    isSaving.value = true
    error.value = null
    try {
      await teamService.revokeInvitation(invitationId)
      await fetchAll()
      return true
    } catch (err) {
      error.value = parseApiError(err)
      return false
    } finally {
      isSaving.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    isLoading, isSaving, error, members, invitations,
    fetchAll, sendInvitation, updateRole, removeMember, revokeInvitation, clearError
  }
})
