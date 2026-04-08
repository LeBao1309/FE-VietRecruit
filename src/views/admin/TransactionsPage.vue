<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores/adminStore'

const admin = useAdminStore()

// ── Pagination ──
const currentPage = ref(0)
const pageSize = 20

// ── Filter ──
const companyIdFilter = ref('')

async function fetchData(page = 0): Promise<void> {
 currentPage.value = page
 await admin.fetchTransactions(
 page,
 pageSize,
 companyIdFilter.value.trim() || undefined,
 )
}

function applyFilter(): void {
 fetchData(0)
}

function clearFilter(): void {
 companyIdFilter.value = ''
 fetchData(0)
}

// ── Helpers ──
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
 case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-200 '
 case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200 '
 case 'CANCELLED':
 case 'FAILED':
 case 'EXPIRED': return 'bg-rose-50 text-rose-600 border-rose-200 '
 default: return 'bg-slate-50 text-slate-600 border-slate-200 '
 }
}

const totalPages = computed(() => admin.transactions?.totalPages ?? 0)

onMounted(() => {
 fetchData()
})
</script>

<template>
 <div class="max-w-6xl mx-auto px-6 py-10">
 <!-- Header -->
 <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
 <div>
 <h1 class="text-2xl font-extrabold text-slate-900 ">Lịch Sử Giao Dịch</h1>
 <p class="text-sm font-medium text-slate-500 mt-1">
 Tổng {{ admin.transactions?.totalElements ?? 0 }} giao dịch trên hệ thống
 </p>
 </div>
 </div>

 <!-- Filter Bar -->
 <div class="premium-card p-5 mb-8 flex flex-col sm:flex-row flex-wrap items-end gap-4 overflow-visible">
 <div class="flex-1 min-w-[200px] w-full max-w-[400px]">
 <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">ID Công Ty</label>
 <div class="relative">
 <input
 v-model="companyIdFilter"
 type="text"
 placeholder="Lọc theo ID…"
 class="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
 @keyup.enter="applyFilter"
 />
 </div>
 </div>
 <div class="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
 <button class="btn-primary py-3 px-6 flex-1 sm:flex-none" @click="applyFilter">Áp Dụng</button>
 <button v-if="companyIdFilter" class="px-5 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 :bg-slate-700 transition-colors flex-1 sm:flex-none" @click="clearFilter">Xóa Bộ Lọc</button>
 </div>
 </div>

 <!-- Loading -->
 <div v-if="admin.transactionLoading && !admin.transactions" class="py-24 flex flex-col items-center justify-center text-center">
 <div class="w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
 <p class="text-sm font-bold text-slate-500">Đang tải dữ liệu…</p>
 </div>

 <!-- Empty -->
 <div v-else-if="admin.transactions && admin.transactions.empty" class="premium-card p-16 text-center">
 <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-3xl mx-auto mb-4">
 💳
 </div>
 <h2 class="text-lg font-bold text-slate-900 mb-2">Không Tìm Thấy Giao Dịch</h2>
 <p class="text-sm font-medium text-slate-500" v-if="companyIdFilter">Không có giao dịch nào phù hợp với ID đã lọc.</p>
 <p class="text-sm font-medium text-slate-500" v-else>Hệ thống chưa ghi nhận giao dịch nào.</p>
 </div>

 <!-- Table -->
 <template v-else-if="admin.transactions">
 <div class="premium-card overflow-hidden">
 <div class="overflow-x-auto">
 <table class="w-full text-left border-collapse whitespace-nowrap">
 <thead>
 <tr class="bg-slate-50/50 border-b border-slate-200 ">
 <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">Mã Giao Dịch</th>
 <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">Thời Gian</th>
 <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">Người Gửi</th>
 <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left max-w-xs">Nội Dung</th>
 <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Số Tiền</th>
 <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">Trạng Thái</th>
 </tr>
 </thead>
 <tbody>
 <tr v-for="tx in admin.transactionList" :key="tx.orderCode" class="border-b border-slate-100 hover:bg-slate-50 :bg-slate-800/50 transition-colors group">
 <td class="px-6 py-4">
 <span class="font-mono text-xs font-extrabold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">#{{ tx.orderCode }}</span>
 </td>
 <td class="px-6 py-4 text-xs font-medium text-slate-500">{{ formatDate(tx.transactionDateTime) }}</td>
 <td class="px-6 py-4 text-sm font-bold text-slate-900 ">{{ tx.counterAccountName ?? '—' }}</td>
 <td class="px-6 py-4 text-xs font-medium text-slate-500 max-w-xs truncate" :title="tx.description ?? ''">{{ tx.description ?? '—' }}</td>
 <td class="px-6 py-4 text-sm font-extrabold text-slate-900 text-right">{{ formatAmount(tx.amount, tx.currency) }}</td>
 <td class="px-6 py-4">
 <span :class="['inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border', getStatusClass(tx.status)]">
 {{ tx.status }}
 </span>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 <!-- Pagination -->
 <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 ">
 <span class="text-sm font-bold text-slate-500 order-2 sm:order-1">
 Trang {{ currentPage + 1 }} / {{ totalPages }} <span class="mx-1 text-slate-300 ">·</span> Tổng số giao dịch: {{ admin.transactions.totalElements }}
 </span>
 <div class="flex items-center gap-2 order-1 sm:order-2">
 <button
 class="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 :bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
 :disabled="admin.transactions.first"
 @click="fetchData(currentPage - 1)"
 >
 &larr; Trang Trước
 </button>
 <button
 class="px-4 py-2 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 :bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
 :disabled="admin.transactions.last"
 @click="fetchData(currentPage + 1)"
 >
 Trang Sau &rarr;
 </button>
 </div>
 </div>
 </template>
 </div>
</template>
