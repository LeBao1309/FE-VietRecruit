import { ref } from 'vue';
import type { ApplicationWithDetails, JobWithDetails, InterviewWithDetails } from '../types';
import { mockApplications, mockJobs, mockInterviews } from '../mocks/pipeline.mock';

export function useWorkspace() {
  const applications = ref<ApplicationWithDetails[]>([]);
  const jobs = ref<JobWithDetails[]>([]);
  const interviews = ref<InterviewWithDetails[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchWorkspaceData = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // TODO(api-ready): replace mock -> GET /api/workspace/dashboard
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      applications.value = mockApplications;
      jobs.value = mockJobs;
      interviews.value = mockInterviews;
    } catch (err) {
      error.value = 'Failed to load workspace data';
    } finally {
      loading.value = false;
    }
  };

  const updateApplicationStage = async (applicationId: string, newStage: ApplicationWithDetails['status']) => {
    // TODO(api-ready): replace mock -> PATCH /api/applications/:id/stage
    // Expected payload: { status: newStage }
    const app = applications.value.find(a => a.id === applicationId);
    if (app) {
      app.status = newStage;
    }
  };

  return {
    applications,
    jobs,
    interviews,
    loading,
    error,
    fetchWorkspaceData,
    updateApplicationStage
  };
}
