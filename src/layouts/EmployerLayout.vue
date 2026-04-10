<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import AppHeader from "@/components/common/AppHeader.vue";
import BaseBreadcrumbs from "@/components/common/BaseBreadcrumbs.vue";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  FileText,
  Calendar,
  Sparkles,
  Receipt,
  User,
  Settings,
  LogOut,
} from "lucide-vue-next";

const auth = useAuthStore();
const menuOpen = ref(false);
</script>

<template>
  <div class="flex flex-col md:flex-row min-h-screen">
    <!-- Mobile Header -->
    <AppHeader :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" />

    <aside
      :class="menuOpen ? 'flex' : 'hidden md:flex'"
      class="w-full md:w-64 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-slate-200/60 dark:border-gray-700/40 flex-col shrink-0 shadow-sm z-0 relative"
    >
      <!-- Logo -->
      <div class="hidden md:flex items-center gap-3 px-5 h-[60px] border-b border-slate-200/60 dark:border-gray-700/40 shrink-0">
        <div class="w-7 h-7 rounded-lg bg-[#009898]/12 flex items-center justify-center shrink-0">
          <Briefcase class="w-3.5 h-3.5 text-[#009898]" />
        </div>
        <router-link
          to="/employer/dashboard"
          class="text-sm font-bold text-primary-hover dark:text-[#00c8c8] tracking-tight hover:opacity-80 transition-opacity duration-150"
        >
          VietRecruit
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
        <!-- Overview -->
        <router-link
          @click="menuOpen = false"
          to="/employer/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <LayoutDashboard class="w-4 h-4 shrink-0" />
          Overview
        </router-link>

        <!-- Company section -->
        <div class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Company</span>
        </div>
        <router-link
          to="/employer/organization"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <Building2 class="w-4 h-4 shrink-0" />
          Organization
        </router-link>
        <router-link
          v-if="auth.isCompanyAdmin"
          to="/employer/team"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <Users class="w-4 h-4 shrink-0" />
          Team &amp; Staff
        </router-link>

        <!-- Recruitment section -->
        <div v-if="auth.isCompanyAdmin || auth.isHR" class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Recruitment</span>
        </div>
        <router-link
          v-if="auth.isCompanyAdmin || auth.isHR"
          to="/employer/jobs"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <Briefcase class="w-4 h-4 shrink-0" />
          Job Listings
        </router-link>
        <router-link
          v-if="auth.isCompanyAdmin || auth.isHR"
          to="/employer/candidates"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <FileText class="w-4 h-4 shrink-0" />
          Applications
        </router-link>

        <!-- Interviews section (Interviewer) -->
        <div v-if="auth.isInterviewer" class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Interviews</span>
        </div>
        <router-link
          v-if="auth.isInterviewer"
          to="/employer/my-interviews"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <Calendar class="w-4 h-4 shrink-0" />
          My Interview Schedule
        </router-link>

        <!-- Billing section -->
        <div v-if="auth.isCompanyAdmin" class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Billing</span>
        </div>
        <router-link
          v-if="auth.isCompanyAdmin"
          to="/employer/subscription"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <Sparkles class="w-4 h-4 shrink-0" />
          Subscription Plan
        </router-link>
        <router-link
          v-if="auth.isCompanyAdmin"
          to="/employer/billing"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <Receipt class="w-4 h-4 shrink-0" />
          Billing History
        </router-link>

        <!-- Account section -->
        <div class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Account</span>
        </div>
        <router-link
          to="/employer/profile"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <User class="w-4 h-4 shrink-0" />
          My Profile
        </router-link>
        <router-link
          to="/employer/settings"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/8 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-150 border-l-2 border-transparent"
          active-class="!bg-[#009898]/10 !border-l-[#009898] !text-[#007070] !font-semibold"
        >
          <Settings class="w-4 h-4 shrink-0" />
          Settings
        </router-link>
      </nav>

      <!-- User footer -->
      <div class="px-3 py-3 border-t border-slate-200/60 dark:border-gray-700/40 bg-slate-50/40 dark:bg-white/3 shrink-0">
        <div class="flex items-center gap-2.5 px-2">
          <div class="w-7 h-7 rounded-full bg-[#009898]/15 text-primary-hover flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-[#009898]/20">
            {{ auth.user?.fullName?.charAt(0)?.toUpperCase() ?? 'E' }}
          </div>
          <div class="flex flex-col min-w-0 flex-1">
            <span class="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate leading-tight">{{ auth.user?.fullName ?? "Employer" }}</span>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
              {{ auth.isCompanyAdmin ? 'Company Admin' : auth.isHR ? 'HR Manager' : 'Interviewer' }}
            </span>
          </div>
          <button
            @click="auth.logout()"
            class="p-1.5 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-150 shrink-0"
            title="Sign Out"
          >
            <LogOut class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>

    <main class="flex-1 overflow-y-auto">
      <div class="px-6 pt-5 md:px-8">
        <BaseBreadcrumbs />
      </div>
      <router-view />
    </main>
  </div>
</template>
