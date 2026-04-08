<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { jobService } from '@/services/jobService'
import { applicationService } from '@/services/applicationService'
import { candidateService } from '@/services/candidateService'
import PublicNavbar from '@/components/common/PublicNavbar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import type { JobResponse } from '@/types/job'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const jobId = computed(() => route.params.id as string)

// ── State ──
const job = ref<JobResponse | null>(null)
const loading = ref(true)
const notFound = ref(false)

// ── AI Match score ──
const aiMatchScore = ref<number | null>(null)
const aiMatchReason = ref<string | null>(null)

async function loadAiMatch(): Promise<void> {
 if (!auth.isCandidate) return
 const profileResult = await candidateService.getProfile()
 if (!profileResult.data?.defaultCvUrl) return
 const recsResult = await candidateService.getRecommendations(50)
 if (recsResult.data) {
   const match = recsResult.data.find(r => r.jobId === jobId.value)
   if (match) {
     aiMatchScore.value = match.matchScore
     aiMatchReason.value = match.matchReason
   }
 }
}

function scoreBorderClass(score: number): string {
 if (score >= 70) return 'border-emerald-200'
 if (score >= 40) return 'border-amber-200'
 return 'border-rose-200'
}
function scoreTextClass(score: number): string {
 if (score >= 70) return 'text-emerald-700'
 if (score >= 40) return 'text-amber-700'
 return 'text-rose-700'
}
function scoreBgClass(score: number): string {
 if (score >= 70) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
 if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200'
 return 'bg-rose-50 text-rose-700 border-rose-200'
}
function scoreDotColor(score: number): string {
 if (score >= 70) return 'bg-emerald-500'
 if (score >= 40) return 'bg-amber-500'
 return 'bg-rose-500'
}

// ── Apply modal ──
const showApplyModal = ref(false)
const coverLetter = ref('')
const applying = ref(false)
const applied = ref(false)

// ── Load ──
async function loadJob(): Promise<void> {
 loading.value = true
 notFound.value = false
 try {
 const result = await jobService.getPublicJob(jobId.value)
 if (result.data) {
 job.value = result.data
 } else {
 notFound.value = true
 }
 } finally {
 loading.value = false
 }
}

async function checkAlreadyApplied(): Promise<void> {
 if (!auth.isCandidate) return
 const result = await applicationService.listMyApplications({ page: 0, size: 200 })
 if (result.data) {
   applied.value = result.data.content.some(a => a.jobId === jobId.value)
 }
}

// ── Apply button logic ──
function handleApplyClick(): void {
 if (!auth.isAuthenticated) {
   router.push({ path: '/login', query: { redirect: route.fullPath } })
   return
 }
 if (!auth.isCandidate) {
   ui.toastWarning('Chỉ dành cho ứng viên', 'Chỉ ứng viên mới có thể ứng tuyển.')
   return
 }
 showApplyModal.value = true
}

async function submitApplication(): Promise<void> {
 applying.value = true
 try {
 const result = await applicationService.apply({
 jobId: jobId.value,
 coverLetter: coverLetter.value.trim() || undefined,
 })
 if (result.error) {
   if (result.error.code === 'APPLICATION_ALREADY_EXISTS') applied.value = true
   ui.toastError('Ứng tuyển thất bại', result.error.message)
   return
 }
 applied.value = true
 showApplyModal.value = false
 coverLetter.value = ''
 ui.toastSuccess('Ứng tuyển thành công!', 'Bạn sẽ nhận được thông báo khi có cập nhật.')
 } finally {
 applying.value = false
 }
}

// ── Formatting ──
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', {
 month: 'long', day: 'numeric', year: 'numeric',
 })
}

function formatSalary(n: number | null): string {
 if (n === null) return '—'
 return n.toLocaleString('vi-VN')
}

function timeAgo(iso: string): string {
 const diff = Date.now() - new Date(iso).getTime()
 const days = Math.floor(diff / (1000 * 60 * 60 * 24))
 if (days === 0) return 'Posted today'
 if (days === 1) return 'Posted 1 day ago'
 if (days < 30) return `Posted ${days} days ago`
 const months = Math.floor(days / 30)
 return months === 1 ? 'Posted 1 month ago' : `Posted ${months} months ago`
}

function copyLink(): void {
 if (job.value?.publicLink) {
 navigator.clipboard.writeText(job.value.publicLink)
 ui.toastSuccess('Copied', 'Link copied to clipboard')
 }
}

onMounted(() => {
 loadJob()
 loadAiMatch()
 checkAlreadyApplied()
})
</script>

