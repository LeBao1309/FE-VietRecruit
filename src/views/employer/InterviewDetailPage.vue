<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInterviewStore } from '@/stores/interviewStore'
import { useAuthStore } from '@/stores/authStore'
import type { InterviewStatus, ScorecardResult } from '@/types/enums'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()
const auth = useAuthStore()

const interviewId = computed(() => route.params.id as string)
const canManage = computed(() => auth.isCompanyAdmin || auth.isHR)
const isInterviewerOnly = computed(() => auth.isInterviewer && !auth.isCompanyAdmin && !auth.isHR)
const canSubmitScorecard = computed(() =>
 auth.isInterviewer && (interviewStore.isScheduled || interviewStore.isCompleted),
)

// ── Status config ──
const statusConfig: Record<InterviewStatus, { label: string; class: string; dotClass: string }> = {
 SCHEDULED: { label: 'Scheduled', class: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-400' },
 COMPLETED: { label: 'Completed', class: 'bg-success-bg text-success', dotClass: 'bg-green-500' },
 CANCELED: { label: 'Canceled', class: 'bg-gray-100 text-gray-500', dotClass: 'bg-gray-400' },
}

const resultConfig: Record<ScorecardResult, { label: string; class: string }> = {
 PASS: { label: 'Pass', class: 'bg-success-bg text-success' },
 FAIL: { label: 'Fail', class: 'bg-error-bg text-error' },
 CONSIDERING: { label: 'Considering', class: 'bg-amber-50 text-amber-600' },
}

// ── Confirmation modal ──
const showConfirm = ref(false)
const confirmAction = ref<'complete' | 'cancel' | null>(null)
const confirmProcessing = ref(false)

function openConfirm(action: 'complete' | 'cancel'): void {
 confirmAction.value = action
 showConfirm.value = true
}

async function handleConfirm(): Promise<void> {
 if (!confirmAction.value) return
 confirmProcessing.value = true
 try {
 const status: InterviewStatus = confirmAction.value === 'complete' ? 'COMPLETED' : 'CANCELED'
 const success = await interviewStore.updateStatus(interviewId.value, status)
 if (success) {
 showConfirm.value = false
 }
 } finally {
 confirmProcessing.value = false
 }
}

// ── AI Questions ──
const showQuestions = ref(false)
const difficultyColor: Record<string, string> = {
 EASY: 'bg-green-50 text-green-600',
 MEDIUM: 'bg-amber-50 text-amber-600',
 HARD: 'bg-red-50 text-red-500',
}

async function handleGenerateQuestions(): Promise<void> {
 const success = await interviewStore.generateQuestions(interviewId.value)
 if (success) {
 showQuestions.value = true
 }
}

async function loadQuestions(): Promise<void> {
 showQuestions.value = true
 await interviewStore.fetchQuestions(interviewId.value)
}

// ── Helpers ──
function formatDateTime(iso: string): string {
 return new Date(iso).toLocaleString('en-US', {
 weekday: 'long',
 month: 'long',
 day: 'numeric',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 })
}

function formatDuration(minutes: number | null): string {
 if (!minutes) return '—'
 if (minutes < 60) return `${minutes} minutes`
 const h = Math.floor(minutes / 60)
 const m = minutes % 60
 return m > 0 ? `${h}h ${m}m` : `${h} hour${h > 1 ? 's' : ''}`
}

function formatDate(iso: string): string {
 return new Date(iso).toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric',
 })
}

function getScoreColor(score: number): string {
 if (score >= 8) return 'text-green-600'
 if (score >= 5) return 'text-amber-600'
 return 'text-red-500'
}

function getScoreBarWidth(score: number): string {
 return `${Math.min(100, (score / 10) * 100)}%`
}

function getScoreBarColor(score: number): string {
 if (score >= 8) return 'bg-green-400'
 if (score >= 5) return 'bg-amber-400'
 return 'bg-red-400'
}

// ── Computed ──
const interview = computed(() => interviewStore.currentInterview)

// ── Init ──
onMounted(async () => {
 const loaded = await interviewStore.fetchInterview(interviewId.value)
 if (loaded) {
 interviewStore.fetchScorecards(interviewId.value)
 interviewStore.fetchQuestions(interviewId.value)
 }
})

onBeforeUnmount(() => {
 interviewStore.clearCurrent()
})
</script>

