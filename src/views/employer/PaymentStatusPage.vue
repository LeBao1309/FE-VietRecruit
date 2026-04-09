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

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('vi-VN', {
 dateStyle: 'medium',
 timeStyle: 'short',
 })
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
 <div class="flex items-center justify-center min-h-[60vh] p-6 lg:p-12">
 <div class="premium-card w-full max-w-lg p-10 text-center">
 <!-- Loading / Polling -->
 <template v-if="polling && !status">
 <div class="w-20 h-20 mx-auto bg-teal-50 flex items-center justify-center rounded-3xl rotate-3 mb-6 shadow-sm border border-teal-100 ">
 <div class="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
 </div>
 <h1 class="text-2xl font-extrabold text-slate-900 mb-3">Processing Transaction</h1>
 <p class="text-sm font-medium text-slate-500 mb-6">Please do not close this page. The transaction is being processed...</p>
 </template>

 <!-- Error -->
 <template v-else-if="error">
 <div class="w-20 h-20 mx-auto bg-rose-50 text-rose-500 flex items-center justify-center rounded-3xl -rotate-3 mb-6 shadow-sm border border-rose-100 text-4xl font-bold">
 ✕
 </div>
 <h1 class="text-2xl font-extrabold text-slate-900 mb-3">Payment Error</h1>
 <p class="text-sm font-medium text-slate-500 mb-8">{{ error }}</p>
 <button class="btn-primary w-full max-w-[240px]" @click="goToDashboard">Go to Home</button>
 </template>

 <!-- Status Received -->
 <template v-else-if="status">
 <!-- PAID -->
 <template v-if="status.status === 'PAID'">
 <div class="w-20 h-20 mx-auto bg-emerald-50 text-emerald-500 flex items-center justify-center rounded-3xl rotate-3 mb-6 shadow-sm border border-emerald-100 text-4xl font-bold">
 ✓
 </div>
 <h1 class="text-2xl font-extrabold text-slate-900 mb-3">Payment Successful!</h1>
 <p class="text-sm font-medium text-slate-500 mb-6">
 Your <strong class="text-slate-900 ">{{ status.planName }}</strong> plan has been activated successfully.
 </p>
 </template>

 <!-- PENDING -->
 <template v-else-if="status.status === 'PENDING'">
 <div class="w-20 h-20 mx-auto bg-teal-50 flex items-center justify-center rounded-3xl mb-6 shadow-sm border border-teal-100 ">
 <div class="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
 </div>
 <h1 class="text-2xl font-extrabold text-slate-900 mb-3">Transaction Pending</h1>
 <p class="text-sm font-medium text-slate-500 mb-6">
 Awaiting bank confirmation. This page will refresh automatically.
 </p>
 </template>

 <!-- CANCELLED / FAILED -->
 <template v-else>
 <div class="w-20 h-20 mx-auto bg-rose-50 text-rose-500 flex items-center justify-center rounded-3xl -rotate-3 mb-6 shadow-sm border border-rose-100 text-4xl font-bold">
 ✕
 </div>
 <h1 class="text-2xl font-extrabold text-slate-900 mb-3">Transaction {{ status.status === 'CANCELLED' ? 'Cancelled' : 'Failed' }}</h1>
 <p class="text-sm font-medium text-slate-500 mb-6">
 The transfer was not completed. No charges have been applied to your account.
 </p>
 </template>

 <!-- Payment Details -->
 <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8">
 <div class="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
 <span class="text-sm font-bold text-slate-500">Transaction Reference</span>
 <span class="text-sm font-black text-slate-900 ">#{{ status.orderCode }}</span>
 </div>
 <div class="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
 <span class="text-sm font-bold text-slate-500">Activated Plan</span>
 <span class="text-sm font-black text-slate-900 ">{{ status.planName }}</span>
 </div>
 <div class="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
 <span class="text-sm font-bold text-slate-500">Total Amount</span>
 <span class="text-sm font-black text-slate-900 ">{{ formatAmount(status.amount) }}</span>
 </div>
 <div class="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
 <span class="text-sm font-bold text-slate-500">Status</span>
 <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm"
 :class="status.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
 (status.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-rose-50 text-rose-600 border border-rose-200')">
 {{ status.status }}
 </span>
 </div>
 <div class="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
 <span class="text-sm font-bold text-slate-500">Created At</span>
 <span class="text-sm font-bold text-slate-900 ">{{ formatDate(status.createdAt) }}</span>
 </div>
 </div>

 <!-- Actions -->
 <div class="flex gap-4 justify-center">
 <button
 v-if="status.status === 'PAID'"
 class="btn-primary"
 @click="goToSubscription"
 >
 View Membership
 </button>
 <button
 v-else
 class="btn-primary"
 @click="goToDashboard"
 >
 Back to Workspace
 </button>
 </div>
 </template>
 </div>
 </div>
</template>
