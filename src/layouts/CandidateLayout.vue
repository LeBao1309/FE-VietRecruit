<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppHeader from '@/components/common/AppHeader.vue'

const auth = useAuthStore()
const menuOpen = ref(false)
</script>

<template>
  <div class="flex flex-col md:flex-row min-h-screen">
  <!-- Mobile Header -->
  <AppHeader :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" />

  <aside 
  :class="menuOpen ? 'flex' : 'hidden md:flex'"
  class="w-full md:w-60 bg-surface border-b md:border-b-0 md:border-r border-border flex-col shrink-0"
  >
  <div class="hidden md:flex items-center px-4 py-4 border-b border-border">
  <router-link to="/candidate/dashboard" class="text-base font-bold text-primary">VietRecruit</router-link>
  </div>
  <nav class="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
  <router-link
  @click="menuOpen = false"
  to="/candidate/dashboard"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Overview
  </router-link>

  <!-- Job Search section -->
  <div class="mt-4 mb-1 px-3">
  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Find Jobs</span>
  </div>
  <router-link
  to="/candidate/recommendations"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  AI Job Recommendations
  </router-link>
  <router-link
  to="/candidate/salary-benchmark"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Salary Reference
  </router-link>
  <router-link
  to="/jobs"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  >
  View Jobs ↗
  </router-link>

  <!-- Applications section -->
  <div class="mt-4 mb-1 px-3">
  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Applications</span>
  </div>
  <router-link
  to="/candidate/applications"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  My Applications
  </router-link>

  <!-- Profile section -->
  <div class="mt-4 mb-1 px-3">
  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile</span>
  </div>
  <router-link
  to="/candidate/candidate-profile"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Professional Profile
  </router-link>
  <router-link
  to="/candidate/cv"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  CV Management
  </router-link>

  <!-- Account section -->
  <div class="mt-4 mb-1 px-3">
  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account</span>
  </div>
  <router-link
  to="/candidate/profile"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Account Management
  </router-link>
  <router-link
  to="/candidate/settings"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Settings
  </router-link>
  </nav>
  <div class="px-4 py-3 border-t border-border">
  <span class="text-sm text-gray-500">{{ auth.user?.fullName ?? 'Candidate' }}</span>
  <button @click="auth.logout()" class="block text-xs text-gray-400 hover:text-error mt-1 transition">
  Sign Out
  </button>
  </div>
  </aside>
  <main class="flex-1 overflow-y-auto">
  <router-view />
  </main>
  </div>
</template>
