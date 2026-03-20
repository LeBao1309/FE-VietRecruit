<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { usePaymentStore } from '@/core/stores/payment.store';

const paymentStore = usePaymentStore();
const currentPage = ref(0);
const size = 10;

onMounted(() => {
  fetchPage(0);
});

const fetchPage = (page: number) => {
  currentPage.value = page;
  paymentStore.fetchTransactions(page, size);
};

const transactions = computed(() => paymentStore.transactionsData?.content || []);
const totalPages = computed(() => paymentStore.transactionsData?.totalPages || 0);

const getStatusClass = (status: string) => {
  switch(status) {
    case 'PAID': return 'bg-success-light text-success-dark border-success/20';
    case 'PENDING': return 'bg-warning-light text-warning-dark border-warning/20';
    case 'CANCELLED': 
    case 'FAILED':
    case 'EXPIRED': return 'bg-error-light text-error-dark border-error/20';
    default: return 'bg-surface-muted text-text-secondary border-border';
  }
};
</script>

<template>
  <div class="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="p-6 border-b border-border">
      <h2 class="text-lg font-bold text-text-primary">Lịch Sử Giao Dịch</h2>
      <p class="text-sm text-text-secondary mt-1">Quản lý và theo dõi các giao dịch PayOS của công ty.</p>
    </div>

    <!-- Loading -->
    <div v-if="paymentStore.isLoading && !transactions.length" class="p-12 flex justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
    </div>
    
    <!-- Error -->
    <div v-else-if="paymentStore.error" class="p-8 text-center text-error">
      {{ paymentStore.error }}
    </div>

    <!-- Empty -->
    <div v-else-if="transactions.length === 0" class="p-12 text-center text-text-secondary">
      Không có giao dịch nào được tìm thấy.
    </div>

    <!-- Data Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left text-sm text-text-secondary">
        <thead class="bg-surface-muted text-xs uppercase text-text-muted border-b border-border">
          <tr>
            <th scope="col" class="px-6 py-4 font-semibold whitespace-nowrap">Thời Gian</th>
            <th scope="col" class="px-6 py-4 font-semibold whitespace-nowrap">Mã Đơn / Gói cước</th>
            <th scope="col" class="px-6 py-4 font-semibold whitespace-nowrap text-right">Số Tiền</th>
            <th scope="col" class="px-6 py-4 font-semibold whitespace-nowrap text-center">Trạng Thái</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-surface-muted transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ new Date(tx.transactionDateTime || tx.createdAt || '').toLocaleString('vi-VN') }}
            </td>
            <td class="px-6 py-4">
              <div class="font-medium text-text-primary">{{ tx.orderCode }}</div>
              <div class="text-xs">{{ tx.planName }} ({{ tx.billingCycle === 'YEARLY' ? 'Năm' : 'Tháng' }})</div>
            </td>
            <td class="px-6 py-4 font-mono text-right whitespace-nowrap">
              {{ new Intl.NumberFormat('vi-VN').format(tx.amount) }} đ
            </td>
            <td class="px-6 py-4 text-center">
              <span class="px-2.5 py-1 text-xs font-semibold rounded-full border" :class="getStatusClass(tx.status)">
                {{ tx.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="p-4 border-t border-border flex items-center justify-between">
      <span class="text-sm text-text-secondary">
        Trang {{ currentPage + 1 }} / {{ totalPages }}
      </span>
      <div class="flex gap-2">
        <button 
          @click="fetchPage(currentPage - 1)" 
          :disabled="currentPage === 0"
          class="px-3 py-1 text-sm rounded-md border border-border disabled:opacity-50 hover:bg-surface-muted transition-colors"
        >
          Trước
        </button>
        <button 
          @click="fetchPage(currentPage + 1)" 
          :disabled="currentPage >= totalPages - 1"
          class="px-3 py-1 text-sm rounded-md border border-border disabled:opacity-50 hover:bg-surface-muted transition-colors"
        >
          Sau
        </button>
      </div>
    </div>
  </div>
</template>
