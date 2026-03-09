import type { ApplicationWithDetails, JobWithDetails, InterviewWithDetails, User, Candidate, ApplicationStatus } from '../types';

const companyId = 'comp-1234';

export const mockUsers: User[] = [
  { id: 'u1', company_id: companyId, email: 'john@example.com', password_hash: 'xxx', full_name: 'Nguyen Van A', role: 'CANDIDATE', avatar_url: null, created_at: '2025-01-01T00:00:00Z' },
  { id: 'u2', company_id: companyId, email: 'mai@example.com', password_hash: 'xxx', full_name: 'Tran Thi Mai', role: 'CANDIDATE', avatar_url: null, created_at: '2025-01-02T00:00:00Z' },
  { id: 'u3', company_id: companyId, email: 'hr@example.com', password_hash: 'xxx', full_name: 'HR Manager', role: 'HR', avatar_url: null, created_at: '2025-01-05T00:00:00Z' },
  { id: 'u4', company_id: companyId, email: 'interviewer@example.com', password_hash: 'xxx', full_name: 'Tech Lead', role: 'INTERVIEWER', avatar_url: null, created_at: '2025-01-05T00:00:00Z' },
];

export const mockCandidates: Candidate[] = [
  { id: 'c1', user_id: 'u1', headline: 'UX Designer', summary: 'Experienced designer', created_at: '2025-02-01T00:00:00Z' },
  { id: 'c2', user_id: 'u2', headline: 'Frontend Developer', summary: 'Vue & React Expert', created_at: '2025-02-02T00:00:00Z' },
];

export const mockJobs: JobWithDetails[] = [
  {
    id: 'job-001', company_id: companyId, title: 'Senior UX Designer', description: 'Design things', status: 'PUBLISHED', created_at: '2025-03-01T00:00:00Z', currency: 'VND',
    department: { id: 'd1', company_id: companyId, name: 'Design' },
    applicationCount: 12, deadline: '2025-12-31'
  },
  {
    id: 'job-002', company_id: companyId, title: 'Frontend Developer (Vue3)', description: 'Code things', status: 'PUBLISHED', created_at: '2025-02-15T00:00:00Z', currency: 'VND',
    department: { id: 'd2', company_id: companyId, name: 'Engineering' },
    applicationCount: 5, deadline: '2025-10-31'
  }
];

export const mockApplications: ApplicationWithDetails[] = [
  {
    id: 'app-1', job_id: 'job-001', candidate_id: 'c1', applied_cv_url: 'http://cv.pdf', status: 'SCREENING', created_at: '2025-03-02T10:00:00Z',
    candidate: { ...mockCandidates[0]!, user: mockUsers[0]! },
    job: mockJobs[0]!,
    scorecards: [{ id: 'sc-1', interview_id: 'int-1', interviewer_id: 'u4', average_score: 87, result: 'CONSIDERING', created_at: '2025-03-04T00:00:00Z' }]
  },
  {
    id: 'app-2', job_id: 'job-002', candidate_id: 'c2', applied_cv_url: 'http://cv2.pdf', status: 'INTERVIEW', created_at: '2025-03-03T10:00:00Z',
    candidate: { ...mockCandidates[1]!, user: mockUsers[1]! },
    job: mockJobs[1]!,
    scorecards: [{ id: 'sc-2', interview_id: 'int-2', interviewer_id: 'u4', average_score: 92, result: 'PASS', created_at: '2025-03-05T00:00:00Z' }]
  }
];

export const mockInterviews: InterviewWithDetails[] = [
  {
    id: 'int-1', application_id: 'app-2', title: 'Technical Interview', scheduled_at: '2025-03-10T14:00:00Z', status: 'SCHEDULED', duration_minutes: 60,
    application: mockApplications[1]!,
    interviewers: [mockUsers[3]!]
  }
];

export const pipelineStages: { id: ApplicationStatus, label: string, color: string }[] = [
  { id: 'NEW', label: 'New', color: '#6B7280' },
  { id: 'SCREENING', label: 'Screening', color: '#009898' }, // Brand Teal
  { id: 'INTERVIEW', label: 'Interview', color: '#7C3AED' },
  { id: 'OFFER', label: 'Offer', color: '#D97706' },
  { id: 'HIRED', label: 'Hired', color: '#059669' },
  { id: 'REJECTED', label: 'Rejected', color: '#DC2626' },
];
