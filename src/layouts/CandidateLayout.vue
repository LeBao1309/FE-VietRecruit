<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/composables/useTheme'

const auth = useAuthStore()
const { isDark, toggleTheme } = useTheme()
const menuOpen = ref(false)
</script>

<template>
 <div class="flex flex-col md:flex-row min-h-screen">
 <!-- Mobile Header -->
 <header class="md:hidden flex items-center justify-between p-4 bg-surface border-b border-border">
 <router-link to="/candidate/dashboard" class="text-base font-bold text-primary">VietRecruit</router-link>
 <div class="flex items-center gap-3">
 <button @click="toggleTheme" class="text-gray-500 hover:text-primary transition" aria-label="Toggle dark mode">
 <span v-if="isDark">☀️</span>
 <span v-else>🌙</span>
 </button>
 <button @click="menuOpen = !menuOpen" class="text-gray-500 hover:text-primary transition p-1" aria-label="Toggle menu">
 <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
 </button>
 </div>
 </header>

 <aside 
 :class="menuOpen ? 'flex' : 'hidden md:flex'"
 class="w-full md:w-60 bg-surface border-b md:border-b-0 md:border-r border-border flex-col shrink-0"
 >
 <div class="hidden md:flex items-center justify-between px-4 py-4 border-b border-border">
 <router-link to="/candidate/dashboard" class="text-base font-bold text-primary">VietRecruit</router-link>
 <button @click="toggleTheme" class="text-gray-500 hover:text-primary transition" aria-label="Toggle dark mode">
 <span v-if="isDark">☀️</span>
 <span v-else>🌙</span>
 </button>
 </div>
 <nav class="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
 <router-link
 @click="menuOpen = false"
 to="/candidate/dashboard"
 class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
 active-class="!bg-primary-bg !text-primary"
 >
 Dashboard
 </router-link>

 <!-- Job Search section -->
 <div class="mt-4 mb-1 px-3">
 <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Job Search</span>
 </div>
 <router-link
 to="/candidate/recommendations"
 class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
 active-class="!bg-primary-bg !text-primary"
 >
 Recommendations
 </router-link>
 <router-link
 to="/candidate/salary-benchmark"
 class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
 active-class="!bg-primary-bg !text-primary"
 >
 Salary Benchmark
 </router-link>
 <router-link
 to="/jobs"
 class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
 >
 Browse Jobs ↗
 </router-link>

 <!-- Applications section -->
 <div class="mt-4 mb-1 px-3">
 <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Applications</span>
 </div>
 <router-link
 to="/candidate/applications"
 class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
 active-class="!bg-primary-bg !text-primary"
 >
 My Applications
 </router-link>

 <!-- Profile section -->
 <div class="mt-4 mb-1 px-3">
 <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Profile</span>
 </div>
 <router-link
 to="/candidate/candidate-profile"
 class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
 active-class="!bg-primary-bg !text-primary"
 >
 Candidate Profile
 </router-link>
 <router-link
 to="/candidate/cv"
 class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
 active-class="!bg-primary-bg !text-primary"
 >
 CV Management
 </router-link>

 <!-- Account section -->
 <div class="mt-4 mb-1 px-3">
 <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Account</span>
 </div>
 <router-link
 to="/candidate/profile"
 class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
 active-class="!bg-primary-bg !text-primary"
 >
 My Profile
 </router-link>
 <router-link
 to="/candidate/settings"
 class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
 active-class="!bg-primary-bg !text-primary"
 >
 Settings
 </router-link>
 </nav>
 <div class="px-4 py-3 border-t border-border">
 <span class="text-sm text-gray-500">{{ auth.user?.fullName ?? 'Candidate' }}</span>
 <button @click="auth.logout()" class="block text-xs text-gray-400 hover:text-error mt-1 transition">
 Log out
 </button>
 </div>
 </aside>
 <main class="flex-1 overflow-y-auto">
 <router-view />
 </main>
 </div>
</template>
