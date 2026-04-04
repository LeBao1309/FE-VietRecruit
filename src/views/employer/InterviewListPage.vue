<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInterviewStore } from '@/stores/interviewStore'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAuthStore } from '@/stores/authStore'
import type { InterviewStatus } from '@/types/enums'
import type { InterviewCreateRequest } from '@/types/application'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()
const appStore = useApplicationStore()
const auth = useAuthStore()

const applicationId = computed(() => route.params.id as string)
const canManage = computed(() => auth.isCompanyAdmin || auth.isHR)

// ── Status config ──
const statusConfig: Record<InterviewStatus, { label: string; class: string; dotClass: string }> = {
 SCHEDULED: { label: 'Đã Lên Lịch', class: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-400' },
 COMPLETED: { label: 'Đã Hoàn Thành', class: 'bg-success-bg text-success', dotClass: 'bg-green-500' },
 CANCELED: { label: 'Đã Hủy', class: 'bg-gray-100 text-gray-500', dotClass: 'bg-gray-400' },
}

// ── Schedule dialog state ──
const showScheduleDialog = ref(false)
const form = ref<InterviewCreateRequest>({
 title: '',
 scheduledAt: '',
 durationMinutes: 60,
 locationOrLink: '',
 interviewType: 'ONLINE',
 interviewerIds: [],
})
const interviewerIdInput = ref('')

const interviewTypeOptions = [
 { label: 'Online', value: 'ONLINE' },
 { label: 'Onsite', value: 'ONSITE' },
 { label: 'Phone', value: 'PHONE' },
]

const formErrors = ref<Record<string, string>>({})

function validateForm(): boolean {
 const errors: Record<string, string> = {}
 if (!form.value.title.trim()) errors.title = 'Vui lòng nhập tiêu đề'
 if (!form.value.scheduledAt) errors.scheduledAt = 'Vui lòng chọn ngày & giờ'
 if (form.value.interviewerIds.length === 0) errors.interviewerIds = 'Vui lòng chọn ít nhất một người phỏng vấn'

 // Check datetime is in the future
 if (form.value.scheduledAt) {
 const scheduled = new Date(form.value.scheduledAt)
 if (scheduled <= new Date()) {
 errors.scheduledAt = 'Thời gian phải ở trong tương lai'
 }
 }

 formErrors.value = errors
 return Object.keys(errors).length === 0
}

function openScheduleDialog(): void {
 form.value = {
 title: '',
 scheduledAt: '',
 durationMinutes: 60,
 locationOrLink: '',
 interviewType: 'ONLINE',
 interviewerIds: [],
 }
 interviewerIdInput.value = ''
 formErrors.value = {}
 showScheduleDialog.value = true
}

function addInterviewerId(): void {
 const id = interviewerIdInput.value.trim()
 if (id && !form.value.interviewerIds.includes(id)) {
 form.value.interviewerIds.push(id)
 interviewerIdInput.value = ''
 // Clear error
 if (formErrors.value.interviewerIds) {
 delete formErrors.value.interviewerIds
 }
 }
}

function removeInterviewerId(id: string): void {
 form.value.interviewerIds = form.value.interviewerIds.filter((i) => i !== id)
}

async function submitSchedule(): Promise<void> {
 if (!validateForm()) return
 const success = await interviewStore.scheduleInterview(applicationId.value, {
 ...form.value,
 durationMinutes: form.value.durationMinutes || undefined,
 locationOrLink: form.value.locationOrLink || undefined,
 interviewType: form.value.interviewType || undefined,
 })
 if (success) {
 showScheduleDialog.value = false
 }
}

// ── Navigation ──
function goToDetail(interviewId: string): void {
 router.push(`/employer/interviews/${interviewId}`)
}

// ── Helpers ──
function formatDateTime(iso: string): string {
 return new Date(iso).toLocaleString('en-US', {
 weekday: 'short',
 month: 'short',
 day: 'numeric',
 year: 'numeric',
 hour: '2-digit',
 minute: '2-digit',
 })
}

function formatDuration(minutes: number | null): string {
 if (!minutes) return '—'
 if (minutes < 60) return `${minutes} min`
 const h = Math.floor(minutes / 60)
 const m = minutes % 60
 return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function isUpcoming(scheduledAt: string): boolean {
 return new Date(scheduledAt) > new Date()
}

// ── Init ──
onMounted(async () => {
 await appStore.fetchApplication(applicationId.value)
 await interviewStore.fetchInterviews(applicationId.value)
})
</script>

<template>
 <div class="max-w-4xl mx-auto px-6 py-8">
 <!-- Back -->
 <div class="flex items-center gap-3 mb-2">
 <button
 @click="router.push(`/employer/applications/${applicationId}`)"
 class="text-gray-400 hover:text-gray-600 transition text-sm"
 >
 ‹ Về Hồ Sơ Ứng Tuyển
 </button>
 </div>

 <!-- Header -->
 <div class="flex items-start justify-between mb-6">
 <div>
 <h1 class="text-xl font-bold text-gray-900">Lịch Phỏng Vấn</h1>
 <p v-if="appStore.currentApplication" class="text-sm text-gray-500 mt-1">
 {{ appStore.currentApplication.candidateName }}
 <span class="text-gray-300 mx-1">·</span>
 {{ appStore.currentApplication.jobTitle }}
 </p>
 </div>
 <button
 v-if="canManage"
 @click="openScheduleDialog"
 class="btn-primary"
 >
 <span class="text-lg leading-none">+</span> Lên Lịch Phỏng Vấn
 </button>
 </div>

 <!-- Loading -->
 <div v-if="interviewStore.listLoading" class="space-y-4">
 <div v-for="i in 3" :key="i" class="premium-card p-5 animate-pulse">
 <div class="flex items-start gap-4">
 <div class="h-12 w-12 bg-slate-100 rounded-xl" />
 <div class="flex-1 space-y-3 pt-1">
 <div class="h-4 bg-slate-100 rounded w-48" />
 <div class="h-3 bg-slate-100 rounded w-32" />
 </div>
 <div class="h-6 bg-slate-100 rounded-full w-24" />
 </div>
 </div>
 </div>

 <!-- Empty state -->
 <div
 v-else-if="interviewStore.interviews.length === 0"
 class="premium-card p-16 text-center"
 >
 <div class="text-slate-900 mb-2">
 <p class="font-extrabold text-xl mb-1">Chưa có lịch phỏng vấn</p>
 <p class="text-sm text-slate-500 mb-6 mt-2">Hãy lên lịch phỏng vấn để bắt đầu quá trình đánh giá.</p>
 <button
 v-if="canManage"
 @click="openScheduleDialog"
 class="btn-primary inline-flex"
 >
 + Lên Lịch Phỏng Vấn
 </button>
 </div>
 </div>

 <!-- Interview cards -->
 <div v-else class="space-y-4">
 <div
 v-for="interview in interviewStore.interviews"
 :key="interview.id"
 @click="goToDetail(interview.id)"
 class="premium-card p-6 cursor-pointer group hover:border-teal-400 :border-teal-500 block"
 >
 <div class="flex items-start justify-between mb-4">
 <div class="flex items-start gap-4">
 <!-- Calendar icon -->
 <div
 class="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0 transition-colors border-2"
 :class="interview.status === 'SCHEDULED' && isUpcoming(interview.scheduledAt)
 ? 'bg-blue-50 text-blue-600 border-blue-100 '
 : interview.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 '
 : 'bg-slate-100 text-slate-400 border-slate-200 '"
 >
 {{ new Date(interview.scheduledAt).getDate() }}
 </div>
 <div>
 <h3 class="text-base font-bold text-slate-900 group-hover:text-teal-600 :text-teal-400 transition-colors">
 {{ interview.title }}
 </h3>
 <p class="text-xs font-medium text-slate-500 mt-1">
 {{ formatDateTime(interview.scheduledAt) }}
 <span v-if="interview.durationMinutes" class="text-slate-300 mx-1">·</span>
 <span v-if="interview.durationMinutes">{{ formatDuration(interview.durationMinutes) }}</span>
 </p>
 </div>
 </div>
 <span
 class="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shrink-0 shadow-sm border border-current"
 :class="statusConfig[interview.status].class"
 >
 <span class="w-1.5 h-1.5 rounded-full" :class="statusConfig[interview.status].dotClass" />
 {{ statusConfig[interview.status].label }}
 </span>
 </div>

 <!-- Meta -->
 <div class="flex items-center gap-5 pt-4 text-xs font-bold text-slate-500 border-t border-slate-100 ">
 <span v-if="interview.interviewType" class="flex items-center gap-1.5">
 <span class="text-base leading-none">{{ interview.interviewType === 'ONLINE' ? '💻' : interview.interviewType === 'PHONE' ? '📱' : '🏢' }}</span>
 <span class="uppercase tracking-wider">{{ interview.interviewType }}</span>
 </span>
 <span v-if="interview.locationOrLink" class="truncate max-w-[250px]">
 {{ interview.locationOrLink }}
 </span>
 <span class="ml-auto flex items-center gap-2">
 {{ interview.interviewers.length }} interviewer{{ interview.interviewers.length !== 1 ? 's' : '' }}
 </span>
 </div>

 <!-- Interviewers pills -->
 <div v-if="interview.interviewers.length" class="flex items-center gap-2 mt-3 flex-wrap">
 <span
 v-for="iv in interview.interviewers"
 :key="iv.id"
 class="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-full shadow-sm border border-slate-200 "
 >
 {{ iv.fullName }}
 </span>
 </div>
 </div>
 </div>

 <!-- ─── Schedule Interview Dialog ─── -->
 <Teleport to="body">
 <div v-if="showScheduleDialog" class="premium-modal-backdrop">
 <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showScheduleDialog = false" />
 <div class="premium-modal-content w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
 <div class="flex items-center justify-between mb-6">
 <h2 class="text-xl font-bold text-slate-900 ">Lên Lịch Phỏng Vấn</h2>
 <button
 @click="showScheduleDialog = false"
 class="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 :text-slate-200 :bg-slate-800 transition"
 >
 ✕
 </button>
 </div>

 <div class="space-y-5">
 <!-- Title -->
 <div>
 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
 Tiêu Đề <span class="text-rose-500">*</span>
 </label>
 <input
 v-model="form.title"
 type="text"
 placeholder="VD: Phỏng vấn kỹ thuật vòng 1"
 class="w-full px-4 py-3 text-sm border rounded-xl bg-slate-50 outline-none transition"
 :class="formErrors.title ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'"
 />
 <p v-if="formErrors.title" class="text-xs text-rose-500 mt-1.5">{{ formErrors.title }}</p>
 </div>

 <!-- Date & Time -->
 <div>
 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
 Ngày & Giờ <span class="text-rose-500">*</span>
 </label>
 <input
 v-model="form.scheduledAt"
 type="datetime-local"
 class="w-full px-4 py-3 text-sm border rounded-xl bg-slate-50 outline-none transition"
 :class="formErrors.scheduledAt ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'"
 />
 <p v-if="formErrors.scheduledAt" class="text-xs text-rose-500 mt-1.5">{{ formErrors.scheduledAt }}</p>
 </div>

 <!-- Duration & Type -->
 <div class="grid grid-cols-2 gap-4">
 <div>
 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
 Thời Lượng (phút)
 </label>
 <input
 v-model.number="form.durationMinutes"
 type="number"
 min="15"
 max="480"
 step="15"
 class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
 />
 </div>
 <div>
 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
 Hình Thức
 </label>
 <select
 v-model="form.interviewType"
 class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
 >
 <option v-for="opt in interviewTypeOptions" :key="opt.value" :value="opt.value">
 {{ opt.label }}
 </option>
 </select>
 </div>
 </div>

 <!-- Location / Link -->
 <div>
 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
 Địa Điểm / Liên Kết Meeting
 </label>
 <input
 v-model="form.locationOrLink"
 type="text"
 placeholder="VD: https://meet.google.com/abc-xyz hoặc Phòng 301"
 class="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
 />
 </div>

 <!-- Interviewer IDs -->
 <div>
 <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
 Người Phỏng Vấn <span class="text-rose-500">*</span>
 </label>
 <div class="flex items-center gap-2">
 <input
 v-model="interviewerIdInput"
 type="text"
 placeholder="Nhập ID người phỏng vấn"
 class="flex-1 px-4 py-3 text-sm border rounded-xl bg-slate-50 outline-none transition"
 :class="formErrors.interviewerIds ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'"
 @keydown.enter.prevent="addInterviewerId"
 />
 <button
 @click="addInterviewerId"
 type="button"
 class="btn-secondary"
 >
 Thêm
 </button>
 </div>
 <p v-if="formErrors.interviewerIds" class="text-xs text-rose-500 mt-1.5">{{ formErrors.interviewerIds }}</p>
 <!-- Tags -->
 <div v-if="form.interviewerIds.length" class="flex items-center gap-2 mt-3 flex-wrap">
 <span
 v-for="iId in form.interviewerIds"
 :key="iId"
 class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold tracking-wider bg-slate-100 text-slate-600 rounded-full shadow-sm border border-slate-200 "
 >
 {{ iId.slice(0, 8) }}…
 <button
 @click="removeInterviewerId(iId)"
 class="text-slate-400 hover:text-rose-500 transition ml-1"
 >
 ✕
 </button>
 </span>
 </div>
 </div>
 </div>

 <!-- Actions -->
 <div class="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-100 ">
 <button
 @click="showScheduleDialog = false"
 class="btn-secondary"
 >
 Hủy Bỏ
 </button>
 <button
 @click="submitSchedule"
 :disabled="interviewStore.createLoading"
 class="btn-primary"
 >
 <span v-if="interviewStore.createLoading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ interviewStore.createLoading ? 'Đang Lên Lịch…' : 'Xác Nhận' }}
 </button>
 </div>
 </div>
 </div>
 </Teleport>
 </div>
</template>
