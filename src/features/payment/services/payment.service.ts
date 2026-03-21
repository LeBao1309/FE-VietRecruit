import { apiClient } from '@/core/api/axios.instance';
import type { ApiResponse } from '@/core/types/api.types';
import type { 
  CheckoutRequest, 
  CheckoutResponse, 
  PaymentStatusResponse, 
  TransactionHistoryResponse,
  PaginatedData 
} from '../types/payment.dto';

const BASE = '/vietrecruit/payment';

export const paymentService = {
  async createCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post<ApiResponse<CheckoutResponse>>(`${BASE}/checkout`, data);
    return response.data.data;
  },

  async getPaymentStatus(orderCode: number): Promise<PaymentStatusResponse> {
    const response = await apiClient.get<ApiResponse<PaymentStatusResponse>>(`${BASE}/status/${orderCode}`);
    return response.data.data;
  },

  async getTransactions(page = 0, size = 10): Promise<PaginatedData<TransactionHistoryResponse>> {
    const response = await apiClient.get<ApiResponse<PaginatedData<TransactionHistoryResponse>>>(`${BASE}/transactions`, {
      params: { page, size }
    });
    return response.data.data;
  }
};
