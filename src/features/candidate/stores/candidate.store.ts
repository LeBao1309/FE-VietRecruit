import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CandidateProfileResponse, UserProfileResponse } from '../types/candidate.schema'

export const useCandidateStore = defineStore('candidate', () => {
  const candidateProfile = ref<CandidateProfileResponse | null>(null)
  const userProfile = ref<UserProfileResponse | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  return {
    candidateProfile,
    userProfile,
    isLoading,
    error,
  }
})
