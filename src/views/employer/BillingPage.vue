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
    case 'PAID': return 'status-success'
    case 'PENDING': return 'status-warning'
    case 'CANCELLED':
    case 'FAILED':
    case 'EXPIRED': return 'status-error'
    default: return ''
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
  <div class="billing-page">
    <div class="page-header">
      <h1>Billing History</h1>
      <p class="page-subtitle">View your past transactions and payment activity</p>
    </div>

    <!-- Loading -->
    <div v-if="loading && !transactions" class="loading-state">
      <div class="spinner"></div>
      <p>Loading transactions...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="transactions && transactions.empty" class="empty-state">
      <div class="empty-icon">💳</div>
      <h2>No Transactions Yet</h2>
      <p>Your payment history will appear here after your first subscription.</p>
    </div>

    <!-- Table -->
    <template v-else-if="transactions">
      <div class="table-container">
        <table class="billing-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions.content" :key="tx.orderCode">
              <td class="order-code">#{{ tx.orderCode }}</td>
              <td>{{ formatDate(tx.transactionDateTime) }}</td>
              <td>{{ tx.description ?? '—' }}</td>
              <td class="amount">{{ formatAmount(tx.amount, tx.currency) }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(tx.status)]">
                  {{ tx.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button
          class="page-btn"
          :disabled="transactions.first"
          @click="prevPage"
        >
          ‹ Previous
        </button>
        <span class="page-info">
          Page {{ currentPage + 1 }} of {{ transactions.totalPages }}
        </span>
        <button
          class="page-btn"
          :disabled="transactions.last"
          @click="nextPage"
        >
          Next ›
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.billing-page {
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

/* Loading & Empty */
.loading-state,
.empty-state {
  text-align: center;
  padding: 64px var(--space-4);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
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
}

.loading-state p {
  color: var(--color-text-secondary);
}

/* Table */
.table-container {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.billing-table {
  width: 100%;
  border-collapse: collapse;
}

.billing-table th {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  background: var(--color-bg-page);
  border-bottom: 1px solid var(--color-border);
}

.billing-table td {
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
}

.billing-table tbody tr:last-child td {
  border-bottom: none;
}

.billing-table tbody tr:hover {
  background: var(--color-bg-page);
}

.order-code {
  font-family: monospace;
  font-weight: 500;
}

.amount {
  font-weight: 600;
  white-space: nowrap;
}

.status-badge {
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.status-success {
  background: #dcfce7;
  color: var(--color-success);
}

.status-warning {
  background: #fef9c3;
  color: var(--color-warning);
}

.status-error {
  background: #fee2e2;
  color: var(--color-error);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.page-btn {
  padding: var(--space-2) var(--space-3);
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
</style>
