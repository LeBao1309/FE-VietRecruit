<script setup lang="ts">
// src/features/workspace/views/PipelinePage.vue
// Full Kanban board view for the ATS Pipeline (Module 5).
// Layout shell matches WorkspacePage.vue exactly.
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePipelineStore } from '@/features/pipeline/stores/usePipelineStore'
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from '@/features/pipeline/types/application.dto'
import PipelineTopBar from '../components/PipelineTopBar.vue'
import PipelineSidebar from '../components/PipelineSidebar.vue'
import KanbanColumn from '@/features/pipeline/components/KanbanColumn.vue'
import ApplicationDetailDrawer from '@/features/pipeline/components/ApplicationDetailDrawer.vue'

// ── Store ────────────────────────────────────────────────────────────────────
const store = usePipelineStore()
const {
  applicationsByStatus,
  isLoading,
  error,
  openDetailId,
  detailCache,
  isDetailLoading,
} = storeToRefs(store)

// ── Job ID from query: /workspace/pipeline?jobId=xxx ────────────────────────
const route = useRoute()
const jobId = computed(() => (route.query['jobId'] as string) ?? '')

// ── Drag error toast ─────────────────────────────────────────────────────────
const dragError = ref<string | null>(null)
let errorTimer: ReturnType<typeof setTimeout> | null = null

function showDragError(msg: string): void {
  dragError.value = msg
  if (errorTimer) clearTimeout(errorTimer)
  errorTimer = setTimeout(() => { dragError.value = null }, 4000)
}

// ── Column display config ────────────────────────────────────────────────────
const COLUMN_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  NEW:       { label: 'New',       color: '#64748B' },
  SCREENING: { label: 'Screening', color: '#F59E0B' },
  INTERVIEW: { label: 'Interview', color: '#3B82F6' },
  OFFER:     { label: 'Offer',     color: '#8B5CF6' },
  HIRED:     { label: 'Hired',     color: '#10B981' },
  REJECTED:  { label: 'Rejected',  color: '#EF4444' },
}

const columns = computed(() =>
  APPLICATION_STATUSES.map((s) => ({
    status: s,
    label: COLUMN_CONFIG[s].label,
    color: COLUMN_CONFIG[s].color,
    apps: applicationsByStatus.value[s],
  })),
)

// ── Drag handler (called by KanbanColumn on drag-end) ────────────────────────
async function handleMove(id: string, newStatus: ApplicationStatus): Promise<void> {
  try {
    await store.moveApplication(id, newStatus)
  } catch {
    showDragError('Status update failed. The card has been rolled back to its original column.')
  }
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  if (jobId.value) store.fetchApplications(jobId.value)
})
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-surface overflow-hidden text-text-primary font-sans">
    <PipelineTopBar />

    <div class="flex-1 flex overflow-hidden">
      <PipelineSidebar />

      <main class="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface-soft scrollbar-hide">

        <!-- Page header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-6 pb-4 border-b border-border">
          <div>
            <nav class="flex text-sm text-text-muted mb-1 font-medium">
              <span class="hover:text-brand cursor-pointer">VietRecruit</span>
              <span class="mx-2">/</span>
              <span class="text-text-primary">Pipeline</span>
            </nav>
            <h1 class="text-2xl font-display font-bold text-text-primary">ATS Pipeline</h1>
          </div>
        </div>

        <!-- Drag error banner -->
        <Transition name="fade">
          <div
            v-if="dragError"
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2"
            role="alert"
          >
            <span class="font-semibold">Error:</span> {{ dragError }}
          </div>
        </Transition>

        <!-- General fetch error -->
        <div
          v-if="error && !isLoading && !dragError"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
        >
          {{ error }}
        </div>

        <!-- No job selected -->
        <div
          v-if="!jobId && !isLoading"
          class="flex items-center justify-center h-64 text-text-muted text-sm"
        >
          Select a job posting from the sidebar to view its pipeline.
        </div>

        <!-- Loading skeletons -->
        <div v-else-if="isLoading" class="flex gap-4 overflow-x-auto pb-4">
          <div
            v-for="n in 6"
            :key="n"
            class="min-w-[272px] h-80 bg-white border border-border rounded-xl animate-pulse shrink-0"
          />
        </div>

        <!-- Kanban board -->
        <div v-else class="flex gap-4 overflow-x-auto h-full pb-6">
          <KanbanColumn
            v-for="col in columns"
            :key="col.status"
            :status="col.status"
            :label="col.label"
            :color="col.color"
            :apps="col.apps"
            @move="handleMove"
            @open-card="store.openDetail($event)"
          />
        </div>

      </main>
    </div>

    <!-- Application detail drawer with slide-in transition -->
    <Transition name="drawer-slide">
      <ApplicationDetailDrawer
        v-if="openDetailId"
        :detail="openDetailId && detailCache[openDetailId] ? detailCache[openDetailId] : null"
        :is-loading="isDetailLoading"
        @close="store.closeDetail()"
      />
    </Transition>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
