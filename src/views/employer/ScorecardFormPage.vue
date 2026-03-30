<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInterviewStore } from '@/stores/interviewStore'
import type { ScorecardResult } from '@/types/enums'

const route = useRoute()
const router = useRouter()
const interviewStore = useInterviewStore()

const interviewId = computed(() => route.params.id as string)

// ── Form state ──
const skillScore = ref(5)
const attitudeScore = ref(5)
const englishScore = ref(5)
const result = ref<ScorecardResult>('CONSIDERING')
const comments = ref('')

const formErrors = ref<Record<string, string>>({})
const submitted = ref(false)

// ── Computed ──
const averagePreview = computed(() => {
  return Math.round(((skillScore.value + attitudeScore.value + englishScore.value) / 3) * 10) / 10
})

const resultOptions: { value: ScorecardResult; label: string; class: string; desc: string }[] = [
  { value: 'PASS', label: 'Pass', class: 'border-green-400 bg-green-50 text-green-700', desc: 'Recommend the candidate' },
  { value: 'CONSIDERING', label: 'Considering', class: 'border-amber-400 bg-amber-50 text-amber-700', desc: 'Need more evaluation' },
  { value: 'FAIL', label: 'Fail', class: 'border-red-400 bg-red-50 text-red-700', desc: 'Do not recommend' },
]

// ── Validation ──
function validate(): boolean {
  const errors: Record<string, string> = {}
  if (skillScore.value < 1 || skillScore.value > 10) errors.skill = 'Score must be 1-10'
  if (attitudeScore.value < 1 || attitudeScore.value > 10) errors.attitude = 'Score must be 1-10'
  if (englishScore.value < 1 || englishScore.value > 10) errors.english = 'Score must be 1-10'
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

// ── Submit ──
async function handleSubmit(): Promise<void> {
  if (!validate()) return
  const success = await interviewStore.submitScorecard(interviewId.value, {
    skillScore: skillScore.value,
    attitudeScore: attitudeScore.value,
    englishScore: englishScore.value,
    result: result.value,
    comments: comments.value || undefined,
  })
  if (success) {
    submitted.value = true
  }
}

// ── Helpers ──
function getScoreLabel(score: number): string {
  if (score >= 9) return 'Excellent'
  if (score >= 7) return 'Good'
  if (score >= 5) return 'Average'
  if (score >= 3) return 'Below Average'
  return 'Poor'
}

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600'
  if (score >= 5) return 'text-amber-600'
  return 'text-red-500'
}

function getSliderBackground(score: number): string {
  const pct = ((score - 1) / 9) * 100
  if (score >= 8) return `linear-gradient(to right, #22c55e ${pct}%, #e5e7eb ${pct}%)`
  if (score >= 5) return `linear-gradient(to right, #f59e0b ${pct}%, #e5e7eb ${pct}%)`
  return `linear-gradient(to right, #ef4444 ${pct}%, #e5e7eb ${pct}%)`
}

// ── Init ──
onMounted(async () => {
  await interviewStore.fetchInterview(interviewId.value)
})
</script>

