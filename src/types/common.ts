// ── API Response Wrappers ────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
  timestamp: string // ISO-8601
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface SearchPageResponse<T> extends PageResponse<T> {
  tookMs: number
}

// ── Pagination Request ───────────────────────────────────────────────
export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}
