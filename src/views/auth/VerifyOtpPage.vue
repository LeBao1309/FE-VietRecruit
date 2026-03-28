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
  <div class="min-h-screen flex flex-col bg-page">
    <div class="py-6 text-center">
      <router-link to="/" class="text-xl font-bold text-primary">VietRecruit</router-link>
    </div>

    <div class="w-full max-w-md mx-auto px-4">
      <div class="bg-surface border border-border rounded-lg shadow-sm p-8 animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary text-xl mx-auto mb-4">
            ✉
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Check your email</h1>
          <p class="text-sm text-gray-500 mt-2">
            We sent a verification code to
            <span class="font-medium text-gray-700">{{ email }}</span>
          </p>
        </div>

        <form @submit.prevent="handleVerify" class="space-y-5">
          <div>
            <label for="otp-code" class="block text-sm font-medium text-gray-700 mb-1">Verification code</label>
            <input
              id="otp-code"
              v-model="code"
              type="text"
              inputmode="numeric"
              maxlength="8"
              placeholder="Enter 8-digit code"
              class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition text-center tracking-widest font-mono text-lg"
            />
          </div>

          <button
            type="submit"
            :disabled="loading || code.length !== 8"
            class="w-full py-2.5 px-4 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ loading ? 'Verifying…' : 'Verify email' }}
          </button>
        </form>

        <div class="text-center mt-6">
          <p class="text-sm text-gray-500">
            Didn't receive a code?
            <button
              @click="handleResend"
              :disabled="resendCooldown > 0 || loading"
              class="text-primary font-medium hover:text-primary-hover disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code' }}
            </button>
          </p>
        </div>

        <p class="text-center text-sm text-gray-500 mt-4">
          <router-link to="/login" class="text-primary hover:text-primary-hover">
            ← Back to login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
