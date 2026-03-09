import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface UseIntersectionOptions {
  /** 0.0 - 1.0. Default: 0.15 (trigger when 15% of element is visible) */
  threshold?: number
  /** CSS margin before the element. Default: '100px' (preload 100px before viewport) */
  rootMargin?: string
  /** Once true, stop observing (default: true — fires once, no re-hide) */
  once?: boolean
}

interface UseIntersectionReturn {
  targetRef: Ref<HTMLElement | null>
  isVisible: Ref<boolean>
  hasBeenVisible: Ref<boolean>  // stays true even if scrolled away
}

export function useIntersectionObserver(
  options: UseIntersectionOptions = {}
): UseIntersectionReturn {
  const {
    threshold  = 0.15,
    rootMargin = '100px',
    once       = true,
  } = options

  const targetRef      = ref<HTMLElement | null>(null)
  const isVisible      = ref(false)
  const hasBeenVisible = ref(false)

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!targetRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value      = true
            hasBeenVisible.value = true
            // If once=true, stop watching after first intersection
            if (once && observer) {
              observer.disconnect()
              observer = null
            }
          } else {
            if (!once) isVisible.value = false
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(targetRef.value)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  })

  return { targetRef, isVisible, hasBeenVisible }
}
