<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { candidateService } from '@/services/candidateService'
import type { CandidateProfileResponse } from '@/types/candidate'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const candidate = ref<CandidateProfileResponse | null>(null)
const notFound = ref(false)

onMounted(async () => {
  const result = await candidateService.getCandidate(route.params.id as string)
  if (result.error || !result.data) {
    notFound.value = true
  } else {
    candidate.value = result.data
  }
  loading.value = false
})

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return '—'
  const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫'
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `From ${fmt(min)}`
  if (max) return `Up to ${fmt(max)}`
  return '—'
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatExperience(years: number | null): string {
  if (years === null) return '—'
  if (years === 0) return 'Fresh Graduate'
  return `${years} yr${years === 1 ? '' : 's'}`
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 pb-8 md:px-8">

    <!-- Loading -->
    <div v-if="loading" class="space-y-4 mt-6">
      <div class="h-8 bg-slate-100 rounded-lg animate-pulse w-1/2" />
      <div class="h-4 bg-slate-100 rounded animate-pulse w-1/3" />
      <div class="h-40 bg-slate-100 rounded-xl animate-pulse mt-6" />
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="text-center py-24">
      <p class="text-lg font-bold text-slate-700">Candidate not found</p>
      <p class="text-sm text-slate-400 mt-1">This profile may have been deleted or you do not have access.</p>
      <button @click="router.back()" class="mt-6 btn-secondary">← Back</button>
    </div>

    <!-- Content -->
    <div v-else-if="candidate" class="space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-slate-900">
            {{ candidate.desiredPosition ?? 'Position not specified' }}
          </h1>
          <p v-if="candidate.desiredPositionLevel" class="text-sm text-slate-500 mt-0.5">
            {{ candidate.desiredPositionLevel }}
          </p>
          <p v-if="candidate.headline" class="text-sm text-slate-600 mt-2 italic">
            "{{ candidate.headline }}"
          </p>
        </div>
        <span
          v-if="candidate.isOpenToWork"
          class="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-200"
        >
          Open to Work
        </span>
      </div>

      <!-- Summary -->
      <div v-if="candidate.summary" class="bg-slate-50 border border-slate-200/60 rounded-xl p-5">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Summary</h2>
        <p class="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{{ candidate.summary }}</p>
      </div>

      <!-- Key info grid -->
      <div class="bg-white border border-slate-200/60 rounded-xl p-5">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">General Info</h2>
        <div class="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
          <div>
            <span class="text-slate-400 text-xs">Experience</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ formatExperience(candidate.yearsOfExperience) }}</p>
          </div>
          <div>
            <span class="text-slate-400 text-xs">Work Type</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ candidate.workType ?? '—' }}</p>
          </div>
          <div>
            <span class="text-slate-400 text-xs">Education</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ candidate.educationLevel ?? '—' }}</p>
          </div>
          <div v-if="candidate.educationMajor">
            <span class="text-slate-400 text-xs">Major</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ candidate.educationMajor }}</p>
          </div>
          <div>
            <span class="text-slate-400 text-xs">Expected Salary</span>
            <p class="font-semibold text-slate-800 mt-0.5">
              {{ formatSalary(candidate.desiredSalaryMin, candidate.desiredSalaryMax) }}
            </p>
          </div>
          <div v-if="candidate.primaryLanguage">
            <span class="text-slate-400 text-xs">Language</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ candidate.primaryLanguage }}</p>
          </div>
          <div v-if="candidate.availableFrom">
            <span class="text-slate-400 text-xs">Available From</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ formatDate(candidate.availableFrom) }}</p>
          </div>
        </div>
      </div>

      <!-- Skills -->
      <div v-if="candidate.skills && candidate.skills.length > 0" class="bg-white border border-slate-200/60 rounded-xl p-5">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Skills</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in candidate.skills"
            :key="skill"
            class="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-200"
          >
            {{ skill }}
          </span>
        </div>
      </div>

      <!-- CV view -->
      <div v-if="candidate.defaultCvUrl" class="bg-white border border-slate-200/60 rounded-xl p-5">
        <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Attached CV</h2>
        <a
          :href="candidate.defaultCvUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {{ candidate.cvOriginalFilename ?? 'View CV' }}
        </a>
      </div>

      <!-- Back -->
      <div class="pt-2">
        <button @click="router.back()" class="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
          ← Back to List
        </button>
      </div>
    </div>
  </div>
</template>
