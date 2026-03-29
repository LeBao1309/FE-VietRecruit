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
  <div class="max-w-3xl mx-auto px-6 py-8">
    <div class="mb-6">
      <h1 class="text-xl font-bold text-gray-900">Salary Benchmark</h1>
      <p class="text-sm text-gray-500 mt-1">Get AI-powered salary insights and market data for any position.</p>
    </div>

    <!-- Search Card -->
    <div class="bg-surface border border-border rounded-lg p-5 shadow-sm mb-6">
      <h2 class="text-sm font-semibold text-gray-900 mb-4">Look Up a Position</h2>
      <form @submit.prevent="fetchBenchmark" class="flex gap-3">
        <div class="flex-1">
          <input
            v-model="jobTitle"
            type="text"
            placeholder="e.g. Senior Frontend Developer"
            class="w-full px-3 py-2.5 text-sm border border-border rounded-md outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md transition disabled:opacity-50 shrink-0 flex items-center gap-2"
        >
          <span v-if="loading" class="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {{ loading ? 'Looking up…' : 'Get Benchmark' }}
        </button>
      </form>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading && !benchmark" class="bg-surface border border-border rounded-lg p-6 shadow-sm animate-pulse space-y-4">
      <div class="h-6 bg-gray-100 rounded w-48" />
      <div class="h-16 bg-gray-100 rounded" />
      <div class="h-4 bg-gray-100 rounded w-64" />
    </div>

    <!-- Results -->
    <div v-else-if="benchmark" class="space-y-5 animate-fade-in">
      <!-- Title & Meta -->
      <div class="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <h2 class="text-lg font-bold text-gray-900 mb-1">{{ benchmark.jobTitle }}</h2>
        <div class="flex items-center gap-3 text-xs text-gray-400 mb-5">
          <span v-if="benchmark.location">📍 {{ benchmark.location }}</span>
          <span v-if="benchmark.experienceLevel">💼 {{ benchmark.experienceLevel }}</span>
          <span v-if="benchmark.currency">💰 {{ benchmark.currency }}</span>
          <span v-if="benchmark.dataPoints">📊 {{ benchmark.dataPoints }} data points</span>
        </div>

        <!-- Salary Range Visualization -->
        <div class="space-y-3">
          <div class="grid grid-cols-3 text-center">
            <div>
              <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Minimum</span>
              <span class="text-lg font-bold text-gray-700">{{ formatMoney(benchmark.range.min) }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Median</span>
              <span class="text-lg font-bold text-primary">{{ formatMoney(benchmark.range.median) }}</span>
            </div>
            <div>
              <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Maximum</span>
              <span class="text-lg font-bold text-gray-700">{{ formatMoney(benchmark.range.max) }}</span>
            </div>
          </div>

          <!-- Bar visualization -->
          <div class="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div class="absolute inset-y-0 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 rounded-full" style="left: 0; right: 0" />
            <!-- Median marker -->
            <div
              class="absolute top-0 bottom-0 w-1 bg-primary rounded-full"
              :style="{
                left: `${((benchmark.range.median - benchmark.range.min) / (benchmark.range.max - benchmark.range.min)) * 100}%`,
              }"
            />
          </div>
          <div class="flex items-center justify-between text-[10px] text-gray-400">
            <span>{{ formatMoney(benchmark.range.min) }}</span>
            <span>{{ formatMoney(benchmark.range.max) }}</span>
          </div>
        </div>

        <!-- Market Position -->
        <div v-if="benchmark.marketPosition" class="mt-4 pt-4 border-t border-border">
          <span class="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Market Position</span>
          <span class="text-sm font-medium text-gray-900">{{ benchmark.marketPosition }}</span>
        </div>
      </div>

      <!-- Insights -->
      <div v-if="benchmark.insights.length" class="bg-surface border border-border rounded-lg p-6 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Market Insights</h3>
        <ul class="space-y-2">
          <li v-for="(insight, i) in benchmark.insights" :key="i" class="flex items-start gap-2 text-sm text-gray-700">
            <span class="text-primary shrink-0 mt-0.5">•</span>
            {{ insight }}
          </li>
        </ul>
      </div>

      <!-- Disclaimer -->
      <div v-if="benchmark.disclaimer" class="bg-gray-50 border border-border rounded-lg p-4">
        <p class="text-[10px] text-gray-400 italic">{{ benchmark.disclaimer }}</p>
        <p class="text-[10px] text-gray-400 mt-1">Generated {{ formatDate(benchmark.generatedAt) }}</p>
      </div>
    </div>

    <!-- Initial state -->
    <div v-else class="bg-surface border border-border rounded-lg p-12 shadow-sm text-center">
      <div class="text-gray-400 text-sm">
        <p class="font-medium mb-1">Enter a job title above</p>
        <p class="text-xs">We'll show you market salary data based on AI analysis and real job postings.</p>
      </div>
    </div>
  </div>
</template>
