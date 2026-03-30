<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { candidateService } from '@/services/candidateService'
import type { CandidateProfileResponse } from '@/types/candidate'
import type { CvImprovementResponse } from '@/types/ai'

const ui = useUiStore()

// ── State ──
const loading = ref(true)
const profile = ref<CandidateProfileResponse | null>(null)

// ── Upload state ──
const uploading = ref(false)
const deleting = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

// ── AI Improvement ──
const analyzing = ref(false)
const improvement = ref<CvImprovementResponse | null>(null)

// ── Computed ──
const hasCv = computed(() => !!profile.value?.defaultCvUrl)
const cvInfo = computed(() => {
  if (!profile.value) return null
  return {
    filename: profile.value.cvOriginalFilename ?? 'Unknown file',
    type: profile.value.cvContentType ?? '',
    size: profile.value.cvFileSizeBytes ?? 0,
    uploadedAt: profile.value.cvUploadedAt ?? '',
  }
})

// ── Constants ──
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

// ── Load ──
async function loadProfile(): Promise<void> {
  loading.value = true
  try {
    const result = await candidateService.getProfile()
    if (result.data) profile.value = result.data
  } finally {
    loading.value = false
  }
}

// ── Upload ──
function triggerFileInput(): void {
  fileInputRef.value?.click()
}

function onFileSelect(e: Event): void {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    processFile(input.files[0])
  }
  input.value = '' // Reset for re-upload
}

