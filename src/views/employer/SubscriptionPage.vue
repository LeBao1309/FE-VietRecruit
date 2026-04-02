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
 <div class="max-w-5xl mx-auto px-6 py-10">
 <div class="mb-8">
 <h1 class="text-3xl font-extrabold text-slate-900 mb-2">Subscription</h1>
 <p class="text-sm font-medium text-slate-500">Manage your plan and usage</p>
 </div>

 <!-- No Subscription -->
 <div v-if="!subStore.currentSubscription" class="premium-card p-16 text-center">
 <div class="text-5xl mb-6 text-slate-300 ">📋</div>
 <h2 class="text-2xl font-bold text-slate-900 mb-3">No Active Subscription</h2>
 <p class="text-sm font-medium text-slate-500 mb-8 max-w-sm mx-auto">Choose a plan to start posting jobs and managing candidates.</p>
 <button class="btn-primary" @click="goToPricing">View Plans</button>
 </div>

 <!-- Active Subscription -->
 <template v-else>
 <!-- Plan Info Card -->
 <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
 <div class="premium-card p-8 flex flex-col justify-between">
 <div>
 <div class="flex justify-between items-center mb-6">
 <h2 class="text-lg font-bold text-slate-900 ">Current Plan</h2>
 <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm"
 :class="subStore.currentSubscription.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 ' :
 (subStore.currentSubscription.status === 'CANCELLED' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-rose-50 text-rose-600 border border-rose-200')">
 {{ subStore.currentSubscription.status }}
 </span>
 </div>
 
 <div class="mb-2">
 <div class="text-2xl font-black text-teal-600 mb-6">{{ subStore.currentSubscription.planName }}</div>
 <div class="flex flex-col gap-3">
 <div class="flex justify-between items-center text-sm">
 <span class="font-bold text-slate-500">Started</span>
 <span class="font-bold text-slate-900 ">{{ formatDate(subStore.currentSubscription.startedAt) }}</span>
 </div>
 <div class="flex justify-between items-center text-sm">
 <span class="font-bold text-slate-500">Expires</span>
 <span class="font-bold text-slate-900 ">{{ formatDate(subStore.currentSubscription.expiresAt) }}</span>
 </div>
 <div class="flex justify-between items-center text-sm">
 <span class="font-bold text-slate-500">Auto-Renew</span>
 <span class="font-bold text-slate-900 ">{{ subStore.currentSubscription.autoRenew ? 'Yes' : 'No' }}</span>
 </div>
 </div>
 </div>
 </div>
 <div class="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
 <button v-if="subStore.currentSubscription.status === 'ACTIVE'" class="btn-secondary text-rose-600 hover:border-rose-300 hover:bg-rose-50 :bg-rose-900/20 transition-colors" @click="showCancelConfirm = true">
 Cancel Subscription
 </button>
 <button class="btn-primary" @click="goToPricing">
 Change Plan
 </button>
 </div>
 </div>

 <!-- Quota Card -->
 <div v-if="subStore.currentQuota" class="premium-card p-8 flex flex-col justify-between">
 <div>
 <div class="mb-6">
 <h2 class="text-lg font-bold text-slate-900 ">Usage</h2>
 </div>
 
 <div class="flex flex-col gap-6">
 <!-- Progress Bar -->
 <div>
 <div class="flex justify-between items-center text-sm mb-3">
 <span class="font-bold text-slate-600 ">Active Jobs</span>
 <span class="font-black tabular-nums">
 {{ subStore.currentQuota.jobsActive }} <span class="text-slate-400 font-medium">/ {{ subStore.currentQuota.maxActiveJobs }}</span>
 </span>
 </div>
 <div class="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
 <div
 class="h-full rounded-full transition-all duration-500 shadow-sm"
 :class="subStore.isQuotaFull ? 'bg-rose-500' : 'bg-teal-500'"
 :style="{ width: `${subStore.quotaUsagePercent}%` }"
 ></div>
 </div>
 <p v-if="subStore.isQuotaFull" class="text-xs font-bold text-rose-500 mt-2">
 Quota full — upgrade your plan to publish more jobs.
 </p>
 </div>

 <!-- Stats Blocks -->
 <div class="grid grid-cols-2 gap-4">
 <div class="bg-slate-50 rounded-xl p-4 text-center border border-slate-100 ">
 <div class="text-3xl font-black text-teal-600 mb-1 leading-none">{{ subStore.currentQuota.jobsPosted }}</div>
 <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Jobs Posted</div>
 </div>
 <div class="bg-slate-50 rounded-xl p-4 text-center border border-slate-100 ">
 <div class="text-3xl font-black text-slate-700 mb-1 leading-none">{{ subStore.currentQuota.maxActiveJobs }}</div>
 <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Max Active Jobs</div>
 </div>
 </div>
 </div>
 </div>
 
 <div class="mt-8 pt-5 border-t border-slate-100 ">
 <div class="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-sm">
 <span class="font-bold text-slate-500">Billing Cycle:</span>
 <span class="font-bold text-slate-900 ">
 {{ formatDate(subStore.currentQuota.cycleStart) }} — {{ formatDate(subStore.currentQuota.cycleEnd) }}
 </span>
 </div>
 </div>
 </div>
 </div>

 <!-- Quick Links -->
 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
 <button class="bg-white border border-slate-200 hover:border-teal-500 :border-teal-400 p-5 rounded-2xl flex items-center gap-4 text-left transition hover:shadow-md hover:-translate-y-0.5 group" @click="goToBilling">
 <span class="text-3xl shrink-0 group-hover:scale-110 transition-transform">📄</span>
 <span class="flex-1">
 <strong class="block text-sm font-bold text-slate-900 mb-0.5">Billing History</strong>
 <span class="block text-xs font-medium text-slate-500">View past transactions</span>
 </span>
 <span class="text-2xl text-slate-300 group-hover:translate-x-1 transition-transform">›</span>
 </button>
 <button class="bg-white border border-slate-200 hover:border-teal-500 :border-teal-400 p-5 rounded-2xl flex items-center gap-4 text-left transition hover:shadow-md hover:-translate-y-0.5 group" @click="goToPricing">
 <span class="text-3xl shrink-0 group-hover:scale-110 transition-transform">📊</span>
 <span class="flex-1">
 <strong class="block text-sm font-bold text-slate-900 mb-0.5">Compare Plans</strong>
 <span class="block text-xs font-medium text-slate-500">See all available plans</span>
 </span>
 <span class="text-2xl text-slate-300 group-hover:translate-x-1 transition-transform">›</span>
 </button>
 </div>
 </template>

 <!-- Cancel Confirmation Modal -->
 <Teleport to="body">
 <div v-if="showCancelConfirm" class="premium-modal-backdrop">
 <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click.self="showCancelConfirm = false" />
 <div class="premium-modal-content w-full max-w-sm">
 <h2 class="text-xl font-extrabold text-slate-900 mb-3">Cancel Subscription?</h2>
 <p class="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
 Your plan will remain active until the end of the current billing period.
 After that, you will lose access to premium features.
 </p>
 <div class="flex justify-end gap-3">
 <button class="btn-secondary" @click="showCancelConfirm = false">Keep Plan</button>
 <button class="btn-primary bg-rose-600 hover:bg-rose-700 shadow-sm" :disabled="cancelling" @click="confirmCancel">
 <span v-if="cancelling" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 <span v-else>Yes, Cancel</span>
 </button>
 </div>
 </div>
 </div>
 </Teleport>
 </div>
</template>
