// ── Department ───────────────────────────────────────────────────────
export interface DepartmentRequest {
  name: string        // @NotBlank, max 255
  description?: string
}

export interface DepartmentResponse {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

// ── Location ─────────────────────────────────────────────────────────
export interface LocationRequest {
  name: string        // @NotBlank, max 255
  address?: string
}

export interface LocationResponse {
  id: string
  name: string
  address: string | null
  createdAt: string
  updatedAt: string
}

// ── Category ─────────────────────────────────────────────────────────
export interface CategoryRequest {
  name: string        // @NotBlank, max 255
}

export interface CategoryResponse {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}
