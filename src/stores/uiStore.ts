import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ── Toast Types ──────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  type: ToastType
  title: string
  message?: string
  duration: number
}

let nextToastId = 0

// ── UI Store ─────────────────────────────────────────────────────────
export const useUiStore = defineStore('ui', () => {
  // ── Global Loading ──
  const globalLoadingCount = ref(0)
  const isGlobalLoading = computed(() => globalLoadingCount.value > 0)

  function startLoading(): void {
    globalLoadingCount.value++
  }

  function stopLoading(): void {
    globalLoadingCount.value = Math.max(0, globalLoadingCount.value - 1)
  }

  // ── Toasts ──
  const toasts = ref<Toast[]>([])

  function addToast(
    type: ToastType,
    title: string,
    message?: string,
    duration = 5000,
  ): void {
    const id = nextToastId++
    const toast: Toast = { id, type, title, message, duration }
    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }

  function removeToast(id: number): void {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  // ── Convenience Methods ──
  function toastSuccess(title: string, message?: string): void {
    addToast('success', title, message)
  }

  function toastError(title: string, message?: string): void {
    addToast('error', title, message, 8000)
  }

  function toastWarning(title: string, message?: string): void {
    addToast('warning', title, message)
  }

  function toastInfo(title: string, message?: string): void {
    addToast('info', title, message)
  }

  return {
    // loading
    isGlobalLoading,
    startLoading,
    stopLoading,
    // toasts
    toasts,
    addToast,
    removeToast,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo,
  }
})
