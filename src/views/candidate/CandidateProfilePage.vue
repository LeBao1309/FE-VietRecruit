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

function onSkillPaste(e: ClipboardEvent): void {
 e.preventDefault()
 const text = e.clipboardData?.getData('text') ?? ''
 const parts = text.split(',').map(s => s.trim()).filter(Boolean)
 for (const part of parts) {
 if (!form.value.skills.includes(part)) {
 form.value.skills.push(part)
 }
 }
 skillInput.value = ''
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
 <div class="max-w-4xl mx-auto px-6 py-10">
 <div class="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 class="text-3xl font-extrabold text-slate-900 mb-2">Candidate Profile</h1>
 <p class="text-sm font-medium text-slate-500">Complete your profile to get discovered by companies and access better job opportunities.</p>
 </div>
 <router-link to="/candidate/cv" class="btn-secondary flex items-center gap-2 shrink-0 border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-700 :bg-teal-900/50 transition-colors">
 <span class="text-lg">✨</span> Improve CV
 </router-link>
 </div>

 <!-- Loading -->
 <div v-if="loading" class="space-y-6">
 <div v-for="i in 3" :key="i" class="premium-card p-8 animate-pulse">
 <div class="h-4 bg-slate-200 rounded w-32 mb-6" />
 <div class="space-y-4">
 <div class="h-10 bg-slate-200 rounded" />
 <div class="h-10 bg-slate-200 rounded" />
 </div>
 </div>
 </div>

 <form v-else @submit.prevent="handleSave" class="space-y-8">
 <!-- Headline & Summary -->
 <div class="premium-card p-8 space-y-6">
 <h2 class="text-lg font-bold text-slate-900">Personal Information</h2>

 <div>
 <label for="headline" class="block text-sm font-bold text-slate-700 mb-2">Professional Headline</label>
 <input
 id="headline"
 v-model="form.headline"
 type="text"
 placeholder="e.g. Full-Stack Developer | 5 years of experience"
 class="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
 />
 </div>

 <div>
 <label for="summary" class="block text-sm font-bold text-slate-700 mb-2">Summary</label>
 <textarea
 id="summary"
 v-model="form.summary"
 rows="4"
 placeholder="A brief summary of your experience, strengths, and career goals…"
 class="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all resize-y font-medium min-h-[100px]"
 />
 </div>

 <!-- Open to work toggle -->
 <label class="inline-flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
 <div
 class="relative w-11 h-6 rounded-full transition-colors duration-200"
 :class="form.isOpenToWork ? 'bg-teal-500' : 'bg-slate-300'"
 @click.prevent="form.isOpenToWork = !form.isOpenToWork"
 >
 <div
 class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
 :class="form.isOpenToWork ? 'translate-x-5' : 'translate-x-0'"
 />
 </div>
 <div>
 <span class="block text-sm font-bold text-slate-900 leading-tight">Open to Work</span>
 <span class="block text-xs font-medium text-slate-500">Recruiters will be able to find you</span>
 </div>
 </label>
 </div>

 <!-- Skills -->
 <div class="premium-card p-8 space-y-6">
 <h2 class="text-lg font-bold text-slate-900">Experience & Skills</h2>

 <!-- Skills tag input -->
 <div>
 <label for="skills-input" class="block text-sm font-bold text-slate-700 mb-2">Skills</label>
 <div class="flex flex-wrap items-center gap-2 min-h-[48px] px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus-within:bg-white focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
 <span
 v-for="(skill, i) in form.skills"
 :key="i"
 class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-teal-50 text-teal-700 rounded-lg border border-teal-200"
 >
 {{ skill }}
 <button type="button" @click="removeSkill(i)" class="text-teal-700/50 hover:text-teal-700 transition-colors text-sm leading-none focus:outline-none">&times;</button>
 </span>
 <input
 id="skills-input"
 v-model="skillInput"
 @keydown="onSkillKeydown"
 @paste="onSkillPaste"
 @blur="addSkill"
 type="text"
 placeholder="Type a skill and press Enter, or paste comma-separated…"
 class="flex-1 min-w-[120px] text-sm font-medium outline-none bg-transparent px-2"
 />
 </div>
 <p class="text-[11px] font-medium text-slate-400 mt-2">Press Enter or comma to add. Paste "java,spring boot,mysql" to add multiple at once. Backspace removes the last tag.</p>
 </div>

 <!-- Desired Position + Level -->
 <div>
 <label for="desired-position" class="block text-sm font-bold text-slate-700 mb-2">Desired Position</label>
 <input
 id="desired-position"
 v-model="form.desiredPosition"
 type="text"
 placeholder="e.g. Frontend Developer"
 class="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
 />
 </div>

 <div>
 <p class="text-sm font-bold text-slate-700 mb-2">Desired Level</p>
 <div class="flex flex-wrap gap-2">
 <button
 v-for="level in positionLevels"
 :key="level"
 type="button"
 @click="form.desiredPositionLevel = form.desiredPositionLevel === level ? '' : level"
 :class="form.desiredPositionLevel === level
 ? 'bg-teal-500 text-white border-teal-500'
 : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'"
 class="px-3 py-1.5 text-sm font-semibold border rounded-lg transition-colors"
 >
 {{ formatLabel(level) }}
 </button>
 </div>
 </div>

 <!-- Years of Experience + Primary Language -->
 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label for="years-exp" class="block text-sm font-bold text-slate-700 mb-2">Years of Experience</label>
 <input
 id="years-exp"
 v-model="form.yearsOfExperience"
 type="text"
 inputmode="numeric"
 placeholder="e.g. 5"
 class="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
 />
 </div>
 <div>
 <p class="text-sm font-bold text-slate-700 mb-2">Primary Language</p>
 <div class="flex flex-wrap gap-2">
 <button
 v-for="lang in languages"
 :key="lang"
 type="button"
 @click="form.primaryLanguage = form.primaryLanguage === lang ? '' : lang"
 :class="form.primaryLanguage === lang
 ? 'bg-teal-500 text-white border-teal-500'
 : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'"
 class="px-3 py-1.5 text-sm font-semibold border rounded-lg transition-colors"
 >
 {{ lang }}
 </button>
 </div>
 </div>
 </div>
 </div>

 <!-- Education & Work Preferences -->
 <div class="premium-card p-8 space-y-6">
 <h2 class="text-lg font-bold text-slate-900">Education & Hiring Preferences</h2>

 <!-- Education Level -->
 <div>
 <p class="text-sm font-bold text-slate-700 mb-2">Education Level</p>
 <div class="flex flex-wrap gap-2">
 <button
 v-for="level in educationLevels"
 :key="level"
 type="button"
 @click="form.educationLevel = form.educationLevel === level ? '' : level"
 :class="form.educationLevel === level
 ? 'bg-teal-500 text-white border-teal-500'
 : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'"
 class="px-3 py-1.5 text-sm font-semibold border rounded-lg transition-colors"
 >
 {{ formatLabel(level) }}
 </button>
 </div>
 </div>

 <div>
 <label for="edu-major" class="block text-sm font-bold text-slate-700 mb-2">Major / Field of Study</label>
 <input
 id="edu-major"
 v-model="form.educationMajor"
 type="text"
 placeholder="e.g. Computer Science"
 class="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
 />
 </div>

 <!-- Work Type -->
 <div>
 <p class="text-sm font-bold text-slate-700 mb-2">Work Type</p>
 <div class="flex flex-wrap gap-2">
 <button
 v-for="t in workTypes"
 :key="t"
 type="button"
 @click="form.workType = form.workType === t ? '' : t"
 :class="form.workType === t
 ? 'bg-teal-500 text-white border-teal-500'
 : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'"
 class="px-4 py-1.5 text-sm font-semibold border rounded-lg transition-colors"
 >
 {{ formatLabel(t) }}
 </button>
 </div>
 </div>

 <div>
 <label for="available-from" class="block text-sm font-bold text-slate-700 mb-2">Expected Start Date</label>
 <input
 id="available-from"
 v-model="form.availableFrom"
 type="date"
 class="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
 />
 </div>
 </div>

 <!-- Salary Expectations -->
 <div class="premium-card p-8 space-y-6">
 <h2 class="text-lg font-bold text-slate-900">Expected Salary</h2>

 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label for="salary-min" class="block text-sm font-bold text-slate-700 mb-2">Minimum (VND)</label>
 <input
 id="salary-min"
 v-model="form.desiredSalaryMin"
 type="text"
 inputmode="numeric"
 placeholder="e.g. 15,000,000"
 class="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium tabular-nums"
 />
 </div>
 <div>
 <label for="salary-max" class="block text-sm font-bold text-slate-700 mb-2">Maximum (VND)</label>
 <input
 id="salary-max"
 v-model="form.desiredSalaryMax"
 type="text"
 inputmode="numeric"
 placeholder="e.g. 30,000,000"
 class="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 outline-none focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium tabular-nums"
 />
 </div>
 </div>
 </div>

 <!-- Submit -->
 <div class="flex justify-end pt-4">
 <button
 type="submit"
 :disabled="saving"
 class="btn-primary w-full sm:w-auto px-10 py-3 text-base flex justify-center items-center gap-2"
 >
 <span v-if="saving" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ saving ? 'Saving...' : 'Save Changes' }}
 </button>
 </div>
 </form>
 </div>
</template>
