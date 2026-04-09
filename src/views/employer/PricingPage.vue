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

const billingCycle = ref<BillingCycle>('YEARLY')
const checkoutLoading = ref<string | null>(null) // planId being checked out

const FALLBACK_PLANS: PlanResponse[] = [
  {
    id: 'plan-free',
    code: 'FREE',
    name: 'Free',
    description: 'Ideal for getting started with basic recruitment.',
    maxActiveJobs: 2,
    jobDurationDays: 30,
    resumeAccess: false,
    aiMatching: false,
    priorityListing: false,
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'VND',
  },
  {
    id: 'plan-basic',
    code: 'BASIC',
    name: 'Basic',
    description: 'For small and medium-sized businesses seeking efficient recruitment.',
    maxActiveJobs: 5,
    jobDurationDays: 45,
    resumeAccess: true,
    aiMatching: false,
    priorityListing: false,
    priceMonthly: 299000,
    priceYearly: 0, // computed by getYearlyPrice (20% off)
    currency: 'VND',
  },
  {
    id: 'plan-professional',
    code: 'PROFESSIONAL',
    name: 'Professional',
    description: 'Optimized for fast-growing businesses with high-volume hiring needs.',
    maxActiveJobs: 20,
    jobDurationDays: 60,
    resumeAccess: true,
    aiMatching: true,
    priorityListing: true,
    priceMonthly: 799000,
    priceYearly: 0, // computed by getYearlyPrice (20% off)
    currency: 'VND',
  },
]

const activePlans = computed(() =>
  subStore.plans.length > 0 ? subStore.plans : FALLBACK_PLANS,
)

const sortedPlans = computed(() =>
  [...activePlans.value].sort((a, b) => a.priceMonthly - b.priceMonthly),
)

function getYearlyPrice(plan: PlanResponse): number {
 // If BE hasn't set priceYearly (0 or same as monthly*12), fall back to 20% off
 if (!plan.priceYearly || plan.priceYearly >= plan.priceMonthly * 12) {
  return Math.round(plan.priceMonthly * 12 * 0.8)
 }
 return plan.priceYearly
}

