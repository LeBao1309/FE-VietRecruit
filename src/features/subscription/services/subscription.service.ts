// src/features/subscription/services/subscription.service.ts
import { apiClient } from '@/core/api/axios.instance';
import type { ApiResponse } from '@/core/types/api.types';
import type { SubscriptionResponse, QuotaResponse } from '../types/subscription.dto';

const BASE = '/vietrecruit/subscriptions';

export const subscriptionService = {
  async getCurrentSubscription(): Promise<SubscriptionResponse> {
    const { data } = await apiClient.get<ApiResponse<SubscriptionResponse>>(`${BASE}/current`);
    return data.data;
  },

  async getCurrentQuota(): Promise<QuotaResponse> {
    const { data } = await apiClient.get<ApiResponse<QuotaResponse>>(`${BASE}/current/quota`);
    return data.data;
  },

  async cancelSubscription(): Promise<void> {
    const { data } = await apiClient.put<ApiResponse<void>>(`${BASE}/current/cancel`);
    return data.data;
  }
};
