// ── Requests ─────────────────────────────────────────────────────────
export interface CompanyCreateRequest {
  name: string        // @NotBlank, max 255
  domain?: string     // max 255
  website?: string    // max 255
}

export interface CompanyUpdateRequest {
  name?: string
  domain?: string
  website?: string
}

export interface CompanySearchRequest {
  q?: string
  page?: number
  size?: number
}

// ── Responses ────────────────────────────────────────────────────────
export interface CompanyResponse {
  id: string
  name: string
  domain: string | null
  website: string | null
  createdAt: string
  updatedAt: string
}

export interface CompanySearchResponse {
  id: string
  name: string
  domain: string | null
  website: string | null
  createdAt: string
  highlights: Record<string, string[]> | null
  score: number | null
}
