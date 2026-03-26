// src/features/pipeline/composables/useScreeningResults.ts
// Polls GET /applications/jobs/{jobId}/screening every 10s, max 12 attempts (2 min).
// Removes jobId from sessionStorage aiPendingIds once a final score arrives.

import { ref, onUnmounted, type Ref } from 'vue'
import { applicationService } from '@/features/pipeline/services/application.service'
import type { ScreeningResult } from '@/features/pipeline/types/screening.dto'

const POLL_INTERVAL_MS = 10_000
const MAX_ATTEMPTS = 12
const SESSION_KEY = 'pipeline_ai_pending'

function removePendingId(jobId: string): void {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    const pending: string[] = raw ? (JSON.parse(raw) as string[]) : []
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(pending.filter((id) => id !== jobId)))
  } catch {
    // sessionStorage unavailable — silently skip
  }
}

export function useScreeningResults(jobId: Ref<string>) {
  const result = ref<ScreeningResult | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let interval: ReturnType<typeof setInterval> | null = null

  function stopPolling(): void {
    if (interval !== null) {
      clearInterval(interval)
      interval = null
    }
    isLoading.value = false
  }

  async function startPolling(): Promise<void> {
    if (interval !== null) return // already running

    isLoading.value = true
    error.value = null
    result.value = null

    let attempts = 0

    interval = setInterval(async () => {
      attempts++

      try {
        const data = await applicationService.getScreeningResults(jobId.value)

        if (data?.score !== null && data?.score !== undefined) {
          result.value = data
          removePendingId(jobId.value)
          stopPolling()
          return
        }
      } catch {
        // Silent — retry on next tick. Hard errors surface only on timeout.
      }

      if (attempts >= MAX_ATTEMPTS) {
        error.value = 'Hết thời gian chờ kết quả AI. Vui lòng thử lại.'
        stopPolling()
      }
    }, POLL_INTERVAL_MS)
  }

  onUnmounted(stopPolling)

  return { result, isLoading, error, startPolling, stopPolling }
}
