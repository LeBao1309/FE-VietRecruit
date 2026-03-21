<script setup lang="ts">
import { getErrorMessage } from '@/core/utils/error'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobBoardStore } from '../stores/job-board.store'
import { jobService } from '../services/job.service'
import ApplyDialog from '../components/ApplyDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useJobBoardStore()

const jobId = route.params.id as string
const isLoading = ref(true)
const error = ref<string | null>(null)
const isApplyDialogOpen = ref(false)

const formatCurrency = (value?: number | null, currency?: string | null) => {
  if (value == null) return ''
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(value)
}

const getSalaryDisplay = (job: any) => {
  if (job.isNegotiable) return 'Thỏa thuận'
  if (job.minSalary && job.maxSalary) return `${formatCurrency(job.minSalary, job.currency)} - ${formatCurrency(job.maxSalary, job.currency)}`
  if (job.minSalary) return `Từ ${formatCurrency(job.minSalary, job.currency)}`
  if (job.maxSalary) return `Đến ${formatCurrency(job.maxSalary, job.currency)}`
  return 'Thỏa thuận'
}

onMounted(async () => {
  if (!jobId) {
    router.replace({ name: 'JobBoard' })
    return
  }
  
  isLoading.value = true
  try {
    store.selectedJob = await jobService.getPublicJob(jobId)
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    isLoading.value = false
  }
})

const goBack = () => router.back()
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <button @click="goBack" class="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition">
        <svg class="mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Quay lại
      </button>

      <div v-if="isLoading" class="animate-pulse space-y-6">
        <div class="h-48 bg-gray-200 rounded-xl w-full"></div>
        <div class="h-64 bg-gray-200 rounded-xl w-full"></div>
      </div>

      <div v-else-if="error" class="bg-red-50 text-red-600 rounded-lg p-6 text-center border border-red-200 font-medium">
        {{ error }}
      </div>

      <div v-else-if="store.selectedJob" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-6 items-start justify-between">
          <div class="flex items-start gap-6">
            <div class="w-24 h-24 bg-gray-50 border rounded-lg overflow-hidden flex-shrink-0">
              <img v-if="store.selectedJob.companyLogoUrl" :src="store.selectedJob.companyLogoUrl" class="w-full h-full object-cover" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ store.selectedJob.title }}</h1>
              <p class="text-lg text-indigo-600 font-medium mt-1">{{ store.selectedJob.companyName }}</p>
              
              <div class="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <span class="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded text-gray-700 font-medium">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {{ getSalaryDisplay(store.selectedJob) }}
                </span>
                <span class="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded text-gray-700 font-medium">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {{ store.selectedJob.locationName || 'Không xác định' }}
                </span>
                <span v-if="store.selectedJob.workingHours" class="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded text-gray-700 font-medium">
                  <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {{ store.selectedJob.workingHours }}
                </span>
              </div>
            </div>
          </div>
          <div class="w-full md:w-auto mt-4 md:mt-0">
            <button @click="isApplyDialogOpen = true" class="w-full md:w-auto bg-indigo-600 text-white font-medium py-3 px-8 rounded-lg shadow-sm hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 whitespace-nowrap">
              Ứng tuyển ngay
            </button>
            <p v-if="store.selectedJob.deadline" class="text-xs text-center text-gray-500 mt-3">
              Hạn nộp: <span class="font-medium text-red-600">{{ new Date(store.selectedJob.deadline).toLocaleDateString('vi-VN') }}</span>
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div class="lg:col-span-2 space-y-6">
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 prose max-w-none">
              <h2 class="text-xl font-bold text-gray-900 border-b pb-4 mb-6">Mô tả công việc</h2>
              <div v-html="store.selectedJob.description" class="text-gray-700 leading-relaxed whitespace-pre-wrap"></div>
            </div>
            <div v-if="store.selectedJob.requirements" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 prose max-w-none">
              <h2 class="text-xl font-bold text-gray-900 border-b pb-4 mb-6">Yêu cầu công việc</h2>
              <div v-html="store.selectedJob.requirements" class="text-gray-700 leading-relaxed whitespace-pre-wrap"></div>
            </div>
            <div v-if="store.selectedJob.benefits" class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 prose max-w-none">
              <h2 class="text-xl font-bold text-gray-900 border-b pb-4 mb-6">Quyền lợi</h2>
              <div v-html="store.selectedJob.benefits" class="text-gray-700 leading-relaxed whitespace-pre-wrap"></div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h3 class="font-bold text-lg text-gray-900 mb-6 border-b pb-3">Thông tin chung</h3>
            <ul class="space-y-4 text-sm">
              <li class="flex justify-between border-b border-gray-50 pb-3">
                <span class="text-gray-500">Kinh nghiệm</span>
                <span class="font-medium text-gray-900 text-right">{{ store.selectedJob.experienceLevel || 'Không yêu cầu' }}</span>
              </li>
              <li class="flex justify-between border-b border-gray-50 pb-3">
                <span class="text-gray-500">Số lượng tuyển</span>
                <span class="font-medium text-gray-900 text-right">{{ store.selectedJob.numOfVacancies || 'Không giới hạn' }}</span>
              </li>
              <li class="flex justify-between border-b border-gray-50 pb-3">
                <span class="text-gray-500">Hình thức làm việc</span>
                <span class="font-medium text-gray-900 text-right">{{ store.selectedJob.workingOptions || 'Toàn thời gian' }}</span>
              </li>
              <li class="flex justify-between pb-1">
                <span class="text-gray-500">Chuyên mục</span>
                <span class="font-medium text-gray-900 text-right">{{ store.selectedJob.categoryName || '-' }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <ApplyDialog 
        v-if="isApplyDialogOpen && store.selectedJob" 
        :job-id="store.selectedJob.id" 
        :job-title="store.selectedJob.title" 
        @close="isApplyDialogOpen = false"
        @success="isApplyDialogOpen = false; router.push({ name: 'MyApplications' })" 
      />

    </div>
  </div>
</template>
