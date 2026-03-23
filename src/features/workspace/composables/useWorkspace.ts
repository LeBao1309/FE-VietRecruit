import { getErrorMessage } from '@/core/utils/error'
import { ref } from 'vue';
import type { Job } from '@/features/job/types/job.dto';
import type { Interview } from '@/features/interview/types/interview.dto';
import type { Application } from '@/features/pipeline/types/application.dto';
import { applicationService } from '@/features/pipeline/services/application.service';
import { jobService } from '@/features/job/services/job.service';
import { interviewService } from '@/features/interview/services/interview.service';

export function useWorkspace() {
  const applications = ref<Application[]>([]);
  const jobs = ref<Job[]>([]);
  const interviews = ref<Interview[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchWorkspaceData = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const [jobsRes, applicationsRes, interviewsRes] = await Promise.allSettled([
        jobService.getJobs({ page: 0, size: 10 }),
        applicationService.getApplications({ jobId: '', size: 50 }),
        interviewService.getInterviews({})
      ]);

      if (jobsRes.status === 'fulfilled') {
        jobs.value = jobsRes.value.content ?? (jobsRes.value as any).items ?? [];
      } else {
        console.error('[Workspace] Failed to load jobs:', jobsRes.reason);
        jobs.value = [];
      }

      if (applicationsRes.status === 'fulfilled') {
        applications.value = applicationsRes.value.content ?? (applicationsRes.value as any).items ?? [];
      } else {
        console.error('[Workspace] Failed to load applications:', applicationsRes.reason);
        applications.value = [];
      }

      if (interviewsRes.status === 'fulfilled') {
        const allInterviews = interviewsRes.value ?? (interviewsRes.value as any).items ?? [];
        const now = new Date();
        interviews.value = allInterviews
          .filter((i: any) => new Date(i.scheduledAt ?? i.startTime ?? i.date) >= now)
          .sort((a: any, b: any) =>
            new Date(a.scheduledAt ?? a.startTime ?? a.date).getTime() -
            new Date(b.scheduledAt ?? b.startTime ?? b.date).getTime()
          )
          .slice(0, 5);
      } else {
        console.error('[Workspace] Failed to load interviews:', interviewsRes.reason);
        interviews.value = [];
      }
    } catch (err: any) {
      error.value = err?.response?.data?.message ?? getErrorMessage(err);
      console.error('[Workspace] fetchWorkspaceData failed:', err);
    } finally {
      loading.value = false;
    }
  };

  const updateApplicationStage = async (applicationId: string, newStage: Application['status']) => {
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
