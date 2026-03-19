<script setup lang="ts">
import { onMounted } from 'vue'
import { useJobBoardStore } from '../stores/job-board.store'
import { jobService } from '../services/job.service'
import JobSearchBar from '../components/JobSearchBar.vue'
import JobCard from '../components/JobCard.vue'

const store = useJobBoardStore()

const fetchJobs = async () => {
  store.isLoading = true
  store.error = null
  try {
    const res = await jobService.listPublicJobs(store.searchParams)
    store.jobs = res.content
    store.totalElements = res.totalElements
    store.totalPages = res.totalPages
  } catch (err) {
    store.error = 'Không thể tải danh sách việc làm.'
  } finally {
    store.isLoading = false
  }
}

const handleSearch = (params: { keyword: string; categoryId?: string; locationId?: string }) => {
  store.searchParams = { 
    ...store.searchParams, 
    keyword: params.keyword,
    categoryId: params.categoryId,
    locationId: params.locationId,
    page: 0
  }
  fetchJobs()
}

const changePage = (newPage: number) => {
  if (newPage < 0 || newPage >= store.totalPages) return
  store.searchParams.page = newPage
  fetchJobs()
}

onMounted(() => {
  fetchJobs()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">Tìm kiếm việc làm mơ ước</h1>
        <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500">Hàng ngàn cơ hội nghề nghiệp đang chờ đón bạn.</p>
      </div>

      <JobSearchBar @search="handleSearch" />

      <div v-if="store.error" class="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-center mb-8 font-medium">
        {{ store.error }}
      </div>

      <div v-if="store.isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white border rounded-lg p-5 shadow-sm h-48 animate-pulse">
          <div class="flex gap-4 mb-4">
            <div class="w-16 h-16 bg-gray-200 rounded"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="h-3 bg-gray-200 rounded w-5/6"></div>
            <div class="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>

      <div v-else-if="store.jobs.length === 0" class="text-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Không tìm thấy việc làm</h3>
        <p class="mt-1 text-sm text-gray-500">Vui lòng thử lại với từ khóa khác.</p>
      </div>

      <div v-else class="space-y-8">
        <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <p class="text-gray-600">Tìm thấy <span class="font-bold text-indigo-600">{{ store.totalElements }}</span> việc làm phù hợp</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <JobCard v-for="job in store.jobs" :key="job.id" :job="job" />
        </div>

        <div v-if="store.totalPages > 1" class="flex justify-center items-center gap-2 mt-12 bg-white py-4 rounded-lg border border-gray-100 shadow-sm">
          <button @click="changePage((store.searchParams.page || 0) - 1)" :disabled="(store.searchParams.page || 0) === 0" class="px-4 py-2 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-medium shadow-sm transition">Trang trước</button>
          <span class="text-gray-600 px-4 font-medium">Trang {{ (store.searchParams.page || 0) + 1 }} / {{ store.totalPages }}</span>
          <button @click="changePage((store.searchParams.page || 0) + 1)" :disabled="(store.searchParams.page || 0) >= store.totalPages - 1" class="px-4 py-2 border rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-700 font-medium shadow-sm transition">Trang sau</button>
        </div>
      </div>

    </div>
  </div>
</template>
