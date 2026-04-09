<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { LoginRequest } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = ref<LoginRequest>({
 email: '',
 password: '',
})

const showPassword = ref(false)
const errors = ref<Record<string, string>>({})
const apiError = ref('')

function validate(): boolean {
 errors.value = {}
 apiError.value = ''
 if (!form.value.email.trim()) {
 errors.value.email = 'Email is required.'
 } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
 errors.value.email = 'Please enter a valid email.'
 }
 if (!form.value.password) {
 errors.value.password = 'Password is required.'
 }
 return Object.keys(errors.value).length === 0
}

async function handleSubmit(): Promise<void> {
 if (!validate()) return
 const success = await auth.login(form.value)
 if (success) {
 const redirect = (route.query.redirect as string) || getDefaultRoute()
 await router.push(redirect)
 } else {
 apiError.value = 'Invalid email or password. Please try again.'
 form.value.password = ''
 }
}

function getDefaultRoute(): string {
 if (auth.isCandidate) return '/candidate/dashboard'
 if (auth.isEmployer) return '/employer/dashboard'
 if (auth.isSystemAdmin) return '/admin/users'
 return '/'
}

function goBack(): void {
 if (window.history.length > 1) {
  router.back()
 } else {
  router.push('/')
 }
}
</script>

<template>
 <div class="min-h-screen flex flex-col bg-slate-50">

  <!-- Auth Header — matches AppHeader light style -->
  <header class="sticky top-0 z-50 flex items-center h-14 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
   <!-- Back button -->
   <button
    @click="goBack"
    class="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors group"
    aria-label="Go Back"
   >
    <svg class="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
     <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
    <span>Back</span>
   </button>

   <!-- Logo centered -->
   <div class="flex-1 flex justify-center">
    <router-link to="/" class="flex items-center gap-2">
     <img src="/assets/img/vietrecruit-icon.svg" alt="VietRecruit" class="h-7 w-7" />
     <span class="text-base font-extrabold text-[#007070] tracking-tight">VietRecruit</span>
    </router-link>
   </div>

   <!-- Spacer to balance back button -->
   <div class="w-20" aria-hidden="true"></div>
  </header>

  <!-- Form area -->
  <div class="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="w-full max-w-md mx-auto">
  <div class="premium-card shadow-xl p-8 sm:p-10 animate-fade-in">
 <div class="text-center mb-8">
 <h1 class="text-2xl font-bold text-slate-900">Welcome Back</h1>
 <p class="text-sm font-medium text-slate-500 mt-1">Sign in to continue</p>
 </div>

 <form @submit.prevent="handleSubmit" class="space-y-5">
 <!-- Email -->
 <div>
 <label for="login-email" class="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
 <input
 id="login-email"
 v-model="form.email"
 type="email"
 autocomplete="email"
 placeholder="you@example.com"
 class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50"
 :class="errors.email
 ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50'
 : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'"
 />
 <p v-if="errors.email" class="text-xs font-bold text-rose-500 mt-1.5">{{ errors.email }}</p>
 </div>

 <!-- Password -->
 <div>
 <div class="flex items-center justify-between mb-1.5">
 <label for="login-password" class="text-sm font-bold text-slate-700">Password</label>
 <router-link to="/forgot-password" class="text-xs font-bold text-teal-600 hover:text-teal-500 transition-colors">
 Forgot password?
 </router-link>
 </div>
 <div class="relative">
 <input
 id="login-password"
 v-model="form.password"
 :type="showPassword ? 'text' : 'password'"
 autocomplete="current-password"
 placeholder="••••••••"
 class="w-full px-4 py-3 pr-16 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50"
 :class="errors.password
 ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50'
 : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'"
 />
 <button
 type="button"
 @click="showPassword = !showPassword"
 class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-slate-400 hover:text-slate-600 transition-colors bg-white/50 rounded-md text-xs font-bold"
 >
 {{ showPassword ? 'Hide' : 'Show' }}
 </button>
 </div>
 <p v-if="errors.password" class="text-xs font-bold text-rose-500 mt-1.5">{{ errors.password }}</p>
 </div>

 <!-- API error -->
 <div v-if="apiError" class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
 <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
 {{ apiError }}
 </div>

 <!-- Submit -->
 <button
 type="submit"
 :disabled="auth.loading"
 class="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2"
 >
 <span v-if="auth.loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ auth.loading ? 'Signing in…' : 'Sign In' }}
 </button>
 </form>

 <!-- Footer -->
 <p class="text-center text-sm font-medium text-slate-500 mt-8">
 Don't have an account?
 <router-link to="/register" class="text-teal-600 hover:text-teal-500 font-bold transition-colors">
 Register
 </router-link>
 </p>
 </div>
 </div>
 </div>
 </div>
</template>
