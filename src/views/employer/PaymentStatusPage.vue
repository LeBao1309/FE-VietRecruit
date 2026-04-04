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
 <h1 class="text-2xl font-extrabold text-slate-900 mb-3">Đang Giao Dịch</h1>
 <p class="text-sm font-medium text-slate-500 mb-6">Xin vui lòng không thoát trang. Giao dịch đang được hạch toán...</p>
 </template>

 <!-- Error -->
 <template v-else-if="error">
 <div class="w-20 h-20 mx-auto bg-rose-50 text-rose-500 flex items-center justify-center rounded-3xl -rotate-3 mb-6 shadow-sm border border-rose-100 text-4xl font-bold">
 ✕
 </div>
 <h1 class="text-2xl font-extrabold text-slate-900 mb-3">Thanh Toán Bị Lỗi</h1>
 <p class="text-sm font-medium text-slate-500 mb-8">{{ error }}</p>
 <button class="btn-primary w-full max-w-[240px]" @click="goToDashboard">Về Trang Chủ</button>
 </template>

 <!-- Status Received -->
 <template v-else-if="status">
 <!-- PAID -->
 <template v-if="status.status === 'PAID'">
 <div class="w-20 h-20 mx-auto bg-emerald-50 text-emerald-500 flex items-center justify-center rounded-3xl rotate-3 mb-6 shadow-sm border border-emerald-100 text-4xl font-bold">
 ✓
 </div>
 <h1 class="text-2xl font-extrabold text-slate-900 mb-3">Thanh Toán Thành Công!</h1>
 <p class="text-sm font-medium text-slate-500 mb-6">
 Gói dịch vụ <strong class="text-slate-900 ">{{ status.planName }}</strong> của bạn đã được gia hạn tự động.
 </p>
 </template>

 <!-- PENDING -->
 <template v-else-if="status.status === 'PENDING'">
 <div class="w-20 h-20 mx-auto bg-teal-50 flex items-center justify-center rounded-3xl mb-6 shadow-sm border border-teal-100 ">
 <div class="inline-block w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
 </div>
 <h1 class="text-2xl font-extrabold text-slate-900 mb-3">Giao Dịch Đang Chờ</h1>
 <p class="text-sm font-medium text-slate-500 mb-6">
 Đang chốt trạng thái ngân hàng. Trang này có khả năng tự reload lại sớm thôi.
 </p>
 </template>

 <!-- CANCELLED / FAILED -->
 <template v-else>
 <div class="w-20 h-20 mx-auto bg-rose-50 text-rose-500 flex items-center justify-center rounded-3xl -rotate-3 mb-6 shadow-sm border border-rose-100 text-4xl font-bold">
 ✕
 </div>
 <h1 class="text-2xl font-extrabold text-slate-900 mb-3">Giao Dịch {{ status.status === 'CANCELLED' ? 'Đã Hủy Tự Động' : 'Thất Bại' }}</h1>
 <p class="text-sm font-medium text-slate-500 mb-6">
 Việc chuyển khoản chưa hoàn tất. Bạn cũng chưa bị trừ tín dụng.
 </p>
 </template>

 <!-- Payment Details -->
 <div class="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8">
 <div class="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
 <span class="text-sm font-bold text-slate-500">Mã Chứng Từ Khớp Lệnh</span>
 <span class="text-sm font-black text-slate-900 ">#{{ status.orderCode }}</span>
 </div>
 <div class="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
 <span class="text-sm font-bold text-slate-500">Gói Kích Hoạt</span>
 <span class="text-sm font-black text-slate-900 ">{{ status.planName }}</span>
 </div>
 <div class="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
 <span class="text-sm font-bold text-slate-500">Thành Tiền</span>
 <span class="text-sm font-black text-slate-900 ">{{ formatAmount(status.amount) }}</span>
 </div>
 <div class="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
 <span class="text-sm font-bold text-slate-500">Trạng Thái</span>
 <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm"
 :class="status.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
 (status.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-rose-50 text-rose-600 border border-rose-200')">
 {{ status.status }}
 </span>
 </div>
 <div class="flex justify-between items-center py-3 border-b border-slate-200 last:border-0">
 <span class="text-sm font-bold text-slate-500">Ngày Tạo</span>
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
 Kiểm Tra Tư Cách Hôi Viên
 </button>
 <button
 v-else
 class="btn-primary"
 @click="goToDashboard"
 >
 Về Lại Không Gian Làm Việc
 </button>
 </div>
 </template>
 </div>
 </div>
</template>
