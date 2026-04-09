<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { applicationService } from '@/services/applicationService'
import { interviewService } from '@/services/interviewService'
import { useOfferStore } from '@/stores/offerStore'
import type { ApplicationResponse, ApplicationStatusHistoryResponse, InterviewResponse } from '@/types/application'
import type { ApplicationStatus, InterviewStatus, OfferStatus } from '@/types/enums'

const route = useRoute()
const router = useRouter()
const offerStore = useOfferStore()

const applicationId = computed(() => route.params.id as string)

// ── Local state ──
const application = ref<ApplicationResponse | null>(null)
const statusHistory = ref<ApplicationStatusHistoryResponse[]>([])
const interviews = ref<InterviewResponse[]>([])
const loading = ref(true)
const interviewsLoading = ref(false)

// ── Status config ──
const statusConfig: Record<ApplicationStatus, { label: string; class: string; dotClass: string }> = {
 NEW: { label: 'Applied', class: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-400' },
 SCREENING: { label: 'Screening', class: 'bg-amber-50 text-amber-600', dotClass: 'bg-amber-400' },
 INTERVIEW: { label: 'Interview', class: 'bg-purple-50 text-purple-600', dotClass: 'bg-purple-500' },
 OFFER: { label: 'Offer', class: 'bg-primary-bg text-primary', dotClass: 'bg-primary' },
 HIRED: { label: 'Hired', class: 'bg-success-bg text-success', dotClass: 'bg-green-500' },
 REJECTED: { label: 'Rejected', class: 'bg-error-bg text-error', dotClass: 'bg-red-400' },
}

const OFFER_STATUS_CONFIG: Record<OfferStatus, { label: string; class: string; dotClass: string }> = {
 DRAFT: { label: 'Draft', class: 'bg-gray-100 text-gray-600', dotClass: 'bg-gray-400' },
 SENT: { label: 'Awaiting Response', class: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-400' },
 ACCEPTED: { label: 'Accepted', class: 'bg-success-bg text-success', dotClass: 'bg-green-500' },
 DECLINED: { label: 'Declined', class: 'bg-error-bg text-error', dotClass: 'bg-red-400' },
}

const INTERVIEW_STATUS_CONFIG: Record<InterviewStatus, { label: string; class: string; dotClass: string }> = {
 SCHEDULED: { label: 'Scheduled', class: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-400' },
 COMPLETED: { label: 'Completed', class: 'bg-success-bg text-success', dotClass: 'bg-green-500' },
 CANCELED: { label: 'Cancelled', class: 'bg-gray-100 text-gray-500', dotClass: 'bg-gray-400' },
}

/** Whether candidate can see interviews (application has reached INTERVIEW stage or later) */
const showInterviewSection = computed(() => {
 if (!application.value) return false
 const idx = STAGE_ORDER.indexOf(application.value.status)
 const interviewIdx = STAGE_ORDER.indexOf('INTERVIEW')
 return idx >= interviewIdx || application.value.status === 'REJECTED' && interviews.value.length > 0
})

const scheduledInterviews = computed(() =>
 interviews.value.filter((i) => i.status === 'SCHEDULED'),
)
const completedInterviews = computed(() =>
 interviews.value.filter((i) => i.status === 'COMPLETED'),
)

// ── Pipeline steps ──
const PIPELINE_STEPS: { status: ApplicationStatus; label: string }[] = [
 { status: 'NEW', label: 'Applied' },
 { status: 'SCREENING', label: 'Screening' },
 { status: 'INTERVIEW', label: 'Interview' },
 { status: 'OFFER', label: 'Offer' },
 { status: 'HIRED', label: 'Hired' },
]

const STAGE_ORDER: ApplicationStatus[] = ['NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED']

function getStepState(stepStatus: ApplicationStatus): 'completed' | 'current' | 'upcoming' | 'rejected' {
 const app = application.value
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

const stageBeforeRejection = computed(() => {
 if (application.value?.status !== 'REJECTED') return -1
 for (let i = statusHistory.value.length - 1; i >= 0; i--) {
 const entry = statusHistory.value[i]
 if (entry && entry.newStatus === 'REJECTED' && entry.oldStatus) {
 return STAGE_ORDER.indexOf(entry.oldStatus as ApplicationStatus)
 }
 }
 return 0
})

// ── Offer response modals ──
const showRespondModal = ref(false)
const respondAction = ref<'ACCEPT' | 'DECLINE'>('ACCEPT')

function openRespond(action: 'ACCEPT' | 'DECLINE'): void {
 respondAction.value = action
 showRespondModal.value = true
}

async function confirmRespond(): Promise<void> {
 const sentOffer = offerStore.offers.find((o) => o.status === 'SENT')
 if (!sentOffer) return

 const success = await offerStore.respondToOffer(sentOffer.id, respondAction.value)
 if (success) {
 showRespondModal.value = false
 // Refresh application status (accept → HIRED, decline → REJECTED)
 await loadApplication()
 }
}

/** Pending offer that the candidate can respond to */
const pendingOffer = computed(() =>
 offerStore.offers.find((o) => o.status === 'SENT'),
)

/** The latest offer regardless of status */
const latestOffer = computed(() =>
 offerStore.offers.length > 0 ? offerStore.offers[0] : null,
)

/** Whether offer section should be shown */
const showOfferSection = computed(() =>
 application.value?.status === 'OFFER' ||
 application.value?.status === 'HIRED' ||
 offerStore.offers.length > 0,
)

// ── Helpers ──
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', {
 month: 'short', day: 'numeric', year: 'numeric',
 })
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN', {
 month: 'short', day: 'numeric', year: 'numeric',
 hour: '2-digit', minute: '2-digit',
 })
}

