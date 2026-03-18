<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useCompanyStore } from '@/features/company/stores/useCompanyStore'
import { CompanyUpdateRequestSchema } from '@/features/company/types/company.dto'

const store = useCompanyStore()

// ── Form state ──
const name = ref('')
const domain = ref('')
const website = ref('')

// ── Validation ──
type FieldName = 'name' | 'domain' | 'website'
const fieldErrors = ref<Partial<Record<FieldName, string>>>({})
const submitted = ref(false)
const successMsg = ref('')

onMounted(async () => {
  await store.fetchCompany()
  if (store.company) {
    name.value = store.company.name ?? ''
    domain.value = store.company.domain ?? ''
    website.value = store.company.website ?? ''
  }
})

function validate(): boolean {
  const result = CompanyUpdateRequestSchema.safeParse({
    name: name.value,
    domain: domain.value || undefined,
    website: website.value || undefined,
  })

  const errs: Partial<Record<FieldName, string>> = {}
  if (!result.success) {
    for (const issue of result.error.issues) {
      const key = String(issue.path[0]) as FieldName
      if (!errs[key]) errs[key] = issue.message
    }
  }
  fieldErrors.value = errs
  return result.success
}

async function handleSubmit(): Promise<void> {
  submitted.value = true
  successMsg.value = ''
  if (!validate()) return

  const ok = await store.updateCompany({
    name: name.value,
    domain: domain.value || undefined,
    website: website.value || undefined,
  })

  if (ok) {
    successMsg.value = 'Cập nhật thông tin công ty thành công.'
    submitted.value = false
  }
}

// Clear notifications on any input change
watch([name, domain, website], () => {
  if (store.error) store.clearError()
  successMsg.value = ''
})
</script>

<template>
  <!-- Loading skeleton -->
  <div v-if="store.isLoading" class="card space-y-5 animate-pulse">
    <div class="h-4 bg-surface-muted rounded w-1/3"></div>
    <div class="h-10 bg-surface-muted rounded"></div>
    <div class="h-4 bg-surface-muted rounded w-1/4"></div>
    <div class="h-10 bg-surface-muted rounded"></div>
    <div class="h-4 bg-surface-muted rounded w-1/4"></div>
    <div class="h-10 bg-surface-muted rounded"></div>
  </div>

  <!-- Form -->
  <div v-else class="card">
    <!-- Success notification -->
    <div
      v-if="successMsg"
      role="status"
      class="mb-6 p-3 rounded-lg bg-brand-light text-brand-dark text-sm"
    >
      {{ successMsg }}
    </div>

    <!-- Error notification -->
    <div
      v-if="store.error"
      role="alert"
      class="mb-6 p-3 rounded-lg bg-danger/10 text-danger text-sm"
    >
      {{ store.error }}
    </div>

    <form class="space-y-5" novalidate @submit.prevent="handleSubmit">
      <!-- Company Name -->
      <div>
        <label
          for="settings-company-name"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Tên công ty <span class="text-danger">*</span>
        </label>
        <input
          id="settings-company-name"
          v-model="name"
          type="text"
          autocomplete="organization"
          placeholder="Công ty TNHH ABC"
          maxlength="255"
          class="input"
          :class="{ '!border-danger': submitted && fieldErrors.name }"
        />
        <p
          v-if="submitted && fieldErrors.name"
          class="text-danger text-xs mt-1.5"
        >
          {{ fieldErrors.name }}
        </p>
      </div>

      <!-- Domain / Industry -->
      <div>
        <label
          for="settings-company-domain"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Lĩnh vực hoạt động
          <span class="normal-case tracking-normal font-normal text-text-muted">(Tùy chọn)</span>
        </label>
        <input
          id="settings-company-domain"
          v-model="domain"
          type="text"
          placeholder="Công nghệ thông tin"
          maxlength="255"
          class="input"
          :class="{ '!border-danger': submitted && fieldErrors.domain }"
        />
        <p
          v-if="submitted && fieldErrors.domain"
          class="text-danger text-xs mt-1.5"
        >
          {{ fieldErrors.domain }}
        </p>
      </div>

      <!-- Website -->
      <div>
        <label
          for="settings-company-website"
          class="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5"
        >
          Website
          <span class="normal-case tracking-normal font-normal text-text-muted">(Tùy chọn)</span>
        </label>
        <input
          id="settings-company-website"
          v-model="website"
          type="url"
          placeholder="https://abc.com.vn"
          maxlength="255"
          class="input"
          :class="{ '!border-danger': submitted && fieldErrors.website }"
        />
        <p
          v-if="submitted && fieldErrors.website"
          class="text-danger text-xs mt-1.5"
        >
          {{ fieldErrors.website }}
        </p>
      </div>

      <!-- Submit -->
      <div class="pt-2">
        <button
          id="settings-company-submit"
          type="submit"
          class="btn-primary px-8 py-2.5"
          :disabled="store.isSaving"
        >
          <svg
            v-if="store.isSaving"
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span v-else>Save</span>
        </button>
      </div>
    </form>
  </div>
</template>
