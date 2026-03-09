<script setup lang="ts">
import { computed } from "vue";
import { Video, Clock, MapPin } from "lucide-vue-next";
import type { InterviewWithDetails } from "../types";

const props = defineProps<{
  interview: InterviewWithDetails;
}>();

const interviewTime = computed(() => {
  const date = new Date(props.interview.scheduled_at);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const interviewDate = computed(() => {
  const date = new Date(props.interview.scheduled_at);
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
        {{ interview.title }}
      </h4>
      <p class="text-sm text-text-secondary truncate mt-0.5">
        Ứng viên:
        <span class="font-medium">{{
          interview.application.candidate.user.full_name
        }}</span>
      </p>

      <div class="flex items-center gap-4 mt-2 mb-3">
        <div
          v-if="interview.location_or_link"
          class="flex items-center gap-1.5 text-xs text-text-muted"
        >
          <Video
            v-if="interview.location_or_link.includes('http')"
            class="w-3.5 h-3.5"
          />
          <MapPin v-else class="w-3.5 h-3.5" />
          <a
            v-if="interview.location_or_link.includes('http')"
            :href="interview.location_or_link"
            target="_blank"
            class="text-brand hover:underline truncate max-w-[150px]"
            >Link tham gia</a
          >
          <span v-else class="truncate max-w-[150px]">{{
            interview.location_or_link
          }}</span>
        </div>
        <div class="flex items-center gap-1.5 text-xs text-text-muted">
          <Clock class="w-3.5 h-3.5" />
          <span>{{ interview.duration_minutes }} phút</span>
        </div>
      </div>

      <!-- Interviewers -->
      <div class="flex items-center justify-between">
        <div class="flex -space-x-2">
          <div
            v-for="user in interview.interviewers"
            :key="user.id"
            class="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden z-10"
            :title="user.full_name"
          >
            <img
              v-if="user.avatar_url"
              :src="user.avatar_url"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-[10px] font-medium text-gray-600">{{
              user.full_name.charAt(0)
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
