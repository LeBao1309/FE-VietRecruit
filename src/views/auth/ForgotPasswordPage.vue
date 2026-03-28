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
  <div class="min-h-screen flex flex-col bg-page">
    <div class="py-6 text-center">
      <router-link to="/" class="text-xl font-bold text-primary">VietRecruit</router-link>
    </div>

    <div class="w-full max-w-md mx-auto px-4">
      <div class="bg-surface border border-border rounded-lg shadow-sm p-8 animate-fade-in">
        <template v-if="!sent">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">Forgot password?</h1>
            <p class="text-sm text-gray-500 mt-1">Enter your email and we'll send you a reset link</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div>
              <label for="forgot-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="forgot-email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
                :class="error ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
              />
              <p v-if="error" class="text-xs text-error mt-1">{{ error }}</p>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full py-2.5 px-4 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {{ loading ? 'Sending…' : 'Send reset link' }}
            </button>
          </form>
        </template>

        <template v-else>
          <div class="text-center">
            <div class="w-12 h-12 bg-success-bg rounded-full flex items-center justify-center text-success text-xl mx-auto mb-4">
              ✓
            </div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p class="text-sm text-gray-500">
              If an account exists for <span class="font-medium text-gray-700">{{ email }}</span>,
              we've sent a password reset link.
            </p>
          </div>
        </template>

        <p class="text-center text-sm text-gray-500 mt-6">
          <router-link to="/login" class="text-primary hover:text-primary-hover">
            ← Back to login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
