<script setup lang="ts">
import { ref } from 'vue'
import { useCandidateStore } from '../stores/candidate.store'
import { candidateService } from '../services/candidate.service'

const candidateStore = useCandidateStore()
const isUploading = ref(false)

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    alert('Khối lượng CV tối đa là 5MB.')
    return
  }

  isUploading.value = true
  try {
    const response = await candidateService.uploadCv(file)
    if (candidateStore.candidateProfile) {
      candidateStore.candidateProfile.defaultCvUrl = response.cvUrl
    }
    alert('Upload CV thành công!')
  } catch (error) {
    alert('Upload CV thất bại.')
  } finally {
    isUploading.value = false
  }
}

const deleteCv = async () => {
  if (!confirm('Bạn có chắc chắn muốn xóa CV này?')) return
  
  try {
    await candidateService.deleteCv()
    if (candidateStore.candidateProfile) {
      candidateStore.candidateProfile.defaultCvUrl = null
    }
  } catch (e) {
    alert('Xóa CV thất bại.')
  }
}
</script>

<template>
  <div class="bg-white shadow rounded-lg p-6 my-8">
    <h3 class="text-lg font-medium text-gray-900 mb-4">CV Trực Tuyến mặc định</h3>
    
    <div v-if="candidateStore.candidateProfile?.defaultCvUrl" class="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <svg class="w-8 h-8 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
        </svg>
        <span class="font-medium text-gray-900 border-b border-indigo-200 hover:text-indigo-600">
          <a :href="candidateStore.candidateProfile.defaultCvUrl" target="_blank">Xem CV hiện tại</a>
        </span>
      </div>
      <div class="flex space-x-2">
        <label class="cursor-pointer text-sm text-indigo-600 hover:text-indigo-800 focus-within:outline-none">
          <span>Thay thế CV</span>
          <input type="file" class="hidden" accept=".pdf,.doc,.docx,.jpg,.png" @change="handleFileUpload" :disabled="isUploading" />
        </label>
        <button @click="deleteCv" class="text-sm text-red-600 hover:text-red-800 ml-4">Gỡ bỏ CV</button>
      </div>
    </div>
    
    <div v-else class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <div class="mt-4 flex text-sm text-gray-600 justify-center">
        <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
          <span>{{ isUploading ? 'Đang tải lên...' : 'Upload CV' }}</span>
          <input id="file-upload" name="file-upload" type="file" class="sr-only" accept=".pdf,.doc,.docx,.jpg,.png" @change="handleFileUpload" :disabled="isUploading" />
        </label>
      </div>
      <p class="text-xs text-gray-500 mt-2">Hỗ trợ PDF, DOCX, JPEG, PNG (Tối đa 5MB)</p>
    </div>
  </div>
</template>