<template>
  <div class="max-w-2xl mx-auto px-6 py-8">
    <!-- Back -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.push(`/employer/interviews/${interviewId}`)" class="text-gray-400 hover:text-gray-600 transition text-sm">
        ‹ Back to Interview
      </button>
    </div>

    <!-- Success state -->
    <div v-if="submitted" class="bg-surface border border-border rounded-lg p-8 shadow-sm text-center">
      <div class="w-16 h-16 rounded-full bg-success-bg text-success flex items-center justify-center text-2xl mx-auto mb-4">
        ✓
      </div>
      <h2 class="text-lg font-bold text-gray-900 mb-2">Scorecard Submitted</h2>
      <p class="text-sm text-gray-500 mb-5">Your evaluation has been recorded successfully.</p>
      <div class="flex justify-center gap-3">
        <button
          @click="router.push(`/employer/interviews/${interviewId}`)"
          class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition"
        >
          Back to Interview
        </button>
      </div>
    </div>

    <!-- Form -->
    <div v-else class="space-y-5">
      <!-- Header -->
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <h1 class="text-xl font-bold text-gray-900 mb-1">Submit Scorecard</h1>
        <p v-if="interviewStore.currentInterview" class="text-sm text-gray-500">
          {{ interviewStore.currentInterview.title }}
        </p>
      </div>

      <!-- Score Sliders -->
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-6">
        <h2 class="text-sm font-semibold text-gray-900">Evaluation Scores</h2>

        <!-- Skill Score -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Technical Skill
            </label>
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold tabular-nums" :class="getScoreColor(skillScore)">
                {{ skillScore }}
              </span>
              <span class="text-[10px] text-gray-400">/10</span>
            </div>
          </div>
          <input
            v-model.number="skillScore"
            type="range"
            min="1"
            max="10"
            step="1"
            class="scorecard-slider w-full"
            :style="{ background: getSliderBackground(skillScore) }"
          />
          <div class="flex items-center justify-between mt-1">
            <span class="text-[10px] text-gray-400">1 — Poor</span>
            <span class="text-xs font-medium" :class="getScoreColor(skillScore)">
              {{ getScoreLabel(skillScore) }}
            </span>
            <span class="text-[10px] text-gray-400">10 — Excellent</span>
          </div>
          <p v-if="formErrors.skill" class="text-[11px] text-error mt-1">{{ formErrors.skill }}</p>
        </div>

        <!-- Attitude Score -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Attitude & Culture Fit
            </label>
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold tabular-nums" :class="getScoreColor(attitudeScore)">
                {{ attitudeScore }}
              </span>
              <span class="text-[10px] text-gray-400">/10</span>
            </div>
          </div>
          <input
            v-model.number="attitudeScore"
            type="range"
            min="1"
            max="10"
            step="1"
            class="scorecard-slider w-full"
            :style="{ background: getSliderBackground(attitudeScore) }"
          />
          <div class="flex items-center justify-between mt-1">
            <span class="text-[10px] text-gray-400">1 — Poor</span>
            <span class="text-xs font-medium" :class="getScoreColor(attitudeScore)">
              {{ getScoreLabel(attitudeScore) }}
            </span>
            <span class="text-[10px] text-gray-400">10 — Excellent</span>
          </div>
          <p v-if="formErrors.attitude" class="text-[11px] text-error mt-1">{{ formErrors.attitude }}</p>
        </div>

        <!-- English Score -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              English Proficiency
            </label>
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold tabular-nums" :class="getScoreColor(englishScore)">
                {{ englishScore }}
              </span>
              <span class="text-[10px] text-gray-400">/10</span>
            </div>
          </div>
          <input
            v-model.number="englishScore"
            type="range"
            min="1"
            max="10"
            step="1"
            class="scorecard-slider w-full"
            :style="{ background: getSliderBackground(englishScore) }"
          />
          <div class="flex items-center justify-between mt-1">
            <span class="text-[10px] text-gray-400">1 — Poor</span>
            <span class="text-xs font-medium" :class="getScoreColor(englishScore)">
              {{ getScoreLabel(englishScore) }}
            </span>
            <span class="text-[10px] text-gray-400">10 — Excellent</span>
          </div>
          <p v-if="formErrors.english" class="text-[11px] text-error mt-1">{{ formErrors.english }}</p>
        </div>

        <!-- Average Preview -->
        <div class="pt-4 border-t border-border flex items-center justify-between">
          <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Score</span>
          <div class="flex items-center gap-2">
            <span class="text-3xl font-bold tabular-nums" :class="getScoreColor(averagePreview)">
              {{ averagePreview.toFixed(1) }}
            </span>
            <span class="text-xs text-gray-400">/10</span>
          </div>
        </div>
      </div>

      <!-- Result Selection -->
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <h2 class="text-sm font-semibold text-gray-900 mb-4">Overall Result</h2>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="opt in resultOptions"
            :key="opt.value"
            @click="result = opt.value"
            class="p-4 rounded-lg border-2 text-center transition-all"
            :class="result === opt.value
              ? opt.class + ' ring-2 ring-offset-1'
              : 'border-border bg-surface text-gray-500 hover:border-gray-300'"
          >
            <span class="block text-lg font-bold mb-0.5">
              {{ opt.value === 'PASS' ? '✓' : opt.value === 'FAIL' ? '✕' : '~' }}
            </span>
            <span class="block text-sm font-semibold">{{ opt.label }}</span>
            <span class="block text-[10px] mt-0.5 opacity-70">{{ opt.desc }}</span>
          </button>
        </div>
      </div>

      <!-- Comments -->
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <h2 class="text-sm font-semibold text-gray-900 mb-3">Comments</h2>
        <textarea
          v-model="comments"
          rows="4"
          placeholder="Share your detailed observations, key strengths, concerns, and recommendation notes…"
          class="w-full px-3 py-2 text-sm border border-border rounded-md bg-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition resize-none"
        />
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3">
        <button
          @click="router.push(`/employer/interviews/${interviewId}`)"
          class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="interviewStore.submitScorecardLoading"
          class="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="interviewStore.submitScorecardLoading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {{ interviewStore.submitScorecardLoading ? 'Submitting…' : 'Submit Scorecard' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scorecard-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.scorecard-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  border: 3px solid currentColor;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  cursor: grab;
  transition: box-shadow 0.15s;
}

.scorecard-slider::-webkit-slider-thumb:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.scorecard-slider::-webkit-slider-thumb:active {
  cursor: grabbing;
}

.scorecard-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: white;
  border: 3px solid currentColor;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  cursor: grab;
}
</style>
