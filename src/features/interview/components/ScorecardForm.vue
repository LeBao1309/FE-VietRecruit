// src/features/interview/components/ScorecardForm.vue
// Form for INTERVIEWER to submit a scorecard for a COMPLETED interview.
// Includes real-time live average preview as scores are typed.
// Validated with Zod submitScorecardSchema (safeParse only, never parse()).
<script setup lang="ts">
import { reactive, computed } from 'vue'
import { z } from 'zod'
import { Star, X } from 'lucide-vue-next'
import { useScorecardStore } from '@/features/interview/stores/useScorecardStore'
import type { ScorecardResult } from '@/features/interview/types/interview.dto'

const props = defineProps<{ interviewId: string }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'submitted'): void }>()

const store = useScorecardStore()

// ── Zod schema ────────────────────────────────────────────────────────────────
const submitScorecardSchema = z.object({
  skillScore:    z.number().min(0, 'Min 0').max(10, 'Max 10'),
  attitudeScore: z.number().min(0, 'Min 0').max(10, 'Max 10'),
  englishScore:  z.number().min(0, 'Min 0').max(10, 'Max 10'),
  overallNote:   z.string().optional(),
  result:        z.enum(['PASS', 'FAIL', 'CONSIDERING']),
})

// ── Form state ────────────────────────────────────────────────────────────────
const form = reactive({
  skillScore:    '' as string | number,
  attitudeScore: '' as string | number,
  englishScore:  '' as string | number,
  overallNote:   '',
  result:        '' as ScorecardResult | '',
})

const fieldErrors = reactive<Record<string, string | undefined>>({})

// ── Live average preview (real-time, no validation triggered) ─────────────────
const liveAverage = computed(() => {
  const s = Number(form.skillScore)
  const a = Number(form.attitudeScore)
  const e = Number(form.englishScore)
  if (isNaN(s) || isNaN(a) || isNaN(e)) return null
  if (form.skillScore === '' || form.attitudeScore === '' || form.englishScore === '') return null
  return ((s + a + e) / 3).toFixed(2)
})

const liveAverageClass = computed(() => {
  if (liveAverage.value === null) return 'text-text-muted'
  const n = Number(liveAverage.value)
  if (n >= 7) return 'text-green-600'
  if (n >= 5) return 'text-yellow-600'
  return 'text-red-600'
})

// ── Submit ────────────────────────────────────────────────────────────────────
async function onSubmit(): Promise<void> {
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])

  const payload = {
    skillScore:    Number(form.skillScore),
    attitudeScore: Number(form.attitudeScore),
    englishScore:  Number(form.englishScore),
    overallNote:   form.overallNote || undefined,
    result:        form.result as ScorecardResult,
  }

  const result = submitScorecardSchema.safeParse(payload)
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0])
      fieldErrors[key] = issue.message
    }
    return
  }

  try {
    await store.submitScorecard(props.interviewId, result.data)
    emit('submitted')
    emit('close')
  } catch {
    // error is set in the store
  }
}

const RESULT_OPTIONS: { value: ScorecardResult; label: string; class: string }[] = [
  { value: 'PASS',        label: 'Pass',        class: 'border-green-400 bg-green-50 text-green-700' },
  { value: 'FAIL',        label: 'Fail',        class: 'border-red-400 bg-red-50 text-red-700' },
  { value: 'CONSIDERING', label: 'Considering', class: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
]
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-border">
        <div class="flex items-center gap-2">
          <Star class="w-5 h-5 text-brand" />
          <h2 class="text-lg font-bold text-text-primary">Submit Scorecard</h2>
        </div>
        <button
          class="p-1.5 hover:bg-surface-muted rounded-lg transition-colors text-text-muted"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Live average preview banner -->
      <div
        class="px-6 py-3 bg-surface-soft border-b border-border flex items-center justify-between"
      >
        <span class="text-sm text-text-muted font-medium">Live Average Score</span>
        <span :class="['text-2xl font-bold tabular-nums', liveAverageClass]">
          {{ liveAverage ?? '—' }}
          <span class="text-sm font-normal text-text-muted">/ 10</span>
        </span>
      </div>

      <!-- Form body -->
      <form class="p-6 space-y-4" @submit.prevent="onSubmit">

        <!-- Score fields -->
        <div class="grid grid-cols-3 gap-3">
          <div v-for="field in [
            { key: 'skillScore',    label: 'Skill' },
            { key: 'attitudeScore', label: 'Attitude' },
            { key: 'englishScore',  label: 'English' },
          ]" :key="field.key">
            <label class="block text-xs font-semibold text-text-primary mb-1">
              {{ field.label }} <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="(form as any)[field.key]"
              type="number"
              min="0"
              max="10"
              step="0.5"
              placeholder="0–10"
              class="w-full border border-border rounded-lg px-3 py-2 text-sm text-center
                     focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand
                     font-mono font-bold"
            />
            <p v-if="fieldErrors[field.key]" class="text-xs text-red-500 mt-0.5">
              {{ fieldErrors[field.key] }}
            </p>
          </div>
        </div>

        <!-- Result selection -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">
            Overall Result <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-2">
            <button
              v-for="opt in RESULT_OPTIONS"
              :key="opt.value"
              type="button"
              :class="[
                'flex-1 px-3 py-2 rounded-lg text-sm font-semibold border-2 transition-all',
                form.result === opt.value ? opt.class + ' border-2' : 'border-border text-text-muted hover:border-brand/30',
              ]"
              @click="form.result = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          <p v-if="fieldErrors['result']" class="text-xs text-red-500 mt-1">
            {{ fieldErrors['result'] }}
          </p>
        </div>

        <!-- Overall note -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1">Overall Note</label>
          <textarea
            v-model="form.overallNote"
            rows="3"
            placeholder="Strengths, areas for improvement, any observations..."
            class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none
                   focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
          />
        </div>

        <!-- Store error -->
        <p v-if="store.error" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {{ store.error }}
        </p>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            class="flex-1 px-4 py-2 border border-border text-sm font-medium rounded-lg
                   hover:bg-surface-muted transition-colors"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="store.isSubmitting"
            class="flex-1 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg
                   hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ store.isSubmitting ? 'Submitting...' : 'Submit Scorecard' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
