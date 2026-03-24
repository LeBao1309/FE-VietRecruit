<!-- src/features/interview/views/InterviewerDashboard.vue -->
<!-- Personalized dashboard for an interviewer. Pure UI. -->
<script setup lang="ts">
import { AlertCircle, Calendar, Star, Clock } from 'lucide-vue-next'
import InterviewCard from '../components/InterviewCard.vue'

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
  upcoming: Interview[]
  completed: Interview[]
  isLoading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'openScorecard', interviewId: string): void
}>()
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-12">
    <!-- Header -->
    <header>
      <h1 class="text-3xl font-black text-text-primary uppercase tracking-tight">Dashboard của tôi</h1>
      <p class="text-sm text-text-muted mt-1 font-medium">Danh sách các buổi phỏng vấn bạn được phân công.</p>
    </header>

    <!-- Error State -->
    <div v-if="error" class="p-6 bg-red-50 border border-red-200 rounded-3xl flex items-center gap-4 text-red-700">
      <AlertCircle class="w-6 h-6" />
      <p class="font-bold">{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-12">
      <section v-for="n in 2" :key="n" class="space-y-6">
        <div class="h-6 w-48 bg-surface-soft animate-pulse rounded"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="h-64 bg-white border border-border rounded-2xl animate-pulse"></div>
        </div>
      </section>
    </div>

    <template v-else>
      <!-- Upcoming Interviews -->
      <section class="space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Clock class="w-5 h-5" />
          </div>
          <h2 class="text-xl font-black text-text-primary uppercase tracking-tight">Sắp diễn ra</h2>
          <span class="px-2 py-0.5 rounded-full bg-surface-soft border border-border text-[10px] font-black text-text-muted">
            {{ upcoming.length }}
          </span>
        </div>

        <div v-if="upcoming.length === 0" class="py-12 bg-white border border-dashed border-border rounded-3xl text-center">
          <p class="text-sm text-text-muted font-bold uppercase tracking-widest">Không có buổi phỏng vấn nào sắp tới</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InterviewCard 
            v-for="interview in upcoming" 
            :key="interview.id"
            :interview="interview"
            :can-manage="false"
            :can-score="false"
          />
        </div>
      </section>

      <!-- Completed - Needs Scorecard -->
      <section class="space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-brand/5 text-brand flex items-center justify-center">
            <Star class="w-5 h-5" />
          </div>
          <h2 class="text-xl font-black text-text-primary uppercase tracking-tight">Chờ chấm điểm Scorecard</h2>
          <span class="px-2 py-0.5 rounded-full bg-brand-light border border-brand/10 text-[10px] font-black text-brand">
            {{ completed.length }}
          </span>
        </div>

        <div v-if="completed.length === 0" class="py-12 bg-white border border-dashed border-border rounded-3xl text-center">
          <p class="text-sm text-text-muted font-bold uppercase tracking-widest">Tuyệt vời! Bạn đã hoàn thành tất cả đánh giá</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InterviewCard 
            v-for="interview in completed" 
            :key="interview.id"
            :interview="interview"
            :can-manage="false"
            :can-score="true"
            @score="emit('openScorecard', $event)"
          />
        </div>
      </section>
    </template>
  </div>
</template>
