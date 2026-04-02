<script setup lang="ts">
import { ref } from 'vue'
import { authService } from '@/services/authService'
import { useUiStore } from '@/stores/uiStore'

const ui = useUiStore()
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
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md mx-auto mb-8 text-center">
      <router-link to="/" class="text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight transition-colors hover:text-teal-500">VietRecruit</router-link>
    </div>

    <div class="w-full max-w-md mx-auto">
      <div class="premium-card shadow-xl p-8 sm:p-10 animate-fade-in">
        <template v-if="!sent">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Forgot password?</h1>
            <p class="text-sm font-medium text-slate-500 mt-1">Enter your email and we'll send you a reset link</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label for="forgot-email" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input
                id="forgot-email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700"
                :class="error ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white dark:focus:bg-slate-900'"
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
            <div class="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 text-2xl mx-auto mb-6">
              ✓
            </div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h1>
            <p class="text-sm font-medium text-slate-500">
              If an account exists for <span class="font-bold text-slate-700 dark:text-slate-300">{{ email }}</span>,
              we've sent a password reset link.
            </p>
          </div>
        </template>

        <p class="text-center text-sm font-bold mt-8">
          <router-link to="/login" class="text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            &larr; Back to login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
