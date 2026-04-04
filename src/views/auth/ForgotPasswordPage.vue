<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import { useUiStore } from '@/stores/uiStore'

const router = useRouter()
const ui = useUiStore()

function goBack(): void {
 if (window.history.length > 1) router.back()
 else router.push('/login')
}
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

function validate(): boolean {
 error.value = ''
 if (!email.value.trim()) {
 error.value = 'Email is required.'
 return false
 }
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
 error.value = 'Please enter a valid email.'
 return false
 }
 return true
}

async function handleSubmit(): Promise<void> {
 if (!validate()) return
 loading.value = true
 try {
 const result = await authService.forgotPassword({ email: email.value })
 if (result.error) {
 ui.toastError('Error', result.error.message)
 return
 }
 sent.value = true
 } finally {
 loading.value = false
 }
}
</script>

<template>
 <div class="min-h-screen flex flex-col bg-slate-50">

 <!-- Auth Header -->
 <header class="sticky top-0 z-50 flex items-center h-14 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
 <button @click="goBack" class="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors group" aria-label="Quay trở lại">
 <svg class="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
 <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
 </svg>
 <span>Quay lại</span>
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
 <template v-if="!sent">
 <div class="text-center mb-8">
 <h1 class="text-2xl font-bold text-slate-900 ">Forgot password?</h1>
 <p class="text-sm font-medium text-slate-500 mt-1">Enter your email and we'll send you a reset link</p>
 </div>

 <form @submit.prevent="handleSubmit" class="space-y-5">
 <div>
 <label for="forgot-email" class="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
 <input
 id="forgot-email"
 v-model="email"
 type="email"
 autocomplete="email"
 placeholder="you@example.com"
 class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50 "
 :class="error ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white :bg-slate-900'"
 />
 <p v-if="error" class="text-xs font-bold text-rose-500 mt-1.5">{{ error }}</p>
 </div>

 <button
 type="submit"
 :disabled="loading"
 class="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
 >
 <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ loading ? 'Sending…' : 'Send reset link' }}
 </button>
 </form>
 </template>

 <template v-else>
 <div class="text-center">
 <div class="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 text-2xl mx-auto mb-6">
 ✓
 </div>
 <h1 class="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
 <p class="text-sm font-medium text-slate-500">
 If an account exists for <span class="font-bold text-slate-700 ">{{ email }}</span>,
 we've sent a password reset link.
 </p>
 </div>
 </template>

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
