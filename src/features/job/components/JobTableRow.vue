<script setup lang="ts">
// src/features/job/components/JobTableRow.vue
// Renders a single row in the Job list table.
// Emits 'publish', 'close', and 'edit' events.

import { CalendarDays, Edit2, ExternalLink } from 'lucide-vue-next'
import JobStatusBadge from '@/features/job/components/JobStatusBadge.vue'
import type { Job } from '@/features/workspace/types'

const props = defineProps<{
  job: Job
}>()

const emit = defineEmits<{
  publish: [id: string]
  close: [id: string]
  edit: [id: string]
}>()

function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function formatSalary(job: Job): string {
  if (job.is_negotiable) return 'Thỏa thuận'
  if (!job.min_salary && !job.max_salary) return 'Không tiết lộ'
  const currency = job.currency ?? 'VND'
  if (job.min_salary && job.max_salary) {
    return `${compactNumber(job.min_salary)}–${compactNumber(job.max_salary)} ${currency}`
  }
  if (job.min_salary) return `Từ ${compactNumber(job.min_salary)} ${currency}`
  return `Lên đến ${compactNumber(job.max_salary!)} ${currency}`
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <tr
    @click="emit('edit', props.job.id)"
    class="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors group cursor-pointer"
  >
    <!-- Title + description preview -->
    <td class="px-4 py-4">
      <div class="flex flex-col">
        <span class="font-semibold text-sm text-gray-900 group-hover:text-[#009898] transition-colors line-clamp-1">
          {{ props.job.title }}
        </span>
        <span class="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">
          {{ props.job.description }}
        </span>
      </div>
    </td>

    <!-- Status badge -->
    <td class="px-4 py-4 whitespace-nowrap">
      <JobStatusBadge :status="props.job.status" />
    </td>

    <!-- Salary -->
    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
      {{ formatSalary(props.job) }}
    </td>

    <!-- Deadline -->
    <td class="px-4 py-4 whitespace-nowrap">
      <span class="flex items-center gap-1.5 text-sm text-gray-600">
        <CalendarDays class="w-3.5 h-3.5 text-gray-400" />
        {{ formatDate(props.job.deadline) }}
      </span>
    </td>

    <!-- Created at -->
    <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
      {{ formatDate(props.job.created_at) }}
    </td>

    <!-- Actions -->
    <td class="px-4 py-4 whitespace-nowrap" @click.stop>
      <div class="flex items-center gap-2">
        <!-- Edit -->
        <button
          @click="emit('edit', props.job.id)"
          class="p-1.5 text-gray-400 hover:text-[#009898] hover:bg-[#009898]/10 rounded-lg transition-colors"
          title="Chỉnh sửa"
        >
          <Edit2 class="w-4 h-4" />
        </button>

        <!-- Publish: only for DRAFT -->
        <button
          v-if="props.job.status === 'DRAFT'"
          @click="emit('publish', props.job.id)"
          class="px-3 py-1.5 text-xs font-semibold bg-[#009898] text-white rounded-lg hover:bg-[#007a7a] transition-colors shadow-sm"
        >
          Đăng tin
        </button>

        <!-- Close: only for PUBLISHED -->
        <button
          v-if="props.job.status === 'PUBLISHED'"
          @click="emit('close', props.job.id)"
          class="px-3 py-1.5 text-xs font-semibold bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          Đóng tin
        </button>

        <!-- Link to public view (optional but nice) -->
        <a
          v-if="props.job.status === 'PUBLISHED'"
          :href="`/jobs/${props.job.id}`"
          target="_blank"
          class="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          title="Xem tin tuyển dụng"
        >
          <ExternalLink class="w-4 h-4" />
        </a>
      </div>
    </td>
  </tr>
</template>
