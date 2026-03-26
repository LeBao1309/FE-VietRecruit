<script setup lang="ts">
import { useToast } from 'vue-toastification'
import { ref } from 'vue'
import { useCandidateStore } from '../stores/candidate.store'
import { candidateService } from '../services/candidate.service'

const toast = useToast()
const candidateStore = useCandidateStore()
const isUploading = ref(false)

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    toast.error('Dung luong CV toi da la 5MB.')
    return
  }

  isUploading.value = true
  try {
    const response = await candidateService.uploadCv(file)
    if (candidateStore.candidateProfile) {
      candidateStore.candidateProfile.defaultCvUrl = response.cvUrl
    }
    toast.success('Upload CV thanh cong!')
  } catch {
    toast.error('Upload CV that bai.')
  } finally {
    isUploading.value = false
    if (target) target.value = ''
  }
}

const deleteCv = async () => {
  if (!confirm('Ban co chac chan muon xoa CV nay?')) return

  try {
    await candidateService.deleteCv()
    if (candidateStore.candidateProfile) {
      candidateStore.candidateProfile.defaultCvUrl = null
    }
    toast.success('Da xoa CV.')
  } catch {
    toast.error('Xoa CV that bai.')
  }
}
</script>

<template>
  <div class="bg-panel rounded-2xl border border-border p-6 sm:p-8">
    <h3 class="text-lg font-semibold text-text-primary mb-1">CV Truc tuyen</h3>
    <p class="text-text-muted text-sm mb-5">CV mac dinh duoc su dung khi ban ung tuyen</p>

    <!-- Has CV -->
    <div
      v-if="candidateStore.candidateProfile?.defaultCvUrl"
      class="border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-soft"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-brand" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
          </svg>
        </div>
        <div>
          <a
            :href="candidateStore.candidateProfile.defaultCvUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm font-medium text-text-link hover:text-text-link-hover underline underline-offset-2"
          >
            Xem CV hien tai
          </a>
          <p class="text-xs text-text-muted mt-0.5">Nhan de xem trong tab moi</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <label class="btn-secondary text-xs px-3 py-1.5 cursor-pointer">
          <span>{{ isUploading ? 'Dang tai...' : 'Thay the CV' }}</span>
          <input
            type="file"
            class="hidden"
            accept=".pdf,.doc,.docx,.jpg,.png"
            @change="handleFileUpload"
            :disabled="isUploading"
          />
        </label>
        <button
          @click="deleteCv"
          class="text-xs text-danger hover:text-danger-dark font-medium px-3 py-1.5 rounded-lg hover:bg-danger-light transition-colors"
        >
          Go bo
        </button>
      </div>
    </div>

    <!-- No CV -->
    <label
      v-else
      class="border-2 border-dashed border-border-strong rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand hover:bg-brand-light/30 transition-all duration-200"
    >
      <div class="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <span class="text-sm font-medium text-text-primary">
        {{ isUploading ? 'Dang tai len...' : 'Nhan de upload CV' }}
      </span>
      <p class="text-xs text-text-muted mt-1.5">Ho tro PDF, DOCX, JPEG, PNG (Toi da 5MB)</p>
      <input
        type="file"
        class="hidden"
        accept=".pdf,.doc,.docx,.jpg,.png"
        @change="handleFileUpload"
        :disabled="isUploading"
      />
    </label>
  </div>
</template>
