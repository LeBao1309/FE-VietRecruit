// src/features/pipeline/components/KanbanColumn.vue
// A single Kanban column for one ApplicationStatus.
// Uses vue-draggable-plus VueDraggable for cross-column drag-and-drop.
// Emits "move" with (applicationId, newStatus) on drag-end.
// Emits "open-card" with applicationId on card click.
<script setup lang="ts">
import { ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import ApplicationCard from './ApplicationCard.vue'
import type { Application, ApplicationStatus } from '@/features/pipeline/types/application.dto'

const props = defineProps<{
  status: ApplicationStatus
  label: string
  color: string
  apps: Application[]
}>()

const emit = defineEmits<{
  (e: 'move', id: string, newStatus: ApplicationStatus): void
  (e: 'open-card', id: string): void
}>()

// Local mutable copy for v-model on VueDraggable.
// Kept in sync with the store via watch (handles optimistic rollback re-renders).
const localApps = ref<Application[]>([...props.apps])

watch(
  () => props.apps,
  (next) => { localApps.value = [...next] },
  { deep: true },
)

function onDragEnd(event: { item: HTMLElement }): void {
  // The dragged HTMLElement carries the app id via data-app-id attribute.
  const id = event.item.dataset['appId']
  if (!id) return
  emit('move', id, props.status)
}
</script>

<template>
  <div
    data-testid="kanban-column"
    class="min-w-[272px] max-w-[272px] flex flex-col h-full shrink-0
           bg-white rounded-xl border border-border shadow-xs"
  >
    <!-- Column header -->
    <div
      class="px-4 py-3 border-b border-border flex items-center justify-between
             rounded-t-xl bg-surface-soft sticky top-0 z-10"
    >
      <div class="flex items-center gap-2">
        <span
          class="w-2.5 h-2.5 rounded-full shrink-0"
          :style="{ backgroundColor: color }"
        />
        <span class="text-sm font-semibold text-text-primary">{{ label }}</span>
        <Transition name="count-pop" mode="out-in">
          <span
            :key="apps.length"
            class="ml-1 bg-surface-muted text-text-muted text-xs font-mono
                   px-2 py-0.5 rounded-full"
          >
            {{ apps.length }}
          </span>
        </Transition>
      </div>
    </div>

    <!-- Draggable card list -->
    <div class="flex-1 overflow-y-auto">
      <VueDraggable
        v-model="localApps"
        class="min-h-[120px] h-full p-3 flex flex-col gap-2"
        group="pipeline-kanban"
        ghost-class="opacity-40 scale-95"
        chosen-class="ring-2 ring-brand/40 shadow-lg"
        :animation="200"
        @end="onDragEnd"
      >
        <div
          v-for="app in localApps"
          :key="app.id"
          :data-app-id="app.id"
        >
          <ApplicationCard
            :app="app"
            @click="emit('open-card', app.id)"
          />
        </div>
      </VueDraggable>
    </div>

    <!-- Empty state -->
    <div
      v-if="apps.length === 0"
      class="px-3 pb-3 pointer-events-none"
    >
      <div
        class="h-20 border-2 border-dashed border-border rounded-xl
               flex items-center justify-center text-text-muted text-xs"
      >
        Drop here
      </div>
    </div>
  </div>
</template>

<style scoped>
.count-pop-enter-active { animation: pop 0.2s ease-out; }
@keyframes pop {
  0%   { transform: scale(0.8); opacity: 0; }
  50%  { transform: scale(1.2); }
  100% { transform: scale(1);   opacity: 1; }
}
</style>
