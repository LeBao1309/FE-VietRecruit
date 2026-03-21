export const APP_CONFIG = {
  // Token management
  TOKEN_REFRESH_BUFFER_MS:    60_000,   // refresh 60s before expiry
  SESSION_CHECK_INTERVAL_MS:  30_000,   // poll token validity every 30s
  MAX_REFRESH_RETRIES:        3,

  // Pagination
  DEFAULT_PAGE_SIZE:          20,
  MAX_PAGE_SIZE:              100,

  // UI timing
  TOAST_DURATION_MS:          4_000,
  DEBOUNCE_SEARCH_MS:         350,
  DEBOUNCE_INPUT_MS:          200,

  // Retry / network
  API_TIMEOUT_MS:             15_000,
  MAX_UPLOAD_SIZE_MB:         10,
} as const
