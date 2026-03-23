import { ref } from 'vue'
import { useSubscriptionStore } from '@/core/stores/subscription.store'

export function useSubscriptionPolling() {
  const isPolling = ref(false)
  const isPollingSuccess = ref(false)
  const isPollingTimeout = ref(false)
  
  const subStore = useSubscriptionStore()

  async function startPolling(targetPlanId: string) {
    isPolling.value = true
    isPollingSuccess.value = false
    isPollingTimeout.value = false

    const maxAttempts = 12
    const intervalMs = 5000 // 5s

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // 1. Fetch current subscription
      await subStore.fetchCurrent()

      // 2. Check if the subscription matches the target plan and is active
      if (
        subStore.subscription?.planCode === targetPlanId &&
        subStore.subscription?.status === 'ACTIVE'
      ) {
        isPolling.value = false
        isPollingSuccess.value = true
        return // Polling successful
      }

      // 3. Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    // 4. Timeout reached
    isPolling.value = false
    isPollingTimeout.value = true
  }

  return {
    isPolling,
    isPollingSuccess,
    isPollingTimeout,
    startPolling,
  }
}
