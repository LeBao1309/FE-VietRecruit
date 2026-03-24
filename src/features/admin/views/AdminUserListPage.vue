<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
        <p class="text-gray-500 mt-1 text-sm">Xem và kiểm soát quyền truy cập của người dùng trên toàn hệ thống.</p>
      </div>
    </div>
    
    <div class="bg-white shadow-sm rounded-2xl overflow-hidden border border-gray-200">
      <!-- Loading State -->
      <div v-if="isLoading" class="divide-y divide-gray-100">
        <div v-for="i in 5" :key="i" class="p-6 animate-pulse flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div class="space-y-2">
              <div class="h-4 w-32 bg-gray-200 rounded"></div>
              <div class="h-3 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div class="h-8 w-24 bg-gray-200 rounded-lg"></div>
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
        <button @click="$emit('retry')" class="mt-4 text-[#009898] font-medium hover:underline">Thử lại</button>
      </div>

      <!-- Empty State -->
      <div v-else-if="users.length === 0" class="p-20 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-400 mb-4">
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p class="text-gray-500 font-medium">Không tìm thấy người dùng</p>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50/50">
            <tr>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Người dùng</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th scope="col" class="px-8 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50/80 transition-colors">
              <td class="px-8 py-5 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-11 w-11 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100 shadow-sm overflow-hidden">
                    <span v-if="!user.avatar">{{ user.fullName.charAt(0).toUpperCase() }}</span>
                    <img v-else :src="user.avatar" :alt="user.fullName" class="h-full w-full object-cover">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-bold text-gray-900">{{ user.fullName }}</div>
                    <div class="text-sm text-gray-500 font-medium">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-8 py-5 whitespace-nowrap">
                <span class="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 uppercase">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-8 py-5 whitespace-nowrap">
                <span 
                  class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm"
                  :class="user.isBanned ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'"
                >
                  {{ user.isBanned ? 'Bị chặn' : 'Hoạt động' }}
                </span>
              </td>
              <td class="px-8 py-5 whitespace-nowrap text-right text-sm">
                <button 
                  @click="handleToggleBan(user)"
                  class="px-4 py-2 rounded-lg font-bold transition-all duration-200 cursor-pointer shadow-sm border"
                  :class="user.isBanned 
                    ? 'text-emerald-700 bg-white border-emerald-200 hover:bg-emerald-50' 
                    : 'text-red-700 bg-white border-red-200 hover:bg-red-50'"
                >
                  {{ user.isBanned ? 'Bỏ chặn' : 'Chặn người dùng' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: string
  email: string
  fullName: string
  role: string
  isBanned: boolean
  avatar?: string
}

const props = defineProps<{
  users: User[]
  isLoading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  toggleBan: [userId: string, currentBanned: boolean]
  retry: []
}>()

const handleToggleBan = (user: User) => {
  const action = user.isBanned ? 'bỏ chặn' : 'chặn'
  const confirmMessage = `Bạn có chắc chắn muốn ${action} người dùng ${user.fullName}?`
  
  if (window.confirm(confirmMessage)) {
    emit('toggleBan', user.id, user.isBanned)
  }
}
</script>
