<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/composables/useTheme";
import AppHeader from "@/components/common/AppHeader.vue";

const auth = useAuthStore();
const { isDark, toggleTheme } = useTheme();
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
        class="hidden md:flex items-center justify-between px-6 py-5 border-b border-slate-200/60"
      >
        <router-link
          to="/employer/dashboard"
          class="text-xl font-extrabold text-[#007070] tracking-tight"
          >VietRecruit</router-link
        >
        <button
          @click="toggleTheme"
          class="text-slate-400 hover:text-teal-600 :text-teal-400 transition-colors p-1"
          aria-label="Toggle dark mode"
        >
          <span v-if="isDark">☀️</span>
          <span v-else>🌙</span>
        </button>
      </div>
      <nav class="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
        <router-link
          @click="menuOpen = false"
          to="/employer/dashboard"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 :bg-slate-800/50 hover:text-slate-900 :text-white transition-all"
          active-class="!bg-teal-50 dark:!bg-teal-900/30 !text-teal-700 dark:!text-teal-400 font-semibold"
        >
          Dashboard
        </router-link>

        <!-- Employer Onboarding section -->
        <div class="mt-4 mb-1 px-3">
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >Company</span
          >
        </div>
        <router-link
          to="/employer/organization"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 :bg-slate-800/50 hover:text-slate-900 :text-white transition-all"
          active-class="!bg-teal-50 dark:!bg-teal-900/30 !text-teal-700 dark:!text-teal-400 font-semibold"
        >
          Organization
        </router-link>
        <router-link
          v-if="auth.isCompanyAdmin"
          to="/employer/team"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 :bg-slate-800/50 hover:text-slate-900 :text-white transition-all"
          active-class="!bg-teal-50 dark:!bg-teal-900/30 !text-teal-700 dark:!text-teal-400 font-semibold"
        >
          Team
        </router-link>

        <!-- Recruitment section -->
        <div v-if="auth.isCompanyAdmin || auth.isHR" class="mt-4 mb-1 px-3">
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >Recruitment</span
          >
        </div>
        <router-link
          v-if="auth.isCompanyAdmin || auth.isHR"
          to="/employer/jobs"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 :bg-slate-800/50 hover:text-slate-900 :text-white transition-all"
          active-class="!bg-teal-50 dark:!bg-teal-900/30 !text-teal-700 dark:!text-teal-400 font-semibold"
        >
          Jobs
        </router-link>

        <!-- Interviews section (Interviewer) -->
        <div v-if="auth.isInterviewer" class="mt-4 mb-1 px-3">
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >Interviews</span
          >
        </div>
        <router-link
          v-if="auth.isInterviewer"
          to="/employer/my-interviews"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 :bg-slate-800/50 hover:text-slate-900 :text-white transition-all"
          active-class="!bg-teal-50 dark:!bg-teal-900/30 !text-teal-700 dark:!text-teal-400 font-semibold"
        >
          My Interviews
        </router-link>

        <!-- Billing section -->
        <div v-if="auth.isCompanyAdmin" class="mt-4 mb-1 px-3">
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >Billing</span
          >
        </div>
        <router-link
          v-if="auth.isCompanyAdmin"
          to="/employer/subscription"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 :bg-slate-800/50 hover:text-slate-900 :text-white transition-all"
          active-class="!bg-teal-50 dark:!bg-teal-900/30 !text-teal-700 dark:!text-teal-400 font-semibold"
        >
          Subscription
        </router-link>
        <router-link
          v-if="auth.isCompanyAdmin"
          to="/employer/billing"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 :bg-slate-800/50 hover:text-slate-900 :text-white transition-all"
          active-class="!bg-teal-50 dark:!bg-teal-900/30 !text-teal-700 dark:!text-teal-400 font-semibold"
        >
          Billing History
        </router-link>

        <!-- Account section -->
        <div class="mt-4 mb-1 px-3">
          <span
            class="text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >Account</span
          >
        </div>
        <router-link
          to="/employer/profile"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 :bg-slate-800/50 hover:text-slate-900 :text-white transition-all"
          active-class="!bg-teal-50 dark:!bg-teal-900/30 !text-teal-700 dark:!text-teal-400 font-semibold"
        >
          My Profile
        </router-link>
        <router-link
          to="/employer/settings"
          class="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 :bg-slate-800/50 hover:text-slate-900 :text-white transition-all"
          active-class="!bg-teal-50 dark:!bg-teal-900/30 !text-teal-700 dark:!text-teal-400 font-semibold"
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
          Log out
        </button>
      </div>
    </aside>
    <main class="flex-1 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>
