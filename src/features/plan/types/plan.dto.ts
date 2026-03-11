// src/features/plan/types/plan.dto.ts
// Zod schemas derived from api.json PlanResponse + subscription_plans SQL table
import { z } from 'zod'

// ─────────────────────────────────────────────────────────────
// PLAN RESPONSE
// GET /vietrecruit/plans   → ApiResponse<PlanResponse[]>
// GET /vietrecruit/plans/:id → ApiResponse<PlanResponse>
//
// SQL constraints (subscription_plans):
//   code            VARCHAR(50) UNIQUE NOT NULL
//   name            VARCHAR(100) NOT NULL
//   description     TEXT (nullable)
//   max_active_jobs  INTEGER NOT NULL DEFAULT 1
//   job_duration_days INTEGER NOT NULL DEFAULT 30
//   resume_access    BOOLEAN DEFAULT FALSE
//   ai_matching      BOOLEAN DEFAULT FALSE
//   priority_listing BOOLEAN DEFAULT FALSE
//   price_monthly    NUMERIC(12,2) NOT NULL DEFAULT 0
//   price_yearly     NUMERIC(12,2) (nullable)
//   currency         VARCHAR(10) DEFAULT 'VND'
// ─────────────────────────────────────────────────────────────

export const PlanResponseSchema = z.object({
  id:               z.string().uuid(),
  code:             z.string().min(1).max(50),
  name:             z.string().min(1).max(100),
  description:      z.string().nullable().optional(),
  maxActiveJobs:    z.number().int(),
  jobDurationDays:  z.number().int(),
  resumeAccess:     z.boolean(),
  aiMatching:       z.boolean(),
  priorityListing:  z.boolean(),
  priceMonthly:     z.number(),
  priceYearly:      z.number().nullable().optional(),
  currency:         z.string().max(10).default('VND'),
})

export type PlanResponse = z.infer<typeof PlanResponseSchema>
