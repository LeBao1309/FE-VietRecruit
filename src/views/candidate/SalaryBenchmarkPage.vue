<script setup lang="ts">
import { ref } from 'vue'
import { useUiStore } from '@/stores/uiStore'
import { candidateService } from '@/services/candidateService'
import type { SalaryBenchmarkResponse } from '@/types/ai'

const ui = useUiStore()

// ── Inputs ──
const jobTitle = ref('')
const locationId = ref('')

// ── State ──
const loading = ref(false)
const benchmark = ref<SalaryBenchmarkResponse | null>(null)

// ── Fetch ──
async function fetchBenchmark(): Promise<void> {
  if (!jobTitle.value.trim()) {
    ui.toastWarning('Title required', 'Enter a job title to look up salary benchmarks.')
    return
  }
  loading.value = true
  benchmark.value = null
  try {
    const result = await candidateService.getSalaryBenchmark({
      jobTitle: jobTitle.value.trim(),
      locationId: locationId.value || undefined,
    })
    if (result.data) {
      benchmark.value = result.data
    } else {
      ui.toastError('Lookup failed', result.error?.message)
    }
  } finally {
    loading.value = false
  }
}

function formatMoney(n: number): string {
  return n.toLocaleString('en-US')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 py-10">
    <div class="mb-8">
      <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Salary Benchmark</h1>
      <p class="text-sm font-medium text-slate-500">Get AI-powered salary insights and market data for any position.</p>
    </div>

    <!-- Search Card -->
    <div class="premium-card p-6 md:p-8 mb-8">
      <h2 class="text-base font-bold text-slate-900 dark:text-white mb-4">Look Up a Position</h2>
      <form @submit.prevent="fetchBenchmark" class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="jobTitle"
            type="text"
            placeholder="e.g. Senior Frontend Developer"
            class="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-medium"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary py-3 px-8 w-full md:w-auto shrink-0 flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <svg v-else class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {{ loading ? 'Looking up…' : 'Get Benchmark' }}
        </button>
      </form>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading && !benchmark" class="premium-card p-8 animate-pulse space-y-6">
      <div class="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64" />
      <div class="h-20 bg-slate-200 dark:bg-slate-700 rounded" />
      <div class="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
    </div>

    <!-- Results -->
    <div v-else-if="benchmark" class="space-y-6 animate-fade-in">
      <!-- Title & Meta -->
      <div class="premium-card p-8 relative overflow-hidden">
        <div class="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none">
          <svg class="w-32 h-32 text-teal-500" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-3.57-1.83-3.57-3.43 0-1.7 1.25-2.87 3.16-3.26V4h2.67v1.95c1.62.33 2.8 1.48 2.98 3.26h-1.96c-.16-1-1.04-1.64-2.4-1.64-1.42 0-2.16.71-2.16 1.48 0 .86.58 1.4 2.85 1.95 2.5.6 3.4 1.88 3.4 3.51 0 1.99-1.43 2.99-3.37 3.38z" />
          </svg>
        </div>
        
        <div class="relative z-10">
          <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">{{ benchmark.jobTitle }}</h2>
          <div class="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-500 mb-8">
            <span v-if="benchmark.location" class="flex items-center gap-1.5"><span class="text-teal-500">📍</span> {{ benchmark.location }}</span>
            <span v-if="benchmark.experienceLevel" class="flex items-center gap-1.5"><span class="text-teal-500">💼</span> {{ benchmark.experienceLevel }}</span>
            <span v-if="benchmark.currency" class="flex items-center gap-1.5"><span class="text-teal-500">💰</span> {{ benchmark.currency }}</span>
            <span v-if="benchmark.dataPoints" class="px-2.5 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-md text-xs font-bold border border-teal-200 dark:border-teal-800"><span class="mr-1">📊</span> {{ benchmark.dataPoints }} Data points</span>
          </div>

          <!-- Salary Range Visualization -->
          <div class="space-y-6">
            <div class="grid grid-cols-3 text-center">
              <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-l-xl border-y border-l border-slate-200 dark:border-slate-700">
                <span class="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Minimum</span>
                <span class="text-xl font-bold text-slate-700 dark:text-slate-300">{{ formatMoney(benchmark.range.min) }}</span>
              </div>
              <div class="bg-teal-50 dark:bg-teal-900/20 p-4 border border-teal-200 dark:border-teal-800 transform scale-105 rounded-xl shadow-sm z-10">
                <span class="block text-[10px] font-black uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">Median</span>
                <span class="text-2xl font-black text-teal-700 dark:text-teal-300">{{ formatMoney(benchmark.range.median) }}</span>
              </div>
              <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-r-xl border-y border-r border-slate-200 dark:border-slate-700">
                <span class="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Maximum</span>
                <span class="text-xl font-bold text-slate-700 dark:text-slate-300">{{ formatMoney(benchmark.range.max) }}</span>
              </div>
            </div>

            <!-- Bar visualization -->
            <div class="relative pt-4">
              <div class="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-visible border border-slate-200 dark:border-slate-700/50">
                <div class="absolute inset-y-0 rounded-full bg-gradient-to-r from-teal-500/20 via-teal-500/80 to-teal-500/20" style="left: 5%; right: 5%" />
                
                <!-- Median marker -->
                <div
                  class="absolute top-1/2 -translate-y-1/2 w-4 h-6 bg-teal-600 dark:bg-teal-400 rounded-full shadow-[0_0_10px_rgba(13,148,136,0.8)] border-2 border-white dark:border-slate-900 z-10 transition-all duration-1000"
                  :style="{
                    left: `calc(${((benchmark.range.median - benchmark.range.min) / (benchmark.range.max - benchmark.range.min)) * 100}% - 8px)`,
                  }"
                />
              </div>
              <div class="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-3 px-1">
                <span>{{ formatMoney(benchmark.range.min) }}</span>
                <span>{{ formatMoney(benchmark.range.max) }}</span>
              </div>
            </div>
          </div>

          <!-- Market Position -->
          <div v-if="benchmark.marketPosition" class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span class="text-xs font-black uppercase tracking-wider text-slate-400">Market Position</span>
            <span class="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">{{ benchmark.marketPosition }}</span>
          </div>
        </div>
      </div>

      <!-- Insights -->
      <div v-if="benchmark.insights.length" class="premium-card p-8">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Market Insights</h3>
        <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <li v-for="(insight, i) in benchmark.insights" :key="i" class="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl">
            <span class="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">✓</span>
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{{ insight }}</span>
          </li>
        </ul>
      </div>

      <!-- Disclaimer -->
      <div v-if="benchmark.disclaimer" class="p-6 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
        <p class="text-xs font-medium text-slate-500 mb-1 max-w-2xl mx-auto">{{ benchmark.disclaimer }}</p>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Generated {{ formatDate(benchmark.generatedAt) }}</p>
      </div>
    </div>

    <!-- Initial state -->
    <div v-else class="premium-card p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
      <span class="text-5xl mb-4 opacity-50">💸</span>
      <p class="text-lg font-bold text-slate-900 dark:text-white mb-2">Enter a job title above</p>
      <p class="text-sm font-medium text-slate-500 max-w-md mx-auto">We'll show you market salary data based on AI analysis and real job postings.</p>
    </div>
  </div>
</template>
