<!-- src/features/pipeline/components/AiScreeningResultCard.vue -->
<!-- Displays AI screening results with score, summary, and lists of strengths/weaknesses. -->
<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, XCircle, Info, BrainCircuit } from 'lucide-vue-next'

interface ScreeningResult {
  score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

const props = defineProps<{
  result: ScreeningResult | null
  isLoading?: boolean
}>()

const scoreColor = computed(() => {
  if (!props.result) return 'text-gray-400'
  const s = props.result.score
  if (s >= 80) return 'text-green-600'
  if (s >= 50) return 'text-yellow-600'
  return 'text-red-600'
})

const scoreBg = computed(() => {
  if (!props.result) return 'bg-gray-100'
  const s = props.result.score
  if (s >= 80) return 'bg-green-50'
  if (s >= 50) return 'bg-yellow-50'
  return 'bg-red-50'
})
</script>

<template>
  <div class="bg-white border border-border rounded-xl overflow-hidden">
    <div v-if="isLoading" class="p-6 flex flex-col items-center justify-center space-y-4 animate-pulse">
      <BrainCircuit class="w-12 h-12 text-brand/20" />
      <div class="h-4 w-3/4 bg-gray-100 rounded"></div>
      <div class="h-4 w-1/2 bg-gray-100 rounded"></div>
    </div>

    <div v-else-if="result" class="p-6">
      <!-- Header with Score -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-3">
          <div :class="['p-2 rounded-lg', scoreBg]">
            <BrainCircuit class="w-6 h-6 text-brand" />
          </div>
          <h3 class="text-lg font-bold text-text-primary">Kết quả Sàng lọc AI</h3>
        </div>
        <div :class="['text-3xl font-black font-display', scoreColor]">
          {{ result.score }}<span class="text-lg font-medium opacity-70">/100</span>
        </div>
      </div>

      <!-- Summary -->
      <div class="mb-6 p-4 bg-surface-soft rounded-lg border-l-4 border-brand">
        <p class="text-sm text-text-primary leading-relaxed">
          {{ result.summary }}
        </p>
      </div>

      <!-- Lists -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Strengths -->
        <div>
          <h4 class="flex items-center gap-2 text-sm font-bold text-green-700 mb-3">
            <CheckCircle2 class="w-4 h-4" />
            Điểm mạnh
          </h4>
          <ul class="space-y-2">
            <li 
              v-for="(item, idx) in result.strengths" 
              :key="idx"
              class="text-sm text-text-primary flex items-start gap-2"
            >
              <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
              {{ item }}
            </li>
          </ul>
        </div>

        <!-- Weaknesses -->
        <div>
          <h4 class="flex items-center gap-2 text-sm font-bold text-red-700 mb-3">
            <XCircle class="w-4 h-4" />
            Hạn chế
          </h4>
          <ul class="space-y-2">
            <li 
              v-for="(item, idx) in result.weaknesses" 
              :key="idx"
              class="text-sm text-text-primary flex items-start gap-2"
            >
              <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="mt-8 pt-6 border-t border-border">
        <h4 class="flex items-center gap-2 text-sm font-bold text-brand mb-3">
          <Info class="w-4 h-4" />
          Khuyến nghị hành động
        </h4>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="(rec, idx) in result.recommendations" 
            :key="idx"
            class="px-3 py-1 bg-brand-light text-brand text-xs font-semibold rounded-full border border-brand/10"
          >
            {{ rec }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="p-12 text-center text-text-muted italic bg-surface-soft">
      Chưa có kết quả sàng lọc AI. Nhấn "Sàng lọc AI" để bắt đầu.
    </div>
  </div>
</template>
