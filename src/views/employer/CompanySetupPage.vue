<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { companyService } from '@/services/companyService'
import { useUiStore } from '@/stores/uiStore'
import type { CompanyCreateRequest } from '@/types/company'

const router = useRouter()
const ui = useUiStore()

const step = ref(1)
const loading = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref<CompanyCreateRequest>({
 name: '',
 domain: '',
 website: '',
})

function validate(): boolean {
 errors.value = {}
 if (!form.value.name.trim()) {
 errors.value.name = 'Company name is required.'
 } else if (form.value.name.length > 255) {
 errors.value.name = 'Company name must be 255 characters or fewer.'
 }
 if (form.value.website && !/^https?:\/\/.+/.test(form.value.website)) {
 errors.value.website = 'Please enter a valid URL (https://...).'
 }
 return Object.keys(errors.value).length === 0
}

async function handleSubmit(): Promise<void> {
 if (!validate()) return
 loading.value = true
 try {
 const result = await companyService.createCompany(form.value)
 if (result.error) {
 ui.toastError('Company creation failed', result.error.message)
 return
 }
 step.value = 2
 ui.toastSuccess('Company created!', `${form.value.name} is ready to go.`)
 } finally {
 loading.value = false
 }
}

function goToDashboard(): void {
 router.push('/employer/dashboard')
}

function goToOrganization(): void {
 router.push('/employer/organization')
}

function goToTeam(): void {
 router.push('/employer/team')
}
</script>

<template>
 <div class="min-h-screen flex flex-col bg-page">
 <div class="py-6 text-center">
 <router-link to="/" class="text-xl font-bold text-primary">VietRecruit</router-link>
 </div>

 <div class="w-full max-w-lg mx-auto px-4">
 <!-- Step indicator -->
 <div class="flex items-center justify-center gap-2 mb-8">
 <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
 :class="step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'">
 1
 </div>
 <div class="w-16 h-0.5" :class="step >= 2 ? 'bg-primary' : 'bg-gray-200'" />
 <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
 :class="step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'">
 2
 </div>
 </div>

 <!-- Step 1: Create Company -->
 <div v-if="step === 1" class="bg-surface border border-border rounded-lg shadow-sm p-8 animate-fade-in">
 <div class="text-center mb-8">
 <div class="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-4">
 🏢
 </div>
 <h1 class="text-2xl font-bold text-gray-900">Set up your company</h1>
 <p class="text-sm text-gray-500 mt-1">Tell us about your organization to get started</p>
 </div>

 <form @submit.prevent="handleSubmit" class="space-y-4">
 <!-- Company name -->
 <div>
 <label for="co-name" class="block text-sm font-medium text-gray-700 mb-1">
 Company name <span class="text-error">*</span>
 </label>
 <input
 id="co-name"
 v-model="form.name"
 type="text"
 placeholder="Acme Corporation"
 class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
 :class="errors.name ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <p v-if="errors.name" class="text-xs text-error mt-1">{{ errors.name }}</p>
 </div>

 <!-- Domain -->
 <div>
 <label for="co-domain" class="block text-sm font-medium text-gray-700 mb-1">Industry / Domain</label>
 <input
 id="co-domain"
 v-model="form.domain"
 type="text"
 placeholder="e.g. Technology, Healthcare, Finance"
 class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
 />
 </div>

 <!-- Website -->
 <div>
 <label for="co-website" class="block text-sm font-medium text-gray-700 mb-1">Company website</label>
 <input
 id="co-website"
 v-model="form.website"
 type="url"
 placeholder="https://www.example.com"
 class="w-full px-3 py-2.5 text-sm border rounded-md outline-none transition"
 :class="errors.website ? 'border-error focus:ring-2 focus:ring-error-bg' : 'border-border focus:border-primary focus:ring-2 focus:ring-primary-light'"
 />
 <p v-if="errors.website" class="text-xs text-error mt-1">{{ errors.website }}</p>
 </div>

 <button
 type="submit"
 :disabled="loading"
 class="w-full py-2.5 px-4 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
 >
 <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 {{ loading ? 'Creating…' : 'Create company' }}
 </button>
 </form>
 </div>

 <!-- Step 2: Next Steps -->
 <div v-else class="bg-surface border border-border rounded-lg shadow-sm p-8 animate-fade-in">
 <div class="text-center mb-8">
 <div class="w-14 h-14 bg-success-bg rounded-full flex items-center justify-center text-success text-2xl mx-auto mb-4">
 ✓
 </div>
 <h1 class="text-2xl font-bold text-gray-900">You're all set!</h1>
 <p class="text-sm text-gray-500 mt-1">Your company has been created. Here's what to do next:</p>
 </div>

 <div class="space-y-3 mb-6">
 <button
 @click="goToOrganization"
 class="w-full p-4 border border-border rounded-lg text-left hover:border-primary hover:bg-primary-bg transition group"
 >
 <div class="font-semibold text-gray-900 group-hover:text-primary transition">
 📊 Set up departments & locations
 </div>
 <p class="text-sm text-gray-500 mt-1">
 Define your org structure for better job management
 </p>
 </button>

 <button
 @click="goToTeam"
 class="w-full p-4 border border-border rounded-lg text-left hover:border-primary hover:bg-primary-bg transition group"
 >
 <div class="font-semibold text-gray-900 group-hover:text-primary transition">
 👥 Invite your team
 </div>
 <p class="text-sm text-gray-500 mt-1">
 Add HR managers and interviewers to collaborate
 </p>
 </button>

 <button
 @click="goToDashboard"
 class="w-full p-4 border border-border rounded-lg text-left hover:border-primary hover:bg-primary-bg transition group"
 >
 <div class="font-semibold text-gray-900 group-hover:text-primary transition">
 🚀 Go to dashboard
 </div>
 <p class="text-sm text-gray-500 mt-1">
 Skip for now and start using VietRecruit
 </p>
 </button>
 </div>
 </div>
 </div>
 </div>
</template>