function formatSalary(amount: number | null | undefined, currency: string | null): string {
  if (amount == null) return '—'
 const cur = currency ?? 'VND'
 try {
 return new Intl.NumberFormat('en-US', {
 style: 'currency',
 currency: cur,
 maximumFractionDigits: 0,
 }).format(amount)
 } catch {
 return `${amount.toLocaleString()} ${cur}`
 }
}

// ── Load ──
async function loadApplication(): Promise<void> {
 const result = await applicationService.getApplication(applicationId.value)
 if (result.data) {
 application.value = result.data
 }
}

onMounted(async () => {
 try {
 const [appResult, historyResult] = await Promise.all([
 applicationService.getApplication(applicationId.value),
 applicationService.getStatusHistory(applicationId.value),
 ])
 if (appResult.data) application.value = appResult.data
 if (historyResult.data) statusHistory.value = historyResult.data

 // Fetch offers for this application
 await offerStore.fetchOffers(applicationId.value)

 // Attempt to fetch interviews (candidate may have access to their own)
 interviewsLoading.value = true
 try {
 const intResult = await interviewService.listInterviews(applicationId.value)
 if (intResult.data) interviews.value = intResult.data
 } catch {
 // Silently ignore if candidate doesn't have access
 interviews.value = []
 } finally {
 interviewsLoading.value = false
 }
 } finally {
 loading.value = false
 }
})

onBeforeUnmount(() => {
 offerStore.clearCurrent()
})
</script>

