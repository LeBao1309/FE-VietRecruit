// src/features/interview/components/InterviewCard.vue
// Displays a single interview with status badge, schedule, and action buttons.
// Used in both InterviewListPage (HR) and InterviewerDashboard (INTERVIEWER).
<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, MapPin, Link2, Users, CheckCircle, XCircle } from 'lucide-vue-next'
import type { Interview } from '@/features/interview/types/interview.dto'

const props = defineProps<{
  interview: Interview
  /** Show management actions (Complete / Cancel) — HR/COMPANY_ADMIN only */
  canManage?: boolean
  /** Show "Submit Scorecard" action — INTERVIEWER only, status must be COMPLETED */
  canScore?: boolean
}>()

const emit = defineEmits<{
  (e: 'complete', id: string): void
  (e: 'cancel', id: string): void
  (e: 'score', id: string): void
}>()

const STATUS_CONFIG = {
  SCHEDULED:  { label: 'Scheduled',  class: 'bg-blue-50 text-blue-700 border border-blue-200' },
  COMPLETED:  { label: 'Completed',  class: 'bg-green-50 text-green-700 border border-green-200' },
  CANCELED:   { label: 'Canceled',   class: 'bg-red-50 text-red-700 border border-red-200' },
} as const

const statusCfg = computed(() => STATUS_CONFIG[props.interview.status])

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
</script>

<template>
  <div
    class="bg-white border border-border rounded-xl p-4 hover:shadow-hover transition-shadow"
    :data-testid="`interview-card-${interview.id}`"
  >
    <!-- Header: status + date -->
    <div class="flex items-start justify-between gap-3 mb-3">
      <div>
        <p class="text-xs text-text-muted mb-1">Application ID</p>
        <p class="text-sm font-mono font-semibold text-text-primary">
          {{ interview.applicationId.slice(0, 8) }}
        </p>
      </div>
      <span :class="['text-xs font-semibold px-2.5 py-1 rounded-full shrink-0', statusCfg.class]">
        {{ statusCfg.label }}
      </span>
    </div>

    <!-- Scheduled time -->
    <div class="flex items-center gap-2 text-sm text-text-muted mb-2">
      <Calendar class="w-4 h-4 shrink-0" />
      <span>{{ formatDateTime(interview.scheduledAt) }}</span>
    </div>

    <!-- Location or meeting link -->
    <div v-if="interview.location" class="flex items-center gap-2 text-sm text-text-muted mb-2">
      <MapPin class="w-4 h-4 shrink-0" />
      <span>{{ interview.location }}</span>
    </div>
    <div v-if="interview.meetingLink" class="flex items-center gap-2 text-sm text-brand mb-2">
      <Link2 class="w-4 h-4 shrink-0" />
      <a
        :href="interview.meetingLink"
        target="_blank"
        rel="noopener noreferrer"
        class="hover:underline truncate"
        @click.stop
      >
        Join meeting
      </a>
    </div>

    <!-- Interviewers count -->
    <div class="flex items-center gap-2 text-sm text-text-muted mb-3">
      <Users class="w-4 h-4 shrink-0" />
      <span>{{ interview.interviewerIds.length }} interviewer(s)</span>
    </div>

    <!-- Notes -->
    <p v-if="interview.notes" class="text-xs text-text-muted italic border-t border-border pt-2 mb-3">
      {{ interview.notes }}
    </p>

    <!-- Action buttons -->
    <div
      v-if="interview.status === 'SCHEDULED' && canManage"
      class="flex gap-2 pt-2 border-t border-border"
    >
      <button
        class="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold
               px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
        @click.stop="emit('complete', interview.id)"
      >
        <CheckCircle class="w-3.5 h-3.5" />
        Complete
      </button>
      <button
        class="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold
               px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
        @click.stop="emit('cancel', interview.id)"
      >
        <XCircle class="w-3.5 h-3.5" />
        Cancel
      </button>
    </div>

    <div
      v-if="interview.status === 'COMPLETED' && canScore"
      class="pt-2 border-t border-border"
    >
      <button
        class="w-full text-xs font-semibold px-3 py-1.5 rounded-lg
               bg-brand text-white hover:bg-brand-dark transition-colors"
        @click.stop="emit('score', interview.id)"
      >
        Submit Scorecard
      </button>
    </div>
  </div>
</template>
