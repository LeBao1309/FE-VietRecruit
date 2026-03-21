// src/features/interview/stores/useScorecardStore.ts
// Pinia Setup Store for Scorecard management (Module 6).
// Pattern mirrors useInterviewStore.ts

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { scorecardService } from '@/features/interview/services/scorecard.service'
import type {
  Scorecard,
  ScorecardSummaryResponse,
  SubmitScorecardRequest,
} from '@/features/interview/types/interview.dto'

export const useScorecardStore = defineStore('scorecard', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const summary = ref<ScorecardSummaryResponse | null>(null)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)
  const submitSuccess = ref(false)

  // ── Helpers ────────────────────────────────────────────────────────────────
  function setError(e: unknown): void {
    error.value = e instanceof Error ? e.message : 'An unexpected error occurred.'
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Load the aggregated scorecard summary for a given interview.
   * Used by ScorecardDashboard (HR / COMPANY_ADMIN only).
   */
  async function fetchSummary(interviewId: string): Promise<void> {
    isLoading.value = true
    error.value = null
    summary.value = null
    try {
      summary.value = await scorecardService.getScorecardSummary(interviewId)
    } catch (e) {
      setError(e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Submit a scorecard for a COMPLETED interview.
   * Reloads the summary after submission so the dashboard reflects the new entry.
   * Used by ScorecardForm (INTERVIEWER only).
   */
  async function submitScorecard(
    interviewId: string,
    payload: SubmitScorecardRequest,
  ): Promise<Scorecard> {
    isSubmitting.value = true
    error.value = null
    submitSuccess.value = false
    try {
      const created = await scorecardService.submitScorecard(interviewId, payload)
      submitSuccess.value = true
      return created
    } catch (e) {
      setError(e)
      throw e
    } finally {
      isSubmitting.value = false
    }
  }

  function resetSubmitState(): void {
    submitSuccess.value = false
    error.value = null
  }

  // ── Public surface ─────────────────────────────────────────────────────────
  return {
    summary,
    isLoading,
    isSubmitting,
    error,
    submitSuccess,
    fetchSummary,
    submitScorecard,
    resetSubmitState,
  }
})
