<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppHeader from '@/components/common/AppHeader.vue'
import { Users, CreditCard, Settings, LogOut } from 'lucide-vue-next'

const auth = useAuthStore()
const menuOpen = ref(false)

const navItems = [
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/transactions', label: 'Transactions', icon: CreditCard },
]
</script>

<template>
  <div class="flex flex-col md:flex-row min-h-screen">
    <!-- Mobile Header -->
    <AppHeader variant="dark" :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" />

    <!-- Sidebar -->
    <aside
      :class="menuOpen ? 'flex' : 'hidden md:flex'"
      class="w-full md:w-60 bg-gray-900 flex-col shrink-0"
    >
      <!-- Logo -->
      <div class="hidden md:flex items-center gap-3 px-5 h-[60px] border-b border-white/8 shrink-0">
        <div class="w-7 h-7 rounded-lg bg-[#009898]/20 flex items-center justify-center shrink-0">
          <Settings class="w-3.5 h-3.5 text-[#00cccc]" />
        </div>
        <router-link
          to="/admin/users"
          class="text-sm font-bold text-white tracking-tight hover:text-[#00cccc] transition-colors duration-150"
        >
          VietRecruit Admin
        </router-link>
      </div>

      <!-- Section label -->
      <div class="px-5 pt-5 pb-1 shrink-0">
        <span class="text-[10px] font-bold uppercase tracking-widest text-slate-500">System</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 pb-4 flex flex-col gap-0.5 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          @click="menuOpen = false"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/8 hover:text-slate-100 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/15 !border-l-[#009898] !text-[#00d4d4] !font-semibold"
        >
          <component :is="item.icon" class="w-4 h-4 shrink-0" />
          {{ item.label }}
        </router-link>
      </nav>

      <!-- User footer -->
      <div class="px-3 py-3 border-t border-white/8 shrink-0">
        <div class="flex items-center gap-2.5 px-2">
          <div class="w-7 h-7 rounded-full bg-[#009898]/25 text-[#00cccc] flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-[#009898]/30">
            {{ auth.user?.fullName?.charAt(0)?.toUpperCase() ?? 'A' }}
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-xs font-semibold text-slate-200 truncate leading-tight">{{ auth.user?.fullName ?? 'Administrator' }}</span>
            <span class="text-[10px] text-slate-500 leading-tight mt-0.5">{{ auth.isCustomerService ? 'Customer Service' : 'System Admin' }}</span>
          </div>
          <button
            @click="auth.logout()"
            class="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 shrink-0"
            title="Sign Out"
          >
            <LogOut class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto bg-slate-50 border-l border-border md:border-none">
      <router-view />
    </main>
  </div>
</template>
