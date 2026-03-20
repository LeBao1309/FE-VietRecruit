<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">Global Transactions</h1>
    </div>
    
    <div class="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
      <div v-if="adminStore.isLoading" class="p-12 text-center text-gray-500 animate-pulse">Scanning ledgers...</div>
      <div v-else-if="adminStore.error" class="p-6 text-center text-red-500 bg-red-50 border border-red-100 m-4 rounded">{{ adminStore.error }}</div>
      <table v-else class="min-w-full divide-y border-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company ID</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="tx in adminStore.transactions" :key="tx.id" class="hover:bg-blue-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{{ tx.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500" :title="tx.companyId">{{ tx.companyId.split('-')[0] }}...</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ new Intl.NumberFormat('vi-VN', { style: 'currency', currency: tx.currency }).format(tx.amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-green-100 text-green-800': tx.status === 'SUCCESS',
                  'bg-yellow-100 text-yellow-800': tx.status === 'PENDING',
                  'bg-red-100 text-red-800': tx.status === 'FAILED'
                }">
                {{ tx.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ new Date(tx.timestamp).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="!adminStore.isLoading && adminStore.transactions.length === 0" class="p-8 text-center text-gray-500">
        No transactions found in the system.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '../stores/admin.store'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchTransactions()
})
</script>
