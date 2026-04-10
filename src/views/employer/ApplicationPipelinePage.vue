<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApplicationStore, VALID_TRANSITIONS } from '@/stores/applicationStore'
import { useJobStore } from '@/stores/jobStore'
import { useInterviewStore } from '@/stores/interviewStore'
import { useOfferStore } from '@/stores/offerStore'
import { useUiStore } from '@/stores/uiStore'
import { interviewService } from '@/services/interviewService'
import type { ApplicationStatus } from '@/types/enums'
import type { ApplicationSummaryResponse, InterviewCreateRequest } from '@/types/application'

const route = useRoute()
const router = useRouter()
const appStore = useApplicationStore()
const jobStore = useJobStore()
const interviewStore = useInterviewStore()
const offerStore = useOfferStore()
const ui = useUiStore()

const jobId = computed(() => route.params.id as string)

// ── View mode toggle ──
const viewMode = ref<'kanban' | 'table'>('kanban')

// ── Table pagination / filter ──
const currentPage = ref(0)
const pageSize = ref(20)
const statusFilter = ref<ApplicationStatus | ''>('')

// ── Screening panel ──
const showScreening = ref(false)

// ── Stage-specific modal config ──
interface StageModalConfig {
  icon: string
  iconBg: string
  iconColor: string
  title: string
  description: string
  noteLabel: string
  notePlaceholder: string
  confirmLabel: string
  confirmClass: string
  showRejectionReason: boolean
}
const STAGE_MODAL_CONFIG: Record<ApplicationStatus, StageModalConfig> = {
  SCREENING: {
    icon: '🔍', iconBg: 'bg-amber-50', iconColor: 'text-amber-500',
    title: 'Move to Screening?',
    description: 'The candidate will enter the screening stage for initial evaluation.',
    noteLabel: 'Screening Notes', notePlaceholder: 'What criteria will you screen on? (optional)',
    confirmLabel: 'Start Screening', confirmClass: 'bg-amber-500 hover:bg-amber-600 text-white',
    showRejectionReason: false,
  },
  INTERVIEW: {
    icon: '📅', iconBg: 'bg-purple-50', iconColor: 'text-purple-600',
    title: 'Schedule Interview',
    description: 'Candidate passed screening. Fill in the interview details — the session will be created immediately.',
    noteLabel: 'Additional Notes', notePlaceholder: 'Focus areas or instructions for the interviewer... (optional)',
    confirmLabel: 'Move & Schedule Interview', confirmClass: 'bg-purple-600 hover:bg-purple-700 text-white',
    showRejectionReason: false,
  },
  OFFER: {
    icon: '🤝', iconBg: 'bg-teal-50', iconColor: 'text-teal-600',
    title: 'Create Offer',
    description: 'Fill in the offer details below. The application will move to Offer stage and the draft will be created immediately.',
    noteLabel: 'Additional Notes', notePlaceholder: 'Any notes on compensation or conditions... (optional)',
    confirmLabel: 'Move & Create Offer', confirmClass: 'bg-teal-600 hover:bg-teal-700 text-white',
    showRejectionReason: false,
  },
  REJECTED: {
    icon: '✕', iconBg: 'bg-red-50', iconColor: 'text-red-500',
    title: 'Reject this Candidate?',
    description: 'This application will be marked Rejected. This action cannot be undone.',
    noteLabel: 'Additional Notes', notePlaceholder: 'Any additional feedback... (optional)',
    confirmLabel: 'Confirm Rejection', confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
    showRejectionReason: true,
  },
  NEW: { icon: '', iconBg: '', iconColor: '', title: '', description: '', noteLabel: '', notePlaceholder: '', confirmLabel: '', confirmClass: '', showRejectionReason: false },
  HIRED: { icon: '', iconBg: '', iconColor: '', title: '', description: '', noteLabel: '', notePlaceholder: '', confirmLabel: '', confirmClass: '', showRejectionReason: false },
}

const REJECTION_REASONS = [
  'Insufficient experience',
  'Skills do not match requirements',
  'Salary expectations too high',
  'Did not pass technical assessment',
  'Position filled internally',
  'Candidate withdrew application',
  'Other',
]

// ── Drag & Drop ──
interface PendingMove {
  app: ApplicationSummaryResponse
  fromStatus: ApplicationStatus
  toStatus: ApplicationStatus
}
const draggingApp = ref<ApplicationSummaryResponse | null>(null)
const dragOverStatus = ref<ApplicationStatus | null>(null)
const pendingMove = ref<PendingMove | null>(null)
const showConfirm = ref(false)
const confirmNotes = ref('')
const rejectionReason = ref('')

// ── Interview form (used when moving to INTERVIEW stage) ──
const interviewForm = ref<InterviewCreateRequest>({
  title: '',
  scheduledAt: '',
  durationMinutes: 60,
  locationOrLink: '',
  interviewType: 'ONLINE',
  interviewerIds: [],
})
const interviewFormErrors = ref<Record<string, string>>({})
const interviewerIdInput = ref('')

// ── Offer form (used when moving to OFFER stage) ──
const offerForm = ref({
  baseSalary: null as number | null,
  currency: 'VND',
  startDate: '',
  note: '',
  offerLetterUrl: '',
})
const offerFormErrors = ref<Record<string, string>>({})

