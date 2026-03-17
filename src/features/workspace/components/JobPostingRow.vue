<script setup lang="ts">
import { useRouter } from "vue-router";
import type { JobWithDetails } from "../types";

defineProps<{
  job: JobWithDetails;
}>();

const router = useRouter();

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-[#009898]/10 text-[#009898]",
  CLOSED: "bg-red-50 text-red-600",
};

const statusLabels = {
  DRAFT: "Bản nháp",
  PUBLISHED: "Đang mở",
  CLOSED: "Đã đóng",
};
</script>

<template>
  <div
    @click="router.push('/workspace/applications')"
    class="flex items-center justify-between p-4 bg-white border border-border rounded-xl hover:shadow-hover hover:border-brand-muted transition-all group cursor-pointer"
  >
    <div class="flex items-start gap-4">
      <div>
        <h3
          class="font-semibold text-text-primary group-hover:text-brand transition-colors"
        >
          {{ job.title }}
        </h3>
        <div class="flex items-center gap-3 mt-1 text-sm text-text-secondary">
          <span class="flex items-center">
            <!-- TODO(api-ready): replace mock field job.headcount -> jobs.headcount -->
            {{ job.department?.name || "Chưa xếp ban" }} • 3 tuyển
          </span>
          <span class="w-1 h-1 rounded-full bg-border-strong"></span>
          <span class="flex items-center">
            Hạn chót:
            {{
              new Date(job.deadline || "").toLocaleDateString("vi-VN") || "N/A"
            }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-6">
      <div class="text-right">
        <div class="text-2xl font-bold text-text-primary">
          {{ job.applicationCount || 0 }}
        </div>
        <div class="text-xs text-text-muted">Ứng viên</div>
      </div>

      <span
        :class="[
          'px-2.5 py-1 rounded-md text-xs font-medium',
          statusColors[job.status] || 'bg-gray-100 text-gray-600',
        ]"
      >
        {{ statusLabels[job.status] || job.status }}
      </span>
    </div>
  </div>
</template>
