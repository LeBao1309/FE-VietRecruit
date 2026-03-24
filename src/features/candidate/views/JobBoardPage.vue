<script setup lang="ts">
// src/features/candidate/views/JobBoardPage.vue
// Public job board view with search, filtering, and pagination.

import { MapPin, Briefcase, Search, Sparkles } from 'lucide-vue-next'
import JobCard from '../components/JobCard.vue'
import JobSearchBar from '../components/JobSearchBar.vue'
import type { JobSummaryResponse } from '../types/job.schema'

const props = defineProps<{
  jobs: JobSummaryResponse[]
  isLoading: boolean
  error: string | null
  totalPages: number
  currentPage: number
  totalElements: number
  categories: Array<{ id: string; name: string }>
  locations: Array<{ id: string; name: string }>
}>()

const emit = defineEmits<{
  search: [params: { keyword?: string; categoryId?: string; locationId?: string }]
  pageChange: [page: number]
  selectJob: [id: string]
  autocomplete: [query: string]
}>()

const suggestions: string[] = [] // In real app, this comes from store/props
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC]">
    <!-- Hero Section -->
    <div class="bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 pt-20 pb-40 px-4">
      <div class="max-w-7xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#009898]/10 text-[#009898] rounded-full text-xs font-bold uppercase tracking-widest mb-6 animate-bounce">
          <Sparkles class="w-4 h-4" />
          Nâng tầm sự nghiệp cùng VietRecruit
        </div>
        <h1 class="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
          Tìm kiếm <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#009898] to-emerald-400">việc làm mơ ước</span> của bạn
        </h1>
        <p class="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
          Kết nối với hàng ngàn cơ hội việc làm hấp dẫn từ các công ty hàng đầu tại Việt Nam. 
          Bắt đầu hành trình mới ngay hôm nay!
        </p>

        <!-- Enhanced Search Bar Overlay -->
        <div class="relative z-10 -mb-12">
          <JobSearchBar 
            :categories="categories"
            :locations="locations"
            :suggestions="suggestions"
            :isSearching="isLoading"
            @search="emit('search', $event)"
            @autocomplete="emit('autocomplete', $event)"
          />
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 pt-24 pb-20">
      <!-- Results Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">
            {{ totalElements > 0 ? `Tìm thấy ${totalElements} việc làm phù hợp` : 'Tất cả việc làm' }}
          </h2>
          <p class="text-slate-500 text-sm mt-1">Cập nhật mới nhất hôm nay</p>
        </div>
        
        <div class="flex items-center gap-3">
          <!-- Sort/Filter placeholder -->
          <span class="text-sm text-slate-500">Sắp xếp theo:</span>
          <select class="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] outline-none transition-all">
            <option>Mới nhất</option>
            <option>Lương cao nhất</option>
            <option>Hạn nộp gần nhất</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 6" :key="i" class="h-64 bg-slate-200 rounded-2xl animate-pulse"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-2xl p-12 text-center max-w-2xl mx-auto">
        <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-bold text-red-900 mb-2">Đã xảy ra lỗi</h3>
        <p class="text-red-700 mb-6">{{ error }}</p>
        <button @click="emit('pageChange', 1)" class="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors">
          Thử lại
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="jobs.length === 0" class="bg-white border border-slate-100 rounded-2xl p-20 text-center shadow-sm">
        <div class="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search class="w-10 h-10" />
        </div>
        <h3 class="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy việc làm</h3>
        <p class="text-slate-500 max-w-md mx-auto mb-8">
          Chúng tôi không tìm thấy kết quả nào phù hợp với tìm kiếm của bạn. Hãy thử thay đổi từ khóa hoặc bộ lọc khác.
        </p>
        <button @click="emit('search', {})" class="px-8 py-3 bg-[#009898] text-white rounded-xl font-bold hover:bg-[#007a7a] transition-all shadow-lg shadow-[#009898]/20">
          Xem tất cả việc làm
        </button>
      </div>

      <!-- Job Grid -->
      <div v-else class="space-y-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <JobCard 
            v-for="job in jobs" 
            :key="job.id" 
            :job="job" 
            @click="emit('selectJob', $event)"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center pt-8 border-t border-slate-100">
          <nav class="flex items-center gap-2">
            <button 
              @click="emit('pageChange', currentPage - 1)"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            <div class="flex items-center gap-1">
              <button 
                v-for="p in totalPages" 
                :key="p"
                @click="emit('pageChange', p)"
                :class="[
                  'w-10 h-10 rounded-lg font-bold text-sm transition-all',
                  currentPage === p 
                    ? 'bg-[#009898] text-white shadow-lg shadow-[#009898]/20' 
                    : 'text-slate-600 hover:bg-slate-50'
                ]"
              >
                {{ p }}
              </button>
            </div>

            <button 
              @click="emit('pageChange', currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
    
    <!-- Newsletter / CTA -->
    <div class="bg-white border-t border-slate-100 py-20">
      <div class="max-w-5xl mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold text-slate-900 mb-4">Bạn vẫn chưa tìm thấy việc làm ưng ý?</h2>
        <p class="text-slate-500 text-lg mb-10">Đừng bỏ lỡ những cơ hội mới nhất. Hãy để chúng tôi gửi thông báo ngay khi có việc làm phù hợp với bạn.</p>
        <div class="flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto">
          <input type="email" placeholder="Địa chỉ email của bạn" class="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] outline-none transition-all" />
          <button class="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all">Đăng ký ngay</button>
        </div>
      </div>
    </div>
  </div>
</template>
