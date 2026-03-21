<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useSubscriptionStore } from "@/core/stores/subscription.store";
import { usePaymentStore } from "@/core/stores/payment.store";
import PricingSection from "@/features/landing/components/PricingSection.vue";
import type { PlanResponse } from "@/features/plan/types/plan.dto";
import { AlertCircle, Calendar, Briefcase, XCircle, CheckCircle } from "lucide-vue-next";

const subStore = useSubscriptionStore();
const paymentStore = usePaymentStore();
const showCancelModal = ref(false);

onMounted(() => {
  subStore.fetchCurrent();
});

const handleSubscribe = async ({ plan, billingCycle }: { plan: PlanResponse, billingCycle: 'monthly' | 'yearly' }) => {
  if (plan.id) {
    await paymentStore.checkout(plan.id, billingCycle.toUpperCase() as 'MONTHLY' | 'YEARLY');
  }
};

const handleCancel = async () => {
  try {
    await subStore.cancelSubscription();
    showCancelModal.value = false;
  } catch (error) {
    }
};

const quotaPercent = computed(() => {
  if (!subStore.quota || !subStore.quota.maxActiveJobs || subStore.quota.maxActiveJobs === -1) return 0;
  return Math.min(100, (subStore.quota.jobsActive || 0) / subStore.quota.maxActiveJobs * 100);
});

const isUnlimited = computed(() => subStore.quota?.maxActiveJobs === -1);
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 space-y-8">
    <header>
      <h1 class="text-2xl font-bold text-text-primary">Gói Cước & Thanh Toán</h1>
      <p class="text-text-secondary mt-1">Quản lý giới hạn công việc và chu kỳ thanh toán hiện tại của doanh nghiệp.</p>
    </header>

    <div v-if="subStore.isLoading" class="flex justify-center p-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
    </div>
    <div v-else-if="subStore.error" class="bg-error-light text-error-dark p-4 rounded-lg flex items-center gap-3">
      <AlertCircle :size="20"/>
      <p>{{ subStore.error }}</p>
    </div>
    
    <div v-else-if="subStore.subscription && subStore.quota" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- Current Plan Info -->
      <section class="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">Gói Cước Hiện Tại</h2>
              <p class="text-2xl font-bold flex items-center gap-2">
                {{ subStore.subscription.planName }}
                <span v-if="subStore.subscription.status === 'ACTIVE'" class="px-2 py-0.5 text-xs rounded-full bg-success-light text-success-dark font-medium border border-success/20">
                  <CheckCircle :size="12" class="inline-block mr-1"/>Đang hoạt động
                </span>
              </p>
              <p v-if="subStore.isCanceled" class="text-sm text-warning-dark mt-2">
                Gói cước sẽ không tự động gia hạn vào cuối chu kỳ.
              </p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="flex items-center gap-3 text-text-secondary">
              <Calendar :size="18" />
              <span>Chu kỳ: <strong>{{ subStore.quota.cycleStart ? new Date(subStore.quota.cycleStart).toLocaleDateString() : '--' }}</strong> - <strong>{{ subStore.quota.cycleEnd ? new Date(subStore.quota.cycleEnd).toLocaleDateString() : '--' }}</strong></span>
            </div>
            <div class="flex items-center gap-3 text-text-secondary">
              <Briefcase :size="18" />
              <span>Số công việc đã đăng: <strong>{{ subStore.quota.jobsPosted }}</strong></span>
            </div>
          </div>
        </div>
        
        <div class="mt-8 pt-4 border-t border-border flex justify-end">
          <button v-if="!subStore.isCanceled" @click="showCancelModal = true" class="text-error font-medium hover:underline flex items-center gap-1">
            Hủy gia hạn tự động
          </button>
        </div>
      </section>

      <!-- Quota Info -->
      <section class="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-6">Mức Sử Dụng Dữ Liệu</h2>
        
        <div class="mb-4">
          <div class="flex justify-between items-end mb-2">
            <span class="text-text-primary font-medium">Việc làm đang hiển thị (Active Jobs)</span>
            <span class="text-text-secondary">
              <strong class="text-brand text-lg">{{ subStore.quota.jobsActive }}</strong> 
              <span v-if="!isUnlimited"> / {{ subStore.quota.maxActiveJobs }}</span>
              <span v-else> (Không giới hạn)</span>
            </span>
          </div>
          
          <div v-if="!isUnlimited" class="w-full bg-surface-muted rounded-full h-2.5">
            <div class="bg-brand h-2.5 rounded-full transition-all duration-500" :style="{ width: `${quotaPercent}%` }"></div>
          </div>
          <p v-if="!isUnlimited" class="text-xs text-text-muted mt-2">
            Đã sử dụng {{ quotaPercent.toFixed(0) }}% hạn mức việc làm hiển thị của bạn.
          </p>
        </div>
      </section>
    </div>

    <div class="mt-12">
      <PricingSection 
        is-dashboard 
        :active-plan-code="subStore.activePlanCode" 
        :is-loading="paymentStore.isGlobalLoading"
        @subscribe="handleSubscribe" 
      />
    </div>

    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div class="bg-surface rounded-xl shadow-lg w-full max-w-md p-6 animate-in zoom-in-95">
        <div class="flex items-center gap-3 text-error mb-4">
          <XCircle :size="24" />
          <h3 class="text-lg font-bold">Xác nhận hủy gia hạn</h3>
        </div>
        <p class="text-text-secondary mb-6">
          Gói cước của bạn sẽ không tự động gia hạn. Bạn vẫn có thể sử dụng các tính năng cao cấp cho đến ngày <strong>{{ subStore.quota?.cycleEnd ? new Date(subStore.quota.cycleEnd).toLocaleDateString() : '' }}</strong>.
        </p>
        <div class="flex justify-end gap-3">
          <button type="button" class="btn-secondary" @click="showCancelModal = false">Đóng</button>
          <button type="button" class="px-4 py-2 bg-error text-white font-medium rounded-lg hover:bg-error-dark transition-colors" @click="handleCancel">Xác nhận Hủy</button>
        </div>
      </div>
    </div>

  </div>
</template>
