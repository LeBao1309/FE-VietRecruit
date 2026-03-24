<script setup lang="ts">
// src/features/candidate/views/JobDetailPage.vue
// Public job detail view with apply functionality.

import { getErrorMessage } from '@/core/utils/error'
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobBoardStore } from '../stores/job-board.store'
import { jobService } from '../services/job.service'
import ApplyDialog from '../components/ApplyDialog.vue'
import { 
  MapPin, 
  Banknote, 
  Calendar, 
  Building2, 
  ArrowLeft, 
  Briefcase, 
  Clock, 
  Users, 
  GraduationCap 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useJobBoardStore()

const jobId = route.params.id as string
const isLoading = ref(true)
const error = ref<string | null>(null)
const isApplyDialogOpen = ref(false)

const formatCurrency = (value?: number | null, currency?: string | null) => {
  if (value == null) return ''
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: currency || 'VND',
    maximumFractionDigits: 0
  }).format(value)
}

const getSalaryDisplay = (job: any) => {
  if (job.isNegotiable) return 'Thỏa thuận'
  if (job.minSalary && job.maxSalary) {
    return `${formatCurrency(job.minSalary, job.currency)} - ${formatCurrency(job.maxSalary, job.currency)}`
  }
  if (job.minSalary) return `Từ ${formatCurrency(job.minSalary, job.currency)}`
  if (job.maxSalary) return `Đến ${formatCurrency(job.maxSalary, job.currency)}`
  return 'Thỏa thuận'
}

onMounted(async () => {
  if (!jobId) {
    router.replace({ name: 'JobBoard' })
    return
  }
  
  isLoading.value = true
  try {
    store.selectedJob = await jobService.getPublicJob(jobId)
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    isLoading.value = false
  }
})

