<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { paymentService } from '@/services/paymentService'
import type { PaymentStatusResponse } from '@/types/subscription'

const route = useRoute()
const router = useRouter()

const status = ref<PaymentStatusResponse | null>(null)
const error = ref<string | null>(null)
const polling = ref(true)

let pollTimer: ReturnType<typeof setInterval> | null = null
let pollCount = 0
const MAX_POLLS = 60 // 5 minutes at 5s intervals

function getOrderCode(): number | null {
  const code = route.query.orderCode as string | undefined
  if (!code) return null
  return parseInt(code, 10)
}

async function pollStatus(): Promise<void> {
  const orderCode = getOrderCode()
  if (!orderCode) {
    error.value = 'No order code provided.'
    polling.value = false
    return
  }

  const result = await paymentService.getPaymentStatus(orderCode)
  if (result.error) {
    error.value = result.error.message
    polling.value = false
    return
  }

  status.value = result.data

  const paymentStatus = result.data?.status
  if (paymentStatus === 'PAID' || paymentStatus === 'CANCELLED' || paymentStatus === 'FAILED') {
    polling.value = false
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  pollCount++
  if (pollCount >= MAX_POLLS) {
    polling.value = false
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function getStatusClass(s: string): string {
  switch (s) {
    case 'PAID': return 'status-success'
    case 'PENDING': return 'status-warning'
    case 'CANCELLED':
    case 'FAILED': return 'status-error'
    default: return ''
  }
}

function goToSubscription(): void {
  router.push('/employer/subscription')
}

function goToDashboard(): void {
  router.push('/employer/dashboard')
}

onMounted(() => {
  pollStatus()
  pollTimer = setInterval(pollStatus, 5000)
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
})
</script>

<template>
  <div class="payment-status-page">
    <div class="status-card">
      <!-- Loading / Polling -->
      <template v-if="polling && !status">
        <div class="status-icon polling">
          <div class="spinner-lg"></div>
        </div>
        <h1>Processing Payment</h1>
        <p class="status-message">Please wait while we confirm your payment...</p>
      </template>

      <!-- Error -->
      <template v-else-if="error">
        <div class="status-icon error">✕</div>
        <h1>Payment Error</h1>
        <p class="status-message">{{ error }}</p>
        <button class="btn-primary" @click="goToDashboard">Go to Dashboard</button>
      </template>

      <!-- Status Received -->
      <template v-else-if="status">
        <!-- PAID -->
        <template v-if="status.status === 'PAID'">
          <div class="status-icon success">✓</div>
          <h1>Payment Successful!</h1>
          <p class="status-message">
            Your <strong>{{ status.planName }}</strong> subscription is now active.
          </p>
        </template>

        <!-- PENDING -->
        <template v-else-if="status.status === 'PENDING'">
          <div class="status-icon pending">
            <div class="spinner-lg"></div>
          </div>
          <h1>Payment Pending</h1>
          <p class="status-message">
            Waiting for payment confirmation. This page will update automatically.
          </p>
        </template>

        <!-- CANCELLED / FAILED -->
        <template v-else>
          <div class="status-icon error">✕</div>
          <h1>Payment {{ status.status === 'CANCELLED' ? 'Cancelled' : 'Failed' }}</h1>
          <p class="status-message">
            Your payment was not completed. No charges have been made.
          </p>
        </template>

        <!-- Payment Details -->
        <div class="payment-details">
          <div class="detail-row">
            <span class="detail-label">Order Code</span>
            <span class="detail-value">#{{ status.orderCode }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Plan</span>
            <span class="detail-value">{{ status.planName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount</span>
            <span class="detail-value">{{ formatAmount(status.amount) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span :class="['status-badge', getStatusClass(status.status)]">
              {{ status.status }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Date</span>
            <span class="detail-value">{{ formatDate(status.createdAt) }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="status-actions">
          <button
            v-if="status.status === 'PAID'"
            class="btn-primary"
            @click="goToSubscription"
          >
            View Subscription
          </button>
          <button
            v-else
            class="btn-primary"
            @click="goToDashboard"
          >
            Go to Dashboard
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.payment-status-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: var(--space-8) var(--space-4);
}

.status-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  text-align: center;
  max-width: 480px;
  width: 100%;
}

.status-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  font-size: 28px;
  font-weight: 700;
}

.status-icon.success {
  background: #dcfce7;
  color: var(--color-success);
}

.status-icon.error {
  background: #fee2e2;
  color: var(--color-error);
}

.status-icon.pending,
.status-icon.polling {
  background: var(--color-primary-light);
}

.spinner-lg {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

h1 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.status-message {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
  line-height: 1.6;
}

/* Payment Details */
.payment-details {
  background: var(--color-bg-page);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
}

.detail-row + .detail-row {
  border-top: 1px solid var(--color-border);
}

.detail-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.detail-value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.status-badge {
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.status-success {
  background: #dcfce7;
  color: var(--color-success);
}

.status-warning {
  background: #fef9c3;
  color: var(--color-warning);
}

.status-error {
  background: #fee2e2;
  color: var(--color-error);
}

/* Actions */
.status-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
}

.btn-primary {
  padding: var(--space-3) var(--space-6);
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}
</style>
