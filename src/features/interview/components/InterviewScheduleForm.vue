<!-- src/features/interview/components/InterviewScheduleForm.vue -->
<!-- Modal form to schedule an interview. Pure UI. -->
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { 
  X, Calendar, MapPin, Link, FileText, 
  Users, Sparkles, AlertCircle 
} from 'lucide-vue-next'

const props = defineProps<{
  applicationId: string
  jobId: string
  isSaving?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', payload: any): void
  (e: 'cancel'): void
  (e: 'generateQuestions', context: { jobTitle: string; candidateProfile: string }): void
}>()

const form = reactive({
  applicationId: props.applicationId,
  jobId: props.jobId,
  scheduledAt: '',
  interviewerIds: '', // comma-separated for simple UI
  location: '',
  meetingLink: '',
  notes: ''
})

const errors = reactive({
  scheduledAt: '',
  interviewerIds: '',
  locationOrLink: ''
})

function validate() {
  let isValid = true
  errors.scheduledAt = ''
  errors.interviewerIds = ''
  errors.locationOrLink = ''

  if (!form.scheduledAt) {
    errors.scheduledAt = 'Vui lòng chọn thời gian'
    isValid = false
  } else if (new Date(form.scheduledAt) <= new Date()) {
    errors.scheduledAt = 'Thời gian phải trong tương lai'
    isValid = false
  }

  if (!form.interviewerIds.trim()) {
    errors.interviewerIds = 'Vui lòng nhập ít nhất 1 người phỏng vấn'
    isValid = false
  }

  if (!form.location.trim() && !form.meetingLink.trim()) {
    errors.locationOrLink = 'Vui lòng nhập địa điểm HOẶC link cuộc họp'
    isValid = false
  }

  return isValid
}

function handleSubmit() {
  if (validate()) {
    emit('submit', {
      ...form,
      interviewerIds: form.interviewerIds.split(',').map(id => id.trim()).filter(id => id)
    })
  }
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
            <Calendar class="w-5 h-5" />
          </div>
          <h2 class="text-lg font-black text-text-primary uppercase tracking-tight">Lên lịch Phỏng vấn</h2>
        </div>
        <button 
          class="p-2 rounded-xl hover:bg-surface-soft text-text-muted transition-colors"
          @click="emit('cancel')"
        >
          <X class="w-6 h-6" />
        </button>
      </header>

      <!-- Form Body -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Error Banner -->
        <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold">
          <AlertCircle class="w-5 h-5 shrink-0" />
          {{ error }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Time Selection -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
              <Calendar class="w-3 h-3" /> Thời gian *
            </label>
            <input 
              v-model="form.scheduledAt"
              type="datetime-local"
              class="w-full px-4 py-3 bg-surface-soft border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
              :class="{ 'border-red-500 ring-1 ring-red-500': errors.scheduledAt }"
            />
            <p v-if="errors.scheduledAt" class="text-[10px] font-bold text-red-500 uppercase">{{ errors.scheduledAt }}</p>
          </div>

          <!-- Interviewers -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
              <Users class="w-3 h-3" /> Interviewers (ID, ID, ...) *
            </label>
            <input 
              v-model="form.interviewerIds"
              type="text"
              placeholder="e.g. INT-001, INT-002"
              class="w-full px-4 py-3 bg-surface-soft border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
              :class="{ 'border-red-500 ring-1 ring-red-500': errors.interviewerIds }"
            />
            <p v-if="errors.interviewerIds" class="text-[10px] font-bold text-red-500 uppercase">{{ errors.interviewerIds }}</p>
          </div>
        </div>

        <!-- Location & Link -->
        <div class="space-y-4 pt-4 border-t border-border">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                <MapPin class="w-3 h-3" /> Địa điểm (Offline)
              </label>
              <input 
                v-model="form.location"
                type="text"
                placeholder="Phòng họp A, Tầng 3"
                class="w-full px-4 py-3 bg-surface-soft border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
              />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                <Link class="w-3 h-3" /> Meeting Link (Online)
              </label>
              <input 
                v-model="form.meetingLink"
                type="text"
                placeholder="Google Meet, Zoom link..."
                class="w-full px-4 py-3 bg-surface-soft border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
              />
            </div>
          </div>
          <p v-if="errors.locationOrLink" class="text-[10px] font-bold text-red-500 uppercase text-center bg-red-50 py-1 rounded-lg">
            {{ errors.locationOrLink }}
          </p>
        </div>

        <!-- Notes -->
        <div class="space-y-2">
          <label class="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
            <FileText class="w-3 h-3" /> Ghi chú
          </label>
          <textarea 
            v-model="form.notes"
            rows="3"
            placeholder="Nội dung phỏng vấn, lưu ý cho ứng viên..."
            class="w-full px-4 py-3 bg-surface-soft border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all resize-none"
          ></textarea>
        </div>

        <!-- AI Tool Integration -->
        <div class="p-6 bg-brand/5 rounded-3xl border border-brand/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand animate-pulse">
              <Sparkles class="w-6 h-6" />
            </div>
            <div>
              <h4 class="text-sm font-black text-brand uppercase tracking-tighter">AI Interview Assistant</h4>
              <p class="text-[11px] text-brand/70 font-bold uppercase">Gợi ý câu hỏi dựa trên Job Description & CV ứng viên</p>
            </div>
          </div>
          <button 
            @click="emit('generateQuestions', { jobTitle: 'Senior Frontend Dev', candidateProfile: '...' })"
            class="px-6 py-2.5 bg-brand text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-brand-sm hover:bg-brand-dark transition-all flex items-center gap-2 shrink-0"
          >
            <Sparkles class="w-4 h-4" /> Gợi ý câu hỏi AI
          </button>
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
          :disabled="isSaving"
          class="px-10 py-3 bg-brand text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-brand-lg hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Calendar v-if="!isSaving" class="w-4 h-4" />
          <span v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ isSaving ? 'ĐANG LƯU...' : 'LÊN LỊCH NGAY' }}
        </button>
      </footer>
    </div>
  </div>
</template>
