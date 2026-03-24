<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  icon?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-2 border-dashed border-border rounded-lg bg-surface">
    <div v-if="icon || $slots.icon" class="mb-4 text-4xl text-gray-400 dark:text-gray-500">
      <slot name="icon">{{ icon }}</slot>
    </div>
    <h3 class="text-lg font-medium text-text-primary">{{ title }}</h3>
    <p v-if="description" class="mt-2 text-sm text-text-secondary max-w-sm">{{ description }}</p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action"></slot>
    </div>
  </div>
</template>
