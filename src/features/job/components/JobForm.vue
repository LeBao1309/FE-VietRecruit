<script setup lang="ts">
// src/features/job/components/JobForm.vue
// Pure UI component for creating/editing jobs.
// Communicates solely via props and emits.

import { ref, reactive, computed, watch } from 'vue'
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Sparkles, 
  TrendingUp, 
  Save, 
  Send, 
  XCircle,
  Clock,
  Briefcase,
  MapPin,
  Tag,
  Loader2
} from 'lucide-vue-next'
import AiJdGeneratorPanel from './AiJdGeneratorPanel.vue'
import SalaryBenchmarkPanel from './SalaryBenchmarkPanel.vue'

interface JobFormData {
  title: string
  department_id: string
  location_id: string
  category_id: string
  deadline: string
  min_salary?: number
  max_salary?: number
  currency: string
  is_negotiable: boolean
  description: string
  requirements?: string
}

const props = defineProps<{
  mode: 'create' | 'edit'
  initialData: Partial<JobFormData> | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  departments: Array<{ id: string; name: string }>
  locations: Array<{ id: string; name: string }>
  categories: Array<{ id: string; name: string }>
  canPublish: boolean
  canClose: boolean
  // AI states (passed from parent or managed locally if parent provides content)
  aiJdState: { isGenerating: boolean; content: string | null; error: string | null }
  salaryBenchmarkState: { isLoading: boolean; data: any; error: string | null }
}>()

const emit = defineEmits<{
  save: [data: JobFormData]
  publish: [id: string]
  close: [id: string]
  cancel: []
  generateDescription: [context: { title: string; department: string; requirements: string }]
  estimateSalary: [context: { title: string; location: string; experience: string }]
  acceptAiJd: [content: string]
}>()

const form = reactive<JobFormData>({
  title: '',
  department_id: '',
  location_id: '',
  category_id: '',
  deadline: '',
  min_salary: undefined,
  max_salary: undefined,
  currency: 'VND',
  is_negotiable: false,
  description: '',
  requirements: '',
  ...(props.initialData || {})
})

watch(() => props.initialData, (newVal) => {
  if (newVal) Object.assign(form, newVal)
}, { deep: true })

const showPreview = ref(false)
const showAiPanel = ref(false)
const showSalaryPanel = ref(false)

const handleGenerateJd = () => {
  const deptName = props.departments.find(d => d.id === form.department_id)?.name || ''
  emit('generateDescription', {
    title: form.title,
    department: deptName,
    requirements: form.requirements || ''
  })
  showAiPanel.value = true
}

const handleEstimateSalary = () => {
  const locName = props.locations.find(l => l.id === form.location_id)?.name || ''
  emit('estimateSalary', {
    title: form.title,
    location: locName,
    experience: 'N/A' // Simplified for UI
  })
  showSalaryPanel.value = true
}

const acceptAiContent = () => {
  if (props.aiJdState.content) {
    form.description = props.aiJdState.content
    showAiPanel.value = false
  }
}

const currencyOptions = ['VND', 'USD', 'EUR', 'SGD']
</script>

