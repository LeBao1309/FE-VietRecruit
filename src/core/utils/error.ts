import axios from 'axios'

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    return (
      data?.message ??
      data?.error ??
      data?.detail ??
      (typeof data === 'string' ? data : null) ??
      `Server error (${error.response?.status ?? 'unknown'})`
    )
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}

export function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}

export function isForbidden(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 403
}

export function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404
}
