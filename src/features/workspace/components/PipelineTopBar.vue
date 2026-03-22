<script setup lang="ts">
import { useRouter } from "vue-router";
import { ROUTE_NAMES } from "@/core/constants/route-names";
import { mockJobs } from "../mocks/pipeline.mock";
import { useToast } from "vue-toastification";

const currentJob = mockJobs[0]!;
const router = useRouter();
const toast = useToast();
const showAlert = (msg: string) => toast.info(msg);
</script>

<template>
  <div
    class="h-16 px-6 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 z-10 relative"
  >
    <!-- Left -->
    <div class="flex items-center gap-4">
      <button
        @click="router.push({ name: ROUTE_NAMES.WORKSPACE })"
        class="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        Quay lại
      </button>
      <div class="h-6 w-px bg-gray-200"></div>

      <div class="flex items-center gap-3">
        <div
          class="w-6 h-6 rounded bg-[#008C8C] text-white flex items-center justify-center font-bold text-xs"
        >
          VR
        </div>
        <h1 class="font-semibold text-lg text-gray-900">
          {{ currentJob.title }}
        </h1>
        <span
          class="bg-[#008C8C]/10 text-[#008C8C] px-2.5 py-0.5 rounded-full text-xs font-medium border border-[#008C8C]/20"
        >
          {{ currentJob.department?.name || "Tất cả ban" }}
        </span>
        <span
          class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-xs ml-2 border border-emerald-100"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đang
          tuyển
        </span>
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
