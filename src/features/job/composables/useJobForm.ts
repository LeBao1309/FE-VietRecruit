// src/features/job/composables/useJobForm.ts
// Bridges the Job form (create/edit) with the job store.
// Returns reactive state and a unified save() action.

import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useJobStore } from '@/features/job/stores/useJobStore'
import type { CreateJobRequest } from '@/features/job/types/job.dto'

export function useJobForm(mode: 'create' | 'edit', jobId?: string) {
  const store = useJobStore()
  const { isLoading, error, currentJob } = storeToRefs(store)

  onMounted(() => {
    if (mode === 'edit' && jobId) {
      store.loadJob(jobId)
    }
  })

  /**
   * Saves the form data.
   * Returns true on success, false on failure (error set in store.error).
   */
  async function save(data: CreateJobRequest): Promise<boolean> {
    try {
      if (mode === 'create') {
        await store.createJob(data)
      } else {
        await store.updateJob(jobId!, data)
      }
      return true
    } catch {
      return false
    }
  }

  return {
    isLoading,
    error,
    initialData: currentJob,
    save,
  }
}
