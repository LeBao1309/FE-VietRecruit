import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  PlanResponse,
  SubscriptionResponse,
  QuotaResponse,
} from '@/types/subscription'
import type { BillingCycle } from '@/types/enums'
import { planService } from '@/services/planService'
import { subscriptionService } from '@/services/subscriptionService'
import { paymentService } from '@/services/paymentService'
import { useUiStore } from './uiStore'

export const useSubscriptionStore = defineStore('subscription', () => {
  // ── State ──────────────────────────────────────────────────────────
  const plans = ref<PlanResponse[]>([])
  const currentSubscription = ref<SubscriptionResponse | null>(null)
  const currentQuota = ref<QuotaResponse | null>(null)
  const loading = ref(false)

  // ── Getters ────────────────────────────────────────────────────────
  const hasActiveSubscription = computed(
    () => currentSubscription.value?.status === 'ACTIVE',
  )

  const quotaUsagePercent = computed(() => {
    if (!currentQuota.value || currentQuota.value.maxActiveJobs === 0) return 0
    return Math.round(
      (currentQuota.value.jobsActive / currentQuota.value.maxActiveJobs) * 100,
    )
  })

  const isQuotaFull = computed(
    () =>
      currentQuota.value !== null &&
      currentQuota.value.jobsActive >= currentQuota.value.maxActiveJobs,
  )

  // ── Actions ────────────────────────────────────────────────────────
  async function fetchPlans(): Promise<void> {
    loading.value = true
    try {
      const result = await planService.listPlans()
      if (result.data) {
        plans.value = result.data
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentSubscription(): Promise<void> {
    const result = await subscriptionService.getCurrentSubscription()
    if (result.data) {
      currentSubscription.value = result.data
    } else {
      currentSubscription.value = null
    }
  }

  async function fetchCurrentQuota(): Promise<void> {
    const result = await subscriptionService.getCurrentQuota()
    if (result.data) {
      currentQuota.value = result.data
    }
  }

  async function cancelSubscription(): Promise<boolean> {
    const ui = useUiStore()
    const result = await subscriptionService.cancelSubscription()
    if (result.error) {
      ui.toastError('Cancel failed', result.error.message)
      return false
    }
    ui.toastSuccess('Subscription cancelled', 'Your plan will remain active until the end of the billing period.')
    await fetchCurrentSubscription()
    return true
  }

  async function checkout(planId: string, billingCycle: BillingCycle): Promise<string | null> {
    const ui = useUiStore()
    loading.value = true
    try {
      const result = await paymentService.checkout({ planId, billingCycle })
      if (result.error) {
        ui.toastError('Checkout failed', result.error.message)
        return null
      }
      return result.data!.checkoutUrl
    } finally {
      loading.value = false
    }
  }

  return {
    // state
    plans,
    currentSubscription,
    currentQuota,
    loading,
    // getters
    hasActiveSubscription,
    quotaUsagePercent,
    isQuotaFull,
    // actions
    fetchPlans,
    fetchCurrentSubscription,
    fetchCurrentQuota,
    cancelSubscription,
    checkout,
  }
})
