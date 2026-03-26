<!-- src/features/interview/views/InterviewListPage.vue -->
<!-- Page listing all interviews with filtering and scheduling. Pure UI. -->
<script setup lang="ts">
import { Calendar, Search, Filter, Plus, AlertCircle } from 'lucide-vue-next'
import InterviewCard from '../components/InterviewCard.vue'
import InterviewScheduleForm from '../components/InterviewScheduleForm.vue'

interface Interview {
  id: string
  applicationId: string
  jobId: string
  scheduledAt: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED'
  location?: string
  meetingLink?: string
  notes?: string
  interviewerIds: string[]
}

const props = defineProps<{
  interviews: Interview[]
  isLoading: boolean
  error: string | null
  activeFilter: 'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELED'
  showScheduleForm: boolean
  applicationId: string
  jobId: string
}>()

const emit = defineEmits<{
  (e: 'filterChange', status: string): void
  (e: 'complete', id: string): void
  (e: 'cancel', id: string): void
  (e: 'openScheduleForm'): void
  (e: 'closeScheduleForm'): void
  (e: 'scheduleCreated', interview: Interview): void
  (e: 'generateQuestions', context: any): void
}>()

const filters = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'SCHEDULED', label: 'Đã lên lịch' },
  { id: 'COMPLETED', label: 'Đã xong' },
  { id: 'CANCELED', label: 'Đã hủy' },
]
</script>

<template>
  <div class="p-8 max-w-7xl mx-auto space-y-8">
    <!-- Header -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-3xl font-black text-text-primary uppercase tracking-tight">Quản lý Phỏng vấn</h1>
        <p class="text-sm text-text-muted mt-1 font-medium">Theo dõi và điều phối các buổi phỏng vấn của bạn.</p>
      </div>
      <button 
        @click="emit('openScheduleForm')"
        class="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-brand-lg hover:bg-brand-dark transition-all"
      >
        <Plus class="w-5 h-5" /> Lên lịch mới
      </button>
    </header>

    <!-- Filters & Search -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl border border-border">
      <div class="flex items-center gap-1 p-1 bg-surface-soft rounded-xl w-full md:w-auto">
        <button 
          v-for="f in filters" 
          :key="f.id"
          @click="emit('filterChange', f.id)"
          class="flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
          :class="activeFilter === f.id ? 'bg-white text-brand shadow-sm' : 'text-text-muted hover:text-text-primary'"
        >
          {{ f.label }}
        </button>
      </div>

      <div class="relative w-full md:w-72 px-2">
        <Search class="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input 
          type="text" 
          placeholder="Tìm kiếm phỏng vấn..."
          class="w-full pl-10 pr-4 py-2.5 bg-surface-soft border-transparent rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all outline-none"
        />
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="p-12 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4">
      <AlertCircle class="w-12 h-12 text-red-500 mx-auto" />
      <h3 class="text-lg font-black text-red-700 uppercase">Đã có lỗi xảy ra</h3>
      <p class="text-sm text-red-600 font-medium">{{ error }}</p>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 6" :key="n" class="h-64 bg-white border border-border rounded-2xl animate-pulse"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="interviews.length === 0" class="py-24 text-center space-y-4 bg-white border border-dashed border-border rounded-3xl">
      <div class="w-20 h-20 bg-surface-soft rounded-full flex items-center justify-center mx-auto text-text-muted/30">
        <Calendar class="w-10 h-10" />
      </div>
      <h3 class="text-xl font-black text-text-primary uppercase tracking-tight">Không có buổi phỏng vấn nào</h3>
      <p class="text-sm text-text-muted font-medium">Thay đổi bộ lọc hoặc lên lịch buổi phỏng vấn mới.</p>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <InterviewCard 
        v-for="interview in interviews" 
        :key="interview.id"
        :interview="interview"
        :can-manage="true"
        @complete="emit('complete', $event)"
        @cancel="emit('cancel', $event)"
      />
    </div>

    <!-- Schedule Form Modal -->
    <Transition 
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <InterviewScheduleForm 
        v-if="showScheduleForm"
        :application-id="applicationId"
        :job-id="jobId"
        @cancel="emit('closeScheduleForm')"
        @submit="(p) => emit('scheduleCreated', p)"
        @generate-questions="emit('generateQuestions', $event)"
      />
    </Transition>
  </div>
</template>
