<script setup lang="ts">
// src/features/job/views/JobFormPage.vue
// Enhanced Job Form Page using the modular JobForm component.
// Handles store integration and AI service triggers.

import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ROUTE_NAMES } from '@/core/constants/route-names'
import PipelineSidebar from '@/features/workspace/components/PipelineSidebar.vue'
import PipelineTopBar from '@/features/workspace/components/PipelineTopBar.vue'
import JobForm from '../components/JobForm.vue'
import { useJobStore } from '../stores/useJobStore'
import { useToast } from 'vue-toastification'

const router = useRouter()
const route = useRoute()
const jobStore = useJobStore()
const toast = useToast()

const mode = computed(() => route.params.id ? 'edit' : 'create')
const jobId = computed(() => route.params.id as string)

// ── Mock master data (In production, fetch these on mount) ──────────────────
const departments = [
  { id: 'dept-engineering', name: 'Kỹ thuật & Công nghệ' },
  { id: 'dept-design', name: 'Thiết kế & Sáng tạo' },
  { id: 'dept-marketing', name: 'Marketing & Truyền thông' },
]
const locations = [
  { id: 'loc-hanoi', name: 'Hà Nội' },
  { id: 'loc-hcm', name: 'TP. Hồ Chí Minh' },
  { id: 'loc-remote', name: 'Làm việc từ xa' },
]
const categories = [
  { id: 'cat-it', name: 'Công nghệ thông tin' },
  { id: 'cat-sales', name: 'Kinh doanh / Bán hàng' },
  { id: 'cat-hr', name: 'Nhân sự' },
]

// ── AI States ──────────────────────────────────────────────────────────────
const aiJdState = ref({
  isGenerating: false,
  content: null as string | null,
  error: null as string | null
})

const salaryBenchmarkState = ref({
  isLoading: false,
  data: null as any,
  error: null as string | null
})

// ── Handlers ──────────────────────────────────────────────────────────────
const handleSave = async (data: any) => {
  try {
    if (mode.value === 'create') {
      await jobStore.createJob(data)
      toast.success('Đã lưu bản nháp thành công.')
    } else {
      // await jobStore.updateJob(jobId.value, data)
      toast.success('Đã cập nhật tin tuyển dụng.')
    }
    router.push({ name: ROUTE_NAMES.JOB_LIST })
  } catch (err: any) {
    toast.error('Có lỗi xảy ra khi lưu tin.')
  }
}

const handlePublish = async () => {
  const id = jobId.value || jobStore.currentJob?.id
  if (!id) return
  try {
    await jobStore.publishJob(id)
    toast.success('Đã đăng tuyển thành công!')
    router.push({ name: ROUTE_NAMES.JOB_LIST })
  } catch (err: any) {
    if (err.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('quota:exceeded'))
    }
  }
}

const handleClose = async () => {
  const id = jobId.value || jobStore.currentJob?.id
  if (!id) return
  try {
    await jobStore.closeJob(id)
    toast.success('Đã đóng tin tuyển dụng.')
    router.push({ name: ROUTE_NAMES.JOB_LIST })
  } catch (err: any) {
    toast.error('Không thể đóng tin vào lúc này.')
  }
}

// ── AI Service Simulation (Mocked for UI demonstration) ───────────────────
const generateAiDescription = async (context: any) => {
  aiJdState.value.isGenerating = true
  aiJdState.value.error = null
  
  // Simulate AI API call
  setTimeout(() => {
    aiJdState.value.content = `### Mô tả công việc: ${context.title}
Chúng tôi đang tìm kiếm một chuyên gia tài năng tham gia vào đội ngũ ${context.department}.

**Trách nhiệm chính:**
- Phát triển và duy trì các ứng dụng chất lượng cao.
- Phối hợp với đội ngũ thiết kế để triển khai giao diện người dùng.
- Tối ưu hóa hiệu suất ứng dụng.

**Yêu cầu:**
${context.requirements || '- Có ít nhất 3 năm kinh nghiệm trong lĩnh vực liên quan.'}
- Am hiểu về quy trình phát triển phần mềm hiện đại.
- Kỹ năng giải quyết vấn đề tốt.`
    aiJdState.value.isGenerating = false
  }, 2000)
}

const estimateSalary = async (context: any) => {
  salaryBenchmarkState.value.isLoading = true
  salaryBenchmarkState.value.error = null
  
  // Simulate Salary API call
  setTimeout(() => {
    salaryBenchmarkState.value.data = {
      min: 15000000,
      max: 45000000,
      median: 28000000,
      currency: 'VND',
      sampleSize: 142
    }
    salaryBenchmarkState.value.isLoading = false
  }, 1500)
}

onMounted(() => {
  if (jobId.value) {
    // jobStore.fetchJob(jobId.value)
  }
})
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-slate-50 overflow-hidden text-slate-900">
    <PipelineTopBar />

    <div class="flex-1 flex overflow-hidden">
      <PipelineSidebar />

      <main class="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-hide bg-slate-50/50">
        <JobForm 
          :mode="mode"
          :initialData="jobStore.currentJob"
          :isLoading="jobStore.isLoading"
          :isSaving="jobStore.isLoading"
          :error="jobStore.error"
          :departments="departments"
          :locations="locations"
          :categories="categories"
          :canPublish="jobStore.currentJob?.status === 'DRAFT' || mode === 'create'"
          :canClose="jobStore.currentJob?.status === 'PUBLISHED'"
          :aiJdState="aiJdState"
          :salaryBenchmarkState="salaryBenchmarkState"
          @save="handleSave"
          @publish="handlePublish"
          @close="handleClose"
          @cancel="router.push({ name: ROUTE_NAMES.JOB_LIST })"
          @generateDescription="generateAiDescription"
          @estimateSalary="estimateSalary"
        />
      </main>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
