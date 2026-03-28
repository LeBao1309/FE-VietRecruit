<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
</script>

<template>
  <div class="flex min-h-screen">
    <aside class="w-60 bg-[#1a1a2e] flex flex-col shrink-0">
      <div class="px-4 py-4 border-b border-white/10">
        <router-link to="/admin/users" class="text-base font-bold text-primary-light">VietRecruit Admin</router-link>
      </div>
      <nav class="flex-1 p-3 flex flex-col gap-0.5">
        <router-link
          to="/admin/users"
          class="block px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-primary/15 hover:text-primary-light transition"
          active-class="!bg-primary/15 !text-primary-light"
        >
          Users
        </router-link>
      </nav>
      <div class="px-4 py-3 border-t border-white/10">
        <span class="text-sm text-gray-400">{{ auth.user?.fullName ?? 'Admin' }}</span>
        <button @click="auth.logout()" class="block text-xs text-gray-500 hover:text-red-400 mt-1 transition">
          Log out
        </button>
      </div>
    </aside>
    <main class="flex-1 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>
