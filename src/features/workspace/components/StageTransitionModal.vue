<script setup lang="ts">
import { X, ArrowRight } from "lucide-vue-next";
import { type ApplicationStatus } from "../types";

defineProps<{
  show: boolean;
  candidateName: string;
  sourceStage: { id: ApplicationStatus; label: string; color: string };
  targetStage: { id: ApplicationStatus; label: string; color: string };
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();
</script>

<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
    >
      <div
        class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div
          class="p-4 border-b border-gray-100 flex items-center justify-between"
        >
          <h3 class="text-lg font-bold text-gray-900">
            Xác nhận chuyển giai đoạn
          </h3>
          <button
            @click="emit('cancel')"
            :disabled="isLoading"
            class="p-1.5 text-gray-400 hover:text-gray-900 rounded-md transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6">
          <p class="text-sm text-gray-600 mb-6">
            Bạn có chắc muốn chuyển ứng viên
            <strong class="text-gray-900">{{ candidateName }}</strong> sang giai
            đoạn mới?
          </p>

          <div
            class="flex items-center justify-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100 mb-2"
          >
            <!-- Source Stage -->
            <div class="flex flex-col items-center">
              <span
                class="w-3 h-3 rounded-full mb-1 border border-gray-200"
                :style="{ backgroundColor: sourceStage.color }"
              ></span>
              <span class="text-xs font-semibold text-gray-700">{{
                sourceStage.label
              }}</span>
            </div>

            <ArrowRight class="w-5 h-5 text-gray-400" />

            <!-- Target Stage -->
            <div class="flex flex-col items-center">
              <span
                class="w-3 h-3 rounded-full mb-1 border border-gray-200 ring-2 ring-offset-1"
                :style="{
                  backgroundColor: targetStage.color,
                }"
              ></span>
              <span class="text-xs font-bold text-gray-900">{{
                targetStage.label
              }}</span>
            </div>
          </div>
        </div>

        <div
          class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3"
        >
          <button
            @click="emit('cancel')"
            :disabled="isLoading"
            data-testid="cancel-transition-btn"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            @click="emit('confirm')"
            :disabled="isLoading"
            data-testid="confirm-transition-btn"
            class="px-5 py-2 text-sm font-medium text-white bg-[#008C8C] rounded-lg hover:bg-[#007070] transition-colors shadow-sm disabled:opacity-75 flex items-center gap-2 min-w-[120px] justify-center"
          >
            <div
              v-if="isLoading"
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></div>
            <span v-else>Xác nhận</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95) translateY(10px);
}
</style>
