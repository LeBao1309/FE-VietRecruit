// src/features/job/composables/useAiJobFeatures.ts
// Exposes AI-powered JD generation and salary benchmark with local loading/error state.

import { ref } from 'vue'
import { aiJobService } from '@/features/job/services/ai-job.service'
import { getErrorMessage } from '@/core/utils/error'
import type { SalaryBenchmark } from '@/features/job/types/job.dto'

export function useAiJobFeatures() {
  // ── JD Generator ──────────────────────────────────────────────────────────
  const isGeneratingJd = ref(false)
  const generatedJd = ref<string | null>(null)
  const jdError = ref<string | null>(null)

  async function generateDescription(context: {
    title: string
    department?: string
    requirements?: string
  }): Promise<void> {
    isGeneratingJd.value = true
    jdError.value = null
    try {
      const result = await aiJobService.generateDescription(context)
      generatedJd.value = result.description
    } catch (e) {
      jdError.value = getErrorMessage(e)
    } finally {
      isGeneratingJd.value = false
    }
  }

  // ── Salary Benchmark ──────────────────────────────────────────────────────
  const isEstimatingSalary = ref(false)
  const salaryData = ref<SalaryBenchmark | null>(null)
  const salaryError = ref<string | null>(null)

  async function estimateSalary(context: {
    title: string
    location?: string
    experienceLevel?: string
  }): Promise<void> {
    isEstimatingSalary.value = true
    salaryError.value = null
    try {
      salaryData.value = await aiJobService.estimateSalary(context)
    } catch (e) {
      salaryError.value = getErrorMessage(e)
    } finally {
      isEstimatingSalary.value = false
    }
  }

  return {
    isGeneratingJd,
    generatedJd,
    jdError,
    generateDescription,
    isEstimatingSalary,
    salaryData,
    salaryError,
    estimateSalary,
  }
}