function getPrice(plan: PlanResponse): number {
 return billingCycle.value === 'YEARLY' ? getYearlyPrice(plan) : plan.priceMonthly
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
 const yearlyPrice = getYearlyPrice(plan)
 return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100)
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
 <div class="max-w-6xl mx-auto px-6 pb-12">
 <!-- Header -->
 <div class="text-center mb-12">
 <h1 class="text-4xl font-extrabold text-slate-900 mb-4">Subscription Plans</h1>
 <p class="text-lg font-medium text-slate-500 mb-8 max-w-2xl mx-auto">
 Choose a plan that fits your needs. A trial is available for all cases.
 </p>

 <!-- Billing Toggle -->
 <div class="inline-flex items-center bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200 ">
 <button
 class="px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 block"
 :class="billingCycle === 'MONTHLY' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5 ' : 'text-slate-500 hover:text-slate-900 :text-white'"
 @click="billingCycle = 'MONTHLY'"
 >
 Monthly
 </button>
 <button
 class="px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2"
 :class="billingCycle === 'YEARLY' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5 ' : 'text-slate-500 hover:text-slate-900 :text-white'"
 @click="billingCycle = 'YEARLY'"
 >
 Annually
 <span class="text-[10px] uppercase font-black tracking-wider bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Save 20%</span>
 </button>
 </div>
 </div>

 <!-- Loading -->
 <div v-if="subStore.loading && subStore.plans.length === 0" class="py-20 text-center text-slate-500">
 <div class="inline-block w-8 h-8 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mb-4" />
 <p class="font-medium">Loading pricing table...</p>
 </div>

 <!-- Plans Grid -->
 <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative z-0">
 <div
 v-for="plan in sortedPlans"
 :key="plan.id"
 class="premium-card relative flex flex-col p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
 :class="plan.code === 'PROFESSIONAL' ? 'border-2 border-teal-500 shadow-lg md:-mt-4 bg-white ' : 'border border-slate-200 bg-slate-50/50 '"
 >
 <div v-if="plan.code === 'PROFESSIONAL'" class="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-teal-500 text-white text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-sm">
 Most Popular
 </div>

 <div class="mb-6">
 <h2 class="text-2xl font-extrabold text-slate-900 mb-2">{{ plan.name }}</h2>
 <p class="text-sm font-medium text-slate-500 min-h-[40px]">{{ plan.description ?? '' }}</p>
 </div>

 <div class="mb-8 pb-6 border-b border-slate-200 ">
 <div
 v-if="billingCycle === 'YEARLY' && plan.priceMonthly > 0"
 class="text-sm font-medium text-slate-400 line-through mb-1"
 >
 {{ formatPrice(plan.priceMonthly * 12, plan.currency) }}/year
 </div>
 <div class="flex items-baseline gap-1">
 <span class="text-4xl font-black text-slate-900 tabular-nums tracking-tight">{{ formatPrice(getPrice(plan), plan.currency) }}</span>
 <span class="text-sm font-bold text-slate-400">{{ getPeriodLabel() }}</span>
 </div>
 <div
 v-if="billingCycle === 'YEARLY' && plan.priceMonthly > 0"
 class="mt-2 text-sm font-bold text-emerald-500"
 >
 Save {{ getSavingsPercent(plan) }}%
 </div>
 <div v-else class="mt-2 h-5 visible"></div>
 </div>

 <ul class="flex-1 flex flex-col gap-4 mb-8">
 <li class="flex items-start gap-3 text-sm font-bold text-slate-700 ">
 <span class="text-teal-500 font-black shrink-0 mt-0.5">✓</span>
 <span>Up to {{ plan.maxActiveJobs }} simultaneous active job listings</span>
 </li>
 <li class="flex items-start gap-3 text-sm font-bold text-slate-700 ">
 <span class="text-teal-500 font-black shrink-0 mt-0.5">✓</span>
 <span>Listing active for {{ plan.jobDurationDays }} days</span>
 </li>
 <li class="flex items-start gap-3 text-sm font-bold transition-opacity" :class="plan.resumeAccess ? 'text-slate-700 ' : 'text-slate-400 '">
 <span class="font-black shrink-0 mt-0.5" :class="plan.resumeAccess ? 'text-teal-500' : 'text-slate-300 '">{{ plan.resumeAccess ? '✓' : '—' }}</span>
 <span>Browse resumes from a large candidate database</span>
 </li>
 <li class="flex items-start gap-3 text-sm font-bold transition-opacity" :class="plan.aiMatching ? 'text-slate-700 ' : 'text-slate-400 '">
 <span class="font-black shrink-0 mt-0.5" :class="plan.aiMatching ? 'text-teal-500' : 'text-slate-300 '">{{ plan.aiMatching ? '✓' : '—' }}</span>
 <span>AI-powered intelligent candidate matching</span>
 </li>
 <li class="flex items-start gap-3 text-sm font-bold transition-opacity" :class="plan.priorityListing ? 'text-slate-700 ' : 'text-slate-400 '">
 <span class="font-black shrink-0 mt-0.5" :class="plan.priorityListing ? 'text-teal-500' : 'text-slate-300 '">{{ plan.priorityListing ? '✓' : '—' }}</span>
 <span>Priority listing in search results</span>
 </li>
 </ul>

 <button
 class="w-full justify-center transition-all duration-200"
 :class="plan.code === 'PROFESSIONAL' ? 'btn-primary' : 'btn-secondary bg-slate-100 hover:bg-slate-200 border border-slate-200 :bg-slate-700 '"
 :disabled="checkoutLoading !== null"
 @click="handleCheckout(plan)"
 >
 <span v-if="checkoutLoading === plan.id" class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
 <span class="block px-2 text-center" v-else>Subscribe Now</span>
 </button>
 </div>
 </div>
 </div>
</template>


