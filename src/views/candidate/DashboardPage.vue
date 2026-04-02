<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { candidateService } from '@/services/candidateService'
import { applicationService } from '@/services/applicationService'
import type { CandidateProfileResponse } from '@/types/candidate'
import type { ApplicationSummaryResponse } from '@/types/application'
import type { JobRecommendationResponse } from '@/types/job'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(true)
const profile = ref<CandidateProfileResponse | null>(null)
const applications = ref<ApplicationSummaryResponse[]>([])
const recommendations = ref<JobRecommendationResponse[]>([])

// ── Computed ──
const profileCompletion = computed(() => {
 if (!profile.value) return 0
 const p = profile.value
 let filled = 0
 const checks = [
 p.headline, p.summary, p.desiredPosition, p.desiredPositionLevel,
 p.yearsOfExperience, p.skills?.length, p.primaryLanguage,
 p.workType, p.educationLevel, p.defaultCvUrl,
 ]
 checks.forEach((c) => { if (c) filled++ })
 return Math.round((filled / checks.length) * 100)
})

const hasCv = computed(() => !!profile.value?.defaultCvUrl)

// ── Status config ──
const statusColors: Record<string, string> = {
 NEW: 'bg-blue-50 text-blue-600 border border-blue-200 ',
 SCREENING: 'bg-amber-50 text-amber-600 border border-amber-200 ',
 INTERVIEW: 'bg-purple-50 text-purple-600 border border-purple-200 ',
 OFFER: 'bg-teal-50 text-teal-600 border border-teal-200 ',
 HIRED: 'bg-emerald-50 text-emerald-600 border border-emerald-200 ',
 REJECTED: 'bg-rose-50 text-rose-600 border border-rose-200 ',
 WITHDRAWN: 'bg-slate-100 text-slate-600 border border-slate-200 ',
}

