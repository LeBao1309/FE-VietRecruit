<script setup lang="ts">
import { computed } from 'vue'
import { getStageConfig } from '@/core/constants/pipeline-stages'
import type { ApplicationStatus } from '@/core/constants/enums'

const props = defineProps<{ status: string }>()

const stageConfig = computed(() => getStageConfig(props.status as ApplicationStatus))
</script>

<template>
  <span 
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
    :style="{ backgroundColor: stageConfig.color + '1A', color: stageConfig.textColor, borderColor: stageConfig.color + '40' }"
  >
    <span 
      class="w-1.5 h-1.5 rounded-full mr-1.5" 
      :style="{ backgroundColor: stageConfig.dotColor }"
    ></span>
    {{ stageConfig.label }}
  </span>
</template>
