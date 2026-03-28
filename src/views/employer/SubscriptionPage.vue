<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

const router = useRouter()
const subStore = useSubscriptionStore()
const showCancelConfirm = ref(false)
const cancelling = ref(false)

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { dateStyle: 'medium' })
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'ACTIVE': return 'status-active'
    case 'CANCELLED': return 'status-cancelled'
    case 'EXPIRED': return 'status-expired'
    default: return ''
  }
}

async function confirmCancel(): Promise<void> {
  cancelling.value = true
  try {
    const success = await subStore.cancelSubscription()
    if (success) {
      showCancelConfirm.value = false
    }
  } finally {
    cancelling.value = false
  }
}

function goToPricing(): void {
  router.push('/employer/pricing')
}

function goToBilling(): void {
  router.push('/employer/billing')
}

onMounted(async () => {
  await Promise.all([
    subStore.fetchCurrentSubscription(),
    subStore.fetchCurrentQuota(),
  ])
})
</script>

<template>
  <div class="subscription-page">
    <div class="page-header">
      <h1>Subscription</h1>
      <p class="page-subtitle">Manage your plan and usage</p>
    </div>

    <!-- No Subscription -->
    <div v-if="!subStore.currentSubscription" class="empty-state">
      <div class="empty-icon">📋</div>
      <h2>No Active Subscription</h2>
      <p>Choose a plan to start posting jobs and managing candidates.</p>
      <button class="btn-primary" @click="goToPricing">View Plans</button>
    </div>

    <!-- Active Subscription -->
    <template v-else>
      <!-- Plan Info Card -->
      <div class="info-grid">
        <div class="info-card">
          <div class="info-card-header">
            <h2>Current Plan</h2>
            <span :class="['status-badge', getStatusClass(subStore.currentSubscription.status)]">
              {{ subStore.currentSubscription.status }}
            </span>
          </div>
          <div class="plan-info">
            <div class="plan-name-large">{{ subStore.currentSubscription.planName }}</div>
            <div class="plan-dates">
              <div class="date-row">
                <span class="date-label">Started</span>
                <span class="date-value">{{ formatDate(subStore.currentSubscription.startedAt) }}</span>
              </div>
              <div class="date-row">
                <span class="date-label">Expires</span>
                <span class="date-value">{{ formatDate(subStore.currentSubscription.expiresAt) }}</span>
              </div>
              <div class="date-row">
                <span class="date-label">Auto-Renew</span>
                <span class="date-value">{{ subStore.currentSubscription.autoRenew ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>
          <div class="card-actions">
            <button v-if="subStore.currentSubscription.status === 'ACTIVE'" class="btn-outline btn-danger" @click="showCancelConfirm = true">
              Cancel Subscription
            </button>
            <button class="btn-outline" @click="goToPricing">
              Change Plan
            </button>
          </div>
        </div>

        <!-- Quota Card -->
        <div v-if="subStore.currentQuota" class="info-card">
          <div class="info-card-header">
            <h2>Usage</h2>
          </div>
          <div class="quota-section">
            <div class="quota-item">
              <div class="quota-label">
                <span>Active Jobs</span>
                <span class="quota-count">
                  {{ subStore.currentQuota.jobsActive }} / {{ subStore.currentQuota.maxActiveJobs }}
                </span>
              </div>
              <div class="quota-bar">
                <div
                  class="quota-bar-fill"
                  :class="{ full: subStore.isQuotaFull }"
                  :style="{ width: `${subStore.quotaUsagePercent}%` }"
                ></div>
              </div>
              <p v-if="subStore.isQuotaFull" class="quota-warning">
                Quota full — upgrade your plan to publish more jobs.
              </p>
            </div>

            <div class="quota-stats">
              <div class="stat-item">
                <div class="stat-value">{{ subStore.currentQuota.jobsPosted }}</div>
                <div class="stat-label">Total Jobs Posted</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ subStore.currentQuota.maxActiveJobs }}</div>
                <div class="stat-label">Max Active Jobs</div>
              </div>
            </div>

            <div class="quota-cycle">
              <span class="date-label">Billing Cycle:</span>
              <span class="date-value">
                {{ formatDate(subStore.currentQuota.cycleStart) }} — {{ formatDate(subStore.currentQuota.cycleEnd) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="quick-links">
        <button class="link-card" @click="goToBilling">
          <span class="link-icon">📄</span>
          <span>
            <strong>Billing History</strong>
            <small>View past transactions</small>
          </span>
          <span class="link-arrow">›</span>
        </button>
        <button class="link-card" @click="goToPricing">
          <span class="link-icon">📊</span>
          <span>
            <strong>Compare Plans</strong>
            <small>See all available plans</small>
          </span>
          <span class="link-arrow">›</span>
        </button>
      </div>
    </template>

    <!-- Cancel Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showCancelConfirm" class="modal-overlay" @click.self="showCancelConfirm = false">
        <div class="modal">
          <h2>Cancel Subscription?</h2>
          <p>
            Your plan will remain active until the end of the current billing period.
            After that, you will lose access to premium features.
          </p>
          <div class="modal-actions">
            <button class="btn-outline" @click="showCancelConfirm = false">Keep Plan</button>
            <button class="btn-danger" :disabled="cancelling" @click="confirmCancel">
              <span v-if="cancelling" class="spinner-sm"></span>
              <span v-else>Yes, Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.subscription-page {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
}

.page-header {
  margin-bottom: var(--space-6);
}

.page-header h1 {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
}

.page-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--space-1);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 64px var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--space-4);
}

