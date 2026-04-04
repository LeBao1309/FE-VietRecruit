<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppHeader from '@/components/common/AppHeader.vue'

const auth = useAuthStore()
const menuOpen = ref(false)

const navItems = [
 { to: '/admin/users', label: 'Đội Ngũ', icon: '👥' },
 { to: '/admin/transactions', label: 'Giao Dịch', icon: '💳' },
]
</script>

<template>
 <div class="flex flex-col md:flex-row min-h-screen">
 <!-- Mobile Header -->
 <AppHeader variant="dark" :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" />

 <!-- Sidebar -->
 <aside 
 :class="menuOpen ? 'flex' : 'hidden md:flex'"
 class="w-full md:w-[240px] bg-gray-900 flex-col shrink-0"
 >
 <div class="hidden md:flex items-center p-5 border-b border-white/5">
 <router-link to="/admin/users" class="flex items-center gap-2 hover:opacity-80 transition text-white">
 <span class="text-xl">⚙</span>
 <span class="text-sm font-bold tracking-tight">VietRecruit Quản Trị Viên</span>
 </router-link>
 </div>

 <nav class="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
 <router-link
 v-for="item in navItems"
 :key="item.to"
 :to="item.to"
 @click="menuOpen = false"
 class="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition"
 active-class="!bg-teal-500/15 !text-teal-300 font-semibold"
 >
 <span class="text-base">{{ item.icon }}</span>
 {{ item.label }}
 </router-link>
 </nav>

 <div class="flex items-center justify-between p-4 border-t border-white/5">
 <div class="flex items-center gap-2.5 truncate">
 <div class="w-7 h-7 rounded-full bg-teal-500/30 text-teal-300 flex items-center justify-center text-xs font-bold shrink-0">
 {{ auth.user?.fullName?.charAt(0)?.toUpperCase() ?? 'A' }}
 </div>
 <div class="flex flex-col truncate">
 <span class="text-xs font-semibold text-slate-200 truncate leading-tight">{{ auth.user?.fullName ?? 'Quản Trị Viên' }}</span>
 <span class="text-[10px] text-slate-500">Quản Trị Hệ Thống</span>
 </div>
 </div>
 <button @click="auth.logout()" class="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition shrink-0" title="Đăng Xuất">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
 <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
 <polyline points="16 17 21 12 16 7" />
 <line x1="21" y1="12" x2="9" y2="12" />
 </svg>
 </button>
 </div>
 </aside>

 <main class="flex-1 overflow-y-auto bg-slate-50 border-l border-border md:border-none">
 <router-view />
 </main>
 </div>
</template>


