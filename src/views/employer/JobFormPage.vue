<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/uiStore'
import { jobService } from '@/services/jobService'
import { departmentService, locationService, categoryService } from '@/services/organizationService'
import type { JobCreateRequest, JobUpdateRequest, JobResponse } from '@/types/job'
import type { JdGenerateRequest, JdGenerateResponse } from '@/types/ai'
import type { DepartmentResponse, LocationResponse, CategoryResponse } from '@/types/organization'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

// ── Mode ──
const jobId = computed(() => route.params.id as string | undefined)
const isEditMode = computed(() => !!jobId.value)
const pageTitle = computed(() => isEditMode.value ? 'Edit Job Listing' : 'Create New Job Listing')

// ── State ──
const loading = ref(false)
const saving = ref(false)
const existingJob = ref<JobResponse | null>(null)

// ── Organization data ──
const departments = ref<DepartmentResponse[]>([])
const locations = ref<LocationResponse[]>([])
const categories = ref<CategoryResponse[]>([])

// ── Form fields ──
const form = ref<{
 title: string
 description: string
 requirements: string
 departmentId: string
 locationId: string
 categoryId: string
 minSalary: string
 maxSalary: string
 currency: string
 isNegotiable: boolean
 deadline: string
}>({
 title: '',
 description: '',
 requirements: '',
 departmentId: '',
 locationId: '',
 categoryId: '',
 minSalary: '',
 maxSalary: '',
 currency: 'VND',
 isNegotiable: false,
 deadline: '',
})

const errors = ref<Record<string, string>>({})

// ── AI JD Generator ──
const showAiPanel = ref(false)
const aiGenerating = ref(false)
const aiApplying = ref(false)
const aiResult = ref<JdGenerateResponse | null>(null)

const aiForm = ref<{
 employmentType: string
 keyResponsibilities: string
 requiredSkills: string
 niceToHaveSkills: string
 yearsOfExperience: string
 tone: 'PROFESSIONAL' | 'STARTUP' | 'CORPORATE'
}>({
 employmentType: 'FULL_TIME',
 keyResponsibilities: '',
 requiredSkills: '',
 niceToHaveSkills: '',
 yearsOfExperience: '',
 tone: 'PROFESSIONAL',
})

// ── Load organization data ──
async function loadOrgData(): Promise<void> {
 try {
   const [depts, locs, cats] = await Promise.all([
   departmentService.list(),
   locationService.list(),
   categoryService.list(),
   ])
   if (depts.data) departments.value = depts.data.content ?? []
   if (locs.data) locations.value = locs.data.content ?? []
   if (cats.data) categories.value = cats.data.content ?? []
 } catch {
   // Non-critical — dropdowns stay empty, form is still usable
 }
}

// ── Load existing job (edit mode) ──
async function loadJob(): Promise<void> {
 if (!jobId.value) return
 loading.value = true
 try {
 const result = await jobService.getJob(jobId.value)
 if (result.data) {
 existingJob.value = result.data
 const j = result.data

 // Only DRAFT can be edited
 if (j.status !== 'DRAFT') {
 ui.toastWarning('Cannot Edit', 'Only job listings in Draft status may be edited.')
 router.push(`/employer/jobs/${jobId.value}`)
 return
 }

 form.value = {
 title: j.title ?? '',
 description: j.description ?? '',
 requirements: j.requirements ?? '',
 departmentId: j.departmentId ?? '',
 locationId: j.locationId ?? '',
 categoryId: j.categoryId ?? '',
 minSalary: j.minSalary?.toString() ?? '',
 maxSalary: j.maxSalary?.toString() ?? '',
 currency: j.currency ?? 'VND',
 isNegotiable: j.isNegotiable ?? false,
 deadline: j.deadline?.split('T')[0] ?? '',
 }
 } else {
 ui.toastError('Job Listing Not Found', result.error?.message)
 router.push('/employer/jobs')
 }
 } catch {
 ui.toastError('An Error Occurred', 'Unable to load job information. Please try again.')
 router.push('/employer/jobs')
 } finally {
 loading.value = false
 }
}

