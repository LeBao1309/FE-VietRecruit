// src/features/candidate/composables/useJobSearch.ts
// Exposes job board search state with ES integration and debounced autocomplete.

import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDebounceFn } from '@vueuse/core'
import { useJobBoardStore } from '@/features/candidate/stores/job-board.store'
import { jobService } from '@/features/candidate/services/job.service'

export function useJobSearch() {
  const store = useJobBoardStore()
  const { jobs, isLoading, error, totalPages, currentPage } = storeToRefs(store)
  const suggestions = ref<string[]>([])

  /**
   * Update search params and trigger a fetch.
   * Resets to page 0 on every new search.
   */
  async function search(params: {
    keyword?: string
    categoryId?: string
    locationId?: string
  }): Promise<void> {
    store.searchParams = { ...store.searchParams, ...params, page: 0 }
    await store.fetchJobs()
  }

  /**
   * Debounced autocomplete — fires 300ms after the last keystroke.
   * Requires at least 2 characters; returns [] on error or short input.
   */
  const autocomplete = useDebounceFn(async (query: string): Promise<void> => {
    if (query.length < 2) {
      suggestions.value = []
      return
    }
    try {
      suggestions.value = await jobService.autocomplete(query)
    } catch {
      suggestions.value = []
    }
  }, 300)

  return {
    jobs,
    isLoading,
    error,
    totalPages,
    currentPage,
    suggestions,
    search,
    autocomplete,
  }
}
