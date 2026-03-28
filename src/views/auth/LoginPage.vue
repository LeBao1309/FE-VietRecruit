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

function validate(): boolean {
  errors.value = {}
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
  }
}

function getDefaultRoute(): string {
  if (auth.isCandidate) return '/candidate/dashboard'
  if (auth.isEmployer) return '/employer/dashboard'
  if (auth.isSystemAdmin) return '/admin/users'
  return '/'
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-page">
    <!-- Header -->
    <div class="py-6 text-center">
      <router-link to="/" class="text-xl font-bold text-primary">VietRecruit</router-link>
    </div>

    <!-- Card -->
    <div class="w-full max-w-md mx-auto px-4">
      <div class="bg-surface border border-border rounded-lg shadow-sm p-8 animate-fade-in">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p class="text-sm text-gray-500 mt-1">Sign in to your account to continue</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Email -->
          <div>
            <label for="login-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="login-email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition-all duration-150"
              :class="errors.email
                ? 'border-error focus:ring-2 focus:ring-error-bg'
                : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
            />
            <p v-if="errors.email" class="text-xs text-error mt-1">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label for="login-password" class="text-sm font-medium text-gray-700">Password</label>
              <router-link to="/forgot-password" class="text-xs text-primary hover:text-primary-hover">
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
                class="w-full px-3 py-2.5 pr-10 text-sm border rounded-md outline-none transition-all duration-150"
                :class="errors.password
                  ? 'border-error focus:ring-2 focus:ring-error-bg'
                  : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
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

          <!-- Submit -->
          <button
            type="submit"
            :disabled="auth.loading"
            class="w-full py-2.5 px-4 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="auth.loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ auth.loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border" />
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="bg-surface px-3 text-gray-400">or continue with</span>
          </div>
        </div>

        <!-- OAuth2 Buttons -->
        <div class="grid grid-cols-2 gap-3">
          <a
            href="/vietrecruit/oauth2/authorization/google"
            class="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </a>
          <a
            href="/vietrecruit/oauth2/authorization/github"
            class="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-surface border border-border rounded-md hover:bg-gray-50 transition"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>

        <!-- Footer -->
        <p class="text-center text-sm text-gray-500 mt-6">
          Don't have an account?
          <router-link to="/register" class="text-primary font-medium hover:text-primary-hover">
            Sign up
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>
