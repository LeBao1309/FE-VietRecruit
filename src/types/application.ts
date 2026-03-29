import type { ApplicationStatus } from './enums'

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
