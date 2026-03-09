<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { pipelineStages } from "../mocks/pipeline.mock";
import { usePipelineStore } from "../../../stores/usePipelineStore";
import { storeToRefs } from "pinia";
import PipelineTopBar from "../components/PipelineTopBar.vue";
import PipelineSidebar from "../components/PipelineSidebar.vue";
import KanbanBoard from "../components/KanbanBoard.vue";
import CandidateDetailPanel from "../components/CandidateDetailPanel.vue";

const pipelineStore = usePipelineStore();
const { applications } = storeToRefs(pipelineStore);

const selectedApplicationId = ref<string | null>(null);

const selectedApplication = computed(() => {
  return (
    applications.value.find((a) => a.id === selectedApplicationId.value) || null
  );
});

onMounted(() => {
  pipelineStore.fetchApplications();
});

const selectApplication = (id: string) => {
  selectedApplicationId.value = id;
};

const closeDetail = () => {
  selectedApplicationId.value = null;
};
</script>

<template>
  <div
    class="h-screen w-full flex flex-col bg-white overflow-hidden text-[#0F172A] font-sans"
  >
    <PipelineTopBar />

    <div class="flex-1 flex overflow-hidden">
      <PipelineSidebar />

      <KanbanBoard
        :stages="pipelineStages"
        :candidates="applications"
        :selected-candidate-id="selectedApplicationId"
        @select="selectApplication"
      />

      <Transition name="panel-slide">
        <CandidateDetailPanel
          v-if="selectedApplication"
          :candidate="selectedApplication"
          @close="closeDetail"
        />
      </Transition>
    </div>
  </div>
</template>

<style>
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}
</style>
