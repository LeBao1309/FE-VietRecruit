<script setup lang="ts">
import { useToast } from 'vue-toastification';
const toast = useToast();
import { ref } from 'vue'
import { useCandidateStore } from '../stores/candidate.store'
import { userService } from '../services/user.service'

const candidateStore = useCandidateStore()
const isUploadingAvatar = ref(false)
const isUploadingBanner = ref(false)

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Khối lượng Avatar tối đa là 2MB.')
    return
  }

  isUploadingAvatar.value = true
  try {
    const { url } = await userService.uploadAvatar(file)
    if (candidateStore.userProfile) {
      candidateStore.userProfile.avatarUrl = url
    }
  } catch (error) {
    toast.error('Upload Avatar thất bại.')
  } finally {
    isUploadingAvatar.value = false
  }
}

const handleBannerUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  if (file.size > 3 * 1024 * 1024) {
    toast.error('Khối lượng Banner tối đa là 3MB.')
    return
  }

  isUploadingBanner.value = true
  try {
    const { url } = await userService.uploadBanner(file)
    if (candidateStore.userProfile) {
      candidateStore.userProfile.bannerUrl = url
    }
  } catch (error) {
    toast.error('Upload Banner thất bại.')
  } finally {
    isUploadingBanner.value = false
  }
}
</script>

<template>
  <div class="bg-white shadow rounded-lg overflow-hidden relative mb-8">
    <!-- Banner -->
    <div class="h-48 w-full bg-gray-300 relative group">
      <img v-if="candidateStore.userProfile?.bannerUrl" :src="candidateStore.userProfile.bannerUrl" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-300">Default Banner</div>
      
      <label class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer">
        <span class="text-white font-medium">{{ isUploadingBanner ? 'Uploading...' : 'Cập nhật Banner' }}</span>
        <input type="file" class="hidden" accept="image/jpeg, image/png, image/webp" @change="handleBannerUpload" :disabled="isUploadingBanner" />
      </label>
    </div>

    <!-- Avatar -->
    <div class="absolute top-24 left-8 group">
      <div class="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200 relative shadow">
        <img v-if="candidateStore.userProfile?.avatarUrl" :src="candidateStore.userProfile.avatarUrl" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">Avatar</div>
        
        <label class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer rounded-full">
          <span class="text-white text-xs font-medium">{{ isUploadingAvatar ? '...' : 'Cập nhật' }}</span>
          <input type="file" class="hidden" accept="image/jpeg, image/png, image/webp" @change="handleAvatarUpload" :disabled="isUploadingAvatar" />
        </label>
      </div>
    </div>
    
    <div class="px-8 pt-12 pb-6">
      <h1 class="text-2xl font-bold">{{ candidateStore.userProfile?.fullName || 'Tên ứng viên' }}</h1>
      <p class="text-gray-600">{{ candidateStore.candidateProfile?.headline || 'Vị trí hiện tại (Headline)' }}</p>
    </div>
  </div>
</template>
