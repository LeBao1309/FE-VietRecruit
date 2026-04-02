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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'PAID': return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
    case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
    case 'CANCELLED':
    case 'FAILED':
    case 'EXPIRED': return 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
    default: return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20'
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
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">Transaction History</h1>
        <p class="text-sm font-medium text-slate-500 mt-1">
          {{ admin.transactions?.totalElements ?? 0 }} transactions across the platform
        </p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="premium-card p-5 mb-8 flex flex-col sm:flex-row flex-wrap items-end gap-4 overflow-visible">
      <div class="flex-1 min-w-[200px] w-full max-w-[400px]">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Company ID</label>
        <div class="relative">
          <input
            v-model="companyIdFilter"
            type="text"
            placeholder="Filter by Company UUID…"
            class="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
            @keyup.enter="applyFilter"
          />
        </div>
      </div>
      <div class="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
        <button class="btn-primary py-3 px-6 flex-1 sm:flex-none" @click="applyFilter">Apply</button>
        <button v-if="companyIdFilter" class="px-5 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex-1 sm:flex-none" @click="clearFilter">Clear</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="admin.transactionLoading && !admin.transactions" class="py-24 flex flex-col items-center justify-center text-center">
      <div class="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-teal-500 dark:border-t-teal-400 rounded-full animate-spin mb-4" />
      <p class="text-sm font-bold text-slate-500">Loading transactions…</p>
    </div>

    <!-- Empty -->
    <div v-else-if="admin.transactions && admin.transactions.empty" class="premium-card p-16 text-center">
      <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-400 text-3xl mx-auto mb-4">
        💳
      </div>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2">No Transactions Found</h2>
      <p class="text-sm font-medium text-slate-500" v-if="companyIdFilter">No results for this Company ID. Try clearing the filter.</p>
      <p class="text-sm font-medium text-slate-500" v-else>Transaction records will appear here once payments are processed.</p>
    </div>

    <!-- Table -->
    <template v-else-if="admin.transactions">
      <div class="premium-card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">Order</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">Date</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">Account Name</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left max-w-xs">Description</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                <th class="px-6 py-4 text-[11px] font-extrabold text-slate-500 uppercase tracking-widest text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in admin.transactionList" :key="tx.orderCode" class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                <td class="px-6 py-4">
                  <span class="font-mono text-xs font-extrabold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">#{{ tx.orderCode }}</span>
                </td>
                <td class="px-6 py-4 text-xs font-medium text-slate-500">{{ formatDate(tx.transactionDateTime) }}</td>
                <td class="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{{ tx.counterAccountName ?? '—' }}</td>
                <td class="px-6 py-4 text-xs font-medium text-slate-500 max-w-xs truncate" :title="tx.description ?? ''">{{ tx.description ?? '—' }}</td>
                <td class="px-6 py-4 text-sm font-extrabold text-slate-900 dark:text-white text-right">{{ formatAmount(tx.amount, tx.currency) }}</td>
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
      <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
        <span class="text-sm font-bold text-slate-500 order-2 sm:order-1">
          Page {{ currentPage + 1 }} of {{ totalPages }} <span class="mx-1 text-slate-300 dark:text-slate-600">·</span> {{ admin.transactions.totalElements }} total
        </span>
        <div class="flex items-center gap-2 order-1 sm:order-2">
          <button
            class="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            :disabled="admin.transactions.first"
            @click="fetchData(currentPage - 1)"
          >
            &larr; Previous
          </button>
          <button
            class="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            :disabled="admin.transactions.last"
            @click="fetchData(currentPage + 1)"
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