// ── Validation ──
function validate(): boolean {
 errors.value = {}

 if (!form.value.title.trim()) {
 errors.value.title = 'Please enter a position title.'
 } else if (form.value.title.length > 255) {
 errors.value.title = 'Position title must be fewer than 255 characters.'
 }

 if (!form.value.description.trim()) {
 errors.value.description = 'Please provide a job description.'
 } else if (form.value.description.length > 50000) {
 errors.value.description = 'Description is too long (maximum 50,000 characters).'
 }

 if (form.value.requirements.length > 50000) {
 errors.value.requirements = 'Requirements section is too long (maximum 50,000 characters).'
 }

 const minSal = form.value.minSalary ? Number(form.value.minSalary) : null
 const maxSal = form.value.maxSalary ? Number(form.value.maxSalary) : null
 if (minSal !== null && isNaN(minSal)) errors.value.minSalary = 'Must be a numeric value.'
 if (maxSal !== null && isNaN(maxSal)) errors.value.maxSalary = 'Must be a numeric value.'
 if (minSal !== null && maxSal !== null && minSal > maxSal) {
 errors.value.minSalary = 'Minimum salary cannot exceed maximum salary.'
 }

 return Object.keys(errors.value).length === 0
}

// ── Save ──
async function handleSave(): Promise<void> {
 if (!validate()) return

 saving.value = true
 try {
 const payload: JobCreateRequest | JobUpdateRequest = {
 title: form.value.title.trim(),
 description: form.value.description.trim(),
 requirements: form.value.requirements.trim() || undefined,
 departmentId: form.value.departmentId || undefined,
 locationId: form.value.locationId || undefined,
 categoryId: form.value.categoryId || undefined,
 minSalary: form.value.minSalary ? Number(form.value.minSalary) : undefined,
 maxSalary: form.value.maxSalary ? Number(form.value.maxSalary) : undefined,
 currency: form.value.currency || undefined,
 isNegotiable: form.value.isNegotiable,
 deadline: form.value.deadline || undefined,
 }

 if (isEditMode.value) {
 const result = await jobService.updateJob(jobId.value!, payload)
 if (result.error) {
 ui.toastError('Error Updating Job Listing', result.error.message)
 return
 }
 ui.toastSuccess('Updated Successfully')
 router.push(`/employer/jobs/${jobId.value}`)
 } else {
 const result = await jobService.createJob(payload as JobCreateRequest)
 if (result.error) {
 ui.toastError('Error Creating Job Listing', result.error.message)
 return
 }
 ui.toastSuccess('Created Successfully', 'The new job listing has been saved as a draft.')
 router.push(`/employer/jobs/${result.data!.id}`)
 }
 } finally {
 saving.value = false
 }
}

// ── AI JD Generation ──
function splitLines(text: string): string[] {
 return text.split('\n').map((l) => l.trim()).filter(Boolean)
}

async function generateJd(): Promise<void> {
 if (!form.value.title.trim()) {
 ui.toastWarning('Title Required', 'Please enter a position title before requesting AI analysis.')
 return
 }

 aiGenerating.value = true
 try {
 const body: JdGenerateRequest = {
 title: form.value.title.trim(),
 departmentId: form.value.departmentId || undefined,
 employmentType: aiForm.value.employmentType,
 keyResponsibilities: splitLines(aiForm.value.keyResponsibilities),
 requiredSkills: splitLines(aiForm.value.requiredSkills),
 niceToHaveSkills: splitLines(aiForm.value.niceToHaveSkills) ?? undefined,
 yearsOfExperience: aiForm.value.yearsOfExperience ? Number(aiForm.value.yearsOfExperience) : undefined,
 tone: aiForm.value.tone,
 }
 const result = await jobService.generateDescription(body)
 if (result.data) {
 aiResult.value = result.data
 ui.toastSuccess('Generation Complete', 'Please review the draft content generated by AI.')
 } else {
 ui.toastError('AI Error', result.error?.message)
 }
 } finally {
 aiGenerating.value = false
 }
}

function applyAiResult(): void {
 if (!aiResult.value) return
 const desc = aiResult.value.generatedDescription
 const sections = [
 `## Overview\n${desc.overview}`,
 `## Position Responsibilities\n${desc.responsibilities.map((r) => `- ${r}`).join('\n')}`,
 `## Skills / Requirements\n${desc.requirements.map((r) => `- ${r}`).join('\n')}`,
 desc.niceToHave.length > 0 ? `## Additional Requirements (Preferred)\n${desc.niceToHave.map((r) => `- ${r}`).join('\n')}` : '',
 desc.benefits ? `## Benefits & Compensation\n${desc.benefits}` : '',
 ].filter(Boolean)

 form.value.description = sections.join('\n\n')

 // Also apply to the backend if editing
 if (isEditMode.value && jobId.value) {
 aiApplying.value = true
 jobService.applyDescription(jobId.value, { generatedDescription: desc }).then((res) => {
 if (res.error) ui.toastWarning('Sync Save Failed', 'Content inserted successfully but could not be persisted to the server.')
 }).finally(() => { aiApplying.value = false })
 }

 aiResult.value = null
 showAiPanel.value = false
 ui.toastSuccess('Applied', 'The AI-generated description has been applied to the text field successfully.')
}

