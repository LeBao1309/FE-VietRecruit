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

function formatDate(dateStr: string): string {
 return new Date(dateStr).toLocaleString('en-US', {
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
 <div class="max-w-[960px] mx-auto px-4 py-8">
 <div class="mb-8">
 <h1 class="text-2xl font-bold text-slate-900 ">Billing History</h1>
 <p class="text-sm text-slate-500 mt-1">View your past transactions and payment activity</p>
 </div>

 <!-- Loading -->
 <div v-if="loading && !transactions" class="text-center py-16 px-4 bg-white border border-slate-200 rounded-xl">
 <div class="inline-block w-8 h-8 border-3 border-teal-600/30 border-t-teal-600 rounded-full animate-spin mb-4" />
 <p class="text-slate-500">Loading transactions...</p>
 </div>

 <!-- Empty -->
 <div v-else-if="transactions && transactions.empty" class="text-center py-16 px-4 bg-white border border-slate-200 rounded-xl">
 <div class="text-5xl mb-4">💳</div>
 <h2 class="text-xl font-bold text-slate-900 mb-2">No Transactions Yet</h2>
 <p class="text-slate-500">Your payment history will appear here after your first subscription.</p>
 </div>

 <!-- Table -->
 <template v-else-if="transactions">
 <div class="premium-card overflow-hidden">
 <table class="w-full text-left border-collapse">
 <thead>
 <tr class="bg-slate-50 border-b border-slate-200/60 ">
 <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
 <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
 <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
 <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
 <th class="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
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
 ‹ Previous
 </button>
 <span class="text-sm text-slate-500 font-medium">
 Page {{ currentPage + 1 }} of {{ transactions.totalPages }}
 </span>
 <button
 class="btn-outline px-3 py-1.5 text-sm"
 :disabled="transactions.last"
 @click="nextPage"
 >
 Next ›
 </button>
 </div>
 </template>
 </div>
</template>
