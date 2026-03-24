<!-- src/features/pipeline/components/KanbanColumn.vue -->
<!-- Horizontal column for the Kanban board. Pure UI. -->
<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { MoreHorizontal } from 'lucide-vue-next'
import ApplicationCard from './ApplicationCard.vue'

interface Application {
  id: string
  candidateId: string
  jobId: string
  status: string
  aiScore: number | null
  coverLetter: string | null
  cvUrl: string
  createdAt: string
}

const props = defineProps<{
  status: string
  label: string
  color: string
  apps: Application[]
  selectedCardId?: string | null
  isAiPending?: boolean
}>()

const emit = defineEmits<{
  (e: 'move', id: string, newStatus: string): void
  (e: 'openCard', id: string): void
  (e: 'triggerScreening', jobId: string): void
  (e: 'viewCv', url: string): void
}>()

function onDragEnd(evt: any) {
  // vue-draggable-plus event handles the logic, but we need to emit the move
  // Actually, VueDraggable handles the list update. 
  // For a pure UI component, we can let the parent handle the list update via move event.
  // But usually, draggable updates the bound list.
}

// Wrapper for move emission if needed, though draggable-plus often handles it via @add/@update
</script>

<template>
  <div class="flex flex-col min-w-[300px] w-[300px] bg-surface-soft rounded-xl border border-border h-full max-h-full">
    <!-- Header -->
    <div class="p-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div 
          class="w-2.5 h-2.5 rounded-full" 
          :style="{ backgroundColor: color }"
        ></div>
        <h3 class="font-bold text-sm text-text-primary uppercase tracking-wide">
          {{ label }}
        </h3>
        <span class="px-2 py-0.5 rounded-full bg-white border border-border text-[10px] font-black text-text-muted">
          {{ apps.length }}
        </span>
      </div>
      <button class="text-text-muted hover:text-text-primary transition-colors">
        <MoreHorizontal class="w-4 h-4" />
      </button>
    </div>

    <!-- Draggable Area -->
    <div class="flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-[150px]">
      <VueDraggable
        v-model="props.apps"
        group="pipeline-kanban"
        :animation="150"
        ghost-class="opacity-40"
        drag-class="rotate-2"
        class="flex flex-col gap-3 h-full"
        @add="(e) => emit('move', e.item._value.id, status)"
      >
        <ApplicationCard
          v-for="app in apps"
          :key="app.id"
          :app="app"
          :is-selected="selectedCardId === app.id"
          :is-ai-pending="isAiPending"
          @click="emit('openCard', app.id)"
          @trigger-screening="emit('triggerScreening', $event)"
          @view-cv="emit('viewCv', $event)"
        />

        <!-- Empty state within draggable to allow dropping -->
        <template v-if="apps.length === 0">
          <div class="flex-1 border-2 border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center p-8 opacity-50">
            <p class="text-xs font-bold text-text-muted uppercase tracking-widest">Trống</p>
          </div>
        </template>
      </VueDraggable>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for column */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.1);
}
</style>
