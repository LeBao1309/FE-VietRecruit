<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">Platform Companies</h1>
      <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition cursor-pointer">
        Export Data
      </button>
    </div>
    
    <div class="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
      <div v-if="adminStore.isLoading" class="p-12 text-center text-gray-500 animate-pulse">Loading companies...</div>
      <div v-else-if="adminStore.error" class="p-6 text-center text-red-500 bg-red-50 border border-red-100 m-4 rounded">{{ adminStore.error }}</div>
      <table v-else class="min-w-full divide-y border-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company Name</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Domain</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created Date</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="company in adminStore.companies" :key="company.id" class="hover:bg-blue-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ company.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ company.domain || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="company.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                {{ company.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ new Date(company.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="!adminStore.isLoading && adminStore.companies.length === 0" class="p-8 text-center text-gray-500">
        No companies found.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '../stores/admin.store'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchCompanies()
})
</script>
