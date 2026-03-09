import { ref, watch } from 'vue'
import { useIntersectionObserver } from '@/core/composables/useIntersectionObserver'

interface UseSectionLazyOptions {
  /** Minimum height to reserve while section is loading (prevents layout shift) */
  minHeight?: string
  /** Delay in ms before showing content after becoming visible (stagger effect) */
  delay?: number
  rootMargin?: string
  threshold?: number
}

export function useSectionLazy(options: UseSectionLazyOptions = {}) {
  const {
    minHeight  = '400px',
    delay      = 0,
    rootMargin = '120px',
    threshold  = 0.1,
  } = options

  const { targetRef, hasBeenVisible } = useIntersectionObserver({
    rootMargin,
    threshold,
    once: true,
  })

  const isReady = ref(false)

  // Apply optional delay for staggered reveal effect
  const stopWatch = watch(hasBeenVisible, (visible) => {
    if (visible) {
      if (delay > 0) {
        setTimeout(() => { isReady.value = true }, delay)
      } else {
        isReady.value = true
      }
      stopWatch()
    }
  })

  return {
    targetRef,   // attach to the section's wrapper element
    isReady,     // true when section should render its content
    minHeight,   // use as placeholder height before ready
  }
}
