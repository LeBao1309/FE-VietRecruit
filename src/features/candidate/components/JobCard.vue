<script setup lang="ts">
// src/features/candidate/components/JobCard.vue
// Individual job posting card for the public job board.

import type { JobSummaryResponse } from '../types/job.schema'
import { MapPin, Banknote, Calendar, Building2 } from 'lucide-vue-next'

const props = defineProps<{ job: JobSummaryResponse }>()
const emit = defineEmits<{ click: [id: string] }>()

const formatCurrency = (value?: number | null, currency?: string | null) => {
  if (value == null) return ''
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: currency || 'VND',
    maximumFractionDigits: 0
  }).format(value)
}

const getSalaryDisplay = () => {
  if (props.job.isNegotiable) return 'Thỏa thuận'
  if (props.job.minSalary && props.job.maxSalary) {
    return `${formatCurrency(props.job.minSalary, props.job.currency)} - ${formatCurrency(props.job.maxSalary, props.job.currency)}`
  }
  if (props.job.minSalary) return `Từ ${formatCurrency(props.job.minSalary, props.job.currency)}`
  if (props.job.maxSalary) return `Đến ${formatCurrency(props.job.maxSalary, props.job.currency)}`
  return 'Thỏa thuận'
}

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN')
}
</script>

<template>
  <div 
    @click="emit('click', job.id)" 
    class="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col justify-between h-full group"
  >
    <div>
      <div class="flex items-start gap-4 mb-5">
        <!-- Company Logo -->
        <div class="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-50 flex items-center justify-center p-2 group-hover:border-[#009898]/20 transition-colors">
          <img v-if="job.companyLogoUrl" :src="job.companyLogoUrl" class="w-full h-full object-contain" />
          <Building2 v-else class="w-8 h-8 text-gray-300" />
        </div>
        
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-base text-gray-900 group-hover:text-[#009898] line-clamp-2 transition-colors leading-snug">
            {{ job.title }}
          </h3>
          <p class="text-sm text-gray-500 mt-1 truncate font-medium">{{ job.companyName }}</p>
        </div>
      </div>

      <div class="space-y-3 mb-6">
        <!-- Location -->
        <div class="flex items-center gap-2.5 text-sm text-gray-600">
          <MapPin class="w-4 h-4 text-gray-400" />
          <span class="truncate">{{ job.locationName || 'Toàn quốc' }}</span>
        </div>
        
        <!-- Salary -->
        <div class="flex items-center gap-2.5 font-bold text-[#009898] text-sm">
          <Banknote class="w-4 h-4" />
          <span>{{ getSalaryDisplay() }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-50 mt-auto">
      <!-- Category Badge -->
      <span v-if="job.categoryName" class="px-3 py-1 bg-[#009898]/5 text-[#009898] text-[11px] rounded-full font-bold uppercase tracking-wider">
        {{ job.categoryName }}
      </span>
      
      <!-- Deadline -->
      <div v-if="job.deadline" class="flex items-center gap-1.5 text-[11px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md uppercase tracking-tighter">
        <Calendar class="w-3.5 h-3.5" />
        <span>Hạn: {{ formatDate(job.deadline) }}</span>
      </div>
    </div>
  </div>
</template>
