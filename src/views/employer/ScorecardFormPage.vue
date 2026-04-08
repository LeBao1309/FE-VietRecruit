<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInterviewStore } from '@/stores/interviewStore'
import type { ScorecardResult } from '@/types/enums'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()

const interviewId = computed(() => route.params.id as string)

// ── Form state ──
const skillScore = ref(5)
const attitudeScore = ref(5)
const englishScore = ref(5)
const result = ref<ScorecardResult>('CONSIDERING')
const comments = ref('')

const formErrors = ref<Record<string, string>>({})
const submitted = ref(false)

// ── Computed ──
const averagePreview = computed(() => {
 return Math.round(((skillScore.value + attitudeScore.value + englishScore.value) / 3) * 10) / 10
})

const resultOptions: { value: ScorecardResult; label: string; class: string; desc: string }[] = [
 { value: 'PASS', label: 'Đạt', class: 'border-green-400 bg-green-50 text-green-700', desc: 'Đề xuất ứng viên này' },
 { value: 'CONSIDERING', label: 'Cân Nhắc', class: 'border-amber-400 bg-amber-50 text-amber-700', desc: 'Cần đánh giá thêm' },
 { value: 'FAIL', label: 'Không Đạt', class: 'border-red-400 bg-red-50 text-red-700', desc: 'Không đề xuất' },
]

// ── Validation ──
function validate(): boolean {
 const errors: Record<string, string> = {}
 if (skillScore.value < 1 || skillScore.value > 10) errors.skill = 'Thang điểm phải là 1 - 10.'
 if (attitudeScore.value < 1 || attitudeScore.value > 10) errors.attitude = 'Thang điểm phải là 1 - 10.'
 if (englishScore.value < 1 || englishScore.value > 10) errors.english = 'Thang điểm phải là 1 - 10.'
 formErrors.value = errors
 return Object.keys(errors).length === 0
}

// ── Submit ──
async function handleSubmit(): Promise<void> {
 if (!validate()) return
 const success = await interviewStore.submitScorecard(interviewId.value, {
 skillScore: skillScore.value,
 attitudeScore: attitudeScore.value,
 englishScore: englishScore.value,
 result: result.value,
 comments: comments.value || undefined,
 })
 if (success) {
 submitted.value = true
 }
}

// ── Helpers ──
function getScoreLabel(score: number): string {
 if (score >= 9) return 'Xuất Sắc'
 if (score >= 7) return 'Tốt'
 if (score >= 5) return 'Trung Bình'
 if (score >= 3) return 'Dưới Trung Bình'
 return 'Yếu'
}

function getScoreColor(score: number): string {
 if (score >= 8) return 'text-green-600'
 if (score >= 5) return 'text-amber-600'
 return 'text-red-500'
}

function getSliderBackground(score: number): string {
 const pct = ((score - 1) / 9) * 100
 if (score >= 8) return `linear-gradient(to right, #22c55e ${pct}%, #e5e7eb ${pct}%)`
 if (score >= 5) return `linear-gradient(to right, #f59e0b ${pct}%, #e5e7eb ${pct}%)`
 return `linear-gradient(to right, #ef4444 ${pct}%, #e5e7eb ${pct}%)`
}

// ── Init ──
onMounted(async () => {
 await interviewStore.fetchInterview(interviewId.value)
})
</script>

