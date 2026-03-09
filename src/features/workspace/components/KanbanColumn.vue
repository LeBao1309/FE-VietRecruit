<script setup lang="ts">
import { computed } from "vue";
import { Plus } from "lucide-vue-next";
import { VueDraggable } from "vue-draggable-plus";
import CandidateCard from "./CandidateCard.vue";
import type { ApplicationWithDetails, ApplicationStatus } from "../types";

const props = defineProps<{
  stage: { id: ApplicationStatus; label: string; color: string };
  candidates: ApplicationWithDetails[];
  selectedCandidateId?: string | null;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "update:candidates", val: ApplicationWithDetails[]): void;
}>();

const localList = computed({
  get: () => props.candidates,
  set: (val) => emit("update:candidates", val),
});
</script>

<template>
  <div
    data-testid="kanban-column"
    class="min-w-[280px] max-w-[280px] flex flex-col h-full shrink-0"
  >
    <div
      class="bg-[#F8FAFA] rounded-t-xl px-4 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10"
    >
      <div class="flex items-center gap-2 text-sm font-medium text-gray-900">
        <div
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: stage.color }"
        ></div>
        {{ stage.label }}
        <Transition name="count-pop" mode="out-in">
          <span
            :key="candidates.length"
            data-testid="column-count"
            class="bg-gray-100 text-gray-500 text-xs font-mono px-2 py-0.5 rounded-full ml-1"
          >
            {{ candidates.length }}
          </span>
        </Transition>
      </div>
      <button
        @click.prevent=""
        class="text-gray-400 hover:text-[#008C8C] hover:bg-[#008C8C]/10 rounded-lg p-1 transition-colors"
      >
        <Plus class="w-4 h-4" />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto w-[280px] relative">
      <VueDraggable
        v-model="localList"
        class="h-full min-h-[150px] p-3 flex flex-col gap-2 bg-gray-50/50"
        group="kanban-kanban"
        ghost-class="opacity-50"
      >
        <CandidateCard
          v-for="candidate in localList"
          :key="candidate.id"
          :candidate="candidate"
          :selected="selectedCandidateId === candidate.id"
          @click="emit('select', candidate.id)"
        />
      </VueDraggable>

      <!-- Empty state overlay -->
      <div
        v-if="candidates.length === 0"
        class="absolute inset-0 pointer-events-none p-3"
      >
        <div
          class="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm bg-white/50"
        >
          Trống
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.count-pop-enter-active {
  animation: pop 0.2s ease-out;
}
@keyframes pop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
