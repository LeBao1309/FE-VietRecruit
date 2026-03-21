// src/core/stores/subscription.store.ts
import { getErrorMessage } from '@/core/utils/error'
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { subscriptionService } from '@/features/subscription/services/subscription.service';
import type { SubscriptionResponse, QuotaResponse } from '@/features/subscription/types/subscription.dto';

export const useSubscriptionStore = defineStore('subscription', () => {
  const subscription = ref<SubscriptionResponse | null>(null);
  const quota = ref<QuotaResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const activePlanCode = computed(() => subscription.value?.planCode);
  const isCanceled = computed(() => subscription.value?.autoRenew === false);

  async function fetchCurrent() {
    isLoading.value = true;
    error.value = null;
    try {
      const [subData, quotaData] = await Promise.all([
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getCurrentQuota()
      ]);
      subscription.value = subData;
      quota.value = quotaData;
    } catch (err: any) {
      error.value = getErrorMessage(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function cancelSubscription() {
    try {
      await subscriptionService.cancelSubscription();
      if (subscription.value) {
        subscription.value.autoRenew = false;
      }
    } catch (err: any) {
      throw err;
    }
  }

  return {
    subscription,
    quota,
    isLoading,
    error,
    activePlanCode,
    isCanceled,
    fetchCurrent,
    cancelSubscription
  };
});
