// src/features/pipeline/types/application.dto.ts
// DTOs for the ATS Pipeline module (Module 5).
// ApplicationStatus is aliased from the shared workspace types to keep one source of truth.

import { APPLICATION_STATUS, type ApplicationStatus } from '@/core/constants/enums'

export { APPLICATION_STATUS, type ApplicationStatus }

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'NEW',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED',
]

// ── Core entity shapes ────────────────────────────────────────────────────────

export interface Application {
  id: string
  jobId: string
  candidateId: string
  status: ApplicationStatus
  /** Null until AI screening has completed. */
  aiScore: number | null
  coverLetter: string | null
  cvUrl: string
  createdAt: string
  updatedAt: string
}

export interface ApplicationStatusHistoryEntry {
  id: string
  fromStatus: ApplicationStatus | null
  toStatus: ApplicationStatus
  changedBy: string | null
  changedAt: string
  note: string | null
}

export interface ApplicationDetail extends Application {
  /** Ordered newest-first by the backend. */
  statusHistory: ApplicationStatusHistoryEntry[]
}

// ── Request / Response shapes ─────────────────────────────────────────────────

export interface UpdateStatusRequest {
  status: ApplicationStatus
  note?: string
}

export interface ApplicationListParams {
  jobId: string
  status?: ApplicationStatus
  page?: number
  size?: number
}

export interface ApplicationListResponse {
  content: Application[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}
