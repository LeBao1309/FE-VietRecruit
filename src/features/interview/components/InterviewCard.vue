<!-- src/features/interview/components/InterviewCard.vue -->
<!-- Card displaying interview details. Pure UI. -->
<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, Clock, MapPin, Link, Users, CheckCircle, XCircle, Star } from 'lucide-vue-next'

interface Interview {
  id: string
  applicationId: string
  jobId: string
  scheduledAt: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED'
  location?: string
  meetingLink?: string
  notes?: string
  interviewerIds: string[]
}

const props = defineProps<{
  interview: Interview
  canManage?: boolean
  canScore?: boolean
}>()

const emit = defineEmits<{
  (e: 'complete', id: string): void
  (e: 'cancel', id: string): void
  (e: 'score', id: string): void
}>()

const statusConfig = {
  SCHEDULED: { label: 'Đã lên lịch', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  COMPLETED: { label: 'Hoàn thành', class: 'bg-green-50 text-green-700 border-green-200' },
  CANCELED: { label: 'Đã hủy', class: 'bg-red-50 text-red-700 border-red-200' }
}

const formattedDate = computed(() => {
  return new Date(props.interview.scheduledAt).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const formattedTime = computed(() => {
  return new Date(props.interview.scheduledAt).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>

<template>
  <div class="bg-white border border-border rounded-2xl p-5 hover:shadow-hover transition-all group">
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <span 
          :class="['px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider', statusConfig[interview.status].class]"
        >
          {{ statusConfig[interview.status].label }}
        </span>
        <h3 class="mt-2 text-sm font-black text-text-primary uppercase tracking-tight">
          Phỏng vấn #{{ interview.id.slice(0, 8) }}
        </h3>
      </div>
      <div class="p-2 rounded-xl bg-surface-soft text-text-muted">
        <Calendar class="w-5 h-5" />
      </div>
    </div>

    <!-- Details -->
    <div class="space-y-3 mb-6">
      <div class="flex items-center gap-2 text-xs text-text-primary font-bold">
        <Clock class="w-4 h-4 text-brand" />
        {{ formattedDate }} lúc {{ formattedTime }}
      </div>
      
      <div v-if="interview.location" class="flex items-center gap-2 text-xs text-text-muted">
        <MapPin class="w-4 h-4" />
        {{ interview.location }}
      </div>

      <div v-if="interview.meetingLink" class="flex items-center gap-2 text-xs text-brand font-bold">
        <Link class="w-4 h-4" />
        <a :href="interview.meetingLink" target="_blank" class="hover:underline">Link cuộc họp</a>
      </div>

      <div class="flex items-center gap-2 text-xs text-text-muted">
        <Users class="w-4 h-4" />
        {{ interview.interviewerIds.length }} người phỏng vấn
      </div>
    </div>

    <!-- Notes -->
    <div v-if="interview.notes" class="mb-6 p-3 bg-surface-soft rounded-xl italic text-[11px] text-text-muted border-l-2 border-border">
      "{{ interview.notes }}"
    </div>

    <!-- Actions -->
    <div class="pt-4 border-t border-border flex items-center justify-end gap-2">
      <template v-if="interview.status === 'SCHEDULED'">
        <button 
          v-if="canManage"
          @click="emit('cancel', interview.id)"
          class="flex-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
        >
          <XCircle class="w-3.5 h-3.5" /> Hủy
        </button>
        <button 
          v-if="canManage"
          @click="emit('complete', interview.id)"
          class="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-[10px] font-black uppercase tracking-widest shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <CheckCircle class="w-3.5 h-3.5" /> Xong
        </button>
      </template>
      
      <button 
        v-if="canScore && interview.status === 'COMPLETED'"
        @click="emit('score', interview.id)"
        class="w-full px-4 py-2.5 bg-brand text-white rounded-xl hover:bg-brand-dark text-xs font-black uppercase tracking-[0.1em] shadow-brand-sm transition-all flex items-center justify-center gap-2"
      >
        <Star class="w-4 h-4 fill-current" /> Chấm điểm Scorecard
      </button>
    </div>
  </div>
</template>
