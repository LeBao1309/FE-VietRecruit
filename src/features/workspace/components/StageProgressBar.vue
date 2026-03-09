<script setup lang="ts">
import { computed } from "vue";
import { useWorkspaceStore } from "../../../stores/useWorkspaceStore";
import { storeToRefs } from "pinia";

const workspaceStore = useWorkspaceStore();
const { pipelineFunnel: stages } = storeToRefs(workspaceStore);

const total = computed(() =>
  stages.value.reduce((acc, stage) => acc + stage.count, 0),
);
</script>

<template>
  <div class="w-full">
    <div class="flex justify-between items-end mb-2">
      <span class="text-sm font-semibold text-text-primary"
        >Phễu Tuyển Dụng</span
      >
      <span class="text-xs text-text-muted">{{ total }} Tổng cộng</span>
    </div>

    <div class="flex h-3 w-full rounded-full overflow-hidden bg-neutral-100">
      <div
        v-for="stage in stages"
        :key="stage.id"
        class="h-full transition-all duration-500 hover:opacity-80 relative group"
        :style="{
          width: `${total ? (stage.count / total) * 100 : 0}%`,
          backgroundColor: stage.color,
        }"
      >
        <!-- Tooltip -->
        <div
          class="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded whitespace-nowrap z-10 pointer-events-none transition-opacity"
        >
          {{ stage.label }}: {{ stage.count }}
        </div>
      </div>
    </div>

    <div class="flex gap-4 mt-3 flex-wrap">
      <div
        v-for="stage in stages"
        :key="stage.id"
        class="flex items-center gap-1.5 text-xs text-text-secondary"
      >
        <span
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: stage.color }"
        ></span>
        {{ stage.label }} ({{ stage.count }})
      </div>
    </div>
  </div>
</template>
