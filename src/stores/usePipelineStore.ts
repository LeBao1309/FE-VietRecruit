import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ApplicationWithDetails, ApplicationStatus } from '../features/workspace/types';
import { mockApplications } from '../features/workspace/mocks/pipeline.mock';

export const usePipelineStore = defineStore('pipeline', () => {
  // Mock data state
  const applications = ref<ApplicationWithDetails[]>([...mockApplications]);
  const isLoading = ref(false);

  async function fetchApplications() {
    isLoading.value = true;
    // TODO: replace with GET /api/applications
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network latency
    // In real app, we would assign fetched data to applications.value
    applications.value = [...mockApplications];
    isLoading.value = false;
  }

  async function updateApplicationStage(applicationId: string, newStage: ApplicationStatus) {
    isLoading.value = true;
    // TODO: replace with PATCH /api/applications/:id/stage
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network latency
    
    const appIndex = applications.value.findIndex(a => a.id === applicationId);
    const app = applications.value[appIndex];
    if (app) {
      app.status = newStage;
    }
    isLoading.value = false;
  }

  return { applications, isLoading, fetchApplications, updateApplicationStage };
});
