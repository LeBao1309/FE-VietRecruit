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

function navigateBack(): void {
 if (step.value === 2) {
  goBack()
 } else if (window.history.length > 1) {
  router.back()
 } else {
  router.push('/')
 }
}

function validate(): boolean {
 errors.value = {}

 if (!form.value.fullName.trim()) {
 errors.value.fullName = 'Full name is required.'
 }

 if (!form.value.email.trim()) {
 errors.value.email = 'Email address is required.'
 } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
 errors.value.email = 'Please enter a valid email address.'
 }

 if (!form.value.password) {
 errors.value.password = 'Password is required.'
 } else {
 const rules = passwordRules.value
 if (!rules.length || !rules.upper || !rules.lower || !rules.digit || !rules.special) {
 errors.value.password = 'Password does not meet the requirements.'
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
 <div class="min-h-screen flex flex-col bg-slate-50">

  <!-- Auth Header -->
  <header class="sticky top-0 z-50 flex items-center h-14 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
   <button
    @click="navigateBack"
    class="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors group"
    aria-label="Go Back"
   >
    <svg class="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
     <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
    <span>Back</span>
   </button>
   <div class="flex-1 flex justify-center">
    <router-link to="/" class="flex items-center gap-2">
     <img src="/assets/img/vietrecruit-icon.svg" alt="VietRecruit" class="h-7 w-7" />
     <span class="text-base font-extrabold text-[#007070] tracking-tight">VietRecruit</span>
    </router-link>
   </div>
   <div class="w-20" aria-hidden="true"></div>
  </header>

  <!-- Form area -->
  <div class="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="w-full max-w-md mx-auto">
  <div class="premium-card shadow-xl p-8 sm:p-10 animate-fade-in">

 <!-- Step 1: Account Type Selection -->
 <template v-if="step === 1">
 <div class="text-center mb-8">
 <h1 class="text-2xl font-bold text-slate-900">Create Account</h1>
 <p class="text-sm font-medium text-slate-500 mt-1">Choose how you would like to use VietRecruit</p>
 </div>

 <div class="space-y-4">
 <button
 @click="selectType('CANDIDATE')"
 class="w-full p-5 border border-slate-200 rounded-xl text-left hover:border-teal-500 hover:bg-teal-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 group bg-slate-50"
 >
 <div class="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
 <span class="mr-2">🔍</span> I am looking for a job
 </div>
 <p class="text-sm font-medium text-slate-500 mt-1.5 line-clamp-2">
 Search and apply for positions, track your applications
 </p>
 </button>

 <button
 @click="selectType('EMPLOYER')"
 class="w-full p-5 border border-slate-200 rounded-xl text-left hover:border-teal-500 hover:bg-teal-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300 group bg-slate-50"
 >
 <div class="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
 <span class="mr-2">🏢</span> I am hiring
 </div>
 <p class="text-sm font-medium text-slate-500 mt-1.5 line-clamp-2">
 Post job listings, manage candidates and build your team
 </p>
 </button>
 </div>

 <p class="text-center text-sm font-medium text-slate-500 mt-8">
 Already have an account?
 <router-link to="/login" class="text-teal-600 hover:text-teal-500 font-bold transition-colors">
 Sign In
 </router-link>
 </p>
 </template>

 <!-- Step 2: Registration Form -->
 <template v-else>
 <div class="text-center mb-8">
 <h1 class="text-2xl font-bold text-slate-900">
 {{ accountType === 'CANDIDATE' ? 'Candidate Registration' : 'Employer Registration' }}
 </h1>
 <p class="text-sm font-medium text-slate-500 mt-1">Fill in your information to get started</p>
 </div>

 <form @submit.prevent="handleSubmit" class="space-y-5">
 <!-- Full Name -->
 <div>
 <label for="reg-name" class="block text-sm font-bold text-slate-700 mb-1.5">Full Name</label>
 <input
 id="reg-name"
 v-model="form.fullName"
 type="text"
 autocomplete="name"
 placeholder="Your full name"
 class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50"
 :class="errors.fullName ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'"
 />
 <p v-if="errors.fullName" class="text-xs font-bold text-rose-500 mt-1.5">{{ errors.fullName }}</p>
 </div>

 <!-- Email -->
 <div>
 <label for="reg-email" class="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
 <input
 id="reg-email"
 v-model="form.email"
 type="email"
 autocomplete="email"
 placeholder="you@example.com"
 class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50"
 :class="errors.email ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'"
 />
 <p v-if="errors.email" class="text-xs font-bold text-rose-500 mt-1.5">{{ errors.email }}</p>
 </div>

 <!-- Password -->
 <div>
 <label for="reg-password" class="block text-sm font-bold text-slate-700 mb-1.5">Password</label>
 <div class="relative">
 <input
 id="reg-password"
 v-model="form.password"
 :type="showPassword ? 'text' : 'password'"
 autocomplete="new-password"
 placeholder="••••••••"
 class="w-full px-4 py-3 pr-16 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50"
 :class="errors.password ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'"
 />
 <button
 type="button"
 @click="showPassword = !showPassword"
 class="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-slate-400 hover:text-slate-600 transition-colors bg-white/50 rounded-md text-xs font-bold"
 >
 {{ showPassword ? 'Hide' : 'Show' }}
 </button>
 </div>
 <p v-if="errors.password" class="text-xs font-bold text-rose-500 mt-1.5">{{ errors.password }}</p>

 <!-- Password strength -->
 <div v-if="form.password.length > 0" class="mt-3">
 <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
 <div :class="[passwordStrength.color, passwordStrength.width]" class="h-full rounded-full transition-all duration-500" />
 </div>
 <div class="flex items-center justify-between mt-1.5">
 <span class="text-xs font-bold text-slate-500">{{ passwordStrength.label }}</span>
 </div>
 <ul class="mt-2 space-y-1">
 <li v-for="(passed, rule) in passwordRules" :key="rule" class="text-xs font-medium flex items-center gap-2"
 :class="passed ? 'text-emerald-500' : 'text-slate-400'">
 <span class="font-bold flex-shrink-0">{{ passed ? '✓' : '○' }}</span>
 <span>
 {{ rule === 'length' ? 'At least 8 characters' :
 rule === 'upper' ? 'One uppercase letter' :
 rule === 'lower' ? 'One lowercase letter' :
 rule === 'digit' ? 'One digit' :
 'One special character' }}
 </span>
 </li>
 </ul>
 </div>
 </div>

 <!-- Confirm Password -->
 <div>
 <label for="reg-confirm" class="block text-sm font-bold text-slate-700 mb-1.5">Confirm Password</label>
 <input
 id="reg-confirm"
 v-model="form.confirmPassword"
 type="password"
 autocomplete="new-password"
 placeholder="••••••••"
 class="w-full px-4 py-3 text-sm border rounded-xl outline-none transition-all duration-300 bg-slate-50"
 :class="errors.confirmPassword ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:bg-white'"
 />
 <p v-if="errors.confirmPassword" class="text-xs font-bold text-rose-500 mt-1.5">{{ errors.confirmPassword }}</p>
 </div>

 <!-- Submit -->
 <button
 type="submit"
 :disabled="auth.loading"
 class="btn-primary w-full py-3 mt-4 flex items-center justify-center gap-2"
 >
 <span v-if="auth.loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ auth.loading ? 'Creating account…' : 'Create Account' }}
 </button>
 </form>

 <p class="text-center text-sm font-medium text-slate-500 mt-8">
 Already have an account?
 <router-link to="/login" class="text-teal-600 hover:text-teal-500 font-bold transition-colors">
 Sign In
 </router-link>
 </p>
 </template>
 </div>
 </div>
 </div>
 </div>
</template>
