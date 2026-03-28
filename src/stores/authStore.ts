import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserProfileResponse } from '@/types/user'
import type { RoleCode } from '@/types/enums'
import type { LoginRequest, RegisterRequest } from '@/types/auth'
import { getAccessToken, getRefreshToken, clearTokens } from '@/services/http'
import { authService } from '@/services/authService'
import { useUiStore } from './uiStore'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──
  const user = ref<UserProfileResponse | null>(null)
  const roles = ref<RoleCode[]>([])
  const accessToken = ref<string | null>(getAccessToken())
  const loading = ref(false)

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

  async function login(body: LoginRequest): Promise<boolean> {
    const ui = useUiStore()
    loading.value = true
    try {
      const result = await authService.login(body)
      if (result.error) {
        ui.toastError('Login failed', result.error.message)
        return false
      }
      const loginData = result.data!
      accessToken.value = loginData.accessToken
      roles.value = loginData.roles as RoleCode[]

      // Fetch full profile
      const profileResult = await authService.getProfile()
      if (profileResult.data) {
        user.value = profileResult.data
      }

      ui.toastSuccess('Welcome back!', `Logged in as ${user.value?.fullName ?? body.email}`)
      return true
    } finally {
      loading.value = false
    }
  }

  async function register(body: RegisterRequest): Promise<boolean> {
    const ui = useUiStore()
    loading.value = true
    try {
      const result = await authService.register(body)
      if (result.error) {
        ui.toastError('Registration failed', result.error.message)
        return false
      }
      return true
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile(): Promise<boolean> {
    const result = await authService.getProfile()
    if (result.data) {
      user.value = result.data
      return true
    }
    return false
  }

  async function logout(): Promise<void> {
    const ui = useUiStore()
    await authService.logout()
    user.value = null
    roles.value = []
    accessToken.value = null
    clearTokens()
    ui.toastInfo('Logged out', 'You have been signed out.')
    await router.push('/login')
  }

  function hydrate(): void {
    const token = getAccessToken()
    const refresh = getRefreshToken()
    if (token && refresh) {
      accessToken.value = token
    } else {
      user.value = null
      roles.value = []
      accessToken.value = null
      clearTokens()
    }
  }

  return {
    user,
    roles,
    accessToken,
    loading,
    isAuthenticated,
    isCandidate,
    isEmployer,
    isCompanyAdmin,
    isHR,
    isInterviewer,
    isSystemAdmin,
    hasRole,
    hasAnyRole,
    setAuth,
    setUser,
    updateToken,
    login,
    register,
    fetchProfile,
    logout,
    hydrate,
  }
})
