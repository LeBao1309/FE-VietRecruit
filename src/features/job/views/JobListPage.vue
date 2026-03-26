<script setup lang="ts">
// src/features/job/views/JobListPage.vue
// Employer workspace view listing all job postings.

import { 
  Plus, 
  Search, 
  AlertCircle, 
  ChevronRight, 
  Briefcase,
  LayoutGrid,
  List as ListIcon
} from 'lucide-vue-next'
import JobTableRow from '../components/JobTableRow.vue'
import type { Job } from '@/features/workspace/types'

const props = defineProps<{
  jobs: Job[]
  isLoading: boolean
  error: string | null
  totalPages: number
  currentPage: number
  activeFilter: 'ALL' | 'DRAFT' | 'PUBLISHED' | 'CLOSED'
  quotaExceeded: boolean
}>()

const emit = defineEmits<{
  filterChange: [status: string]
  publish: [id: string]
  close: [id: string]
  create: []
  edit: [id: string]
  pageChange: [page: number]
}>()

const tabs = [
  { label: 'Tất cả', value: 'ALL' },
  { label: 'Bản nháp', value: 'DRAFT' },
  { label: 'Đang đăng', value: 'PUBLISHED' },
  { label: 'Đã đóng', value: 'CLOSED' },
] as const
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Quản lý tin tuyển dụng</h1>
        <p class="text-gray-500 text-sm mt-1">Quản lý và theo dõi trạng thái các vị trí đang tuyển dụng.</p>
      </div>
      
      <button 
        @click="emit('create')"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#009898] text-white rounded-xl font-bold hover:bg-[#007a7a] transition-all shadow-lg shadow-[#009898]/20"
      >
        <Plus class="w-5 h-5" />
        Đăng tin mới
      </button>
    </div>

    <!-- Quota Warning -->
    <div 
      v-if="quotaExceeded" 
      class="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl animate-in fade-in slide-in-from-top-2"
    >
      <div class="p-2 bg-amber-100 rounded-lg text-amber-600">
        <AlertCircle class="w-5 h-5" />
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-bold text-amber-900">Đã hết hạn mức đăng tin</h3>
        <p class="text-sm text-amber-700 mt-1">
          Gói hiện tại của bạn đã đạt giới hạn số tin tuyển dụng tối đa. Hãy nâng cấp gói để tiếp tục tuyển dụng.
        </p>
        <button class="mt-3 text-sm font-bold text-amber-900 flex items-center gap-1 hover:underline">
          Nâng cấp ngay <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Filters & Tabs -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="flex flex-col md:flex-row border-b border-gray-100">
        <div class="flex flex-1 p-1">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            @click="emit('filterChange', tab.value)"
            :class="[
              'flex-1 px-4 py-3 text-sm font-bold transition-all rounded-xl',
              activeFilter === tab.value 
                ? 'bg-[#009898]/10 text-[#009898]' 
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <div class="p-2 flex items-center gap-2">
          <div class="relative group">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#009898] transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm tin..." 
              class="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#009898]/20 w-full md:w-64 transition-all"
            />
          </div>
        </div>
      </div>

      <!-- Table Content -->
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <th class="px-4 py-4 font-bold">Tin tuyển dụng</th>
              <th class="px-4 py-4 font-bold">Trạng thái</th>
              <th class="px-4 py-4 font-bold">Mức lương</th>
              <th class="px-4 py-4 font-bold">Hạn nộp</th>
              <th class="px-4 py-4 font-bold">Ngày tạo</th>
              <th class="px-4 py-4 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          
          <tbody v-if="!isLoading && jobs.length > 0">
            <JobTableRow 
              v-for="job in jobs" 
              :key="job.id" 
              :job="job"
              @publish="emit('publish', $event)"
              @close="emit('close', $event)"
              @edit="emit('edit', $event)"
            />
          </tbody>
        </table>

        <!-- Loading Skeleton -->
        <div v-if="isLoading" class="p-8 space-y-4">
          <div v-for="i in 5" :key="i" class="h-16 bg-gray-50 rounded-xl animate-pulse"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="jobs.length === 0" class="py-20 text-center">
          <div class="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-gray-200">
            <Briefcase class="w-10 h-10" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Chưa có tin tuyển dụng nào</h3>
          <p class="text-gray-500 max-w-sm mx-auto mb-8">
            Bắt đầu thu hút ứng viên tài năng bằng cách tạo tin tuyển dụng đầu tiên của bạn.
          </p>
          <button 
            @click="emit('create')"
            class="px-8 py-3 bg-[#009898] text-white rounded-xl font-bold hover:bg-[#007a7a] transition-all shadow-lg shadow-[#009898]/20"
          >
            Đăng tin ngay
          </button>
        </div>
      </div>

      <!-- Footer / Pagination -->
      <div v-if="totalPages > 1" class="px-4 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <span class="text-xs text-gray-500">Trang {{ currentPage }} / {{ totalPages }}</span>
        <div class="flex items-center gap-1">
          <button 
            @click="emit('pageChange', currentPage - 1)"
            :disabled="currentPage === 1"
            class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight class="w-4 h-4 rotate-180" />
          </button>
          <button 
            @click="emit('pageChange', currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