<template>
 <div class="max-w-3xl mx-auto px-6 py-8">
 <!-- Back -->
 <div class="flex items-center gap-3 mb-6">
 <button @click="router.push('/candidate/applications')" class="text-gray-400 hover:text-gray-600 transition text-sm">
 ‹ My Applications
 </button>
 </div>

 <!-- Loading -->
 <div v-if="loading" class="space-y-4">
 <div class="bg-surface border border-border rounded-lg p-6 shadow-sm animate-pulse space-y-4">
 <div class="h-6 bg-gray-100 rounded w-64" />
 <div class="h-4 bg-gray-100 rounded w-32" />
 <div class="h-20 bg-gray-100 rounded w-full" />
 </div>
 </div>

 <div v-else-if="application" class="space-y-5">
 <!-- ─── Header Card ─── -->
 <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
 <div class="flex items-start justify-between mb-5">
 <div>
 <h1 class="text-xl font-bold text-gray-900 mb-1">
 {{ application.jobTitle }}
 </h1>
 <div class="flex items-center gap-3 flex-wrap">
 <span
 class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
 :class="statusConfig[application.status].class"
 >
 <span class="w-1.5 h-1.5 rounded-full" :class="statusConfig[application.status].dotClass" />
 {{ statusConfig[application.status].label }}
 </span>
 <span class="text-xs text-gray-400">
 Applied {{ formatDateTime(application.createdAt) }}
 </span>
 </div>
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
 <div
 v-if="application.status === 'REJECTED'"
 class="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-error-bg text-error text-xs"
 >
 <span class="font-medium">Rejected</span>
 <span class="text-red-400">— Your application has been rejected.</span>
 </div>
 </div>
 </div>

 <!-- ─── Offer Section (F-11.4: Candidate Offer Response UI) ─── -->
 <div v-if="showOfferSection" class="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
 <div class="px-6 py-4 border-b border-border flex items-center justify-between">
 <h2 class="text-sm font-semibold text-gray-900">Offer Details</h2>
 <span
 v-if="latestOffer"
 class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
 :class="OFFER_STATUS_CONFIG[latestOffer.status].class"
 >
 <span class="w-1.5 h-1.5 rounded-full" :class="OFFER_STATUS_CONFIG[latestOffer.status].dotClass" />
 {{ OFFER_STATUS_CONFIG[latestOffer.status].label }}
 </span>
 </div>

 <!-- Loading offers -->
 <div v-if="offerStore.listLoading" class="p-6 animate-pulse space-y-3">
 <div class="h-4 bg-gray-100 rounded w-48" />
 <div class="h-4 bg-gray-100 rounded w-32" />
 </div>

 <!-- No offers yet (status is OFFER but no offer created by employer) -->
 <div v-else-if="offerStore.offers.length === 0" class="p-6 text-center">
 <p class="text-sm text-gray-500">Salary and position details are being prepared. You will be notified soon.</p>
 </div>

 <!-- Offer exists -->
 <template v-else-if="latestOffer">
 <!-- Pending offer → Action buttons -->
 <div v-if="pendingOffer" class="px-6 py-5 border-b border-border bg-primary-bg/30">
 <div class="flex items-center gap-3 mb-4">
 <div class="w-10 h-10 rounded-full bg-primary-bg text-primary flex items-center justify-center text-lg shrink-0">
 📋
 </div>
 <div>
 <p class="text-sm font-semibold text-gray-900">You have received a job offer!</p>
 <p class="text-xs text-gray-500">Please review the details carefully and respond.</p>
 </div>
 </div>
 <div class="flex items-center gap-3">
 <button
 @click="openRespond('ACCEPT')"
 :disabled="offerStore.respondLoading"
 class="px-5 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition disabled:opacity-50 flex items-center gap-2"
 >
 ✓ Accept
 </button>
 <button
 @click="openRespond('DECLINE')"
 :disabled="offerStore.respondLoading"
 class="px-5 py-2.5 text-sm font-medium text-error bg-error-bg hover:bg-red-100 rounded-md transition disabled:opacity-50 flex items-center gap-2"
 >
 ✕ Decline
 </button>
 </div>
 </div>

 <!-- Accepted banner -->
 <div v-if="latestOffer.status === 'ACCEPTED'" class="px-6 py-4 bg-success-bg/40 border-b border-green-200">
 <div class="flex items-center gap-3">
 <div class="w-10 h-10 rounded-full bg-success-bg text-success flex items-center justify-center text-lg shrink-0">
 ✓
 </div>
 <div>
 <p class="text-sm font-semibold text-green-800">Congratulations! You have accepted this offer.</p>
 <p class="text-xs text-green-600">Welcome aboard! Start date information is shown below.</p>
 </div>
 </div>
 </div>

 <!-- Declined banner -->
 <div v-if="latestOffer.status === 'DECLINED'" class="px-6 py-4 bg-error-bg/40 border-b border-red-200">
 <div class="flex items-center gap-3">
 <div class="w-10 h-10 rounded-full bg-error-bg text-error flex items-center justify-center text-lg shrink-0">
 ✕
 </div>
 <div>
 <p class="text-sm font-semibold text-red-800">You have declined this offer.</p>
 <p class="text-xs text-red-600">The employer has been notified of your decision.</p>
 </div>
 </div>
 </div>

 <!-- Offer content -->
 <div class="px-6 py-5">
 <div class="grid grid-cols-2 gap-x-8 gap-y-4">
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Base Salary</span>
 <span class="text-lg font-bold text-gray-900">
 {{ formatSalary(latestOffer.baseSalary, latestOffer.currency) }}
 </span>
 </div>
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Currency</span>
 <span class="text-sm font-medium text-gray-900">{{ latestOffer.currency ?? 'VND' }}</span>
 </div>
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Start Date</span>
 <span class="text-sm text-gray-700">{{ latestOffer.startDate ? formatDate(latestOffer.startDate) : '—' }}</span>
 </div>
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Offer Sent Date</span>
 <span class="text-sm text-gray-700">{{ formatDate(latestOffer.createdAt) }}</span>
 </div>
 </div>

 <!-- Offer letter link -->
 <div v-if="latestOffer.offerLetterUrl" class="mt-4 pt-4 border-t border-border">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Offer Letter</span>
 <a
 :href="latestOffer.offerLetterUrl"
 target="_blank"
 rel="noopener"
 class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary bg-primary-bg border border-primary/10 rounded-md hover:bg-primary-light transition"
 >
 📄 View Offer Letter
 <span class="text-xs text-gray-400">↗</span>
 </a>
 </div>

 <!-- Notes -->
 <div v-if="latestOffer.note" class="mt-4 pt-4 border-t border-border">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Notes from Employer</span>
 <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-border">
 {{ latestOffer.note }}
 </div>
 </div>
 </div>
 </template>
 </div>

 <!-- ─── Interview Details (F-12.2) ─── -->
 <div v-if="showInterviewSection" class="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
 <div class="px-6 py-4 border-b border-border flex items-center justify-between">
 <h2 class="text-sm font-semibold text-gray-900">Interviews</h2>
 <span v-if="interviews.length > 0" class="text-xs text-gray-400">
 {{ interviews.length }} interview{{ interviews.length !== 1 ? 's' : '' }}
 </span>
 </div>

 <!-- Loading -->
 <div v-if="interviewsLoading" class="p-6 animate-pulse space-y-3">
 <div class="h-4 bg-gray-100 rounded w-48" />
 <div class="h-4 bg-gray-100 rounded w-32" />
 </div>

 <!-- No interviews -->
 <div v-else-if="interviews.length === 0" class="p-6 text-center">
 <p class="text-sm text-gray-400">No interviews scheduled yet.</p>
 </div>

 <!-- Interview cards -->
 <div v-else class="divide-y divide-border">
 <div
 v-for="interview in interviews"
 :key="interview.id"
 class="px-6 py-4"
 >
 <div class="flex items-start justify-between mb-3">
 <div class="flex-1 min-w-0">
 <h3 class="text-sm font-semibold text-gray-900">{{ interview.title }}</h3>
 <div class="flex items-center gap-3 mt-1 flex-wrap">
 <span
 class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full"
 :class="INTERVIEW_STATUS_CONFIG[interview.status].class"
 >
 <span class="w-1.5 h-1.5 rounded-full" :class="INTERVIEW_STATUS_CONFIG[interview.status].dotClass" />
 {{ INTERVIEW_STATUS_CONFIG[interview.status].label }}
 </span>
 <span v-if="interview.interviewType" class="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
 {{ interview.interviewType }}
 </span>
 </div>
 </div>
 </div>

 <div class="grid grid-cols-2 gap-4">
 <!-- Date/Time -->
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Scheduled At</span>
 <span class="text-sm text-gray-700">{{ formatDateTime(interview.scheduledAt) }}</span>
 </div>
 <!-- Duration -->
 <div v-if="interview.durationMinutes">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Duration</span>
 <span class="text-sm text-gray-700">{{ interview.durationMinutes }} min</span>
 </div>
 <!-- Location -->
 <div v-if="interview.locationOrLink" class="col-span-2">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Location / Link</span>
 <a
 v-if="interview.locationOrLink.startsWith('http')"
 :href="interview.locationOrLink"
 target="_blank"
 rel="noopener"
 class="text-sm text-primary hover:text-primary-hover transition"
 >
 {{ interview.locationOrLink }} ↗
 </a>
 <span v-else class="text-sm text-gray-700">{{ interview.locationOrLink }}</span>
 </div>
 </div>

 <!-- Interviewers -->
 <div v-if="interview.interviewers && interview.interviewers.length > 0" class="mt-3 pt-3 border-t border-border">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Interviewers</span>
 <div class="flex items-center gap-2 flex-wrap">
 <div
 v-for="interviewer in interview.interviewers"
 :key="interviewer.id"
 class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-border rounded-full"
 >
 <div class="w-5 h-5 rounded-full bg-primary-bg text-primary flex items-center justify-center text-[9px] font-bold">
 {{ interviewer.fullName?.charAt(0)?.toUpperCase() ?? '?' }}
 </div>
 <span class="text-xs text-gray-700">{{ interviewer.fullName }}</span>
 </div>
 </div>
 </div>
 </div>
 </div>

 <!-- Summary bar for multiple interviews -->
 <div v-if="interviews.length > 1" class="px-6 py-3 bg-gray-50/50 border-t border-border flex items-center gap-4">
 <div v-if="scheduledInterviews.length > 0" class="flex items-center gap-1.5">
 <span class="w-2 h-2 rounded-full bg-blue-400" />
 <span class="text-[10px] text-gray-500">{{ scheduledInterviews.length }} upcoming</span>
 </div>
 <div v-if="completedInterviews.length > 0" class="flex items-center gap-1.5">
 <span class="w-2 h-2 rounded-full bg-green-500" />
 <span class="text-[10px] text-gray-500">{{ completedInterviews.length }} completed</span>
 </div>
 </div>
 </div>

 <!-- ─── Application Info ─── -->
 <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
 <h2 class="text-sm font-semibold text-gray-900 mb-4">Application Information</h2>
 <div class="grid grid-cols-2 gap-4">
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Position</span>
 <router-link
 :to="`/jobs/${application.jobId}`"
 class="text-sm font-medium text-primary hover:text-primary-hover transition"
 >
 {{ application.jobTitle }}
 </router-link>
 </div>
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Applied Date</span>
 <span class="text-sm text-gray-700">{{ formatDateTime(application.createdAt) }}</span>
 </div>
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Last Updated</span>
 <span class="text-sm text-gray-700">{{ formatDateTime(application.updatedAt) }}</span>
 </div>
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Status</span>
 <span
 class="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full"
 :class="statusConfig[application.status].class"
 >
 {{ statusConfig[application.status].label }}
 </span>
 </div>
 </div>

 <!-- Cover Letter -->
 <div v-if="application.coverLetter" class="mt-5 pt-5 border-t border-border">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Cover Letter</span>
 <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-border">
 {{ application.coverLetter }}
 </div>
 </div>

 <!-- CV Link -->
 <div v-if="application.appliedCvUrl" class="mt-5 pt-5 border-t border-border">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Submitted CV</span>
 <a
 :href="application.appliedCvUrl"
 target="_blank"
 rel="noopener"
 class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary bg-primary-bg border border-primary/10 rounded-md hover:bg-primary-light transition"
 >
 📄 View CV
 <span class="text-xs text-gray-400">↗</span>
 </a>
 </div>
 </div>

 <!-- ─── Status History ─── -->
 <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
 <h2 class="text-sm font-semibold text-gray-900 mb-4">Status History</h2>

 <div v-if="statusHistory.length === 0" class="text-sm text-gray-400 text-center py-8">
 No status changes yet.
 </div>

 <div v-else class="relative">
 <div class="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
 <div
 v-for="(h, idx) in statusHistory"
 :key="h.id"
 class="relative flex gap-4 pb-5 last:pb-0"
 >
 <div
 class="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 z-10"
 :class="{
 'bg-primary border-primary': idx === 0,
 'bg-white border-gray-300': idx > 0,
 }"
 />
 <div class="flex-1 min-w-0">
 <div class="flex items-center gap-2 flex-wrap">
 <span
 v-if="h.oldStatus"
 class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full"
 :class="statusConfig[h.oldStatus].class"
 >
 {{ statusConfig[h.oldStatus].label }}
 </span>
 <span v-if="h.oldStatus" class="text-gray-300 text-xs">→</span>
 <span
 class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full"
 :class="statusConfig[h.newStatus].class"
 >
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
 <div v-else-if="!loading" class="bg-surface border border-border rounded-lg p-12 shadow-sm text-center">
 <p class="text-gray-400 text-sm">Application not found or you do not have permission to view it.</p>
 <button @click="router.push('/candidate/applications')" class="mt-3 text-primary hover:text-primary-hover text-sm font-medium transition">
 ← Back
 </button>
 </div>

 <!-- ─── Offer Response Confirmation Modal ─── -->
 <Teleport to="body">
 <div v-if="showRespondModal" class="fixed inset-0 z-50 flex items-center justify-center">
 <div class="absolute inset-0 bg-black/40" @click="showRespondModal = false" />
 <div class="relative bg-surface rounded-lg shadow-xl border border-border w-full max-w-md p-6 animate-slide-up">
 <div class="text-center mb-5">
 <div
 class="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
 :class="respondAction === 'ACCEPT' ? 'bg-success-bg text-success' : 'bg-error-bg text-error'"
 >
 {{ respondAction === 'ACCEPT' ? '✓' : '✕' }}
 </div>
 <h2 class="text-lg font-bold text-gray-900 mb-2">
 {{ respondAction === 'ACCEPT' ? 'Accept This Offer?' : 'Decline This Offer?' }}
 </h2>
 <p class="text-sm text-gray-500">
 <template v-if="respondAction === 'ACCEPT'">
 By accepting, you confirm your intent to join. Your application will move to <strong>Hired</strong> status.
 </template>
 <template v-else>
 By declining, you will cancel this offer. This action cannot be undone.
 </template>
 </p>

 <!-- Show salary summary -->
 <div v-if="pendingOffer" class="mt-4 p-3 bg-gray-50 rounded-lg border border-border text-left">
 <div class="flex items-center justify-between text-sm">
 <span class="text-gray-500">Salary:</span>
 <span class="font-bold text-gray-900">{{ formatSalary(pendingOffer.baseSalary, pendingOffer.currency) }}</span>
 </div>
 <div v-if="pendingOffer.startDate" class="flex items-center justify-between text-sm mt-1">
 <span class="text-gray-500">Start Date:</span>
 <span class="font-medium text-gray-700">{{ formatDate(pendingOffer.startDate) }}</span>
 </div>
 </div>
 </div>

 <div class="flex justify-center gap-2">
 <button
 @click="showRespondModal = false"
 class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
 >
 Cancel
 </button>
 <button
 @click="confirmRespond"
 :disabled="offerStore.respondLoading"
 class="px-5 py-2.5 text-sm font-medium text-white rounded-md transition disabled:opacity-50 flex items-center gap-2"
 :class="respondAction === 'ACCEPT' ? 'bg-green-600 hover:bg-green-700' : 'bg-error hover:bg-red-700'"
 >
 <span v-if="offerStore.respondLoading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ offerStore.respondLoading
 ? 'Processing…'
 : respondAction === 'ACCEPT' ? 'Accept' : 'Decline'
 }}
 </button>
 </div>
 </div>
 </div>
 </Teleport>
 </div>
</template>
