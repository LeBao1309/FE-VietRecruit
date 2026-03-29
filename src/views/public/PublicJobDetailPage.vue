<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { jobService } from '@/services/jobService'
import { applicationService } from '@/services/applicationService'
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

// ── Apply button logic ──
function handleApplyClick(): void {
  if (!auth.isAuthenticated) {
    // Redirect to login with return URL
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  if (!auth.isCandidate) {
    ui.toastWarning('Candidate only', 'Only candidates can apply to jobs.')
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
      ui.toastError('Application failed', result.error.message)
      return
    }
    applied.value = true
    showApplyModal.value = false
    coverLetter.value = ''
    ui.toastSuccess('Application submitted!', 'You will be notified about updates to your application.')
  } finally {
    applying.value = false
  }
}

// ── Formatting ──
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatSalary(n: number | null): string {
  if (n === null) return '—'
  return n.toLocaleString('en-US')
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

onMounted(loadJob)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-surface border-b border-border px-6 py-4 sticky top-0 z-30">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <router-link to="/" class="text-xl font-bold text-primary">VietRecruit</router-link>
        </div>
        <nav class="flex items-center gap-3">
          <router-link
            to="/jobs"
            class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 transition"
          >
            Browse Jobs
          </router-link>
          <template v-if="!auth.isAuthenticated">
            <router-link to="/login" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 transition">
              Login
            </router-link>
            <router-link to="/register" class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition">
              Get Started
            </router-link>
          </template>
          <template v-else>
            <span class="text-sm text-gray-500">{{ auth.user?.fullName }}</span>
          </template>
        </nav>
      </div>
    </header>

    <!-- Loading -->
    <main v-if="loading" class="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-gray-100 rounded w-64" />
        <div class="h-4 bg-gray-100 rounded w-40" />
        <div class="h-48 bg-gray-100 rounded mt-6" />
      </div>
    </main>

    <!-- Not found -->
    <main v-else-if="notFound || !job" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <p class="text-gray-400 text-sm font-medium mb-1">Job not found</p>
        <p class="text-xs text-gray-400 mb-4">This listing may have been closed or removed.</p>
        <router-link to="/jobs" class="text-primary hover:text-primary-hover text-sm font-medium transition">
          ← Browse All Jobs
        </router-link>
      </div>
    </main>

    <!-- Job Detail -->
    <main v-else class="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
      <!-- Back link -->
      <div class="mb-6">
        <router-link to="/jobs" class="text-gray-400 hover:text-gray-600 transition text-sm">
          ‹ Back to Jobs
        </router-link>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-5">
          <!-- Title card -->
          <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h1 class="text-xl font-bold text-gray-900 mb-2">{{ job.title }}</h1>
            <p class="text-xs text-gray-400 mb-4">{{ timeAgo(job.createdAt) }}</p>

            <!-- Job description -->
            <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ job.description }}</div>
          </div>

          <!-- Requirements -->
          <div v-if="job.requirements" class="bg-surface border border-border rounded-lg p-6 shadow-sm">
            <h2 class="text-sm font-semibold text-gray-900 mb-3">Requirements</h2>
            <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{{ job.requirements }}</div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <!-- Apply CTA -->
          <div class="bg-surface border border-border rounded-lg p-5 shadow-sm">
            <button
              v-if="!applied"
              @click="handleApplyClick"
              class="w-full px-4 py-3 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition"
            >
              Apply Now
            </button>
            <div v-else class="text-center py-2">
              <span class="inline-flex items-center gap-1.5 text-sm text-success font-medium">
                ✓ Application Submitted
              </span>
              <p class="text-xs text-gray-400 mt-1">You'll be notified about updates.</p>
            </div>
            <p v-if="!auth.isAuthenticated" class="text-[10px] text-gray-400 text-center mt-2">
              You'll be asked to log in first.
            </p>
          </div>

          <!-- Details card -->
          <div class="bg-surface border border-border rounded-lg p-5 shadow-sm space-y-4">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400">Job Details</h3>

            <div>
              <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Salary Range</span>
              <span class="text-sm font-medium text-gray-900">
                <template v-if="job.minSalary || job.maxSalary">
                  {{ formatSalary(job.minSalary) }} – {{ formatSalary(job.maxSalary) }} {{ job.currency ?? 'VND' }}
                </template>
                <template v-else-if="job.isNegotiable">Negotiable</template>
                <template v-else>Not specified</template>
              </span>
            </div>

            <div v-if="job.isNegotiable !== null">
              <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Negotiable</span>
              <span class="text-sm" :class="job.isNegotiable ? 'text-success font-medium' : 'text-gray-500'">
                {{ job.isNegotiable ? 'Yes' : 'No' }}
              </span>
            </div>

            <div v-if="job.deadline">
              <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Deadline</span>
              <span class="text-sm text-gray-900">{{ formatDate(job.deadline) }}</span>
            </div>

            <div>
              <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Posted On</span>
              <span class="text-sm text-gray-700">{{ formatDate(job.createdAt) }}</span>
            </div>
          </div>

          <!-- Share -->
          <div v-if="job.publicLink" class="bg-surface border border-border rounded-lg p-5 shadow-sm">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Share</h3>
            <input
              :value="job.publicLink"
              readonly
              class="w-full px-3 py-2 text-xs border border-border rounded-md bg-gray-50 text-gray-500 cursor-text"
              @click="($event.target as HTMLInputElement).select()"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-surface border-t border-border px-6 py-6 mt-auto">
      <div class="max-w-4xl mx-auto text-center text-xs text-gray-400">
        © {{ new Date().getFullYear() }} VietRecruit. All rights reserved.
      </div>
    </footer>

    <!-- Apply Modal -->
    <Teleport to="body">
      <div v-if="showApplyModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="showApplyModal = false" />
        <div class="relative bg-surface rounded-lg shadow-xl border border-border w-full max-w-lg p-6 animate-slide-up">
          <h2 class="text-lg font-bold text-gray-900 mb-1">Apply to {{ job?.title }}</h2>
          <p class="text-sm text-gray-500 mb-5">
            Your default CV on file will be attached automatically.
          </p>

          <form @submit.prevent="submitApplication" class="space-y-4">
            <div>
              <label for="cover-letter" class="block text-sm font-medium text-gray-700 mb-1">
                Cover Letter <span class="text-gray-400 text-xs">(optional)</span>
              </label>
              <textarea
                id="cover-letter"
                v-model="coverLetter"
                rows="6"
                placeholder="Write a brief cover letter to introduce yourself and explain why you're a great fit…"
                class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition resize-y"
              />
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button
                type="button"
                @click="showApplyModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="applying"
                class="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 flex items-center gap-2"
              >
                <span v-if="applying" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {{ applying ? 'Submitting…' : 'Submit Application' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
