<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useOfferStore } from '@/stores/offerStore'
import { useApplicationStore } from '@/stores/applicationStore'
import { useInterviewStore } from '@/stores/interviewStore'
import { useAuthStore } from '@/stores/authStore'
import type { OfferStatus } from '@/types/enums'
import type { OfferCreateRequest } from '@/types/application'

const route = useRoute()
// useRouter not needed — navigation uses <router-link> in template
const offerStore = useOfferStore()
const appStore = useApplicationStore()
const interviewStore = useInterviewStore()
const auth = useAuthStore()

/** BE requires at least one COMPLETED interview before an offer can be created */
const hasCompletedInterview = computed(() =>
  interviewStore.interviews.some((i) => i.status === 'COMPLETED'),
)

/** The route param `:id` is the applicationId */
const applicationId = computed(() => route.params.id as string)

// ── Offer lifecycle steps ──
const LIFECYCLE_STEPS: { status: OfferStatus; label: string; icon: string }[] = [
 { status: 'DRAFT', label: 'Draft', icon: '📝' },
 { status: 'SENT', label: 'Sent', icon: '📨' },
 { status: 'ACCEPTED', label: 'Accepted', icon: '✓' },
]

const STATUS_CONFIG: Record<OfferStatus, { label: string; class: string; dotClass: string }> = {
 DRAFT: { label: 'Draft', class: 'bg-gray-100 text-gray-600', dotClass: 'bg-gray-400' },
 SENT: { label: 'Sent', class: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-400' },
 ACCEPTED: { label: 'Accepted', class: 'bg-success-bg text-success', dotClass: 'bg-green-500' },
 DECLINED: { label: 'Declined', class: 'bg-error-bg text-error', dotClass: 'bg-red-400' },
}

function getStepState(stepStatus: OfferStatus, offer: { status: OfferStatus }): 'completed' | 'current' | 'upcoming' | 'declined' {
 const ORDER: OfferStatus[] = ['DRAFT', 'SENT', 'ACCEPTED']
 if (offer.status === 'DECLINED') {
 const stepIdx = ORDER.indexOf(stepStatus)
 if (stepIdx <= 1) return 'completed' // DRAFT and SENT are done
 return 'declined'
 }
 const offerIdx = ORDER.indexOf(offer.status)
 const stepIdx = ORDER.indexOf(stepStatus)
 if (stepIdx < offerIdx) return 'completed'
 if (stepIdx === offerIdx) return 'current'
 return 'upcoming'
}

// ── Create offer form state ──
const showCreateForm = ref(false)
const formData = ref<{
 baseSalary: number | null
 currency: string
 startDate: string
 note: string
 offerLetterUrl: string
}>({
 baseSalary: null,
 currency: 'VND',
 startDate: '',
 note: '',
 offerLetterUrl: '',
})
const formErrors = ref<Record<string, string>>({})

function resetForm(): void {
 formData.value = {
 baseSalary: null,
 currency: 'VND',
 startDate: '',
 note: '',
 offerLetterUrl: '',
 }
 formErrors.value = {}
}

function validateForm(): boolean {
 const errors: Record<string, string> = {}
 if (!formData.value.baseSalary || formData.value.baseSalary <= 0) {
 errors.baseSalary = 'Base salary must be defined and be a positive number greater than 0.'
 }
 formErrors.value = errors
 return Object.keys(errors).length === 0
}

async function handleCreateOffer(): Promise<void> {
 if (!validateForm()) return

 const body: OfferCreateRequest = {
 baseSalary: formData.value.baseSalary!,
 currency: formData.value.currency || undefined,
 startDate: formData.value.startDate || undefined,
 note: formData.value.note || undefined,
 offerLetterUrl: formData.value.offerLetterUrl || undefined,
 }

 const result = await offerStore.createOffer(applicationId.value, body)
 if (result) {
 showCreateForm.value = false
 resetForm()
 }
}

// ── Send offer modal ──
const showSendConfirm = ref(false)
const sendTargetId = ref<string | null>(null)

function openSendConfirm(offerId: string): void {
 sendTargetId.value = offerId
 showSendConfirm.value = true
}

async function confirmSend(): Promise<void> {
 if (!sendTargetId.value) return
 const success = await offerStore.sendOffer(sendTargetId.value)
 if (success) {
 showSendConfirm.value = false
 sendTargetId.value = null
 }
}

// ── Delete offer modal ──
const showDeleteConfirm = ref(false)
const deleteTargetId = ref<string | null>(null)

function openDeleteConfirm(offerId: string): void {
 deleteTargetId.value = offerId
 showDeleteConfirm.value = true
}

async function confirmDelete(): Promise<void> {
 if (!deleteTargetId.value) return
 const success = await offerStore.deleteOffer(deleteTargetId.value)
 if (success) {
 showDeleteConfirm.value = false
 deleteTargetId.value = null
 }
}

// ── Helpers ──
const canManage = computed(() => auth.isCompanyAdmin || auth.isHR)

/** Whether we can create a new offer (no non-declined offers exist) */
const canCreateNew = computed(() => {
 return !offerStore.offers.some((o) => o.status !== 'DECLINED')
})

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
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

// ── Init ──
onMounted(async () => {
  await appStore.fetchApplication(applicationId.value)
  await Promise.all([
    offerStore.fetchOffers(applicationId.value),
    interviewStore.fetchInterviews(applicationId.value),
  ])
})

onBeforeUnmount(() => {
 offerStore.clearCurrent()
})
</script>

<template>
 <div class="max-w-3xl mx-auto px-6 pb-8">
 <!-- Breadcrumb -->
 <nav class="flex items-center gap-1.5 mb-6 text-sm text-gray-400 flex-wrap">
  <router-link to="/employer/jobs" class="hover:text-gray-600 transition">Jobs</router-link>
  <span>›</span>
  <router-link
   v-if="appStore.currentApplication?.jobId"
   :to="`/employer/jobs/${appStore.currentApplication.jobId}/applications`"
   class="hover:text-gray-600 transition"
  >Applications</router-link>
  <span v-else>Applications</span>
  <span>›</span>
  <router-link
   :to="`/employer/applications/${applicationId}`"
   class="hover:text-gray-600 transition truncate max-w-[140px]"
  >{{ appStore.currentApplication?.candidateName ?? 'Application' }}</router-link>
  <span>›</span>
  <span class="text-gray-700 font-medium">Offer</span>
 </nav>

 <!-- Loading -->
 <div v-if="offerStore.listLoading" class="space-y-4">
 <div class="bg-surface border border-border rounded-lg p-6 shadow-sm animate-pulse space-y-4">
 <div class="h-6 bg-gray-100 rounded w-48" />
 <div class="h-4 bg-gray-100 rounded w-32" />
 <div class="h-20 bg-gray-100 rounded w-full" />
 </div>
 </div>

 <template v-else>
 <!-- ─── Header ─── -->
 <div class="bg-surface border border-border rounded-lg p-6 shadow-sm mb-5">
 <div class="flex items-start justify-between">
 <div>
 <h1 class="text-xl font-bold text-gray-900 mb-1">Offer Management</h1>
 <p class="text-sm text-gray-500">
 <template v-if="appStore.currentApplication">
 {{ appStore.currentApplication.candidateName }} — {{ appStore.currentApplication.jobTitle }}
 </template>
 </p>
 </div>
 <!-- Create offer button — disabled until at least one interview is COMPLETED -->
 <button
 v-if="canManage && canCreateNew"
 @click="showCreateForm = true"
 :disabled="!hasCompletedInterview"
 class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition flex items-center gap-1.5 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
 :title="!hasCompletedInterview ? 'At least one interview must be completed before creating an offer.' : undefined"
 >
 <span class="text-base leading-none">+</span>
 Create Offer
 </button>
 </div>
 </div>

 <!-- ─── Interview requirement warning ─── -->
 <div
 v-if="canManage && !hasCompletedInterview && !interviewStore.listLoading"
 class="flex items-start gap-3 px-5 py-4 mb-5 rounded-lg border border-amber-200 bg-amber-50"
 >
 <span class="text-amber-500 text-lg shrink-0 mt-0.5">⚠</span>
 <div>
 <p class="text-sm font-semibold text-amber-800">Interview required before creating an offer</p>
 <p class="text-xs text-amber-700 mt-0.5">
 At least one interview must be marked <span class="font-bold">Completed</span> for this candidate before you can draft an offer.
 <router-link
 :to="`/employer/applications/${applicationId}/interviews`"
 class="underline font-semibold ml-1 hover:text-amber-900 transition"
 >Go to Interviews →</router-link>
 </p>
 </div>
 </div>

 <!-- ─── No Offers ─── -->
 <div v-if="offerStore.offers.length === 0 && !showCreateForm" class="bg-surface border border-border rounded-lg p-12 shadow-sm text-center">
 <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-2xl mx-auto mb-4">
 📋
 </div>
 <h2 class="text-lg font-bold text-gray-900 mb-2">No Offer Created</h2>
 <p class="text-sm text-gray-500 mb-5">Prepare an offer letter to send to the candidate.</p>
 <button
 v-if="canManage"
 @click="showCreateForm = true"
 :disabled="!hasCompletedInterview"
 class="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed"
 :title="!hasCompletedInterview ? 'At least one interview must be completed first.' : undefined"
 >
 Compose Offer
 </button>
 </div>

 <!-- ─── Create Offer Form ─── -->
 <div v-if="showCreateForm" class="bg-surface border border-border rounded-lg shadow-sm mb-5 overflow-hidden">
 <div class="px-6 py-4 border-b border-border bg-gray-50/50">
 <h2 class="text-sm font-semibold text-gray-900">Prepare an Offer</h2>
 <p class="text-xs text-gray-500 mt-0.5">Please fill in the benefit fields for the candidate. The system automatically saves a draft.</p>
 </div>
 <div class="p-6 space-y-5">
 <!-- Salary -->
 <div class="grid grid-cols-2 gap-4">
 <div>
 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
 Base Salary <span class="text-error">*</span>
 </label>
 <input
 v-model.number="formData.baseSalary"
 type="number"
 min="0"
 step="100000"
 placeholder="e.g. 20000000"
 class="w-full px-3 py-2.5 text-sm border rounded-md bg-surface outline-none transition"
 :class="formErrors.baseSalary ? 'border-error focus:ring-error/20' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <p v-if="formErrors.baseSalary" class="text-[11px] text-error mt-1">{{ formErrors.baseSalary }}</p>
 </div>
 <div>
 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Currency</label>
 <select
 v-model="formData.currency"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 >
 <option value="VND">VND</option>
 <option value="USD">USD</option>
 <option value="EUR">EUR</option>
 </select>
 </div>
 </div>

 <!-- Start Date -->
 <div>
 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Start Date</label>
 <input
 v-model="formData.startDate"
 type="date"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 />
 </div>

 <!-- Offer Letter URL -->
 <div>
 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Offer Letter URL (PDF)</label>
 <input
 v-model="formData.offerLetterUrl"
 type="url"
 placeholder="https://drive.google.com/..."
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 />
 <p class="text-[10px] text-gray-400 mt-1">Provide a direct file link or a publicly readable Google Drive link.</p>
 </div>

 <!-- Notes -->
 <div>
 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notes</label>
 <textarea
 v-model="formData.note"
 rows="3"
 placeholder="Narrative text or additional supplementary information..."
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition resize-none"
 />
 </div>

 <!-- Actions -->
 <div class="flex justify-end gap-2 pt-2">
 <button
 @click="showCreateForm = false; resetForm()"
 class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
 >
 Cancel
 </button>
 <button
 @click="handleCreateOffer"
 :disabled="offerStore.createLoading"
 class="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 flex items-center gap-2"
 >
 <span v-if="offerStore.createLoading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ offerStore.createLoading ? 'Creating…' : 'Save as Draft' }}
 </button>
 </div>
 </div>
 </div>

 <!-- ─── Offer Cards ─── -->
 <div class="space-y-5">
 <div
 v-for="offer in offerStore.offers"
 :key="offer.id"
 class="bg-surface border border-border rounded-lg shadow-sm overflow-hidden"
 >
 <!-- Offer Header -->
 <div class="px-6 py-4 border-b border-border flex items-center justify-between">
 <div class="flex items-center gap-3">
 <span
 class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full"
 :class="STATUS_CONFIG[offer.status].class"
 >
 <span class="w-1.5 h-1.5 rounded-full" :class="STATUS_CONFIG[offer.status].dotClass" />
 {{ STATUS_CONFIG[offer.status].label }}
 </span>
 <span class="text-xs text-gray-400">
 Created {{ formatDateTime(offer.createdAt) }}
 </span>
 </div>

 <!-- Actions per status -->
 <div v-if="canManage" class="flex items-center gap-2">
 <button
 v-if="offer.status === 'DRAFT'"
 @click="openSendConfirm(offer.id)"
 :disabled="offerStore.sendLoading"
 class="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition disabled:opacity-50"
 >
 Send by Email
 </button>
 <button
 v-if="offer.status === 'DRAFT'"
 @click="openDeleteConfirm(offer.id)"
 :disabled="offerStore.deleteLoading"
 class="px-3 py-1.5 text-xs font-medium text-error bg-error-bg hover:bg-red-100 rounded-md transition disabled:opacity-50"
 >
 Delete
 </button>
 </div>
 </div>

 <!-- Lifecycle Progress -->
 <div class="px-6 py-4 border-b border-border bg-gray-50/30">
 <div class="flex items-center">
 <div
 v-for="(step, idx) in LIFECYCLE_STEPS"
 :key="step.status"
 class="flex items-center"
 :class="idx < LIFECYCLE_STEPS.length - 1 ? 'flex-1' : ''"
 >
 <div
 class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all shrink-0"
 :class="{
 'bg-primary border-primary text-white': getStepState(step.status, offer) === 'completed',
 'bg-white border-primary text-primary ring-4 ring-primary/10': getStepState(step.status, offer) === 'current',
 'bg-white border-gray-200 text-gray-400': getStepState(step.status, offer) === 'upcoming',
 'bg-red-100 border-red-400 text-red-500': getStepState(step.status, offer) === 'declined',
 }"
 >
 <template v-if="getStepState(step.status, offer) === 'completed'">✓</template>
 <template v-else-if="getStepState(step.status, offer) === 'declined'">✕</template>
 <template v-else>{{ step.icon }}</template>
 </div>
 <div
 v-if="idx < LIFECYCLE_STEPS.length - 1"
 class="flex-1 h-0.5 mx-2 transition-all"
 :class="{
 'bg-primary': getStepState(step.status, offer) === 'completed',
 'bg-gray-200': getStepState(step.status, offer) !== 'completed',
 }"
 />
 </div>
 </div>
 <div class="flex items-center mt-2">
 <div
 v-for="(step, idx) in LIFECYCLE_STEPS"
 :key="'label-' + step.status"
 class="text-center"
 :class="idx < LIFECYCLE_STEPS.length - 1 ? 'flex-1' : ''"
 :style="{ minWidth: '56px' }"
 >
 <span
 class="text-[10px] font-medium"
 :class="{
 'text-primary': getStepState(step.status, offer) === 'completed' || getStepState(step.status, offer) === 'current',
 'text-gray-400': getStepState(step.status, offer) === 'upcoming',
 'text-red-500': getStepState(step.status, offer) === 'declined',
 }"
 >
 {{ step.label }}
 </span>
 </div>
 </div>
 <!-- Declined badge -->
 <div
 v-if="offer.status === 'DECLINED'"
 class="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-error-bg text-error text-xs"
 >
 <span class="font-medium">Declined</span>
 <span class="text-red-400">— The candidate has declined this offer.</span>
 </div>
 </div>

 <!-- Offer Details -->
 <div class="px-6 py-5">
 <div class="grid grid-cols-2 gap-x-8 gap-y-4">
 <!-- Base Salary -->
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Base Salary</span>
 <span class="text-lg font-bold text-gray-900">
 {{ formatSalary(offer.baseSalary, offer.currency) }}
 </span>
 </div>

 <!-- Currency -->
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Currency Unit</span>
 <span class="text-sm font-medium text-gray-900">{{ offer.currency ?? 'VND' }}</span>
 </div>

 <!-- Start Date -->
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Start Date</span>
 <span class="text-sm text-gray-700">{{ offer.startDate ? formatDate(offer.startDate) : '—' }}</span>
 </div>

 <!-- Status -->
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Status</span>
 <span
 class="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full"
 :class="STATUS_CONFIG[offer.status].class"
 >
 {{ STATUS_CONFIG[offer.status].label }}
 </span>
 </div>
 </div>

 <!-- Offer Letter -->
 <div v-if="offer.offerLetterUrl" class="mt-4 pt-4 border-t border-border">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Offer Letter Document</span>
 <a
 :href="offer.offerLetterUrl"
 target="_blank"
 rel="noopener"
 class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary-bg border border-primary/10 rounded-md hover:bg-primary-light transition"
 >
 📄 View Offer Letter (PDF)
 <span class="text-xs text-gray-400">↗</span>
 </a>
 </div>

 <!-- Notes -->
 <div v-if="offer.note" class="mt-4 pt-4 border-t border-border">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Notes</span>
 <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-border">
 {{ offer.note }}
 </div>
 </div>
 </div>
 </div>
 </div>
 </template>

 <!-- ─── Send Confirmation Modal ─── -->
 <Teleport to="body">
 <div v-if="showSendConfirm" class="fixed inset-0 z-50 flex items-center justify-center">
 <div class="absolute inset-0 bg-black/40" @click="showSendConfirm = false" />
 <div class="relative bg-surface rounded-lg shadow-xl border border-border w-full max-w-md p-6 animate-slide-up">
 <div class="text-center mb-5">
 <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-xl mx-auto mb-3">
 📨
 </div>
 <h2 class="text-lg font-bold text-gray-900 mb-1">Send This Offer?</h2>
 <p class="text-sm text-gray-500">
 An offer letter email will be sent directly to the candidate. They will have the option to accept or decline.
 </p>
 </div>
 <div class="flex justify-center gap-2">
 <button
 @click="showSendConfirm = false"
 class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
 >
 Cancel
 </button>
 <button
 @click="confirmSend"
 :disabled="offerStore.sendLoading"
 class="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition disabled:opacity-50 flex items-center gap-2"
 >
 <span v-if="offerStore.sendLoading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ offerStore.sendLoading ? 'Sending…' : 'Send Offer' }}
 </button>
 </div>
 </div>
 </div>
 </Teleport>

 <!-- ─── Delete Confirmation Modal ─── -->
 <Teleport to="body">
 <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center">
 <div class="absolute inset-0 bg-black/40" @click="showDeleteConfirm = false" />
 <div class="relative bg-surface rounded-lg shadow-xl border border-border w-full max-w-md p-6 animate-slide-up">
 <div class="text-center mb-5">
 <div class="w-12 h-12 rounded-full bg-error-bg text-error flex items-center justify-center text-xl mx-auto mb-3">
 ✕
 </div>
 <h2 class="text-lg font-bold text-gray-900 mb-1">Permanently Delete This Draft?</h2>
 <p class="text-sm text-gray-500">
 Think carefully before deleting this draft — this action cannot be undone.
 </p>
 </div>
 <div class="flex justify-center gap-2">
 <button
 @click="showDeleteConfirm = false"
 class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
 >
 Cancel
 </button>
 <button
 @click="confirmDelete"
 :disabled="offerStore.deleteLoading"
 class="px-4 py-2 text-sm font-medium text-white bg-error hover:bg-red-700 rounded-md transition disabled:opacity-50 flex items-center gap-2"
 >
 <span v-if="offerStore.deleteLoading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ offerStore.deleteLoading ? 'Deleting…' : 'Confirm Delete' }}
 </button>
 </div>
 </div>
 </div>
 </Teleport>
 </div>
</template>
