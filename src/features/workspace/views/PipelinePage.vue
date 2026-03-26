<!-- src/features/workspace/views/PipelinePage.vue -->
<!-- Full Kanban board view for the ATS Pipeline. Pure UI. -->
<script setup lang="ts">
import { ref } from 'vue'
import { AlertCircle, ChevronRight, Search } from 'lucide-vue-next'
import PipelineTopBar from '../../pipeline/components/PipelineTopBar.vue'
import PipelineSidebar from '../../pipeline/components/PipelineSidebar.vue'
import KanbanColumn from '@/features/pipeline/components/KanbanColumn.vue'
import ApplicationDetailDrawer from '@/features/pipeline/components/ApplicationDetailDrawer.vue'

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

interface Column {
  status: string
  label: string
  color: string
  apps: Application[]
}

interface ApplicationDetail extends Application {
  statusHistory: any[]
}

const props = defineProps<{
  columns: Column[]
  selectedJob: { id: string; title: string; status: any; department?: string } | null
  isLoading: boolean
  dragError: string | null
  selectedDetail: ApplicationDetail | null
  isDetailLoading: boolean
  screeningResult?: any
  allowedTransitions: Array<{ status: string; label: string }>
}>()

const emit = defineEmits<{
  (e: 'moveCard', id: string, newStatus: string): void
  (e: 'openCard', id: string): void
  (e: 'closeDetail'): void
  (e: 'triggerAiScreening', jobId: string): void
  (e: 'transitionStatus', id: string, newStatus: string): void
  (e: 'navigate', route: string): void
}>()

const activeSidebarRoute = ref('pipeline')

// Mock stats for sidebar (could also be props, but spec says Sidebar takes stats)
const sidebarStats = [
  { status: 'NEW', label: 'Mới', count: 12, color: '#3b82f6' },
  { status: 'SCREENING', label: 'Sàng lọc', count: 8, color: '#f59e0b' },
  { status: 'INTERVIEW', label: 'Phỏng vấn', count: 5, color: '#8b5cf6' },
]
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-surface overflow-hidden font-sans">
    <!-- Top Bar -->
    <PipelineTopBar 
      :job-title="selectedJob?.title || null"
      :job-status="selectedJob?.status || null"
      :department="selectedJob?.department || null"
      @share="() => {}"
      @settings="() => {}"
      @add-candidate="() => {}"
    />

    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <PipelineSidebar 
        :stats="sidebarStats"
        :conversion-rate="32"
        :active-route="activeSidebarRoute"
        @navigate="(r) => { activeSidebarRoute = r; emit('navigate', r) }"
      />

      <!-- Main Kanban Area -->
      <main class="flex-1 flex flex-col min-w-0 bg-surface-soft overflow-hidden relative">
        
        <!-- Drag Error Banner -->
        <Transition 
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="-translate-y-full opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="-translate-y-full opacity-0"
        >
          <div 
            v-if="dragError" 
            class="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-500/50 backdrop-blur-md"
          >
            <AlertCircle class="w-5 h-5" />
            <p class="text-sm font-black uppercase tracking-widest">{{ dragError }}</p>
          </div>
        </Transition>

        <!-- No Job Selected State -->
        <div 
          v-if="!selectedJob && !isLoading" 
          class="flex-1 flex flex-col items-center justify-center p-12 text-center"
        >
          <div class="w-24 h-24 bg-brand/5 rounded-full flex items-center justify-center mb-8 animate-bounce-slow">
            <Search class="w-10 h-10 text-brand/40" />
          </div>
          <h2 class="text-2xl font-black text-text-primary mb-2 uppercase tracking-tight">Vui lòng chọn công việc</h2>
          <p class="text-text-muted max-w-sm mb-8">
            Chọn một công việc từ danh sách để xem quy trình tuyển dụng và quản lý ứng viên của bạn.
          </p>
          <button 
            class="px-8 py-3 bg-brand text-white rounded-xl font-bold uppercase tracking-widest shadow-brand-lg hover:bg-brand-dark transition-all"
            @click="emit('navigate', 'jobs')"
          >
            Danh sách Job
          </button>
        </div>

        <!-- Loading State -->
        <div v-else-if="isLoading" class="flex-1 flex gap-4 p-6 overflow-x-auto">
          <div 
            v-for="n in 6" 
            :key="n" 
            class="min-w-[300px] w-[300px] bg-white/50 border border-border/50 rounded-xl animate-pulse flex flex-col p-4 space-y-4"
          >
            <div class="h-6 w-1/2 bg-gray-200 rounded"></div>
            <div class="space-y-3">
              <div v-for="i in 3" :key="i" class="h-24 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>

        <!-- Kanban Board -->
        <div v-else class="flex-1 flex gap-6 p-6 overflow-x-auto scrollbar-hide">
          <KanbanColumn 
            v-for="col in columns"
            :key="col.status"
            :status="col.status"
            :label="col.label"
            :color="col.color"
            :apps="col.apps"
            :selected-card-id="selectedDetail?.id"
            @move="emit('moveCard', $event.id, $event.newStatus)"
            @open-card="emit('openCard', $event)"
            @trigger-screening="emit('triggerAiScreening', $event)"
          />
        </div>
      </main>
    </div>

    <!-- Application Detail Drawer -->
    <Transition 
      enter-active-class="transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <ApplicationDetailDrawer 
        v-if="selectedDetail"
        :detail="selectedDetail"
        :is-loading="isDetailLoading"
        :allowed-transitions="allowedTransitions"
        :screening-result="screeningResult"
        @close="emit('closeDetail')"
        @transition="emit('transitionStatus', selectedDetail.id, $event)"
      />
    </Transition>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

@keyframes bounce-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
.animate-bounce-slow {
  animation: bounce-slow 3s infinite ease-in-out;
}
</style>
