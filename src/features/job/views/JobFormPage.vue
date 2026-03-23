<script setup lang="ts">
// src/features/job/views/JobFormPage.vue
// Create Job form. Validates via Zod (createJobSchema) and calls useJobStore.createJob().
// Description is rendered as a DOMPurify-sanitized HTML preview.

import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ROUTE_NAMES } from '@/core/constants/route-names'
import DOMPurify from 'dompurify'
import { ArrowLeft, Eye, EyeOff } from 'lucide-vue-next'
import PipelineSidebar from '@/features/workspace/components/PipelineSidebar.vue'
import PipelineTopBar from '@/features/workspace/components/PipelineTopBar.vue'
import { useJobStore } from '@/features/job/stores/useJobStore'
import { createJobSchema, createJobDefaults } from '@/features/job/schemas/job.schema'
import { useToast } from 'vue-toastification'

const router = useRouter()
const jobStore = useJobStore()
const toast = useToast()

// ── Form state ─────────────────────────────────────────────────────────────
const form = reactive({ ...createJobDefaults })
const fieldErrors = ref<Record<string, string>>({})
const submitError = ref<string | null>(null)
const showPreview = ref(false)

// ── Mock lookup options (replace with API calls in a future iteration) ──────
const departmentOptions = [
  { id: 'dept-engineering', name: 'Engineering' },
  { id: 'dept-design', name: 'Design' },
  { id: 'dept-marketing', name: 'Marketing' },
  { id: 'dept-sales', name: 'Sales' },
  { id: 'dept-hr', name: 'Human Resources' },
  { id: 'dept-finance', name: 'Finance' },
  { id: 'dept-operations', name: 'Operations' },
]

const locationOptions = [
  { id: 'loc-hanoi', name: 'Hanoi' },
  { id: 'loc-hcm', name: 'Ho Chi Minh City' },
  { id: 'loc-danang', name: 'Da Nang' },
  { id: 'loc-remote', name: 'Remote' },
  { id: 'loc-hybrid', name: 'Hybrid' },
]

const categoryOptions = [
  { id: 'cat-software', name: 'Software Development' },
  { id: 'cat-data', name: 'Data & Analytics' },
  { id: 'cat-design', name: 'UI/UX Design' },
  { id: 'cat-product', name: 'Product Management' },
  { id: 'cat-marketing', name: 'Digital Marketing' },
  { id: 'cat-finance', name: 'Finance & Accounting' },
  { id: 'cat-hr', name: 'Human Resources' },
]

const currencyOptions = ['VND', 'USD', 'EUR', 'SGD']

// ── Computed ────────────────────────────────────────────────────────────────
const safeDescriptionHtml = computed(() =>
  DOMPurify.sanitize(form.description),
)

const isSubmitting = computed(() => jobStore.isLoading)

const isEditable = computed(() => {
  // If no job is loaded (creation mode), it evaluates to true (draft by default)
  if (!jobStore.currentJob) return true;
  return jobStore.currentJob.status === 'DRAFT';
});
const canPublish = computed(() => jobStore.currentJob?.status === 'DRAFT');
const canClose   = computed(() => jobStore.currentJob?.status === 'PUBLISHED');

const publishing = ref(false)
const closing = ref(false)

// ── Handlers ────────────────────────────────────────────────────────────────
async function handlePublish() {
  if (!canPublish.value || !jobStore.currentJob) return
  publishing.value = true
  try {
    await jobStore.publishJob(jobStore.currentJob.id)
  } catch (err: any) {
    if (err.response?.status === 403) {
      window.dispatchEvent(new CustomEvent('quota:exceeded'))
    }
  } finally {
    publishing.value = false
  }
}

async function handleClose() {
  if (!canClose.value || !jobStore.currentJob) return
  closing.value = true
  try {
    await jobStore.closeJob(jobStore.currentJob.id)
  } finally {
    closing.value = false
  }
}
function clearErrors(): void {
  fieldErrors.value = {}
  submitError.value = null
}

