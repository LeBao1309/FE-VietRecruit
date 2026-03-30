<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { interviewService } from '@/services/interviewService'
import type { InterviewResponse } from '@/types/application'
import type { InterviewStatus } from '@/types/enums'

const router = useRouter()
const auth = useAuthStore()

// ── State ──
const loading = ref(true)
const interviews = ref<InterviewResponse[]>([])
const statusFilter = ref<string>('')

// ── Status config ──
const STATUS_CONFIG: Record<InterviewStatus, { label: string; class: string; dotClass: string; bgClass: string }> = {
  SCHEDULED: { label: 'Scheduled', class: 'bg-blue-50 text-blue-600', dotClass: 'bg-blue-400', bgClass: 'border-blue-200 bg-blue-50/30' },
  COMPLETED: { label: 'Completed', class: 'bg-success-bg text-success', dotClass: 'bg-green-500', bgClass: 'border-green-200 bg-green-50/30' },
  CANCELED: { label: 'Canceled', class: 'bg-gray-100 text-gray-500', dotClass: 'bg-gray-400', bgClass: 'border-gray-200 bg-gray-50/30' },
}

const STATUS_FILTERS: { label: string; value: string; icon: string }[] = [
  { label: 'All', value: '', icon: '📋' },
  { label: 'Scheduled', value: 'SCHEDULED', icon: '📅' },
  { label: 'Completed', value: 'COMPLETED', icon: '✓' },
  { label: 'Canceled', value: 'CANCELED', icon: '✕' },
]

// ── Computed ──
const filteredInterviews = computed(() => {
  if (!statusFilter.value) return interviews.value
  return interviews.value.filter((i) => i.status === statusFilter.value)
})

const stats = computed(() => {
  const scheduled = interviews.value.filter((i) => i.status === 'SCHEDULED').length
  const completed = interviews.value.filter((i) => i.status === 'COMPLETED').length
  const canceled = interviews.value.filter((i) => i.status === 'CANCELED').length
  return { scheduled, completed, canceled, total: interviews.value.length }
})

/** Upcoming interviews sorted by date (nearest first) */
const upcomingInterviews = computed(() =>
  interviews.value
    .filter((i) => i.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
)

/** Next interview */
const nextInterview = computed(() => upcomingInterviews.value[0] ?? null)

/** Whether the next interview is today */
const isNextToday = computed(() => {
  if (!nextInterview.value) return false
  const date = new Date(nextInterview.value.scheduledAt)
  const today = new Date()
  return date.toDateString() === today.toDateString()
})

/** Time until next interview */
const timeUntilNext = computed(() => {
  if (!nextInterview.value) return ''
  const now = new Date()
  const scheduled = new Date(nextInterview.value.scheduledAt)
  const diff = scheduled.getTime() - now.getTime()
  if (diff <= 0) return 'Now'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `in ${days} day${days > 1 ? 's' : ''}`
  }
  if (hours > 0) return `in ${hours}h ${minutes}m`
  return `in ${minutes}m`
})

// ── Helpers ──
function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isUpcoming(iso: string): boolean {
  return new Date(iso).getTime() > Date.now()
}

