import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserProfileResponse } from '@/types/user'
import type { RoleCode } from '@/types/enums'
import { getAccessToken, getRefreshToken, clearTokens } from '@/services/http'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──
  const user = ref<UserProfileResponse | null>(null)
  const roles = ref<RoleCode[]>([])
  const accessToken = ref<string | null>(getAccessToken())

  // ── Getters ──
  const isAuthenticated = computed(() => !!accessToken.value)

  const isCandidate = computed(() => roles.value.includes('CANDIDATE'))
  const isEmployer = computed(() =>
    roles.value.some((r) => r === 'COMPANY_ADMIN' || r === 'HR' || r === 'INTERVIEWER'),
  )
  const isCompanyAdmin = computed(() => roles.value.includes('COMPANY_ADMIN'))
  const isHR = computed(() => roles.value.includes('HR'))
  const isInterviewer = computed(() => roles.value.includes('INTERVIEWER'))
  const isSystemAdmin = computed(() => roles.value.includes('SYSTEM_ADMIN'))

  function hasRole(role: RoleCode): boolean {
    return roles.value.includes(role)
  }

  function hasAnyRole(...checkRoles: RoleCode[]): boolean {
    return checkRoles.some((r) => roles.value.includes(r))
  }

  // ── Actions ──
  function setAuth(
    profile: UserProfileResponse,
    userRoles: string[],
    token: string,
  ): void {
    user.value = profile
    roles.value = userRoles as RoleCode[]
    accessToken.value = token
  }

  function setUser(profile: UserProfileResponse): void {
    user.value = profile
  }

  function updateToken(token: string): void {
    accessToken.value = token
  }

  function logout(): void {
    user.value = null
    roles.value = []
    accessToken.value = null
    clearTokens()
  }

  // ── Hydrate from localStorage on app load ──
  function hydrate(): void {
    const token = getAccessToken()
    const refresh = getRefreshToken()
    if (token && refresh) {
      accessToken.value = token
    } else {
      logout()
    }
  }

  return {
    // state
    user,
    roles,
    accessToken,
    // getters
    isAuthenticated,
    isCandidate,
    isEmployer,
    isCompanyAdmin,
    isHR,
    isInterviewer,
    isSystemAdmin,
    // methods
    hasRole,
    hasAnyRole,
    setAuth,
    setUser,
    updateToken,
    logout,
    hydrate,
  }
})
