<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { candidateService } from '@/services/candidateService'
import type { CandidateProfileResponse, CandidateUpdateRequest } from '@/types/candidate'

const ui = useUiStore()

// ── State ──
const loading = ref(true)
const saving = ref(false)
const profile = ref<CandidateProfileResponse | null>(null)

// ── Form ──
const form = ref<{
  headline: string
  summary: string
  desiredPosition: string
  desiredPositionLevel: string
  yearsOfExperience: string
  skills: string[]
  primaryLanguage: string
  workType: string
  desiredSalaryMin: string
  desiredSalaryMax: string
  availableFrom: string
  educationLevel: string
  educationMajor: string
  isOpenToWork: boolean
}>({
  headline: '',
  summary: '',
  desiredPosition: '',
  desiredPositionLevel: '',
  yearsOfExperience: '',
  skills: [],
  primaryLanguage: '',
  workType: '',
  desiredSalaryMin: '',
  desiredSalaryMax: '',
  availableFrom: '',
  educationLevel: '',
  educationMajor: '',
  isOpenToWork: true,
})

// ── Skills tag input ──
const skillInput = ref('')

function addSkill(): void {
  const val = skillInput.value.trim()
  if (val && !form.value.skills.includes(val)) {
    form.value.skills.push(val)
  }
  skillInput.value = ''
}

function removeSkill(index: number): void {
  form.value.skills.splice(index, 1)
}

function onSkillKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault()
    addSkill()
  }
  if (e.key === 'Backspace' && !skillInput.value && form.value.skills.length > 0) {
    form.value.skills.pop()
  }
}