// ── Submit ─────────────────────────────────────────────────────────────────
async function handleSubmit(): Promise<void> {
  clearErrors()

  // Build the payload object (convert empty strings to undefined for optional fields)
  const rawPayload = {
    ...form,
    min_salary: form.min_salary ? Number(form.min_salary) : undefined,
    max_salary: form.max_salary ? Number(form.max_salary) : undefined,
    requirements: form.requirements || undefined,
  }

  const result = createJobSchema.safeParse(rawPayload)

  if (!result.success) {
    // Map Zod field errors to fieldErrors ref
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string
      if (!fieldErrors.value[field]) {
        fieldErrors.value[field] = issue.message
      }
    }
    return
  }

  try {
    await jobStore.createJob(result.data)
    toast.success('Job created successfully and saved as Draft.')
    router.push({ name: ROUTE_NAMES.JOB_LIST })
  } catch {
    submitError.value =
      jobStore.error ?? 'Failed to create the job. Please try again.'
  }
}

function handleCancel(): void {
  router.push({ name: ROUTE_NAMES.JOB_LIST })
}
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-surface overflow-hidden text-text-primary font-sans">
    <PipelineTopBar />

    <div class="flex-1 flex overflow-hidden">
      <PipelineSidebar />

      <main class="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface-soft scrollbar-hide">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-8 pb-4 border-b border-border">
          <button
            @click="handleCancel"
            class="p-2 rounded-lg border border-border hover:bg-surface-muted transition-colors text-text-secondary"
            aria-label="Back to job list"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <div>
            <nav class="flex text-sm text-text-muted mb-1 font-medium">
              <span class="hover:text-brand cursor-pointer" @click="$router.push({ name: ROUTE_NAMES.WORKSPACE })">
                Workspace
              </span>
              <span class="mx-2">/</span>
              <span class="hover:text-brand cursor-pointer" @click="$router.push({ name: ROUTE_NAMES.JOB_LIST })">
                Job Management
              </span>
              <span class="mx-2">/</span>
              <span class="text-text-primary">Create Job</span>
            </nav>
            <h1 class="text-2xl font-display font-bold text-text-primary">Create New Job</h1>
          </div>
        </div>

        <!-- Submit Error -->
        <div
          v-if="submitError"
          class="mb-6 p-4 bg-danger-light border border-danger/20 rounded-xl text-sm text-danger-dark font-medium"
        >
          {{ submitError }}
        </div>

        <form @submit.prevent="handleSubmit" novalidate class="space-y-6 max-w-3xl">
          <fieldset :disabled="!isEditable" class="space-y-6">
          <!-- Card: Basic Info -->
          <div class="bg-white border border-border rounded-xl shadow-xs p-6 space-y-5">
            <h2 class="text-base font-bold text-text-primary pb-3 border-b border-border">
              Basic Information
            </h2>

            <!-- Title -->
            <div>
              <label for="job-title" class="block text-sm font-semibold text-text-primary mb-1.5">
                Job Title <span class="text-danger">*</span>
              </label>
              <input
                id="job-title"
                v-model="form.title"
                type="text"
                placeholder="e.g. Senior Frontend Developer"
                :class="[
                  'w-full px-3 py-2 rounded-lg border text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-shadow',
                  fieldErrors.title
                    ? 'border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]'
                    : 'border-border focus:border-brand-dark focus:shadow-focus',
                ]"
              />
              <p v-if="fieldErrors.title" class="mt-1 text-xs text-danger">{{ fieldErrors.title }}</p>
            </div>

            <!-- Department / Location / Category -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Department -->
              <div>
                <label for="job-department" class="block text-sm font-semibold text-text-primary mb-1.5">
                  Department <span class="text-danger">*</span>
                </label>
                <select
                  id="job-department"
                  v-model="form.department_id"
                  :class="[
                    'w-full px-3 py-2 rounded-lg border text-sm text-text-primary focus:outline-none transition-shadow bg-white',
                    fieldErrors.department_id
                      ? 'border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]'
                      : 'border-border focus:border-brand-dark focus:shadow-focus',
                  ]"
                >
                  <option value="" disabled>Select department</option>
                  <option
                    v-for="dept in departmentOptions"
                    :key="dept.id"
                    :value="dept.id"
                  >
                    {{ dept.name }}
                  </option>
                </select>
                <p v-if="fieldErrors.department_id" class="mt-1 text-xs text-danger">
                  {{ fieldErrors.department_id }}
                </p>
              </div>

              <!-- Location -->
              <div>
                <label for="job-location" class="block text-sm font-semibold text-text-primary mb-1.5">
                  Location <span class="text-danger">*</span>
                </label>
                <select
                  id="job-location"
                  v-model="form.location_id"
                  :class="[
                    'w-full px-3 py-2 rounded-lg border text-sm text-text-primary focus:outline-none transition-shadow bg-white',
                    fieldErrors.location_id
                      ? 'border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]'
                      : 'border-border focus:border-brand-dark focus:shadow-focus',
                  ]"
                >
                  <option value="" disabled>Select location</option>
                  <option
                    v-for="loc in locationOptions"
                    :key="loc.id"
                    :value="loc.id"
                  >
                    {{ loc.name }}
                  </option>
                </select>
                <p v-if="fieldErrors.location_id" class="mt-1 text-xs text-danger">
                  {{ fieldErrors.location_id }}
                </p>
              </div>

              <!-- Category -->
              <div>
                <label for="job-category" class="block text-sm font-semibold text-text-primary mb-1.5">
                  Category <span class="text-danger">*</span>
                </label>
                <select
                  id="job-category"
                  v-model="form.category_id"
                  :class="[
                    'w-full px-3 py-2 rounded-lg border text-sm text-text-primary focus:outline-none transition-shadow bg-white',
                    fieldErrors.category_id
                      ? 'border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]'
                      : 'border-border focus:border-brand-dark focus:shadow-focus',
                  ]"
                >
                  <option value="" disabled>Select category</option>
                  <option
                    v-for="cat in categoryOptions"
                    :key="cat.id"
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </option>
                </select>
                <p v-if="fieldErrors.category_id" class="mt-1 text-xs text-danger">
                  {{ fieldErrors.category_id }}
                </p>
              </div>
            </div>

            <!-- Deadline -->
            <div class="max-w-xs">
              <label for="job-deadline" class="block text-sm font-semibold text-text-primary mb-1.5">
                Application Deadline <span class="text-danger">*</span>
              </label>
              <input
                id="job-deadline"
                v-model="form.deadline"
                type="date"
                :class="[
                  'w-full px-3 py-2 rounded-lg border text-sm text-text-primary focus:outline-none transition-shadow bg-white',
                  fieldErrors.deadline
                    ? 'border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]'
                    : 'border-border focus:border-brand-dark focus:shadow-focus',
                ]"
              />
              <p v-if="fieldErrors.deadline" class="mt-1 text-xs text-danger">
                {{ fieldErrors.deadline }}
              </p>
            </div>
          </div>

          <!-- Card: Compensation -->
          <div class="bg-white border border-border rounded-xl shadow-xs p-6 space-y-5">
            <h2 class="text-base font-bold text-text-primary pb-3 border-b border-border">
              Compensation
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Min Salary -->
              <div>
                <label for="job-min-salary" class="block text-sm font-semibold text-text-primary mb-1.5">
                  Min Salary
                </label>
                <input
                  id="job-min-salary"
                  v-model.number="form.min_salary"
                  type="number"
                  min="0"
                  placeholder="e.g. 20000000"
                  :disabled="form.is_negotiable"
                  :class="[
                    'w-full px-3 py-2 rounded-lg border text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-shadow disabled:opacity-50 disabled:bg-surface-muted',
                    fieldErrors.min_salary
                      ? 'border-danger'
                      : 'border-border focus:border-brand-dark focus:shadow-focus',
                  ]"
                />
                <p v-if="fieldErrors.min_salary" class="mt-1 text-xs text-danger">{{ fieldErrors.min_salary }}</p>
              </div>

              <!-- Max Salary -->
              <div>
                <label for="job-max-salary" class="block text-sm font-semibold text-text-primary mb-1.5">
                  Max Salary
                </label>
                <input
                  id="job-max-salary"
                  v-model.number="form.max_salary"
                  type="number"
                  min="0"
                  placeholder="e.g. 35000000"
                  :disabled="form.is_negotiable"
                  :class="[
                    'w-full px-3 py-2 rounded-lg border text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-shadow disabled:opacity-50 disabled:bg-surface-muted',
                    fieldErrors.max_salary
                      ? 'border-danger'
                      : 'border-border focus:border-brand-dark focus:shadow-focus',
                  ]"
                />
                <p v-if="fieldErrors.max_salary" class="mt-1 text-xs text-danger">{{ fieldErrors.max_salary }}</p>
              </div>

              <!-- Currency -->
              <div>
                <label for="job-currency" class="block text-sm font-semibold text-text-primary mb-1.5">
                  Currency
                </label>
                <select
                  id="job-currency"
                  v-model="form.currency"
                  :disabled="form.is_negotiable"
                  class="w-full px-3 py-2 rounded-lg border border-border text-sm text-text-primary focus:outline-none focus:border-brand-dark focus:shadow-focus transition-shadow bg-white disabled:opacity-50 disabled:bg-surface-muted"
                >
                  <option v-for="c in currencyOptions" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
            </div>

            <!-- Negotiable toggle -->
            <label class="flex items-center gap-3 cursor-pointer w-fit">
              <input
                id="job-negotiable"
                v-model="form.is_negotiable"
                type="checkbox"
                class="w-4 h-4 rounded border-border text-brand accent-brand cursor-pointer"
              />
              <span class="text-sm text-text-primary font-medium">Salary is negotiable</span>
            </label>
          </div>

          <!-- Card: Description -->
          <div class="bg-white border border-border rounded-xl shadow-xs p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-border">
              <h2 class="text-base font-bold text-text-primary">
                Job Description <span class="text-danger">*</span>
              </h2>
              <button
                type="button"
                @click="showPreview = !showPreview"
                class="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
              >
                <component :is="showPreview ? EyeOff : Eye" class="w-3.5 h-3.5" />
                {{ showPreview ? 'Edit' : 'Preview' }}
              </button>
            </div>

            <!-- Textarea -->
            <div v-if="!showPreview">
              <textarea
                id="job-description"
                v-model="form.description"
                rows="10"
                placeholder="Describe the role, responsibilities, what a typical day looks like..."
                :class="[
                  'w-full px-3 py-2 rounded-lg border text-sm text-text-primary placeholder:text-text-muted focus:outline-none transition-shadow resize-y font-mono',
                  fieldErrors.description
                    ? 'border-danger focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]'
                    : 'border-border focus:border-brand-dark focus:shadow-focus',
                ]"
              />
              <p v-if="fieldErrors.description" class="mt-1 text-xs text-danger">
                {{ fieldErrors.description }}
              </p>
              <p class="mt-1.5 text-xs text-text-muted">
                Basic HTML tags supported (b, i, ul, li, p, a). Content will be sanitized before display.
              </p>
            </div>

            <!-- Sanitized HTML Preview -->
            <div
              v-else
              class="min-h-40 p-4 bg-surface-soft rounded-lg border border-border-subtle prose prose-sm max-w-none text-text-primary"
              v-html="safeDescriptionHtml"
            />
          </div>

          <!-- Card: Requirements (optional) -->
          <div class="bg-white border border-border rounded-xl shadow-xs p-6 space-y-4">
            <h2 class="text-base font-bold text-text-primary pb-3 border-b border-border">
              Requirements
              <span class="text-sm font-normal text-text-muted ml-1">(optional)</span>
            </h2>
            <textarea
              id="job-requirements"
              v-model="form.requirements"
              rows="5"
              placeholder="List candidate requirements: years of experience, skills, education..."
              class="w-full px-3 py-2 rounded-lg border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-dark focus:shadow-focus transition-shadow resize-y"
            />
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end gap-3 pt-2 pb-8">
            <button
              type="button"
              @click="handleCancel"
              class="px-5 py-2.5 text-sm font-semibold text-text-secondary border border-border rounded-lg hover:bg-surface-muted transition-colors"
            >
              Cancel
            </button>
            <button
              v-if="!isEditable"
              type="button"
              disabled
              title="Chỉ có thể chỉnh sửa khi công việc ở trạng thái Bản nháp"
              class="px-6 py-2.5 text-sm font-semibold bg-surface-muted text-text-muted rounded-lg shadow-sm border border-border cursor-not-allowed opacity-50"
            >
              Chỉnh sửa
            </button>
            <button
              v-if="canPublish"
              type="button"
              @click="handlePublish"
              :disabled="publishing"
              class="px-6 py-2.5 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors shadow-brand-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span v-if="publishing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 inline-block align-middle" />
              Đăng tuyển
            </button>
            <button
              v-if="canClose"
              type="button"
              @click="handleClose"
              :disabled="closing"
              class="px-6 py-2.5 text-sm font-semibold bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span v-if="closing" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 inline-block align-middle" />
              Đóng tuyển
            </button>
            <button
              v-if="isEditable"
              id="btn-submit-job"
              type="submit"
              :disabled="isSubmitting"
              class="px-6 py-2.5 text-sm font-semibold bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors shadow-brand-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {{ isSubmitting ? 'Creating...' : 'Save as Draft' }}
            </button>
          </div>
        </form>
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
