<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

interface Props {
  menuOpen?: boolean
  variant?: 'light' | 'dark'
}

withDefaults(defineProps<Props>(), {
  menuOpen: false,
  variant: 'light',
})

const emit = defineEmits<{ 'toggle-menu': [] }>()

const auth = useAuthStore()

const homeLink = computed(() => {
  if (auth.isCandidate) return '/candidate/dashboard'
  if (auth.isEmployer) return '/employer/dashboard'
  if (auth.isSystemAdmin) return '/admin/users'
  return '/'
})
</script>

<template>
  <header
    class="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14 border-b"
    :class="variant === 'dark'
      ? 'bg-gray-900 border-gray-800'
      : 'bg-white/95 backdrop-blur-md border-slate-200/60 shadow-sm'"
  >
    <!-- Logo -->
    <router-link :to="homeLink" class="flex items-center gap-2 min-w-0">
      <img src="/assets/img/vietrecruit-icon.svg" alt="VietRecruit" class="h-7 w-7 shrink-0" />
      <span
        class="text-base font-extrabold tracking-tight truncate"
        :class="variant === 'dark' ? 'text-white' : 'text-[#007070]'"
      >VietRecruit</span>
    </router-link>

    <!-- Hamburger / Close toggle -->
    <button
      @click="emit('toggle-menu')"
      class="flex items-center justify-center w-10 h-10 rounded-xl transition-colors shrink-0"
      :class="variant === 'dark'
        ? 'text-slate-400 hover:text-white hover:bg-white/10'
        : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50'"
      aria-label="Toggle menu"
    >
      <!-- Hamburger -->
      <svg v-if="!menuOpen" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <!-- Close -->
      <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </header>
</template>
