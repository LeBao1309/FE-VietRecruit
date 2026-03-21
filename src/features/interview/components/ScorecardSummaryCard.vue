// src/features/interview/components/ScorecardSummaryCard.vue
// Aggregated scorecard dashboard card for HR / COMPANY_ADMIN.
// Displays overall averages, result breakdown, and individual scorecard entries.
<script setup lang="ts">
import { computed } from 'vue'
import type { ScorecardSummaryResponse } from '@/features/interview/types/interview.dto'

const props = defineProps<{ summary: ScorecardSummaryResponse }>()

const RESULT_CONFIG = {
  PASS:       { label: 'Pass',       class: 'bg-green-50 text-green-700' },
  FAIL:       { label: 'Fail',       class: 'bg-red-50 text-red-700' },
  CONSIDERING:{ label: 'Considering',class: 'bg-yellow-50 text-yellow-700' },
} as const

const overallClass = computed(() => {
  const s = props.summary.averageOverall
  if (s >= 7) return 'text-green-600'
  if (s >= 5) return 'text-yellow-600'
  return 'text-red-600'
})

function scoreBar(value: number): number {
  return Math.min(100, (value / 10) * 100)
}
</script>

<template>
  <div class="bg-white border border-border rounded-xl p-5 space-y-5">
    <!-- Overall score header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-0.5">
          Average Overall Score
        </p>
        <p :class="['text-3xl font-bold', overallClass]">
          {{ summary.averageOverall.toFixed(2) }}
          <span class="text-base font-normal text-text-muted">/ 10</span>
        </p>
      </div>
      <p class="text-sm text-text-muted">{{ summary.totalReviewers }} reviewer(s)</p>
    </div>

    <!-- Category averages -->
    <div class="space-y-3">
      <div v-for="cat in [
        { label: 'Skill',     value: summary.averageSkill },
        { label: 'Attitude',  value: summary.averageAttitude },
        { label: 'English',   value: summary.averageEnglish },
      ]" :key="cat.label">
        <div class="flex justify-between text-xs text-text-muted mb-1">
          <span>{{ cat.label }}</span>
          <span class="font-semibold text-text-primary">{{ cat.value.toFixed(2) }}</span>
        </div>
        <div class="h-1.5 bg-surface-muted rounded-full overflow-hidden">
          <div
            class="h-full bg-brand rounded-full transition-all duration-500"
            :style="{ width: `${scoreBar(cat.value)}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Result breakdown -->
    <div class="flex gap-3">
      <div
        v-for="(count, result) in summary.resultBreakdown"
        :key="result"
        :class="['flex-1 text-center py-2 rounded-lg text-xs font-bold', RESULT_CONFIG[result]?.class]"
      >
        <p class="text-lg font-bold">{{ count }}</p>
        <p>{{ RESULT_CONFIG[result]?.label }}</p>
      </div>
    </div>

    <!-- Individual scorecards -->
    <div v-if="summary.scorecards.length" class="space-y-2 border-t border-border pt-4">
      <p class="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
        Individual Reviews
      </p>
      <div
        v-for="sc in summary.scorecards"
        :key="sc.id"
        class="flex items-center justify-between p-3 bg-surface-soft rounded-lg"
      >
        <div class="text-sm">
          <p class="font-mono text-xs text-text-muted">{{ sc.reviewerId.slice(0, 8) }}</p>
          <p v-if="sc.overallNote" class="text-xs text-text-muted italic mt-0.5">
            "{{ sc.overallNote }}"
          </p>
        </div>
        <div class="text-right shrink-0 ml-4">
          <p class="font-bold text-sm text-text-primary">{{ sc.averageScore.toFixed(2) }}</p>
          <span
            :class="['text-xs font-semibold px-2 py-0.5 rounded-full', RESULT_CONFIG[sc.result]?.class]"
          >
            {{ RESULT_CONFIG[sc.result]?.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
