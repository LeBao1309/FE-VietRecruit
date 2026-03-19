<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'search', params: { keyword: string; categoryId?: string; locationId?: string }): void
}>()

const keyword = ref('')
const categoryId = ref('')
const locationId = ref('')

const onSearch = () => {
  emit('search', { 
    keyword: keyword.value, 
    categoryId: categoryId.value || undefined, 
    locationId: locationId.value || undefined 
  })
}
</script>

<template>
  <form @submit.prevent="onSearch" class="bg-white p-4 rounded-xl shadow-md flex flex-col md:flex-row gap-4 mb-8 border border-gray-100">
    <div class="flex-1 relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input v-model="keyword" type="text" class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Tìm kiếm việc làm theo tiêu đề, kỹ năng..." />
    </div>

    <!-- For demo, raw inputs. Ideally dropdowns linked to master data API -->
    <div class="w-full md:w-48 relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
      </div>
      <input v-model="locationId" type="text" class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Location ID" />
    </div>

    <div class="w-full md:w-48 relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
      </div>
      <input v-model="categoryId" type="text" class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Category ID" />
    </div>

    <button type="submit" class="w-full md:w-32 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow">
      Tìm kiếm
    </button>
  </form>
</template>
