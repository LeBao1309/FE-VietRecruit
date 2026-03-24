<!-- src/features/pipeline/components/ApplicationCard.vue -->
<!-- Kanban card for a single application. Pure UI. -->
<script setup lang="ts">
import { computed } from 'vue'
import { Cpu, ExternalLink, FileText, User } from 'lucide-vue-next'

interface Application {
  id: string
  candidateId: string
  jobId: string
  status: string
  aiScore: number | null
  coverLetter: string | null
  cvUrl: string
  createdAt: string
}

const props = defineProps<{
  app: Application
  isAiPending?: boolean
  isSelected?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'triggerScreening', jobId: string): void
  (e: 'viewCv', url: string): void
}>()

// AI score colour coding: >=80 green, >=50 amber, <50 red
const aiScoreClass = computed(() => {
  const s = props.app.aiScore
  if (s === null) return null
  if (s >= 80) return 'bg-green-50 text-green-700 border border-green-200'
  if (s >= 50) return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
  return 'bg-red-50 text-red-700 border border-red-200'
})

function handleAiScreen(e: MouseEvent): void {
  e.stopPropagation()
  emit('triggerScreening', props.app.jobId)
}

function handleViewCv(e: MouseEvent): void {
  e.stopPropagation()
  emit('viewCv', props.app.cvUrl)
}
</script>

<template>
  <div
    class="group bg-white border rounded-xl p-3 cursor-grab active:cursor-grabbing
           hover:shadow-hover hover:-translate-y-0.5 transition-all duration-150 select-none"
    :class="[
      isSelected ? 'border-brand ring-1 ring-brand shadow-brand-sm' : 'border-border'
    ]"
    role="button"
    @click="emit('click')"
  >
    <!-- Candidate Info -->
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center gap-1.5 mb-1">
          <div class="p-1 rounded bg-surface-soft">
            <User class="w-3.5 h-3.5 text-text-muted" />
          </div>
          <p class="text-sm font-bold text-text-primary truncate">
            CAND-{{ app.candidateId.slice(0, 8).toUpperCase() }}
          </p>
        </div>
        <p class="text-[10px] text-text-muted font-mono tracking-tighter">
          JOB-{{ app.jobId.slice(0, 8).toUpperCase() }}
        </p>
      </div>

      <!-- AI Score Badge -->
      <div
        v-if="app.aiScore !== null && !isAiPending"
        :class="['text-[10px] font-black px-1.5 py-0.5 rounded border leading-none', aiScoreClass]"
      >
        {{ app.aiScore }}%
      </div>
    </div>

    <!-- Status/Indicators -->
    <div class="flex items-center gap-2 mt-3">
      <!-- AI pending animation -->
      <span
        v-if="isAiPending"
        class="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5
               rounded bg-brand-light text-brand border border-brand/20 animate-pulse"
      >
        <Cpu class="w-2.5 h-2.5" />
        SÀNG LỌC...
      </span>

      <!-- Cover-letter indicator -->
      <div
        v-if="app.coverLetter"
        class="flex items-center gap-1 text-[10px] font-medium text-text-muted bg-surface px-1.5 py-0.5 rounded border border-border"
        title="Đã đính kèm thư giới thiệu"
      >
        <FileText class="w-2.5 h-2.5" />
        CL
      </div>
      
      <div class="flex-1"></div>
      
      <span class="text-[10px] text-text-muted font-medium">
        {{ new Date(app.createdAt).toLocaleDateString('vi-VN') }}
      </span>
    </div>

    <!-- Footer: actions (hidden by default, shown on hover or if selected) -->
    <div 
      class="mt-3 pt-2 border-t border-border flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity"
      :class="{ 'opacity-100': isSelected }"
    >
      <button
        v-if="!isAiPending"
        class="inline-flex items-center gap-1 text-[10px] text-brand hover:text-brand-dark
               font-bold transition-colors uppercase"
        @click="handleAiScreen"
      >
        <Cpu class="w-2.5 h-2.5" />
        AI Screen
      </button>
      <div v-else></div>

      <button
        class="inline-flex items-center gap-1 text-[10px] text-text-muted hover:text-brand transition-colors font-bold uppercase"
        @click="handleViewCv"
      >
        <ExternalLink class="w-2.5 h-2.5" />
        Xem CV
      </button>
    </div>
  </div>
</template>
