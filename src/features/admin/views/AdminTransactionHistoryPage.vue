<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Lịch sử giao dịch</h1>
        <p class="text-gray-500 mt-1 text-sm">Theo dõi toàn bộ các giao dịch thanh toán trên hệ thống.</p>
      </div>
    </div>
    
    <div class="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
      <!-- Loading State -->
      <div v-if="isLoading" class="divide-y divide-gray-100">
        <div v-for="i in 5" :key="i" class="p-6 animate-pulse flex items-center justify-between">
          <div class="flex items-center space-x-4 flex-1">
            <div class="h-4 w-1/4 bg-gray-200 rounded"></div>
            <div class="h-4 w-1/4 bg-gray-200 rounded"></div>
            <div class="h-4 w-1/6 bg-gray-200 rounded"></div>
          </div>
          <div class="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-4 border border-red-100">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-gray-900 font-semibold">{{ error }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="transactions.length === 0" class="p-20 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-400 mb-4">
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-gray-500 font-medium">Không tìm thấy giao dịch nào</p>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50/50">
            <tr>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã giao dịch</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mã công ty</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Số tiền</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thời gian</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-gray-50/80 transition-colors">
              <td class="px-8 py-5 whitespace-nowrap">
                <div class="text-sm font-mono text-gray-600 font-medium">{{ tx.id }}</div>
              </td>
              <td class="px-8 py-5 whitespace-nowrap">
                <div class="text-sm text-gray-500 font-medium" :title="tx.companyId">
                  {{ tx.companyId.length > 8 ? tx.companyId.substring(0, 8) + '...' : tx.companyId }}
                </div>
              </td>
              <td class="px-8 py-5 whitespace-nowrap">
                <div class="text-sm font-bold text-gray-900">
                  {{ formatCurrency(tx.amount, tx.currency) }}
                </div>
              </td>
              <td class="px-8 py-5 whitespace-nowrap">
                <span 
                  class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm border"
                  :class="{
                    'bg-emerald-50 text-emerald-700 border-emerald-100': tx.status === 'SUCCESS',
                    'bg-amber-50 text-amber-700 border-amber-100': tx.status === 'PENDING',
                    'bg-red-50 text-red-700 border-red-100': tx.status === 'FAILED'
                  }"
                >
                  {{ formatStatus(tx.status) }}
                </span>
              </td>
              <td class="px-8 py-5 whitespace-nowrap">
                <div class="text-sm text-gray-500 font-medium">{{ formatDateTime(tx.timestamp) }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Transaction {
  id: string
  companyId: string
  amount: number
  currency: string
  status: string
  timestamp: string
}

const props = defineProps<{
  transactions: Transaction[]
  isLoading: boolean
  error: string | null
}>()

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: currency || 'VND' 
  }).format(amount)
}

const formatStatus = (status: string) => {
  switch (status) {
    case 'SUCCESS': return 'Thành công'
    case 'PENDING': return 'Đang xử lý'
    case 'FAILED': return 'Thất bại'
    default: return status
  }
}

const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
