// src/features/job/types/job.dto.ts
// API payload / response DTOs for the Job Management module.
// Domain types (Job, JobStatus) are re-exported from the shared workspace types.

import type { z } from 'zod'
import type { Job, JobStatus } from '@/features/workspace/types'
import type { createJobSchema, updateJobSchema } from '@/features/job/schemas/job.schema'

// ── Re-exports for convenience ────────────────────────────────────────────────
export type { Job, JobStatus }

// ── Request DTOs ──────────────────────────────────────────────────────────────

/** Inferred from the Zod schema — single source of truth for form + service */
export type CreateJobRequest = z.infer<typeof createJobSchema>

/** All fields optional — used for PUT /vietrecruit/jobs/:id */
export type UpdateJobRequest = z.infer<typeof updateJobSchema>

/** Query parameters for GET /vietrecruit/jobs (employer list) */
export interface JobListParams {
  status?: JobStatus
  page?: number
  size?: number
}

/** Query parameters for GET /vietrecruit/jobs/search (Elasticsearch) */
export interface JobEsSearchParams {
  q?: string
  category?: string
  location?: string
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

// ── AI DTOs ───────────────────────────────────────────────────────────────────

export interface JdGenerateRequest {
  title: string
  department?: string
  requirements?: string
}

export interface JdGenerateResponse {
  description: string
}

export interface SalaryBenchmarkRequest {
  title: string
  location?: string
  experienceLevel?: string
}

export interface SalaryBenchmark {
  min: number
  max: number
  median: number
  currency: string
  sampleSize: number
}

// ── Error Types ───────────────────────────────────────────────────────────────

/** Thrown by useJobStore.publishJob when the company's job quota is exceeded */
export class QuotaExceededError extends Error {
  constructor(message = 'Job quota exceeded for the current subscription plan.') {
    super(message)
    this.name = 'QuotaExceededError'
  }
}
