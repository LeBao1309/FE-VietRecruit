<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  statusCode: string
}>()

// "Happy Path" config for visual timeline on the list preview
const stages = [
  { id: 'NEW', label: 'Applied' },
  { id: 'SCREENING', label: 'Screening' },
  { id: 'INTERVIEW', label: 'Interview' },
  { id: 'OFFER', label: 'Offer' },
  { id: 'HIRED', label: 'Hired' },
]

const normalizedCode = computed(() => props.statusCode.toUpperCase())

const isRejected = computed(() => normalizedCode.value === 'REJECTED')
const isWithdrawn = computed(() => normalizedCode.value === 'WITHDRAWN')

// Calculate current step index on the happy path
const activeIndex = computed(() => {
  if (isRejected.value || isWithdrawn.value) return -1
  
  // Search from highest to lowest step
  for (let i = stages.length - 1; i >= 0; i--) {
     const stage = stages[i]
     if (stage && normalizedCode.value.startsWith(stage.id)) {
       return i
     }
  }
  return 0 // default to NEW
})

const currentLabel = computed(() => {
  if (isRejected.value) return 'Rejected'
  if (isWithdrawn.value) return 'Withdrawn'
  
  const stage = stages[activeIndex.value]
  return stage ? stage.label : 'Applied'
})
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-between mb-2">
       <span 
         class="text-[10px] font-black tracking-wider uppercase"
         :class="isRejected ? 'text-rose-500' : isWithdrawn ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'"
       >
         {{ currentLabel }}
       </span>
       <span v-if="!isRejected && !isWithdrawn" class="text-[10px] font-bold text-teal-600 dark:text-teal-400">
         Step {{ activeIndex + 1 }} of {{ stages.length }}
       </span>
    </div>
    <div class="flex items-center gap-1.5 w-full">
      <div
        v-for="(stage, index) in stages"
        :key="stage.id"
        class="flex-1 h-1.5 rounded-full transition-all duration-500"
        :class="[
          isRejected 
            ? 'bg-rose-500/30 dark:bg-rose-500/20' 
            : isWithdrawn
              ? 'bg-slate-300 dark:bg-slate-700'
              : index <= activeIndex 
                ? (index === activeIndex ? 'bg-teal-500 dark:bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.5)]' : 'bg-teal-500/50 dark:bg-teal-400/30')
                : 'bg-slate-200 dark:bg-slate-800'
        ]"
      />
    </div>
  </div>
</template>