<template>
 <div class="min-h-screen flex flex-col bg-slate-50">
 <!-- Header -->
 <PublicNavbar />

 <!-- Loading -->
 <main v-if="loading" class="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
 <div class="animate-pulse space-y-6">
 <div class="h-10 bg-slate-200 rounded-md w-64" />
 <div class="h-4 bg-slate-200 rounded w-40" />
 <div class="h-64 bg-slate-200 rounded-xl mt-8" />
 </div>
 </main>

 <!-- Not found -->
 <main v-else-if="notFound || !job" class="flex-1 flex items-center justify-center">
 <div class="text-center py-20">
 <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-3xl mx-auto mb-4">
 🔍
 </div>
 <p class="font-bold text-slate-900 mb-2 text-lg">Job not found</p>
 <p class="text-sm font-medium text-slate-500 mb-6">This listing may have been closed or removed.</p>
 <router-link to="/jobs" class="text-teal-600 hover:text-teal-500 font-bold transition-colors">
 &larr; Browse All Jobs
 </router-link>
 </div>
 </main>

 <!-- Job Detail -->
 <main v-else class="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
 <!-- Back link -->
 <div class="mb-6">
 <router-link to="/jobs" class="inline-flex items-center gap-1.5 text-slate-500 hover:text-teal-600 :text-teal-400 font-bold transition-colors">
 &larr; Back to Jobs
 </router-link>
 </div>

 <!-- Guest nudge banner -->
 <div v-if="!auth.isAuthenticated" class="mb-8 flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-teal-50 border border-teal-200">
 <div class="flex items-center gap-3">
 <div class="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center shrink-0 text-teal-600">
 <svg class="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
 </div>
 <p class="text-sm font-semibold text-teal-800">Đăng nhập để xem mức lương, nhận gợi ý việc làm và nộp đơn ngay.</p>
 </div>
 <div class="flex items-center gap-2 shrink-0">
 <router-link to="/login" class="px-4 py-2 text-sm font-bold text-teal-700 bg-white border border-teal-300 rounded-xl hover:bg-teal-50 transition-colors shadow-sm">
 Đăng Nhập
 </router-link>
 <router-link to="/register" class="px-4 py-2 text-sm font-bold text-white bg-[#008c8c] rounded-xl hover:bg-[#007070] transition-colors shadow-sm">
 Đăng Ký
 </router-link>
 </div>
 </div>

 <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
 <!-- Main content -->
 <div class="lg:col-span-2 space-y-6">
 <!-- Title card -->
 <div class="premium-card p-8 sm:p-10">
 <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">{{ job.title }}</h1>
 <p class="text-sm font-bold text-slate-400 flex items-center gap-2 mb-8 border-b border-slate-100 pb-6">
 <svg class="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
 {{ timeAgo(job.createdAt) }}
 </p>

 <!-- Job description -->
 <div>
 <h2 class="text-xl font-extrabold text-slate-900 mb-5">Job Description</h2>
 <div class="prose prose-slate prose-lg max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">{{ job.description }}</div>
 </div>
 </div>

 <!-- Requirements -->
 <div v-if="job.requirements" class="premium-card p-8 sm:p-10">
 <h2 class="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-2">
 <span class="flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 text-teal-600 ">
 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
 </span>
 Requirements
 </h2>
 <div class="prose prose-slate prose-lg max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">{{ job.requirements }}</div>
 </div>
 </div>

 <!-- Sidebar -->
 <div class="space-y-6 lg:sticky lg:top-28 self-start">
 <!-- AI Match Score (candidate with CV only) -->
 <div v-if="aiMatchScore !== null" class="premium-card p-5 border" :class="scoreBorderClass(aiMatchScore)">
 <div class="flex items-center gap-3 mb-3">
 <div class="flex items-center justify-center w-12 h-12 rounded-full border-2 font-black text-base shrink-0"
   :class="scoreBgClass(aiMatchScore)">
   {{ aiMatchScore }}%
 </div>
 <div>
   <p class="text-xs font-extrabold uppercase tracking-wider" :class="scoreTextClass(aiMatchScore)">Độ Phù Hợp AI</p>
   <div class="flex items-center gap-1 mt-0.5">
   <span class="w-1.5 h-1.5 rounded-full" :class="scoreDotColor(aiMatchScore)"></span>
   <span class="text-xs font-bold text-slate-600">
     {{ aiMatchScore >= 70 ? 'Rất phù hợp' : aiMatchScore >= 40 ? 'Khá phù hợp' : 'Ít phù hợp' }}
   </span>
   </div>
 </div>
 </div>
 <p v-if="aiMatchReason" class="text-xs font-medium text-slate-600 leading-relaxed border-t border-slate-100 pt-3 mt-1">{{ aiMatchReason }}</p>
 </div>

 <!-- Apply CTA -->
 <div class="premium-card p-6 shadow-xl shadow-teal-900/5 border border-teal-100 ">
 <button
 v-if="!applied"
 @click="handleApplyClick"
 class="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg font-bold shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all"
 >
 Ứng Tuyển
 <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
 </button>
 <div v-else class="text-center py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
 <span class="flex flex-col items-center gap-2 text-sm text-emerald-700 font-extrabold">
 <span class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
 <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
 </span>
 Đã Ứng Tuyển
 </span>
 <p class="text-xs font-bold text-emerald-600/70 mt-2 px-4">Bạn sẽ nhận thông báo khi có cập nhật về đơn ứng tuyển.</p>
 </div>
 <p v-if="!auth.isAuthenticated" class="text-xs font-bold text-slate-400 text-center mt-4">
 Bạn sẽ được yêu cầu đăng nhập để ứng tuyển.
 </p>
 </div>

 <!-- Details card -->
 <div class="premium-card p-6 space-y-6">
 <h3 class="text-xs font-extrabold uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3 flex items-center gap-2">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
 Overview
 </h3>

 <!-- Salary -->
 <div class="flex items-start gap-3">
 <div class="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0 text-teal-600">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
 </div>
 <div>
 <span class="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 leading-tight">Monthly Salary</span>
 <template v-if="auth.isAuthenticated">
 <span class="text-sm font-extrabold text-emerald-600 mt-0.5 block">
 <template v-if="job.minSalary || job.maxSalary">
 {{ formatSalary(job.minSalary) }} – {{ formatSalary(job.maxSalary) }} {{ job.currency ?? 'VND' }}
 </template>
 <template v-else-if="job.isNegotiable">Negotiable</template>
 <template v-else>Not specified</template>
 </span>
 <span v-if="job.isNegotiable" class="text-xs font-bold text-slate-400 mt-0.5 block">(Negotiable based on experience)</span>
 </template>
 <router-link v-else to="/login" class="inline-flex items-center gap-1.5 mt-1 px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold border border-slate-200 hover:border-teal-300 hover:text-teal-600 transition-colors">
 <svg class="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
 Đăng nhập để xem
 </router-link>
 </div>
 </div>

 <!-- Deadline -->
 <div v-if="job.deadline" class="flex items-start gap-3">
 <div class="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center shrink-0 text-rose-500">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
 </div>
 <div>
 <span class="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 leading-tight">Apply Before</span>
 <span class="text-sm font-bold text-slate-900 mt-0.5 block">
 {{ formatDate(job.deadline) }}
 </span>
 </div>
 </div>

 <!-- Posted On -->
 <div class="flex items-start gap-3">
 <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-500">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
 </div>
 <div>
 <span class="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 leading-tight">Posted Date</span>
 <span class="text-sm font-bold text-slate-700 mt-0.5 block">
 {{ formatDate(job.createdAt) }}
 </span>
 </div>
 </div>
 </div>

 <!-- Share -->
 <div v-if="job.publicLink" class="premium-card p-6 border-slate-100 ">
 <h3 class="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
 Share Job
 </h3>
 <div class="relative">
 <input
 :value="job.publicLink"
 readonly
 class="w-full pl-4 pr-10 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-text outline-none focus:ring-2 focus:ring-teal-500/50 transition-all font-mono"
 @click="($event.target as HTMLInputElement).select()"
 />
 <button 
 class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-teal-600 transition-colors"
 @click="copyLink"
 title="Copy Link"
 >
 <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
 </button>
 </div>
 </div>
 </div>
 </div>
 </main>

 <!-- Footer -->
 <AppFooter />

 <!-- Apply Modal -->
 <Teleport to="body">
 <div v-if="showApplyModal" class="fixed inset-0 z-50 flex items-center justify-center">
 <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showApplyModal = false" />
 <div class="relative premium-card w-full max-w-lg p-8 animate-slide-up mx-4 shadow-2xl">
 <h2 class="text-xl font-extrabold text-slate-900 mb-2">Ứng tuyển vào <span class="text-teal-600">{{ job?.title }}</span></h2>
 <p class="text-sm font-medium text-slate-500 mb-6">
 CV mặc định của bạn sẽ được đính kèm tự động.
 </p>

 <form @submit.prevent="submitApplication" class="space-y-6">
 <div>
 <label for="cover-letter" class="block text-sm font-bold text-slate-700 mb-2">
 Thư Xin Việc <span class="text-slate-400 font-medium ml-1">(không bắt buộc)</span>
 </label>
 <textarea
 id="cover-letter"
 v-model="coverLetter"
 rows="6"
 placeholder="Viết thư xin việc ngắn gọn để giới thiệu bản thân và lý do bạn phù hợp với vị trí này…"
 class="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all resize-y"
 />
 </div>

 <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
 <button
 type="button"
 @click="showApplyModal = false"
 class="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
 >
 Hủy
 </button>
 <button
 type="submit"
 :disabled="applying"
 class="btn-primary py-2.5 px-6 flex items-center justify-center gap-2 min-w-[150px]"
 >
 <span v-if="applying" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ applying ? 'Đang gửi…' : 'Nộp Đơn Ứng Tuyển' }}
 </button>
 </div>
 </form>
 </div>
 </div>
 </Teleport>
 </div>
</template>