// ── Interview completion check (for OFFER stage gate) ──
const interviewsForOffer = ref<{ id: string; title: string; status: string }[]>([])
const interviewsForOfferLoading = ref(false)

const hasCompletedInterview = computed(() =>
  interviewsForOffer.value.some((i) => i.status === 'COMPLETED'),
)

const stageConfig = computed<StageModalConfig | null>(() =>
  pendingMove.value ? STAGE_MODAL_CONFIG[pendingMove.value.toStatus] : null,
)

function resetConfirmForm(): void {
  confirmNotes.value = ''
  rejectionReason.value = ''
  interviewForm.value = { title: '', scheduledAt: '', durationMinutes: 60, locationOrLink: '', interviewType: 'ONLINE', interviewerIds: [] }
  interviewFormErrors.value = {}
  interviewerIdInput.value = ''
  offerForm.value = { baseSalary: null, currency: 'VND', startDate: '', note: '', offerLetterUrl: '' }
  offerFormErrors.value = {}
  interviewsForOffer.value = []
}

// ── Interview form helpers ──
function validateInterviewForm(): boolean {
  const errors: Record<string, string> = {}
  if (!interviewForm.value.title.trim()) errors.title = 'Interview title is required.'
  if (!interviewForm.value.scheduledAt) {
    errors.scheduledAt = 'Date and time are required.'
  } else if (new Date(interviewForm.value.scheduledAt) <= new Date()) {
    errors.scheduledAt = 'Scheduled time must be in the future.'
  }
  if (interviewForm.value.interviewerIds.length === 0) {
    errors.interviewerIds = 'At least one interviewer is required.'
  }
  interviewFormErrors.value = errors
  return Object.keys(errors).length === 0
}

function addInterviewerId(): void {
  const id = interviewerIdInput.value.trim()
  if (id && !interviewForm.value.interviewerIds.includes(id)) {
    interviewForm.value.interviewerIds.push(id)
    interviewerIdInput.value = ''
    delete interviewFormErrors.value.interviewerIds
  }
}

function removeInterviewerId(id: string): void {
  interviewForm.value.interviewerIds = interviewForm.value.interviewerIds.filter((i) => i !== id)
}

// ── Offer form helpers ──
function validateOfferForm(): boolean {
  const errors: Record<string, string> = {}
  if (!offerForm.value.baseSalary || offerForm.value.baseSalary <= 0) {
    errors.baseSalary = 'Base salary must be a positive number.'
  }
  offerFormErrors.value = errors
  return Object.keys(errors).length === 0
}

// ── Fetch interviews for OFFER gate check ──
async function loadInterviewsForOffer(applicationId: string): Promise<void> {
  interviewsForOfferLoading.value = true
  try {
    const result = await interviewService.listInterviews(applicationId)
    interviewsForOffer.value = result.data ?? []
  } finally {
    interviewsForOfferLoading.value = false
  }
}

function onDragStart(app: ApplicationSummaryResponse): void {
  draggingApp.value = app
}

function onDragEnd(): void {
  draggingApp.value = null
  dragOverStatus.value = null
}

function onDragEnter(status: ApplicationStatus): void {
  if (!draggingApp.value) return
  dragOverStatus.value = status
}

function onDragLeave(e: DragEvent): void {
  const target = e.currentTarget as HTMLElement
  if (!target.contains(e.relatedTarget as Node)) {
    dragOverStatus.value = null
  }
}

function onDrop(toStatus: ApplicationStatus): void {
  dragOverStatus.value = null
  if (!draggingApp.value) return
  const app = draggingApp.value
  draggingApp.value = null
  if (app.status === toStatus) return
  const allowed = VALID_TRANSITIONS[app.status] ?? []
  if (!allowed.includes(toStatus)) {
    ui.toastError('Invalid move', `Cannot move ${app.candidateName} from ${app.status} to ${toStatus}.`)
    return
  }
  // Card stays in original column — no optimistic update until API succeeds
  pendingMove.value = { app, fromStatus: app.status, toStatus }
  resetConfirmForm()
  showConfirm.value = true
  // For OFFER: immediately load interviews to check completion requirement
  if (toStatus === 'OFFER') {
    loadInterviewsForOffer(app.id)
  }
}