<template>
 <div class="max-w-4xl mx-auto px-6 py-8">
 <!-- Back -->
 <div class="flex items-center gap-3 mb-6">
 <button @click="router.back()" class="text-gray-400 hover:text-gray-600 transition text-sm">
 ‹ Back
 </button>
 </div>

 <!-- Loading -->
 <div v-if="interviewStore.detailLoading" class="space-y-6">
 <div class="premium-card p-8 animate-pulse space-y-5">
 <div class="h-8 bg-slate-100 rounded-lg w-72" />
 <div class="h-5 bg-slate-100 rounded-lg w-56" />
 <div class="h-24 bg-slate-100 rounded-xl w-full" />
 </div>
 </div>

 <div v-else-if="interview" class="space-y-6">
 <!-- ─── Header Card ─── -->
 <div class="premium-card p-8 relative overflow-hidden">
 <!-- Background decorative gradient depending on status -->
 <div v-if="interview.status === 'SCHEDULED'" class="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
 <div v-if="interview.status === 'COMPLETED'" class="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
 
 <div class="flex flex-col sm:flex-row items-baseline sm:items-start justify-between gap-6 mb-6 relative">
 <div>
 <h1 class="text-2xl font-extrabold text-slate-900 mb-3">{{ interview.title }}</h1>
 <div class="flex items-center gap-4 flex-wrap">
 <span
 class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full"
 :class="statusConfig[interview.status].class"
 >
 <span class="w-1.5 h-1.5 rounded-full shadow-sm" :class="statusConfig[interview.status].dotClass" />
 {{ statusConfig[interview.status].label }}
 </span>
 <span class="text-xs font-medium text-slate-500">Created {{ formatDate(interview.createdAt) }}</span>
 </div>
 </div>

 <!-- Status actions (HR/Admin) -->
 <div v-if="canManage && interviewStore.isScheduled" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
 <button
 @click="openConfirm('complete')"
 :disabled="interviewStore.statusLoading"
 class="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:hover:translate-y-0"
 >
 Mark Complete
 </button>
 <button
 @click="openConfirm('cancel')"
 :disabled="interviewStore.statusLoading"
 class="btn-secondary"
 >
 Cancel Interview
 </button>
 </div>
 <!-- Scorecard CTA (INTERVIEWER) -->
 <div v-else-if="canSubmitScorecard" class="shrink-0">
 <router-link
 :to="`/employer/interviews/${interviewId}/scorecard`"
 class="btn-primary"
 >
 📝 Submit Scorecard
 </router-link>
 </div>
 </div>

 <!-- Details grid -->
 <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-100 mt-2">
 <div>
 <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Scheduled</span>
 <span class="text-sm font-bold text-slate-800 ">{{ formatDateTime(interview.scheduledAt) }}</span>
 </div>
 <div>
 <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Duration</span>
 <span class="text-sm font-bold text-slate-800 ">{{ formatDuration(interview.durationMinutes) }}</span>
 </div>
 <div>
 <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Type</span>
 <span class="text-sm font-bold text-slate-800 ">{{ interview.interviewType ?? '—' }}</span>
 </div>
 <div>
 <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Location / Link</span>
 <a
 v-if="interview.locationOrLink && interview.locationOrLink.startsWith('http')"
 :href="interview.locationOrLink"
 target="_blank"
 rel="noopener"
 class="text-sm text-teal-600 hover:text-teal-700 :text-teal-300 font-bold transition-colors break-all"
 >
 {{ interview.locationOrLink }}
 </a>
 <span v-else class="text-sm font-bold text-slate-800 ">{{ interview.locationOrLink ?? '—' }}</span>
 </div>
 </div>

 <!-- Back link (context-aware) -->
 <div class="mt-6 pt-5 border-t border-slate-100 flex items-center gap-4">
 <router-link
 v-if="!isInterviewerOnly"
 :to="`/employer/applications/${interview.applicationId}`"
 class="text-xs text-primary hover:text-primary-hover font-medium transition"
 >
 ← View Application
 </router-link>
 <router-link
 v-if="auth.isInterviewer"
 to="/employer/my-interviews"
 class="text-xs text-gray-400 hover:text-gray-600 font-medium transition"
 >
 ← Back to My Interviews
 </router-link>
 </div>
 </div>

 <!-- ─── Interviewers ─── -->
 <div class="premium-card p-8">
 <h2 class="text-lg font-bold text-slate-900 mb-5">
 Interviewers ({{ interview.interviewers.length }})
 </h2>
 <div class="space-y-3">
 <div
 v-for="iv in interview.interviewers"
 :key="iv.id"
 class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 transition hover:bg-slate-100 :bg-slate-800"
 >
 <div class="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-bold shrink-0">
 {{ iv.fullName.charAt(0).toUpperCase() }}
 </div>
 <div class="flex-1 min-w-0">
 <span class="text-sm font-bold text-slate-900 block">{{ iv.fullName }}</span>
 <span class="text-xs font-medium text-slate-500">{{ iv.email }}</span>
 </div>
 </div>
 </div>
 </div>

 <!-- ─── Scorecards ─── -->
 <div class="premium-card p-8">
 <div class="flex items-center justify-between mb-6">
 <h2 class="text-lg font-bold text-slate-900 ">
 Scorecards ({{ interviewStore.scorecards.length }})
 </h2>
 <div v-if="interviewStore.averageScore !== null" class="flex items-center gap-2">
 <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Average</span>
 <span class="text-2xl font-black tabular-nums tracking-tight" :class="getScoreColor(interviewStore.averageScore)">
 {{ interviewStore.averageScore }}
 </span>
 <span class="text-xs font-bold text-slate-400">/ 10</span>
 </div>
 </div>

 <!-- Loading -->
 <div v-if="interviewStore.scorecardsLoading" class="animate-pulse space-y-4">
 <div v-for="i in 2" :key="i" class="h-24 bg-slate-100 rounded-xl" />
 </div>

 <!-- Empty -->
 <div v-else-if="interviewStore.scorecards.length === 0" class="text-sm font-medium text-slate-500 text-center py-12">
 No scorecards submitted yet. Interviewers will submit their evaluations here.
 </div>

 <!-- Scorecard cards -->
 <div v-else class="space-y-4">
 <div
 v-for="sc in interviewStore.scorecards"
 :key="sc.id"
 class="bg-slate-50 border border-slate-200 rounded-2xl p-5"
 >
 <!-- Header -->
 <div class="flex items-center justify-between mb-3">
 <div class="flex items-center gap-2">
 <div class="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
 {{ sc.interviewerName.charAt(0).toUpperCase() }}
 </div>
 <div>
 <span class="text-sm font-medium text-gray-900">{{ sc.interviewerName }}</span>
 <span class="block text-[10px] text-gray-400">{{ formatDate(sc.createdAt) }}</span>
 </div>
 </div>
 <div class="flex items-center gap-2">
 <span
 class="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full"
 :class="resultConfig[sc.result].class"
 >
 {{ resultConfig[sc.result].label }}
 </span>
 <span class="text-lg font-bold tabular-nums" :class="getScoreColor(sc.averageScore)">
 {{ sc.averageScore.toFixed(1) }}
 </span>
 </div>
 </div>

 <!-- Score bars -->
 <div class="space-y-2">
 <div v-for="{ label, value } in [
 { label: 'Skill', value: sc.skillScore },
 { label: 'Attitude', value: sc.attitudeScore },
 { label: 'English', value: sc.englishScore },
 ]" :key="label" class="flex items-center gap-2">
 <span class="text-[10px] font-medium text-gray-400 w-14 shrink-0">{{ label }}</span>
 <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
 <div
 class="h-full rounded-full transition-all duration-500"
 :class="getScoreBarColor(value)"
 :style="{ width: getScoreBarWidth(value) }"
 />
 </div>
 <span class="text-xs font-medium tabular-nums w-6 text-right" :class="getScoreColor(value)">
 {{ value }}
 </span>
 </div>
 </div>

 <!-- Comments -->
 <p v-if="sc.comments" class="mt-3 text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 border border-border italic">
 {{ sc.comments }}
 </p>
 </div>
 </div>
 </div>

 <!-- ─── AI Interview Questions ─── -->
 <div class="premium-card p-8 border-t-4 border-t-amber-400">
 <div class="flex items-center justify-between mb-6">
 <h2 class="text-lg font-bold text-slate-900 ">AI Interview Questions</h2>
 <div class="flex items-center gap-3">
 <button
 v-if="!interviewStore.aiQuestions"
 @click="loadQuestions"
 class="text-xs text-slate-500 hover:text-slate-700 :text-slate-200 font-bold transition-colors uppercase tracking-wider"
 >
 Load Questions
 </button>
 <button
 @click="handleGenerateQuestions"
 :disabled="interviewStore.generateQuestionsLoading"
 class="btn-primary"
 >
 <span v-if="interviewStore.generateQuestionsLoading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 <template v-else>⚡</template>
 {{ interviewStore.aiQuestions ? 'Regenerate' : 'Generate' }}
 </button>
 </div>
 </div>

 <!-- Loading -->
 <div v-if="interviewStore.questionsLoading || interviewStore.generateQuestionsLoading" class="animate-pulse space-y-3">
 <div v-for="i in 4" :key="i" class="h-16 bg-gray-100 rounded" />
 </div>

 <!-- Empty -->
 <div v-else-if="!interviewStore.aiQuestions" class="text-sm text-gray-400 text-center py-8">
 No questions generated yet. Click "Generate" to create AI-powered interview questions.
 </div>

 <!-- Questions list -->
 <div v-else>
 <div class="flex items-center gap-3 mb-4 text-xs text-gray-400">
 <span>{{ interviewStore.aiQuestions.jobTitle }}</span>
 <span class="text-gray-300">·</span>
 <span>{{ interviewStore.aiQuestions.candidateName }}</span>
 <span class="text-gray-300">·</span>
 <span>Generated {{ formatDate(interviewStore.aiQuestions.generatedAt) }}</span>
 </div>

 <div class="space-y-3">
 <div
 v-for="(q, idx) in interviewStore.aiQuestions.questions"
 :key="idx"
 class="bg-white border border-border rounded-lg p-4 hover:border-primary/10 transition"
 >
 <div class="flex items-start justify-between mb-2">
 <div class="flex items-center gap-2">
 <span class="text-xs font-bold text-gray-300">{{ idx + 1 }}.</span>
 <span class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-gray-50 text-gray-500 rounded-full border border-border">
 {{ q.category }}
 </span>
 </div>
 <span
 class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full"
 :class="difficultyColor[q.difficulty] ?? 'bg-gray-50 text-gray-500'"
 >
 {{ q.difficulty }}
 </span>
 </div>
 <p class="text-sm text-gray-900 leading-relaxed mb-2">{{ q.question }}</p>
 <p class="text-[11px] text-gray-400 italic">Intent: {{ q.intent }}</p>
 </div>
 </div>

 <p v-if="interviewStore.aiQuestions.source" class="mt-3 text-[10px] text-gray-400 italic">
 Source: {{ interviewStore.aiQuestions.source }}
 </p>
 </div>
 </div>
 </div>

 <!-- Not found -->
 <div v-else-if="!interviewStore.detailLoading" class="bg-surface border border-border rounded-lg p-12 shadow-sm text-center">
 <p class="text-gray-400 text-sm">Interview not found or you don't have access to view it.</p>
 <button @click="router.back()" class="mt-3 text-primary hover:text-primary-hover text-sm font-medium transition">
 ← Go Back
 </button>
 </div>

 <!-- ─── Confirmation Modal ─── -->
 <Teleport to="body">
 <div v-if="showConfirm && confirmAction" class="premium-modal-backdrop">
 <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showConfirm = false" />
 <div class="premium-modal-content w-full max-w-sm text-center">
 <div
 class="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl font-bold mx-auto mb-5 rotate-3 shadow-sm border-2"
 :class="confirmAction === 'complete' ? 'bg-emerald-50 text-emerald-500 border-emerald-100 ' : 'bg-slate-100 text-slate-500 border-slate-200 '"
 >
 {{ confirmAction === 'complete' ? '✓' : '✕' }}
 </div>
 <h2 class="text-xl font-extrabold text-slate-900 mb-2">
 {{ confirmAction === 'complete' ? 'Mark as Completed?' : 'Cancel Interview?' }}
 </h2>
 <p class="text-sm font-medium text-slate-500 mb-8">
 <template v-if="confirmAction === 'complete'">
 This will mark the interview as completed. Interviewers can still submit scorecards afterwards.
 </template>
 <template v-else>
 This will cancel the interview. This action cannot be undone.
 </template>
 </p>
 <div class="flex justify-center gap-3">
 <button
 @click="showConfirm = false"
 class="btn-secondary"
 >
 Go Back
 </button>
 <button
 @click="handleConfirm"
 :disabled="confirmProcessing"
 class="btn-primary"
 :class="confirmAction === 'complete' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'"
 >
 <span v-if="confirmProcessing" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ confirmProcessing ? 'Processing…' : confirmAction === 'complete' ? 'Complete' : 'Cancel It' }}
 </button>
 </div>
 </div>
 </div>
 </Teleport>
 </div>
</template>
