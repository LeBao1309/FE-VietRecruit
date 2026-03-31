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
    case 'PAID': return 'st-success'
    case 'PENDING': return 'st-warning'
    case 'CANCELLED':
    case 'FAILED':
    case 'EXPIRED': return 'st-error'
    default: return ''
  }
}

const totalPages = computed(() => admin.transactions?.totalPages ?? 0)

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="admin-tx-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Transaction History</h1>
        <p class="page-subtitle">
          {{ admin.transactions?.totalElements ?? 0 }} transactions across the platform
        </p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-group">
        <label>Company ID</label>
        <input
          v-model="companyIdFilter"
          type="text"
          placeholder="Filter by Company UUID…"
          class="filter-input"
          @keyup.enter="applyFilter"
        />
      </div>
      <div class="filter-actions">
        <button class="btn-filter" @click="applyFilter">Apply</button>
        <button v-if="companyIdFilter" class="btn-clear" @click="clearFilter">Clear</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="admin.transactionLoading && !admin.transactions" class="loading-state">
      <div class="spinner"></div>
      <p>Loading transactions…</p>
    </div>

    <!-- Empty -->
    <div v-else-if="admin.transactions && admin.transactions.empty" class="empty-state">
      <div class="empty-icon">💳</div>
      <h2>No Transactions Found</h2>
      <p v-if="companyIdFilter">No results for this Company ID. Try clearing the filter.</p>
      <p v-else>Transaction records will appear here once payments are processed.</p>
    </div>

    <!-- Table -->
    <template v-else-if="admin.transactions">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Account Name</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in admin.transactionList" :key="tx.orderCode">
              <td class="mono-cell">#{{ tx.orderCode }}</td>
              <td class="date-cell">{{ formatDate(tx.transactionDateTime) }}</td>
              <td>{{ tx.counterAccountName ?? '—' }}</td>
              <td class="desc-cell">{{ tx.description ?? '—' }}</td>
              <td class="amount-cell">{{ formatAmount(tx.amount, tx.currency) }}</td>
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
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="admin.transactions.first"
          @click="fetchData(currentPage - 1)"
        >
          ‹ Previous
        </button>
        <span class="page-info">
          Page {{ currentPage + 1 }} of {{ totalPages }}
          · {{ admin.transactions.totalElements }} total
        </span>
        <button
          class="page-btn"
          :disabled="admin.transactions.last"
          @click="fetchData(currentPage + 1)"
        >
          Next ›
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ═══ Page ═══ */
.admin-tx-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
}

.page-header { margin-bottom: 20px; }

.page-header h1 {
  font-size: 1.375rem;
  font-weight: 700;
  color: #111827;
}

.page-subtitle {
  font-size: 0.8125rem;
  color: #6b7280;
  margin-top: 4px;
}

/* ═══ Filter ═══ */
.filter-bar {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  max-width: 400px;
}

.filter-group label {
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
}

.filter-input {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #111827;
  outline: none;
  transition: border-color 0.2s;
}
.filter-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 140, 140, 0.08);
}

.filter-actions { display: flex; gap: 8px; }

.btn-filter {
  padding: 8px 16px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-filter:hover { background: var(--color-primary-hover); }

.btn-clear {
  padding: 8px 16px;
  background: transparent;
  color: #6b7280;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: border-color 0.2s;
}
.btn-clear:hover { border-color: #9ca3af; }

/* ═══ Loading / Empty ═══ */
.loading-state, .empty-state {
  text-align: center;
  padding: 64px 24px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h2 { font-size: 1.125rem; margin-bottom: 8px; }
.empty-state p, .loading-state p { color: #6b7280; }

/* ═══ Table ═══ */
.table-container {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid var(--color-border);
}

.data-table td {
  padding: 12px 16px;
  font-size: 0.8125rem;
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: #f9fafb; }

.mono-cell {
  font-family: ui-monospace, monospace;
  font-weight: 500;
  font-size: 0.75rem !important;
}

.date-cell {
  white-space: nowrap;
  color: #6b7280 !important;
  font-size: 0.75rem !important;
}

.desc-cell {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #6b7280 !important;
}

.amount-cell {
  font-weight: 600;
  white-space: nowrap;
}

/* ═══ Status ═══ */
.status-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 9999px;
  white-space: nowrap;
}

.st-success { background: #dcfce7; color: #15803d; }
.st-warning { background: #fef9c3; color: #a16207; }
.st-error { background: #fee2e2; color: #dc2626; }

/* ═══ Pagination ═══ */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.page-btn {
  padding: 8px 14px;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #374151;
  cursor: pointer;
  transition: border-color 0.2s;
}
.page-btn:hover:not(:disabled) { border-color: var(--color-primary); color: var(--color-primary); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.page-info { font-size: 0.8125rem; color: #6b7280; }
</style>
