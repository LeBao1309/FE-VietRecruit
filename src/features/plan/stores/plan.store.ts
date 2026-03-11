// src/features/plan/stores/plan.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { planService } from '@/features/plan/services/plan.service'
import { parseApiError } from '@/core/utils/error.utils'
import type { PlanResponse } from '@/features/plan/types/plan.dto'

export const usePlanStore = defineStore('plan', () => {
  const plans     = ref<PlanResponse[]>([])
  const isLoading = ref(false)
  const error     = ref<string | null>(null)

  async function fetchPlans(): Promise<void> {
    if (plans.value.length > 0) return // already fetched — avoid redundant calls

    error.value = null
    isLoading.value = true
    try {
      plans.value = await planService.listPlans()
    } catch (err) {
      error.value = parseApiError(err)
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    plans,
    isLoading,
    error,
    fetchPlans,
    clearError,
  }
})
