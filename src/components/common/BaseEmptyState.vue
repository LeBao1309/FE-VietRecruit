<script setup lang="ts">
defineProps<{
 title: string
 description?: string
 icon?: string
}>()
</script>

<template>
 <div class="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 ">
 <div v-if="icon || $slots.icon" class="mb-4 text-4xl text-slate-300 ">
 <slot name="icon">{{ icon }}</slot>
 </div>
 <h3 class="text-lg font-bold text-slate-900 ">{{ title }}</h3>
 <p v-if="description" class="mt-2 text-sm font-medium text-slate-500 max-w-sm">{{ description }}</p>
 <div v-if="$slots.action" class="mt-6">
 <slot name="action"></slot>
 </div>
 </div>
</template>
