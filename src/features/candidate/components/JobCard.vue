<script setup lang="ts">
import type { JobSummaryResponse } from '../types/job.schema'
import { useRouter } from 'vue-router'

const props = defineProps<{ job: JobSummaryResponse }>()
const router = useRouter()

const formatCurrency = (value?: number | null, currency?: string | null) => {
  if (value == null) return ''
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: currency || 'VND' }).format(value)
}

const getSalaryDisplay = () => {
  if (props.job.isNegotiable) return 'Thỏa thuận'
  if (props.job.minSalary && props.job.maxSalary) return `${formatCurrency(props.job.minSalary, props.job.currency)} - ${formatCurrency(props.job.maxSalary, props.job.currency)}`
  if (props.job.minSalary) return `Từ ${formatCurrency(props.job.minSalary, props.job.currency)}`
  if (props.job.maxSalary) return `Đến ${formatCurrency(props.job.maxSalary, props.job.currency)}`
  return 'Thỏa thuận'
}

const goToDetail = () => {
  router.push({ name: 'JobDetail', params: { id: props.job.id } })
}
</script>

<template>
  <div @click="goToDetail" class="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md cursor-pointer transition flex flex-col justify-between h-full group">
    <div class="flex items-start gap-4 mb-4">
      <div class="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        <img v-if="job.companyLogoUrl" :src="job.companyLogoUrl" class="w-full h-full object-cover" />
      </div>
      <div>
        <h3 class="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 line-clamp-2 transition-colors">{{ job.title }}</h3>
        <p class="text-sm text-gray-600 mt-1">{{ job.companyName }}</p>
      </div>
    </div>
    <div class="space-y-2 text-sm text-gray-500 mb-4">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        <span>{{ job.locationName || 'Không xác định' }}</span>
      </div>
      <div class="flex items-center gap-2 font-medium text-green-600">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ getSalaryDisplay() }}</span>
      </div>
    </div>
    <div class="flex flex-wrap gap-2 mt-auto">
      <span v-if="job.categoryName" class="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded font-medium">{{ job.categoryName }}</span>
      <span v-if="job.deadline" class="px-2 py-1 bg-red-50 text-red-600 text-xs rounded font-medium">Hạn: {{ new Date(job.deadline).toLocaleDateString('vi-VN') }}</span>
    </div>
  </div>
</template>
