<!-- src/features/offer/views/OfferCreateView.vue -->
<!-- View to create a new job offer. Pure UI. -->
<script setup lang="ts">
import { reactive } from 'vue'
import { 
  ChevronLeft, FileText, DollarSign, 
  Calendar, Save, X, AlertCircle 
} from 'lucide-vue-next'

const props = defineProps<{
  applicationId: string
  isSaving: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', data: any): void
  (e: 'cancel'): void
}>()

const form = reactive({
  applicationId: props.applicationId,
  baseSalary: 0,
  currency: 'VND',
  startDate: '',
  offerLetterUrl: '',
  note: ''
})

function handleSubmit() {
  if (form.baseSalary <= 0) return
  emit('submit', { ...form })
}
</script>

<template>
  <div class="p-8 max-w-3xl mx-auto space-y-8">
    <!-- Breadcrumbs / Back -->
    <button 
      @click="emit('cancel')"
      class="flex items-center gap-2 text-xs font-black text-text-muted hover:text-brand uppercase tracking-widest transition-colors group"
    >
      <ChevronLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      Hủy và quay lại
    </button>

    <!-- Header -->
    <header>
      <h1 class="text-3xl font-black text-text-primary uppercase tracking-tight">Tạo Offer mới</h1>
      <p class="text-sm text-text-muted mt-1 font-medium">Điền các thông tin chi tiết về thu nhập và ngày bắt đầu.</p>
    </header>

    <!-- Error State -->
    <div v-if="error" class="p-6 bg-red-50 border border-red-200 rounded-3xl flex items-center gap-4 text-red-700">
      <AlertCircle class="w-6 h-6" />
      <p class="font-bold uppercase text-xs tracking-tight">{{ error }}</p>
    </div>

    <!-- Form Card -->
    <div class="bg-white border border-border rounded-3xl shadow-sm overflow-hidden">
      <div class="p-8 space-y-8">
        <!-- Salary Section -->
        <section class="space-y-4">
          <h3 class="text-xs font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
            <DollarSign class="w-4 h-4 text-brand" /> Lương & Chế độ
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-text-muted uppercase tracking-widest">Lương cơ bản (Net)</label>
              <div class="relative">
                <input 
                  v-model.number="form.baseSalary"
                  type="number" 
                  class="w-full pl-4 pr-16 py-3 bg-surface-soft border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                />
                <div class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-text-muted">
                  {{ form.currency }}
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-text-muted uppercase tracking-widest">Loại tiền tệ</label>
              <select 
                v-model="form.currency"
                class="w-full px-4 py-3 bg-surface-soft border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all appearance-none"
              >
                <option value="VND">VND - Vietnam Dong</option>
                <option value="USD">USD - US Dollar</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Timeline Section -->
        <section class="space-y-4 pt-8 border-t border-border">
          <h3 class="text-xs font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
            <Calendar class="w-4 h-4 text-brand" /> Thời gian
          </h3>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-text-muted uppercase tracking-widest">Ngày dự kiến bắt đầu (Onboarding Date)</label>
            <input 
              v-model="form.startDate"
              type="date"
              class="w-full px-4 py-3 bg-surface-soft border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
            />
          </div>
        </section>

        <!-- Attachments Section -->
        <section class="space-y-4 pt-8 border-t border-border">
          <h3 class="text-xs font-black text-text-primary uppercase tracking-[0.2em] flex items-center gap-2">
            <FileText class="w-4 h-4 text-brand" /> Tài liệu đính kèm
          </h3>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-text-muted uppercase tracking-widest">Link Offer Letter (PDF)</label>
            <input 
              v-model="form.offerLetterUrl"
              type="url"
              placeholder="https://storage.vietrecruit.com/offers/..."
              class="w-full px-4 py-3 bg-surface-soft border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
            />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-text-muted uppercase tracking-widest">Ghi chú thêm</label>
            <textarea 
              v-model="form.note"
              rows="4"
              placeholder="Các thỏa thuận bổ sung khác..."
              class="w-full px-4 py-3 bg-surface-soft border-border rounded-xl text-sm font-bold focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all resize-none"
            ></textarea>
          </div>
        </section>
      </div>

      <!-- Footer Action -->
      <footer class="p-8 bg-surface-soft border-t border-border flex items-center justify-end gap-4">
        <button 
          @click="emit('cancel')"
          class="px-8 py-3 text-sm font-black text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors"
        >
          Hủy bỏ
        </button>
        <button 
          @click="handleSubmit"
          :disabled="isSaving || form.baseSalary <= 0 || !form.startDate"
          class="px-10 py-3 bg-brand text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-brand-lg hover:bg-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save v-if="!isSaving" class="w-4 h-4" />
          <span v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ isSaving ? 'ĐANG LƯU...' : 'LƯU BẢN NHÁP' }}
        </button>
      </footer>
    </div>
  </div>
</template>
