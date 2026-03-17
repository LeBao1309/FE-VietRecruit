<script setup lang="ts">
import { ref } from "vue";
import type { ApplicationStatusHistory } from "../types";

defineProps<{
  history: ApplicationStatusHistory[];
}>();

const newComment = ref("");
const emit = defineEmits<{
  (e: "add-comment", notes: string): void;
}>();

const submitComment = () => {
  if (newComment.value.trim()) {
    emit("add-comment", newComment.value.trim());
    newComment.value = "";
  }
};
</script>

<template>
  <div class="flex flex-col h-full max-h-[400px]">
    <div class="flex items-center mb-4">
      <h3 class="text-sm font-semibold text-text-primary">Thảo luận đội ngũ</h3>
    </div>

    <div class="flex-1 overflow-y-auto pr-2 space-y-4">
      <div v-for="item in history" :key="item.id" class="flex gap-3">
        <div
          class="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center shrink-0"
        >
          <!-- TODO(api-ready): history.changed_by -> fetch user detail -->
          <span class="text-xs font-medium text-text-secondary">AI</span>
        </div>
        <div
          class="flex-1 bg-surface-muted rounded-xl rounded-tl-none p-3 shadow-sm border border-border"
        >
          <div class="flex justify-between items-start mb-1">
            <span class="text-xs font-semibold text-text-primary"
              >Hệ thống</span
            >
            <span class="text-[10px] text-text-muted">{{
              new Date(item.changed_at || "").toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}</span>
          </div>
          <p class="text-sm text-text-secondary whitespace-pre-line">
            {{ item.notes || `Chuyển trạng thái sang ${item.new_status}` }}
          </p>
        </div>
      </div>

      <div
        v-if="history.length === 0"
        class="text-center py-8 text-text-muted text-sm border-2 border-dashed border-border-subtle rounded-xl"
      >
        Chưa có bình luận nào
      </div>
    </div>

    <div class="mt-4 flex gap-2">
      <input
        v-model="newComment"
        @keyup.enter="submitComment"
        type="text"
        placeholder="Thêm bình luận..."
        class="flex-1 bg-surface text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
      />
      <button
        @click="submitComment"
        class="bg-brand hover:bg-brand-dark text-white px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-brand-sm"
        :disabled="!newComment.trim()"
      >
        Gửi
      </button>
    </div>
  </div>
</template>