const goBack = () => router.back()
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Navigation -->
      <button @click="goBack" class="mb-8 flex items-center text-sm font-bold text-slate-500 hover:text-[#009898] transition-colors group">
        <div class="p-1.5 rounded-lg bg-white shadow-sm border border-slate-200 mr-3 group-hover:border-[#009898]/30 transition-all">
          <ArrowLeft class="w-4 h-4" />
        </div>
        Quay lại danh sách
      </button>

      <!-- Loading State -->
      <div v-if="isLoading" class="animate-pulse space-y-8">
        <div class="h-48 bg-white rounded-3xl w-full border border-slate-100"></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 h-96 bg-white rounded-3xl border border-slate-100"></div>
          <div class="h-64 bg-white rounded-3xl border border-slate-100"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 text-red-600 rounded-2xl p-10 text-center border border-red-100 font-bold max-w-2xl mx-auto shadow-sm">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle class="w-8 h-8" />
        </div>
        {{ error }}
      </div>

      <!-- Main Content -->
      <div v-else-if="store.selectedJob" class="space-y-8">
        <!-- Job Header Card -->
        <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start justify-between relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-[#009898]/5 rounded-full -mr-16 -mt-16"></div>
          
          <div class="flex items-start gap-8 relative z-10">
            <!-- Company Logo -->
            <div class="w-24 h-24 bg-white border border-slate-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner flex items-center justify-center p-3">
              <img v-if="store.selectedJob.companyLogoUrl" :src="store.selectedJob.companyLogoUrl" class="w-full h-full object-contain" />
              <Building2 v-else class="w-12 h-12 text-slate-200" />
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#009898]/10 text-[#009898] rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                {{ store.selectedJob.categoryName || 'Việc làm' }}
              </div>
              <h1 class="text-3xl font-extrabold text-slate-900 leading-tight">{{ store.selectedJob.title }}</h1>
              <p class="text-xl text-[#009898] font-bold mt-2 hover:underline cursor-pointer transition-all">{{ store.selectedJob.companyName }}</p>
              
              <div class="flex flex-wrap gap-6 mt-6 text-sm">
                <div class="flex items-center gap-2.5 text-slate-600 font-semibold bg-slate-50 px-4 py-2 rounded-xl">
                  <Banknote class="w-5 h-5 text-[#009898]" />
                  {{ getSalaryDisplay(store.selectedJob) }}
                </div>
                <div class="flex items-center gap-2.5 text-slate-600 font-semibold bg-slate-50 px-4 py-2 rounded-xl">
                  <MapPin class="w-5 h-5 text-[#009898]" />
                  {{ store.selectedJob.locationName || 'Toàn quốc' }}
                </div>
              </div>
            </div>
          </div>

          <div class="w-full md:w-auto mt-6 md:mt-0 relative z-10 flex flex-col gap-4">
            <button 
              @click="isApplyDialogOpen = true" 
              class="w-full md:w-auto bg-[#009898] text-white font-extrabold py-4 px-10 rounded-2xl shadow-lg shadow-[#009898]/20 hover:bg-[#007a7a] hover:shadow-xl hover:-translate-y-0.5 transition-all whitespace-nowrap text-lg"
            >
              Ứng tuyển ngay
            </button>
            <div v-if="store.selectedJob.deadline" class="flex items-center justify-center md:justify-end gap-2 text-xs font-bold text-slate-400">
              <Calendar class="w-4 h-4 text-red-400" />
              Hạn nộp: <span class="text-red-500">{{ new Date(store.selectedJob.deadline).toLocaleDateString('vi-VN') }}</span>
            </div>
          </div>
        </div>

        <!-- Detail Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Job Description -->
            <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
              <h2 class="text-xl font-extrabold text-slate-900 flex items-center gap-3 mb-8">
                <div class="w-1.5 h-6 bg-[#009898] rounded-full"></div>
                Mô tả công việc
              </h2>
              <div v-html="store.selectedJob.description" class="text-slate-700 leading-relaxed whitespace-pre-wrap text-base font-medium"></div>
            </div>

            <!-- Requirements -->
            <div v-if="store.selectedJob.requirements" class="bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
              <h2 class="text-xl font-extrabold text-slate-900 flex items-center gap-3 mb-8">
                <div class="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
                Yêu cầu công việc
              </h2>
              <div v-html="store.selectedJob.requirements" class="text-slate-700 leading-relaxed whitespace-pre-wrap text-base font-medium"></div>
            </div>

            <!-- Benefits -->
            <div v-if="store.selectedJob.benefits" class="bg-white rounded-3xl shadow-sm border border-slate-100 p-10">
              <h2 class="text-xl font-extrabold text-slate-900 flex items-center gap-3 mb-8">
                <div class="w-1.5 h-6 bg-amber-400 rounded-full"></div>
                Quyền lợi được hưởng
              </h2>
              <div v-html="store.selectedJob.benefits" class="text-slate-700 leading-relaxed whitespace-pre-wrap text-base font-medium"></div>
            </div>
          </div>

          <!-- Sidebar Info -->
          <div class="space-y-6 sticky top-8">
            <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h3 class="font-extrabold text-lg text-slate-900 mb-8 flex items-center gap-3">
                <div class="w-1 h-5 bg-slate-900 rounded-full"></div>
                Thông tin chung
              </h3>
              
              <ul class="space-y-6">
                <li class="flex items-start gap-4">
                  <div class="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:text-[#009898] transition-colors">
                    <Briefcase class="w-5 h-5" />
                  </div>
                  <div>
                    <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Kinh nghiệm</span>
                    <span class="text-sm font-bold text-slate-800">{{ store.selectedJob.experienceLevel || 'Không yêu cầu' }}</span>
                  </div>
                </li>
                
                <li class="flex items-start gap-4">
                  <div class="p-2.5 bg-slate-50 rounded-xl text-slate-400">
                    <Users class="w-5 h-5" />
                  </div>
                  <div>
                    <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Số lượng tuyển</span>
                    <span class="text-sm font-bold text-slate-800">{{ store.selectedJob.numOfVacancies || 'Không giới hạn' }}</span>
                  </div>
                </li>
                
                <li class="flex items-start gap-4">
                  <div class="p-2.5 bg-slate-50 rounded-xl text-slate-400">
                    <Clock class="w-5 h-5" />
                  </div>
                  <div>
                    <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Hình thức làm việc</span>
                    <span class="text-sm font-bold text-slate-800">{{ store.selectedJob.workingOptions || 'Toàn thời gian' }}</span>
                  </div>
                </li>
                
                <li class="flex items-start gap-4">
                  <div class="p-2.5 bg-slate-50 rounded-xl text-slate-400">
                    <GraduationCap class="w-5 h-5" />
                  </div>
                  <div>
                    <span class="block text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cấp bậc</span>
                    <span class="text-sm font-bold text-slate-800">{{ store.selectedJob.rank || 'Nhân viên' }}</span>
                  </div>
                </li>
              </ul>
            </div>
            
            <!-- Quick Tips Card -->
            <div class="bg-gradient-to-br from-[#009898] to-emerald-500 rounded-3xl p-8 text-white shadow-lg shadow-[#009898]/20">
              <h4 class="font-bold mb-3 flex items-center gap-2">
                <Sparkles class="w-5 h-5" />
                Mẹo cho bạn
              </h4>
              <p class="text-xs text-white/80 leading-relaxed font-medium">
                Hãy chuẩn bị một CV thật ấn tượng và một lá thư ngỏ (Cover Letter) chỉn chu để tăng 80% cơ hội trúng tuyển.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Apply Modal -->
      <ApplyDialog 
        v-if="isApplyDialogOpen && store.selectedJob" 
        :job-id="store.selectedJob.id" 
        :job-title="store.selectedJob.title" 
        @close="isApplyDialogOpen = false"
        @success="isApplyDialogOpen = false; router.push({ name: 'MyApplications' })" 
      />
    </div>
  </div>
</template>
