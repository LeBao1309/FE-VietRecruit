<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">User Moderation</h1>
    </div>
    
    <div class="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
      <div v-if="adminStore.isLoading && adminStore.users.length === 0" class="p-12 text-center text-gray-500 animate-pulse">Loading users...</div>
      <div v-else-if="adminStore.error" class="p-6 text-center text-red-500 bg-red-50 border border-red-100 m-4 rounded">{{ adminStore.error }}</div>
      <table v-else class="min-w-full divide-y border-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-for="user in adminStore.users" :key="user.id" class="hover:bg-blue-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {{ user.fullName.charAt(0).toUpperCase() }}
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.fullName }}</div>
                  <div class="text-sm text-gray-500">{{ user.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700">{{ user.role }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="user.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
                {{ user.isBanned ? 'Banned' : 'Active' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="toggleUser(user.id, user.isBanned)"
                class="transition-colors cursor-pointer disabled:opacity-50"
                :class="user.isBanned ? 'text-indigo-600 hover:text-indigo-900' : 'text-red-600 hover:text-red-900'"
                :disabled="adminStore.isLoading"
              >
                {{ user.isBanned ? 'Unban Account' : 'Ban Account' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="!adminStore.isLoading && adminStore.users.length === 0" class="p-8 text-center text-gray-500">
        No users found.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '../stores/admin.store'

const adminStore = useAdminStore()

onMounted(() => {
  if (adminStore.users.length === 0) {
    adminStore.fetchUsers()
  }
})

const toggleUser = async (id: string, currentBannedState: boolean) => {
  const confirmMessage = currentBannedState 
    ? 'Are you sure you want to unban this user?' 
    : 'Are you sure you want to ban this user? They will be immediately locked out.'
    
  if (confirm(confirmMessage)) {
    await adminStore.toggleUserBan(id, !currentBannedState)
  }
}
</script>
