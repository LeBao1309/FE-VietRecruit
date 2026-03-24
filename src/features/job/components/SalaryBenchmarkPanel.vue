<script setup lang="ts">
// src/features/job/components/SalaryBenchmarkPanel.vue
// Visualizes AI-powered salary benchmarks for a given job title/location.

import { X, TrendingUp, Users, Info } from 'lucide-vue-next'

const props = defineProps<{
  isLoading: boolean
  data: {
    min: number
    max: number
    median: number
    currency: string
    sampleSize: number
  } | null
  error: string | null
}>()

const emit = defineEmits<{
  dismiss: []
}>()

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: props.data?.currency || 'VND',
    maximumFractionDigits: 0,
  }).format(n)
}

function calculatePosition(value: number): string {
  if (!props.data) return '0%'
  const range = props.data.max - props.data.min
  const relative = value - props.data.min
  return `${Math.max(0, Math.min(100, (relative / range) * 100))}%`
}
</script>

<template>
  <div class="mt-4 border border-gray-200 bg-white rounded-xl shadow-lg overflow-hidden transition-all animate-in zoom-in-95 duration-200">
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
      <div class="flex items-center gap-2 text-gray-700">
        <TrendingUp class="w-4 h-4 text-[#009898]" />
        <span class="font-bold text-sm">Ước lượng mức lương thị trường</span>
      </div>
      <button @click="emit('dismiss')" class="text-gray-400 hover:text-gray-600">
        <X class="w-4 h-4" />
      </button>
    </div>

    <div class="p-6">
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="animate-pulse flex flex-col items-center gap-4 w-full">
          <div class="h-4 bg-gray-100 rounded w-3/4"></div>
          <div class="h-8 bg-gray-100 rounded w-full"></div>
          <div class="h-4 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>

      <div v-else-if="error" class="text-center py-4 text-red-500 text-sm">
        {{ error }}
      </div>

      <div v-else-if="data" class="space-y-8">
        <!-- Visualization -->
        <div class="relative pt-10 pb-2">
          <!-- Range Bar -->
          <div class="h-3 bg-gray-100 rounded-full w-full overflow-hidden flex">
             <div class="h-full bg-gradient-to-r from-[#009898]/30 via-[#009898] to-[#009898]/30 w-full rounded-full"></div>
          </div>

          <!-- Markers -->
          <div class="absolute top-0 left-0 h-full w-full pointer-events-none">
            <!-- Min -->
            <div class="absolute top-0 transform -translate-x-1/2 flex flex-col items-center" :style="{ left: '0%' }">
              <span class="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-tighter">Thấp</span>
              <div class="w-0.5 h-12 bg-gray-300"></div>
              <span class="text-xs font-semibold text-gray-500 mt-1 whitespace-nowrap">{{ formatCurrency(data.min) }}</span>
            </div>

            <!-- Median -->
            <div class="absolute top-0 transform -translate-x-1/2 flex flex-col items-center" :style="{ left: calculatePosition(data.median) }">
              <span class="text-[10px] font-bold text-[#009898] mb-1 uppercase tracking-tighter bg-[#009898]/10 px-1 rounded">Trung bình</span>
              <div class="w-1 h-12 bg-[#009898]"></div>
              <span class="text-sm font-bold text-[#009898] mt-1 whitespace-nowrap drop-shadow-sm">{{ formatCurrency(data.median) }}</span>
            </div>

            <!-- Max -->
            <div class="absolute top-0 transform -translate-x-1/2 flex flex-col items-center" :style="{ left: '100%' }">
              <span class="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-tighter">Cao</span>
              <div class="w-0.5 h-12 bg-gray-300"></div>
              <span class="text-xs font-semibold text-gray-500 mt-1 whitespace-nowrap text-right">{{ formatCurrency(data.max) }}</span>
            </div>
          </div>
        </div>

        <!-- Footnote -->
        <div class="flex items-center justify-between gap-4 pt-4 border-t border-gray-50 text-[11px]">
          <div class="flex items-center gap-1.5 text-gray-400 italic">
            <Info class="w-3.5 h-3.5" />
            Dữ liệu dựa trên phân tích AI từ các tin tuyển dụng tương tự.
          </div>
          <div class="flex items-center gap-1.5 text-gray-500 font-medium">
            <Users class="w-3.5 h-3.5" />
            Mẫu: {{ data.sampleSize }} vị trí
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
