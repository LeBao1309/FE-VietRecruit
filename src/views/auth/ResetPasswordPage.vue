<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'


import { authService } from '@/services/authService'
import { useUiStore } from '@/stores/uiStore'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const token = route.query.token as string || ''
const email = route.query.email as string || ''
const form = ref({ newPassword: '', confirmPassword: '' })
const showPassword = ref(false)
const loading = ref(false)
const errors = ref<Record<string, string>>({})

const passwordValid = computed(() => {
 const pw = form.value.newPassword
 return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw) && /[!@#$%^&*(),.?":{}|<>]/.test(pw)
})

function validate(): boolean {
 errors.value = {}
 if (!form.value.newPassword) {
 errors.value.newPassword = 'Password is required.'
 } else if (!passwordValid.value) {
 errors.value.newPassword = 'Password does not meet requirements.'
 }
 if (form.value.newPassword !== form.value.confirmPassword) {
 errors.value.confirmPassword = 'Passwords do not match.'
 }
 if (!token) {
 errors.value.token = 'Invalid or missing reset token.'
 }
 if (!email) {
 errors.value.token = 'Invalid or missing email in reset link.'
 }
 return Object.keys(errors.value).length === 0
}

async function handleSubmit(): Promise<void> {
 if (!validate()) return
 loading.value = true
 try {
 const result = await authService.resetPassword({
 email,
 token,
 newPassword: form.value.newPassword,
 })
 if (result.error) {
 ui.toastError('Reset failed', result.error.message)
 return
 }
 ui.toastSuccess('Password reset!', 'You can now sign in with your new password.')
 await router.push('/login')
 } finally {
 loading.value = false
 }
}

function goBack(): void {
 if (window.history.length > 1) router.back()
 else router.push('/login')
}
</script>

<template>
 <div class="min-h-screen flex flex-col bg-slate-50">

 <!-- Auth Header -->
 <header class="sticky top-0 z-50 flex items-center h-14 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
 <button @click="goBack" class="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors group" aria-label="Go Back">
 <svg class="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
 </svg>
 <span>Back</span>
 </button>
 <div class="flex-1 flex justify-center">
 <router-link to="/" class="flex items-center gap-2">
 <img src="/assets/img/vietrecruit-icon.svg" alt="VietRecruit" class="h-7 w-7" />
 <span class="text-base font-extrabold text-[#007070] tracking-tight">VietRecruit</span>
 </router-link>
 </div>
 <div class="w-20" aria-hidden="true"></div>
 </header>

 <!-- Form area -->
 <div class="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
 <div class="w-full max-w-md mx-auto">
 <div class="premium-card shadow-xl p-8 sm:p-10 animate-fade-in">
 <div class="text-center mb-8">
 <h1 class="text-2xl font-bold text-slate-900 ">Set new password</h1>
 <p class="text-sm font-medium text-slate-500 mt-1">Choose a strong password for your account</p>
 </div>

 <p v-if="errors.token" class="text-sm font-bold text-rose-500 bg-rose-50/50 rounded-xl p-4 mb-6 text-center">
 {{ errors.token }}
 </p>

 <form @submit.prevent="handleSubmit" class="space-y-5">
 <!-- Password -->
 <div>
 <label for="reset-pw" class="block text-sm font-bold text-slate-700 mb-1.5">New password</label>
 <div class="relative">
 <input
 id="reset-pw"
 v-model="form.newPassword"
 :type="showPassword ? 'text' : 'password'"
 autocomplete="new-password"
 placeholder="••••••••"
 class="w-full px-4 py-3 pr-16 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50 "
 :class="errors.newPassword ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white :bg-slate-900'"
 />
 <button
 type="button"
 @click="showPassword = !showPassword"
 class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-slate-400 hover:text-slate-600 :text-slate-300 transition-colors bg-white/50 rounded-md text-xs font-bold"
 >
 {{ showPassword ? 'Hide' : 'Show' }}
 </button>
 </div>
 <p v-if="errors.newPassword" class="text-xs font-bold text-rose-500 mt-1.5">{{ errors.newPassword }}</p>
 </div>

 <!-- Confirm Password -->
 <div>
 <label for="reset-confirm" class="block text-sm font-bold text-slate-700 mb-1.5">Confirm password</label>
 <input
 id="reset-confirm"
 v-model="form.confirmPassword"
 type="password"
 autocomplete="new-password"
 placeholder="••••••••"
 class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50 "
 :class="errors.confirmPassword ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white :bg-slate-900'"
 />
 <p v-if="errors.confirmPassword" class="text-xs font-bold text-rose-500 mt-1.5">{{ errors.confirmPassword }}</p>
 </div>

 <!-- Submit -->
 <button
 type="submit"
 :disabled="loading"
 class="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
 >
 <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ loading ? 'Resetting…' : 'Reset password' }}
 </button>
 </form>

 <p class="text-center text-sm font-bold mt-8">
 <router-link to="/login" class="text-slate-500 hover:text-teal-600 :text-teal-400 transition-colors">
 &larr; Back to login
 </router-link>
 </p>
 </div>
 </div>
 </div>
 </div>
</template>