// ── Dropdown options ──
const positionLevels = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR', 'VP', 'C_LEVEL']
const workTypes = ['REMOTE', 'ONSITE', 'HYBRID']
const educationLevels = ['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'OTHER']
const languages = ['Vietnamese', 'English', 'Japanese', 'Korean', 'Chinese', 'French', 'German', 'Other']

// ── Load ──
async function loadProfile(): Promise<void> {
  loading.value = true
  try {
    const result = await candidateService.getProfile()
    if (result.data) {
      profile.value = result.data
      const p = result.data
      form.value = {
        headline: p.headline ?? '',
        summary: p.summary ?? '',
        desiredPosition: p.desiredPosition ?? '',
        desiredPositionLevel: p.desiredPositionLevel ?? '',
        yearsOfExperience: p.yearsOfExperience?.toString() ?? '',
        skills: p.skills ?? [],
        primaryLanguage: p.primaryLanguage ?? '',
        workType: p.workType ?? '',
        desiredSalaryMin: p.desiredSalaryMin?.toString() ?? '',
        desiredSalaryMax: p.desiredSalaryMax?.toString() ?? '',
        availableFrom: p.availableFrom?.split('T')[0] ?? '',
        educationLevel: p.educationLevel ?? '',
        educationMajor: p.educationMajor ?? '',
        isOpenToWork: p.isOpenToWork,
      }
    } else {
      ui.toastError('Profile error', result.error?.message)
    }
  } finally {
    loading.value = false
  }
}

// ── Save ──
async function handleSave(): Promise<void> {
  saving.value = true
  try {
    const payload: CandidateUpdateRequest = {
      headline: form.value.headline.trim() || undefined,
      summary: form.value.summary.trim() || undefined,
      desiredPosition: form.value.desiredPosition.trim() || undefined,
      desiredPositionLevel: form.value.desiredPositionLevel || undefined,
      yearsOfExperience: form.value.yearsOfExperience ? Number(form.value.yearsOfExperience) : undefined,
      skills: form.value.skills.length > 0 ? form.value.skills : undefined,
      primaryLanguage: form.value.primaryLanguage || undefined,
      workType: form.value.workType || undefined,
      desiredSalaryMin: form.value.desiredSalaryMin ? Number(form.value.desiredSalaryMin) : undefined,
      desiredSalaryMax: form.value.desiredSalaryMax ? Number(form.value.desiredSalaryMax) : undefined,
      availableFrom: form.value.availableFrom || undefined,
      educationLevel: form.value.educationLevel || undefined,
      educationMajor: form.value.educationMajor.trim() || undefined,
      isOpenToWork: form.value.isOpenToWork,
    }

    const result = await candidateService.updateProfile(payload)
    if (result.data) {
      profile.value = result.data
      ui.toastSuccess('Profile updated', 'Your changes have been saved.')
    } else {
      ui.toastError('Update failed', result.error?.message)
    }
  } finally {
    saving.value = false
  }
}

function formatLabel(val: string): string {
  return val.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

onMounted(loadProfile)
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-8">
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900">Candidate Profile</h1>
      <p class="text-sm text-gray-500 mt-1">Complete your profile to get better job matches and visibility to employers.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="bg-surface border border-border rounded-lg p-6 shadow-sm animate-pulse">
        <div class="h-4 bg-gray-100 rounded w-32 mb-4" />
        <div class="space-y-3">
          <div class="h-10 bg-gray-100 rounded" />
          <div class="h-10 bg-gray-100 rounded" />
        </div>
      </div>
    </div>

    <form v-else @submit.prevent="handleSave" class="space-y-6">
      <!-- Headline & Summary -->
      <div class="bg-surface border border-border rounded-lg p-5 shadow-sm space-y-5">
        <h2 class="text-sm font-semibold text-gray-900">About You</h2>

        <div>
          <label for="headline" class="block text-sm font-medium text-gray-700 mb-1">Headline</label>
          <input
            id="headline"
            v-model="form.headline"
            type="text"
            placeholder="e.g. Full-Stack Developer | 5 years experience"
            class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
          />
        </div>

        <div>
          <label for="summary" class="block text-sm font-medium text-gray-700 mb-1">Summary</label>
          <textarea
            id="summary"
            v-model="form.summary"
            rows="4"
            placeholder="A brief overview of your experience, strengths, and career goals…"
            class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition resize-y"
          />
        </div>

        <!-- Open to work toggle -->
        <label class="flex items-center gap-2.5 cursor-pointer">
          <div
            class="relative w-10 h-5 rounded-full transition-colors duration-200"
            :class="form.isOpenToWork ? 'bg-primary' : 'bg-gray-300'"
            @click="form.isOpenToWork = !form.isOpenToWork"
          >
            <div
              class="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
              :class="form.isOpenToWork ? 'translate-x-5' : 'translate-x-0.5'"
            />
          </div>
          <span class="text-sm text-gray-700">Open to work</span>
          <span class="text-xs text-gray-400">— Employers can find you in search</span>
        </label>
      </div>

      <!-- Skills -->
      <div class="bg-surface border border-border rounded-lg p-5 shadow-sm space-y-5">
        <h2 class="text-sm font-semibold text-gray-900">Skills & Experience</h2>

        <div>
          <label for="skills-input" class="block text-sm font-medium text-gray-700 mb-1">Skills</label>
          <div class="flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 border border-border rounded-md focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-light transition">
            <span
              v-for="(skill, i) in form.skills"
              :key="i"
              class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary-bg text-primary rounded-full"
            >
              {{ skill }}
              <button type="button" @click="removeSkill(i)" class="text-primary/60 hover:text-primary transition text-xs leading-none">✕</button>
            </span>
            <input
              id="skills-input"
              v-model="skillInput"
              @keydown="onSkillKeydown"
              @blur="addSkill"
              type="text"
              placeholder="Type a skill and press Enter…"
              class="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
            />
          </div>
          <p class="text-[10px] text-gray-400 mt-1">Press Enter or comma to add. Backspace to remove the last one.</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="desired-position" class="block text-sm font-medium text-gray-700 mb-1">Desired Position</label>
            <input
              id="desired-position"
              v-model="form.desiredPosition"
              type="text"
              placeholder="e.g. Frontend Developer"
              class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
            />
          </div>
          <div>
            <label for="position-level" class="block text-sm font-medium text-gray-700 mb-1">Position Level</label>
            <select
              id="position-level"
              v-model="form.desiredPositionLevel"
              class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
            >
              <option value="">— Select —</option>
              <option v-for="level in positionLevels" :key="level" :value="level">{{ formatLabel(level) }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="years-exp" class="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            <input
              id="years-exp"
              v-model="form.yearsOfExperience"
              type="text"
              inputmode="numeric"
              placeholder="e.g. 5"
              class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
            />
          </div>
          <div>
            <label for="primary-lang" class="block text-sm font-medium text-gray-700 mb-1">Primary Language</label>
            <select
              id="primary-lang"
              v-model="form.primaryLanguage"
              class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
            >
              <option value="">— Select —</option>
              <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Education & Work Preferences -->
      <div class="bg-surface border border-border rounded-lg p-5 shadow-sm space-y-5">
        <h2 class="text-sm font-semibold text-gray-900">Education & Preferences</h2>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="edu-level" class="block text-sm font-medium text-gray-700 mb-1">Education Level</label>
            <select
              id="edu-level"
              v-model="form.educationLevel"
              class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
            >
              <option value="">— Select —</option>
              <option v-for="level in educationLevels" :key="level" :value="level">{{ formatLabel(level) }}</option>
            </select>
          </div>
          <div>
            <label for="edu-major" class="block text-sm font-medium text-gray-700 mb-1">Major / Field</label>
            <input
              id="edu-major"
              v-model="form.educationMajor"
              type="text"
              placeholder="e.g. Computer Science"
              class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="work-type" class="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
            <select
              id="work-type"
              v-model="form.workType"
              class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
            >
              <option value="">— Select —</option>
              <option v-for="t in workTypes" :key="t" :value="t">{{ formatLabel(t) }}</option>
            </select>
          </div>
          <div>
            <label for="available-from" class="block text-sm font-medium text-gray-700 mb-1">Available From</label>
            <input
              id="available-from"
              v-model="form.availableFrom"
              type="date"
              class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
            />
          </div>
        </div>
      </div>

      <!-- Salary Expectations -->
      <div class="bg-surface border border-border rounded-lg p-5 shadow-sm space-y-5">
        <h2 class="text-sm font-semibold text-gray-900">Salary Expectations</h2>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="salary-min" class="block text-sm font-medium text-gray-700 mb-1">Minimum (VND)</label>
            <input
              id="salary-min"
              v-model="form.desiredSalaryMin"
              type="text"
              inputmode="numeric"
              placeholder="e.g. 15000000"
              class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
            />
          </div>
          <div>
            <label for="salary-max" class="block text-sm font-medium text-gray-700 mb-1">Maximum (VND)</label>
            <input
              id="salary-max"
              v-model="form.desiredSalaryMax"
              type="text"
              inputmode="numeric"
              placeholder="e.g. 30000000"
              class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
            />
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="saving" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {{ saving ? 'Saving…' : 'Save Profile' }}
        </button>
      </div>
    </form>
  </div>
</template>
