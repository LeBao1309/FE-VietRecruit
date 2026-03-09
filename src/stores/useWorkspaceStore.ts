import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { JobWithDetails, InterviewWithDetails, ApplicationWithDetails } from '../features/workspace/types';
import { mockJobs, mockInterviews, mockApplications, pipelineStages } from '../features/workspace/mocks/pipeline.mock';

export const useWorkspaceStore = defineStore('workspace', () => {
  // Data state
  const recentJobs = ref<JobWithDetails[]>([]);
  const todayInterviews = ref<InterviewWithDetails[]>([]);
  const applications = ref<ApplicationWithDetails[]>([]);
  const isLoading = ref(false);

  // Computed properties for Dashboard
  const activeJobs = computed(() => {
    return recentJobs.value.filter(j => j.status === 'PUBLISHED').slice(0, 5);
  });

  const upcomingInterviews = computed(() => {
    return todayInterviews.value.filter(i => i.status === 'SCHEDULED').slice(0, 3);
  });

  const pipelineFunnel = computed(() => {
    return pipelineStages.map((stage) => {
      return {
        id: stage.id,
        label: stage.label,
        color: stage.color,
        count: applications.value.filter((a) => a.status === stage.id).length,
      };
    });
  });

  async function fetchWorkspaceData() {
    isLoading.value = true;
    // TODO: replace with GET /api/workspace/dashboard
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network latency
    
    recentJobs.value = [...mockJobs];
    todayInterviews.value = [...mockInterviews];
    applications.value = [...mockApplications];
    
    isLoading.value = false;
  }

  return { 
    recentJobs, 
    todayInterviews, 
    applications, 
    isLoading,
    activeJobs,
    upcomingInterviews,
    pipelineFunnel,
    fetchWorkspaceData 
  };
});
