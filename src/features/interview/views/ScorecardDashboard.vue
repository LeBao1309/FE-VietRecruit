<script setup lang="ts">
// src/features/interview/views/ScorecardDashboard.vue
// HR / COMPANY_ADMIN view: aggregated scorecard summary for a specific interview.
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { BarChart3 } from 'lucide-vue-next'
import { useScorecardStore } from '@/features/interview/stores/useScorecardStore'
import ScorecardSummaryCard from '@/features/interview/components/ScorecardSummaryCard.vue'
import PipelineTopBar from '@/features/workspace/components/PipelineTopBar.vue'
import PipelineSidebar from '@/features/workspace/components/PipelineSidebar.vue'

const route = useRoute()
const store = useScorecardStore()
const { summary, isLoading, error } = storeToRefs(store)

const interviewId = computed(() => (route.query['interviewId'] as string) ?? '')

async function load(): Promise<void> {
  if (interviewId.value) await store.fetchSummary(interviewId.value)
}

onMounted(load)
watch(interviewId, load)
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-surface overflow-hidden text-text-primary font-sans">
    <PipelineTopBar />

    <div class="flex-1 flex overflow-hidden">
      <PipelineSidebar />

      <main class="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface-soft scrollbar-hide">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <BarChart3 class="w-6 h-6 text-brand" />
          <div>
            <h1 class="text-2xl font-bold text-text-primary">Scorecard Dashboard</h1>
            <p v-if="interviewId" class="text-sm text-text-muted">
              Interview <span class="font-mono">{{ interviewId.slice(0, 8) }}</span>
            </p>
          </div>
        </div>

        <!-- No interview ID -->
        <div
          v-if="!interviewId"
          class="flex items-center justify-center h-64 text-text-muted text-sm"
        >
          Add <code class="mx-1 px-1 bg-surface-muted rounded">?interviewId=...</code> to the URL.
        </div>

        <!-- Error -->
        <div
          v-else-if="error"
          class="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
        >
          {{ error }}
        </div>

        <!-- Loading skeleton -->
        <div v-else-if="isLoading" class="max-w-xl space-y-4 animate-pulse">
          <div class="h-24 bg-white border border-border rounded-xl" />
          <div class="h-40 bg-white border border-border rounded-xl" />
        </div>

        <!-- No scorecards yet -->
        <div
          v-else-if="summary && summary.totalReviewers === 0"
          class="flex flex-col items-center justify-center h-64 text-text-muted text-sm gap-2"
        >
          <BarChart3 class="w-10 h-10 opacity-30" />
          No scorecards submitted yet.
        </div>

        <!-- Summary card -->
        <div v-else-if="summary" class="max-w-xl">
          <ScorecardSummaryCard :summary="summary" />
        </div>

      </main>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
