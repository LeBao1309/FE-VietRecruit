// src/features/subscription/types/subscription.dto.ts

export interface SubscriptionResponse {
  id?: string;
  planName?: string;
  planCode?: string;
  status?: string;
  startedAt?: string;
  expiresAt?: string;
  autoRenew?: boolean;
}

export interface QuotaResponse {
  maxActiveJobs?: number;
  jobsActive?: number;
  jobsPosted?: number;
  cycleStart?: string;
  cycleEnd?: string;
}
