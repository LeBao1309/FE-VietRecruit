<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  score: number;
}>();

const badgeClass = computed(() => {
  if (props.score >= 80) return "bg-[#ecfdf5] text-[#059669]"; // success
  if (props.score >= 60) return "bg-[#fffbeb] text-[#d97706]"; // warning
  return "bg-[#f3f4f6] text-[#6b7280]"; // muted
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap',
      badgeClass,
    ]"
  >
    AI: {{ score }}%
  </span>
</template>
