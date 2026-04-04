<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const userMenuOpen = ref(false)

function getDashboardPath(): string {
  if (auth.isCandidate) return '/candidate/dashboard'
  if (auth.isEmployer) return '/employer/dashboard'
  if (auth.isSystemAdmin) return '/admin/users'
  return '/'
}

function getDashboardLabel(): string {
  if (auth.isCandidate) return 'Bảng Điều Khiển Ứng Viên'
  if (auth.isEmployer) return 'Bảng Điều Khiển Nhà Tuyển Dụng'
  if (auth.isSystemAdmin) return 'Quản Trị Hệ Thống'
  return 'Trang Chủ'
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2 shrink-0">
        <img src="/assets/img/vietrecruit-icon.svg" alt="VietRecruit" class="h-8 w-8" />
        <span class="text-xl font-extrabold text-[#008c8c] tracking-tight">VietRecruit</span>
      </router-link>

      <!-- Center nav slot (landing page section links etc.) -->
      <nav class="hidden md:flex items-center gap-6">
        <slot name="nav" />
        <router-link
          to="/jobs"
          class="text-sm font-medium text-slate-600 hover:text-[#008c8c] transition-colors"
          active-class="text-[#008c8c] font-bold"
        >
          Tìm Việc
        </router-link>
      </nav>

      <!-- Right: auth -->
      <div class="flex items-center gap-3">
        <!-- Tìm Việc on mobile (hidden in center nav) -->
        <router-link
          to="/jobs"
          class="md:hidden text-sm font-medium text-slate-600 hover:text-[#008c8c] transition-colors"
          active-class="text-[#008c8c] font-bold"
        >
          Tìm Việc
        </router-link>

        <template v-if="!auth.isAuthenticated">
          <router-link to="/login" class="text-sm font-bold text-slate-700 hover:text-[#008c8c] transition-colors hidden sm:block">
            Đăng Nhập
          </router-link>
          <router-link to="/register" class="btn-primary px-5 py-2 rounded-full shadow-sm hover:shadow-md shrink-0">
            Bắt Đầu
          </router-link>
        </template>

        <template v-else>
          <div class="relative">
            <button
              @click="userMenuOpen = !userMenuOpen"
              class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 hover:text-teal-600 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-200 hover:border-teal-300 transition-all"
            >
              <span class="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-extrabold shrink-0">
                {{ auth.user?.fullName?.charAt(0)?.toUpperCase() ?? 'U' }}
              </span>
              <span class="hidden sm:inline max-w-[120px] truncate">{{ auth.user?.fullName }}</span>
              <svg class="w-4 h-4 text-slate-400 transition-transform" :class="userMenuOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div v-if="userMenuOpen" class="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
              <div class="px-4 py-2.5 border-b border-slate-100">
                <p class="text-sm font-bold text-slate-900 truncate">{{ auth.user?.fullName }}</p>
                <p class="text-xs text-slate-400 truncate">{{ auth.user?.email }}</p>
              </div>
              <router-link :to="getDashboardPath()" @click="userMenuOpen = false" class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                {{ getDashboardLabel() }}
              </router-link>
              <router-link to="/jobs" @click="userMenuOpen = false" class="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Xem Việc Làm
              </router-link>
              <div class="border-t border-slate-100 mt-1 pt-1">
                <button @click="auth.logout(); userMenuOpen = false" class="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng Xuất
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

    </div>
  </header>
</template>
