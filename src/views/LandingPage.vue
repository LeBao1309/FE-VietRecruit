<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-surface border-b border-border px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <router-link to="/" class="text-xl font-bold text-primary">VietRecruit</router-link>
        <nav class="flex items-center gap-3">
          <router-link to="/login" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-50 transition">
            Login
          </router-link>
          <router-link to="/register" class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition">
            Get Started
          </router-link>
        </nav>
      </div>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 leading-tight mb-4">
        Modern Applicant Tracking System
      </h1>
      <p class="text-base text-gray-500 leading-relaxed mb-8">
        Streamline your hiring process with AI-powered screening, interview
        management, and offer workflows — all in one platform.
      </p>
      <div class="flex gap-4">
        <router-link to="/register" class="px-6 py-3 text-base font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition">
          Start Free Trial
        </router-link>
        <router-link to="/jobs" class="px-6 py-3 text-base font-medium text-gray-700 bg-surface border border-border hover:bg-gray-50 rounded-md transition">
          Browse Jobs
        </router-link>
      </div>
    </main>
  </div>
</template>
