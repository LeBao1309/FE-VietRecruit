<!-- src/features/pipeline/components/ApplicationDetailDrawer.vue -->
<!-- Detailed view of an application. Slide-in panel. Pure UI. -->
<script setup lang="ts">
import { computed } from 'vue'
import { 
  X, ExternalLink, Calendar, User, Briefcase, 
  ArrowRight, FileText, Clock, Trash2, CheckCircle
} from 'lucide-vue-next'
import AiScreeningResultCard from './AiScreeningResultCard.vue'

interface StatusHistory {
  fromStatus: string | null
  toStatus: string
  changedBy?: string
  changedAt: string
  note?: string
}

interface ApplicationDetail {
  id: string
  candidateId: string
  jobId: string
  status: string
  aiScore: number | null
  coverLetter?: string
  cvUrl: string
  createdAt: string
  statusHistory: StatusHistory[]
}

interface ScreeningResult {
  score: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

const props = defineProps<{
  detail: ApplicationDetail | null
  isLoading?: boolean
  allowedTransitions: Array<{ status: string; label: string }>
  screeningResult?: ScreeningResult | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'transition', newStatus: string): void
  (e: 'viewCv', url: string): void
}>()

const sortedHistory = computed(() => {
  if (!props.detail) return []
  return [...props.detail.statusHistory].sort((a, b) => 
    new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  )
})

function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'NEW': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'SCREENING': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'INTERVIEW': return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'OFFER': return 'bg-brand-light text-brand border-brand/20'
    case 'HIRED': return 'bg-green-50 text-green-700 border-green-200'
    case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200'
    default: return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-hidden pointer-events-none">
    <!-- Overlay backdrop -->
    <div 
      class="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity"
      @click="emit('close')"
    ></div>

    <!-- Panel -->
    <aside class="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl pointer-events-auto flex flex-col">
      <!-- Header -->
      <header class="p-6 border-b border-border flex items-center justify-between bg-white shrink-0">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
            <User class="w-6 h-6 text-brand" />
          </div>
          <div>
            <h2 class="text-lg font-bold text-text-primary">
              CAND-{{ detail?.candidateId.slice(0, 8).toUpperCase() }}
            </h2>
            <div class="flex items-center gap-2 mt-0.5">
              <span 
                v-if="detail"
                class="px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider"
                :class="getStatusBadgeClass(detail.status)"
              >
                {{ detail.status }}
              </span>
              <span class="text-xs text-text-muted">
                Applied on {{ detail ? new Date(detail.createdAt).toLocaleDateString('vi-VN') : '...' }}
              </span>
            </div>
          </div>
        </div>
        <button 
          class="p-2 rounded-lg hover:bg-surface-soft text-text-muted transition-colors"
          @click="emit('close')"
        >
          <X class="w-6 h-6" />
        </button>
      </header>

      <!-- Content -->
      <main class="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
        <div v-if="isLoading" class="space-y-6 animate-pulse">
          <div class="h-32 bg-surface-soft rounded-xl"></div>
          <div class="h-64 bg-surface-soft rounded-xl"></div>
        </div>

        <div v-else-if="detail" class="space-y-8">
          <!-- Quick Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 rounded-xl border border-border bg-surface-soft">
              <h4 class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Briefcase class="w-3 h-3" /> Job ID
              </h4>
              <p class="text-sm font-bold text-text-primary">JOB-{{ detail.jobId.slice(0, 8).toUpperCase() }}</p>
            </div>
            <div class="p-4 rounded-xl border border-border bg-surface-soft">
              <h4 class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <FileText class="w-3 h-3" /> Resume
              </h4>
              <button 
                class="text-sm font-bold text-brand hover:underline flex items-center gap-1"
                @click="emit('viewCv', detail.cvUrl)"
              >
                Download CV <ExternalLink class="w-3 h-3" />
              </button>
            </div>
          </div>

          <!-- Cover Letter -->
          <section v-if="detail.coverLetter">
            <h3 class="text-sm font-black text-text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText class="w-4 h-4 text-brand" /> Thư giới thiệu
            </h3>
            <div class="p-6 bg-white border border-border rounded-xl shadow-sm italic text-text-primary leading-relaxed whitespace-pre-wrap">
              {{ detail.coverLetter }}
            </div>
          </section>

          <!-- AI Screening Section -->
          <section>
            <AiScreeningResultCard 
              :result="screeningResult" 
              :is-loading="false" 
            />
          </section>

          <!-- Status History Timeline -->
          <section>
            <h3 class="text-sm font-black text-text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
              <Clock class="w-4 h-4 text-brand" /> Lịch sử thay đổi trạng thái
            </h3>
            <div class="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
              <div 
                v-for="(event, idx) in sortedHistory" 
                :key="idx"
                class="relative pl-8"
              >
                <div 
                  class="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                  :class="idx === 0 ? 'bg-brand' : 'bg-border'"
                >
                  <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
                </div>
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-bold text-text-primary uppercase" v-if="event.fromStatus">
                        {{ event.fromStatus }}
                      </span>
                      <ArrowRight class="w-3 h-3 text-text-muted" v-if="event.fromStatus" />
                      <span 
                        class="px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider"
                        :class="getStatusBadgeClass(event.toStatus)"
                      >
                        {{ event.toStatus }}
                      </span>
                    </div>
                    <p class="text-xs text-text-muted mt-1 italic" v-if="event.note">
                      "{{ event.note }}"
                    </p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] font-black text-text-primary uppercase">{{ event.changedBy || 'SYSTEM' }}</p>
                    <p class="text-[10px] text-text-muted">{{ new Date(event.changedAt).toLocaleString('vi-VN') }}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <!-- Footer Action Bar -->
      <footer 
        v-if="detail && allowedTransitions.length > 0" 
        class="p-6 border-t border-border bg-surface-soft shrink-0 flex items-center justify-end gap-3 flex-wrap"
      >
        <button
          v-for="btn in allowedTransitions"
          :key="btn.status"
          class="px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:-translate-y-0.5 flex items-center gap-2"
          :class="[
            btn.status === 'REJECTED' 
              ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' 
              : 'bg-brand text-white border border-brand hover:bg-brand-dark'
          ]"
          @click="emit('transition', btn.status)"
        >
          <X v-if="btn.status === 'REJECTED'" class="w-4 h-4" />
          <CheckCircle v-else class="w-4 h-4" />
          {{ btn.label }}
        </button>
      </footer>
    </aside>
  </div>
</template>

<style scoped>
/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.1);
}
</style>
