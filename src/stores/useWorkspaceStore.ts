import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Job } from '@/features/job/types/job.dto';
import type { Interview } from '@/features/interview/types/interview.dto';
import type { Application } from '@/features/pipeline/types/application.dto';
import { jobService } from '@/features/job/services/job.service';
import { interviewService } from '@/features/interview/services/interview.service';
import { applicationService } from '@/features/pipeline/services/application.service';
import { PIPELINE_STAGES_ORDERED } from '@/core/constants/pipeline-stages';

export const useWorkspaceStore = defineStore('workspace', () => {
  // Data state
  const recentJobs = ref<Job[]>([]);
  const todayInterviews = ref<Interview[]>([]);
  const applications = ref<Application[]>([]);
  const isLoading = ref(false);

  // Computed properties for Dashboard
  const activeJobs = computed(() => {
    return recentJobs.value.filter((j: Job) => j.status === 'PUBLISHED').slice(0, 5);
  });

  const upcomingInterviews = computed(() => {
    return todayInterviews.value.filter((i: Interview) => i.status === 'SCHEDULED').slice(0, 3);
  });

  const pipelineFunnel = computed(() => {
    return PIPELINE_STAGES_ORDERED.map((stage) => {
      return {
        id: stage.status,
        label: stage.labelShort,
        color: stage.color,
        count: applications.value.filter((a) => a.status === stage.status).length,
      };
    });
  });

  async function fetchWorkspaceData() {
    isLoading.value = true;
    
    try {
      const [jobsRes, applicationsRes, interviewsRes] = await Promise.allSettled([
        jobService.getJobs({ page: 0, size: 10 }),
        applicationService.getApplications({ jobId: '', size: 50 }),
        interviewService.getInterviews({})
      ]);

      if (jobsRes.status === 'fulfilled') {
        recentJobs.value = (jobsRes.value.content as any) ?? [];
      } else {
        recentJobs.value = [];
      }

      if (applicationsRes.status === 'fulfilled') {
        applications.value = (applicationsRes.value.content as any) ?? [];
      } else {
        applications.value = [];
      }

      if (interviewsRes.status === 'fulfilled') {
        const allInterviews = (interviewsRes.value as any) ?? [];
        const now = new Date();
        todayInterviews.value = allInterviews
          .filter((i: any) => new Date(i.scheduledAt ?? i.startTime ?? i.date) >= now)
          .sort((a: any, b: any) =>
            new Date(a.scheduledAt ?? a.startTime ?? a.date).getTime() -
            new Date(b.scheduledAt ?? b.startTime ?? b.date).getTime()
          )
          .slice(0, 5);
      } else {
        todayInterviews.value = [];
      }
    } catch (e) {
      console.error(e);
    } finally {
      isLoading.value = false;
    }
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
