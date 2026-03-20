// src/features/job/types/job.dto.ts
// API payload / response DTOs for the Job Management module.
// Domain types (Job, JobStatus) are re-exported from the shared workspace types.

import type { z } from 'zod'
import type { Job, JobStatus } from '@/features/workspace/types'
import type { createJobSchema } from '@/features/job/schemas/job.schema'

// ── Re-exports for convenience ────────────────────────────────────────────────
export type { Job, JobStatus }

// ── Request DTOs ──────────────────────────────────────────────────────────────

/** Inferred from the Zod schema — single source of truth for form +  service */
export type CreateJobRequest = z.infer<typeof createJobSchema>

/** Payload sent to PATCH /vietrecruit/jobs/:id/status */
export interface UpdateJobStatusRequest {
  status: 'PUBLISHED' | 'CLOSED'
}

/** Query parameters for GET /vietrecruit/jobs */
export interface JobListParams {
  status?: JobStatus
  page?: number
  size?: number
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

/** Spring Page<Job> wrapper returned by the list endpoint */
export interface JobListResponse {
  content: Job[]
  totalElements: number
  totalPages: number
  number: number   // current page index (0-based)
  size: number
}

// ── Error Types ───────────────────────────────────────────────────────────────

/** Thrown by useJobStore.publishJob when the company's job quota is exceeded */
export class QuotaExceededError extends Error {
  constructor(message = 'Job quota exceeded for the current subscription plan.') {
    super(message)
    this.name = 'QuotaExceededError'
  }
}
