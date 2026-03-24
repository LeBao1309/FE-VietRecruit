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
</script>

<template>
  <div class="min-h-screen flex flex-col bg-page">
    <div class="py-6 text-center">
      <router-link to="/" class="text-xl font-bold text-primary">VietRecruit</router-link>
    </div>

    <div class="w-full max-w-md mx-auto px-4">
      <div class="bg-surface border border-border rounded-lg shadow-sm p-8 animate-fade-in">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Set new password</h1>
          <p class="text-sm text-gray-500 mt-1">Choose a strong password for your account</p>
        </div>

        <p v-if="errors.token" class="text-sm text-error bg-error-bg rounded-md p-3 mb-4">
          {{ errors.token }}
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="reset-pw" class="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <div class="relative">
              <input
                id="reset-pw"
                v-model="form.newPassword"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full px-3 py-2.5 pr-10 text-sm border rounded-md outline-none transition"
                :class="errors.newPassword ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <p v-if="errors.newPassword" class="text-xs text-error mt-1">{{ errors.newPassword }}</p>
          </div>

          <div>
            <label for="reset-confirm" class="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input
              id="reset-confirm"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
              :class="errors.confirmPassword ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
            />
            <p v-if="errors.confirmPassword" class="text-xs text-error mt-1">{{ errors.confirmPassword }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2.5 px-4 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ loading ? 'Resetting…' : 'Reset password' }}
          </button>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          <router-link to="/login" class="text-primary hover:text-primary-hover">
            ← Back to login
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
