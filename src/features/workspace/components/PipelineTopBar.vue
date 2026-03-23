<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ROUTE_NAMES } from "@/core/constants/route-names";
import { useToast } from "vue-toastification";
import { useJobStore } from "@/features/job/stores/useJobStore";
import { usePipelineStore } from "@/features/pipeline/stores/usePipelineStore";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const jobStore = useJobStore();
const pipelineStore = usePipelineStore();

// Compute whether to show pipeline specific header
const isPipelinePage = computed(() => route.name === ROUTE_NAMES.PIPELINE);

const currentJob = computed(() => {
  if (!pipelineStore.selectedJobId) return null;
  return jobStore.jobs.find((j) => j.id === pipelineStore.selectedJobId);
});

const showAlert = (msg: string) => toast.info(msg);

function handleBack() {
  if (isPipelinePage.value) {
    router.push({ name: ROUTE_NAMES.JOB_LIST });
  } else {
    router.back();
  }
}
</script>

<template>
  <div
    class="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 z-10 relative"
  >
    <!-- Left -->
    <div class="flex items-center gap-4">
      <button
        v-if="isPipelinePage"
        @click="handleBack"
        class="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        Quay lại
      </button>
      <div v-if="isPipelinePage" class="h-6 w-px bg-gray-200"></div>

      <div class="flex items-center gap-3">
        <div
          class="w-6 h-6 rounded bg-[#008C8C] text-white flex items-center justify-center font-bold text-xs"
        >
          VR
        </div>
        <template v-if="isPipelinePage && currentJob">
          <h1 class="font-semibold text-lg text-gray-900">
            {{ currentJob.title }}
          </h1>
          <span
            v-if="currentJob.department_id"
            class="bg-[#008C8C]/10 text-[#008C8C] px-2.5 py-0.5 rounded-full text-xs font-medium border border-[#008C8C]/20"
          >
            Đã xếp ban
          </span>
          <span
            v-if="currentJob.status === 'PUBLISHED'"
            class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-xs ml-2 border border-emerald-100"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đang
            tuyển
          </span>
          <span
            v-else
            class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium text-xs ml-2 border border-gray-200"
          >
            {{ currentJob.status === 'DRAFT' ? 'Bản nháp' : 'Đã đóng' }}
          </span>
        </template>
        <template v-else-if="isPipelinePage && pipelineStore.selectedJobId">
          <h1 class="font-semibold text-lg text-gray-900">
            Chi tiết Kênh tuyển dụng
          </h1>
        </template>
        <template v-else>
          <h1 class="font-semibold text-lg text-gray-900">
            VietRecruit
          </h1>
        </template>
      </div>
    </div>

    <!-- Right -->
    <div class="flex items-center gap-3">
      <button
        @click.prevent="showAlert('Tính năng [Chia sẻ] đang được phát triển!')"
        class="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
      >
        Chia sẻ
      </button>
      <button
        @click.prevent="showAlert('Tính năng [Cài đặt] đang được phát triển!')"
        class="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
      >
        Cài đặt
      </button>
      <button
        @click.prevent="
          showAlert('Tính năng [Thêm ứng viên] đang được phát triển!')
        "
        class="px-4 py-2 bg-[#008C8C] text-white hover:bg-[#007070] rounded-lg text-sm font-medium transition-colors shadow-sm"
      >
        Thêm ứng viên
      </button>
    </div>
  </div>
</template>