function formatDate(iso: string): string {
 return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatStatus(s: string): string {
 return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// ── Load ──
onMounted(async () => {
 try {
 const [profileRes, appsRes, recsRes] = await Promise.all([
 candidateService.getProfile(),
 applicationService.listMyApplications({ size: 5, sort: 'createdAt,desc' }),
 candidateService.getRecommendations(5),
 ])
 if (profileRes.data) profile.value = profileRes.data
 if (appsRes.data) applications.value = appsRes.data.content
 if (recsRes.data) recommendations.value = recsRes.data
 } finally {
 loading.value = false
 }
})
</script>

<template>
 <div class="max-w-4xl mx-auto px-6 py-10">
 <!-- Header -->
 <div class="mb-8">
 <h1 class="text-3xl font-extrabold text-slate-900 mb-2">
 Welcome back, {{ auth.user?.fullName?.split(' ')[0] ?? 'Candidate' }}
 </h1>
 <p class="text-sm font-medium text-slate-500">Here's an overview of your job search activity.</p>
 </div>

 <!-- Loading -->
 <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 <div v-for="i in 3" :key="i" class="premium-card p-6 animate-pulse">
 <div class="h-3 bg-slate-200 rounded w-20 mb-4" />
 <div class="h-8 bg-slate-200 rounded w-16" />
 </div>
 </div>

 <template v-else>
 <!-- Stats -->
 <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 <div class="premium-card p-6 flex flex-col justify-between">
 <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Applications</span>
 <p class="text-4xl font-black text-slate-900 mt-2">{{ applications.length }}</p>
 </div>
 <div class="premium-card p-6 flex flex-col justify-between">
 <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recommendations</span>
 <p class="text-4xl font-black text-teal-600 mt-2">{{ recommendations.length }}</p>
 </div>
 <div class="premium-card p-6 flex flex-col justify-between">
 <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Completion</span>
 <div class="flex items-center gap-2 mt-2">
 <p class="text-4xl font-black" :class="profileCompletion >= 80 ? 'text-emerald-500' : profileCompletion >= 50 ? 'text-amber-500' : 'text-rose-500'">
 {{ profileCompletion }}%
 </p>
 </div>
 </div>
 </div>

 <!-- Profile completion CTA -->
 <div v-if="profileCompletion < 80" class="premium-card bg-teal-50 border-teal-200 p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <p class="text-base font-bold text-slate-900 mb-1">Complete your profile</p>
 <p class="text-sm font-medium text-slate-500">
 {{ !hasCv ? 'Upload your CV and fill in your details' : 'Fill in more details' }} to get better job matches.
 </p>
 </div>
 <div class="flex gap-3 shrink-0">
 <router-link
 v-if="!hasCv"
 to="/candidate/cv"
 class="btn-primary py-2"
 >
 Upload CV
 </router-link>
 <router-link
 to="/candidate/candidate-profile"
 class="btn-secondary py-2"
 >
 Edit Profile
 </router-link>
 </div>
 </div>

 <!-- Two-column layout -->
 <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
 <!-- Recent Applications -->
 <div class="premium-card flex flex-col">
 <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
 <h2 class="text-base font-bold text-slate-900 ">Recent Applications</h2>
 <router-link to="/candidate/applications" class="text-xs font-bold text-teal-600 hover:text-teal-700 :text-teal-300 transition-colors">
 View All &rarr;
 </router-link>
 </div>
 <div v-if="applications.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
 <span class="text-4xl mb-3 opacity-50">📋</span>
 <p class="text-sm font-medium text-slate-500 mb-4">No applications yet.</p>
 <router-link to="/jobs" class="btn-primary py-2">
 Browse Jobs
 </router-link>
 </div>
 <div v-else class="flex-1">
 <div
 v-for="app in applications"
 :key="app.id"
 @click="router.push(`/candidate/applications/${app.id}`)"
 class="group px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 :bg-slate-800/50 transition-colors cursor-pointer"
 >
 <div class="flex items-center justify-between">
 <div class="min-w-0 pr-4">
 <p class="text-sm font-bold text-slate-900 truncate group-hover:text-teal-600 :text-teal-400 transition-colors">{{ app.jobTitle }}</p>
 <p class="text-xs font-medium text-slate-400 mt-1">{{ formatDate(app.createdAt) }}</p>
 </div>
 <span
 class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0"
 :class="statusColors[app.status] ?? 'bg-slate-100 text-slate-500 '"
 >
 {{ formatStatus(app.status) }}
 </span>
 </div>
 </div>
 </div>
 </div>

 <!-- Top Recommendations -->
 <div class="premium-card flex flex-col">
 <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
 <h2 class="text-base font-bold text-slate-900 ">Top Matches</h2>
 <router-link to="/candidate/recommendations" class="text-xs font-bold text-teal-600 hover:text-teal-700 :text-teal-300 transition-colors">
 View All &rarr;
 </router-link>
 </div>
 <div v-if="recommendations.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
 <span class="text-4xl mb-3 opacity-50">✨</span>
 <p class="text-sm font-medium text-slate-500">Complete your profile to see recommendations.</p>
 </div>
 <div v-else class="flex-1">
 <div
 v-for="rec in recommendations"
 :key="rec.jobId"
 @click="router.push(`/jobs/${rec.jobId}`)"
 class="group px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 :bg-slate-800/50 transition-colors cursor-pointer"
 >
 <div class="flex items-center justify-between">
 <div class="min-w-0 pr-4">
 <p class="text-sm font-bold text-slate-900 truncate group-hover:text-teal-600 :text-teal-400 transition-colors">{{ rec.title }}</p>
 <p class="text-xs font-medium text-slate-400 mt-1">{{ rec.companyName }}</p>
 </div>
 <span class="text-sm font-black shrink-0" :class="rec.matchScore >= 70 ? 'text-emerald-500' : 'text-teal-500'">
 {{ rec.matchScore }}%
 </span>
 </div>
 </div>
 </div>
 </div>
 </div>

 <!-- Quick Actions -->
 <div class="premium-card p-6">
 <h2 class="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
 <div class="flex items-center gap-3 flex-wrap">
 <router-link to="/jobs" class="btn-primary py-2 px-6">
 Browse Jobs
 </router-link>
 <router-link to="/candidate/cv" class="btn-secondary py-2 px-6">
 Manage CV
 </router-link>
 <router-link to="/candidate/salary-benchmark" class="btn-secondary py-2 px-6 bg-slate-50 hover:bg-slate-100 :bg-slate-700">
 Salary Benchmark
 </router-link>
 </div>
 </div>
 </template>
 </div>
</template>
