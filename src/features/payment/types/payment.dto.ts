export interface CheckoutRequest {
  planId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
}

export interface CheckoutResponse {
  checkoutUrl: string;
  orderCode: number;
}

export interface PaymentStatusResponse {
  orderCode: number;
  status: string; // PENDING, PAID, CANCELLED, FAILED, EXPIRED
  planName: string;
  amount: number;
  createdAt: string;
}

export interface TransactionHistoryResponse {
  id: string;
  orderCode: number;
  planName: string;
  amount: number;
  status: string;
  createdAt?: string;
  transactionDateTime?: string; 
  checkoutUrl?: string;
  billingCycle: string;
}

export interface PaginatedData<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  empty: boolean;
  first: boolean;
  last: boolean;
}
