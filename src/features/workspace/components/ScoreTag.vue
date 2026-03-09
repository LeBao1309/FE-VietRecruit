<script setup lang="ts">
import { computed } from "vue";
import type { ScorecardResult } from "../types";

const props = defineProps<{
  result: ScorecardResult;
  score?: number | null;
}>();

const config = computed(() => {
  switch (props.result) {
    case "PASS":
      return {
        label: "Đạt",
        class: "bg-success-light text-success-dark border-success",
      };
    case "FAIL":
      return {
        label: "Không Đạt",
        class: "bg-danger-light text-danger-dark border-danger",
      };
    case "CONSIDERING":
      return {
        label: "Cân nhắc",
        class: "bg-warning-light text-warning-dark border-warning",
      };
    default:
      return {
        label: "N/A",
        class: "bg-neutral-100 text-neutral-600 border-neutral-300",
      };
  }
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap border',
      config.class,
    ]"
  >
    {{ config.label }}
    <span v-if="score" class="ml-1 opacity-80 border-l border-current pl-1">
      {{ score.toFixed(1) }}
    </span>
  </span>
</template>
