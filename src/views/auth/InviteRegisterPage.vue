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
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md mx-auto mb-8 text-center">
      <router-link to="/" class="text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight transition-colors hover:text-teal-500">VietRecruit</router-link>
    </div>

    <div class="w-full max-w-md mx-auto">
      <div class="premium-card shadow-xl p-8 sm:p-10 animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-14 h-14 bg-teal-50 dark:bg-teal-500/10 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 text-2xl mx-auto mb-6">
            🤝
          </div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Accept invitation</h1>
          <p class="text-sm font-medium text-slate-500 mt-1">Set up your account to join the team</p>
        </div>

        <p v-if="errors.token" class="text-sm font-bold text-rose-500 bg-rose-50/50 dark:bg-rose-500/10 rounded-xl p-4 mb-6 text-center">
          {{ errors.token }}
        </p>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Full Name -->
          <div>
            <label for="invite-name" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full name</label>
            <input
              id="invite-name"
              v-model="form.fullName"
              type="text"
              autocomplete="name"
              placeholder="John Smith"
              class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700"
              :class="errors.fullName ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white dark:focus:bg-slate-900'"
            />
            <p v-if="errors.fullName" class="text-xs font-bold text-rose-500 mt-1.5">{{ errors.fullName }}</p>
          </div>

          <!-- Password -->
          <div>
            <label for="invite-pw" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <div class="relative">
              <input
                id="invite-pw"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full px-4 py-3 pr-16 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700"
                :class="errors.password ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white dark:focus:bg-slate-900'"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-white/50 dark:bg-slate-800/50 rounded-md text-xs font-bold"
              >
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <p v-if="errors.password" class="text-xs font-bold text-rose-500 mt-1.5">{{ errors.password }}</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="invite-confirm" class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Confirm password</label>
            <input
              id="invite-confirm"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700"
              :class="errors.confirmPassword ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white dark:focus:bg-slate-900'"
            />
            <p v-if="errors.confirmPassword" class="text-xs font-bold text-rose-500 mt-1.5">{{ errors.confirmPassword }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading || !token"
            class="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
          >
            <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ loading ? 'Joining…' : 'Join team' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
