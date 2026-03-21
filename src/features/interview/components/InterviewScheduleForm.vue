// src/features/interview/components/InterviewScheduleForm.vue
// Modal form to schedule a new interview. Validated by Zod scheduleInterviewSchema.
// location OR meetingLink must be provided (cross-field refine).
<script setup lang="ts">
import { reactive, computed } from 'vue'
import { z } from 'zod'
import { X, Calendar, MapPin, Link2, Users } from 'lucide-vue-next'
import { useInterviewStore } from '@/features/interview/stores/useInterviewStore'

const emit = defineEmits<{ (e: 'close'): void; (e: 'created'): void }>()

const props = defineProps<{ applicationId: string; jobId: string }>()

const store = useInterviewStore()

// ── Zod schema ────────────────────────────────────────────────────────────────
const scheduleInterviewSchema = z
  .object({
    applicationId:  z.string().min(1),
    jobId:          z.string().min(1),
    scheduledAt:    z.string().min(1, 'Scheduled time is required').refine((v) => {
      return new Date(v) > new Date()
    }, 'Scheduled time must be in the future'),
    interviewerIds: z.array(z.string().min(1)).min(1, 'Add at least one interviewer'),
    location:       z.string().optional(),
    meetingLink:    z.string().url('Must be a valid URL').optional().or(z.literal('')),
    notes:          z.string().optional(),
  })
  .refine((d) => !!(d.location || d.meetingLink), {
    message: 'Provide either a physical location or a meeting link',
    path: ['location'],
  })

// ── Form state ────────────────────────────────────────────────────────────────
const form = reactive({
  scheduledAt: '',
  interviewerIdsRaw: '', // comma-separated IDs entered by HR
  location: '',
  meetingLink: '',
  notes: '',
})

const fieldErrors = reactive<Record<string, string | undefined>>({})

const interviewerIds = computed(() =>
  form.interviewerIdsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
)

// ── Submit ────────────────────────────────────────────────────────────────────
async function onSubmit(): Promise<void> {
  Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])

  const payload = {
    applicationId:  props.applicationId,
    jobId:          props.jobId,
    scheduledAt:    form.scheduledAt,
    interviewerIds: interviewerIds.value,
    location:       form.location || undefined,
    meetingLink:    form.meetingLink || undefined,
    notes:          form.notes || undefined,
  }

  const result = scheduleInterviewSchema.safeParse(payload)
  if (!result.success) {
    const issues = result.error.issues
    for (const issue of issues) {
      const key = String(issue.path[0])
      fieldErrors[key] = issue.message
    }
    return
  }

  try {
    await store.scheduleInterview(result.data)
    emit('created')
    emit('close')
  } catch {
    // error is already set in the store
  }
}
</script>

<template>
  <!-- Modal backdrop -->
  <div
    class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-border">
        <div class="flex items-center gap-2">
          <Calendar class="w-5 h-5 text-brand" />
          <h2 class="text-lg font-bold text-text-primary">Schedule Interview</h2>
        </div>
        <button
          class="p-1.5 hover:bg-surface-muted rounded-lg transition-colors text-text-muted"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Form body -->
      <form class="p-6 space-y-4" @submit.prevent="onSubmit">

        <!-- Scheduled At -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1">
            Date & Time <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.scheduledAt"
            type="datetime-local"
            class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none
                   focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
          <p v-if="fieldErrors['scheduledAt']" class="text-xs text-red-500 mt-1">
            {{ fieldErrors['scheduledAt'] }}
          </p>
        </div>

        <!-- Interviewers -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1">
            <Users class="w-4 h-4 inline mr-1" />
            Interviewer IDs <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.interviewerIdsRaw"
            type="text"
            placeholder="uuid-1, uuid-2, ..."
            class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none
                   focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono"
          />
          <p class="text-xs text-text-muted mt-0.5">Comma-separated user IDs</p>
          <p v-if="fieldErrors['interviewerIds']" class="text-xs text-red-500 mt-1">
            {{ fieldErrors['interviewerIds'] }}
          </p>
        </div>

        <!-- Location -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1">
            <MapPin class="w-4 h-4 inline mr-1" />
            Physical Location
          </label>
          <input
            v-model="form.location"
            type="text"
            placeholder="e.g. Room 3B, 123 Le Loi St."
            class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none
                   focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
          <p v-if="fieldErrors['location']" class="text-xs text-red-500 mt-1">
            {{ fieldErrors['location'] }}
          </p>
        </div>

        <!-- Meeting Link -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1">
            <Link2 class="w-4 h-4 inline mr-1" />
            Meeting Link
          </label>
          <input
            v-model="form.meetingLink"
            type="url"
            placeholder="https://meet.google.com/..."
            class="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none
                   focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
          <p v-if="fieldErrors['meetingLink']" class="text-xs text-red-500 mt-1">
            {{ fieldErrors['meetingLink'] }}
          </p>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-text-primary mb-1">Notes</label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="Optional preparation notes..."
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
            :disabled="store.isSaving"
            class="flex-1 px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg
                   hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ store.isSaving ? 'Scheduling...' : 'Schedule Interview' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
