<template>
  <div class="flex h-screen bg-gray-50 text-gray-900 font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm">
      <div class="h-16 flex items-center px-6 border-b border-gray-100">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 rounded-lg bg-[#009898] flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 class="font-bold text-lg text-gray-800 tracking-tight">VietRecruit Admin</h1>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <router-link
          to="/admin/companies"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group"
          active-class="bg-indigo-50 text-indigo-700"
        >
          <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Công ty
        </router-link>

        <router-link
          to="/admin/users"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group"
          active-class="bg-indigo-50 text-indigo-700"
        >
          <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Người dùng
        </router-link>

        <router-link
          to="/admin/transactions"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group"
          active-class="bg-indigo-50 text-indigo-700"
        >
          <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Giao dịch
        </router-link>

        <router-link
          to="/admin/knowledge"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group"
          active-class="bg-indigo-50 text-indigo-700"
        >
          <svg class="w-5 h-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Tri thức AI
        </router-link>
      </nav>
      
      <div class="p-6 border-t border-gray-100">
        <router-link to="/workspace" class="flex items-center text-sm font-medium text-gray-500 hover:text-[#009898] transition-colors group">
          <svg class="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại Workspace
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-10 z-10">
        <h2 class="text-xl font-bold text-gray-800">{{ routeTitle }}</h2>
        <div class="flex items-center space-x-4">
          <div class="flex flex-col items-end mr-2">
            <span class="text-sm font-semibold text-gray-900">Admin Account</span>
            <span class="text-xs text-gray-500">System Administrator</span>
          </div>
          <div class="w-10 h-10 rounded-full bg-[#009898]/10 text-[#009898] border border-[#009898]/20 flex items-center justify-center font-bold text-sm shadow-sm">
            AD
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto">
        <div class="max-w-[1600px] mx-auto p-10">
          <router-view v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
interface Props {
  routeTitle?: string
}

withDefaults(defineProps<Props>(), {
  routeTitle: 'Trang quản trị'
})
</script>

<style scoped>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* Custom scrollbar for sidebar */
nav::-webkit-scrollbar {
  width: 4px;
}
nav::-webkit-scrollbar-track {
  background: transparent;
}
nav::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 10px;
}
nav::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}
</style>
