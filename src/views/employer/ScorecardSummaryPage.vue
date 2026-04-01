<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInterviewStore } from '@/stores/interviewStore'
import type { ScorecardResult } from '@/types/enums'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()

const interviewId = computed(() => route.params.id as string)

// ── Status config ──
const resultConfig: Record<ScorecardResult, { label: string; class: string }> = {
  PASS: { label: 'Pass', class: 'bg-success-bg text-success' },
  FAIL: { label: 'Fail', class: 'bg-error-bg text-error' },
  CONSIDERING: { label: 'Considering', class: 'bg-amber-50 text-amber-600' },
}

// ── Radar chart ──
const radarCanvas = ref<HTMLCanvasElement | null>(null)

function drawRadarChart(): void {
  const canvas = radarCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const size = 240
  canvas.width = size * dpr
  canvas.height = size * dpr
  canvas.style.width = `${size}px`
  canvas.style.height = `${size}px`
  ctx.scale(dpr, dpr)

  const cx = size / 2
  const cy = size / 2
  const radius = 90

  const labels = ['Skill', 'Attitude', 'English']
  const values = [
    interviewStore.avgSkill,
    interviewStore.avgAttitude,
    interviewStore.avgEnglish,
  ]
  const numAxes = labels.length
  const angleStep = (Math.PI * 2) / numAxes
  const startAngle = -Math.PI / 2

  // Clear
  ctx.clearRect(0, 0, size, size)

  // Draw grid rings (2, 4, 6, 8, 10)
  for (let ring = 2; ring <= 10; ring += 2) {
    const r = (ring / 10) * radius
    ctx.beginPath()
    for (let i = 0; i <= numAxes; i++) {
      const angle = startAngle + i * angleStep
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = ring === 10 ? '#d1d5db' : '#e5e7eb'
    ctx.lineWidth = ring === 10 ? 1.2 : 0.6
    ctx.stroke()

    // Ring label
    if (ring % 4 === 0 || ring === 10) {
      ctx.fillStyle = '#9ca3af'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(String(ring), cx - 4, cy - r + 3)
    }
  }

  // Draw axes
  for (let i = 0; i < numAxes; i++) {
    const angle = startAngle + i * angleStep
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)

    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 0.8
    ctx.stroke()

    // Axis labels
    const labelRadius = radius + 16
    const lx = cx + labelRadius * Math.cos(angle)
    const ly = cy + labelRadius * Math.sin(angle)
    ctx.fillStyle = '#374151'
    ctx.font = 'bold 11px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(labels[i] ?? '', lx, ly)
  }

  // Draw data polygon (filled)
  if (values.some((v) => v > 0)) {
    ctx.beginPath()
    for (let i = 0; i < numAxes; i++) {
      const angle = startAngle + i * angleStep
      const r = ((values[i] ?? 0) / 10) * radius
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()

    // Fill with gradient-like transparent color
    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw dots at each vertex
    for (let i = 0; i < numAxes; i++) {
      const angle = startAngle + i * angleStep
      const r = ((values[i] ?? 0) / 10) * radius
      const x = cx + r * Math.cos(angle)
      const y = cy + r * Math.sin(angle)

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(99, 102, 241, 1)'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
}

// ── Helpers ──
function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600'
  if (score >= 5) return 'text-amber-600'
  return 'text-red-500'
}

function getBarWidth(score: number): string {
  return `${Math.min(100, (score / 10) * 100)}%`
}

function getBarColor(score: number): string {
  if (score >= 8) return 'bg-green-400'
  if (score >= 5) return 'bg-amber-400'
  return 'bg-red-400'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

// ── Watch for data changes to redraw chart ──
watch(
  () => [interviewStore.avgSkill, interviewStore.avgAttitude, interviewStore.avgEnglish],
  () => { nextTick(() => drawRadarChart()) },
)

// ── Init ──
onMounted(async () => {
  const loaded = await interviewStore.fetchInterview(interviewId.value)
  if (loaded) {
    await interviewStore.fetchScorecards(interviewId.value)
    nextTick(() => drawRadarChart())
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-8">
    <!-- Back -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.push(`/employer/interviews/${interviewId}`)" class="text-gray-400 hover:text-gray-600 transition text-sm">
        ‹ Back to Interview
      </button>
    </div>

    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Scorecard Summary</h1>
        <p v-if="interviewStore.currentInterview" class="text-sm text-gray-500 mt-1">
          {{ interviewStore.currentInterview.title }}
          <span class="text-gray-300 mx-1">·</span>
          {{ interviewStore.scorecards.length }} evaluation{{ interviewStore.scorecards.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <router-link
        :to="`/employer/interviews/${interviewId}/scorecard`"
        class="btn-primary"
      >
        + Submit Scorecard
      </router-link>
    </div>

    <!-- Loading -->
    <div v-if="interviewStore.scorecardsLoading" class="space-y-6">
      <div class="premium-card p-8 animate-pulse">
        <div class="flex gap-10">
          <div class="w-64 h-64 bg-slate-100 dark:bg-slate-800 rounded-full" />
          <div class="flex-1 space-y-4 pt-4">
            <div class="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-40" />
            <div class="h-5 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
            <div class="h-5 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
            <div class="h-5 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="interviewStore.scorecards.length === 0"
      class="premium-card p-16 text-center max-w-2xl mx-auto mt-8"
    >
      <div class="text-4xl mb-4 text-slate-300">📊</div>
      <p class="text-lg font-bold text-slate-900 dark:text-white mb-2">No scorecards yet</p>
      <p class="text-sm font-medium text-slate-500 mb-6">Interviewers will submit their evaluations after the interview.</p>
      <router-link
        :to="`/employer/interviews/${interviewId}/scorecard`"
        class="inline-flex items-center text-teal-600 hover:text-teal-700 font-bold transition-colors"
      >
        + Submit a Scorecard
      </router-link>
    </div>

    <div v-else class="space-y-6">
      <!-- ─── Top Summary: Radar Chart + Stats ─── -->
      <div class="premium-card p-8">
        <div class="flex flex-col sm:flex-row gap-10 items-center sm:items-start">
          <!-- Radar Chart -->
          <div class="shrink-0">
            <canvas ref="radarCanvas" class="block" />
          </div>

          <!-- Scores + Result distribution -->
          <div class="flex-1 w-full space-y-6">
            <!-- Overall average -->
            <div class="text-center sm:text-left">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Overall Average
              </span>
              <span
                class="text-5xl font-black tabular-nums tracking-tight"
                :class="interviewStore.averageScore !== null ? getScoreColor(interviewStore.averageScore) : 'text-slate-300'"
              >
                {{ interviewStore.averageScore?.toFixed(1) ?? '—' }}
              </span>
              <span class="text-sm font-bold text-slate-400 ml-1">/ 10</span>
            </div>

            <!-- Per-dimension bars -->
            <div class="space-y-4">
              <div v-for="{ label, value } in [
                { label: 'Skill', value: interviewStore.avgSkill },
                { label: 'Attitude', value: interviewStore.avgAttitude },
                { label: 'English', value: interviewStore.avgEnglish },
              ]" :key="label" class="flex items-center gap-4">
                <span class="text-sm font-bold text-slate-600 dark:text-slate-400 w-20 shrink-0">{{ label }}</span>
                <div class="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :class="getBarColor(value)"
                    :style="{ width: getBarWidth(value) }"
                  />
                </div>
                <span class="text-base font-black tabular-nums w-10 text-right" :class="getScoreColor(value)">
                  {{ value.toFixed(1) }}
                </span>
              </div>
            </div>

            <!-- Result distribution -->
            <div class="pt-6 border-t border-slate-200 dark:border-slate-700">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Result Distribution
              </span>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-green-400" />
                  <span class="text-xs text-gray-600">Pass</span>
                  <span class="text-sm font-bold text-gray-900 ml-1">{{ interviewStore.resultCounts.PASS }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-amber-400" />
                  <span class="text-xs text-gray-600">Considering</span>
                  <span class="text-sm font-bold text-gray-900 ml-1">{{ interviewStore.resultCounts.CONSIDERING }}</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 rounded-full bg-red-400" />
                  <span class="text-xs text-gray-600">Fail</span>
                  <span class="text-sm font-bold text-gray-900 ml-1">{{ interviewStore.resultCounts.FAIL }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Individual Scorecards ─── -->
      <div class="premium-card p-8">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6">
          Individual Evaluations ({{ interviewStore.scorecards.length }})
        </h2>

        <div class="space-y-4">
          <div
            v-for="sc in interviewStore.scorecards"
            :key="sc.id"
            class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 transition-colors"
          >
            <!-- Header -->
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 flex items-center justify-center text-sm font-bold shrink-0">
                  {{ sc.interviewerName.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <span class="text-base font-bold text-slate-900 dark:text-white">{{ sc.interviewerName }}</span>
                  <span class="block text-xs font-medium text-slate-500">{{ formatDate(sc.createdAt) }}</span>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span
                  class="inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full border border-current shadow-sm"
                  :class="resultConfig[sc.result].class"
                >
                  {{ resultConfig[sc.result].label }}
                </span>
                <span class="text-3xl font-black tabular-nums tracking-tight" :class="getScoreColor(sc.averageScore)">
                  {{ sc.averageScore.toFixed(1) }}
                </span>
              </div>
            </div>

            <!-- Score bars -->
            <div class="space-y-2.5 mt-4">
              <div v-for="{ label, value } in [
                { label: 'Skill', value: sc.skillScore },
                { label: 'Attitude', value: sc.attitudeScore },
                { label: 'English', value: sc.englishScore },
              ]" :key="label" class="flex items-center gap-3">
                <span class="text-xs font-bold text-slate-500 w-16 shrink-0">{{ label }}</span>
                <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    :class="getBarColor(value)"
                    :style="{ width: getBarWidth(value) }"
                  />
                </div>
                <span class="text-xs font-black tabular-nums w-6 text-right" :class="getScoreColor(value)">
                  {{ value }}
                </span>
              </div>
            </div>

            <!-- Comments -->
            <p v-if="sc.comments" class="mt-5 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 italic shadow-sm">
              "{{ sc.comments }}"
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
