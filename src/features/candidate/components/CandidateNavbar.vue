<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const navItems = [
  { to: '/jobs', label: 'Find Jobs' },
  { to: '/candidate/applications', label: 'My Applications' },
  { to: '/candidate/candidate-profile', label: 'Profile' },
] as const

async function handleLogout() {
  await authStore.logout()
}

function getInitials(name: string | undefined | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <nav class="bg-white border-b border-border sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-14">

        <!-- Logo -->
        <router-link to="/candidate/dashboard" class="flex items-center gap-2 shrink-0">
          <img src="/assets/img/vietrecruit-icon.svg" alt="VietRecruit" class="h-7 w-7" />
          <span class="font-extrabold text-[#007070] hidden sm:block tracking-tight">VietRecruit</span>
        </router-link>

        <!-- Desktop nav -->
        <div class="hidden md:flex items-center gap-1">
          <router-link
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
            :class="[
              $route.path === item.to || $route.path.startsWith(item.to + '/')
                ? 'bg-primary-light text-[#007070]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            ]"
          >
            {{ item.label }}
          </router-link>
        </div>

        <!-- User menu -->
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary-light text-[#007070] flex items-center justify-center text-xs font-bold shrink-0">
              {{ getInitials(authStore.user?.fullName) }}
            </div>
            <span class="text-sm text-slate-600 max-w-[120px] truncate">
              {{ authStore.user?.fullName || 'Candidate' }}
            </span>
          </div>

          <button
            @click="handleLogout"
            class="text-xs text-slate-500 hover:text-rose-600 font-medium px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors hidden sm:block"
          >
            Sign Out
          </button>

          <!-- Mobile menu toggle -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg v-if="!mobileMenuOpen" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-border bg-white">
      <div class="px-4 py-3 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="[
            $route.path === item.to
              ? 'bg-primary-light text-[#007070]'
              : 'text-slate-600 hover:bg-slate-100'
          ]"
          @click="mobileMenuOpen = false"
        >
          {{ item.label }}
        </router-link>

        <div class="border-t border-slate-100 pt-2 mt-2">
          <button
            @click="handleLogout"
            class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
