<script setup lang="ts">
import { ref } from "vue";
import KanbanColumn from "./KanbanColumn.vue";
import StageTransitionModal from "./StageTransitionModal.vue";
import { usePipelineStore } from "../../../stores/usePipelineStore";
import type { ApplicationWithDetails, ApplicationStatus } from "../types";

const props = defineProps<{
  stages: { id: ApplicationStatus; label: string; color: string }[];
  candidates: ApplicationWithDetails[];
  selectedCandidateId?: string | null;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
}>();

const pipelineStore = usePipelineStore();

// Drag state
const showModal = ref(false);
const pendingMove = ref<{
  candidateId: string;
  sourceStageId: ApplicationStatus;
  targetStageId: ApplicationStatus;
} | null>(null);

const getCandidatesForStage = (stageId: ApplicationStatus) => {
  return props.candidates.filter((c) => c.status === stageId);
};

// Handle VueDraggable list update per column
const handleColumnListUpdate = (
  stageId: ApplicationStatus,
  newList: ApplicationWithDetails[],
) => {
  // Identify additions to this list compared to props
  const currentIds = new Set(getCandidatesForStage(stageId).map((c) => c.id));
  const newItems = newList.filter((c) => !currentIds.has(c.id));

  if (newItems.length > 0 && newItems[0]) {
    const movedCandidate = newItems[0];
    const sourceStageId = movedCandidate.status;

    // Setup modal exactly for one target
    pendingMove.value = {
      candidateId: movedCandidate.id,
      sourceStageId,
      targetStageId: stageId,
    };
    showModal.value = true;
  }
};

const getStageDetails = (stageId: ApplicationStatus) => {
  return props.stages.find((s) => s.id === stageId)!;
};

const handleConfirmMove = async () => {
  if (!pendingMove.value) return;
  const { candidateId, targetStageId } = pendingMove.value;
  await pipelineStore.updateApplicationStage(candidateId, targetStageId);
  showModal.value = false;
  pendingMove.value = null;
};

const handleCancelMove = () => {
  showModal.value = false;
  pendingMove.value = null;
  // VueDraggable might have mutated its internal DOM state, the best way to revert is to force update
  pipelineStore.fetchApplications(); // Reload from store to revert frontend DOM
};
</script>

<template>
  <div class="flex-1 overflow-x-auto overflow-y-hidden bg-white">
    <div class="flex h-full p-6 pb-2 gap-4 items-start w-max">
      <KanbanColumn
        v-for="stage in stages"
        :key="stage.id"
        :stage="stage"
        :candidates="getCandidatesForStage(stage.id)"
        :selected-candidate-id="selectedCandidateId"
        @select="(id: string) => emit('select', id)"
        @update:candidates="
          (newList: ApplicationWithDetails[]) =>
            handleColumnListUpdate(stage.id, newList)
        "
      />
    </div>

    <!-- Transition Modal -->
    <StageTransitionModal
      v-if="pendingMove"
      :show="showModal"
      :is-loading="pipelineStore.isLoading"
      :candidate-name="
        candidates.find((c) => c.id === pendingMove?.candidateId)?.candidate
          .user.full_name || 'Ứng viên'
      "
      :source-stage="getStageDetails(pendingMove.sourceStageId)"
      :target-stage="getStageDetails(pendingMove.targetStageId)"
      @confirm="handleConfirmMove"
      @cancel="handleCancelMove"
    />
  </div>
</template>
