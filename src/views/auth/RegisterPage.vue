<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import type { AccountType } from '@/types/enums'

const router = useRouter()
const auth = useAuthStore()

// ── Multi-step: 1=type select, 2=form ──
const step = ref(1)
const accountType = ref<AccountType | null>(null)

const form = ref({
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
})

const showPassword = ref(false)
const errors = ref<Record<string, string>>({})

const passwordRules = computed(() => {
  const pw = form.value.password
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    digit: /\d/.test(pw),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  }
})

const passwordStrength = computed(() => {
  const rules = passwordRules.value
  const passed = [rules.length, rules.upper, rules.lower, rules.digit, rules.special].filter(Boolean).length
  if (passed <= 2) return { label: 'Weak', color: 'bg-error', width: 'w-1/5' }
  if (passed <= 3) return { label: 'Fair', color: 'bg-warning', width: 'w-2/5' }
  if (passed <= 4) return { label: 'Good', color: 'bg-info', width: 'w-3/5' }
  return { label: 'Strong', color: 'bg-success', width: 'w-full' }
})

function selectType(type: AccountType): void {
  accountType.value = type
  step.value = 2
}

function goBack(): void {
  step.value = 1
  errors.value = {}
}

function validate(): boolean {
  errors.value = {}

  if (!form.value.fullName.trim()) {
    errors.value.fullName = 'Full name is required.'
  }

  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email.'
  }

  if (!form.value.password) {
    errors.value.password = 'Password is required.'
  } else {
    const rules = passwordRules.value
    if (!rules.length || !rules.upper || !rules.lower || !rules.digit || !rules.special) {
      errors.value.password = 'Password does not meet all requirements.'
    }
  }

  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match.'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit(): Promise<void> {
  if (!validate() || !accountType.value) return

  const success = await auth.register({
    email: form.value.email,
    password: form.value.password,
    fullName: form.value.fullName,
    accountType: accountType.value,
  })

  if (success) {
    await router.push({
      path: '/verify-otp',
      query: { email: form.value.email },
    })
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

        <!-- Step 1: Account Type Selection -->
        <template v-if="step === 1">
          <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">Create your account</h1>
            <p class="text-sm text-gray-500 mt-1">Choose how you want to use VietRecruit</p>
          </div>

          <div class="space-y-3">
            <button
              @click="selectType('CANDIDATE')"
              class="w-full p-4 border border-border rounded-lg text-left hover:border-primary hover:bg-primary-bg transition group"
            >
              <div class="font-semibold text-gray-900 group-hover:text-primary transition">
                🔍 I'm looking for a job
              </div>
              <p class="text-sm text-gray-500 mt-1">
                Search and apply for positions, track your applications
              </p>
            </button>

            <button
              @click="selectType('EMPLOYER')"
              class="w-full p-4 border border-border rounded-lg text-left hover:border-primary hover:bg-primary-bg transition group"
            >
              <div class="font-semibold text-gray-900 group-hover:text-primary transition">
                🏢 I'm hiring talent
              </div>
              <p class="text-sm text-gray-500 mt-1">
                Post jobs, manage candidates, and build your team
              </p>
            </button>
          </div>

          <p class="text-center text-sm text-gray-500 mt-6">
            Already have an account?
            <router-link to="/login" class="text-primary font-medium hover:text-primary-hover">
              Sign in
            </router-link>
          </p>
        </template>

        <!-- Step 2: Registration Form -->
        <template v-else>
          <div class="mb-6">
            <button @click="goBack" class="text-sm text-gray-500 hover:text-gray-700 transition flex items-center gap-1">
              ← Back
            </button>
          </div>

          <div class="text-center mb-6">
            <h1 class="text-2xl font-bold text-gray-900">
              {{ accountType === 'CANDIDATE' ? 'Join as a Candidate' : 'Join as an Employer' }}
            </h1>
            <p class="text-sm text-gray-500 mt-1">Fill in your details to get started</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <!-- Full Name -->
            <div>
              <label for="reg-name" class="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                id="reg-name"
                v-model="form.fullName"
                type="text"
                autocomplete="name"
                placeholder="John Smith"
                class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
                :class="errors.fullName ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
              />
              <p v-if="errors.fullName" class="text-xs text-error mt-1">{{ errors.fullName }}</p>
            </div>

            <!-- Email -->
            <div>
              <label for="reg-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="reg-email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="you@example.com"
                class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
                :class="errors.email ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
              />
              <p v-if="errors.email" class="text-xs text-error mt-1">{{ errors.email }}</p>
            </div>

            <!-- Password -->
            <div>
              <label for="reg-password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div class="relative">
                <input
                  id="reg-password"
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

              <!-- Password strength -->
              <div v-if="form.password.length > 0" class="mt-2">
                <div class="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div :class="[passwordStrength.color, passwordStrength.width]" class="h-full rounded-full transition-all duration-300" />
                </div>
                <div class="flex items-center justify-between mt-1">
                  <span class="text-xs text-gray-400">{{ passwordStrength.label }}</span>
                </div>
                <ul class="mt-2 space-y-0.5">
                  <li v-for="(passed, rule) in passwordRules" :key="rule" class="text-xs flex items-center gap-1.5"
                    :class="passed ? 'text-success' : 'text-gray-400'">
                    <span>{{ passed ? '✓' : '○' }}</span>
                    <span>
                      {{ rule === 'length' ? 'At least 8 characters' :
                         rule === 'upper' ? 'One uppercase letter' :
                         rule === 'lower' ? 'One lowercase letter' :
                         rule === 'digit' ? 'One number' :
                         'One special character' }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="reg-confirm" class="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input
                id="reg-confirm"
                v-model="form.confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
                :class="errors.confirmPassword ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
              />
              <p v-if="errors.confirmPassword" class="text-xs text-error mt-1">{{ errors.confirmPassword }}</p>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="auth.loading"
              class="w-full py-2.5 px-4 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              <span v-if="auth.loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {{ auth.loading ? 'Creating account…' : 'Create account' }}
            </button>
          </form>

          <p class="text-center text-sm text-gray-500 mt-6">
            Already have an account?
            <router-link to="/login" class="text-primary font-medium hover:text-primary-hover">
              Sign in
            </router-link>
          </p>
        </template>
      </div>
    </div>
  </div>
</template>
