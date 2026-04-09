<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import { useUiStore } from '@/stores/uiStore'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const email = ref((route.query.email as string) || '')
const code = ref('')
const loading = ref(false)
const resendCooldown = ref(0)
let resendTimer: ReturnType<typeof setInterval> | null = null

function startCooldown(): void {
 resendCooldown.value = 60
 resendTimer = setInterval(() => {
 resendCooldown.value--
 if (resendCooldown.value <= 0 && resendTimer) {
 clearInterval(resendTimer)
 resendTimer = null
 }
 }, 1000)
}

async function handleVerify(): Promise<void> {
 if (!email.value || code.value.length !== 8) {
 ui.toastError('Validation', 'Please enter your email and the 8-digit code.')
 return
 }
 loading.value = true
 try {
 const result = await authService.verifyOtp({ email: email.value, code: code.value })
 if (result.error) {
 ui.toastError('Verification failed', result.error.message)
 return
 }
 ui.toastSuccess('Email verified!', 'You can now sign in.')
 await router.push('/login')
 } finally {
 loading.value = false
 }
}

async function handleResend(): Promise<void> {
 if (!email.value || resendCooldown.value > 0) return
 loading.value = true
 try {
 const result = await authService.resendOtp({ email: email.value })
 if (result.error) {
 ui.toastError('Resend failed', result.error.message)
 return
 }
 ui.toastSuccess('Code sent', 'A new verification code has been sent to your email.')
 startCooldown()
 } finally {
 loading.value = false
 }
}

onMounted(() => {
 if (!email.value) {
 router.push('/register')
 }
})

function goBack(): void {
 if (window.history.length > 1) router.back()
 else router.push('/register')
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
 <div class="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 text-2xl mx-auto mb-6">
 ✉
 </div>
 <h1 class="text-2xl font-bold text-slate-900 ">Check your email</h1>
 <p class="text-sm font-medium text-slate-500 mt-2">
 We sent a verification code to
 <span class="font-bold text-slate-700 ">{{ email }}</span>
 </p>
 </div>

 <form @submit.prevent="handleVerify" class="space-y-5">
 <div>
 <label for="otp-code" class="block text-sm font-bold text-slate-700 mb-1.5">Verification code</label>
 <input
 id="otp-code"
 v-model="code"
 type="text"
 inputmode="numeric"
 maxlength="8"
 placeholder="Enter 8-digit code"
 class="w-full px-4 py-3 text-lg border border-slate-200 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-mono tracking-widest text-center bg-slate-50 "
 />
 </div>

 <button
 type="submit"
 :disabled="loading || code.length !== 8"
 class="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
 >
 <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ loading ? 'Verifying…' : 'Verify email' }}
 </button>
 </form>

 <div class="text-center mt-8">
 <p class="text-sm font-medium text-slate-500">
 Didn't receive a code?
 <button
 @click="handleResend"
 :disabled="resendCooldown > 0 || loading"
 class="text-teal-600 hover:text-teal-500 font-bold ml-1 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
 >
 {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code' }}
 </button>
 </p>
 </div>

 <p class="text-center text-sm font-bold mt-6">
 <router-link to="/login" class="text-slate-500 hover:text-teal-600 :text-teal-400 transition-colors">
 &larr; Back to login
 </router-link>
 </p>
 </div>
 </div>
 </div>
 </div>
</template>
