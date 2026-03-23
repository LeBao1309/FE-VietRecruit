// src/features/pipeline/services/__tests__/application.service.spec.ts
// Unit tests for applicationService. Uses vi.mock to isolate the HTTP layer.
// Pattern mirrors src/features/job/services/__tests__/job.service.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/core/api/axios.instance'
import { applicationService } from '@/features/pipeline/services/application.service'
import type {
  Application,
  ApplicationDetail,
  ApplicationListResponse,
} from '@/features/pipeline/types/application.dto'

vi.mock('@/core/api/axios.instance', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockApp: Application = {
  id: 'app-1',
  jobId: 'job-1',
  candidateId: 'cand-1',
  status: 'NEW',
  aiScore: null,
  coverLetter: null,
  cvUrl: 'https://example.com/cv.pdf',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

const mockListResponse: ApplicationListResponse = {
  content: [mockApp],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 200,
}

beforeEach(() => vi.clearAllMocks())

// ── getApplications ───────────────────────────────────────────────────────────

describe('applicationService.getApplications', () => {
  it('calls GET /vietrecruit/applications with params and unwraps data.data', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: mockListResponse } })

    const result = await applicationService.getApplications({ jobId: 'job-1', size: 200 })

    expect(apiClient.get).toHaveBeenCalledWith('/vietrecruit/applications', {
      params: { jobId: 'job-1', size: 200 },
    })
    expect(result).toEqual(mockListResponse)
    expect(result.content).toHaveLength(1)
  })

  it('forwards optional status filter param to the API', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: mockListResponse } })

    await applicationService.getApplications({ jobId: 'job-1', status: 'SCREENING', page: 0 })

    expect(apiClient.get).toHaveBeenCalledWith('/vietrecruit/applications', {
      params: { jobId: 'job-1', status: 'SCREENING', page: 0 },
    })
  })

  it('propagates error when GET fails', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'))

    await expect(
      applicationService.getApplications({ jobId: 'job-1' }),
    ).rejects.toThrow('Network error')
  })
})

// ── updateStatus ──────────────────────────────────────────────────────────────

describe('applicationService.updateStatus', () => {
  it('calls PATCH /vietrecruit/applications/{id}/status and returns updated app', async () => {
    const updated: Application = { ...mockApp, status: 'SCREENING' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: { data: updated } })

    const result = await applicationService.updateStatus('app-1', { status: 'SCREENING' })

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/vietrecruit/applications/app-1/status',
      { status: 'SCREENING' },
    )
    expect(result.status).toBe('SCREENING')
  })

  it('forwards optional note in the payload', async () => {
    const updated: Application = { ...mockApp, status: 'REJECTED' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: { data: updated } })

    await applicationService.updateStatus('app-1', { status: 'REJECTED', note: 'Not suitable' })

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/vietrecruit/applications/app-1/status',
      { status: 'REJECTED', note: 'Not suitable' },
    )
  })

  it('propagates error when PATCH fails', async () => {
    vi.mocked(apiClient.patch).mockRejectedValueOnce(new Error('Server error'))

    await expect(
      applicationService.updateStatus('app-1', { status: 'INTERVIEW' }),
    ).rejects.toThrow('Server error')
  })
})

// ── triggerAiScreening ────────────────────────────────────────────────────────

describe('applicationService.triggerAiScreening', () => {
  it('calls POST /vietrecruit/applications/jobs/{jobId}/screening/trigger and resolves void', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ status: 202 })

    await expect(applicationService.triggerAiScreening('job-1')).resolves.toBeUndefined()

    expect(apiClient.post).toHaveBeenCalledWith('/vietrecruit/applications/jobs/job-1/screening/trigger')
  })

  it('propagates error when POST fails', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('AI unavailable'))

    await expect(applicationService.triggerAiScreening('job-1')).rejects.toThrow('AI unavailable')
  })
})

// ── getApplicationDetail ──────────────────────────────────────────────────────

describe('applicationService.getApplicationDetail', () => {
  it('calls GET /vietrecruit/applications/{id} and returns detail with statusHistory', async () => {
    const detail: ApplicationDetail = { ...mockApp, statusHistory: [] }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: detail } })

    const result = await applicationService.getApplicationDetail('app-1')

    expect(apiClient.get).toHaveBeenCalledWith('/vietrecruit/applications/app-1')
    expect(result.id).toBe('app-1')
    expect(Array.isArray(result.statusHistory)).toBe(true)
  })

  it('propagates error when GET fails', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Not found'))

    await expect(applicationService.getApplicationDetail('bad-id')).rejects.toThrow('Not found')
  })
})
