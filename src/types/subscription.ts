import type { BillingCycle } from './enums'

// ── Plan ─────────────────────────────────────────────────────────────
export interface PlanResponse {
  id: string
  code: string
  name: string
  description: string | null
  maxActiveJobs: number
  jobDurationDays: number
  resumeAccess: boolean
  aiMatching: boolean
  priorityListing: boolean
  priceMonthly: number
  priceYearly: number
  currency: string
}

// ── Subscription ─────────────────────────────────────────────────────
export interface SubscriptionResponse {
  id: string
  planName: string
  planCode: string
  status: string
  startedAt: string
  expiresAt: string
  autoRenew: boolean
}

export interface QuotaResponse {
  maxActiveJobs: number
  jobsActive: number
  jobsPosted: number
  cycleStart: string
  cycleEnd: string
}

// ── Payment ──────────────────────────────────────────────────────────
export interface CheckoutRequest {
  planId: string
  billingCycle: BillingCycle
}

export interface CheckoutResponse {
  checkoutUrl: string
  orderCode: number
}

export interface PaymentStatusResponse {
  orderCode: number
  status: string
  planName: string
  amount: number
  createdAt: string
}

export interface TransactionHistoryResponse {
  counterAccountName: string | null
  transactionDateTime: string
  description: string | null
  amount: number
  currency: string
  status: string
  orderCode: number
}
