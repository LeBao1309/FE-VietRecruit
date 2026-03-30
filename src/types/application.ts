import type { ApplicationStatus, InterviewStatus, ScorecardResult, OfferStatus } from './enums'

// ── Application ──────────────────────────────────────────────────────
export interface ApplicationCreateRequest {
  jobId: string          // @NotNull
  coverLetter?: string
}

export interface ApplicationStatusUpdateRequest {
  status: ApplicationStatus  // @NotNull
  notes?: string
}

export interface ApplicationResponse {
  id: string
  jobId: string
  jobTitle: string
  candidateId: string
  candidateName: string
  appliedCvUrl: string | null
  coverLetter: string | null
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export interface ApplicationSummaryResponse {
  id: string
  jobId: string
  jobTitle: string
  candidateName: string
  status: ApplicationStatus
  createdAt: string
}

export interface ApplicationScreeningResponse {
  applicationId: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  similarityScore: number | null
  aiScore: number | null
  scoreBreakdown: Record<string, number> | null
  strengths: string[]
  gaps: string[]
  summary: string | null
  applicationStatus: string
}

export interface ApplicationStatusHistoryResponse {
  id: string
  oldStatus: ApplicationStatus | null
  newStatus: ApplicationStatus
  notes: string | null
  changedByName: string
  changedAt: string
}

// ── Interview ────────────────────────────────────────────────────────
export interface InterviewCreateRequest {
  title: string                // @NotBlank
  scheduledAt: string          // ISO datetime
  durationMinutes?: number
  locationOrLink?: string
  interviewType?: string
  interviewerIds: string[]     // @NotEmpty
}

export interface InterviewStatusUpdateRequest {
  status: InterviewStatus      // @NotNull
}

export interface InterviewResponse {
  id: string
  applicationId: string
  title: string
  scheduledAt: string
  durationMinutes: number | null
  locationOrLink: string | null
  interviewType: string | null
  status: InterviewStatus
  interviewers: InterviewerResponse[]
  createdAt: string
}

export interface InterviewerResponse {
  id: string
  fullName: string
  email: string
}

// ── Scorecard ────────────────────────────────────────────────────────
export interface ScorecardCreateRequest {
  skillScore: number           // 1-10
  attitudeScore: number        // 1-10
  englishScore: number         // 1-10
  result: ScorecardResult      // @NotNull
  comments?: string
}

export interface ScorecardResponse {
  id: string
  interviewId: string
  interviewerId: string
  interviewerName: string
  skillScore: number
  attitudeScore: number
  englishScore: number
  averageScore: number
  result: ScorecardResult
  comments: string | null
  createdAt: string
}

// ── Offer ────────────────────────────────────────────────────────────
export interface OfferCreateRequest {
  baseSalary: number           // @NotNull
  currency?: string
  startDate?: string           // ISO date
  note?: string
  offerLetterUrl?: string
}

export interface OfferRespondRequest {
  action: 'ACCEPT' | 'DECLINE' // @NotNull
}

export interface OfferResponse {
  id: string
  applicationId: string
  offerLetterUrl: string | null
  baseSalary: number
  currency: string | null
  startDate: string | null
  note: string | null
  status: OfferStatus
  createdAt: string
}
