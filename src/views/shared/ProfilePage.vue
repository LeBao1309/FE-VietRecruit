<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'
import { userService } from '@/services/userService'
import MediaUpload from '@/components/common/MediaUpload.vue'
import type { UpdateProfileRequest } from '@/types/user'

const auth = useAuthStore()
const ui = useUiStore()

const loading = ref(true)
const saving = ref(false)
const avatarLoading = ref(false)
const bannerLoading = ref(false)

const form = ref<UpdateProfileRequest>({
  fullName: '',
  phone: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  location: '',
  dob: '',
  gender: '',
})

const avatarUrl = ref<string | null>(null)
const bannerUrl = ref<string | null>(null)

async function loadProfile(): Promise<void> {
  loading.value = true
  try {
    const result = await userService.getProfile()
    if (result.data) {
      const p = result.data
      form.value = {
        fullName: p.fullName ?? '',
        phone: p.phone ?? '',
        linkedinUrl: p.linkedinUrl ?? '',
        githubUrl: p.githubUrl ?? '',
        portfolioUrl: p.portfolioUrl ?? '',
        location: p.location ?? '',
        dob: p.dob ?? '',
        gender: p.gender ?? '',
      }
      avatarUrl.value = p.avatarUrl
      bannerUrl.value = p.bannerUrl
      auth.setUser(p)
    }
  } finally {
    loading.value = false
  }
}

async function handleSave(): Promise<void> {
  saving.value = true
  try {
    const result = await userService.updateProfile(form.value)
    if (result.error) {
      ui.toastError('Update failed', result.error.message)
      return
    }
    if (result.data) {
      auth.setUser(result.data)
    }
    ui.toastSuccess('Profile updated', 'Your changes have been saved.')
  } finally {
    saving.value = false
  }
}

async function handleAvatarUpload(file: File): Promise<void> {
  avatarLoading.value = true
  try {
    const result = await userService.uploadAvatar(file)
    if (result.error) {
      ui.toastError('Upload failed', result.error.message)
      return
    }
    avatarUrl.value = result.data!.avatarUrl
    ui.toastSuccess('Avatar updated')
    await loadProfile()
  } finally {
    avatarLoading.value = false
  }
}

async function handleAvatarDelete(): Promise<void> {
  avatarLoading.value = true
  try {
    const result = await userService.deleteAvatar()
    if (result.error) {
      ui.toastError('Delete failed', result.error.message)
      return
    }
    avatarUrl.value = null
    ui.toastSuccess('Avatar removed')
    await loadProfile()
  } finally {
    avatarLoading.value = false
  }
}

async function handleBannerUpload(file: File): Promise<void> {
  bannerLoading.value = true
  try {
    const result = await userService.uploadBanner(file)
    if (result.error) {
      ui.toastError('Upload failed', result.error.message)
      return
    }
    bannerUrl.value = result.data!.bannerUrl
    ui.toastSuccess('Banner updated')
    await loadProfile()
  } finally {
    bannerLoading.value = false
  }
}

async function handleBannerDelete(): Promise<void> {
  bannerLoading.value = true
  try {
    const result = await userService.deleteBanner()
    if (result.error) {
      ui.toastError('Delete failed', result.error.message)
      return
    }
    bannerUrl.value = null
    ui.toastSuccess('Banner removed')
    await loadProfile()
  } finally {
    bannerLoading.value = false
  }
}

onMounted(loadProfile)
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-8">
    <!-- Page header -->
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900">My Profile</h1>
      <p class="text-sm text-gray-500 mt-1">Manage your personal information and media</p>
    </div>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm space-y-6 animate-pulse">
        <div class="h-36 bg-gray-100 rounded-lg" />
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-full bg-gray-100" />
          <div class="space-y-2">
            <div class="h-4 w-32 bg-gray-100 rounded" />
            <div class="h-3 w-24 bg-gray-100 rounded" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="i in 6" :key="i" class="space-y-2">
            <div class="h-3 w-20 bg-gray-100 rounded" />
            <div class="h-9 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Banner card -->
      <div class="bg-surface border border-border rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="p-4 border-b border-border">
          <h2 class="text-sm font-semibold text-gray-900">Banner Image</h2>
        </div>
        <div class="p-4">
          <MediaUpload
            :model-value="bannerUrl"
            variant="banner"
            :loading="bannerLoading"
            placeholder="Drop banner image or click to upload (recommended 1200×300)"
            @upload="handleBannerUpload"
            @delete="handleBannerDelete"
          />
        </div>
      </div>

      <!-- Avatar + Form card -->
      <div class="bg-surface border border-border rounded-lg shadow-sm overflow-hidden mb-6">
        <div class="p-4 border-b border-border">
          <h2 class="text-sm font-semibold text-gray-900">Profile Photo</h2>
        </div>
        <div class="p-4">
          <MediaUpload
            :model-value="avatarUrl"
            variant="avatar"
            :loading="avatarLoading"
            @upload="handleAvatarUpload"
            @delete="handleAvatarDelete"
          />
        </div>
      </div>

      <!-- Personal Information -->
      <div class="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
        <div class="p-4 border-b border-border">
          <h2 class="text-sm font-semibold text-gray-900">Personal Information</h2>
        </div>
        <form @submit.prevent="handleSave" class="p-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Full Name -->
            <div>
              <label for="prof-name" class="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                id="prof-name"
                v-model="form.fullName"
                type="text"
                class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
              />
            </div>

            <!-- Phone -->
            <div>
              <label for="prof-phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                id="prof-phone"
                v-model="form.phone"
                type="tel"
                placeholder="+84 xxx xxx xxxx"
                class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
              />
            </div>

            <!-- Location -->
            <div>
              <label for="prof-location" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                id="prof-location"
                v-model="form.location"
                type="text"
                placeholder="e.g. Ho Chi Minh City"
                class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
              />
            </div>

            <!-- Date of birth -->
            <div>
              <label for="prof-dob" class="block text-sm font-medium text-gray-700 mb-1">Date of birth</label>
              <input
                id="prof-dob"
                v-model="form.dob"
                type="date"
                class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
              />
            </div>

            <!-- Gender -->
            <div>
              <label for="prof-gender" class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                id="prof-gender"
                v-model="form.gender"
                class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition bg-surface"
              >
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <!-- Separator -->
          <div class="border-t border-border pt-4 mt-4">
            <h3 class="text-sm font-semibold text-gray-900 mb-4">Social Links</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- LinkedIn -->
              <div>
                <label for="prof-linkedin" class="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  id="prof-linkedin"
                  v-model="form.linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
                />
              </div>

              <!-- GitHub -->
              <div>
                <label for="prof-github" class="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                <input
                  id="prof-github"
                  v-model="form.githubUrl"
                  type="url"
                  placeholder="https://github.com/..."
                  class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
                />
              </div>

              <!-- Portfolio -->
              <div class="sm:col-span-2">
                <label for="prof-portfolio" class="block text-sm font-medium text-gray-700 mb-1">Portfolio / Website</label>
                <input
                  id="prof-portfolio"
                  v-model="form.portfolioUrl"
                  type="url"
                  placeholder="https://..."
                  class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
                />
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div class="flex justify-end pt-2">
            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span v-if="saving" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
        </form>
      </div>
    </template>
  </div>
</template>
