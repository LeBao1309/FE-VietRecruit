<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack(): void {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <button
    @click="goBack"
    class="fixed left-4 top-[72px] z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm text-slate-500 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-300 hover:shadow-md transition-all duration-200 group"
    aria-label="Go Back"
  >
    <svg
      class="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
    <span class="text-xs font-semibold whitespace-nowrap">Back</span>
  </button>
</template>
