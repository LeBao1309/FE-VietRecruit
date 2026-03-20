<script setup lang="ts">
// src/features/job/components/JobStatusBadge.vue
// Small display-only badge mapping JobStatus → Tailwind color tokens.
// Uses the project's brand/success/warning/danger design tokens from tailwind.config.js.

import type { JobStatus } from '@/features/workspace/types'

const props = defineProps<{
  status: JobStatus
}>()

const config: Record<JobStatus, { label: string; classes: string }> = {
  DRAFT: {
    label: 'Draft',
    classes: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  },
  PUBLISHED: {
    label: 'Published',
    classes: 'bg-success-light text-success-dark border border-success/20',
  },
  CLOSED: {
    label: 'Closed',
    classes: 'bg-danger-light text-danger-dark border border-danger/20',
  },
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide',
      config[props.status].classes,
    ]"
  >
    {{ config[props.status].label }}
  </span>
</template>
