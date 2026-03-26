<script setup lang="ts">
import type { InterviewResponse } from '../types/application.schema'

defineProps<{ interview: InterviewResponse }>()

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const statusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
    case 'COMPLETED': return 'bg-green-100 text-green-800'
    case 'CANCELED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow transition">
    <div class="flex justify-between items-start mb-4">
      <h3 class="font-bold text-lg text-gray-900">{{ interview.title }}</h3>
      <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium', statusColor(interview.status)]">
        {{ interview.status }}
      </span>
    </div>
    
    <div class="space-y-3 test-sm text-gray-600">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-indigo-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <div>
          <p class="font-medium text-gray-900">{{ formatDateTime(interview.scheduledAt) }}</p>
          <p class="text-sm">Thời lượng: {{ interview.durationMinutes }} phút</p>
        </div>
      </div>
      
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-indigo-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        <div>
          <p class="font-medium text-gray-900">{{ interview.interviewType }}</p>
          <p class="text-sm break-all">
            <template v-if="interview.locationOrLink.startsWith('http')">
              <a :href="interview.locationOrLink" target="_blank" class="text-indigo-600 hover:underline">Vào phòng họp</a>
            </template>
            <template v-else>
              {{ interview.locationOrLink }}
            </template>
          </p>
        </div>
      </div>

      <div v-if="interview.interviewers && interview.interviewers.length > 0" class="flex items-start gap-3">
        <svg class="w-5 h-5 text-indigo-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        <div>
          <p class="font-medium text-gray-900">Người phỏng vấn</p>
          <p class="text-sm">{{ interview.interviewers.join(', ') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