// ── Load ──
onMounted(async () => {
  try {
    const result = await interviewService.listMyInterviews()
    if (result.data) {
      interviews.value = result.data
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900">My Interviews</h1>
      <p class="text-sm text-gray-500 mt-1">
        Welcome, {{ auth.user?.fullName?.split(' ')[0] ?? 'Interviewer' }}. Here are your assigned interviews.
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div class="grid grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="bg-surface border border-border rounded-lg p-5 shadow-sm animate-pulse">
          <div class="h-3 bg-gray-100 rounded w-20 mb-3" />
          <div class="h-6 bg-gray-100 rounded w-12" />
        </div>
      </div>
      <div v-for="j in 3" :key="'sk-'+j" class="bg-surface border border-border rounded-lg p-5 shadow-sm animate-pulse space-y-3">
        <div class="h-5 bg-gray-100 rounded w-48" />
        <div class="h-4 bg-gray-100 rounded w-32" />
      </div>
    </div>

    <template v-else>
      <!-- ─── Next Interview Banner ─── -->
      <div
        v-if="nextInterview"
        class="rounded-lg p-5 mb-6 border shadow-sm"
        :class="isNextToday ? 'bg-primary-bg/50 border-primary/20' : 'bg-surface border-border'"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-lg shrink-0"
              :class="isNextToday ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'"
            >
              📅
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-sm font-semibold text-gray-900">Next Up</h2>
                <span
                  v-if="isNextToday"
                  class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary text-white"
                >
                  TODAY
                </span>
                <span class="text-xs text-gray-400">{{ timeUntilNext }}</span>
              </div>
              <h3 class="text-base font-bold text-gray-900 mt-0.5">{{ nextInterview.title }}</h3>
              <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>{{ formatDateTime(nextInterview.scheduledAt) }}</span>
                <span v-if="nextInterview.durationMinutes" class="text-gray-300">·</span>
                <span v-if="nextInterview.durationMinutes">{{ nextInterview.durationMinutes }} min</span>
                <span v-if="nextInterview.interviewType" class="text-gray-300">·</span>
                <span v-if="nextInterview.interviewType" class="uppercase tracking-wider font-medium text-gray-400">
                  {{ nextInterview.interviewType }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <a
              v-if="nextInterview.locationOrLink?.startsWith('http')"
              :href="nextInterview.locationOrLink"
              target="_blank"
              rel="noopener"
              class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition"
            >
              Join Meeting ↗
            </a>
            <button
              @click="router.push(`/employer/interviews/${nextInterview.id}`)"
              class="px-4 py-2 text-sm font-medium text-primary bg-primary-bg border border-primary/10 rounded-md hover:bg-primary-light transition"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <!-- ─── Stats ─── -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-surface border border-border rounded-lg p-5 shadow-sm">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Scheduled</span>
          <p class="text-2xl font-bold text-blue-600 mt-1">{{ stats.scheduled }}</p>
        </div>
        <div class="bg-surface border border-border rounded-lg p-5 shadow-sm">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Completed</span>
          <p class="text-2xl font-bold text-success mt-1">{{ stats.completed }}</p>
        </div>
        <div class="bg-surface border border-border rounded-lg p-5 shadow-sm">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Canceled</span>
          <p class="text-2xl font-bold text-gray-400 mt-1">{{ stats.canceled }}</p>
        </div>
      </div>

      <!-- ─── Filter Pills ─── -->
      <div class="flex items-center gap-2 mb-5 flex-wrap">
        <button
          v-for="filter in STATUS_FILTERS"
          :key="filter.value"
          @click="statusFilter = filter.value"
          class="px-3 py-1.5 text-xs font-medium rounded-full border transition"
          :class="statusFilter === filter.value
            ? 'bg-primary text-white border-primary'
            : 'bg-surface text-gray-600 border-border hover:border-gray-300'"
        >
          {{ filter.label }}
        </button>
        <span class="text-xs text-gray-400 ml-auto">
          {{ filteredInterviews.length }} interview{{ filteredInterviews.length !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- ─── Empty State ─── -->
      <div v-if="interviews.length === 0" class="bg-surface border border-border rounded-lg p-12 shadow-sm text-center">
        <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-2xl mx-auto mb-4">
          📋
        </div>
        <h2 class="text-lg font-bold text-gray-900 mb-2">No Interviews Assigned</h2>
        <p class="text-sm text-gray-500">You don't have any interviews assigned yet. HR will assign you to interviews as needed.</p>
      </div>

      <!-- ─── Filtered empty ─── -->
      <div v-else-if="filteredInterviews.length === 0" class="bg-surface border border-border rounded-lg p-8 shadow-sm text-center">
        <p class="text-sm text-gray-400">No interviews matching this filter.</p>
      </div>

      <!-- ─── Interview List ─── -->
      <div v-else class="space-y-3">
        <div
          v-for="interview in filteredInterviews"
          :key="interview.id"
          @click="router.push(`/employer/interviews/${interview.id}`)"
          class="bg-surface border rounded-lg p-5 shadow-sm hover:shadow-md transition cursor-pointer group"
          :class="interview.status === 'SCHEDULED' && isUpcoming(interview.scheduledAt)
            ? 'border-blue-200 hover:border-primary/30'
            : 'border-border hover:border-primary/30'"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-sm font-semibold text-gray-900 group-hover:text-primary transition truncate">
                  {{ interview.title }}
                </h3>
                <span
                  class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium rounded-full shrink-0"
                  :class="STATUS_CONFIG[interview.status].class"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="STATUS_CONFIG[interview.status].dotClass" />
                  {{ STATUS_CONFIG[interview.status].label }}
                </span>
              </div>

              <div class="flex items-center gap-3 text-xs text-gray-500 mt-1">
                <span class="font-medium">{{ formatDateTime(interview.scheduledAt) }}</span>
                <span v-if="interview.durationMinutes" class="text-gray-300">·</span>
                <span v-if="interview.durationMinutes">{{ interview.durationMinutes }} min</span>
                <span v-if="interview.interviewType" class="text-gray-300">·</span>
                <span v-if="interview.interviewType" class="uppercase tracking-wider font-medium text-gray-400">
                  {{ interview.interviewType }}
                </span>
              </div>

              <!-- Location -->
              <div v-if="interview.locationOrLink" class="mt-2">
                <a
                  v-if="interview.locationOrLink.startsWith('http')"
                  :href="interview.locationOrLink"
                  target="_blank"
                  rel="noopener"
                  @click.stop
                  class="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition"
                >
                  🔗 {{ interview.locationOrLink.length > 50 ? interview.locationOrLink.substring(0, 50) + '…' : interview.locationOrLink }}
                </a>
                <span v-else class="text-xs text-gray-400">📍 {{ interview.locationOrLink }}</span>
              </div>

              <!-- Interviewers -->
              <div v-if="interview.interviewers && interview.interviewers.length > 0" class="mt-2 flex items-center gap-1.5">
                <div
                  v-for="iv in interview.interviewers.slice(0, 4)"
                  :key="iv.id"
                  class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[9px] font-bold border border-white"
                  :title="iv.fullName"
                >
                  {{ iv.fullName.charAt(0).toUpperCase() }}
                </div>
                <span v-if="interview.interviewers.length > 4" class="text-[10px] text-gray-400">
                  +{{ interview.interviewers.length - 4 }}
                </span>
                <span class="text-[10px] text-gray-400 ml-1">
                  {{ interview.interviewers.map(i => i.fullName).join(', ') }}
                </span>
              </div>
            </div>

            <!-- Arrow -->
            <div class="flex items-center gap-2 shrink-0 ml-4">
              <button
                v-if="interview.status === 'SCHEDULED' || interview.status === 'COMPLETED'"
                @click.stop="router.push(`/employer/interviews/${interview.id}/scorecard`)"
                class="px-3 py-1.5 text-xs font-medium text-primary bg-primary-bg border border-primary/10 rounded-md hover:bg-primary-light transition"
              >
                Scorecard
              </button>
              <span class="text-gray-300 group-hover:text-gray-400 transition text-sm">→</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
