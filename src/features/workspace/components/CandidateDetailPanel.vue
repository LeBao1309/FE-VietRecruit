<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { ApplicationWithDetails } from "../types";

import CommentThread from "./CommentThread.vue";

const props = defineProps<{
  candidate: ApplicationWithDetails;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const aiScore = computed(() => {
  if (
    props.candidate &&
    props.candidate.scorecards &&
    props.candidate.scorecards.length > 0
  ) {
    const score = props.candidate.scorecards[0]?.average_score;
    return score ? Math.round(score) : 0;
  }
  return 0;
});

const avatar = computed(() => props.candidate.candidate?.user?.avatar_url);
const name = computed(
  () => props.candidate.candidate?.user?.full_name || "Unknown",
);
const role = computed(
  () => props.candidate.candidate?.headline || props.candidate.job?.title,
);
const email = computed(() => props.candidate.candidate?.user?.email || "");

// AI score bar animation
const scoreProgress = ref(0);
onMounted(() => {
  setTimeout(() => {
    scoreProgress.value = aiScore.value;
  }, 100);
});

// Tabs State
type Tab = "overview" | "timeline" | "comments" | "scorecards";
const activeTab = ref<Tab>("overview");
const tabs = [
  { id: "overview", label: "Tổng quan" },
  { id: "timeline", label: "Lịch sử" },
  { id: "comments", label: "Bình luận" },
  { id: "scorecards", label: "Scorecards" },
];

// Mock quick comment state
const newComment = ref("");
const mockHistory = ref<any[]>([
  {
    id: "init-1",
    application_id: props.candidate.id,
    new_status: "NEW",
    notes: "Đã thêm ứng viên vào hệ thống",
    changed_by: "system",
    changed_at: new Date().toISOString(),
  },
]);

const handleAddComment = (notes: string) => {
  mockHistory.value.push({
    id: Date.now().toString(),
    application_id: props.candidate.id,
    new_status: props.candidate.status,
    notes: notes,
    changed_by: "current_user",
    changed_at: new Date().toISOString(),
  });
  newComment.value = "";
};
</script>

<template>
  <div
    class="w-[320px] bg-white border-l border-gray-200 flex flex-col h-full shadow-xl flex-shrink-0 relative overflow-hidden"
  >
    <!-- Close -->
    <button
      @click="emit('close')"
      class="absolute top-4 right-4 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors z-20"
    >
      Đóng
    </button>

    <div class="overflow-y-auto flex-1 p-6 pb-24 relative z-10">
      <!-- Header -->
      <div class="mb-8">
        <div v-if="avatar" class="w-14 h-14 rounded-full overflow-hidden mb-4">
          <img :src="avatar" class="w-full h-full object-cover" />
        </div>
        <div
          v-else
          class="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-4 border border-gray-100 shadow-sm relative"
        >
          <span class="text-xl font-bold text-gray-600">{{
            name.charAt(0)
          }}</span>
        </div>

        <h2 class="text-xl font-bold text-gray-900 leading-tight">
          {{ name }}
        </h2>
        <p class="text-gray-500 font-medium">{{ role }}</p>
      </div>

      <div class="h-px bg-gray-100 w-full mb-0 mt-6"></div>

      <!-- Tabs Navigation -->
      <div
        class="flex border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :data-testid="`tab-btn-${tab.id}`"
          @click="activeTab = tab.id as Tab"
          class="px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center justify-center min-w-max"
          :class="
            activeTab === tab.id
              ? 'border-[#008C8C] text-[#008C8C]'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          "
        >
          <span data-testid="tab-label">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Tab Content: Overview -->
      <div v-show="activeTab === 'overview'" data-testid="tab-overview">
        <!-- Info -->
        <div class="mb-8 space-y-3">
          <div class="flex flex-col gap-1 text-sm text-gray-600">
            <div class="flex justify-between">
              <span class="text-gray-400">Email:</span>
              <a href="#" class="hover:text-[#008C8C] hover:underline">{{ email }}</a>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">SĐT:</span>
              <span>+84 (Chưa cập nhật)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Địa chỉ:</span>
              <span>Hồ Chí Minh, Việt Nam</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Liên kết:</span>
              <a href="#" class="text-[#008C8C] hover:underline">linkedin.com/in/...</a>
            </div>
          </div>
        </div>

        <!-- AI Đánh giá -->
        <div class="mb-8">
          <h3
            class="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"
          >
            AI Đánh giá
          </h3>
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div class="flex justify-between text-sm mb-2">
              <span class="font-medium text-gray-700">Độ phù hợp</span>
              <span
                data-testid="ai-score-badge"
                class="font-bold whitespace-nowrap"
                :class="
                  aiScore >= 80
                    ? 'text-[#059669]'
                    : aiScore >= 60
                      ? 'text-[#d97706]'
                      : 'text-gray-600'
                "
              >
                {{ aiScore }}%
              </span>
            </div>
            <div
              class="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-3"
            >
              <div
                class="h-full rounded-full transition-all duration-1000 ease-out"
                :class="
                  aiScore >= 80
                    ? 'bg-[#059669]'
                    : aiScore >= 60
                      ? 'bg-[#d97706]'
                      : 'bg-gray-400'
                "
                :style="{ width: `${scoreProgress}%` }"
              ></div>
            </div>
            <p
              class="text-xs text-gray-600 leading-relaxed italic border-l-2 pl-2"
              :class="
                aiScore >= 80
                  ? 'border-[#059669]'
                  : aiScore >= 60
                    ? 'border-[#d97706]'
                    : 'border-gray-400'
              "
            >
              "Ứng viên có kinh nghiệm vững chắc với vị trí {{ role }}. Hệ thống
              AI đánh giá độ phù hợp ổn định dựa trên thông tin hồ sơ."
            </p>
          </div>
        </div>
      </div>

      <!-- Tab Content: Timeline -->
      <div v-show="activeTab === 'timeline'" data-testid="tab-timeline">
        <div class="space-y-4">
          <div class="flex gap-3" data-testid="timeline-item">
            <div class="mt-0.5 w-5 flex flex-col items-center">
              <div
                class="w-2.5 h-2.5 rounded-full bg-[#059669] ring-4 ring-[#ecfdf5]"
              ></div>
              <div class="w-px h-10 bg-gray-200 my-1"></div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">Nộp hồ sơ</p>
              <p class="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                {{
                  new Date(candidate.created_at || "").toLocaleDateString(
                    "vi-VN",
                  ) || "N/A"
                }}
              </p>
            </div>
          </div>
          <div
            class="flex gap-3"
            v-if="candidate.status !== 'NEW'"
            data-testid="timeline-item"
          >
            <div class="mt-0.5 w-5 flex flex-col items-center">
              <div
                class="w-2.5 h-2.5 rounded-full bg-[#d97706] ring-4 ring-[#fffbeb]"
              ></div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-900">
                Chuyển sang: {{ candidate.status }}
              </p>
              <p class="text-xs text-gray-500 mt-0.5">Vừa xong</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Comments -->
      <div
        v-show="activeTab === 'comments'"
        class="flex flex-col h-[400px]"
        data-testid="tab-comments"
      >
        <!-- Input -->
        <div class="relative mb-6">
          <textarea
            v-model="newComment"
            data-testid="comment-input"
            rows="3"
            placeholder="Thêm bình luận..."
            class="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#008C8C]/20 focus:border-[#008C8C] transition-all resize-none"
            @keydown.enter.prevent="handleAddComment(newComment)"
          ></textarea>
          <button
            @click="handleAddComment(newComment)"
            data-testid="comment-submit-btn"
            :disabled="!newComment.trim()"
            class="absolute bottom-2 right-2 px-3 py-1.5 text-xs font-medium bg-[#008C8C] hover:bg-[#007070] disabled:bg-gray-300 text-white rounded-md transition-colors"
          >
            Gửi
          </button>
        </div>

        <div class="space-y-4 flex-1">
          <CommentThread
            data-testid="comment-thread"
            :history="mockHistory"
            @add-comment="handleAddComment"
          />
        </div>
      </div>

      <!-- Tab Content: Scorecards -->
      <div v-show="activeTab === 'scorecards'" data-testid="tab-scorecards">
        <div
          class="flex flex-col items-center py-10 px-4 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50"
        >
          <div
            class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3"
          >
            <span class="text-xl">📊</span>
          </div>
          <p class="text-sm font-semibold text-gray-900 mb-1">
            Chưa có Scorecard nào
          </p>
          <p class="text-xs text-gray-500 mb-4 px-2">
            Hoàn thành phỏng vấn để tạo bản đánh giá ứng viên cụ thể
          </p>

          <div class="relative group">
            <button
              disabled
              data-testid="add-scorecard-btn"
              class="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed"
            >
              Add Scorecard
            </button>
            <div
              class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10"
            >
              Coming in Phase 4
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <div
      class="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex flex-col gap-2 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-20"
    >
      <button
        @click="emit('close')"
        class="w-full py-2.5 bg-[#008C8C] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-sm hover:shadow"
      >
        Chuyển giai đoạn
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <button
        @click="emit('close')"
        class="w-full py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium text-sm transition-colors mt-1"
      >
        Từ chối ứng viên
      </button>
    </div>
  </div>
</template>
