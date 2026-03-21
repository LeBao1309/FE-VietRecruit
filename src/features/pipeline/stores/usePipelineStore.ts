// src/features/pipeline/stores/usePipelineStore.ts
// Pinia Setup Store for ATS Pipeline (Module 5).
// Pattern mirrors src/features/job/stores/useJobStore.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { applicationService } from '@/features/pipeline/services/application.service'
import {
  APPLICATION_STATUSES,
  type Application,
  type ApplicationDetail,
  type ApplicationStatus,
} from '@/features/pipeline/types/application.dto'

// ── AI Pending tracking ──────────────────────────────────────────────────────
// IDs of applications currently undergoing async AI screening.
// Stored in sessionStorage so the badge persists across minor re-renders
// but clears on page refresh (no callback mechanism confirmed yet).
function loadAiPending(): Set<string> {
  try {
    const raw = sessionStorage.getItem('pipeline_ai_pending')
    return raw ? new Set<string>(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function saveAiPending(set: Set<string>): void {
  sessionStorage.setItem('pipeline_ai_pending', JSON.stringify([...set]))
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildEmptyBoard(): Record<ApplicationStatus, Application[]> {
  return Object.fromEntries(
    APPLICATION_STATUSES.map((s) => [s, [] as Application[]]),
  ) as Record<ApplicationStatus, Application[]>
}

function groupByStatus(apps: Application[]): Record<ApplicationStatus, Application[]> {
  const board = buildEmptyBoard()
  for (const app of apps) {
    board[app.status].push(app)
  }
  return board
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const usePipelineStore = defineStore('pipeline-v2', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const applicationsByStatus = ref<Record<ApplicationStatus, Application[]>>(buildEmptyBoard())
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedJobId = ref<string | null>(null)
  const aiPendingIds = ref<Set<string>>(loadAiPending())
  const openDetailId = ref<string | null>(null)
  const detailCache = ref<Record<string, ApplicationDetail>>({})
  const isDetailLoading = ref(false)

  // ── Computed ───────────────────────────────────────────────────────────────
  const totalApplications = computed(() =>
    APPLICATION_STATUSES.reduce((sum, s) => sum + applicationsByStatus.value[s].length, 0),
  )

  function isAiPending(id: string): boolean {
    return aiPendingIds.value.has(id)
  }

  // ── Private helpers ────────────────────────────────────────────────────────
  function setError(e: unknown): void {
    error.value = e instanceof Error ? e.message : 'An unexpected error occurred.'
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetch all applications for a job and group them into the Kanban columns.
   * Loads up to 200 cards to avoid pagination in the board view.
   */
  async function fetchApplications(jobId: string): Promise<void> {
    isLoading.value = true
    error.value = null
    selectedJobId.value = jobId
    try {
      const response = await applicationService.getApplications({ jobId, size: 200 })
      applicationsByStatus.value = groupByStatus(response.content)
    } catch (e) {
      setError(e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Move an application from its current column to newStatus.
   *
   * CRITICAL — Optimistic UI Update:
   *   1. Snapshot the current board state for rollback.
   *   2. Remove the card from the source column and insert it at
   *      the top of the target column immediately (no API wait).
   *   3. Call PATCH API in the background.
   *   4. On success: replace the optimistic card with confirmed server data.
   *   5. On failure: restore the snapshot state and set error message;
   *      re-throw so the view can display a toast/banner.
   */
  async function moveApplication(id: string, newStatus: ApplicationStatus): Promise<void> {
    // ── Step 1: locate the card ──────────────────────────────────────────────
    let sourceStatus: ApplicationStatus | null = null
    let sourceIndex = -1
    let movedApp: Application | null = null

    for (const status of APPLICATION_STATUSES) {
      const idx = applicationsByStatus.value[status].findIndex((a) => a.id === id)
      if (idx !== -1) {
        sourceStatus = status
        sourceIndex = idx
        movedApp = applicationsByStatus.value[status][idx]!
        break
      }
    }

    // Guard: card not found or already in target column
    if (!movedApp || sourceStatus === null || sourceStatus === newStatus) return

    // ── Step 2: snapshot for rollback ────────────────────────────────────────
    // Deep-clone only the two affected columns to minimise memory.
    const sourceSnapshot = [...applicationsByStatus.value[sourceStatus]]
    const targetSnapshot = [...applicationsByStatus.value[newStatus]]

    // ── Step 3: optimistic move (instant UI update) ──────────────────────────
    applicationsByStatus.value[sourceStatus].splice(sourceIndex, 1)
    const optimisticApp: Application = { ...movedApp, status: newStatus }
    applicationsByStatus.value[newStatus].unshift(optimisticApp)

    // ── Step 4: API call in background ───────────────────────────────────────
    try {
      const confirmed = await applicationService.updateStatus(id, { status: newStatus })

      // Replace optimistic card with server-confirmed data
      const confirmedIdx = applicationsByStatus.value[newStatus].findIndex((a) => a.id === id)
      if (confirmedIdx !== -1) {
        applicationsByStatus.value[newStatus][confirmedIdx] = confirmed
      }
    } catch (e) {
      // ── Step 5: rollback on failure ──────────────────────────────────────
      applicationsByStatus.value[sourceStatus] = sourceSnapshot
      applicationsByStatus.value[newStatus] = targetSnapshot
      setError(e)
      throw e // re-throw so the view can show a toast/banner
    }
  }

  /**
   * Trigger async AI screening for a card.
   * Marks the card as AI-pending immediately (badge shown until page refresh).
   */
  async function triggerAiScreening(id: string): Promise<void> {
    try {
      await applicationService.triggerAiScreening(id)
      aiPendingIds.value.add(id)
      saveAiPending(aiPendingIds.value)
    } catch (e) {
      setError(e)
      throw e
    }
  }

  /**
   * Open the detail drawer for a card.
   * Caches the result so repeated opens don't hit the network.
   */
  async function openDetail(id: string): Promise<void> {
    openDetailId.value = id
    if (detailCache.value[id]) return
    isDetailLoading.value = true
    try {
      const detail = await applicationService.getApplicationDetail(id)
      detailCache.value[id] = detail
    } catch (e) {
      setError(e)
    } finally {
      isDetailLoading.value = false
    }
  }

  function closeDetail(): void {
    openDetailId.value = null
  }

  // ── Public surface ────────────────────────────────────────────────────────
  return {
    // State
    applicationsByStatus,
    isLoading,
    error,
    selectedJobId,
    aiPendingIds,
    openDetailId,
    detailCache,
    isDetailLoading,
    // Computed
    totalApplications,
    isAiPending,
    // Actions
    fetchApplications,
    moveApplication,
    triggerAiScreening,
    openDetail,
    closeDetail,
  }
})
