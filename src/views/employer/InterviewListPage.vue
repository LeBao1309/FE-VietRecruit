<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInterviewStore } from '@/stores/interviewStore'
import { useApplicationStore } from '@/stores/applicationStore'
import { useAuthStore } from '@/stores/authStore'
import type { InterviewStatus } from '@/types/enums'
import type { InterviewCreateRequest } from '@/types/application'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()
const appStore = useApplicationStore()
const auth = useAuthStore()

const applicationId = computed(() => route.params.id as string)
const canManage = computed(() => auth.isCompanyAdmin || auth.isHR)

// ── Status config ──
const statusConfig: Record<InterviewStatus, { label: string; class: string; dotClass: string }> = {
  SCHEDULED: { label: 'Scheduled', class: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-400' },
  COMPLETED: { label: 'Completed', class: 'bg-success-bg text-success', dotClass: 'bg-green-500' },
  CANCELED: { label: 'Canceled', class: 'bg-gray-100 text-gray-500', dotClass: 'bg-gray-400' },
}

// ── Schedule dialog state ──
const showScheduleDialog = ref(false)
const form = ref<InterviewCreateRequest>({
  title: '',
  scheduledAt: '',
  durationMinutes: 60,
  locationOrLink: '',
  interviewType: 'ONLINE',
  interviewerIds: [],
})
const interviewerIdInput = ref('')

const interviewTypeOptions = [
  { label: 'Online', value: 'ONLINE' },
  { label: 'Onsite', value: 'ONSITE' },
  { label: 'Phone', value: 'PHONE' },
]

const formErrors = ref<Record<string, string>>({})

function validateForm(): boolean {
  const errors: Record<string, string> = {}
  if (!form.value.title.trim()) errors.title = 'Title is required'
  if (!form.value.scheduledAt) errors.scheduledAt = 'Date & time is required'
  if (form.value.interviewerIds.length === 0) errors.interviewerIds = 'At least one interviewer is required'

  // Check datetime is in the future
  if (form.value.scheduledAt) {
    const scheduled = new Date(form.value.scheduledAt)
    if (scheduled <= new Date()) {
      errors.scheduledAt = 'Scheduled time must be in the future'
    }
  }

  formErrors.value = errors
  return Object.keys(errors).length === 0
}

function openScheduleDialog(): void {
  form.value = {
    title: '',
    scheduledAt: '',
    durationMinutes: 60,
    locationOrLink: '',
    interviewType: 'ONLINE',
    interviewerIds: [],
  }
  interviewerIdInput.value = ''
  formErrors.value = {}
  showScheduleDialog.value = true
}

function addInterviewerId(): void {
  const id = interviewerIdInput.value.trim()
  if (id && !form.value.interviewerIds.includes(id)) {
    form.value.interviewerIds.push(id)
    interviewerIdInput.value = ''
    // Clear error
    if (formErrors.value.interviewerIds) {
      delete formErrors.value.interviewerIds
    }
  }
}

function removeInterviewerId(id: string): void {
  form.value.interviewerIds = form.value.interviewerIds.filter((i) => i !== id)
}

async function submitSchedule(): Promise<void> {
  if (!validateForm()) return
  const success = await interviewStore.scheduleInterview(applicationId.value, {
    ...form.value,
    durationMinutes: form.value.durationMinutes || undefined,
    locationOrLink: form.value.locationOrLink || undefined,
    interviewType: form.value.interviewType || undefined,
  })
  if (success) {
    showScheduleDialog.value = false
  }
}

// ── Navigation ──
function goToDetail(interviewId: string): void {
  router.push(`/employer/interviews/${interviewId}`)
}

// ── Helpers ──
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function isUpcoming(scheduledAt: string): boolean {
  return new Date(scheduledAt) > new Date()
}

// ── Init ──
onMounted(async () => {
  await appStore.fetchApplication(applicationId.value)
  await interviewStore.fetchInterviews(applicationId.value)
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <!-- Back -->
    <div class="flex items-center gap-3 mb-2">
      <button
        @click="router.push(`/employer/applications/${applicationId}`)"
        class="text-gray-400 hover:text-gray-600 transition text-sm"
      >
        ‹ Back to Application
      </button>
    </div>

    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Interviews</h1>
        <p v-if="appStore.currentApplication" class="text-sm text-gray-500 mt-1">
          {{ appStore.currentApplication.candidateName }}
          <span class="text-gray-300 mx-1">·</span>
          {{ appStore.currentApplication.jobTitle }}
        </p>
      </div>
      <button
        v-if="canManage"
        @click="openScheduleDialog"
        class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition flex items-center gap-1.5 shrink-0"
      >
        <span class="text-lg leading-none">+</span> Schedule Interview
      </button>
    </div>

    <!-- Loading -->
    <div v-if="interviewStore.listLoading" class="space-y-3">
      <div v-for="i in 3" :key="i" class="bg-surface border border-border rounded-lg p-5 shadow-sm animate-pulse">
        <div class="flex items-start gap-4">
          <div class="h-10 w-10 bg-gray-100 rounded-lg" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-100 rounded w-48" />
            <div class="h-3 bg-gray-100 rounded w-32" />
          </div>
          <div class="h-5 bg-gray-100 rounded-full w-20" />
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="interviewStore.interviews.length === 0"
      class="bg-surface border border-border rounded-lg p-12 shadow-sm text-center"
    >
      <div class="text-gray-400 text-sm">
        <p class="font-medium mb-1">No interviews scheduled</p>
        <p class="text-xs mb-3">Schedule an interview to start the evaluation process.</p>
        <button
          v-if="canManage"
          @click="openScheduleDialog"
          class="text-primary hover:text-primary-hover text-xs font-medium transition"
        >
          + Schedule Interview
        </button>
      </div>
    </div>

    <!-- Interview cards -->
    <div v-else class="space-y-3">
      <div
        v-for="interview in interviewStore.interviews"
        :key="interview.id"
        @click="goToDetail(interview.id)"
        class="bg-surface border border-border rounded-lg p-5 shadow-sm hover:border-primary/20 hover:shadow-md transition cursor-pointer group"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-start gap-3">
            <!-- Calendar icon -->
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
              :class="interview.status === 'SCHEDULED' && isUpcoming(interview.scheduledAt)
                ? 'bg-primary-bg text-primary'
                : interview.status === 'COMPLETED' ? 'bg-success-bg text-success'
                : 'bg-gray-100 text-gray-400'"
            >
              {{ new Date(interview.scheduledAt).getDate() }}
            </div>
            <div>
              <h3 class="text-sm font-semibold text-gray-900 group-hover:text-primary transition">
                {{ interview.title }}
              </h3>
              <p class="text-xs text-gray-400 mt-0.5">
                {{ formatDateTime(interview.scheduledAt) }}
                <span v-if="interview.durationMinutes" class="text-gray-300 mx-1">·</span>
                <span v-if="interview.durationMinutes">{{ formatDuration(interview.durationMinutes) }}</span>
              </p>
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0"
            :class="statusConfig[interview.status].class"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="statusConfig[interview.status].dotClass" />
            {{ statusConfig[interview.status].label }}
          </span>
        </div>

        <!-- Meta -->
        <div class="flex items-center gap-4 text-xs text-gray-400">
          <span v-if="interview.interviewType" class="flex items-center gap-1">
            <span>{{ interview.interviewType === 'ONLINE' ? '💻' : interview.interviewType === 'PHONE' ? '📱' : '🏢' }}</span>
            {{ interview.interviewType }}
          </span>
          <span v-if="interview.locationOrLink" class="truncate max-w-[200px]">
            {{ interview.locationOrLink }}
          </span>
          <span class="ml-auto flex items-center gap-1">
            {{ interview.interviewers.length }} interviewer{{ interview.interviewers.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Interviewers pills -->
        <div v-if="interview.interviewers.length" class="flex items-center gap-1.5 mt-3 flex-wrap">
          <span
            v-for="iv in interview.interviewers"
            :key="iv.id"
            class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-gray-50 text-gray-600 rounded-full border border-border"
          >
            {{ iv.fullName }}
          </span>
        </div>
      </div>
    </div>

    <!-- ─── Schedule Interview Dialog ─── -->
    <Teleport to="body">
      <div v-if="showScheduleDialog" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="showScheduleDialog = false" />
        <div class="relative bg-surface rounded-lg shadow-xl border border-border w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-bold text-gray-900">Schedule Interview</h2>
            <button
              @click="showScheduleDialog = false"
              class="w-8 h-8 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              ✕
            </button>
          </div>

          <div class="space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Title <span class="text-error">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                placeholder="e.g. Technical Interview Round 1"
                class="w-full px-3 py-2 text-sm border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
                :class="formErrors.title ? 'border-error' : 'border-border'"
              />
              <p v-if="formErrors.title" class="text-[11px] text-error mt-1">{{ formErrors.title }}</p>
            </div>

            <!-- Date & Time -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Date & Time <span class="text-error">*</span>
              </label>
              <input
                v-model="form.scheduledAt"
                type="datetime-local"
                class="w-full px-3 py-2 text-sm border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
                :class="formErrors.scheduledAt ? 'border-error' : 'border-border'"
              />
              <p v-if="formErrors.scheduledAt" class="text-[11px] text-error mt-1">{{ formErrors.scheduledAt }}</p>
            </div>

            <!-- Duration & Type -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Duration (min)
                </label>
                <input
                  v-model.number="form.durationMinutes"
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  class="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Type
                </label>
                <select
                  v-model="form.interviewType"
                  class="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
                >
                  <option v-for="opt in interviewTypeOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Location / Link -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Location or Meeting Link
              </label>
              <input
                v-model="form.locationOrLink"
                type="text"
                placeholder="e.g. https://meet.google.com/abc-xyz or Room 301"
                class="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
              />
            </div>

            <!-- Interviewer IDs -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Interviewers <span class="text-error">*</span>
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model="interviewerIdInput"
                  type="text"
                  placeholder="Enter interviewer user ID"
                  class="flex-1 px-3 py-2 text-sm border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
                  :class="formErrors.interviewerIds ? 'border-error' : 'border-border'"
                  @keydown.enter.prevent="addInterviewerId"
                />
                <button
                  @click="addInterviewerId"
                  type="button"
                  class="px-3 py-2 text-sm font-medium text-primary bg-primary-bg border border-primary/10 rounded-md hover:bg-primary-light transition shrink-0"
                >
                  Add
                </button>
              </div>
              <p v-if="formErrors.interviewerIds" class="text-[11px] text-error mt-1">{{ formErrors.interviewerIds }}</p>
              <!-- Tags -->
              <div v-if="form.interviewerIds.length" class="flex items-center gap-1.5 mt-2 flex-wrap">
                <span
                  v-for="iId in form.interviewerIds"
                  :key="iId"
                  class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-50 text-gray-600 rounded-full border border-border"
                >
                  {{ iId.slice(0, 8) }}…
                  <button
                    @click="removeInterviewerId(iId)"
                    class="text-gray-400 hover:text-error transition ml-0.5"
                  >
                    ✕
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
            <button
              @click="showScheduleDialog = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              @click="submitSchedule"
              :disabled="interviewStore.createLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="interviewStore.createLoading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {{ interviewStore.createLoading ? 'Scheduling…' : 'Schedule' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
