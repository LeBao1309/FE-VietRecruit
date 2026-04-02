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
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md mx-auto mb-8 text-center">
      <router-link to="/" class="text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight transition-colors hover:text-teal-500">VietRecruit</router-link>
    </div>

    <div class="w-full max-w-md mx-auto">
      <div class="premium-card shadow-xl p-8 sm:p-10 animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-14 h-14 bg-teal-50 dark:bg-teal-500/10 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 text-2xl mx-auto mb-6">
            ✉
          </div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Check your email</h1>
          <p class="text-sm font-medium text-slate-500 mt-2">
            We sent a verification code to
            <span class="font-bold text-slate-700 dark:text-slate-300">{{ email }}</span>
          </p>
        </div>

        <form @submit.prevent="handleVerify" class="space-y-5">
          <div>
            <label for="otp-code" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Verification code</label>
            <input
              id="otp-code"
              v-model="code"
              type="text"
              inputmode="numeric"
              maxlength="8"
              placeholder="Enter 8-digit code"
              class="w-full px-4 py-3 text-lg border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-mono tracking-widest text-center bg-slate-50 dark:bg-slate-800/50"
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
              class="text-teal-600 hover:text-teal-500 dark:text-teal-400 font-bold ml-1 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code' }}
            </button>
          </p>
        </div>

        <p class="text-center text-sm font-bold mt-6">
          <router-link to="/login" class="text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            &larr; Back to login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
