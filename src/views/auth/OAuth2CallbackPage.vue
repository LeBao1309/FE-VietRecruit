<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'


const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()

const error = ref('')

onMounted(async () => {
  const code = route.query.code as string
  if (!code) {
    error.value = 'No authorization code received.'
    return
  }

  const result = await authService.oauth2Exchange({ code })
  if (result.error) {
    error.value = result.error.message
    return
  }

  auth.hydrate()

  const profile = await authService.getProfile()
  if (profile.data) {
    auth.setUser(profile.data)
  }

  ui.toastSuccess('Welcome!', `Signed in as ${auth.user?.fullName ?? 'user'}`)

  if (auth.isCandidate) await router.replace('/candidate/dashboard')
  else if (auth.isEmployer) await router.replace('/employer/dashboard')
  else if (auth.isSystemAdmin) await router.replace('/admin/users')
  else await router.replace('/')
})
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-page">
    <template v-if="!error">
      <span class="inline-block w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin mb-4" />
      <p class="text-sm text-gray-500">Completing sign-in…</p>
    </template>
    <template v-else>
      <div class="bg-surface border border-border rounded-lg shadow-sm p-8 max-w-sm text-center">
        <div class="w-12 h-12 bg-error-bg rounded-full flex items-center justify-center text-error text-xl mx-auto mb-4">
          ✕
        </div>
        <h1 class="text-lg font-bold text-gray-900 mb-2">Sign-in failed</h1>
        <p class="text-sm text-gray-500 mb-4">{{ error }}</p>
        <router-link to="/login" class="inline-flex px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition">
          Back to login
        </router-link>
      </div>
    </template>
  </div>
</template>
