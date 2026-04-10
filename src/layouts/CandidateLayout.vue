<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import AppHeader from '@/components/common/AppHeader.vue'
import {
  LayoutDashboard,
  Sparkles,
  BarChart2,
  ExternalLink,
  FileText,
  UserCircle,
  FilePen,
  UserCog,
  Settings,
  LogOut,
} from 'lucide-vue-next'

const auth = useAuthStore()
const menuOpen = ref(false)
</script>

<template>
  <div class="flex flex-col md:flex-row min-h-screen">
    <!-- Mobile Header -->
    <AppHeader :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" />

    <aside
      :class="menuOpen ? 'flex' : 'hidden md:flex'"
      class="w-full md:w-60 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex-col shrink-0"
    >
      <!-- Logo -->
      <div class="hidden md:flex items-center gap-3 px-5 h-[60px] border-b border-slate-200 shrink-0">
        <div class="w-7 h-7 rounded-lg bg-[#009898]/12 flex items-center justify-center shrink-0">
          <LayoutDashboard class="w-3.5 h-3.5 text-[#009898]" />
        </div>
        <router-link
          to="/candidate/dashboard"
          class="text-sm font-bold text-[#007070] tracking-tight hover:opacity-80 transition-opacity duration-150"
        >
          VietRecruit
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <!-- Overview -->
        <router-link
          @click="menuOpen = false"
          to="/candidate/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <LayoutDashboard class="w-4 h-4 shrink-0" />
          Overview
        </router-link>

        <!-- Find Jobs section -->
        <div class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Find Jobs</span>
        </div>
        <router-link
          to="/candidate/recommendations"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <Sparkles class="w-4 h-4 shrink-0" />
          AI Job Recommendations
        </router-link>
        <router-link
          to="/candidate/salary-benchmark"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <BarChart2 class="w-4 h-4 shrink-0" />
          Salary Reference
        </router-link>
        <router-link
          to="/jobs"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-150 border-l-2 border-transparent"
        >
          <ExternalLink class="w-4 h-4 shrink-0" />
          View Jobs
        </router-link>

        <!-- Applications section -->
        <div class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Applications</span>
        </div>
        <router-link
          to="/candidate/applications"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <FileText class="w-4 h-4 shrink-0" />
          My Applications
        </router-link>

        <!-- Profile section -->
        <div class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Profile</span>
        </div>
        <router-link
          to="/candidate/candidate-profile"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <UserCircle class="w-4 h-4 shrink-0" />
          Professional Profile
        </router-link>
        <router-link
          to="/candidate/cv"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <FilePen class="w-4 h-4 shrink-0" />
          CV Management
        </router-link>

        <!-- Account section -->
        <div class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account</span>
        </div>
        <router-link
          to="/candidate/profile"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <UserCog class="w-4 h-4 shrink-0" />
          Account Management
        </router-link>
        <router-link
          to="/candidate/settings"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <Settings class="w-4 h-4 shrink-0" />
          Settings
        </router-link>
      </nav>

      <!-- User footer -->
      <div class="px-3 py-3 border-t border-slate-200 bg-slate-50/60 shrink-0">
        <div class="flex items-center gap-2.5 px-2">
          <div class="w-7 h-7 rounded-full bg-[#009898]/15 text-[#007070] flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-[#009898]/20">
            {{ auth.user?.fullName?.charAt(0)?.toUpperCase() ?? 'C' }}
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-xs font-semibold text-slate-700 truncate leading-tight">{{ auth.user?.fullName ?? 'Candidate' }}</span>
            <span class="text-[10px] text-slate-400 leading-tight mt-0.5">Candidate</span>
          </div>
          <button
            @click="auth.logout()"
            class="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all duration-150 shrink-0"
            title="Sign Out"
          >
            <LogOut class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>
