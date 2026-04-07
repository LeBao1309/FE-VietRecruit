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
  Tổng Quan
  </router-link>

  <!-- Job Search section -->
  <div class="mt-4 mb-1 px-3">
  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tìm Việc Làm</span>
  </div>
  <router-link
  to="/candidate/recommendations"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Việc Làm Đề Xuất
  </router-link>
  <router-link
  to="/candidate/salary-benchmark"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Mức Lương Tham Khảo
  </router-link>
  <router-link
  to="/jobs"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  >
  Xem Việc Làm ↗
  </router-link>

  <!-- Applications section -->
  <div class="mt-4 mb-1 px-3">
  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hồ Sơ Ứng Tuyển</span>
  </div>
  <router-link
  to="/candidate/applications"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Đơn Ứng Tuyển Của Tôi
  </router-link>

  <!-- Profile section -->
  <div class="mt-4 mb-1 px-3">
  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hồ Sơ</span>
  </div>
  <router-link
  to="/candidate/candidate-profile"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Hồ Sơ Năng Lực
  </router-link>
  <router-link
  to="/candidate/cv"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Quản Lý CV
  </router-link>

  <!-- Account section -->
  <div class="mt-4 mb-1 px-3">
  <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tài Khoản</span>
  </div>
  <router-link
  to="/candidate/profile"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Quản Lý Tài Khoản
  </router-link>
  <router-link
  to="/candidate/settings"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Cài Đặt
  </router-link>
  <router-link
  to="/candidate/notifications"
  class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
  active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
  >
  Thông Báo
  </router-link>
  </nav>
  <div class="px-4 py-3 border-t border-border">
  <span class="text-sm text-gray-500">{{ auth.user?.fullName ?? 'Ứng Viên' }}</span>
  <button @click="auth.logout()" class="block text-xs text-gray-400 hover:text-error mt-1 transition">
  Đăng Xuất
  </button>
  </div>
  </aside>
  <main class="flex-1 overflow-y-auto">
  <router-view />
  </main>
  </div>
</template>
