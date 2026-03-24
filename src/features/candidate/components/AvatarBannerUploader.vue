<script setup lang="ts">
import { useToast } from 'vue-toastification'
import { ref } from 'vue'
import { useCandidateStore } from '../stores/candidate.store'
import { userService } from '../services/user.service'

const toast = useToast()
const candidateStore = useCandidateStore()
const isUploadingAvatar = ref(false)
const isUploadingBanner = ref(false)

const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    toast.error('Dung luong Avatar toi da la 2MB.')
    return
  }

  isUploadingAvatar.value = true
  try {
    const { url } = await userService.uploadAvatar(file)
    if (candidateStore.userProfile) {
      candidateStore.userProfile.avatarUrl = url
    }
    toast.success('Cap nhat avatar thanh cong!')
  } catch {
    toast.error('Upload Avatar that bai.')
  } finally {
    isUploadingAvatar.value = false
  }
}

const handleBannerUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 3 * 1024 * 1024) {
    toast.error('Dung luong Banner toi da la 3MB.')
    return
  }

  isUploadingBanner.value = true
  try {
    const { url } = await userService.uploadBanner(file)
    if (candidateStore.userProfile) {
      candidateStore.userProfile.bannerUrl = url
    }
    toast.success('Cap nhat banner thanh cong!')
  } catch {
    toast.error('Upload Banner that bai.')
  } finally {
    isUploadingBanner.value = false
  }
}

function getInitials(name: string | undefined | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div class="bg-panel rounded-2xl border border-border overflow-hidden">
    <!-- Banner -->
    <div class="h-44 sm:h-52 w-full relative group">
      <img
        v-if="candidateStore.userProfile?.bannerUrl"
        :src="candidateStore.userProfile.bannerUrl"
        class="w-full h-full object-cover"
        alt="Banner"
      />
      <div
        v-else
        class="w-full h-full bg-gradient-to-br from-brand/20 via-brand-light to-brand-muted"
      />

      <label
        class="absolute inset-0 bg-text-primary/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
      >
        <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-white text-sm font-medium">
          {{ isUploadingBanner ? 'Dang tai len...' : 'Cap nhat Banner' }}
        </span>
        <input
          type="file"
          class="hidden"
          accept="image/jpeg, image/png, image/webp"
          @change="handleBannerUpload"
          :disabled="isUploadingBanner"
        />
      </label>
    </div>

    <!-- Profile header area -->
    <div class="relative px-6 sm:px-8 pb-6">
      <!-- Avatar -->
      <div class="absolute -top-16 left-6 sm:left-8 group">
        <div
          class="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-panel overflow-hidden bg-surface-muted relative shadow-md"
        >
          <img
            v-if="candidateStore.userProfile?.avatarUrl"
            :src="candidateStore.userProfile.avatarUrl"
            class="w-full h-full object-cover"
            alt="Avatar"
          />
          <div
            v-else
            class="w-full h-full bg-brand-light flex items-center justify-center text-brand-darker text-2xl font-bold"
          >
            {{ getInitials(candidateStore.userProfile?.fullName) }}
          </div>

          <label
            class="absolute inset-0 bg-text-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer rounded-full"
          >
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              type="file"
              class="hidden"
              accept="image/jpeg, image/png, image/webp"
              @change="handleAvatarUpload"
              :disabled="isUploadingAvatar"
            />
          </label>
        </div>
      </div>

      <!-- Name + headline -->
      <div class="pt-16 sm:pt-20 pl-0 sm:pl-36">
        <h1 class="text-xl sm:text-2xl font-bold text-text-primary">
          {{ candidateStore.userProfile?.fullName || 'Chua cap nhat ten' }}
        </h1>
        <p class="text-text-secondary text-sm mt-1">
          {{ candidateStore.candidateProfile?.headline || 'Chua co headline — hay cap nhat ho so cua ban' }}
        </p>
        <div class="flex items-center gap-3 mt-2 text-xs text-text-muted">
          <span v-if="candidateStore.userProfile?.location" class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ candidateStore.userProfile.location }}
          </span>
          <span v-if="candidateStore.userProfile?.email" class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {{ candidateStore.userProfile.email }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
