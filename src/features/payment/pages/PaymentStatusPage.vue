<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePaymentStore } from '@/core/stores/payment.store';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const paymentStore = usePaymentStore();

onMounted(() => {
  const orderCode = route.query.orderCode;
  // Fall back to hash or full query parsing if PayOS modifies URL structure
  if (!orderCode || isNaN(Number(orderCode))) {
    paymentStore.error = "Mã đơn hàng không hợp lệ.";
    return;
  }
  // Zero-Trust Callback verification
  paymentStore.fetchPaymentStatus(Number(orderCode));
});

const isSuccess = computed(() => paymentStore.paymentStatus?.status === 'PAID');
const isPending = computed(() => paymentStore.paymentStatus?.status === 'PENDING');
const isFailed = computed(() => {
  const s = paymentStore.paymentStatus?.status;
  return s === 'CANCELLED' || s === 'FAILED' || s === 'EXPIRED';
});
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center bg-surface p-6">
    <div class="bg-white max-w-md w-full rounded-2xl p-8 border border-border shadow-sm text-center">
      
      <div v-if="paymentStore.isLoading" class="py-12 flex flex-col items-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mb-4"></div>
        <p class="text-text-secondary">Đang xác minh giao dịch...</p>
      </div>
      
      <div v-else-if="paymentStore.error" class="py-8">
        <AlertCircle class="mx-auto text-error w-16 h-16 mb-4" />
        <h2 class="text-xl font-bold text-text-primary mb-2">Lỗi Xác Minh</h2>
        <p class="text-text-secondary mb-8">{{ paymentStore.error }}</p>
        <button @click="router.push('/workspace')" class="btn-primary w-full py-3">Quay lại Workspace</button>
      </div>

      <div v-else-if="paymentStore.paymentStatus">
        <div v-if="isSuccess" class="py-6">
          <CheckCircle2 class="mx-auto text-success-dark bg-success-light rounded-full p-2 w-20 h-20 mb-6" />
          <h2 class="text-2xl font-bold text-text-primary mb-2">Thanh Toán Thành Công!</h2>
          <p class="text-text-secondary mb-6">Gói <strong class="text-brand">{{ paymentStore.paymentStatus.planName }}</strong> của bạn đã được kích hoạt.</p>
        </div>
        
        <div v-else-if="isPending" class="py-6">
          <Clock class="mx-auto text-warning-dark bg-warning-light rounded-full p-2 w-20 h-20 mb-6" />
          <h2 class="text-2xl font-bold text-text-primary mb-2">Đang Xử Lý</h2>
          <p class="text-text-secondary mb-6">Giao dịch của bạn đang được hệ thống xử lý, vui lòng chờ trong giây lát.</p>
        </div>
        
        <div v-else-if="isFailed" class="py-6">
          <XCircle class="mx-auto text-error bg-error-light rounded-full p-2 w-20 h-20 mb-6" />
          <h2 class="text-2xl font-bold text-text-primary mb-2">Thanh Toán Thất Bại</h2>
          <p class="text-text-secondary mb-6">Giao dịch đã bị hủy hoặc hết hạn ({{ paymentStore.paymentStatus.status }}).</p>
        </div>

        <div class="bg-surface-muted rounded-xl p-4 text-left text-sm space-y-3 mb-8">
          <div class="flex justify-between">
            <span class="text-text-muted">Mã đơn hàng:</span>
            <span class="font-medium text-text-primary">{{ paymentStore.paymentStatus.orderCode }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-muted">Số tiền:</span>
            <span class="font-medium text-text-primary">{{ new Intl.NumberFormat('vi-VN').format(paymentStore.paymentStatus.amount) }} đ</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-muted">Thời gian tạo:</span>
            <span class="font-medium text-text-primary">{{ new Date(paymentStore.paymentStatus.createdAt).toLocaleString('vi-VN') }}</span>
          </div>
        </div>

        <button @click="router.push('/workspace')" class="btn-primary w-full py-3 hover:bg-brand-dark transition-colors">
          Quay lại Bảng điều khiển
        </button>
      </div>
      
    </div>
  </div>
</template>