async function confirmMove(): Promise<void> {
  if (!pendingMove.value) return
  const { app, fromStatus, toStatus } = pendingMove.value

  if (toStatus === 'INTERVIEW') {
    if (!validateInterviewForm()) return
    const notes = confirmNotes.value.trim() || undefined
    const moved = await appStore.kanbanMove(app.id, fromStatus, toStatus, notes)
    if (!moved) return
    // Schedule interview atomically with the stage move
    await interviewStore.scheduleInterview(app.id, {
      ...interviewForm.value,
      durationMinutes: interviewForm.value.durationMinutes || undefined,
      locationOrLink: interviewForm.value.locationOrLink || undefined,
      interviewType: interviewForm.value.interviewType || undefined,
    })
    closeConfirm()
  } else if (toStatus === 'OFFER') {
    if (interviewsForOfferLoading.value) return  // still loading
    if (!hasCompletedInterview.value) {
      ui.toastWarning('Interview required', 'Complete at least one interview before advancing to Offer.')
      return
    }
    if (!validateOfferForm()) return
    const notes = confirmNotes.value.trim() || undefined
    const moved = await appStore.kanbanMove(app.id, fromStatus, toStatus, notes)
    if (!moved) return
    // Create offer draft atomically with the stage move
    await offerStore.createOffer(app.id, {
      baseSalary: offerForm.value.baseSalary!,
      currency: offerForm.value.currency || undefined,
      startDate: offerForm.value.startDate || undefined,
      note: offerForm.value.note || undefined,
      offerLetterUrl: offerForm.value.offerLetterUrl || undefined,
    })
    closeConfirm()
  } else {
    // SCREENING or REJECTED — simple status update
    const notes = [
      rejectionReason.value ? `Reason: ${rejectionReason.value}` : '',
      confirmNotes.value.trim(),
    ].filter(Boolean).join(' — ') || undefined
    const success = await appStore.kanbanMove(app.id, fromStatus, toStatus, notes)
    if (success) closeConfirm()
  }
}

function closeConfirm(): void {
  pendingMove.value = null
  showConfirm.value = false
  resetConfirmForm()
}

function cancelConfirm(): void {
  // Card was never moved (no optimistic update) — nothing to rollback
  pendingMove.value = null
  showConfirm.value = false
  resetConfirmForm()
}

// ── Kanban column config ──
const PIPELINE_COLUMNS: { status: ApplicationStatus; label: string; color: string; dotClass: string }[] = [
 { status: 'NEW', label: 'Applied', color: 'border-t-blue-400', dotClass: 'bg-blue-400' },
 { status: 'SCREENING', label: 'Screening', color: 'border-t-amber-400', dotClass: 'bg-amber-400' },
 { status: 'INTERVIEW', label: 'Interview', color: 'border-t-purple-500', dotClass: 'bg-purple-500' },
 { status: 'OFFER', label: 'Offer', color: 'border-t-primary', dotClass: 'bg-primary' },
 { status: 'HIRED', label: 'Hired', color: 'border-t-green-500', dotClass: 'bg-green-500' },
 { status: 'REJECTED', label: 'Rejected', color: 'border-t-red-400', dotClass: 'bg-red-400' },
]

// Status badge styling
const statusBadgeConfig: Record<ApplicationStatus, { label: string; class: string }> = {
 NEW: { label: 'Applied', class: 'bg-blue-50 text-blue-600' },
 SCREENING: { label: 'Screening', class: 'bg-amber-50 text-amber-600' },
 INTERVIEW: { label: 'Interview', class: 'bg-purple-50 text-purple-600' },
 OFFER: { label: 'Offer', class: 'bg-primary-bg text-primary' },
 HIRED: { label: 'Hired', class: 'bg-success-bg text-success' },
 REJECTED: { label: 'Rejected', class: 'bg-error-bg text-error' },
}

const statusFilterOptions: { label: string; value: ApplicationStatus | '' }[] = [
 { label: 'All Statuses', value: '' },
 { label: 'New Application', value: 'NEW' },
 { label: 'Screening', value: 'SCREENING' },
 { label: 'Interview', value: 'INTERVIEW' },
 { label: 'Offer', value: 'OFFER' },
 { label: 'Hired', value: 'HIRED' },
 { label: 'Rejected', value: 'REJECTED' },
]

// ── Load data ──
async function loadKanban(): Promise<void> {
 await appStore.fetchAllForJob(jobId.value)
}

async function loadTable(): Promise<void> {
 await appStore.fetchApplications({
 jobId: jobId.value,
 status: statusFilter.value || undefined,
 page: currentPage.value,
 size: pageSize.value,
 sort: 'createdAt,desc',
 })
}

function reload(): void {
 if (viewMode.value === 'kanban') {
 loadKanban()
 } else {
 loadTable()
 }
}

watch([viewMode], () => {
 reload()
})

watch([currentPage, statusFilter], () => {
 if (viewMode.value === 'table') {
 loadTable()
 }
})

// ── Screening ──
async function handleTriggerScreening(): Promise<void> {
 const success = await appStore.triggerScreening(jobId.value)
 if (success) {
 // Wait a beat then fetch results
 setTimeout(() => {
 appStore.fetchScreeningResults(jobId.value)
 }, 2000)
 }
}

async function loadScreeningResults(): Promise<void> {
 showScreening.value = true
 await appStore.fetchScreeningResults(jobId.value)
}

function getScoreColor(score: number | null): string {
 if (score === null) return 'text-gray-400'
 if (score >= 80) return 'text-green-600'
 if (score >= 60) return 'text-amber-600'
 return 'text-red-500'
}

function getScoreBarWidth(score: number | null): string {
 if (score === null) return '0%'
 return `${Math.min(100, Math.max(0, score))}%`
}

function getScoreBarColor(score: number | null): string {
 if (score === null) return 'bg-gray-200'
 if (score >= 80) return 'bg-green-400'
 if (score >= 60) return 'bg-amber-400'
 return 'bg-red-400'
}

