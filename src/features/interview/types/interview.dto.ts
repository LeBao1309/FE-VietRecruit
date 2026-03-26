// src/features/interview/types/interview.dto.ts

// ── Enums ─────────────────────────────────────────────────────────────────────

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED'
export type ScorecardResult = 'PASS' | 'FAIL' | 'CONSIDERING'

// ── Core entities ─────────────────────────────────────────────────────────────

export interface Interview {
  id: string
  applicationId: string
  jobId: string
  scheduledAt: string
  location: string | null
  meetingLink: string | null
  interviewerIds: string[]
  status: InterviewStatus
  notes: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Scorecard {
  id: string
  interviewId: string
  applicationId: string
  reviewerId: string
  skillScore: number
  attitudeScore: number
  englishScore: number
  averageScore: number
  overallNote: string | null
  result: ScorecardResult
  createdAt: string
}

// ── Request shapes ────────────────────────────────────────────────────────────

export interface ScheduleInterviewRequest {
  applicationId: string
  title: string
  scheduledAt: string
  durationMinutes?: number
  locationOrLink?: string
  interviewType?: string
  interviewerIds: string[]
}

export interface UpdateInterviewStatusRequest {
  status: 'COMPLETED' | 'CANCELED'
}

export interface SubmitScorecardRequest {
  skillScore: number
  attitudeScore: number
  englishScore: number
  overallNote?: string
  result: ScorecardResult
}

// ── Response shapes ───────────────────────────────────────────────────────────

export interface ScorecardSummaryResponse {
  interviewId: string
  scorecards: Scorecard[]
  totalReviewers: number
  averageSkill: number
  averageAttitude: number
  averageEnglish: number
  averageOverall: number
  resultBreakdown: { PASS: number; FAIL: number; CONSIDERING: number }
}

export interface InterviewListParams {
  applicationId: string
  status?: InterviewStatus
}
