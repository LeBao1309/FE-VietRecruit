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
    class="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-xl text-slate-700 hover:text-teal-600 hover:bg-white/90 hover:shadow-2xl hover:scale-105 transition-all duration-200 group"
    aria-label="Quay trở lại"
  >
    <svg
      class="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
    <span class="text-sm font-bold whitespace-nowrap">Quay trở lại</span>
  </button>
</template>
