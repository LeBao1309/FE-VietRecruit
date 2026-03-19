<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCandidateStore } from '../stores/candidate.store'
import { candidateService } from '../services/candidate.service'
import { applicationService } from '../services/application.service'

const props = defineProps<{ jobId: string; jobTitle: string }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'success'): void }>()

const candidateStore = useCandidateStore()
const coverLetter = ref('')
const newCvFile = ref<File | null>(null)
const isSubmitting = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  if (!candidateStore.candidateProfile) {
    candidateStore.isLoading = true
    try {
      candidateStore.candidateProfile = await candidateService.getProfile()
    } catch {
      error.value = 'Failed to load candidate profile. Please try again.'
    } finally {
      candidateStore.isLoading = false
    }
  }
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    newCvFile.value = file
  }
}

const submitApplication = async () => {
  if (!candidateStore.candidateProfile?.defaultCvUrl && !newCvFile.value) {
    error.value = 'Vui lòng cung cấp CV để ứng tuyển.'
    return
  }

  isSubmitting.value = true
  error.value = null

  try {
    if (newCvFile.value) {
      const res = await candidateService.uploadCv(newCvFile.value)
      if (candidateStore.candidateProfile) {
        candidateStore.candidateProfile.defaultCvUrl = res.cvUrl
      }
    }

    await applicationService.apply({ jobId: props.jobId, coverLetter: coverLetter.value })
    emit('success')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Có lỗi xảy ra khi nộp đơn ứng tuyển.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
      <div class="px-6 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
        <h3 class="text-xl font-bold text-gray-900">Ứng tuyển công việc</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 focus:outline-none">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div class="p-6 space-y-6">
        <div>
          <p class="text-sm font-medium text-gray-500">Công việc</p>
          <p class="text-lg font-semibold text-gray-900">{{ jobTitle }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">CV Ứng tuyển <span class="text-red-500">*</span></label>
          <div v-if="candidateStore.candidateProfile?.defaultCvUrl && !newCvFile" class="mb-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex justify-between items-center transition">
            <div class="flex items-center gap-2 text-indigo-700 text-sm font-medium">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Sử dụng CV hiện tại trên hồ sơ
            </div>
            <a :href="candidateStore.candidateProfile.defaultCvUrl" target="_blank" class="text-indigo-600 hover:text-indigo-800 text-xs font-medium bg-white px-3 py-1.5 rounded border shadow-sm">Xem CV</a>
          </div>
          
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center bg-gray-50 hover:bg-gray-100 transition">
            <input type="file" id="cv-upload" class="hidden" accept=".pdf,.doc,.docx" @change="handleFileSelect" />
            <label for="cv-upload" class="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap overflow-hidden text-ellipsis block max-w-full">
              {{ newCvFile ? newCvFile.name : (candidateStore.candidateProfile?.defaultCvUrl ? 'Tải lên CV khác' : 'Tải lên CV mới') }}
            </label>
            <p v-if="newCvFile" class="text-xs text-amber-600 mt-3 bg-amber-50 p-2 rounded border border-amber-200 text-left">
              <span class="font-bold">Lưu ý:</span> Việc tải CV mới sẽ cập nhật làm CV mặc định trong hồ sơ của bạn.
            </p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Thư giới thiệu (Cover Letter)</label>
          <textarea v-model="coverLetter" rows="4" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Giới thiệu nhanh về bản thân và lý do bạn phù hợp..."></textarea>
        </div>
        
        <div v-if="error" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium flex gap-2 items-center">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{{ error }}</span>
        </div>
      </div>
      
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl sticky bottom-0">
        <button @click="$emit('close')" type="button" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition" :disabled="isSubmitting">Hủy</button>
        <button @click="submitApplication" type="button" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center transition" :disabled="isSubmitting">
          <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Gửi đơn ứng tuyển
        </button>
      </div>
    </div>
  </div>
</template>