onMounted(async () => {
 await loadOrgData()
 if (isEditMode.value) {
 await loadJob()
 }
})
</script>

<template>
 <div class="max-w-4xl mx-auto px-6 pb-8">
 <!-- Header -->
 <div class="flex items-center gap-3 mb-6">
 <button @click="router.back()" class="text-gray-400 hover:text-gray-600 transition text-sm">
 ‹ Back
 </button>
 <h1 class="text-xl font-bold text-gray-900">{{ pageTitle }}</h1>
 </div>

 <!-- Loading -->
 <div v-if="loading" class="premium-card p-6 animate-pulse space-y-4">
 <div class="h-10 bg-slate-100 rounded-xl" />
 <div class="h-40 bg-slate-100 rounded-xl" />
 <div class="h-10 bg-slate-100 rounded-xl" />
 </div>

 <!-- Form -->
 <form v-else @submit.prevent="handleSave" class="space-y-6">
 <!-- Title -->
 <div class="premium-card p-6 space-y-5">
 <h2 class="text-sm font-semibold text-gray-900 mb-4">Basic Information</h2>

 <div>
 <label for="job-title" class="block text-sm font-medium text-gray-700 mb-1">
 Position Title <span class="text-error">*</span>
 </label>
 <input
 id="job-title"
 v-model="form.title"
 type="text"
 placeholder="E.g., Senior Front-End Developer"
 class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
 :class="errors.title ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <p v-if="errors.title" class="text-xs text-error mt-1">{{ errors.title }}</p>
 </div>

 <!-- Organization selects -->
 <div class="grid grid-cols-3 gap-4">
 <div>
 <label for="job-dept" class="block text-sm font-medium text-gray-700 mb-1">Department</label>
 <select
 id="job-dept"
 v-model="form.departmentId"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 >
 <option value="">— None —</option>
 <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
 </select>
 </div>
 <div>
 <label for="job-loc" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
 <select
 id="job-loc"
 v-model="form.locationId"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 >
 <option value="">— None —</option>
 <option v-for="l in locations" :key="l.id" :value="l.id">{{ l.name }}</option>
 </select>
 </div>
 <div>
 <label for="job-cat" class="block text-sm font-medium text-gray-700 mb-1">Recruitment Domain</label>
 <select
 id="job-cat"
 v-model="form.categoryId"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 >
 <option value="">— None —</option>
 <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
 </select>
 </div>
 </div>

 <div>
 <label for="job-deadline" class="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
 <input
 id="job-deadline"
 v-model="form.deadline"
 type="date"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 />
 </div>
 </div>

 <!-- Salary -->
 <div class="premium-card p-6 space-y-5">
 <h2 class="text-sm font-semibold text-gray-900 mb-4">Compensation</h2>

 <div class="grid grid-cols-3 gap-4">
 <div>
 <label for="job-min-sal" class="block text-sm font-medium text-gray-700 mb-1">Minimum Salary</label>
 <input
 id="job-min-sal"
 v-model="form.minSalary"
 type="text"
 inputmode="numeric"
 placeholder="VD: 15000000"
 class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
 :class="errors.minSalary ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <p v-if="errors.minSalary" class="text-xs text-error mt-1">{{ errors.minSalary }}</p>
 </div>
 <div>
 <label for="job-max-sal" class="block text-sm font-medium text-gray-700 mb-1">Maximum Salary</label>
 <input
 id="job-max-sal"
 v-model="form.maxSalary"
 type="text"
 inputmode="numeric"
 placeholder="VD: 30000000"
 class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
 :class="errors.maxSalary ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <p v-if="errors.maxSalary" class="text-xs text-error mt-1">{{ errors.maxSalary }}</p>
 </div>
 <div>
 <label for="job-currency" class="block text-sm font-medium text-gray-700 mb-1">Currency</label>
 <select
 id="job-currency"
 v-model="form.currency"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 >
 <option value="VND">VND</option>
 <option value="USD">USD</option>
 <option value="EUR">EUR</option>
 </select>
 </div>
 </div>

 <label class="flex items-center gap-2 cursor-pointer">
 <input
 v-model="form.isNegotiable"
 type="checkbox"
 class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
 />
 <span class="text-sm text-gray-700">Salary is negotiable.</span>
 </label>
 </div>

 <!-- Description -->
 <div class="premium-card p-6 space-y-5">
 <div class="flex items-center justify-between mb-4">
 <h2 class="text-sm font-semibold text-gray-900">Detailed Content</h2>
 <button
 type="button"
 @click="showAiPanel = !showAiPanel"
 class="transition flex items-center gap-1.5"
 :class="showAiPanel
 ? 'btn-primary'
 : 'btn-secondary text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200'"
 >
 ✦ AI Auto-Generate
 </button>
 </div>

 <!-- AI Panel (collapsible) -->
 <div v-if="showAiPanel" class="bg-slate-900 rounded-2xl p-6 space-y-5 shadow-inner border border-slate-800 animate-slide-up text-white">
 <p class="text-sm text-slate-400">
 Provide a few key details and AI will automatically write a professional job listing.
 The position information above will be pre-loaded into the process.
 </p>

 <div class="grid grid-cols-2 gap-4">
 <div>
 <label class="block text-xs font-semibold text-slate-400 mb-1">Employment Type</label>
 <select v-model="aiForm.employmentType" class="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:border-teal-500 transition">
 <option value="FULL_TIME">Full-Time</option>
 <option value="PART_TIME">Part-Time</option>
 <option value="CONTRACT">Contract</option>
 <option value="INTERNSHIP">Internship</option>
 </select>
 </div>
 <div>
 <label class="block text-xs font-semibold text-slate-400 mb-1">Tone & Culture</label>
 <select v-model="aiForm.tone" class="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:border-teal-500 transition">
 <option value="PROFESSIONAL">Professional</option>
 <option value="STARTUP">Startup / Dynamic</option>
 <option value="CORPORATE">Corporate</option>
 </select>
 </div>
 </div>

 <div>
 <label class="block text-xs font-semibold text-slate-400 mb-1">Key Responsibilities (one per line)</label>
 <textarea
 v-model="aiForm.keyResponsibilities"
 rows="3"
 placeholder="Develop web interfaces&#10;Coordinate with the Back-End team&#10;Write test cases"
 class="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:border-teal-500 transition resize-none placeholder-slate-500"
 />
 </div>

 <div>
 <label class="block text-xs font-semibold text-slate-400 mb-1">Required Skills (one per line)</label>
 <textarea
 v-model="aiForm.requiredSkills"
 rows="3"
 placeholder="Vue.js / React&#10;TypeScript&#10;REST API integration"
 class="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:border-teal-500 transition resize-none placeholder-slate-500"
 />
 </div>

 <div class="grid grid-cols-2 gap-4">
 <div>
 <label class="block text-xs font-semibold text-slate-400 mb-1">Additional Preferred Skills (one per line)</label>
 <textarea
 v-model="aiForm.niceToHaveSkills"
 rows="2"
 placeholder="Docker&#10;CI/CD"
 class="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:border-teal-500 transition resize-none placeholder-slate-500"
 />
 </div>
 <div>
 <label class="block text-xs font-semibold text-slate-400 mb-1">Years of Experience</label>
 <input
 v-model="aiForm.yearsOfExperience"
 type="text"
 inputmode="numeric"
 placeholder="e.g. 3"
 class="w-full px-3 py-2 text-sm border border-slate-700 rounded-lg bg-slate-800 text-white outline-none focus:border-teal-500 transition placeholder-slate-500"
 />
 </div>
 </div>

 <div class="flex items-center gap-3 pt-2">
 <button
 type="button"
 @click="generateJd"
 :disabled="aiGenerating"
 class="btn-primary"
 >
 <span v-if="aiGenerating" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ aiGenerating ? 'Generating…' : '✦ Generate Draft Content' }}
 </button>
 <button
 type="button"
 @click="showAiPanel = false"
 class="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
 >
 Cancel
 </button>
 </div>

 <!-- AI Result Preview -->
 <div v-if="aiResult" class="mt-6 bg-slate-800 border border-teal-500/30 rounded-xl p-5 space-y-4 animate-fade-in shadow-lg">
 <div class="flex items-center justify-between">
 <h3 class="text-sm font-bold text-teal-400">Content Preview</h3>
 <span class="text-xs text-slate-500">{{ aiResult.generatedAt }}</span>
 </div>

 <div class="text-sm text-slate-300 space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
 <div>
 <strong class="text-white">Overview:</strong>
 <p class="mt-1 leading-relaxed">{{ aiResult.generatedDescription.overview }}</p>
 </div>
 <div>
 <strong class="text-white">Responsibilities:</strong>
 <ul class="mt-1 list-disc list-inside space-y-1">
 <li v-for="(r, i) in aiResult.generatedDescription.responsibilities" :key="i">{{ r }}</li>
 </ul>
 </div>
 <div>
 <strong class="text-white">Requirements:</strong>
 <ul class="mt-1 list-disc list-inside space-y-1">
 <li v-for="(r, i) in aiResult.generatedDescription.requirements" :key="i">{{ r }}</li>
 </ul>
 </div>
 <div v-if="aiResult.generatedDescription.niceToHave.length">
 <strong class="text-white">Additional Qualifications:</strong>
 <ul class="mt-1 list-disc list-inside space-y-1">
 <li v-for="(r, i) in aiResult.generatedDescription.niceToHave" :key="i">{{ r }}</li>
 </ul>
 </div>
 <div v-if="aiResult.generatedDescription.benefits">
 <strong class="text-white">Benefits & Culture:</strong>
 <p class="mt-1 leading-relaxed">{{ aiResult.generatedDescription.benefits }}</p>
 </div>
 </div>

 <!-- Bias flags -->
 <div v-if="aiResult.biasFlags.length" class="flex flex-wrap gap-1.5 mt-2">
 <span
 v-for="(flag, i) in aiResult.biasFlags"
 :key="i"
 class="px-2 py-0.5 text-[10px] font-medium rounded-full bg-warning-bg text-warning"
 >
 ⚠ {{ flag }}
 </span>
 </div>

 <div class="flex gap-3 pt-3 border-t border-slate-700">
 <button
 type="button"
 @click="applyAiResult"
 class="btn-primary"
 >
 Apply Content
 </button>
 <button
 type="button"
 @click="aiResult = null"
 class="btn-secondary "
 >
 Discard
 </button>
 </div>
 </div>
 </div>

 <!-- Description textarea -->
 <div>
 <label for="job-desc" class="block text-sm font-medium text-gray-700 mb-1">
 Job Description <span class="text-error">*</span>
 </label>
 <textarea
 id="job-desc"
 v-model="form.description"
 rows="12"
 placeholder="Briefly describe the responsibilities and purpose of this role..."
 class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition resize-y font-mono"
 :class="errors.description ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <div class="flex items-center justify-between mt-1">
 <p v-if="errors.description" class="text-xs text-error">{{ errors.description }}</p>
 <span class="text-[10px] text-gray-400 ml-auto">{{ (form.description?.length ?? 0).toLocaleString() }} / 50,000</span>
 </div>
 </div>

 <!-- Requirements textarea -->
 <div>
 <label for="job-req" class="block text-sm font-medium text-gray-700 mb-1">Position Requirements</label>
 <textarea
 id="job-req"
 v-model="form.requirements"
 rows="6"
 placeholder="List the criteria for evaluating candidate qualifications…"
 class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition resize-y font-mono"
 :class="errors.requirements ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <div class="flex items-center justify-between mt-1">
 <p v-if="errors.requirements" class="text-xs text-error">{{ errors.requirements }}</p>
 <span class="text-[10px] text-gray-400 ml-auto">{{ (form.requirements?.length ?? 0).toLocaleString() }} / 50,000</span>
 </div>
 </div>
 </div>

 <!-- Actions -->
 <div class="flex items-center justify-between pt-4">
 <button
 type="button"
 @click="router.push('/employer/jobs')"
 class="btn-secondary"
 >
 Cancel
 </button>
 <button
 type="submit"
 :disabled="saving"
 class="btn-primary"
 >
 <span v-if="saving" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ saving ? 'Saving…' : isEditMode ? 'Save ' : 'Submit Draft' }}
 </button>
 </div>
 </form>
 </div>
</template>