function onDrop(e: DragEvent): void {
  e.preventDefault()
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

async function processFile(file: File): Promise<void> {
  // Validate type
  if (!ALLOWED_TYPES.includes(file.type)) {
    ui.toastError('Invalid file type', 'Please upload a PDF, DOCX, JPEG, or PNG file.')
    return
  }
  // Validate size
  if (file.size > MAX_SIZE_BYTES) {
    ui.toastError('File too large', `Maximum file size is ${MAX_SIZE_MB}MB.`)
    return
  }

  uploading.value = true
  try {
    const result = await candidateService.uploadCv(file)
    if (result.data) {
      // Update profile with new CV info
      if (profile.value) {
        profile.value.defaultCvUrl = result.data.cvUrl
        profile.value.cvOriginalFilename = result.data.cvOriginalFilename
        profile.value.cvContentType = result.data.cvContentType
        profile.value.cvFileSizeBytes = result.data.cvFileSizeBytes
        profile.value.cvUploadedAt = result.data.cvUploadedAt
      }
      improvement.value = null // Clear previous analysis
      ui.toastSuccess('CV uploaded', `"${result.data.cvOriginalFilename}" has been uploaded.`)
    } else {
      ui.toastError('Upload failed', result.error?.message)
    }
  } finally {
    uploading.value = false
  }
}

// ── Delete ──
async function handleDelete(): Promise<void> {
  if (!confirm('Are you sure you want to delete your CV? This cannot be undone.')) return
  deleting.value = true
  try {
    const result = await candidateService.deleteCv()
    if (!result.error) {
      if (profile.value) {
        profile.value.defaultCvUrl = null
        profile.value.cvOriginalFilename = null
        profile.value.cvContentType = null
        profile.value.cvFileSizeBytes = null
        profile.value.cvUploadedAt = null
      }
      improvement.value = null
      ui.toastSuccess('CV deleted')
    } else {
      ui.toastError('Delete failed', result.error.message)
    }
  } finally {
    deleting.value = false
  }
}

// ── AI Improvement ──
async function runAnalysis(): Promise<void> {
  if (!hasCv.value) {
    ui.toastWarning('No CV', 'Upload your CV first to get AI improvement suggestions.')
    return
  }
  analyzing.value = true
  try {
    const result = await candidateService.getCvImprovement()
    if (result.data) {
      improvement.value = result.data
      ui.toastSuccess('Analysis complete')
    } else {
      ui.toastError('Analysis failed', result.error?.message)
    }
  } finally {
    analyzing.value = false
  }
}

// ── Formatting ──
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const priorityConfig: Record<string, { class: string; label: string }> = {
  HIGH: { class: 'bg-error-bg text-error', label: 'High' },
  MEDIUM: { class: 'bg-warning-bg text-warning', label: 'Medium' },
  LOW: { class: 'bg-info-bg text-info', label: 'Low' },
}

function getPriorityConfig(priority: string) {
  return priorityConfig[priority.toUpperCase()] ?? { class: 'bg-gray-100 text-gray-600', label: priority }
}

onMounted(loadProfile)
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-8">
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900">CV Management</h1>
      <p class="text-sm text-gray-500 mt-1">Upload your CV and get AI-powered improvement suggestions.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-surface border border-border rounded-lg p-6 shadow-sm animate-pulse space-y-4">
      <div class="h-24 bg-gray-100 rounded" />
      <div class="h-4 bg-gray-100 rounded w-48" />
    </div>

    <template v-else>
      <!-- Upload Area -->
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm mb-6">
        <h2 class="text-sm font-semibold text-gray-900 mb-4">Your CV</h2>

        <!-- Has CV -->
        <div v-if="hasCv && cvInfo" class="flex items-center justify-between p-4 bg-primary-bg/30 border border-primary/10 rounded-lg">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
              {{ cvInfo.filename.split('.').pop()?.toUpperCase() ?? 'CV' }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ cvInfo.filename }}</p>
              <p class="text-[10px] text-gray-400">
                {{ formatFileSize(cvInfo.size) }} · Uploaded {{ formatDate(cvInfo.uploadedAt) }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0 ml-4">
            <button
              @click="triggerFileInput"
              :disabled="uploading"
              class="px-3 py-1.5 text-xs font-medium text-primary bg-surface border border-primary/20 rounded-md hover:bg-primary-light transition disabled:opacity-50"
            >
              {{ uploading ? 'Uploading…' : 'Replace' }}
            </button>
            <button
              @click="handleDelete"
              :disabled="deleting"
              class="px-3 py-1.5 text-xs font-medium text-error bg-surface border border-error/20 rounded-md hover:bg-error-bg transition disabled:opacity-50"
            >
              {{ deleting ? 'Deleting…' : 'Delete' }}
            </button>
          </div>
        </div>

        <!-- No CV — Drop zone -->
        <div
          v-else
          @click="triggerFileInput"
          @dragover.prevent="dragOver = true"
          @dragleave="dragOver = false"
          @drop="onDrop"
          class="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg cursor-pointer transition"
          :class="dragOver ? 'border-primary bg-primary-bg/30' : 'border-border hover:border-primary/40 hover:bg-primary-bg/10'"
        >
          <div class="w-12 h-12 rounded-full bg-primary-bg flex items-center justify-center text-primary text-lg mb-3">
            ↑
          </div>
          <p class="text-sm font-medium text-gray-700 mb-1">
            {{ uploading ? 'Uploading…' : 'Drop your CV here or click to browse' }}
          </p>
          <p class="text-xs text-gray-400">PDF, DOCX, JPEG, or PNG — max {{ MAX_SIZE_MB }}MB</p>
          <span v-if="uploading" class="mt-2 inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>

        <!-- Hidden file input -->
        <input
          ref="fileInputRef"
          type="file"
          accept=".pdf,.docx,.doc,.jpeg,.jpg,.png"
          class="hidden"
          @change="onFileSelect"
        />
      </div>

      <!-- AI Improvement Section -->
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-sm font-semibold text-gray-900">AI CV Analysis</h2>
            <p class="text-xs text-gray-400 mt-0.5">Get personalized suggestions to improve your CV and stand out.</p>
          </div>
          <button
            @click="runAnalysis"
            :disabled="analyzing || !hasCv"
            class="px-4 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="analyzing" class="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ analyzing ? 'Analyzing…' : '✦ Analyze My CV' }}
          </button>
        </div>

        <div v-if="!hasCv" class="text-xs text-gray-400 text-center py-6">
          Upload your CV first to enable AI analysis.
        </div>

        <!-- Results -->
        <div v-else-if="improvement" class="space-y-5 animate-fade-in">
          <!-- Score -->
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="relative w-16 h-16 shrink-0">
              <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e5e7eb" stroke-width="3" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none" stroke-width="3" stroke-linecap="round"
                  :stroke="improvement.overallScore >= 70 ? '#22863a' : improvement.overallScore >= 40 ? '#b08800' : '#cb2431'"
                  :stroke-dasharray="`${(improvement.overallScore / 100) * 97.4} 97.4`"
                />
              </svg>
              <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
                {{ improvement.overallScore }}
              </span>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">Overall Score</p>
              <p class="text-xs text-gray-500">
                Analysed {{ formatDate(improvement.analysedAt) }}
              </p>
            </div>
          </div>

          <!-- Strengths -->
          <div v-if="improvement.strengths.length">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Strengths</h3>
            <ul class="space-y-1">
              <li v-for="(s, i) in improvement.strengths" :key="i" class="flex items-start gap-1.5 text-xs text-gray-700">
                <span class="text-success mt-0.5 shrink-0">✓</span> {{ s }}
              </li>
            </ul>
          </div>

          <!-- Suggestions -->
          <div v-if="improvement.suggestions.length">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Suggestions ({{ improvement.suggestions.length }})
            </h3>
            <div class="space-y-2">
              <div
                v-for="(sug, i) in improvement.suggestions"
                :key="i"
                class="p-3 border border-border rounded-lg"
              >
                <div class="flex items-center gap-2 mb-1.5">
                  <span
                    class="px-1.5 py-0.5 text-[10px] font-medium rounded"
                    :class="getPriorityConfig(sug.priority).class"
                  >
                    {{ getPriorityConfig(sug.priority).label }}
                  </span>
                  <span class="text-xs font-medium text-gray-700">{{ sug.section }}</span>
                </div>
                <p class="text-xs text-gray-600 mb-1">
                  <span class="font-medium text-gray-800">Issue:</span> {{ sug.issue }}
                </p>
                <p class="text-xs text-gray-600">
                  <span class="font-medium text-primary">Suggestion:</span> {{ sug.suggestion }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!analyzing" class="text-xs text-gray-400 text-center py-6">
          Click "Analyze My CV" to get AI-powered suggestions.
        </div>
      </div>
    </template>
  </div>
</template>
