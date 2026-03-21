<script setup lang="ts">
// src/features/interview/views/InterviewListPage.vue
// HR / COMPANY_ADMIN view: list all interviews for an application,
// schedule new interviews, complete or cancel existing ones.
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Plus, ClipboardList } from 'lucide-vue-next'
import { useInterviewStore } from '@/features/interview/stores/useInterviewStore'
import InterviewCard from '@/features/interview/components/InterviewCard.vue'
import InterviewScheduleForm from '@/features/interview/components/InterviewScheduleForm.vue'
import PipelineTopBar from '@/features/workspace/components/PipelineTopBar.vue'
import PipelineSidebar from '@/features/workspace/components/PipelineSidebar.vue'

const route = useRoute()
const store = useInterviewStore()
const { interviews, isLoading, error } = storeToRefs(store)

const applicationId = computed(() => (route.query['applicationId'] as string) ?? '')
const jobId         = computed(() => (route.query['jobId'] as string) ?? '')

const showScheduleForm = ref(false)
const statusFilter = ref<'ALL' | 'SCHEDULED' | 'COMPLETED' | 'CANCELED'>('ALL')

const filtered = computed(() =>
  statusFilter.value === 'ALL'
    ? interviews.value
    : interviews.value.filter((i) => i.status === statusFilter.value),
)

async function handleComplete(id: string): Promise<void> {
  await store.updateStatus(id, { status: 'COMPLETED' })
}

async function handleCancel(id: string): Promise<void> {
  await store.updateStatus(id, { status: 'CANCELED' })
}

onMounted(() => {
  if (applicationId.value) store.fetchInterviews({ applicationId: applicationId.value })
})
</script>

<template>
  <div class="h-screen w-full flex flex-col bg-surface overflow-hidden text-text-primary font-sans">
    <PipelineTopBar />

    <div class="flex-1 flex overflow-hidden">
      <PipelineSidebar />

      <main class="flex-1 overflow-y-auto p-6 lg:p-8 bg-surface-soft scrollbar-hide">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <ClipboardList class="w-5 h-5 text-brand" />
              <h1 class="text-2xl font-bold text-text-primary">Interviews</h1>
            </div>
            <p class="text-sm text-text-muted">
              Application <span class="font-mono">{{ applicationId.slice(0, 8) }}</span>
            </p>
          </div>
          <button
            v-if="applicationId"
            class="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm
                   font-semibold rounded-lg hover:bg-brand-dark transition-colors"
            @click="showScheduleForm = true"
          >
            <Plus class="w-4 h-4" />
            Schedule Interview
          </button>
        </div>

        <!-- No application selected -->
        <div
          v-if="!applicationId"
          class="flex items-center justify-center h-64 text-text-muted text-sm"
        >
          Add <code class="mx-1 px-1 bg-surface-muted rounded">?applicationId=...</code> to the URL to view interviews.
        </div>

        <template v-else>
          <!-- Filter tabs -->
          <div class="flex gap-2 mb-5">
            <button
              v-for="tab in ['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELED']"
              :key="tab"
              :class="[
                'px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors',
                statusFilter === tab
                  ? 'bg-brand text-white border-brand'
                  : 'border-border text-text-muted hover:border-brand hover:text-brand',
              ]"
              @click="statusFilter = tab as any"
            >
              {{ tab }}
            </button>
          </div>

          <!-- Error -->
          <div
            v-if="error"
            class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
          >
            {{ error }}
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div
              v-for="n in 3"
              :key="n"
              class="h-40 bg-white border border-border rounded-xl animate-pulse"
            />
          </div>

          <!-- Empty state -->
          <div
            v-else-if="!filtered.length"
            class="flex flex-col items-center justify-center h-48 text-text-muted text-sm gap-2"
          >
            <ClipboardList class="w-10 h-10 opacity-30" />
            No interviews found.
          </div>

          <!-- Interview grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <InterviewCard
              v-for="interview in filtered"
              :key="interview.id"
              :interview="interview"
              :can-manage="true"
              @complete="handleComplete"
              @cancel="handleCancel"
            />
          </div>
        </template>
      </main>
    </div>

    <!-- Schedule form modal -->
    <Transition name="fade">
      <InterviewScheduleForm
        v-if="showScheduleForm"
        :application-id="applicationId"
        :job-id="jobId"
        @close="showScheduleForm = false"
        @created="store.fetchInterviews({ applicationId })"
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
