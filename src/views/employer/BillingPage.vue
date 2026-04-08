<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { paymentService } from '@/services/paymentService'
import type { PageResponse } from '@/types/common'
import type { TransactionHistoryResponse } from '@/types/subscription'

const transactions = ref<PageResponse<TransactionHistoryResponse> | null>(null)
const loading = ref(false)
const currentPage = ref(0)
const pageSize = 20

async function fetchTransactions(page = 0): Promise<void> {
 loading.value = true
 try {
 const result = await paymentService.getTransactions({
 page,
 size: pageSize,
 sort: 'createdAt,DESC',
 })
 if (result.data) {
 transactions.value = result.data
 currentPage.value = page
 }
 } finally {
 loading.value = false
 }
}

function formatAmount(amount: number, currency: string): string {
 return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount)
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('vi-VN', {
 dateStyle: 'medium',
 timeStyle: 'short',
 })
}

function getStatusClass(status: string): string {
 switch (status) {
 case 'PAID': return 'bg-emerald-100 text-emerald-700 '
 case 'PENDING': return 'bg-amber-100 text-amber-700 '
 case 'CANCELLED':
 case 'FAILED':
 case 'EXPIRED': return 'bg-rose-100 text-rose-700 '
 default: return 'bg-slate-100 text-slate-700 '
 }
}

function prevPage(): void {
 if (currentPage.value > 0) {
 fetchTransactions(currentPage.value - 1)
 }
}

function nextPage(): void {
 if (transactions.value && !transactions.value.last) {
 fetchTransactions(currentPage.value + 1)
 }
}

onMounted(() => {
 fetchTransactions()
})
</script>

<template>
 <div class="max-w-[960px] mx-auto px-4 pb-8">
 <div class="mb-8">
 <h1 class="text-2xl font-bold text-slate-900 ">Lịch Sử Thanh Toán</h1>
 <p class="text-sm text-slate-500 mt-1">Xem chi tiết các giao dịch và hoạt động thanh toán của bạn</p>
 </div>

 <!-- Loading -->
 <div v-if="loading && !transactions" class="text-center py-16 px-4 bg-white border border-slate-200 rounded-xl">
 <div class="inline-block w-8 h-8 border-3 border-teal-600/30 border-t-teal-600 rounded-full animate-spin mb-4" />
 <p class="text-slate-500">Đang tải lịch sử giao dịch...</p>
 </div>

 <!-- Empty (API failed or returned empty) -->
 <div v-else-if="!transactions || transactions.empty" class="bg-white border border-slate-200/60 rounded-xl px-6 py-16 text-center">
 <div class="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
 <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
 <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75a2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
 </svg>
 </div>
 <h2 class="text-base font-bold text-slate-800 mb-1">Chưa có giao dịch nào</h2>
 <p class="text-sm text-slate-400 max-w-xs mx-auto">Lịch sử thanh toán sẽ xuất hiện ở đây sau khi bạn đăng ký gói dịch vụ.</p>
 <router-link to="/employer/pricing" class="inline-block mt-5 btn-primary text-sm">
 Xem Gói Dịch Vụ
 </router-link>
 </div>

 <!-- Table -->
 <template v-else-if="transactions">
 <div class="premium-card overflow-hidden">
 <table class="w-full text-left border-collapse">
 <thead>
 <tr class="bg-slate-50 border-b border-slate-200/60 ">
 <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã GD</th>
 <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời Gian</th>
 <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nội Dung</th>
 <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Số Tiền</th>
 <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng Thái</th>
 </tr>
 </thead>
 <tbody>
 <tr v-for="tx in transactions.content" :key="tx.orderCode" class="border-b border-slate-100 last:border-none hover:bg-slate-50 :bg-slate-800/50 transition-colors">
 <td class="py-3 px-4 text-sm font-medium font-mono text-slate-900 ">#{{ tx.orderCode }}</td>
 <td class="py-3 px-4 text-sm text-slate-600 ">{{ formatDate(tx.transactionDateTime) }}</td>
 <td class="py-3 px-4 text-sm text-slate-600 ">{{ tx.description ?? '—' }}</td>
 <td class="py-3 px-4 text-sm font-semibold text-slate-900 whitespace-nowrap">{{ formatAmount(tx.amount, tx.currency) }}</td>
 <td class="py-3 px-4">
 <span 
 class="inline-flex px-2 py-1 text-xs font-semibold rounded-md whitespace-nowrap"
 :class="getStatusClass(tx.status)"
 >
 {{ tx.status }}
 </span>
 </td>
 </tr>
 </tbody>
 </table>
 </div>

 <!-- Pagination -->
 <div v-if="transactions.totalPages > 1" class="flex justify-center items-center gap-4 mt-6">
 <button
 class="btn-outline px-3 py-1.5 text-sm"
 :disabled="transactions.first"
 @click="prevPage"
 >
 ‹ Trang trước
 </button>
 <span class="text-sm text-slate-500 font-medium">
 Trang {{ currentPage + 1 }} / {{ transactions.totalPages }}
 </span>
 <button
 class="btn-outline px-3 py-1.5 text-sm"
 :disabled="transactions.last"
 @click="nextPage"
 >
 Trang sau ›
 </button>
 </div>
 </template>
 </div>
</template>
