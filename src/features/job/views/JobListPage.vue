<script setup lang="ts">
// src/features/job/views/JobListPage.vue
// Job list page for HR / COMPANY_ADMIN roles.
// Layout: uses PipelineSidebar + PipelineTopBar (same shell as WorkspacePage.vue).

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Plus, Briefcase, AlertTriangle } from 'lucide-vue-next'
import PipelineSidebar from '@/features/workspace/components/PipelineSidebar.vue'
import PipelineTopBar from '@/features/workspace/components/PipelineTopBar.vue'
import JobTableRow from '@/features/job/components/JobTableRow.vue'

import { useJobStore } from '@/features/job/stores/useJobStore'
import { QuotaExceededError } from '@/features/job/types/job.dto'
import type { JobStatus } from '@/features/workspace/types'
import { useToast } from 'vue-toastification'

const router = useRouter()
const jobStore = useJobStore()
const toast = useToast()
const { jobs, isLoading, error, draftJobs, publishedJobs, closedJobs } = storeToRefs(jobStore)

// ── Local UI state ────────────────────────────────────────────────────────────
const selectedTab = ref<'ALL' | JobStatus>('ALL')
const quotaError = ref<string | null>(null)

const tabs: { key: 'ALL' | JobStatus; label: string }[] = [
  { key: 'ALL', label: 'All Jobs' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'CLOSED', label: 'Closed' },
]

const filteredJobs = computed(() => {
  if (selectedTab.value === 'ALL') return jobs.value
  if (selectedTab.value === 'DRAFT') return draftJobs.value
  if (selectedTab.value === 'PUBLISHED') return publishedJobs.value
  return closedJobs.value
})

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  jobStore.fetchJobs()
})

// ── Actions ───────────────────────────────────────────────────────────────────
async function handlePublish(id: string): Promise<void> {
  const confirmed = window.confirm(
    'Are you sure you want to publish this job? It will be visible to candidates.',
  )
  if (!confirmed) return

  quotaError.value = null
  try {
    await jobStore.publishJob(id)
    toast.success('Job published successfully')
  } catch (e) {
    if (e instanceof QuotaExceededError) {
      quotaError.value = e.message
    }
  }
}

async function handleClose(id: string): Promise<void> {
  const confirmed = window.confirm(
    'Are you sure you want to close this job? It will no longer accept new applications.',
  )
  if (!confirmed) return
  await jobStore.closeJob(id)
  toast.success('Job closed successfully')
}

function goToCreate(): void {
  router.push({ name: 'JobCreate' })
}
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-surface overflow-hidden text-text-primary font-sans">
    <PipelineTopBar />

    <div class="flex-1 flex overflow-hidden">
      <PipelineSidebar />

      <main class="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface-soft scrollbar-hide">
        <!-- Header -->
        <div
          class="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-border"
        >
          <div>
            <nav class="flex text-sm text-text-muted mb-2 font-medium">
              <span class="hover:text-brand cursor-pointer" @click="$router.push({ name: 'Workspace' })">
                Workspace
              </span>
              <span class="mx-2">/</span>
              <span class="text-text-primary">Job Management</span>
            </nav>
            <h1 class="text-3xl font-display font-bold text-text-primary">Job Management</h1>
            <p class="text-sm text-text-muted mt-1">
              Manage job postings, publish openings, and monitor recruitment pipeline.
            </p>
          </div>
          <div class="mt-4 md:mt-0">
            <button
              id="btn-create-job"
              @click="goToCreate"
              class="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors shadow-brand-sm text-sm font-semibold"
            >
              <Plus class="w-4 h-4" />
              Create Job
            </button>
          </div>
        </div>

        <!-- Quota Exceeded Banner -->
        <div
          v-if="quotaError"
          class="mb-6 p-4 bg-warning-light border border-warning/30 rounded-xl flex items-start gap-3"
        >
          <AlertTriangle class="w-5 h-5 text-warning-dark shrink-0 mt-0.5" />
          <div>
            <p class="text-sm font-semibold text-warning-dark">Job Quota Exceeded</p>
            <p class="text-sm text-warning-dark/80 mt-0.5">{{ quotaError }}</p>
          </div>
          <button
            @click="quotaError = null"
            class="ml-auto text-warning-dark/60 hover:text-warning-dark font-bold text-lg leading-none"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>

        <!-- Generic Error Banner -->
        <div
          v-if="error"
          class="mb-6 p-4 bg-danger-light border border-danger/20 rounded-xl text-sm text-danger-dark font-medium"
        >
          {{ error }}
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="p-4 bg-white border border-border rounded-xl shadow-xs"
          >
            <p class="text-xs text-text-muted font-medium mb-1">{{ tab.label }}</p>
            <p class="text-2xl font-bold text-text-primary">
              {{
                tab.key === 'ALL'
                  ? jobs.length
                  : tab.key === 'DRAFT'
                    ? draftJobs.length
                    : tab.key === 'PUBLISHED'
                      ? publishedJobs.length
                      : closedJobs.length
              }}
            </p>
          </div>
        </div>

        <!-- Status Filter Tabs -->
        <div class="flex gap-1 mb-4 p-1 bg-surface-muted rounded-lg w-fit">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="selectedTab = tab.key"
            :class="[
              'px-4 py-1.5 text-sm font-semibold rounded-md transition-all',
              selectedTab === tab.key
                ? 'bg-white text-brand shadow-xs border border-border'
                : 'text-text-muted hover:text-text-secondary',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Loading Skeleton -->
        <div v-if="isLoading" class="space-y-3 animate-pulse">
          <div
            v-for="n in 4"
            :key="n"
            class="h-16 bg-white border border-border rounded-xl shadow-xs"
          />
        </div>

        <!-- Jobs Table -->
        <div v-else class="bg-white border border-border rounded-xl shadow-xs overflow-hidden">
          <table v-if="filteredJobs.length > 0" class="w-full">
            <thead>
              <tr class="bg-surface-muted border-b border-border">
                <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Job Title
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Salary
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Deadline
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Created
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <JobTableRow
                v-for="job in filteredJobs"
                :key="job.id"
                :job="job"
                @publish="handlePublish"
                @close="handleClose"
              />
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-else class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center mb-4">
              <Briefcase class="w-7 h-7 text-brand" />
            </div>
            <p class="text-base font-semibold text-text-primary">No jobs found</p>
            <p class="text-sm text-text-muted mt-1">
              {{
                selectedTab === 'ALL'
                  ? 'Create your first job posting to start recruiting.'
                  : `No jobs with status "${selectedTab}" found.`
              }}
            </p>
            <button
              v-if="selectedTab === 'ALL'"
              @click="goToCreate"
              class="mt-5 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-dark transition-colors"
            >
              Create First Job
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
