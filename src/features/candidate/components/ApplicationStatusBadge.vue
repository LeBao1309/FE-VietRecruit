<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ status: string }>()

const badgeConfig = computed(() => {
  switch (props.status?.toUpperCase()) {
    case 'PENDING':
      return { class: 'bg-yellow-50 text-yellow-700 border-yellow-200', text: 'Chờ xử lý', dot: 'bg-yellow-500' }
    case 'REVIEWING':
      return { class: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Đang xem xét', dot: 'bg-blue-500' }
    case 'INTERVIEWING':
      return { class: 'bg-purple-50 text-purple-700 border-purple-200', text: 'Phỏng vấn', dot: 'bg-purple-500' }
    case 'OFFERED':
      return { class: 'bg-green-50 text-green-700 border-green-200', text: 'Đã cấp Offer', dot: 'bg-green-500' }
    case 'HIRED':
      return { class: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold', text: 'Đã trúng tuyển', dot: 'bg-emerald-500' }
    case 'REJECTED':
      return { class: 'bg-red-50 text-red-700 border-red-200', text: 'Từ chối', dot: 'bg-red-500' }
    case 'WITHDRAWN':
      return { class: 'bg-gray-100 text-gray-700 border-gray-300', text: 'Đã rút đơn', dot: 'bg-gray-500' }
    default:
      return { class: 'bg-gray-50 text-gray-600 border-gray-200', text: props.status || 'Unknown', dot: 'bg-gray-400' }
  }
})
</script>

<template>
  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', badgeConfig.class]">
    <span :class="['w-1.5 h-1.5 rounded-full mr-1.5', badgeConfig.dot]"></span>
    {{ badgeConfig.text }}
  </span>
</template>
