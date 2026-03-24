<!-- src/features/interview/components/ScorecardForm.vue -->
<!-- Modal form to submit an interview scorecard. Pure UI. -->
<script setup lang="ts">
import { reactive, computed } from 'vue'
import { Star, X, CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-vue-next'

const props = defineProps<{
  interviewId: string
  isSubmitting?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', payload: any): void
  (e: 'cancel'): void
}>()

const form = reactive({
  skillScore: 5,
  attitudeScore: 5,
  englishScore: 5,
  overallNote: '',
  result: 'CONSIDERING' as 'PASS' | 'FAIL' | 'CONSIDERING'
})

const averageScore = computed(() => {
  return ((form.skillScore + form.attitudeScore + form.englishScore) / 3).toFixed(1)
})

const averageColorClass = computed(() => {
  const avg = parseFloat(averageScore.value)
  if (avg >= 7) return 'text-green-600 bg-green-50 border-green-200'
  if (avg >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  return 'text-red-600 bg-red-50 border-red-200'
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('cancel')"></div>

    <!-- Modal Content -->
    <div class="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <header class="p-6 border-b border-border flex items-center justify-between shrink-0 bg-surface-soft/30">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <Star class="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 class="text-lg font-black text-text-primary uppercase tracking-tight">Chấm điểm Scorecard</h2>
            <p class="text-[10px] text-text-muted font-bold uppercase tracking-widest">Phỏng vấn #{{ interviewId.slice(0, 8) }}</p>
          </div>
        </div>
        <button 
          class="p-2 rounded-xl hover:bg-surface-soft text-text-muted transition-colors"
          @click="emit('cancel')"
        >
          <X class="w-6 h-6" />
        </button>
      </header>

      <!-- Form Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-8">
        <!-- Error Banner -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold">
          <AlertCircle class="w-5 h-5 shrink-0" />
          {{ error }}
        </div>

        <!-- Aggregate Score Circle -->
        <div class="flex flex-col items-center justify-center p-8 bg-surface-soft rounded-3xl border border-border/50">
          <p class="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Điểm trung bình</p>
          <div 
            :class="['w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-black font-display shadow-inner transition-colors duration-500', averageColorClass]"
          >
            {{ averageScore }}
          </div>
        </div>

        <!-- Sliders -->
        <div class="space-y-6">
          <!-- Skill Score -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-black text-text-primary uppercase tracking-widest">Kỹ năng chuyên môn</label>
              <span class="text-lg font-black text-brand">{{ form.skillScore }}/10</span>
            </div>
            <input 
              v-model.number="form.skillScore"
              type="range" min="0" max="10" step="1"
              class="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand"
            />
          </div>

          <!-- Attitude Score -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-black text-text-primary uppercase tracking-widest">Thái độ & Văn hóa</label>
              <span class="text-lg font-black text-brand">{{ form.attitudeScore }}/10</span>
            </div>
            <input 
              v-model.number="form.attitudeScore"
              type="range" min="0" max="10" step="1"
              class="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand"
            />
          </div>

          <!-- English Score -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-black text-text-primary uppercase tracking-widest">Kỹ năng Tiếng Anh</label>
              <span class="text-lg font-black text-brand">{{ form.englishScore }}/10</span>
            </div>
            <input 
              v-model.number="form.englishScore"
              type="range" min="0" max="10" step="1"
              class="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand"
            />
          </div>
        </div>

        <!-- Result Selection -->
        <div class="space-y-4 pt-6 border-t border-border">
          <label class="text-[11px] font-black text-text-primary uppercase tracking-widest">Kết quả đề xuất</label>
          <div class="grid grid-cols-3 gap-3">
            <button 
              @click="form.result = 'PASS'"
              class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
              :class="form.result === 'PASS' ? 'border-green-600 bg-green-50 text-green-700' : 'border-border text-text-muted hover:border-green-200'"
            >
              <CheckCircle class="w-6 h-6" />
              <span class="text-[10px] font-black uppercase tracking-widest">Vượt qua</span>
            </button>
            <button 
              @click="form.result = 'CONSIDERING'"
              class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
              :class="form.result === 'CONSIDERING' ? 'border-yellow-600 bg-yellow-50 text-yellow-700' : 'border-border text-text-muted hover:border-yellow-200'"
            >
              <HelpCircle class="w-6 h-6" />
              <span class="text-[10px] font-black uppercase tracking-widest">Cân nhắc</span>
            </button>
            <button 
              @click="form.result = 'FAIL'"
              class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all"
              :class="form.result === 'FAIL' ? 'border-red-600 bg-red-50 text-red-700' : 'border-border text-text-muted hover:border-red-200'"
            >
              <XCircle class="w-6 h-6" />
              <span class="text-[10px] font-black uppercase tracking-widest">Loại bỏ</span>
            </button>
          </div>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <label class="text-[11px] font-black text-text-primary uppercase tracking-widest">Ghi chú tổng quát</label>
          <textarea 
            v-model="form.overallNote"
            rows="4"
            placeholder="Nhận xét chi tiết về ứng viên..."
            class="w-full px-4 py-3 bg-surface-soft border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Footer -->
      <footer class="p-6 border-t border-border bg-surface-soft/30 flex items-center justify-end gap-4 shrink-0">
        <button 
          @click="emit('cancel')"
          class="px-8 py-3 text-sm font-black text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors"
        >
          Hủy
        </button>
        <button 
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="px-10 py-3 bg-brand text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-brand-lg hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <CheckCircle v-if="!isSubmitting" class="w-4 h-4" />
          <span v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ isSubmitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Custom range styling for Tailwind */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #009898;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 152, 152, 0.3);
  margin-top: -6px;
}
</style>
