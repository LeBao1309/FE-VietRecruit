// src/features/pipeline/types/screening.dto.ts
// DTOs for AI screening results (endpoint #5).

export interface ScreeningCriterion {
  name: string
  score: number
  note: string | null
}

export interface ScreeningResult {
  jobId: string
  /** Null while async scoring is still in progress. */
  score: number | null
  summary: string | null
  criteria: ScreeningCriterion[]
  screenedAt: string | null
}
