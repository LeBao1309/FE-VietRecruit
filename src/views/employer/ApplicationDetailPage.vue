<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAuthStore } from '@/stores/authStore'
import { applicationService } from '@/services/applicationService'
import type { ApplicationStatus } from '@/types/enums'
import type { ApplicationScreeningResponse } from '@/types/application'

const route = useRoute()
const router = useRouter()
const appStore = useApplicationStore()
const auth = useAuthStore()

const applicationId = computed(() => route.params.id as string)

// ── Status config ──
const statusConfig: Record<ApplicationStatus, { label: string; class: string; dotClass: string }> = {
 NEW: { label: 'Applied', class: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-400' },
 SCREENING: { label: 'Screening', class: 'bg-amber-50 text-amber-600', dotClass: 'bg-amber-400' },
 INTERVIEW: { label: 'Interview', class: 'bg-purple-50 text-purple-600', dotClass: 'bg-purple-500' },
 OFFER: { label: 'Offer', class: 'bg-primary-bg text-primary', dotClass: 'bg-primary' },
 HIRED: { label: 'Hired', class: 'bg-success-bg text-success', dotClass: 'bg-green-500' },
 REJECTED: { label: 'Rejected', class: 'bg-error-bg text-error', dotClass: 'bg-red-400' },
}

// ── Transition button config ──
const transitionButtonConfig: Record<ApplicationStatus, { label: string; class: string; confirmTitle: string; confirmDesc: string }> = {
 SCREENING: {
 label: 'Move to Screening',
 class: 'bg-amber-500 hover:bg-amber-600 text-white',
 confirmTitle: 'Move to Screening?',
 confirmDesc: 'Confirm to move this candidate to the screening stage.',
 },
 INTERVIEW: {
 label: 'Move to Interview',
 class: 'bg-purple-500 hover:bg-purple-600 text-white',
 confirmTitle: 'Move to Interview?',
 confirmDesc: 'The candidate will be advanced to the Interview stage, where you can schedule interviews.',
 },
 OFFER: {
 label: 'Move to Offer',
 class: 'bg-primary hover:bg-primary-hover text-white',
 confirmTitle: 'Move to Offer?',
 confirmDesc: "The candidate will be advanced to the Offer stage. You can draft the offer letter immediately after.",
 },
 REJECTED: {
 label: 'Reject',
 class: 'bg-error hover:bg-red-700 text-white',
 confirmTitle: 'Reject Candidate?',
 confirmDesc: 'This application will be marked as Rejected. This action cannot be undone.',
 },
 NEW: { label: '', class: '', confirmTitle: '', confirmDesc: '' },
 HIRED: { label: '', class: '', confirmTitle: '', confirmDesc: '' },
}

// ── Pipeline step display ──
const PIPELINE_STEPS: { status: ApplicationStatus; label: string }[] = [
 { status: 'NEW', label: 'Applied' },
 { status: 'SCREENING', label: 'Screening' },
 { status: 'INTERVIEW', label: 'Interview' },
 { status: 'OFFER', label: 'Offer' },
 { status: 'HIRED', label: 'Hired' },
]

const STAGE_ORDER: ApplicationStatus[] = ['NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED']

function getStepState(stepStatus: ApplicationStatus): 'completed' | 'current' | 'upcoming' | 'rejected' {
 const app = appStore.currentApplication
 if (!app) return 'upcoming'
 if (app.status === 'REJECTED') {
 const currentIdx = STAGE_ORDER.indexOf(stepStatus)
 const rejectedAtIdx = stageBeforeRejection.value
 if (currentIdx < rejectedAtIdx) return 'completed'
 if (currentIdx === rejectedAtIdx) return 'rejected'
 return 'upcoming'
 }
 const appIdx = STAGE_ORDER.indexOf(app.status)
 const stepIdx = STAGE_ORDER.indexOf(stepStatus)
 if (stepIdx < appIdx) return 'completed'
 if (stepIdx === appIdx) return 'current'
 return 'upcoming'
}

/** Determine which stage the rejection happened at (from history) */
const stageBeforeRejection = computed(() => {
 if (appStore.currentApplication?.status !== 'REJECTED') return -1
 // Find the last non-REJECTED status from history
 for (let i = appStore.statusHistory.length - 1; i >= 0; i--) {
 const entry = appStore.statusHistory[i]
 if (entry && entry.newStatus === 'REJECTED' && entry.oldStatus) {
 return STAGE_ORDER.indexOf(entry.oldStatus as ApplicationStatus)
 }
 }
 return 0
})

// ── Confirmation modal ──
const showConfirm = ref(false)
const pendingTransition = ref<ApplicationStatus | null>(null)
const transitionNotes = ref('')

function openTransition(status: ApplicationStatus): void {
 pendingTransition.value = status
 transitionNotes.value = ''
 showConfirm.value = true
}

async function confirmTransition(): Promise<void> {
 if (!pendingTransition.value) return
 const success = await appStore.updateStatus(
 applicationId.value,
 pendingTransition.value,
 transitionNotes.value || undefined,
 )
 if (success) {
 showConfirm.value = false
 // Refresh history
 appStore.fetchStatusHistory(applicationId.value)
 }
}

// ── Helpers ──
const canManage = computed(() => auth.isCompanyAdmin || auth.isHR)

// formatDate removed — all usages use formatDateTime instead

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN', {
 month: 'short', day: 'numeric', year: 'numeric',
 hour: '2-digit', minute: '2-digit',
 })
}

