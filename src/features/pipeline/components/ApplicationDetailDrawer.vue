// src/features/pipeline/components/ApplicationDetailDrawer.vue
// Slide-in drawer that opens when clicking an application card.
// CRITICAL: cover letter is sanitized with DOMPurify before v-html to prevent XSS.
<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import { X, ExternalLink, Clock, Bot, ArrowRight } from 'lucide-vue-next'
import type { ApplicationDetail, ApplicationStatus } from '@/features/pipeline/types/application.dto'

const props = defineProps<{
  detail: ApplicationDetail | null
  isLoading: boolean
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

// XSS-safe cover letter HTML
const sanitizedCoverLetter = computed(() => {
  if (!props.detail?.coverLetter) return ''
  return DOMPurify.sanitize(props.detail.coverLetter)
})

// AI score badge colours
const aiScoreClass = computed(() => {
  const s = props.detail?.aiScore
  if (s === null || s === undefined) return 'bg-surface-muted text-text-muted border border-border'
  if (s >= 80) return 'bg-green-50 text-green-700 border border-green-200'
  if (s >= 50) return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
  return 'bg-red-50 text-red-700 border border-red-200'
})

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  NEW: 'New',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  NEW: '#64748B',
  SCREENING: '#F59E0B',
  INTERVIEW: '#3B82F6',
  OFFER: '#8B5CF6',
  HIRED: '#10B981',
  REJECTED: '#EF4444',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <!-- Scrim overlay -->
  <div
    class="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
    aria-hidden="true"
    @click="emit('close')"
  />

  <!-- Drawer panel -->
  <aside
    class="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col"
    role="dialog"
    aria-modal="true"
    aria-label="Application Detail"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
      <h2 class="text-lg font-bold text-text-primary">Application Detail</h2>
      <button
        class="p-1.5 rounded-lg hover:bg-surface-muted transition-colors text-text-muted"
        aria-label="Close drawer"
        @click="emit('close')"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="flex-1 p-6 space-y-5 animate-pulse">
      <div class="h-5 w-48 bg-surface-muted rounded" />
      <div class="h-4 w-32 bg-surface-muted rounded" />
      <div class="h-8 w-20 bg-surface-muted rounded-full" />
      <div class="h-28 bg-surface-muted rounded-xl" />
      <div class="space-y-3">
        <div class="h-4 w-36 bg-surface-muted rounded" />
        <div class="h-4 w-full bg-surface-muted rounded" />
        <div class="h-4 w-3/4 bg-surface-muted rounded" />
      </div>
    </div>

    <!-- No data fallback -->
    <div
      v-else-if="!detail"
      class="flex-1 flex items-center justify-center text-text-muted text-sm"
    >
      Loading application details...
    </div>

    <!-- Main content -->
    <div v-else class="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">

      <!-- IDs -->
      <section class="space-y-3">
        <div>
          <p class="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-0.5">
            Candidate ID
          </p>
          <p class="text-sm font-mono text-text-primary">{{ detail.candidateId }}</p>
        </div>
        <div>
          <p class="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-0.5">
            Job ID
          </p>
          <p class="text-sm font-mono text-text-primary">{{ detail.jobId }}</p>
        </div>
      </section>

      <!-- AI Score -->
      <section class="flex items-center gap-3">
        <Bot class="w-5 h-5 text-brand shrink-0" />
        <span class="text-sm font-medium text-text-primary">AI Score</span>
        <span
          v-if="detail.aiScore !== null"
          :class="['text-sm font-bold px-3 py-1 rounded-full', aiScoreClass]"
        >
          {{ detail.aiScore }}%
        </span>
        <span v-else class="text-sm text-text-muted italic">Not yet screened</span>
      </section>

      <!-- CV Link -->
      <section>
        <p class="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">
          CV / Resume
        </p>
        <a
          :href="detail.cvUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-sm text-brand hover:text-brand-dark
                 font-medium transition-colors"
        >
          <ExternalLink class="w-4 h-4" />
          View CV
        </a>
      </section>

      <!-- Cover Letter (DOMPurify sanitized) -->
      <section v-if="detail.coverLetter">
        <p class="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">
          Cover Letter
        </p>
        <div
          class="prose prose-sm max-w-none p-4 bg-surface-soft rounded-xl border border-border
                 text-text-primary text-sm leading-relaxed"
          v-html="sanitizedCoverLetter"
        />
      </section>

      <!-- Status History Timeline (newest first) -->
      <section>
        <p class="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-3">
          Status History
        </p>

        <p v-if="detail.statusHistory.length === 0" class="text-sm text-text-muted italic">
          No status changes recorded yet.
        </p>

        <ol v-else class="relative border-l border-border ml-3 space-y-5">
          <li
            v-for="entry in detail.statusHistory"
            :key="entry.id"
            class="ml-5"
          >
            <!-- Timeline dot -->
            <span
              class="absolute -left-1.5 w-3 h-3 rounded-full ring-2 ring-white"
              :style="{ backgroundColor: STATUS_COLORS[entry.toStatus] }"
            />

            <!-- Transition label -->
            <div class="flex items-center gap-1.5 flex-wrap text-sm">
              <span class="font-medium text-text-muted">
                {{ entry.fromStatus ? STATUS_LABELS[entry.fromStatus] : 'Start' }}
              </span>
              <ArrowRight class="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span
                class="font-bold"
                :style="{ color: STATUS_COLORS[entry.toStatus] }"
              >
                {{ STATUS_LABELS[entry.toStatus] }}
              </span>
            </div>

            <!-- Note -->
            <p v-if="entry.note" class="mt-0.5 text-xs text-text-muted italic">
              "{{ entry.note }}"
            </p>

            <!-- Timestamp -->
            <p class="mt-1 flex items-center gap-1 text-xs text-text-muted">
              <Clock class="w-3 h-3 shrink-0" />
              {{ formatDate(entry.changedAt) }}
            </p>
          </li>
        </ol>
      </section>
    </div>
  </aside>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
