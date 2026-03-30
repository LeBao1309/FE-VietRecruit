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
  SUBMITTED: 'bg-info-bg text-info',
  UNDER_REVIEW: 'bg-warning-bg text-warning',
  SHORTLISTED: 'bg-primary-bg text-primary',
  INTERVIEW_SCHEDULED: 'bg-primary-bg text-primary',
  OFFERED: 'bg-success-bg text-success',
  HIRED: 'bg-success-bg text-success',
  REJECTED: 'bg-error-bg text-error',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
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
  <div class="max-w-4xl mx-auto px-6 py-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900">
        Welcome back, {{ auth.user?.fullName?.split(' ')[0] ?? 'Candidate' }}
      </h1>
      <p class="text-sm text-gray-500 mt-1">Here's an overview of your job search activity.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-3 gap-4 mb-6">
      <div v-for="i in 3" :key="i" class="bg-surface border border-border rounded-lg p-5 shadow-sm animate-pulse">
        <div class="h-3 bg-gray-100 rounded w-20 mb-3" />
        <div class="h-6 bg-gray-100 rounded w-12" />
      </div>
    </div>

    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-surface border border-border rounded-lg p-5 shadow-sm">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Applications</span>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ applications.length }}</p>
        </div>
        <div class="bg-surface border border-border rounded-lg p-5 shadow-sm">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Recommendations</span>
          <p class="text-2xl font-bold text-primary mt-1">{{ recommendations.length }}</p>
        </div>
        <div class="bg-surface border border-border rounded-lg p-5 shadow-sm">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Profile</span>
          <div class="flex items-center gap-2 mt-1">
            <p class="text-2xl font-bold" :class="profileCompletion >= 80 ? 'text-success' : profileCompletion >= 50 ? 'text-warning' : 'text-error'">
              {{ profileCompletion }}%
            </p>
          </div>
        </div>
      </div>

      <!-- Profile completion CTA -->
      <div v-if="profileCompletion < 80" class="bg-primary-bg/50 border border-primary/10 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-900">Complete your profile</p>
          <p class="text-xs text-gray-500">
            {{ !hasCv ? 'Upload your CV and fill in your details' : 'Fill in more details' }} to get better job matches.
          </p>
        </div>
        <div class="flex gap-2 shrink-0 ml-4">
          <router-link
            v-if="!hasCv"
            to="/candidate/cv"
            class="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition"
          >
            Upload CV
          </router-link>
          <router-link
            to="/candidate/candidate-profile"
            class="px-3 py-1.5 text-xs font-medium text-primary bg-surface border border-primary/20 rounded-md hover:bg-primary-light transition"
          >
            Edit Profile
          </router-link>
        </div>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Recent Applications -->
        <div class="bg-surface border border-border rounded-lg shadow-sm">
          <div class="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900">Recent Applications</h2>
            <router-link to="/candidate/applications" class="text-xs text-primary hover:text-primary-hover font-medium transition">
              View All →
            </router-link>
          </div>
          <div v-if="applications.length === 0" class="px-5 py-8 text-center">
            <p class="text-xs text-gray-400">No applications yet.</p>
            <router-link to="/jobs" class="text-xs text-primary hover:text-primary-hover font-medium mt-1 inline-block transition">
              Browse Jobs →
            </router-link>
          </div>
          <div v-else>
            <div
              v-for="app in applications"
              :key="app.id"
              class="px-5 py-3 border-b border-border last:border-0 hover:bg-gray-50/50 transition"
            >
              <div class="flex items-center justify-between">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ app.jobTitle }}</p>
                  <p class="text-[10px] text-gray-400">{{ formatDate(app.createdAt) }}</p>
                </div>
                <span
                  class="px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0 ml-2"
                  :class="statusColors[app.status] ?? 'bg-gray-100 text-gray-500'"
                >
                  {{ formatStatus(app.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Recommendations -->
        <div class="bg-surface border border-border rounded-lg shadow-sm">
          <div class="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900">Top Matches</h2>
            <router-link to="/candidate/recommendations" class="text-xs text-primary hover:text-primary-hover font-medium transition">
              View All →
            </router-link>
          </div>
          <div v-if="recommendations.length === 0" class="px-5 py-8 text-center">
            <p class="text-xs text-gray-400">Complete your profile to see recommendations.</p>
          </div>
          <div v-else>
            <div
              v-for="rec in recommendations"
              :key="rec.jobId"
              @click="router.push(`/jobs/${rec.jobId}`)"
              class="px-5 py-3 border-b border-border last:border-0 hover:bg-gray-50/50 transition cursor-pointer"
            >
              <div class="flex items-center justify-between">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ rec.title }}</p>
                  <p class="text-[10px] text-gray-400">{{ rec.companyName }}</p>
                </div>
                <span class="text-xs font-bold shrink-0 ml-2" :class="rec.matchScore >= 70 ? 'text-success' : 'text-primary'">
                  {{ rec.matchScore }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-6 bg-surface border border-border rounded-lg p-5 shadow-sm">
        <h2 class="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div class="flex items-center gap-3 flex-wrap">
          <router-link to="/jobs" class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition">
            Browse Jobs
          </router-link>
          <router-link to="/candidate/cv" class="px-4 py-2 text-sm font-medium text-primary bg-primary-bg hover:bg-primary-light rounded-md transition border border-primary/10">
            Manage CV
          </router-link>
          <router-link to="/candidate/salary-benchmark" class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition">
            Salary Benchmark
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>