<template>
  <div class="max-w-4xl mx-auto pb-20">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <button @click="emit('cancel')" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft class="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ mode === 'create' ? 'Đăng tin tuyển dụng mới' : 'Chỉnh sửa tin tuyển dụng' }}
          </h1>
          <p class="text-sm text-gray-500">Hoàn thiện thông tin để thu hút những ứng viên tiềm năng nhất.</p>
        </div>
      </div>
    </div>

    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-3">
      <XCircle class="w-5 h-5" />
      {{ error }}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Main Form -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Card 1: Basic Info -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div class="flex items-center gap-2 pb-4 border-b border-gray-50">
            <div class="p-2 bg-[#009898]/10 rounded-lg text-[#009898]">
              <Briefcase class="w-5 h-5" />
            </div>
            <h2 class="font-bold text-gray-900">Thông tin cơ bản</h2>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1.5">Tiêu đề công việc <span class="text-red-500">*</span></label>
              <input 
                v-model="form.title"
                type="text"
                placeholder="Ví dụ: Senior Frontend Developer (Vue.js)"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] transition-all outline-none"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Phòng ban</label>
                <div class="relative">
                  <select v-model="form.department_id" class="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] transition-all outline-none appearance-none bg-transparent">
                    <option value="">Chọn phòng ban</option>
                    <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
                  </select>
                  <Tag class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Địa điểm làm việc <span class="text-red-500">*</span></label>
                <div class="relative">
                  <select v-model="form.location_id" class="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] transition-all outline-none appearance-none bg-transparent">
                    <option value="">Chọn địa điểm</option>
                    <option v-for="l in locations" :key="l.id" :value="l.id">{{ l.name }}</option>
                  </select>
                  <MapPin class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Ngành nghề <span class="text-red-500">*</span></label>
                <select v-model="form.category_id" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] transition-all outline-none">
                  <option value="">Chọn ngành nghề</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Hạn chót nộp hồ sơ <span class="text-red-500">*</span></label>
                <div class="relative">
                  <input v-model="form.deadline" type="date" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] transition-all outline-none" />
                  <Clock class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Card 2: Compensation -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-gray-50">
            <div class="flex items-center gap-2">
              <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                <TrendingUp class="w-5 h-5" />
              </div>
              <h2 class="font-bold text-gray-900">Mức lương & Phúc lợi</h2>
            </div>
            <button 
              type="button"
              @click="handleEstimateSalary"
              class="text-xs font-bold text-[#009898] hover:bg-[#009898]/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles class="w-3.5 h-3.5" />
              Ước lượng bằng AI
            </button>
          </div>

          <SalaryBenchmarkPanel 
            v-if="showSalaryPanel" 
            :isLoading="salaryBenchmarkState.isLoading"
            :data="salaryBenchmarkState.data"
            :error="salaryBenchmarkState.error"
            @dismiss="showSalaryPanel = false"
          />

          <div class="space-y-4">
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl w-fit">
              <input type="checkbox" v-model="form.is_negotiable" id="negotiable" class="w-4 h-4 rounded text-[#009898] focus:ring-[#009898]" />
              <label for="negotiable" class="text-sm font-medium text-gray-700 cursor-pointer">Lương thỏa thuận</label>
            </div>

            <div v-if="!form.is_negotiable" class="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Tối thiểu</label>
                <input v-model.number="form.min_salary" type="number" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] transition-all outline-none" placeholder="0" />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Tối đa</label>
                <input v-model.number="form.max_salary" type="number" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] transition-all outline-none" placeholder="0" />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-1.5">Loại tiền tệ</label>
                <select v-model="form.currency" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] transition-all outline-none">
                  <option v-for="c in currencyOptions" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- Card 3: Description -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div class="flex items-center justify-between pb-4 border-b border-gray-50">
            <div class="flex items-center gap-2">
              <h2 class="font-bold text-gray-900">Mô tả công việc <span class="text-red-500">*</span></h2>
            </div>
            <div class="flex items-center gap-2">
              <button 
                type="button"
                @click="handleGenerateJd"
                class="text-xs font-bold text-[#009898] hover:bg-[#009898]/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Sparkles class="w-3.5 h-3.5" />
                Tạo bằng AI
              </button>
              <button 
                type="button"
                @click="showPreview = !showPreview"
                class="text-xs font-bold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <component :is="showPreview ? EyeOff : Eye" class="w-3.5 h-3.5" />
                {{ showPreview ? 'Chỉnh sửa' : 'Xem trước' }}
              </button>
            </div>
          </div>

          <AiJdGeneratorPanel 
            v-if="showAiPanel"
            :isGenerating="aiJdState.isGenerating"
            :generatedContent="aiJdState.content"
            :error="aiJdState.error"
            @accept="acceptAiContent"
            @retry="handleGenerateJd"
            @dismiss="showAiPanel = false"
          />

          <div v-if="!showPreview">
            <textarea 
              v-model="form.description"
              rows="12"
              class="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] transition-all outline-none resize-y min-h-[300px]"
              placeholder="Nhập mô tả chi tiết công việc, trách nhiệm và quyền lợi..."
            ></textarea>
          </div>
          <div v-else class="prose prose-sm max-w-none p-6 bg-gray-50 rounded-xl border border-gray-100 min-h-[300px]">
            {{ form.description || 'Chưa có nội dung mô tả.' }}
          </div>
        </section>

        <!-- Card 4: Requirements -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 class="font-bold text-gray-900 pb-4 border-b border-gray-50">Yêu cầu ứng viên</h2>
          <textarea 
            v-model="form.requirements"
            rows="6"
            class="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] transition-all outline-none resize-y"
            placeholder="Kỹ năng, kinh nghiệm, bằng cấp cần thiết..."
          ></textarea>
        </section>
      </div>

      <!-- Right Column: Info & Actions -->
      <div class="space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <h3 class="font-bold text-gray-900 mb-6">Thao tác</h3>
          
          <div class="space-y-3">
            <button 
              @click="emit('save', form)"
              :disabled="isSaving"
              class="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              <Loader2 v-if="isSaving" class="w-5 h-5 animate-spin" />
              <Save v-else class="w-5 h-5" />
              Lưu bản nháp
            </button>

            <button 
              v-if="canPublish"
              @click="emit('publish', 'current')"
              class="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#009898] text-white rounded-xl font-bold hover:bg-[#007a7a] transition-all shadow-lg shadow-[#009898]/20"
            >
              <Send class="w-5 h-5" />
              Đăng tin ngay
            </button>

            <button 
              v-if="canClose"
              @click="emit('close', 'current')"
              class="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-50 transition-all"
            >
              <XCircle class="w-5 h-5" />
              Đóng tin tuyển dụng
            </button>

            <button 
              @click="emit('cancel')"
              class="w-full px-6 py-3.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
            >
              Hủy bỏ
            </button>
          </div>

          <div class="mt-8 pt-8 border-t border-gray-50 space-y-4">
            <div class="flex items-center gap-3 text-sm text-gray-500">
              <div class="w-2 h-2 rounded-full bg-[#009898]"></div>
              <span>Trạng thái: {{ mode === 'create' ? 'Mới' : 'Đang chỉnh sửa' }}</span>
            </div>
            <p class="text-[11px] text-gray-400 leading-relaxed italic">
              * Tin tuyển dụng sẽ được kiểm duyệt trước khi hiển thị công khai trên hệ thống.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
