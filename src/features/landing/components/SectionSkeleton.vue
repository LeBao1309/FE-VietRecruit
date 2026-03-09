<script setup lang="ts">
interface Props {
  height?: string; // reserved height, default '400px'
}
withDefaults(defineProps<Props>(), { height: "400px" });
</script>

<template>
  <div
    class="w-full overflow-hidden"
    :style="{ minHeight: height }"
    aria-hidden="true"
  >
    <!-- Shimmer placeholder bars -->
    <div class="max-w-7xl mx-auto px-6 py-16 space-y-4 animate-pulse">
      <!-- Fake section badge -->
      <div class="h-5 w-24 rounded-full bg-gray-100 mx-auto" />
      <!-- Fake heading -->
      <div class="h-8 w-80 rounded-lg bg-gray-100 mx-auto" />
      <div class="h-8 w-56 rounded-lg bg-gray-100 mx-auto" />
      <!-- Fake content grid -->
      <div class="grid grid-cols-3 gap-4 pt-8">
        <div v-for="i in 3" :key="i" class="h-40 rounded-2xl bg-gray-100" />
      </div>
    </div>
  </div>
</template>
