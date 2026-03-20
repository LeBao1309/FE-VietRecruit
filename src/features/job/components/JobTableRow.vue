<script setup lang="ts">
// src/features/job/components/JobTableRow.vue
// Renders a single row in the Job list table.
// Emits 'publish' and 'close' events — parent decides store action + confirmation.

import { CalendarDays } from 'lucide-vue-next'
import JobStatusBadge from '@/features/job/components/JobStatusBadge.vue'
import type { Job } from '@/features/workspace/types'

const props = defineProps<{
  job: Job
}>()

const emit = defineEmits<{
  publish: [id: string]
  close: [id: string]
}>()

function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function formatSalary(job: Job): string {
  if (job.is_negotiable) return 'Negotiable'
  if (!job.min_salary && !job.max_salary) return 'Not specified'
  const currency = job.currency ?? 'VND'
  if (job.min_salary && job.max_salary) {
    return `${compactNumber(job.min_salary)}–${compactNumber(job.max_salary)} ${currency}`
  }
  if (job.min_salary) return `From ${compactNumber(job.min_salary)} ${currency}`
  return `Up to ${compactNumber(job.max_salary!)} ${currency}`
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <tr
    class="border-b border-border last:border-0 hover:bg-surface-soft transition-colors group"
  >
    <!-- Title + description preview -->
    <td class="px-4 py-3">
      <p class="font-semibold text-sm text-text-primary group-hover:text-brand transition-colors line-clamp-1">
        {{ props.job.title }}
      </p>
      <p class="text-xs text-text-muted mt-0.5 line-clamp-1 max-w-xs">
        {{ props.job.description }}
      </p>
    </td>

    <!-- Status badge -->
    <td class="px-4 py-3 whitespace-nowrap">
      <JobStatusBadge :status="props.job.status" />
    </td>

    <!-- Salary -->
    <td class="px-4 py-3 whitespace-nowrap text-sm text-text-secondary">
      {{ formatSalary(props.job) }}
    </td>

    <!-- Deadline -->
    <td class="px-4 py-3 whitespace-nowrap">
      <span class="flex items-center gap-1 text-sm text-text-secondary">
        <CalendarDays class="w-3.5 h-3.5 text-text-muted" />
        {{ formatDate(props.job.deadline) }}
      </span>
    </td>

    <!-- Created at -->
    <td class="px-4 py-3 whitespace-nowrap text-sm text-text-muted">
      {{ formatDate(props.job.created_at) }}
    </td>

    <!-- Actions -->
    <td class="px-4 py-3 whitespace-nowrap">
      <div class="flex items-center gap-2">
        <!-- Publish: only for DRAFT -->
        <button
          v-if="props.job.status === 'DRAFT'"
          @click="emit('publish', props.job.id)"
          class="px-3 py-1 text-xs font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors shadow-brand-sm"
        >
          Publish
        </button>

        <!-- Close: only for PUBLISHED -->
        <button
          v-if="props.job.status === 'PUBLISHED'"
          @click="emit('close', props.job.id)"
          class="px-3 py-1 text-xs font-semibold bg-white text-danger border border-danger/30 rounded-lg hover:bg-danger-light transition-colors"
        >
          Close
        </button>

        <!-- Closed state label -->
        <span
          v-if="props.job.status === 'CLOSED'"
          class="text-xs text-text-muted italic"
        >
          Archived
        </span>
      </div>
    </td>
  </tr>
</template>
