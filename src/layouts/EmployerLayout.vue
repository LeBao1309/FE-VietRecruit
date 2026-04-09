<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import AppHeader from "@/components/common/AppHeader.vue";
import BaseBreadcrumbs from "@/components/common/BaseBreadcrumbs.vue";

const auth = useAuthStore();
const menuOpen = ref(false);
</script>

<template>
  <div class="flex flex-col md:flex-row min-h-screen">
    <!-- Mobile Header -->
    <AppHeader :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" />

    <aside
      :class="menuOpen ? 'flex' : 'hidden md:flex'"
      class="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200/60 flex-col shrink-0 shadow-sm z-0 relative"
    >
      <div
        class="hidden md:flex items-center px-6 py-5 border-b border-slate-200/60"
      >
        <router-link
          to="/employer/dashboard"
          class="text-xl font-extrabold text-[#007070] tracking-tight"
          >VietRecruit</router-link
        >
      </div>
      <nav class="flex-1 p-4 flex flex-col gap-0.5 overflow-y-auto">
        <router-link
          @click="menuOpen = false"
          to="/employer/dashboard"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
          active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
        >
          Overview
        </router-link>
        <!-- Employer Onboarding section -->
        <div class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Company</span>
        </div>
        <router-link
          to="/employer/organization"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
          active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
        >
          Organization
        </router-link>
        <router-link
          v-if="auth.isCompanyAdmin"
          to="/employer/team"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
          active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
        >
          Team & Staff
        </router-link>

        <!-- Recruitment section -->
        <div v-if="auth.isCompanyAdmin || auth.isHR" class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recruitment</span>
        </div>
        <router-link
          v-if="auth.isCompanyAdmin || auth.isHR"
          to="/employer/jobs"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
          active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
        >
          Job Listings
        </router-link>
        <router-link
          v-if="auth.isCompanyAdmin || auth.isHR"
          to="/employer/candidates"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
          active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
        >
          Applications
        </router-link>

        <!-- Interviews section (Interviewer) -->
        <div v-if="auth.isInterviewer" class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Interviews</span>
        </div>
        <router-link
          v-if="auth.isInterviewer"
          to="/employer/my-interviews"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
          active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
        >
          My Interview Schedule
        </router-link>

        <!-- Billing section -->
        <div v-if="auth.isCompanyAdmin" class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Billing</span>
        </div>
        <router-link
          v-if="auth.isCompanyAdmin"
          to="/employer/subscription"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
          active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
        >
          Subscription Plan
        </router-link>
        <router-link
          v-if="auth.isCompanyAdmin"
          to="/employer/billing"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
          active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
        >
          Billing History
        </router-link>

        <!-- Account section -->
        <div class="mt-4 mb-1 px-3">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account</span>
        </div>
        <router-link
          to="/employer/profile"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
          active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
        >
          My Profile
        </router-link>
        <router-link
          to="/employer/settings"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all border-l-2 border-transparent"
          active-class="!bg-teal-50 !border-l-teal-500 !text-teal-700 !font-semibold"
        >
          Settings
        </router-link>
      </nav>
      <div class="px-6 py-4 border-t border-slate-200/60 bg-slate-50/50">
        <span class="text-sm font-bold text-slate-700 block truncate">{{
          auth.user?.fullName ?? "Employer"
        }}</span>
        <button
          @click="auth.logout()"
          class="block text-xs font-medium text-slate-500 hover:text-rose-500 mt-1 transition-colors"
        >
          Sign Out
        </button>
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
