<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  width?: string
  height?: string
  radius?: string
  type?: 'text' | 'circular' | 'rectangular'
}>()

const skeletonClass = computed(() => {
  const base = 'bg-gray-200 dark:bg-gray-700 animate-pulse'
  
  if (props.type === 'circular') {
    return `${base} rounded-full`
  }
  
  if (props.type === 'rectangular') {
    return `${base} ${props.radius || 'rounded-md'}`
  }
  
  // Default to text if not specified
  return `${base} ${props.radius || 'rounded'}`
})

const skeletonStyle = computed(() => {
  return {
    width: props.width || (props.type === 'circular' ? '2.5rem' : '100%'),
    height: props.height || (props.type === 'circular' ? '2.5rem' : props.type === 'text' ? '1rem' : '5rem'),
  }
})
</script>

<template>
  <div :class="skeletonClass" :style="skeletonStyle" aria-hidden="true"></div>
</template>
