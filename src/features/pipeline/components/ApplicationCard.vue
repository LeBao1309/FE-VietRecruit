// src/features/pipeline/components/ApplicationCard.vue
// Kanban card for a single application.
// Emits "click" to open the detail drawer.
// Shows AI score badge, AI-pending spinner badge, and Trigger AI Screening button.
<script setup lang="ts">
import { computed } from 'vue'
import { Cpu, ExternalLink, FileText } from 'lucide-vue-next'
import { usePipelineStore } from '@/features/pipeline/stores/usePipelineStore'
import type { Application } from '@/features/pipeline/types/application.dto'

const props = defineProps<{ app: Application }>()
const emit = defineEmits<{ (e: 'click'): void }>()

const store = usePipelineStore()
const aiPending = computed(() => store.isAiPending(props.app.id))

// AI score colour coding: >=80 green, >=50 amber, <50 red
const aiScoreClass = computed(() => {
  const s = props.app.aiScore
  if (s === null) return null
  if (s >= 80) return 'bg-green-50 text-green-700 border border-green-200'
  if (s >= 50) return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
  return 'bg-red-50 text-red-700 border border-red-200'
})

async function handleAiScreen(e: MouseEvent): Promise<void> {
  e.stopPropagation()
  await store.triggerAiScreening(props.app.id)
}
</script>

<template>
  <div
    class="group bg-white border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing
           hover:shadow-hover hover:-translate-y-0.5 transition-all duration-150 select-none"
    role="button"
    :aria-label="`Application card for candidate ${app.candidateId.slice(0, 8)}`"
    @click="emit('click')"
  >
    <!-- Candidate identifier -->
    <p class="text-sm font-semibold text-text-primary truncate">
      Candidate <span class="font-mono text-xs">{{ app.candidateId.slice(0, 8) }}</span>
    </p>
    <p class="text-xs text-text-muted truncate mt-0.5">
      Job <span class="font-mono">{{ app.jobId.slice(0, 8) }}</span>
    </p>

    <!-- Badges row -->
    <div class="flex items-center gap-2 flex-wrap mt-2">
      <!-- AI score (only when available and not pending) -->
      <span
        v-if="app.aiScore !== null && !aiPending"
        :class="['text-xs font-semibold px-2 py-0.5 rounded-full', aiScoreClass]"
      >
        AI {{ app.aiScore }}%
      </span>

      <!-- AI pending animation -->
      <span
        v-if="aiPending"
        class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5
               rounded-full bg-brand-light text-brand border border-brand/20 animate-pulse"
      >
        <Cpu class="w-3 h-3" />
        Screening...
      </span>

      <!-- Cover-letter indicator -->
      <span
        v-if="app.coverLetter"
        class="text-text-muted"
        title="Has cover letter"
      >
        <FileText class="w-3.5 h-3.5" />
      </span>
    </div>

    <!-- Footer: actions -->
    <div class="mt-3 pt-2 border-t border-border flex items-center justify-end gap-3">
      <!-- Trigger AI Screening -->
      <button
        v-if="!aiPending"
        class="inline-flex items-center gap-1 text-xs text-brand hover:text-brand-dark
               font-medium transition-colors"
        title="Trigger AI Screening"
        @click.stop="handleAiScreen"
      >
        <Cpu class="w-3 h-3" />
        AI Screen
      </button>

      <!-- View CV -->
      <a
        :href="app.cvUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 text-xs text-text-muted hover:text-brand transition-colors"
        title="Open CV in new tab"
        @click.stop
      >
        <ExternalLink class="w-3 h-3" />
        CV
      </a>
    </div>
  </div>
</template>
