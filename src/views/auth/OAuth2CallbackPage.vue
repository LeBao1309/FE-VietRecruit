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
 <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50">
 <template v-if="!error">
 <span class="inline-block w-10 h-10 border-4 border-slate-200 border-t-teal-500 rounded-full animate-spin mb-4" />
 <p class="text-sm font-medium text-slate-500">Completing sign-in…</p>
 </template>
 <template v-else>
 <div class="premium-card shadow-xl p-8 max-w-sm text-center">
 <div class="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 text-2xl mx-auto mb-6">
 ✕
 </div>
 <h1 class="text-xl font-bold text-slate-900 mb-2">Sign-in failed</h1>
 <p class="text-sm font-medium text-slate-500 mb-6">{{ error }}</p>
 <router-link to="/login" class="btn-primary py-2.5 px-6 shrink-0">
 Back to login
 </router-link>
 </div>
 </template>
 </div>
</template>
