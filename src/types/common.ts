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

/**
 * Spring Boot native Page<T> response format.
 * BE returns this for paginated endpoints like /departments, /locations, /categories.
 * Uses `number` for current page (0-indexed) instead of `page`.
 */
export interface SpringPageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number          // current page (0-indexed)
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
  sort: SortObject
  pageable: PageableObject
}

export interface SortObject {
  empty: boolean
  sorted: boolean
  unsorted: boolean
}

export interface PageableObject {
  offset: number
  sort: SortObject
  pageNumber: number
  pageSize: number
  paged: boolean
  unpaged: boolean
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

// ── Helper: normalize Spring Page → PageResponse ─────────────────────
/**
 * Converts a Spring Boot native Page<T> response to the simplified
 * PageResponse<T> format used across the FE.
 */
export function normalizeSpringPage<T>(springPage: SpringPageResponse<T>): PageResponse<T> {
  return {
    content: springPage.content,
    page: springPage.number,
    size: springPage.size,
    totalElements: springPage.totalElements,
    totalPages: springPage.totalPages,
    first: springPage.first,
    last: springPage.last,
    empty: springPage.empty,
  }
}
