import { defineStore } from 'pinia';
import { ref } from 'vue';
import { paymentService } from '@/features/payment/services/payment.service';
import type { CheckoutRequest, PaymentStatusResponse, TransactionHistoryResponse, PaginatedData } from '@/features/payment/types/payment.dto';

export const usePaymentStore = defineStore('payment', () => {
  const isLoading = ref(false);
  const isGlobalLoading = ref(false); 
  const error = ref<string | null>(null);
  
  const paymentStatus = ref<PaymentStatusResponse | null>(null);
  const transactionsData = ref<PaginatedData<TransactionHistoryResponse> | null>(null);

  async function checkout(planId: string, billingCycle: 'MONTHLY' | 'YEARLY') {
    isGlobalLoading.value = true;
    error.value = null;
    try {
      const request: CheckoutRequest = { planId, billingCycle };
      const response = await paymentService.createCheckout(request);
      
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error('No checkout URL provided by backend.');
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Có lỗi xảy ra khi tạo giao dịch.';
      isGlobalLoading.value = false;
    }
  }

  async function fetchPaymentStatus(orderCode: number) {
    isLoading.value = true;
    error.value = null;
    try {
      paymentStatus.value = await paymentService.getPaymentStatus(orderCode);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không thể lấy trạng thái giao dịch.';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchTransactions(page = 0, size = 10) {
    isLoading.value = true;
    error.value = null;
    try {
      transactionsData.value = await paymentService.getTransactions(page, size);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không thể lấy lịch sử giao dịch.';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    isGlobalLoading,
    error,
    paymentStatus,
    transactionsData,
    checkout,
    fetchPaymentStatus,
    fetchTransactions
  };
});
