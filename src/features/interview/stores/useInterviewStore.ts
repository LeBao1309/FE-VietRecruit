// src/features/interview/stores/useInterviewStore.ts
// Pinia Setup Store for Interview management (Module 6).
// Pattern mirrors src/features/job/stores/useJobStore.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { interviewService } from '@/features/interview/services/interview.service'
import type {
  Interview,
  InterviewListParams,
  ScheduleInterviewRequest,
  UpdateInterviewStatusRequest,
} from '@/features/interview/types/interview.dto'

export const useInterviewStore = defineStore('interview', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const interviews = ref<Interview[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string | null>(null)

  // ── Computed ───────────────────────────────────────────────────────────────
  const scheduledInterviews = computed(() =>
    interviews.value.filter((i) => i.status === 'SCHEDULED'),
  )
  const completedInterviews = computed(() =>
    interviews.value.filter((i) => i.status === 'COMPLETED'),
  )

  // ── Helpers ────────────────────────────────────────────────────────────────
  function setError(e: unknown): void {
    error.value = e instanceof Error ? e.message : 'An unexpected error occurred.'
  }

  function updateInList(list: Interview[], updated: Interview): void {
    const idx = list.findIndex((i) => i.id === updated.id)
    if (idx !== -1) list[idx] = updated
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fetch interviews for a given applicationId (HR / COMPANY_ADMIN view).
   */
  async function fetchInterviews(params: InterviewListParams): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      interviews.value = await interviewService.getInterviews(params)
    } catch (e) {
      setError(e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Schedule a new interview. Prepends the created interview to the list.
   */
  async function scheduleInterview(payload: ScheduleInterviewRequest): Promise<Interview> {
    isSaving.value = true
    error.value = null
    try {
      const created = await interviewService.scheduleInterview(payload)
      interviews.value.unshift(created)
      return created
    } catch (e) {
      setError(e)
      throw e
    } finally {
      isSaving.value = false
    }
  }

  /**
   * Update an interview's status (COMPLETED or CANCELED).
   */
  async function updateStatus(
    id: string,
    payload: UpdateInterviewStatusRequest,
  ): Promise<void> {
    isSaving.value = true
    error.value = null
    try {
      const updated = await interviewService.updateStatus(id, payload)
      updateInList(interviews.value, updated)
    } catch (e) {
      setError(e)
      throw e
    } finally {
      isSaving.value = false
    }
  }

  // ── Public surface ─────────────────────────────────────────────────────────
  return {
    interviews,
    isLoading,
    isSaving,
    error,
    scheduledInterviews,
    completedInterviews,
    fetchInterviews,
    scheduleInterview,
    updateStatus,
  }
})

