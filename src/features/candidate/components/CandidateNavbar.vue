<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/core/stores/auth.store'
import { useCandidateStore } from '../stores/candidate.store'

const router = useRouter()
const authStore = useAuthStore()
const candidateStore = useCandidateStore()
const mobileMenuOpen = ref(false)

const navItems = [
 { to: '/jobs', label: 'Tim viec', icon: 'search' },
 { to: '/applications/mine', label: 'Don ung tuyen', icon: 'applications' },
 { to: '/candidate/profile', label: 'Ho so', icon: 'profile' },
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
 <nav class="bg-panel border-b border-border sticky top-0 z-50">
 <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div class="flex items-center justify-between h-14">
 <!-- Logo -->
 <router-link to="/jobs" class="flex items-center gap-2 flex-shrink-0">
 <div class="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
 <span class="text-white font-bold text-sm">VR</span>
 </div>
 <span class="font-bold text-text-primary hidden sm:block">VietRecruit</span>
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
 ? 'bg-brand-light text-brand-darker'
 : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
 ]"
 >
 {{ item.label }}
 </router-link>
 </div>

 <!-- User menu -->
 <div class="flex items-center gap-3">
 <div class="hidden sm:flex items-center gap-2">
 <div class="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-brand-darker text-xs font-bold">
 <img
 v-if="candidateStore.userProfile?.avatarUrl"
 :src="candidateStore.userProfile.avatarUrl"
 class="w-full h-full rounded-full object-cover"
 alt=""
 />
 <span v-else>{{ getInitials(authStore.user?.fullName) }}</span>
 </div>
 <span class="text-sm text-text-secondary max-w-[120px] truncate">
 {{ authStore.user?.fullName || 'Ung vien' }}
 </span>
 </div>

 <button
 @click="handleLogout"
 class="text-xs text-text-muted hover:text-danger font-medium px-2 py-1.5 rounded-lg hover:bg-surface-muted transition-colors hidden sm:block"
 >
 Dang xuat
 </button>

 <!-- Mobile menu toggle -->
 <button
 @click="mobileMenuOpen = !mobileMenuOpen"
 class="md:hidden p-2 rounded-lg text-text-secondary hover:bg-surface-muted"
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
 <div v-if="mobileMenuOpen" class="md:hidden border-t border-border bg-panel">
 <div class="px-4 py-3 space-y-1">
 <router-link
 v-for="item in navItems"
 :key="item.to"
 :to="item.to"
 class="block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
 :class="[
 $route.path === item.to
 ? 'bg-brand-light text-brand-darker'
 : 'text-text-secondary hover:bg-surface-muted'
 ]"
 @click="mobileMenuOpen = false"
 >
 {{ item.label }}
 </router-link>

 <div class="border-t border-border-subtle pt-2 mt-2">
 <button
 @click="handleLogout"
 class="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger-light transition-colors"
 >
 Dang xuat
 </button>
 </div>
 </div>
 </div>
 </nav>
</template>