// ── AI Match Score ──
const matchScore = ref<ApplicationScreeningResponse | null>(null)
const matchLoading = ref(false)

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400'
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-500'
}
function getScoreBarColor(score: number | null): string {
  if (score === null) return 'bg-gray-200'
  if (score >= 80) return 'bg-green-400'
  if (score >= 60) return 'bg-amber-400'
  return 'bg-red-400'
}

async function loadMatchScore(jobId: string, candidateId: string): Promise<void> {
  matchLoading.value = true
  try {
    const result = await applicationService.getScreeningResults(jobId)
    if (result.data) {
      matchScore.value = result.data.find((r) => r.candidateId === candidateId) ?? null
    }
  } finally {
    matchLoading.value = false
  }
}

// ── Init ──
onMounted(async () => {
 const loaded = await appStore.fetchApplication(applicationId.value)
 if (loaded) {
   appStore.fetchStatusHistory(applicationId.value)
   const app = appStore.currentApplication
   if (app) loadMatchScore(app.jobId, app.candidateId)
 }
})

onBeforeUnmount(() => {
 appStore.clearCurrent()
})
</script>

<template>
 <div class="max-w-4xl mx-auto px-6 pb-8">
 <!-- Breadcrumb -->
 <nav class="flex items-center gap-1.5 mb-6 text-sm text-gray-400 flex-wrap">
  <router-link to="/employer/jobs" class="hover:text-gray-600 transition">Jobs</router-link>
  <span>›</span>
  <router-link
   v-if="appStore.currentApplication?.jobId"
   :to="`/employer/jobs/${appStore.currentApplication.jobId}`"
   class="hover:text-gray-600 transition truncate max-w-[140px]"
  >{{ appStore.currentApplication.jobTitle ?? '…' }}</router-link>
  <span v-else>…</span>
  <span>›</span>
  <router-link
   v-if="appStore.currentApplication?.jobId"
   :to="`/employer/jobs/${appStore.currentApplication.jobId}/applications`"
   class="hover:text-gray-600 transition"
  >Applications</router-link>
  <span v-else>Applications</span>
  <span>›</span>
  <span class="text-gray-700 font-medium truncate max-w-[160px]">
   {{ appStore.currentApplication?.candidateName ?? '…' }}
  </span>
 </nav>

 <!-- Loading skeleton -->
 <div v-if="appStore.detailLoading" class="space-y-4">
 <div class="bg-surface border border-border rounded-lg p-6 shadow-sm animate-pulse space-y-4">
 <div class="h-6 bg-gray-100 rounded w-64" />
 <div class="h-4 bg-gray-100 rounded w-32" />
 <div class="h-20 bg-gray-100 rounded w-full" />
 </div>
 </div>

 <div v-else-if="appStore.currentApplication" class="space-y-5">
 <!-- ─── Header Card ─── -->
 <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
 <div class="flex items-start justify-between mb-5">
 <div>
 <h1 class="text-xl font-bold text-gray-900 mb-1">
 {{ appStore.currentApplication.candidateName }}
 </h1>
 <div class="flex items-center gap-3 flex-wrap">
 <span
 class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
 :class="statusConfig[appStore.currentApplication.status].class"
 >
 <span class="w-1.5 h-1.5 rounded-full" :class="statusConfig[appStore.currentApplication.status].dotClass" />
 {{ statusConfig[appStore.currentApplication.status].label }}
 </span>
 <span class="text-xs text-gray-400">
 Applied at {{ formatDateTime(appStore.currentApplication.createdAt) }}
 </span>
 </div>
 </div>

 <!-- Quick actions -->
 <div v-if="canManage" class="flex items-center gap-2 shrink-0">
 <router-link
 :to="`/employer/applications/${applicationId}/interviews`"
 class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
 >
 Interview
 </router-link>
 <router-link
 v-if="appStore.currentApplication.status === 'OFFER'"
 :to="`/employer/offers/${applicationId}`"
 class="px-3 py-1.5 text-xs font-medium text-primary bg-primary-bg border border-primary/10 rounded-md hover:bg-primary-light transition"
 >
 View Offer Letter
 </router-link>
 </div>
 </div>

 <!-- Pipeline Progress Bar -->
 <div class="relative">
 <div class="flex items-center">
 <div
 v-for="(step, idx) in PIPELINE_STEPS"
 :key="step.status"
 class="flex items-center"
 :class="idx < PIPELINE_STEPS.length - 1 ? 'flex-1' : ''"
 >
 <!-- Step dot -->
 <div
 class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0"
 :class="{
 'bg-primary border-primary text-white': getStepState(step.status) === 'completed',
 'bg-white border-primary text-primary ring-4 ring-primary/10': getStepState(step.status) === 'current',
 'bg-white border-gray-200 text-gray-400': getStepState(step.status) === 'upcoming',
 'bg-red-100 border-red-400 text-red-500': getStepState(step.status) === 'rejected',
 }"
 >
 <template v-if="getStepState(step.status) === 'completed'">✓</template>
 <template v-else-if="getStepState(step.status) === 'rejected'">✕</template>
 <template v-else>{{ idx + 1 }}</template>
 </div>
 <!-- Connector -->
 <div
 v-if="idx < PIPELINE_STEPS.length - 1"
 class="flex-1 h-0.5 mx-2 transition-all"
 :class="{
 'bg-primary': getStepState(step.status) === 'completed',
 'bg-gray-200': getStepState(step.status) !== 'completed',
 }"
 />
 </div>
 </div>
 <!-- Step labels -->
 <div class="flex items-center mt-2">
 <div
 v-for="(step, idx) in PIPELINE_STEPS"
 :key="'label-' + step.status"
 class="text-center"
 :class="idx < PIPELINE_STEPS.length - 1 ? 'flex-1' : ''"
 :style="{ minWidth: '64px' }"
 >
 <span
 class="text-[10px] font-medium"
 :class="{
 'text-primary': getStepState(step.status) === 'completed' || getStepState(step.status) === 'current',
 'text-gray-400': getStepState(step.status) === 'upcoming',
 'text-red-500': getStepState(step.status) === 'rejected',
 }"
 >
 {{ step.label }}
 </span>
 </div>
 </div>
 <!-- Rejected badge -->
 <div
 v-if="appStore.currentApplication.status === 'REJECTED'"
 class="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-error-bg text-error text-xs"
 >
 <span class="font-medium">Rejected</span>
 <span class="text-red-400">— This application has been rejected.</span>
 </div>
 </div>
 </div>

 <!-- ─── Status Transition Buttons ─── -->
 <div v-if="canManage && appStore.canTransition" class="bg-surface border border-border rounded-lg p-5 shadow-sm">
 <h2 class="text-sm font-semibold text-gray-900 mb-3">Change Status</h2>
 <div class="flex items-center gap-2 flex-wrap">
 <button
 v-for="nextStatus in appStore.validTransitions"
 :key="nextStatus"
 @click="openTransition(nextStatus)"
 :disabled="appStore.statusLoading"
 class="px-4 py-2 text-sm font-medium rounded-md transition disabled:opacity-50 flex items-center gap-1.5"
 :class="transitionButtonConfig[nextStatus].class"
 >
 {{ transitionButtonConfig[nextStatus].label }}
 </button>
 </div>
 </div>

 <!-- ─── Candidate Info ─── -->
 <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
 <h2 class="text-sm font-semibold text-gray-900 mb-4">Application Info</h2>
 <div class="grid grid-cols-2 gap-4">
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Position</span>
 <router-link
 :to="`/employer/jobs/${appStore.currentApplication.jobId}`"
 class="text-sm font-medium text-primary hover:text-primary-hover transition"
 >
 {{ appStore.currentApplication.jobTitle }}
 </router-link>
 </div>
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Candidate</span>
 <span class="text-sm font-medium text-gray-900">{{ appStore.currentApplication.candidateName }}</span>
 </div>
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Applied Date</span>
 <span class="text-sm text-gray-700">{{ formatDateTime(appStore.currentApplication.createdAt) }}</span>
 </div>
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Last Updated</span>
 <span class="text-sm text-gray-700">{{ formatDateTime(appStore.currentApplication.updatedAt) }}</span>
 </div>
 </div>

 <!-- Cover Letter -->
 <div v-if="appStore.currentApplication.coverLetter" class="mt-5 pt-5 border-t border-border">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Cover Letter</span>
 <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-border">
 {{ appStore.currentApplication.coverLetter }}
 </div>
 </div>

 <!-- CV Link -->
 <div v-if="appStore.currentApplication.appliedCvUrl" class="mt-5 pt-5 border-t border-border">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Submitted CV</span>
 <a
 :href="appStore.currentApplication.appliedCvUrl"
 target="_blank"
 rel="noopener"
 class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary bg-primary-bg border border-primary/10 rounded-md hover:bg-primary-light transition"
 >
 <span>📄</span>
 View CV
 <span class="text-xs text-gray-400">↗</span>
 </a>
 </div>
 </div>

 <!-- ─── AI Match Score ─── -->
 <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
 <h2 class="text-sm font-semibold text-gray-900 mb-4">AI Match Score</h2>

 <!-- Loading -->
 <div v-if="matchLoading" class="animate-pulse space-y-3">
 <div class="flex items-center gap-4">
 <div class="w-16 h-16 bg-gray-100 rounded-full" />
 <div class="flex-1 space-y-2">
 <div class="h-3 bg-gray-100 rounded w-48" />
 <div class="h-2 bg-gray-100 rounded w-full" />
 </div>
 </div>
 </div>

 <!-- No results yet -->
 <div v-else-if="!matchScore" class="text-center py-6">
 <p class="text-sm text-gray-400 mb-1">No AI analysis for this application yet.</p>
 <p class="text-xs text-gray-400">
 Run <span class="font-semibold">AI Screen</span> from the pipeline to generate match scores.
 </p>
 </div>

 <!-- Score display -->
 <div v-else class="space-y-4">
 <!-- Score header -->
 <div class="flex items-center gap-5">
 <!-- AI Score circle -->
 <div class="relative w-16 h-16 shrink-0">
 <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
 <circle cx="18" cy="18" r="15.5" fill="none" class="stroke-gray-100" stroke-width="3" />
 <circle
 cx="18" cy="18" r="15.5" fill="none" stroke-width="3" stroke-linecap="round"
 :stroke-dasharray="`${((matchScore.aiScore ?? 0) / 100) * 97.4} 97.4`"
 :class="{
 'stroke-green-500': (matchScore.aiScore ?? 0) >= 80,
 'stroke-amber-400': (matchScore.aiScore ?? 0) >= 60 && (matchScore.aiScore ?? 0) < 80,
 'stroke-red-400': (matchScore.aiScore ?? 0) < 60,
 }"
 />
 </svg>
 <span
 class="absolute inset-0 flex items-center justify-center text-sm font-black"
 :class="getScoreColor(matchScore.aiScore)"
 >
 {{ matchScore.aiScore ?? '—' }}
 </span>
 </div>
 <div class="flex-1 min-w-0">
 <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">AI Score</p>
 <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
 <div
 class="h-full rounded-full transition-all duration-500"
 :class="getScoreBarColor(matchScore.aiScore)"
 :style="{ width: `${Math.min(100, matchScore.aiScore ?? 0)}%` }"
 />
 </div>
 <div v-if="matchScore.similarityScore !== null" class="mt-1.5 text-xs text-gray-500">
 Similarity: <span class="font-semibold" :class="getScoreColor(matchScore.similarityScore)">{{ matchScore.similarityScore }}%</span>
 </div>
 </div>
 </div>

 <!-- Score breakdown -->
 <div v-if="matchScore.scoreBreakdown" class="grid grid-cols-3 gap-2">
 <div
 v-for="(score, key) in matchScore.scoreBreakdown"
 :key="key"
 class="text-center bg-gray-50 rounded-lg py-2.5 border border-gray-100"
 >
 <span class="block text-sm font-bold text-gray-800">{{ score }}</span>
 <span class="block text-[10px] text-gray-400 capitalize mt-0.5">{{ key }}</span>
 </div>
 </div>

 <!-- Strengths & Gaps -->
 <div class="grid grid-cols-2 gap-4">
 <div v-if="matchScore.strengths?.length">
 <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Strengths</p>
 <ul class="space-y-1">
 <li
 v-for="(s, i) in matchScore.strengths"
 :key="i"
 class="flex items-start gap-1.5 text-xs text-gray-700"
 >
 <span class="text-green-500 shrink-0 mt-px font-bold">✓</span>
 {{ s }}
 </li>
 </ul>
 </div>
 <div v-if="matchScore.gaps?.length">
 <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Gaps</p>
 <ul class="space-y-1">
 <li
 v-for="(g, i) in matchScore.gaps"
 :key="i"
 class="flex items-start gap-1.5 text-xs text-gray-700"
 >
 <span class="text-red-400 shrink-0 mt-px font-bold">✗</span>
 {{ g }}
 </li>
 </ul>
 </div>
 </div>

 <!-- Summary -->
 <p v-if="matchScore.summary" class="text-xs text-gray-500 italic bg-gray-50 rounded-lg p-3 border border-gray-100 leading-relaxed">
 {{ matchScore.summary }}
 </p>
 </div>
 </div>

 <!-- ─── Status History (Timeline) ─── -->
 <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
 <h2 class="text-sm font-semibold text-gray-900 mb-4">Status History</h2>

 <!-- Loading -->
 <div v-if="appStore.historyLoading" class="animate-pulse space-y-3">
 <div v-for="i in 3" :key="i" class="flex gap-3">
 <div class="w-3 h-3 bg-gray-100 rounded-full mt-1" />
 <div class="flex-1 space-y-1">
 <div class="h-3 bg-gray-100 rounded w-48" />
 <div class="h-3 bg-gray-100 rounded w-32" />
 </div>
 </div>
 </div>

 <!-- Empty -->
 <div v-else-if="appStore.statusHistory.length === 0" class="text-sm text-gray-400 text-center py-8">
 No status changes recorded yet.
 </div>

 <!-- Timeline -->
 <div v-else class="relative">
 <!-- Vertical line -->
 <div class="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />

 <div
 v-for="(h, idx) in appStore.statusHistory"
 :key="h.id"
 class="relative flex gap-4 pb-5 last:pb-0"
 >
 <!-- Dot -->
 <div
 class="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 z-10"
 :class="{
 'bg-primary border-primary': idx === 0,
 'bg-white border-gray-300': idx > 0,
 }"
 />

 <!-- Content -->
 <div class="flex-1 min-w-0">
 <div class="flex items-center gap-2 flex-wrap">
 <span v-if="h.oldStatus" class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full" :class="statusConfig[h.oldStatus].class">
 {{ statusConfig[h.oldStatus].label }}
 </span>
 <span v-if="h.oldStatus" class="text-gray-300 text-xs">→</span>
 <span class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full" :class="statusConfig[h.newStatus].class">
 {{ statusConfig[h.newStatus].label }}
 </span>
 </div>
 <div class="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
 <span>{{ h.changedByName }}</span>
 <span class="text-gray-300">·</span>
 <span>{{ formatDateTime(h.changedAt) }}</span>
 </div>
 <p v-if="h.notes" class="mt-1.5 text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 border border-border">
 {{ h.notes }}
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>

 <!-- Not found -->
 <div v-else-if="!appStore.detailLoading" class="bg-surface border border-border rounded-lg p-12 shadow-sm text-center">
 <p class="text-gray-400 text-sm">Application not found or you do not have permission to view it.</p>
 <button @click="router.back()" class="mt-3 text-primary hover:text-primary-hover text-sm font-medium transition">
 ← Back
 </button>
 </div>

 <!-- ─── Confirmation Modal ─── -->
 <Teleport to="body">
 <div v-if="showConfirm && pendingTransition" class="fixed inset-0 z-50 flex items-center justify-center">
 <div class="absolute inset-0 bg-black/40" @click="showConfirm = false" />
 <div class="relative bg-surface rounded-lg shadow-xl border border-border w-full max-w-md p-6 animate-slide-up">
 <div class="text-center mb-5">
 <div
 class="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-3"
 :class="pendingTransition === 'REJECTED' ? 'bg-error-bg text-error' : 'bg-primary-bg text-primary'"
 >
 {{ pendingTransition === 'REJECTED' ? '✕' : '→' }}
 </div>
 <h2 class="text-lg font-bold text-gray-900 mb-1">
 {{ transitionButtonConfig[pendingTransition].confirmTitle }}
 </h2>
 <p class="text-sm text-gray-500">
 {{ transitionButtonConfig[pendingTransition].confirmDesc }}
 </p>
 </div>

 <!-- Optional notes -->
 <div class="mb-5">
 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
 Notes (Optional)
 </label>
 <textarea
 v-model="transitionNotes"
 rows="3"
 placeholder="Add a note here..."
 class="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition resize-none"
 />
 </div>

 <div class="flex justify-center gap-2">
 <button
 @click="showConfirm = false"
 class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
 >
 Cancel
 </button>
 <button
 @click="confirmTransition"
 :disabled="appStore.statusLoading"
 class="px-4 py-2 text-sm font-medium text-white rounded-md transition disabled:opacity-50 flex items-center gap-2"
 :class="transitionButtonConfig[pendingTransition].class"
 >
 <span v-if="appStore.statusLoading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ appStore.statusLoading ? 'Processing...' : 'Confirm' }}
 </button>
 </div>
 </div>
 </div>
 </Teleport>
 </div>
</template>
