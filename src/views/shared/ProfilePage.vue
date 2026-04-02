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
  <div class="max-w-3xl mx-auto px-6 py-10">
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">My Profile</h1>
      <p class="text-sm font-medium text-slate-500 mt-1">Manage your personal information and media</p>
    </div>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="premium-card p-6 space-y-6 animate-pulse">
        <div class="h-36 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div class="flex items-center gap-4">
          <div class="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div class="space-y-2">
            <div class="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="i in 6" :key="i" class="space-y-2">
            <div class="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Banner card -->
      <div class="premium-card overflow-hidden mb-8">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Banner Image</h2>
        </div>
        <div class="p-6">
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
      <div class="premium-card overflow-hidden mb-8">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Profile Photo</h2>
        </div>
        <div class="p-6">
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
      <div class="premium-card overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h2>
        </div>
        <form @submit.prevent="handleSave" class="p-6 space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- Full Name -->
            <div>
              <label for="prof-name" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full name</label>
              <input
                id="prof-name"
                v-model="form.fullName"
                type="text"
                class="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
              />
            </div>

            <!-- Phone -->
            <div>
              <label for="prof-phone" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
              <input
                id="prof-phone"
                v-model="form.phone"
                type="tel"
                placeholder="+84 xxx xxx xxxx"
                class="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
              />
            </div>

            <!-- Location -->
            <div>
              <label for="prof-location" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
              <input
                id="prof-location"
                v-model="form.location"
                type="text"
                placeholder="e.g. Ho Chi Minh City"
                class="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
              />
            </div>

            <!-- Date of birth -->
            <div>
              <label for="prof-dob" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Date of birth</label>
              <input
                id="prof-dob"
                v-model="form.dob"
                type="date"
                class="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
              />
            </div>

            <!-- Gender -->
            <div>
              <label for="prof-gender" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gender</label>
              <select
                id="prof-gender"
                v-model="form.gender"
                class="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium appearance-none"
              >
                <option value="">Prefer not to say</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <!-- Separator -->
          <div class="border-t border-slate-200 dark:border-slate-800 pt-6 mt-2">
            <h3 class="text-base font-extrabold text-slate-900 dark:text-white mb-5">Social Links</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <!-- LinkedIn -->
              <div>
                <label for="prof-linkedin" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">LinkedIn</label>
                <input
                  id="prof-linkedin"
                  v-model="form.linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  class="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
                />
              </div>

              <!-- GitHub -->
              <div>
                <label for="prof-github" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">GitHub</label>
                <input
                  id="prof-github"
                  v-model="form.githubUrl"
                  type="url"
                  placeholder="https://github.com/..."
                  class="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
                />
              </div>

              <!-- Portfolio -->
              <div class="sm:col-span-2">
                <label for="prof-portfolio" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Portfolio / Website</label>
                <input
                  id="prof-portfolio"
                  v-model="form.portfolioUrl"
                  type="url"
                  placeholder="https://..."
                  class="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <!-- Submit -->
          <div class="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
            <button
              type="submit"
              :disabled="saving"
              class="btn-primary py-2.5 px-6 flex items-center gap-2"
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
