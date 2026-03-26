<!-- src/features/interview/components/ScorecardSummaryCard.vue -->
<!-- Card displaying an aggregate summary of all scorecards for an interview. Pure UI. -->
<script setup lang="ts">
import { computed } from 'vue'
import { Star, TrendingUp, User, Clock, CheckCircle, XCircle, HelpCircle } from 'lucide-vue-next'

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
  summary: ScorecardSummary
}>()

const resultColorClass = (res: string) => {
  switch (res) {
    case 'PASS': return 'text-green-600 bg-green-50 border-green-200'
    case 'FAIL': return 'text-red-600 bg-red-50 border-red-200'
    case 'CONSIDERING': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    default: return 'text-text-muted bg-surface-soft border-border'
  }
}

const getIcon = (res: string) => {
  switch (res) {
    case 'PASS': return CheckCircle
    case 'FAIL': return XCircle
    case 'CONSIDERING': return HelpCircle
    default: return User
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Aggregate Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="p-6 bg-white border border-border rounded-3xl shadow-sm flex flex-col items-center justify-center text-center">
        <p class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Tổng đánh giá</p>
        <div class="w-16 h-16 rounded-2xl bg-brand/5 flex items-center justify-center text-brand text-2xl font-black font-display">
          {{ summary.totalReviewers }}
        </div>
      </div>
      
      <div class="p-6 bg-white border border-border rounded-3xl shadow-sm md:col-span-3">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-sm font-black text-text-primary uppercase tracking-tight">Điểm trung bình cộng</h3>
          <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/5 border border-brand/10 text-brand text-xs font-black">
            <TrendingUp class="w-3.5 h-3.5" />
            OVERALL: {{ summary.averageOverall.toFixed(1) }}
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-8">
          <div class="space-y-2">
            <div class="flex justify-between text-[10px] font-black text-text-muted uppercase">
              <span>Chuyên môn</span>
              <span class="text-text-primary">{{ summary.averageSkill.toFixed(1) }}</span>
            </div>
            <div class="h-2 w-full bg-surface-soft rounded-full overflow-hidden">
              <div class="h-full bg-brand rounded-full" :style="{ width: `${summary.averageSkill * 10}%` }"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-[10px] font-black text-text-muted uppercase">
              <span>Thái độ</span>
              <span class="text-text-primary">{{ summary.averageAttitude.toFixed(1) }}</span>
            </div>
            <div class="h-2 w-full bg-surface-soft rounded-full overflow-hidden">
              <div class="h-full bg-yellow-500 rounded-full" :style="{ width: `${summary.averageAttitude * 10}%` }"></div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-[10px] font-black text-text-muted uppercase">
              <span>Tiếng Anh</span>
              <span class="text-text-primary">{{ summary.averageEnglish.toFixed(1) }}</span>
            </div>
            <div class="h-2 w-full bg-surface-soft rounded-full overflow-hidden">
              <div class="h-full bg-blue-500 rounded-full" :style="{ width: `${summary.averageEnglish * 10}%` }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Result Breakdown -->
    <div class="p-6 bg-surface-soft rounded-3xl border border-border/50 flex flex-wrap gap-8 items-center justify-center">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-green-600 font-black">
          {{ summary.resultBreakdown.PASS }}
        </div>
        <span class="text-xs font-black text-text-muted uppercase tracking-widest">Vượt qua</span>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200 flex items-center justify-center text-yellow-600 font-black">
          {{ summary.resultBreakdown.CONSIDERING }}
        </div>
        <span class="text-xs font-black text-text-muted uppercase tracking-widest">Cân nhắc</span>
      </div>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 font-black">
          {{ summary.resultBreakdown.FAIL }}
        </div>
        <span class="text-xs font-black text-text-muted uppercase tracking-widest">Loại bỏ</span>
      </div>
    </div>

    <!-- Individual Cards List -->
    <div class="space-y-4">
      <h4 class="text-xs font-black text-text-primary uppercase tracking-widest mb-4">Chi tiết đánh giá từng người</h4>
      <div 
        v-for="card in summary.scorecards" 
        :key="card.id"
        class="bg-white border border-border rounded-2xl p-6 hover:shadow-hover transition-all"
      >
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center text-text-muted">
              <User class="w-6 h-6" />
            </div>
            <div>
              <p class="text-sm font-black text-text-primary">{{ card.interviewerName }}</p>
              <div class="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                <Clock class="w-3 h-3" />
                {{ new Date(card.submittedAt).toLocaleString('vi-VN') }}
              </div>
            </div>
          </div>
          <div 
            :class="['px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2', resultColorClass(card.result)]"
          >
            <component :is="getIcon(card.result)" class="w-3.5 h-3.5" />
            {{ card.result }}
          </div>
        </div>

        <div class="grid grid-cols-3 gap-6 mb-6">
          <div class="p-3 bg-surface-soft rounded-xl border border-border/50 text-center">
            <p class="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Kỹ năng</p>
            <p class="text-lg font-black text-brand">{{ card.skillScore }}</p>
          </div>
          <div class="p-3 bg-surface-soft rounded-xl border border-border/50 text-center">
            <p class="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Thái độ</p>
            <p class="text-lg font-black text-yellow-600">{{ card.attitudeScore }}</p>
          </div>
          <div class="p-3 bg-surface-soft rounded-xl border border-border/50 text-center">
            <p class="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Tiếng Anh</p>
            <p class="text-lg font-black text-blue-600">{{ card.englishScore }}</p>
          </div>
        </div>

        <div v-if="card.overallNote" class="p-4 bg-surface-soft/50 rounded-xl italic text-xs text-text-primary leading-relaxed border-l-2 border-brand">
          "{{ card.overallNote }}"
        </div>
      </div>
    </div>
  </div>
</template>
