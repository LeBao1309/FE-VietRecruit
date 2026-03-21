<script setup lang="ts">
// src/features/interview/views/InterviewerDashboard.vue
// INTERVIEWER-only view: shows interviews assigned to the current user.
// Can submit scorecards for COMPLETED interviews only.
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { UserCheck } from 'lucide-vue-next'
import { useInterviewStore } from '@/features/interview/stores/useInterviewStore'
import InterviewCard from '@/features/interview/components/InterviewCard.vue'
import ScorecardForm from '@/features/interview/components/ScorecardForm.vue'
import PipelineTopBar from '@/features/workspace/components/PipelineTopBar.vue'
import PipelineSidebar from '@/features/workspace/components/PipelineSidebar.vue'

const store = useInterviewStore()
const { myScheduled, myCompleted, isLoading, error } = storeToRefs(store)

const scoringInterviewId = ref<string | null>(null)

function openScorecardForm(id: string): void {
  scoringInterviewId.value = id
}

function onScorecardSubmitted(): void {
  scoringInterviewId.value = null
  store.fetchMyInterviews()
}

onMounted(() => store.fetchMyInterviews())
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-surface overflow-hidden text-text-primary font-sans">
    <PipelineTopBar />

    <div class="flex-1 flex overflow-hidden">
      <PipelineSidebar />

      <main class="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface-soft scrollbar-hide">
        <!-- Header -->
        <div class="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <UserCheck class="w-6 h-6 text-brand" />
          <div>
            <h1 class="text-2xl font-bold text-text-primary">My Interviews</h1>
            <p class="text-sm text-text-muted">Interviews where you are assigned as an interviewer</p>
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="error"
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
        >
          {{ error }}
        </div>

        <!-- Skeleton -->
        <div v-if="isLoading" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="n in 2" :key="n" class="h-40 bg-white border border-border rounded-xl animate-pulse" />
          </div>
        </div>

        <template v-else>
          <!-- Upcoming (SCHEDULED) -->
          <section class="mb-8">
            <h2 class="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">
              Upcoming ({{ myScheduled.length }})
            </h2>
            <div v-if="myScheduled.length === 0" class="text-sm text-text-muted italic">
              No upcoming interviews.
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <InterviewCard
                v-for="interview in myScheduled"
                :key="interview.id"
                :interview="interview"
                :can-manage="false"
                :can-score="false"
              />
            </div>
          </section>

          <!-- Completed — can submit scorecards -->
          <section>
            <h2 class="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">
              Completed ({{ myCompleted.length }})
            </h2>
            <div v-if="myCompleted.length === 0" class="text-sm text-text-muted italic">
              No completed interviews yet.
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <InterviewCard
                v-for="interview in myCompleted"
                :key="interview.id"
                :interview="interview"
                :can-manage="false"
                :can-score="true"
                @score="openScorecardForm"
              />
            </div>
          </section>
        </template>
      </main>
    </div>

    <!-- Scorecard form modal -->
    <Transition name="fade">
      <ScorecardForm
        v-if="scoringInterviewId"
        :interview-id="scoringInterviewId"
        @close="scoringInterviewId = null"
        @submitted="onScorecardSubmitted"
      />
    </Transition>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
