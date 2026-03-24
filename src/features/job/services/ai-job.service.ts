// src/features/job/services/ai-job.service.ts
// AI-powered job features: JD generation and salary benchmark.
// Salary benchmark responses are cached in-memory for 5 minutes.

import { apiClient } from '@/core/api/axios.instance'
import type { ApiResponse } from '@/core/types/api.types'
import type {
  JdGenerateRequest,
  JdGenerateResponse,
  SalaryBenchmarkRequest,
  SalaryBenchmark,
} from '@/features/job/types/job.dto'

const JD_BASE = '/vietrecruit/ai/jobs/generate-description'
const SALARY_BASE = '/vietrecruit/ai/salary-benchmark'
const SALARY_CACHE_TTL_MS = 5 * 60 * 1000

interface CacheEntry {
  data: SalaryBenchmark
  expiresAt: number
}

const salaryCache = new Map<string, CacheEntry>()

function buildSalaryCacheKey(ctx: SalaryBenchmarkRequest): string {
  return `${ctx.title}|${ctx.location ?? ''}|${ctx.experienceLevel ?? ''}`
}

export const aiJobService = {
  /**
   * POST /vietrecruit/ai/jobs/generate-description
   * Generates a job description draft based on title, department, and requirements.
   */
  async generateDescription(ctx: JdGenerateRequest): Promise<JdGenerateResponse> {
    const { data } = await apiClient.post<ApiResponse<JdGenerateResponse>>(JD_BASE, ctx)
    return data.data
  },

  /**
   * POST /vietrecruit/ai/salary-benchmark
   * Returns min/max/median salary estimates. Results are cached in-memory for 5 minutes.
   */
  async estimateSalary(ctx: SalaryBenchmarkRequest): Promise<SalaryBenchmark> {
    const key = buildSalaryCacheKey(ctx)
    const cached = salaryCache.get(key)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }

    const { data } = await apiClient.post<ApiResponse<SalaryBenchmark>>(SALARY_BASE, ctx)
    salaryCache.set(key, { data: data.data, expiresAt: Date.now() + SALARY_CACHE_TTL_MS })
    return data.data
  },
}
