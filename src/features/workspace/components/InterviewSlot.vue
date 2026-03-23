<script setup lang="ts">
import { computed } from "vue";
import type { Interview } from "@/features/interview/types/interview.dto";

const props = defineProps<{
  interview: Interview;
}>();

const interviewTime = computed(() => {
  if (!props.interview.scheduledAt) return '--:--';
  const date = new Date(props.interview.scheduledAt);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const interviewDate = computed(() => {
  if (!props.interview.scheduledAt) return '--/--/----';
  const date = new Date(props.interview.scheduledAt);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
});
</script>

<template>
  <div
    class="flex items-start gap-4 p-4 bg-white border border-border rounded-xl hover:border-brand-muted transition-colors"
  >
    <!-- Time Column -->
    <div
      class="flex flex-col items-center justify-center min-w-[70px] shrink-0 text-center border-r border-border-subtle pr-4"
    >
      <span class="text-lg font-bold text-text-primary">{{
        interviewTime
      }}</span>
      <span class="text-xs font-medium text-text-muted mt-0.5">{{
        interviewDate
      }}</span>
    </div>

    <!-- Info Column -->
    <div class="flex-1 min-w-0">
      <h4 class="font-semibold text-text-primary truncate">
        Phỏng vấn #{{ interview.id.slice(-4) }}
      </h4>
      <p class="text-sm text-text-secondary truncate mt-0.5">
        Ứng viên ID:
        <span class="font-medium">{{
          interview.applicationId
        }}</span>
      </p>

      <div class="flex items-center gap-4 mt-2 mb-3">
        <div
          v-if="interview.location || interview.meetingLink"
          class="flex items-center gap-1.5 text-xs text-text-muted"
        >
          <a
            v-if="interview.meetingLink"
            :href="interview.meetingLink"
            target="_blank"
            class="text-brand hover:underline truncate max-w-[150px]"
            >Link tham gia</a
          >
          <span v-else class="truncate max-w-[150px]">{{
            interview.location
          }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-text-muted">
          <span>ID: {{ interview.id.slice(-6) }}</span>
        </div>
      </div>

      <!-- Interviewers -->
      <div class="flex items-center justify-between">
        <div class="flex -space-x-2">
          <div
            v-for="interviewerId in interview.interviewerIds || []"
            :key="interviewerId"
            class="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden z-10"
            :title="interviewerId"
          >
            <span class="text-[10px] font-medium text-gray-600">{{
              interviewerId.charAt(0).toUpperCase()
            }}</span>
          </div>
        </div>

        <!-- Action state -->
        <span
          v-if="interview.status === 'SCHEDULED'"
          class="text-xs font-medium text-brand bg-brand-light px-2 py-0.5 rounded"
        >
          Sắp tới
        </span>
        <span
          v-else-if="interview.status === 'COMPLETED'"
          class="text-xs font-medium text-success-dark bg-success-light px-2 py-0.5 rounded"
        >
          Hoàn tất
        </span>
        <span
          v-else
          class="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
        >
          Đã hủy
        </span>
      </div>
    </div>
  </div>
</template>