.empty-state h2 {
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-2);
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.info-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.info-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.info-card-header h2 {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Status Badges */
.status-badge {
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.status-active {
  background: #dcfce7;
  color: var(--color-success);
}

.status-cancelled {
  background: #fef9c3;
  color: var(--color-warning);
}

.status-expired {
  background: #fee2e2;
  color: var(--color-error);
}

/* Plan Info */
.plan-name-large {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-4);
}

.plan-dates {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.date-row {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
}

.date-label {
  color: var(--color-text-secondary);
}

.date-value {
  font-weight: 500;
  color: var(--color-text-primary);
}

.card-actions {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: var(--space-3);
}

/* Quota */
.quota-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.quota-label {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.quota-count {
  font-weight: 600;
}

.quota-bar {
  height: 8px;
  background: var(--color-bg-page);
  border-radius: 4px;
  overflow: hidden;
}

.quota-bar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.quota-bar-fill.full {
  background: var(--color-error);
}

.quota-warning {
  font-size: var(--font-size-xs);
  color: var(--color-error);
  margin-top: var(--space-1);
}

.quota-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.stat-item {
  background: var(--color-bg-page);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.quota-cycle {
  font-size: var(--font-size-sm);
  display: flex;
  gap: var(--space-2);
}

/* Quick Links */
.quick-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .quick-links {
    grid-template-columns: 1fr;
  }
}

.link-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease;
  width: 100%;
}

.link-card:hover {
  border-color: var(--color-primary);
}

.link-icon {
  font-size: 24px;
}

.link-card strong {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.link-card small {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.link-arrow {
  margin-left: auto;
  font-size: 20px;
  color: var(--color-text-disabled);
}

/* Buttons */
.btn-primary {
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-outline {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-outline.btn-danger {
  color: var(--color-error);
  border-color: var(--color-error);
}

.btn-outline.btn-danger:hover {
  background: #fee2e2;
}

.btn-danger {
  padding: var(--space-2) var(--space-4);
  background: var(--color-error);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-bg-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  max-width: 420px;
  width: 90%;
}

.modal h2 {
  font-size: var(--font-size-md);
  margin-bottom: var(--space-3);
}

.modal p {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-6);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
}

.spinner-sm {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
