<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-60 bg-surface border-r border-border flex flex-col shrink-0">
      <div class="px-4 py-4 border-b border-border">
        <router-link to="/candidate/dashboard" class="text-base font-bold text-primary">VietRecruit</router-link>
      </div>
      <nav class="flex-1 p-3 flex flex-col gap-0.5">
        <router-link
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
