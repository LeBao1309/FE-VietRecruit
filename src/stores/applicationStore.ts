import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PageResponse, PaginationParams } from '@/types/common'
import type { ApplicationStatus } from '@/types/enums'
import type {
  ApplicationResponse,
  ApplicationSummaryResponse,
  ApplicationStatusHistoryResponse,
  ApplicationScreeningResponse,
} from '@/types/application'
import { applicationService } from '@/services/applicationService'
import { useUiStore } from './uiStore'

// ── Valid Status Transitions (state machine) ────────────────────────
// NEW → SCREENING | REJECTED
// SCREENING → INTERVIEW | REJECTED
// INTERVIEW → OFFER | REJECTED
// OFFER → (auto via candidate accept/decline)
export const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  NEW: ['SCREENING', 'REJECTED'],
  SCREENING: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['OFFER', 'REJECTED'],
  OFFER: [],      // transitions handled by candidate (accept → HIRED, decline → REJECTED)
  HIRED: [],
  REJECTED: [],
}

export const useApplicationStore = defineStore('application', () => {
  // ── State ──────────────────────────────────────────────────────────
  const applications = ref<PageResponse<ApplicationSummaryResponse> | null>(null)
  const currentApplication = ref<ApplicationResponse | null>(null)
  const statusHistory = ref<ApplicationStatusHistoryResponse[]>([])
  const screeningResults = ref<ApplicationScreeningResponse[]>([])

  const loading = ref(false)
  const detailLoading = ref(false)
  const statusLoading = ref(false)
  const historyLoading = ref(false)
  const screeningLoading = ref(false)
  const triggerScreeningLoading = ref(false)

  // ── Getters ────────────────────────────────────────────────────────
  const applicationList = computed(() => applications.value?.content ?? [])
  const totalApplications = computed(() => applications.value?.totalElements ?? 0)
  const totalPages = computed(() => applications.value?.totalPages ?? 0)

  /** Returns the list of valid next statuses for the current application */
  const validTransitions = computed<ApplicationStatus[]>(() => {
    if (!currentApplication.value) return []
    return VALID_TRANSITIONS[currentApplication.value.status] ?? []
  })

  /** Whether the current application can be transitioned (has valid next states) */
  const canTransition = computed(() => validTransitions.value.length > 0)

  /** Group applications by status for Kanban view */
  const applicationsByStatus = computed(() => {
    const groups: Record<ApplicationStatus, ApplicationSummaryResponse[]> = {
      NEW: [],
      SCREENING: [],
      INTERVIEW: [],
      OFFER: [],
      HIRED: [],
      REJECTED: [],
    }
    for (const app of applicationList.value) {
      if (groups[app.status]) {
        groups[app.status].push(app)
      }
    }
    return groups
  })

  // ── Actions ────────────────────────────────────────────────────────

  /** List applications (employer, optionally filtered by jobId & status) */
  async function fetchApplications(
    params?: PaginationParams & { jobId?: string; status?: string },
  ): Promise<void> {
    loading.value = true
    try {
      const result = await applicationService.listApplications(params)
      if (result.data) {
        applications.value = result.data
      } else {
        const ui = useUiStore()
        ui.toastError('Failed to load applications', result.error?.message)
      }
    } finally {
      loading.value = false
    }
  }

  /** Fetch ALL applications for a job (for Kanban — loads up to 200 per page) */
  async function fetchAllForJob(jobId: string): Promise<void> {
    loading.value = true
    try {
      const result = await applicationService.listApplications({
        jobId,
        page: 0,
        size: 200,
        sort: 'createdAt,desc',
      })
      if (result.data) {
        applications.value = result.data
      } else {
        const ui = useUiStore()
        ui.toastError('Failed to load applications', result.error?.message)
      }
    } finally {
      loading.value = false
    }
  }

  /** Get a single application detail */
  async function fetchApplication(id: string): Promise<boolean> {
    detailLoading.value = true
    try {
      const result = await applicationService.getApplication(id)
      if (result.data) {
        currentApplication.value = result.data
        return true
      }
      const ui = useUiStore()
      ui.toastError('Application not found', result.error?.message)
      return false
    } finally {
      detailLoading.value = false
    }
  }

  /** Update an application's status */
  async function updateStatus(
    id: string,
    status: ApplicationStatus,
    notes?: string,
  ): Promise<boolean> {
    const ui = useUiStore()

    // Guard: check valid transition
    if (currentApplication.value) {
      const allowed = VALID_TRANSITIONS[currentApplication.value.status] ?? []
      if (!allowed.includes(status)) {
        ui.toastError(
          'Invalid transition',
          `Cannot move from ${currentApplication.value.status} to ${status}.`,
        )
        return false
      }
    }

    statusLoading.value = true
    try {
      const result = await applicationService.updateStatus(id, { status, notes })
      if (result.data) {
        currentApplication.value = result.data
        ui.toastSuccess('Status updated', `Application moved to ${status}.`)
        return true
      }
      ui.toastError('Status update failed', result.error?.message)
      return false
    } finally {
      statusLoading.value = false
    }
  }

  /** Fetch the status change audit log */
  async function fetchStatusHistory(applicationId: string): Promise<void> {
    historyLoading.value = true
    try {
      const result = await applicationService.getStatusHistory(applicationId)
      if (result.data) {
        statusHistory.value = result.data
      } else {
        statusHistory.value = []
      }
    } finally {
      historyLoading.value = false
    }
  }

  /** Fetch AI screening results for a job */
  async function fetchScreeningResults(jobId: string): Promise<void> {
    screeningLoading.value = true
    try {
      const result = await applicationService.getScreeningResults(jobId)
      if (result.data) {
        screeningResults.value = result.data
      } else {
        screeningResults.value = []
      }
    } finally {
      screeningLoading.value = false
    }
  }

  /** Trigger AI screening for all applications on a job */
  async function triggerScreening(jobId: string): Promise<boolean> {
    const ui = useUiStore()
    triggerScreeningLoading.value = true
    try {
      const result = await applicationService.triggerScreening(jobId)
      if (result.data !== null) {
        ui.toastSuccess('AI Screening started', 'Results will appear shortly.')
        return true
      }
      ui.toastError('Screening failed', result.error?.message)
      return false
    } finally {
      triggerScreeningLoading.value = false
    }
  }

  /** Move a card on the Kanban board — validates transition and updates in-place */
  async function kanbanMove(
    appId: string,
    fromStatus: ApplicationStatus,
    toStatus: ApplicationStatus,
    notes?: string,
  ): Promise<boolean> {
    const ui = useUiStore()
    const allowed = VALID_TRANSITIONS[fromStatus] ?? []
    if (!allowed.includes(toStatus)) {
      ui.toastError('Invalid move', `Cannot move from ${fromStatus} to ${toStatus}.`)
      return false
    }
    statusLoading.value = true
    try {
      const result = await applicationService.updateStatus(appId, { status: toStatus, notes })
      if (result.data) {
        if (applications.value) {
          const idx = applications.value.content.findIndex((a) => a.id === appId)
          if (idx !== -1) {
            applications.value.content[idx] = {
              ...applications.value.content[idx],
              status: toStatus,
            } as ApplicationSummaryResponse
          }
        }
        ui.toastSuccess('Candidate moved', `${fromStatus} → ${toStatus}`)
        return true
      }
      ui.toastError('Move failed', result.error?.message)
      return false
    } finally {
      statusLoading.value = false
    }
  }

  /** Clear current detail state */
  function clearCurrent(): void {
    currentApplication.value = null
    statusHistory.value = []
  }

  return {
    // state
    applications,
    currentApplication,
    statusHistory,
    screeningResults,
    loading,
    detailLoading,
    statusLoading,
    historyLoading,
    screeningLoading,
    triggerScreeningLoading,
    // getters
    applicationList,
    totalApplications,
    totalPages,
    validTransitions,
    canTransition,
    applicationsByStatus,
    // actions
    fetchApplications,
    fetchAllForJob,
    fetchApplication,
    updateStatus,
    kanbanMove,
    fetchStatusHistory,
    fetchScreeningResults,
    triggerScreening,
    clearCurrent,
  }
})