<template>
 <div class="max-w-2xl mx-auto px-6 pb-8">
 <!-- Back -->
 <div class="flex items-center gap-3 mb-6">
 <button @click="router.push(`/employer/interviews/${interviewId}`)" class="text-gray-400 hover:text-gray-600 transition text-sm">
 ‹ Quay lại
 </button>
 </div>

 <!-- Success state -->
 <div v-if="submitted" class="premium-card p-12 text-center max-w-lg mx-auto mt-12">
 <div class="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm">
 ✓
 </div>
 <h2 class="text-2xl font-extrabold text-slate-900 mb-2">Phiếu Đánh Giá Đã Lưu</h2>
 <p class="text-slate-500 mb-8">Nhận xét của bạn đã được ghi nhận thành công.</p>
 <div class="flex justify-center gap-3">
 <button
 @click="router.push(`/employer/interviews/${interviewId}`)"
 class="btn-primary"
 >
 Về Trang Phỏng Vấn
 </button>
 </div>
 </div>

 <!-- Form -->
 <div v-else class="space-y-6">
 <!-- Header -->
 <div class="premium-card p-6 border-l-4 border-l-teal-500">
 <h1 class="text-2xl font-extrabold text-slate-900 mb-1">Điền Phiếu Đánh Giá</h1>
 <p v-if="interviewStore.currentInterview" class="text-sm font-medium text-slate-500">
 {{ interviewStore.currentInterview.title }}
 </p>
 </div>

 <!-- Score Sliders -->
 <div class="premium-card p-8 space-y-8">
 <h2 class="text-lg font-bold text-slate-900 mb-2">Chấm Điểm Các Tiêu Chí</h2>

 <!-- Skill Score -->
 <div>
 <div class="flex items-center justify-between mb-2">
 <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
 Kỹ Năng Chuyên Môn
 </label>
 <div class="flex items-center gap-2">
 <span class="text-2xl font-bold tabular-nums" :class="getScoreColor(skillScore)">
 {{ skillScore }}
 </span>
 <span class="text-[10px] text-gray-400">/10</span>
 </div>
 </div>
 <input
 v-model.number="skillScore"
 type="range"
 min="1"
 max="10"
 step="1"
 class="scorecard-slider w-full"
 :style="{ background: getSliderBackground(skillScore) }"
 />
 <div class="flex items-center justify-between mt-1">
 <span class="text-[10px] text-gray-400">1 — Kém</span>
 <span class="text-xs font-medium" :class="getScoreColor(skillScore)">
 {{ getScoreLabel(skillScore) }}
 </span>
 <span class="text-[10px] text-gray-400">10 — Xuất Sắc</span>
 </div>
 <p v-if="formErrors.skill" class="text-[11px] text-error mt-1">{{ formErrors.skill }}</p>
 </div>

 <!-- Attitude Score -->
 <div>
 <div class="flex items-center justify-between mb-2">
 <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
 Thái Độ & Văn Hóa
 </label>
 <div class="flex items-center gap-2">
 <span class="text-2xl font-bold tabular-nums" :class="getScoreColor(attitudeScore)">
 {{ attitudeScore }}
 </span>
 <span class="text-[10px] text-gray-400">/10</span>
 </div>
 </div>
 <input
 v-model.number="attitudeScore"
 type="range"
 min="1"
 max="10"
 step="1"
 class="scorecard-slider w-full"
 :style="{ background: getSliderBackground(attitudeScore) }"
 />
 <div class="flex items-center justify-between mt-1">
 <span class="text-[10px] text-gray-400">1 — Kém</span>
 <span class="text-xs font-medium" :class="getScoreColor(attitudeScore)">
 {{ getScoreLabel(attitudeScore) }}
 </span>
 <span class="text-[10px] text-gray-400">10 — Xuất Sắc</span>
 </div>
 <p v-if="formErrors.attitude" class="text-[11px] text-error mt-1">{{ formErrors.attitude }}</p>
 </div>

 <!-- English Score -->
 <div>
 <div class="flex items-center justify-between mb-2">
 <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
 Trình Độ Tiếng Anh
 </label>
 <div class="flex items-center gap-2">
 <span class="text-2xl font-bold tabular-nums" :class="getScoreColor(englishScore)">
 {{ englishScore }}
 </span>
 <span class="text-[10px] text-gray-400">/10</span>
 </div>
 </div>
 <input
 v-model.number="englishScore"
 type="range"
 min="1"
 max="10"
 step="1"
 class="scorecard-slider w-full"
 :style="{ background: getSliderBackground(englishScore) }"
 />
 <div class="flex items-center justify-between mt-1">
 <span class="text-[10px] text-gray-400">1 — Kém</span>
 <span class="text-xs font-medium" :class="getScoreColor(englishScore)">
 {{ getScoreLabel(englishScore) }}
 </span>
 <span class="text-[10px] text-gray-400">10 — Xuất Sắc</span>
 </div>
 <p v-if="formErrors.english" class="text-[11px] text-error mt-1">{{ formErrors.english }}</p>
 </div>

 <!-- Average Preview -->
 <div class="pt-4 border-t border-border flex items-center justify-between">
 <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Điểm Trung Bình</span>
 <div class="flex items-center gap-2">
 <span class="text-3xl font-bold tabular-nums" :class="getScoreColor(averagePreview)">
 {{ averagePreview.toFixed(1) }}
 </span>
 <span class="text-xs text-gray-400">/10</span>
 </div>
 </div>
 </div>

 <!-- Result Selection -->
 <div class="premium-card p-8">
 <h2 class="text-lg font-bold text-slate-900 mb-5">Kết Quả Đánh Giá</h2>
 <div class="grid grid-cols-3 gap-4">
 <button
 v-for="opt in resultOptions"
 :key="opt.value"
 @click="result = opt.value"
 class="p-6 rounded-2xl border-2 text-center transition-all duration-200"
 :class="result === opt.value
 ? opt.class + ' ring-4 ring-offset-2 ring-transparent scale-[1.02] shadow-md border-transparent'
 : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:scale-[1.01] :border-slate-600'"
 >
 <span class="block text-3xl font-black mb-2">
 {{ opt.value === 'PASS' ? '✓' : opt.value === 'FAIL' ? '✕' : '~' }}
 </span>
 <span class="block text-sm font-semibold">{{ opt.label }}</span>
 <span class="block text-[10px] mt-0.5 opacity-70">{{ opt.desc }}</span>
 </button>
 </div>
 </div>

 <!-- Comments -->
 <div class="premium-card p-8">
 <h2 class="text-lg font-bold text-slate-900 mb-4">Nhận Xét</h2>
 <textarea
 v-model="comments"
 rows="5"
 placeholder="Ghi nhận điểm mạnh, điểm yếu và ấn tượng chung về ứng viên..."
 class="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition resize-none text-slate-900 placeholder-slate-400"
 />
 </div>

 <!-- Submit -->
 <div class="flex justify-end gap-3 pt-4">
 <button
 @click="router.push(`/employer/interviews/${interviewId}`)"
 class="btn-secondary"
 >
 Huỷ
 </button>
 <button
 @click="handleSubmit"
 :disabled="interviewStore.submitScorecardLoading"
 class="btn-primary"
 >
 <span v-if="interviewStore.submitScorecardLoading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ interviewStore.submitScorecardLoading ? 'Đang lưu…' : 'Lưu Đánh Giá' }}
 </button>
 </div>
 </div>
 </div>
</template>


