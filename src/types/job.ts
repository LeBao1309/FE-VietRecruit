import type { JobStatus } from './enums'

// ── Requests ─────────────────────────────────────────────────────────
export interface JobCreateRequest {
  title: string             // @NotBlank, max 255
  description: string       // @NotBlank, max 50000
  requirements?: string     // max 50000
  departmentId?: string
  locationId?: string
  categoryId?: string
  minSalary?: number
  maxSalary?: number
  currency?: string         // max 10
  isNegotiable?: boolean
  deadline?: string          // ISO date
}

export interface JobUpdateRequest {
  title?: string
  description?: string
  requirements?: string
  departmentId?: string
  locationId?: string
  categoryId?: string
  minSalary?: number
  maxSalary?: number
  currency?: string
  isNegotiable?: boolean
  deadline?: string
}

export interface JobSearchRequest {
  q?: string
  locationId?: string
  categoryId?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  page?: number
  size?: number
  sort?: string     // default: 'relevance'
}

// ── Responses ────────────────────────────────────────────────────────
export interface JobResponse {
  id: string
  departmentId: string | null
  locationId: string | null
  categoryId: string | null
  title: string
  description: string
  requirements: string | null
  minSalary: number | null
  maxSalary: number | null
  currency: string | null
  isNegotiable: boolean | null
  status: JobStatus
  deadline: string | null
  publicLink: string | null
  createdBy: string
  updatedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface JobSummaryResponse {
  id: string
  title: string
  status: JobStatus
  minSalary: number | null
  maxSalary: number | null
  currency: string | null
  isNegotiable: boolean | null
  deadline: string | null
  createdAt: string
}

export interface JobSearchResponse {
  id: string
  title: string
  description: string | null
  requirements: string | null
  companyName: string | null
  categoryName: string | null
  locationName: string | null
  minSalary: number | null
  maxSalary: number | null
  currency: string | null
  isNegotiable: boolean | null
  status: string | null
  publicLink: string | null
  createdAt: string
  highlights: Record<string, string[]> | null
  score: number | null
}

export interface JobRecommendationResponse {
  jobId: string
  title: string
  companyName: string
  location: string | null
  matchScore: number
  matchReason: string
}
