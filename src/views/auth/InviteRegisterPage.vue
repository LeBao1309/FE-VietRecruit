<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import { useUiStore } from '@/stores/uiStore'

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const token = ref((route.query.token as string) || '')
const form = ref({ fullName: '', password: '', confirmPassword: '' })
const showPassword = ref(false)
const loading = ref(false)
const errors = ref<Record<string, string>>({})

const passwordValid = computed(() => {
  const pw = form.value.password
  return pw.length >= 8 && /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw) && /[!@#$%^&*(),.?":{}|<>]/.test(pw)
})

function validate(): boolean {
  errors.value = {}
  if (!form.value.fullName.trim()) errors.value.fullName = 'Full name is required.'
  if (!form.value.password) {
    errors.value.password = 'Password is required.'
  } else if (!passwordValid.value) {
    errors.value.password = 'Password does not meet requirements.'
  }
  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match.'
  }
  if (!token.value) errors.value.token = 'Invalid or missing invitation token.'
  return Object.keys(errors.value).length === 0
}

async function handleSubmit(): Promise<void> {
  if (!validate()) return
  loading.value = true
  try {
    const result = await authService.registerByInvite({
      token: token.value,
      password: form.value.password,
      fullName: form.value.fullName,
    })
    if (result.error) {
      ui.toastError('Registration failed', result.error.message)
      return
    }
    ui.toastSuccess('Account created!', 'You can now sign in with your credentials.')
    await router.push('/login')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!token.value) {
    ui.toastError('Invalid invitation', 'No invitation token found.')
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
            🤝
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Accept invitation</h1>
          <p class="text-sm text-gray-500 mt-1">Set up your account to join the team</p>
        </div>

        <p v-if="errors.token" class="text-sm text-error bg-error-bg rounded-md p-3 mb-4">
          {{ errors.token }}
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label for="invite-name" class="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              id="invite-name"
              v-model="form.fullName"
              type="text"
              autocomplete="name"
              placeholder="John Smith"
              class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
              :class="errors.fullName ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
            />
            <p v-if="errors.fullName" class="text-xs text-error mt-1">{{ errors.fullName }}</p>
          </div>

          <div>
            <label for="invite-pw" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div class="relative">
              <input
                id="invite-pw"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full px-3 py-2.5 pr-10 text-sm border rounded-md outline-none transition"
                :class="errors.password ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <p v-if="errors.password" class="text-xs text-error mt-1">{{ errors.password }}</p>
          </div>

          <div>
            <label for="invite-confirm" class="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input
              id="invite-confirm"
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
            :disabled="loading || !token"
            class="w-full py-2.5 px-4 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ loading ? 'Joining…' : 'Join team' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
