<template>
  <div class="flex h-screen bg-gray-50 text-gray-900">
    <!-- Sidebar -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300">
      <div class="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 class="font-bold text-xl text-indigo-600 tracking-tight">VietRecruit Admin</h1>
      </div>

      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <router-link
          to="/admin/companies"
          class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group"
          active-class="bg-indigo-50 text-indigo-700"
          :class="[$route.path.includes('companies') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100']"
        >
          <svg class="w-5 h-5 mr-3 flex-shrink-0" :class="[$route.path.includes('companies') ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Companies
        </router-link>

        <router-link
          to="/admin/users"
          class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group"
          active-class="bg-indigo-50 text-indigo-700"
          :class="[$route.path.includes('users') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100']"
        >
          <svg class="w-5 h-5 mr-3 flex-shrink-0" :class="[$route.path.includes('users') ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Users
        </router-link>

        <router-link
          to="/admin/transactions"
          class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group"
          active-class="bg-indigo-50 text-indigo-700"
          :class="[$route.path.includes('transactions') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-100']"
        >
          <svg class="w-5 h-5 mr-3 flex-shrink-0" :class="[$route.path.includes('transactions') ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Transactions
        </router-link>
      </nav>
      
      <div class="p-4 border-t border-gray-200">
        <router-link to="/workspace" class="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition">
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Workspace
        </router-link>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50 relative">
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
        <h2 class="text-xl font-semibold text-gray-800 capitalize">{{ routeTitle }}</h2>
        <div class="flex items-center space-x-4">
          <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
            SA
          </div>
        </div>
      </header>

      <div class="flex-1 overflow-y-auto p-8">
        <div class="max-w-7xl mx-auto">
          <!-- Nested Admin Routes rendered here -->
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Display friendly title based on route name
const routeTitle = computed(() => {
  if (route.path.includes('companies')) return 'Company Directory'
  if (route.path.includes('users')) return 'User Moderation'
  if (route.path.includes('transactions')) return 'Global Transactions'
  return 'Dashboard'
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
