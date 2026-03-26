<!-- src/features/interview/views/ScorecardDashboard.vue -->
<!-- Page summarizing all scorecards for a specific interview. Pure UI. -->
<script setup lang="ts">
import { AlertCircle, ChevronLeft } from 'lucide-vue-next'
import ScorecardSummaryCard from '../components/ScorecardSummaryCard.vue'

interface Scorecard {
  id: string
  interviewerName: string
  skillScore: number
  attitudeScore: number
  englishScore: number
  overallNote?: string
  result: 'PASS' | 'FAIL' | 'CONSIDERING'
  submittedAt: string
}

interface ScorecardSummary {
  totalReviewers: number
  averageSkill: number
  averageAttitude: number
  averageEnglish: number
  averageOverall: number
  resultBreakdown: { PASS: number; FAIL: number; CONSIDERING: number }
  scorecards: Scorecard[]
}

const props = defineProps<{
  summary: ScorecardSummary | null
  isLoading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()
</script>

<template>
  <div class="p-8 max-w-5xl mx-auto space-y-8">
    <!-- Breadcrumbs / Back -->
    <button 
      @click="emit('back')"
      class="flex items-center gap-2 text-xs font-black text-text-muted hover:text-brand uppercase tracking-widest transition-colors group"
    >
      <ChevronLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      Quay lại danh sách
    </button>

    <!-- Header -->
    <header>
      <h1 class="text-3xl font-black text-text-primary uppercase tracking-tight">Tổng hợp Đánh giá</h1>
      <p class="text-sm text-text-muted mt-1 font-medium">Báo cáo chi tiết Scorecard từ tất cả người phỏng vấn.</p>
    </header>

    <!-- Error State -->
    <div v-if="error" class="p-12 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4">
      <AlertCircle class="w-12 h-12 text-red-500 mx-auto" />
      <h3 class="text-lg font-black text-red-700 uppercase">Không thể tải dữ liệu</h3>
      <p class="text-sm text-red-600 font-medium">{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="space-y-6 animate-pulse">
      <div class="h-48 bg-white border border-border rounded-3xl"></div>
      <div class="h-96 bg-white border border-border rounded-3xl"></div>
    </div>

    <!-- Summary Content -->
    <div v-else-if="summary">
      <ScorecardSummaryCard :summary="summary" />
    </div>

    <!-- Empty State -->
    <div v-else class="py-24 text-center space-y-4 bg-white border border-dashed border-border rounded-3xl">
      <p class="text-sm text-text-muted font-bold uppercase tracking-widest">Chưa có đánh giá nào được gửi cho buổi phỏng vấn này.</p>
    </div>
  </div>
</template>
