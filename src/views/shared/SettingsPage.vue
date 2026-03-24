<script setup lang="ts">
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useUiStore } from '@/stores/uiStore'

const auth = useAuthStore()
const ui = useUiStore()

// ── Change Password ──
const pwForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const pwLoading = ref(false)
const showCurrentPw = ref(false)
const showNewPw = ref(false)
const pwErrors = ref<Record<string, string>>({})

const passwordRules = computed(() => {
  const pw = pwForm.value.newPassword
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

function validatePw(): boolean {
  pwErrors.value = {}
  if (!pwForm.value.currentPassword) pwErrors.value.currentPassword = 'Current password is required.'
  if (!pwForm.value.newPassword) {
    pwErrors.value.newPassword = 'New password is required.'
  } else {
    const rules = passwordRules.value
    if (!rules.length || !rules.upper || !rules.lower || !rules.digit || !rules.special) {
      pwErrors.value.newPassword = 'Password does not meet all requirements.'
    }
  }
  if (pwForm.value.newPassword !== pwForm.value.confirmPassword) {
    pwErrors.value.confirmPassword = 'Passwords do not match.'
  }
  return Object.keys(pwErrors.value).length === 0
}

async function handleChangePassword(): Promise<void> {
  if (!validatePw()) return
  pwLoading.value = true
  try {
    const result = await authService.changePassword({
      currentPassword: pwForm.value.currentPassword,
      newPassword: pwForm.value.newPassword,
    })
    if (result.error) {
      ui.toastError('Password change failed', result.error.message)
      return
    }
    ui.toastSuccess('Password changed', 'All other sessions have been revoked. Please log in again.')
    pwForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    // Backend revokes all sessions, redirect to login
    await auth.logout()
  } finally {
    pwLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-8">
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900">Settings</h1>
      <p class="text-sm text-gray-500 mt-1">Manage your account security</p>
    </div>

    <!-- Account info -->
    <div class="bg-surface border border-border rounded-lg shadow-sm overflow-hidden mb-6">
      <div class="p-4 border-b border-border">
        <h2 class="text-sm font-semibold text-gray-900">Account</h2>
      </div>
      <div class="p-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">Email</span>
          <span class="text-sm font-medium text-gray-900">{{ auth.user?.email ?? '—' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">Roles</span>
          <div class="flex gap-1">
            <span
              v-for="role in auth.roles"
              :key="role"
              class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary-light text-primary"
            >
              {{ role }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password -->
    <div class="bg-surface border border-border rounded-lg shadow-sm overflow-hidden">
      <div class="p-4 border-b border-border">
        <h2 class="text-sm font-semibold text-gray-900">Change Password</h2>
        <p class="text-xs text-gray-400 mt-0.5">All active sessions will be revoked after changing your password.</p>
      </div>
      <form @submit.prevent="handleChangePassword" class="p-4 space-y-4">
        <!-- Current password -->
        <div>
          <label for="set-current-pw" class="block text-sm font-medium text-gray-700 mb-1">Current password</label>
          <div class="relative">
            <input
              id="set-current-pw"
              v-model="pwForm.currentPassword"
              :type="showCurrentPw ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-3 py-2.5 pr-10 text-sm border rounded-md outline-none transition"
              :class="pwErrors.currentPassword ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
            />
            <button
              type="button"
              @click="showCurrentPw = !showCurrentPw"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              {{ showCurrentPw ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="pwErrors.currentPassword" class="text-xs text-error mt-1">{{ pwErrors.currentPassword }}</p>
        </div>

        <!-- New password -->
        <div>
          <label for="set-new-pw" class="block text-sm font-medium text-gray-700 mb-1">New password</label>
          <div class="relative">
            <input
              id="set-new-pw"
              v-model="pwForm.newPassword"
              :type="showNewPw ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full px-3 py-2.5 pr-10 text-sm border rounded-md outline-none transition"
              :class="pwErrors.newPassword ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
            />
            <button
              type="button"
              @click="showNewPw = !showNewPw"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              {{ showNewPw ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="pwErrors.newPassword" class="text-xs text-error mt-1">{{ pwErrors.newPassword }}</p>

          <!-- Password strength -->
          <div v-if="pwForm.newPassword.length > 0" class="mt-2">
            <div class="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div :class="[passwordStrength.color, passwordStrength.width]" class="h-full rounded-full transition-all duration-300" />
            </div>
            <span class="text-xs text-gray-400 mt-1">{{ passwordStrength.label }}</span>
            <ul class="mt-1.5 space-y-0.5">
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

        <!-- Confirm password -->
        <div>
          <label for="set-confirm-pw" class="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
          <input
            id="set-confirm-pw"
            v-model="pwForm.confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="••••••••"
            class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
            :class="pwErrors.confirmPassword ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
          />
          <p v-if="pwErrors.confirmPassword" class="text-xs text-error mt-1">{{ pwErrors.confirmPassword }}</p>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            :disabled="pwLoading"
            class="px-6 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span v-if="pwLoading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ pwLoading ? 'Changing…' : 'Change password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
