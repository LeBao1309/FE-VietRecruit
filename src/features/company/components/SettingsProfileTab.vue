<script setup lang="ts">
import { ref, watch } from 'vue'

interface Company {
  name: string
  domain?: string
  website?: string
}

const props = defineProps<{
  company: Company | null
  isLoading: boolean
  isSaving: boolean
  error: string | null
  successMessage: string | null
}>()

const emit = defineEmits<{
  save: [payload: Company]
}>()

const name = ref(props.company?.name ?? '')
const domain = ref(props.company?.domain ?? '')
const website = ref(props.company?.website ?? '')

// Update local state when prop changes
watch(
  () => props.company,
  (newCompany) => {
    if (newCompany) {
      name.value = newCompany.name
      domain.value = newCompany.domain ?? ''
      website.value = newCompany.website ?? ''
    }
  },
  { immediate: true }
)

const handleSubmit = () => {
  emit('save', {
    name: name.value,
    domain: domain.value,
    website: website.value,
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Loading skeleton -->
    <div v-if="isLoading" class="bg-white rounded-xl border border-gray-200 p-6 space-y-5 animate-pulse">
      <div class="space-y-2">
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        <div class="h-10 bg-gray-100 rounded"></div>
      </div>
      <div class="space-y-2">
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        <div class="h-10 bg-gray-100 rounded"></div>
      </div>
      <div class="space-y-2">
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        <div class="h-10 bg-gray-100 rounded"></div>
      </div>
      <div class="h-10 bg-gray-200 rounded w-32"></div>
    </div>

    <!-- Main Content -->
    <div v-else class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="p-6">
        <!-- Messages -->
        <div
          v-if="successMessage"
          class="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm flex items-center"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ successMessage }}
        </div>

        <div
          v-if="error"
          class="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm flex items-center"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Company Name -->
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">
              Tên công ty <span class="text-red-500">*</span>
            </label>
            <input
              v-model="name"
              type="text"
              required
              placeholder="Nhập tên công ty"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] outline-none transition-all"
            />
          </div>

          <!-- Industry / Domain -->
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">
              Lĩnh vực hoạt động
              <span class="text-gray-400 font-normal ml-1">(Tùy chọn)</span>
            </label>
            <input
              v-model="domain"
              type="text"
              placeholder="Ví dụ: Công nghệ thông tin, Bán lẻ..."
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] outline-none transition-all"
            />
          </div>

          <!-- Website -->
          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-gray-700">
              Website
              <span class="text-gray-400 font-normal ml-1">(Tùy chọn)</span>
            </label>
            <input
              v-model="website"
              type="url"
              placeholder="https://example.com"
              class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#009898]/20 focus:border-[#009898] outline-none transition-all"
            />
          </div>

          <!-- Submit Button -->
          <div class="pt-4 flex justify-start">
            <button
              type="submit"
              :disabled="isSaving"
              class="px-6 py-2.5 bg-[#009898] hover:bg-[#007a7a] text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <svg
                v-if="isSaving"
                class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
