<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAuthStore } from '@/stores/authStore'
import type { ApplicationStatus } from '@/types/enums'

const route = useRoute()
const router = useRouter()
const appStore = useApplicationStore()
const auth = useAuthStore()

const applicationId = computed(() => route.params.id as string)

// ── Status config ──
const statusConfig: Record<ApplicationStatus, { label: string; class: string; dotClass: string }> = {
 NEW: { label: 'Ứng Tuyển', class: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-400' },
 SCREENING: { label: 'Sàng Lọc', class: 'bg-amber-50 text-amber-600', dotClass: 'bg-amber-400' },
 INTERVIEW: { label: 'Phỏng Vấn', class: 'bg-purple-50 text-purple-600', dotClass: 'bg-purple-500' },
 OFFER: { label: 'Thư Mời', class: 'bg-primary-bg text-primary', dotClass: 'bg-primary' },
 HIRED: { label: 'Đã Tuyển', class: 'bg-success-bg text-success', dotClass: 'bg-green-500' },
 REJECTED: { label: 'Bị Từ Chối', class: 'bg-error-bg text-error', dotClass: 'bg-red-400' },
}

// ── Transition button config ──
const transitionButtonConfig: Record<ApplicationStatus, { label: string; class: string; confirmTitle: string; confirmDesc: string }> = {
 SCREENING: {
 label: 'Chuyển Sang Sàng Lọc',
 class: 'bg-amber-500 hover:bg-amber-600 text-white',
 confirmTitle: 'Chuyển Sang Sàng Lọc?',
 confirmDesc: 'Bấm xác nhận để di chuyển ứng viên này sang giai đoạn sàng lọc.',
 },
 INTERVIEW: {
 label: 'Chuyển Sang Phỏng Vấn',
 class: 'bg-purple-500 hover:bg-purple-600 text-white',
 confirmTitle: 'Chuyển Sang Phỏng Vấn?',
 confirmDesc: 'Ứng viên sẽ được đưa sang bước Phỏng vấn. Tại đây bạn có thể lên lịch phỏng vấn.',
 },
 OFFER: {
 label: 'Chuyển Sang Gửi Thư Mời',
 class: 'bg-primary hover:bg-primary-hover text-white',
 confirmTitle: 'Chuyển Sang Gửi Thư Mời?',
 confirmDesc: 'Ứng viên sẽ được đưa sang bước cấp Thư mời. Bạn có thể soạn thư mời ngay sau bước này.',
 },
 REJECTED: {
 label: 'Từ Chối',
 class: 'bg-error hover:bg-red-700 text-white',
 confirmTitle: 'Từ Chối Ứng Viên?',
 confirmDesc: 'Đơn ứng tuyển này sẽ bị đánh dấu Từ chối. Thao tác này không thể hoàn tác.',
 },
 NEW: { label: '', class: '', confirmTitle: '', confirmDesc: '' },
 HIRED: { label: '', class: '', confirmTitle: '', confirmDesc: '' },
}

// ── Pipeline step display ──
const PIPELINE_STEPS: { status: ApplicationStatus; label: string }[] = [
 { status: 'NEW', label: 'Ứng Tuyển' },
 { status: 'SCREENING', label: 'Sàng Lọc' },
 { status: 'INTERVIEW', label: 'Phỏng Vấn' },
 { status: 'OFFER', label: 'Thư Mời' },
 { status: 'HIRED', label: 'Đã Tuyển' },
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

// ── Init ──
onMounted(async () => {
 const loaded = await appStore.fetchApplication(applicationId.value)
 if (loaded) {
 appStore.fetchStatusHistory(applicationId.value)
 }
})

onBeforeUnmount(() => {
 appStore.clearCurrent()
})
</script>

<template>
 <div class="max-w-4xl mx-auto px-6 pb-8">
 <!-- Back -->
 <div class="flex items-center gap-3 mb-6">
 <button @click="router.back()" class="text-gray-400 hover:text-gray-600 transition text-sm">
 ‹ Quay Lại
 </button>
 </div>

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
 Đã ứng tuyển lúc {{ formatDateTime(appStore.currentApplication.createdAt) }}
 </span>
 </div>
 </div>

 <!-- Quick actions -->
 <div v-if="canManage" class="flex items-center gap-2 shrink-0">
 <router-link
 :to="`/employer/applications/${applicationId}/interviews`"
 class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
 >
 Phỏng Vấn
 </router-link>
 <router-link
 v-if="appStore.currentApplication.status === 'OFFER'"
 :to="`/employer/offers/${applicationId}`"
 class="px-3 py-1.5 text-xs font-medium text-primary bg-primary-bg border border-primary/10 rounded-md hover:bg-primary-light transition"
 >
 Xem Thư Mời
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
 <span class="font-medium">Bị Từ Chối</span>
 <span class="text-red-400">— Đơn ứng tuyển này đã bị từ chối.</span>
 </div>
 </div>
 </div>

 <!-- ─── Status Transition Buttons ─── -->
 <div v-if="canManage && appStore.canTransition" class="bg-surface border border-border rounded-lg p-5 shadow-sm">
 <h2 class="text-sm font-semibold text-gray-900 mb-3">Chuyển Trạng Thái</h2>
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
 <h2 class="text-sm font-semibold text-gray-900 mb-4">Thông Tin Hồ Sơ</h2>
 <div class="grid grid-cols-2 gap-4">
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Vị Trí</span>
 <router-link
 :to="`/employer/jobs/${appStore.currentApplication.jobId}`"
 class="text-sm font-medium text-primary hover:text-primary-hover transition"
 >
 {{ appStore.currentApplication.jobTitle }}
 </router-link>
 </div>
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Ứng Viên</span>
 <span class="text-sm font-medium text-gray-900">{{ appStore.currentApplication.candidateName }}</span>
 </div>
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Ngày Ứng Tuyển</span>
 <span class="text-sm text-gray-700">{{ formatDateTime(appStore.currentApplication.createdAt) }}</span>
 </div>
 <div>
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Cập Nhật Cuối</span>
 <span class="text-sm text-gray-700">{{ formatDateTime(appStore.currentApplication.updatedAt) }}</span>
 </div>
 </div>

 <!-- Cover Letter -->
 <div v-if="appStore.currentApplication.coverLetter" class="mt-5 pt-5 border-t border-border">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Thư Giới Thiệu</span>
 <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-border">
 {{ appStore.currentApplication.coverLetter }}
 </div>
 </div>

 <!-- CV Link -->
 <div v-if="appStore.currentApplication.appliedCvUrl" class="mt-5 pt-5 border-t border-border">
 <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">CV Đã Nộp</span>
 <a
 :href="appStore.currentApplication.appliedCvUrl"
 target="_blank"
 rel="noopener"
 class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary bg-primary-bg border border-primary/10 rounded-md hover:bg-primary-light transition"
 >
 <span>📄</span>
 Xem CV
 <span class="text-xs text-gray-400">↗</span>
 </a>
 </div>
 </div>

 <!-- ─── Status History (Timeline) ─── -->
 <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
 <h2 class="text-sm font-semibold text-gray-900 mb-4">Lịch Sử Trạng Thái</h2>

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
 Chưa có sự thay đổi trạng thái nào được ghi nhận.
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
 <p class="text-gray-400 text-sm">Không tìm thấy hồ sơ hoặc bạn không có quyền truy cập để xem hồ sơ này.</p>
 <button @click="router.back()" class="mt-3 text-primary hover:text-primary-hover text-sm font-medium transition">
 ← Quay Lại
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
 Ghi Chú (Tùy Chọn)
 </label>
 <textarea
 v-model="transitionNotes"
 rows="3"
 placeholder="Viết vài dòng ghi chú ở đây…"
 class="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition resize-none"
 />
 </div>

 <div class="flex justify-center gap-2">
 <button
 @click="showConfirm = false"
 class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
 >
 Hủy Bỏ
 </button>
 <button
 @click="confirmTransition"
 :disabled="appStore.statusLoading"
 class="px-4 py-2 text-sm font-medium text-white rounded-md transition disabled:opacity-50 flex items-center gap-2"
 :class="transitionButtonConfig[pendingTransition].class"
 >
 <span v-if="appStore.statusLoading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ appStore.statusLoading ? 'Đang xử lý…' : 'Xác Nhận' }}
 </button>
 </div>
 </div>
 </div>
 </Teleport>
 </div>
</template>
