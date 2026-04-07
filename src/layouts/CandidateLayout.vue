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
  class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
  active-class="!bg-primary-bg !text-primary"
  >
  Tổng Quan
  </router-link>

  <!-- Job Search section -->
  <div class="mt-4 mb-1 px-3">
  <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Tìm Việc Làm</span>
  </div>
  <router-link
  to="/candidate/recommendations"
  class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
  active-class="!bg-primary-bg !text-primary"
  >
  Việc Làm Đề Xuất
  </router-link>
  <router-link
  to="/candidate/salary-benchmark"
  class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
  active-class="!bg-primary-bg !text-primary"
  >
  Mức Lương Tham Khảo
  </router-link>
  <router-link
  to="/jobs"
  class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
  >
  Xem Việc Làm ↗
  </router-link>

  <!-- Applications section -->
  <div class="mt-4 mb-1 px-3">
  <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Hồ Sơ Ứng Tuyển</span>
  </div>
  <router-link
  to="/candidate/applications"
  class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
  active-class="!bg-primary-bg !text-primary"
  >
  Đơn Ứng Tuyển Của Tôi
  </router-link>

  <!-- Profile section -->
  <div class="mt-4 mb-1 px-3">
  <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Hồ Sơ</span>
  </div>
  <router-link
  to="/candidate/candidate-profile"
  class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
  active-class="!bg-primary-bg !text-primary"
  >
  Hồ Sơ Năng Lực
  </router-link>
  <router-link
  to="/candidate/cv"
  class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
  active-class="!bg-primary-bg !text-primary"
  >
  Quản Lý CV
  </router-link>

  <!-- Account section -->
  <div class="mt-4 mb-1 px-3">
  <span class="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Tài Khoản</span>
  </div>
  <router-link
  to="/candidate/profile"
  class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
  active-class="!bg-primary-bg !text-primary"
  >
  Quản Lý Tài Khoản
  </router-link>
  <router-link
  to="/candidate/settings"
  class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
  active-class="!bg-primary-bg !text-primary"
  >
  Cài Đặt
  </router-link>
  <router-link
  to="/candidate/notifications"
  class="block px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-primary-bg hover:text-primary transition"
  active-class="!bg-primary-bg !text-primary"
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
