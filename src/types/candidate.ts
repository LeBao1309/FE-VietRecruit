// ── Requests ─────────────────────────────────────────────────────────
export interface CandidateUpdateRequest {
  headline?: string
  summary?: string
  desiredPosition?: string
  desiredPositionLevel?: string
  yearsOfExperience?: number
  skills?: string[]
  primaryLanguage?: string
  workType?: string
  desiredSalaryMin?: number
  desiredSalaryMax?: number
  availableFrom?: string
  educationLevel?: string
  educationMajor?: string
  isOpenToWork?: boolean
}

export interface CandidateSearchRequest {
  q?: string
  skills?: string[]
  experienceMin?: number
  isOpenToWork?: boolean
  educationLevel?: string
  workType?: string
  page?: number
  size?: number
}

// ── Responses ────────────────────────────────────────────────────────
export interface CandidateProfileResponse {
  id: string
  userId: string
  headline: string | null
  summary: string | null
  defaultCvUrl: string | null
  cvOriginalFilename: string | null
  cvContentType: string | null
  cvFileSizeBytes: number | null
  cvUploadedAt: string | null
  desiredPosition: string | null
  desiredPositionLevel: string | null
  yearsOfExperience: number | null
  skills: string[] | null
  primaryLanguage: string | null
  workType: string | null
  desiredSalaryMin: number | null
  desiredSalaryMax: number | null
  availableFrom: string | null
  educationLevel: string | null
  educationMajor: string | null
  isOpenToWork: boolean
  createdAt: string
  updatedAt: string
}

export interface CandidateSearchResponse {
  id: string
  headline: string | null
  summary: string | null
  desiredPosition: string | null
  desiredPositionLevel: string | null
  yearsOfExperience: number | null
  skills: string[] | null
  workType: string | null
  desiredSalaryMin: number | null
  desiredSalaryMax: number | null
  educationLevel: string | null
  educationMajor: string | null
  isOpenToWork: boolean
  updatedAt: string
  highlights: Record<string, string[]> | null
  score: number | null
}

export interface CvUploadResponse {
  cvUrl: string
  cvOriginalFilename: string
  cvContentType: string
  cvFileSizeBytes: number
  cvUploadedAt: string
}
