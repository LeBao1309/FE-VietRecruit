<!-- src/features/pipeline/components/PipelineTopBar.vue -->
<!-- Top bar for the Pipeline page. Pure UI. -->
<script setup lang="ts">
import { Share2, Settings, UserPlus, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  jobTitle: string | null
  jobStatus: 'PUBLISHED' | 'DRAFT' | 'CLOSED' | null
  department: string | null
}>()

const emit = defineEmits<{
  (e: 'share'): void
  (e: 'settings'): void
  (e: 'addCandidate'): void
}>()

const statusConfig = {
  PUBLISHED: { label: 'Đang tuyển', class: 'bg-green-50 text-green-700 border-green-200' },
  DRAFT: { label: 'Bản nháp', class: 'bg-gray-50 text-gray-700 border-gray-200' },
  CLOSED: { label: 'Đã đóng', class: 'bg-red-50 text-red-700 border-red-200' }
}
</script>

<template>
  <header class="h-16 bg-white border-b border-border px-6 flex items-center justify-between shrink-0">
    <!-- Left: Breadcrumbs & Job Info -->
    <div class="flex items-center gap-4">
      <nav class="flex items-center text-xs font-bold uppercase tracking-widest text-text-muted">
        <span>Workspace</span>
        <ChevronRight class="w-3 h-3 mx-1" />
        <span class="text-text-primary">Pipeline</span>
      </nav>
      
      <div class="h-6 w-px bg-border mx-2"></div>
      
      <div v-if="jobTitle" class="flex items-center gap-3">
        <h1 class="text-sm font-black text-text-primary truncate max-w-[200px]">
          {{ jobTitle }}
        </h1>
        <span 
          v-if="jobStatus"
          :class="['px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider', statusConfig[jobStatus].class]"
        >
          {{ statusConfig[jobStatus].label }}
        </span>
        <span v-if="department" class="text-xs text-text-muted">
          &bull; {{ department }}
        </span>
      </div>
      <div v-else class="text-sm text-text-muted italic">
        Vui lòng chọn công việc...
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-2">
      <button 
        @click="emit('share')"
        class="p-2 rounded-lg hover:bg-surface-soft text-text-muted transition-colors"
        title="Chia sẻ"
      >
        <Share2 class="w-4 h-4" />
      </button>
      <button 
        @click="emit('settings')"
        class="p-2 rounded-lg hover:bg-surface-soft text-text-muted transition-colors"
        title="Cài đặt Job"
      >
        <Settings class="w-4 h-4" />
      </button>
      
      <div class="w-px h-6 bg-border mx-2"></div>
      
      <button 
        @click="emit('addCandidate')"
        class="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-all shadow-brand-sm font-bold text-xs uppercase tracking-wide"
      >
        <UserPlus class="w-4 h-4" />
        Thêm ứng viên
      </button>
    </div>
  </header>
</template>
