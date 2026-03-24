<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Danh sách công ty</h1>
        <p class="text-gray-500 mt-1 text-sm">Quản lý và theo dõi các doanh nghiệp sử dụng nền tảng.</p>
      </div>
      <button 
        class="bg-[#009898] hover:bg-[#008686] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm flex items-center space-x-2 cursor-pointer"
        @click="$emit('export')"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Xuất dữ liệu</span>
      </button>
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
          <div class="h-4 w-24 bg-gray-200 rounded"></div>
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
      <div v-else-if="companies.length === 0" class="p-20 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 text-gray-400 mb-4">
          <svg class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p class="text-gray-500 font-medium">Không tìm thấy công ty</p>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50/50">
            <tr>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên công ty</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tên miền</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ngày tạo</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="company in companies" :key="company.id" class="hover:bg-gray-50/80 transition-colors">
              <td class="px-8 py-5 whitespace-nowrap">
                <div class="text-sm font-bold text-gray-900">{{ company.name }}</div>
              </td>
              <td class="px-8 py-5 whitespace-nowrap">
                <div class="text-sm text-gray-500 font-medium">{{ company.domain || 'N/A' }}</div>
              </td>
              <td class="px-8 py-5 whitespace-nowrap">
                <span 
                  class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm border"
                  :class="company.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'"
                >
                  {{ company.status === 'Active' ? 'Hoạt động' : 'Đình chỉ' }}
                </span>
              </td>
              <td class="px-8 py-5 whitespace-nowrap">
                <div class="text-sm text-gray-500 font-medium">{{ formatDate(company.createdAt) }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Company {
  id: string
  name: string
  domain?: string
  createdAt: string
  status: string
}

const props = defineProps<{
  companies: Company[]
  isLoading: boolean
  error: string | null
}>()

defineEmits<{
  export: []
}>()

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
