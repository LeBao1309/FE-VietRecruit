<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useAuthStore } from '@/stores/authStore'
import type { BillingCycle } from '@/types/enums'
import type { PlanResponse } from '@/types/subscription'

const router = useRouter()
const subStore = useSubscriptionStore()
const auth = useAuthStore()

const billingCycle = ref<BillingCycle>('MONTHLY')
const checkoutLoading = ref<string | null>(null) // planId being checked out

const sortedPlans = computed(() =>
  [...subStore.plans].sort((a, b) => a.priceMonthly - b.priceMonthly),
)

function getPrice(plan: PlanResponse): number {
  return billingCycle.value === 'YEARLY' ? plan.priceYearly : plan.priceMonthly
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount)
}

function getPeriodLabel(): string {
  return billingCycle.value === 'YEARLY' ? '/year' : '/month'
}

function getSavingsPercent(plan: PlanResponse): number {
  if (plan.priceMonthly === 0) return 0
  const monthlyTotal = plan.priceMonthly * 12
  if (monthlyTotal === 0) return 0
  return Math.round(((monthlyTotal - plan.priceYearly) / monthlyTotal) * 100)
}

async function handleCheckout(plan: PlanResponse): Promise<void> {
  if (!auth.isAuthenticated) {
    await router.push({ name: 'Login', query: { redirect: '/employer/pricing' } })
    return
  }
  checkoutLoading.value = plan.id
  try {
    const checkoutUrl = await subStore.checkout(plan.id, billingCycle.value)
    if (checkoutUrl) {
      window.location.href = checkoutUrl
    }
  } finally {
    checkoutLoading.value = null
  }
}

onMounted(() => {
  subStore.fetchPlans()
})
</script>

<template>
  <div class="pricing-page">
    <!-- Header -->
    <div class="pricing-header">
      <h1>Choose Your Plan</h1>
      <p class="pricing-subtitle">
        Scale your hiring with the right plan. All plans include a free trial period.
      </p>

      <!-- Billing Toggle -->
      <div class="billing-toggle">
        <button
          :class="['toggle-btn', { active: billingCycle === 'MONTHLY' }]"
          @click="billingCycle = 'MONTHLY'"
        >
          Monthly
        </button>
        <button
          :class="['toggle-btn', { active: billingCycle === 'YEARLY' }]"
          @click="billingCycle = 'YEARLY'"
        >
          Yearly
          <span class="save-badge">Save up to 20%</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="subStore.loading && subStore.plans.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Loading plans...</p>
    </div>

    <!-- Plans Grid -->
    <div v-else class="plans-grid">
      <div
        v-for="plan in sortedPlans"
        :key="plan.id"
        :class="['plan-card', { featured: plan.code === 'PROFESSIONAL' }]"
      >
        <div v-if="plan.code === 'PROFESSIONAL'" class="featured-badge">Most Popular</div>

        <div class="plan-header">
          <h2 class="plan-name">{{ plan.name }}</h2>
          <p class="plan-description">{{ plan.description ?? '' }}</p>
        </div>

        <div class="plan-price">
          <span class="price-amount">{{ formatPrice(getPrice(plan), plan.currency) }}</span>
          <span class="price-period">{{ getPeriodLabel() }}</span>
          <div
            v-if="billingCycle === 'YEARLY' && getSavingsPercent(plan) > 0"
            class="savings-label"
          >
            Save {{ getSavingsPercent(plan) }}%
          </div>
        </div>

        <ul class="plan-features">
          <li>
            <span class="feature-icon">✓</span>
            <span>{{ plan.maxActiveJobs }} active job{{ plan.maxActiveJobs !== 1 ? 's' : '' }}</span>
          </li>
          <li>
            <span class="feature-icon">✓</span>
            <span>{{ plan.jobDurationDays }}-day job listings</span>
          </li>
          <li :class="{ disabled: !plan.resumeAccess }">
            <span class="feature-icon">{{ plan.resumeAccess ? '✓' : '—' }}</span>
            <span>Resume database access</span>
          </li>
          <li :class="{ disabled: !plan.aiMatching }">
            <span class="feature-icon">{{ plan.aiMatching ? '✓' : '—' }}</span>
            <span>AI candidate matching</span>
          </li>
          <li :class="{ disabled: !plan.priorityListing }">
            <span class="feature-icon">{{ plan.priorityListing ? '✓' : '—' }}</span>
            <span>Priority job listing</span>
          </li>
        </ul>

        <button
          class="plan-cta"
          :class="{ featured: plan.code === 'PROFESSIONAL' }"
          :disabled="checkoutLoading !== null"
          @click="handleCheckout(plan)"
        >
          <span v-if="checkoutLoading === plan.id" class="spinner-sm"></span>
          <span v-else>Get Started</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pricing-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

.pricing-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.pricing-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}

.pricing-subtitle {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
}

/* Billing Toggle */
.billing-toggle {
  display: inline-flex;
  background: var(--color-bg-page);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 3px;
}

.toggle-btn {
  padding: var(--space-2) var(--space-4);
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.toggle-btn.active {
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.save-badge {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

/* Loading */
.loading-state {
  text-align: center;
  padding: 64px 0;
  color: var(--color-text-secondary);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto var(--space-4);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Plans Grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
  align-items: start;
}

.plan-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.plan-card.featured {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

.featured-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-primary);
  color: #fff;
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.plan-header {
  margin-bottom: var(--space-4);
}

.plan-name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.plan-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Price */
.plan-price {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.price-amount {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.price-period {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-left: 2px;
}

.savings-label {
  font-size: var(--font-size-xs);
  color: var(--color-success);
  font-weight: 600;
  margin-top: var(--space-1);
}

/* Features */
.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.plan-features li.disabled {
  color: var(--color-text-disabled);
}

.feature-icon {
  width: 18px;
  text-align: center;
  font-weight: 600;
  color: var(--color-primary);
  flex-shrink: 0;
}

.plan-features li.disabled .feature-icon {
  color: var(--color-text-disabled);
}

/* CTA */
.plan-cta {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  background: var(--color-bg-surface);
  color: var(--color-text-primary);
  transition: all 0.2s ease;
}

.plan-cta:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.plan-cta.featured {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.plan-cta.featured:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.plan-cta:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-sm {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
</style>