// ── Navigation ──
function goToDetail(appId: string): void {
 router.push(`/employer/jobs/${jobId.value}/applications/${appId}`)
}

// ── Helpers ──
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
 month: 'short',
 day: 'numeric',
 })
}

function columnCount(status: ApplicationStatus): number {
 return appStore.applicationsByStatus[status]?.length ?? 0
}

// ── Pagination ──
const canGoPrev = computed(() => currentPage.value > 0)
const canGoNext = computed(() => currentPage.value < appStore.totalPages - 1)
function prevPage(): void { if (canGoPrev.value) currentPage.value-- }
function nextPage(): void { if (canGoNext.value) currentPage.value++ }

// ── Init ──
onMounted(async () => {
 await jobStore.fetchJob(jobId.value)
 loadKanban()
})
</script>

<template>
 <div class="max-w-[1400px] mx-auto px-6 pb-8">
 <!-- Header -->
 <div class="flex items-center gap-3 mb-2">
 <button @click="router.push(`/employer/jobs/${jobId}`)" class="text-gray-400 hover:text-gray-600 transition text-sm">
 ‹ Back to Job
 </button>
 </div>

 <div class="flex items-start justify-between mb-6">
 <div>
 <h1 class="text-xl font-bold text-gray-900">
 Recruitment Pipeline
 </h1>
 <p v-if="jobStore.currentJob" class="text-sm text-gray-500 mt-1">
 {{ jobStore.currentJob.title }}
 <span class="text-gray-300 mx-1">·</span>
 {{ appStore.totalApplications }} candidates
 </p>
 </div>

 <div class="flex items-center gap-2 shrink-0">
 <!-- AI Screening trigger -->
 <button
 @click="handleTriggerScreening"
 :disabled="appStore.triggerScreeningLoading"
 class="btn-secondary text-teal-700 bg-teal-50 border-teal-200 hover:bg-teal-100"
 >
 <span v-if="appStore.triggerScreeningLoading" class="inline-block w-4 h-4 border-2 border-teal-600/30 border-t-teal-600 rounded-full animate-spin" />
 <template v-else>⚡</template>
 AI Screen
 </button>

 <!-- View screening results -->
 <button
 @click="loadScreeningResults"
 class="btn-outline"
 >
 📊 Results
 </button>

 <!-- View mode toggle -->
 <div class="flex items-center bg-slate-100 rounded-xl p-1">
 <button
 @click="viewMode = 'kanban'"
 class="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all"
 :class="viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 :text-slate-300'"
 >
 Board
 </button>
 <button
 @click="viewMode = 'table'"
 class="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all"
 :class="viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 :text-slate-300'"
 >
 List
 </button>
 </div>
 </div>
 </div>

 <!-- ─── Loading ─── -->
 <div v-if="appStore.loading" class="flex items-center justify-center py-24">
 <div class="text-center">
 <div class="inline-block w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-3" />
 <p class="text-sm text-gray-400">Loading applications...</p>
 </div>
 </div>

 <!-- ─── KANBAN VIEW ─── -->
 <template v-else-if="viewMode === 'kanban'">
 <div class="flex gap-5 overflow-x-auto pb-6" style="min-height: 400px">
 <div
 v-for="col in PIPELINE_COLUMNS"
 :key="col.status"
 class="flex-shrink-0 w-72 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col max-h-[750px] shadow-sm transition-colors duration-150"
 :class="[col.color, dragOverStatus === col.status ? 'bg-teal-50 border-teal-300' : '']"
 style="border-top-width: 4px"
 >
 <!-- Column Header -->
 <div class="px-3 py-3 flex items-center justify-between">
 <div class="flex items-center gap-2">
 <span class="w-2 h-2 rounded-full" :class="col.dotClass" />
 <span class="text-xs font-semibold text-gray-700 uppercase tracking-wider">{{ col.label }}</span>
 </div>
 <span class="px-1.5 py-0.5 text-[10px] font-bold text-gray-500 bg-white rounded-full border border-border min-w-[20px] text-center">
 {{ columnCount(col.status) }}
 </span>
 </div>

 <!-- Drop zone -->
 <div
 class="px-3 pb-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar rounded-b-2xl transition-colors duration-150"
 :class="dragOverStatus === col.status ? 'ring-2 ring-teal-400 ring-inset' : ''"
 @dragover.prevent
 @dragenter.prevent="onDragEnter(col.status)"
 @dragleave="onDragLeave"
 @drop.prevent="onDrop(col.status)"
 >
 <div
 v-for="app in appStore.applicationsByStatus[col.status]"
 :key="app.id"
 draggable="true"
 @dragstart="onDragStart(app)"
 @dragend="onDragEnd"
 @click="goToDetail(app.id)"
 class="premium-card p-4 cursor-grab active:cursor-grabbing group hover:border-teal-400 block select-none transition-opacity duration-150"
 :class="draggingApp?.id === app.id ? 'opacity-40' : 'opacity-100'"
 >
 <div class="flex items-start justify-between mb-3">
 <span class="text-sm font-bold text-slate-900 leading-tight group-hover:text-teal-600 transition-colors flex-1 min-w-0 truncate">
 {{ app.candidateName }}
 </span>
 <!-- Drag handle hint -->
 <svg class="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 shrink-0 ml-2 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
 </svg>
 </div>
 <div class="flex items-center justify-between pt-2 border-t border-slate-100">
 <span class="text-xs font-medium text-slate-400">{{ formatDate(app.createdAt) }}</span>
 <span class="text-teal-600 text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
 Details →
 </span>
 </div>
 </div>

 <!-- Empty column / drop hint -->
 <div
 v-if="columnCount(col.status) === 0"
 class="py-8 text-center rounded-xl border-2 border-dashed transition-colors duration-150"
 :class="dragOverStatus === col.status ? 'border-teal-400 bg-teal-50/50' : 'border-slate-200'"
 >
 <p class="text-[11px] text-gray-400">
 {{ dragOverStatus === col.status ? 'Drop here' : 'No candidates' }}
 </p>
 </div>
 </div>
 </div>
 </div>
 </template>

 <!-- ─── TABLE VIEW ─── -->
 <div v-else>
 <!-- Filters -->
 <div class="flex items-center gap-3 mb-4">
 <select
 v-model="statusFilter"
 @change="currentPage = 0"
 class="px-3 py-2 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 >
 <option v-for="opt in statusFilterOptions" :key="opt.value" :value="opt.value">
 {{ opt.label }}
 </option>
 </select>
 <span class="text-xs text-gray-400 ml-auto">
 {{ appStore.totalApplications }} applications
 </span>
 </div>

 <!-- Table -->
 <div class="premium-card overflow-hidden">
 <table class="w-full">
 <thead>
 <tr class="border-b border-slate-200 bg-slate-50 ">
 <th class="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
 <th class="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-36">Status</th>
 <th class="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Applied Date</th>
 </tr>
 </thead>
 <tbody>
 <tr v-if="appStore.applicationList.length === 0">
 <td colspan="3" class="text-center py-16">
 <div class="text-gray-400 text-sm">
 <p class="font-medium mb-1">No applications found</p>
 <p class="text-xs">Applications will appear here.</p>
 </div>
 </td>
 </tr>
 <tr
 v-for="app in appStore.applicationList"
 :key="app.id"
 @click="goToDetail(app.id)"
 class="border-b border-slate-100 last:border-0 hover:bg-slate-50 :bg-slate-800/50 transition-colors cursor-pointer group"
 >
 <td class="px-5 py-4">
 <span class="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{{ app.candidateName }}</span>
 <span class="block text-xs font-medium text-slate-500 mt-0.5">{{ app.jobTitle }}</span>
 </td>
 <td class="px-5 py-4">
 <span
 class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full"
 :class="statusBadgeConfig[app.status].class"
 >
 {{ statusBadgeConfig[app.status].label }}
 </span>
 </td>
 <td class="px-5 py-4 text-sm font-medium text-slate-500">
 {{ formatDate(app.createdAt) }}
 </td>
 </tr>
 </tbody>
 </table>

 <!-- Pagination -->
 <div v-if="appStore.totalPages > 1" class="flex items-center justify-between px-5 py-4 border-t border-slate-200 bg-slate-50/50 ">
 <span class="text-sm font-medium text-slate-500">
 Page {{ currentPage + 1 }} / {{ appStore.totalPages }}
 </span>
 <div class="flex items-center gap-2">
 <button @click="prevPage" :disabled="!canGoPrev" class="btn-outline px-3 py-1 text-sm">
 ‹ Previous
 </button>
 <button @click="nextPage" :disabled="!canGoNext" class="btn-outline px-3 py-1 text-sm">
 Next ›
 </button>
 </div>
 </div>
 </div>
 </div>

 <!-- ─── STAGE ACTION MODAL ─── -->
 <Teleport to="body">
 <div v-if="showConfirm && pendingMove && stageConfig" class="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="cancelConfirm" />
 <div
 class="relative bg-white rounded-2xl shadow-2xl w-full animate-fade-in overflow-hidden max-h-[92vh] flex flex-col"
 :class="pendingMove.toStatus === 'INTERVIEW' || pendingMove.toStatus === 'OFFER' ? 'max-w-lg' : 'max-w-md'"
 >
 <!-- Stage colour bar -->
 <div
 class="h-1 w-full shrink-0"
 :class="{
 'bg-amber-400': pendingMove.toStatus === 'SCREENING',
 'bg-purple-500': pendingMove.toStatus === 'INTERVIEW',
 'bg-teal-500': pendingMove.toStatus === 'OFFER',
 'bg-red-500': pendingMove.toStatus === 'REJECTED',
 }"
 />

 <!-- Header -->
 <div class="flex items-start gap-4 px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
 <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" :class="stageConfig.iconBg">
 {{ stageConfig.icon }}
 </div>
 <div class="flex-1 min-w-0">
 <h3 class="text-base font-bold text-slate-900">{{ stageConfig.title }}</h3>
 <p class="text-xs text-slate-500 mt-0.5 leading-relaxed">{{ stageConfig.description }}</p>
 </div>
 <button @click="cancelConfirm" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0" aria-label="Close">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
 </button>
 </div>

 <!-- Scrollable body -->
 <div class="px-6 py-5 space-y-4 overflow-y-auto custom-scrollbar">
 <!-- Candidate pill + transition arrow -->
 <div class="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
 <div class="flex-1 min-w-0">
 <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Candidate</p>
 <p class="text-sm font-bold text-slate-900 truncate">{{ pendingMove.app.candidateName }}</p>
 </div>
 <div class="flex items-center gap-2 shrink-0">
 <span class="px-2 py-0.5 text-xs font-bold rounded-md" :class="statusBadgeConfig[pendingMove.fromStatus].class">
 {{ statusBadgeConfig[pendingMove.fromStatus].label }}
 </span>
 <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" />
 </svg>
 <span class="px-2 py-0.5 text-xs font-bold rounded-md" :class="statusBadgeConfig[pendingMove.toStatus].class">
 {{ statusBadgeConfig[pendingMove.toStatus].label }}
 </span>
 </div>
 </div>

 <!-- ── REJECTION: reason dropdown ── -->
 <div v-if="stageConfig.showRejectionReason">
 <label class="block text-sm font-bold text-slate-700 mb-1.5">
 Rejection Reason <span class="text-red-500">*</span>
 </label>
 <select
 v-model="rejectionReason"
 class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all bg-white"
 >
 <option value="" disabled>Select a reason…</option>
 <option v-for="r in REJECTION_REASONS" :key="r" :value="r">{{ r }}</option>
 </select>
 </div>

 <!-- ── INTERVIEW: full scheduling form ── -->
 <template v-if="pendingMove.toStatus === 'INTERVIEW'">
 <div class="space-y-4 pt-1">
 <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Interview Details</p>

 <!-- Title -->
 <div>
 <label class="block text-xs font-bold text-slate-600 mb-1.5">
 Title <span class="text-red-500">*</span>
 </label>
 <input
 v-model="interviewForm.title"
 type="text"
 placeholder="e.g. Technical Interview Round 1"
 class="w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition"
 :class="interviewFormErrors.title ? 'border-red-300 focus:ring-2 focus:ring-red-400/10' : 'border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/10'"
 />
 <p v-if="interviewFormErrors.title" class="text-xs text-red-500 mt-1">{{ interviewFormErrors.title }}</p>
 </div>

 <!-- Date/Time + Duration -->
 <div class="grid grid-cols-2 gap-3">
 <div>
 <label class="block text-xs font-bold text-slate-600 mb-1.5">
 Date & Time <span class="text-red-500">*</span>
 </label>
 <input
 v-model="interviewForm.scheduledAt"
 type="datetime-local"
 :min="new Date().toISOString().slice(0, 16)"
 class="w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition"
 :class="interviewFormErrors.scheduledAt ? 'border-red-300 focus:ring-2 focus:ring-red-400/10' : 'border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/10'"
 />
 <p v-if="interviewFormErrors.scheduledAt" class="text-xs text-red-500 mt-1">{{ interviewFormErrors.scheduledAt }}</p>
 </div>
 <div>
 <label class="block text-xs font-bold text-slate-600 mb-1.5">Duration (min)</label>
 <input
 v-model.number="interviewForm.durationMinutes"
 type="number"
 min="15" max="480" step="15"
 class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/10 transition"
 />
 </div>
 </div>

 <!-- Type + Location -->
 <div class="grid grid-cols-2 gap-3">
 <div>
 <label class="block text-xs font-bold text-slate-600 mb-1.5">Format</label>
 <select
 v-model="interviewForm.interviewType"
 class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/10 transition bg-white"
 >
 <option value="ONLINE">Online</option>
 <option value="ONSITE">Onsite</option>
 <option value="PHONE">Phone</option>
 </select>
 </div>
 <div>
 <label class="block text-xs font-bold text-slate-600 mb-1.5">Location / Link</label>
 <input
 v-model="interviewForm.locationOrLink"
 type="text"
 placeholder="https://meet.google.com/…"
 class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/10 transition"
 />
 </div>
 </div>

 <!-- Interviewers -->
 <div>
 <label class="block text-xs font-bold text-slate-600 mb-1.5">
 Interviewers <span class="text-red-500">*</span>
 </label>
 <div class="flex items-center gap-2">
 <input
 v-model="interviewerIdInput"
 type="text"
 placeholder="Enter interviewer user ID"
 class="flex-1 px-3 py-2.5 text-sm border rounded-xl outline-none transition"
 :class="interviewFormErrors.interviewerIds ? 'border-red-300 focus:ring-2 focus:ring-red-400/10' : 'border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/10'"
 @keydown.enter.prevent="addInterviewerId"
 />
 <button
 type="button"
 @click="addInterviewerId"
 class="px-3 py-2.5 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition text-slate-700 shrink-0"
 >Add</button>
 </div>
 <p v-if="interviewFormErrors.interviewerIds" class="text-xs text-red-500 mt-1">{{ interviewFormErrors.interviewerIds }}</p>
 <div v-if="interviewForm.interviewerIds.length" class="flex flex-wrap gap-2 mt-2">
 <span
 v-for="iId in interviewForm.interviewerIds"
 :key="iId"
 class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 rounded-full border border-purple-100"
 >
 {{ iId.slice(0, 8) }}…
 <button type="button" @click="removeInterviewerId(iId)" class="text-purple-400 hover:text-red-500 transition">✕</button>
 </span>
 </div>
 </div>
 </div>
 </template>

 <!-- ── OFFER: interview gate + offer form ── -->
 <template v-if="pendingMove.toStatus === 'OFFER'">
 <!-- Loading interviews check -->
 <div v-if="interviewsForOfferLoading" class="flex items-center gap-2 py-3 text-sm text-slate-500">
 <span class="inline-block w-4 h-4 border-2 border-slate-300 border-t-teal-500 rounded-full animate-spin shrink-0" />
 Checking interview history…
 </div>

 <!-- No completed interview warning -->
 <div
 v-else-if="!hasCompletedInterview"
 class="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50"
 >
 <span class="text-amber-500 shrink-0 mt-0.5">⚠</span>
 <div>
 <p class="text-sm font-semibold text-amber-800">No completed interviews</p>
 <p class="text-xs text-amber-700 mt-0.5">
 At least one interview must be marked <strong>Completed</strong> before creating an offer.
 Schedule and complete an interview first, then try again.
 </p>
 <p v-if="interviewsForOffer.length > 0" class="text-xs text-amber-600 mt-1.5">
 {{ interviewsForOffer.length }} interview(s) scheduled but none completed yet.
 </p>
 </div>
 </div>

 <!-- Offer form (only shown when interviews are OK) -->
 <div v-else class="space-y-4 pt-1">
 <!-- Interviews summary -->
 <div class="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
 <span class="text-green-600 text-sm">✓</span>
 <span class="text-xs font-semibold text-green-700">
 {{ interviewsForOffer.filter(i => i.status === 'COMPLETED').length }} completed interview(s) found
 </span>
 </div>

 <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Offer Details</p>

 <!-- Salary + Currency -->
 <div class="grid grid-cols-2 gap-3">
 <div>
 <label class="block text-xs font-bold text-slate-600 mb-1.5">
 Base Salary <span class="text-red-500">*</span>
 </label>
 <input
 v-model.number="offerForm.baseSalary"
 type="number"
 min="0"
 step="100000"
 placeholder="e.g. 20000000"
 class="w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition"
 :class="offerFormErrors.baseSalary ? 'border-red-300 focus:ring-2 focus:ring-red-400/10' : 'border-slate-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/10'"
 />
 <p v-if="offerFormErrors.baseSalary" class="text-xs text-red-500 mt-1">{{ offerFormErrors.baseSalary }}</p>
 </div>
 <div>
 <label class="block text-xs font-bold text-slate-600 mb-1.5">Currency</label>
 <select
 v-model="offerForm.currency"
 class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/10 transition bg-white"
 >
 <option value="VND">VND</option>
 <option value="USD">USD</option>
 <option value="EUR">EUR</option>
 </select>
 </div>
 </div>

 <!-- Start Date -->
 <div>
 <label class="block text-xs font-bold text-slate-600 mb-1.5">Start Date</label>
 <input
 v-model="offerForm.startDate"
 type="date"
 class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/10 transition"
 />
 </div>

 <!-- Offer Letter URL -->
 <div>
 <label class="block text-xs font-bold text-slate-600 mb-1.5">Offer Letter URL (PDF)</label>
 <input
 v-model="offerForm.offerLetterUrl"
 type="url"
 placeholder="https://drive.google.com/…"
 class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/10 transition"
 />
 </div>
 </div>
 </template>

 <!-- Notes (all stages) -->
 <div>
 <label class="block text-sm font-bold text-slate-700 mb-1.5">
 {{ stageConfig.noteLabel }}
 <span class="text-xs font-normal text-slate-400 ml-1">optional</span>
 </label>
 <textarea
 v-model="confirmNotes"
 rows="2"
 :placeholder="stageConfig.notePlaceholder"
 class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 resize-none transition-all"
 />
 </div>
 </div>

 <!-- Actions -->
 <div class="flex gap-3 px-6 pb-6 shrink-0 border-t border-slate-100 pt-4">
 <button
 @click="cancelConfirm"
 class="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
 >
 Cancel
 </button>
 <button
 @click="confirmMove"
 :disabled="
 appStore.statusLoading ||
 interviewStore.createLoading ||
 offerStore.createLoading ||
 (stageConfig.showRejectionReason && !rejectionReason) ||
 (pendingMove.toStatus === 'OFFER' && (interviewsForOfferLoading || !hasCompletedInterview))
 "
 class="flex-1 px-4 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2"
 :class="stageConfig.confirmClass"
 >
 <span
 v-if="appStore.statusLoading || interviewStore.createLoading || offerStore.createLoading"
 class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
 />
 <template v-else>{{ stageConfig.confirmLabel }}</template>
 </button>
 </div>
 </div>
 </div>
 </Teleport>

 <!-- ─── SCREENING RESULTS PANEL ─── -->
 <Teleport to="body">
 <div v-if="showScreening" class="fixed inset-0 z-50 flex items-start justify-end">
 <div class="absolute inset-0 bg-black/30" @click="showScreening = false" />
 <div class="relative bg-surface h-full w-full max-w-2xl shadow-2xl border-l border-border overflow-y-auto animate-slide-right">
 <!-- Header -->
 <div class="sticky top-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-10">
 <div>
 <h2 class="text-lg font-bold text-gray-900">AI Analysis Results</h2>
 <p class="text-xs text-gray-400 mt-0.5">
 {{ appStore.screeningResults.length }} candidates scored
 </p>
 </div>
 <div class="flex items-center gap-2">
 <button
 @click="handleTriggerScreening"
 :disabled="appStore.triggerScreeningLoading"
 class="px-3 py-1.5 text-xs font-medium text-primary bg-primary-bg border border-primary/10 rounded-md hover:bg-primary-light transition disabled:opacity-50 flex items-center gap-1.5"
 >
 <span v-if="appStore.triggerScreeningLoading" class="inline-block w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
 Re-score
 </button>
 <button @click="showScreening = false" class="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
 ✕
 </button>
 </div>
 </div>

 <!-- Loading -->
 <div v-if="appStore.screeningLoading" class="flex items-center justify-center py-24">
 <div class="inline-block w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
 </div>

 <!-- Empty -->
 <div v-else-if="appStore.screeningResults.length === 0" class="text-center py-24 px-6">
 <p class="text-sm text-gray-400 mb-2">No analysis results yet.</p>
 <p class="text-xs text-gray-400">Click "AI Screen" to evaluate candidate fit.</p>
 </div>

 <!-- Results -->
 <div v-else class="px-6 py-6 space-y-4">
 <div
 v-for="sr in appStore.screeningResults"
 :key="sr.applicationId"
 @click="goToDetail(sr.applicationId); showScreening = false"
 class="premium-card p-5 cursor-pointer block hover:border-teal-400"
 >
 <!-- Candidate info + score -->
 <div class="flex items-start justify-between mb-3">
 <div>
 <span class="text-sm font-semibold text-gray-900 group-hover:text-primary transition">
 {{ sr.candidateName }}
 </span>
 <span class="block text-xs text-gray-400 mt-0.5">{{ sr.candidateEmail }}</span>
 </div>
 <div class="text-right">
 <span
 class="text-2xl font-bold tabular-nums"
 :class="getScoreColor(sr.aiScore)"
 >
 {{ sr.aiScore !== null ? sr.aiScore : '—' }}
 </span>
 <span class="block text-[10px] text-gray-400 mt-0.5">AI Score</span>
 </div>
 </div>

 <!-- Score bar -->
 <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
 <div
 class="h-full rounded-full transition-all duration-500"
 :class="getScoreBarColor(sr.aiScore)"
 :style="{ width: getScoreBarWidth(sr.aiScore) }"
 />
 </div>

 <!-- Similarity score if available -->
 <div v-if="sr.similarityScore !== null" class="flex items-center gap-2 mb-2 text-xs text-gray-500">
 <span>Similarity:</span>
 <span class="font-medium" :class="getScoreColor(sr.similarityScore)">
 {{ sr.similarityScore }}%
 </span>
 </div>

 <!-- Score breakdown -->
 <div v-if="sr.scoreBreakdown" class="grid grid-cols-3 gap-2 mb-3">
 <div
 v-for="(score, key) in sr.scoreBreakdown"
 :key="key"
 class="text-center bg-gray-50 rounded-md py-1.5"
 >
 <span class="block text-xs font-semibold text-gray-700">{{ score }}</span>
 <span class="block text-[10px] text-gray-400 capitalize">{{ key }}</span>
 </div>
 </div>

 <!-- Strengths & Gaps (collapsed preview) -->
 <div class="grid grid-cols-2 gap-3">
 <div v-if="sr.strengths?.length">
 <span class="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Strengths</span>
 <ul class="space-y-0.5">
 <li v-for="(s, i) in (sr.strengths ?? []).slice(0, 2)" :key="i" class="text-[11px] text-gray-600 flex items-start gap-1">
 <span class="text-green-500 mt-px shrink-0">✓</span>
 <span class="line-clamp-1">{{ s }}</span>
 </li>
 <li v-if="(sr.strengths?.length ?? 0) > 2" class="text-[10px] text-gray-400">
 +{{ (sr.strengths?.length ?? 0) - 2 }} more
 </li>
 </ul>
 </div>
 <div v-if="sr.gaps?.length">
 <span class="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Gaps</span>
 <ul class="space-y-0.5">
 <li v-for="(g, i) in (sr.gaps ?? []).slice(0, 2)" :key="i" class="text-[11px] text-gray-600 flex items-start gap-1">
 <span class="text-red-400 mt-px shrink-0">✗</span>
 <span class="line-clamp-1">{{ g }}</span>
 </li>
 <li v-if="(sr.gaps?.length ?? 0) > 2" class="text-[10px] text-gray-400">
 +{{ (sr.gaps?.length ?? 0) - 2 }} more
 </li>
 </ul>
 </div>
 </div>

 <!-- Summary -->
 <p v-if="sr.summary" class="mt-2 text-[11px] text-gray-500 line-clamp-2 italic">
 {{ sr.summary }}
 </p>
 </div>
 </div>
 </div>
 </div>
 </Teleport>
 </div>
</template>


