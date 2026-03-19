<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMyApplicationsStore } from '../stores/my-applications.store'
import { applicationService } from '../services/application.service'
import ApplicationStatusBadge from '../components/ApplicationStatusBadge.vue'

const store = useMyApplicationsStore()
const router = useRouter()

const fetchApps = async () => {
  store.isLoading = true
  store.error = null
  try {
    const res = await applicationService.listMyApplications({ page: store.page, size: store.size })
    store.applications = res.content
    store.totalElements = res.totalElements
    store.totalPages = res.totalPages
  } catch (err) {
    store.error = 'Không thể tải danh sách ứng tuyển.'
  } finally {
    store.isLoading = false
  }
}

onMounted(() => fetchApps())

const goToDetail = (id: string) => {
  router.push({ name: 'ApplicationDetail', params: { id } })
}

const changePage = (p: number) => {
  if (p >= 0 && p < store.totalPages) {
    store.page = p
    fetchApps()
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Việc làm đã ứng tuyển</h1>
          <p class="mt-2 text-sm text-gray-600">Quản lý và theo dõi trạng thái các đơn ứng tuyển của bạn.</p>
        </div>
        <div class="mt-4 sm:mt-0">
          <button @click="router.push({ name: 'JobBoard' })" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Tìm việc mới
          </button>
        </div>
      </div>

      <div v-if="store.error" class="bg-red-50 text-red-600 rounded-lg p-4 font-medium mb-6 border border-red-200">
        {{ store.error }}
      </div>

      <div class="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div v-if="store.isLoading" class="p-6 space-y-6">
          <div v-for="i in 3" :key="i" class="animate-pulse flex items-center justify-between">
            <div class="flex-1 space-y-4 py-1">
              <div class="h-5 bg-gray-200 rounded w-1/2"></div>
              <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div class="h-6 bg-gray-200 rounded-full w-24"></div>
          </div>
        </div>

        <div v-else-if="store.applications.length === 0" class="p-16 text-center text-gray-500 flex flex-col items-center">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <p class="text-lg font-medium text-gray-900">Chưa có đơn ứng tuyển nào.</p>
          <p class="mt-1 text-sm">Khám phá các việc làm phù hợp và nộp đơn ngay!</p>
        </div>

        <ul v-else role="list" class="divide-y divide-gray-100">
          <li v-for="app in store.applications" :key="app.id">
            <div @click="goToDetail(app.id)" class="px-6 py-5 hover:bg-gray-50 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
              <div class="flex-1 min-w-0 pr-4">
                <h3 class="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition truncate mb-1">{{ app.jobTitle }}</h3>
                <div class="flex flex-wrap items-center text-sm text-gray-500 gap-x-4 gap-y-2">
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span class="font-medium text-gray-700">{{ app.candidateName }}</span>
                  </span>
                  <span class="flex items-center gap-1.5">
                    <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Ngày nộp: {{ new Date(app.createdAt).toLocaleDateString('vi-VN') }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <ApplicationStatusBadge :status="app.status" class="px-3" />
                <svg class="h-5 w-5 text-gray-300 group-hover:text-indigo-500 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </li>
        </ul>

        <div v-if="store.totalPages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm text-gray-700">Trang <span class="font-medium">{{ store.page + 1 }}</span> / {{ store.totalPages }}</span>
          <div class="flex gap-2">
            <button @click="changePage(store.page - 1)" :disabled="store.page === 0" class="px-3 py-1.5 border border-gray-300 hover:bg-white rounded disabled:opacity-50 text-sm font-medium transition shadow-sm">Trang trước</button>
            <button @click="changePage(store.page + 1)" :disabled="store.page >= store.totalPages - 1" class="px-3 py-1.5 border border-gray-300 hover:bg-white rounded disabled:opacity-50 text-sm font-medium transition shadow-sm">Trang sau</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
