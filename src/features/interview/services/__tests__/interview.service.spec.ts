// src/features/interview/services/__tests__/interview.service.spec.ts
// Unit tests for interviewService. All HTTP calls are mocked via vi.mock.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/core/api/axios.instance'
import { interviewService } from '@/features/interview/services/interview.service'
import type { Interview } from '@/features/interview/types/interview.dto'

vi.mock('@/core/api/axios.instance', () => ({
  apiClient: {
    get:   vi.fn(),
    post:  vi.fn(),
    patch: vi.fn(),
  },
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockInterview: Interview = {
  id: 'iv-1',
  applicationId: 'app-1',
  jobId: 'job-1',
  scheduledAt: '2026-06-01T10:00:00Z',
  location: 'Room 3B',
  meetingLink: null,
  interviewerIds: ['user-1'],
  status: 'SCHEDULED',
  notes: null,
  createdBy: 'user-hr',
  createdAt: '2026-05-01T00:00:00Z',
  updatedAt: '2026-05-01T00:00:00Z',
}

beforeEach(() => vi.clearAllMocks())

// ── getInterviews ─────────────────────────────────────────────────────────────

describe('interviewService.getInterviews', () => {
  it('calls GET /vietrecruit/interviews with params and unwraps data.data', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [mockInterview] } })

    const result = await interviewService.getInterviews({ applicationId: 'app-1' })

    expect(apiClient.get).toHaveBeenCalledWith('/vietrecruit/interviews', {
      params: { applicationId: 'app-1' },
    })
    expect(result).toHaveLength(1)
    expect(result[0]!.id).toBe('iv-1')
  })

  it('forwards optional status filter', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [] } })

    await interviewService.getInterviews({ applicationId: 'app-1', status: 'COMPLETED' })

    expect(apiClient.get).toHaveBeenCalledWith('/vietrecruit/interviews', {
      params: { applicationId: 'app-1', status: 'COMPLETED' },
    })
  })

  it('propagates error when GET fails', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'))

    await expect(interviewService.getInterviews({ applicationId: 'app-1' })).rejects.toThrow('Network error')
  })
})

// ── getMyInterviews ───────────────────────────────────────────────────────────

describe('interviewService.getMyInterviews', () => {
  it('calls GET /vietrecruit/interviews/my-interviews', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [mockInterview] } })

    const result = await interviewService.getMyInterviews()

    expect(apiClient.get).toHaveBeenCalledWith('/vietrecruit/interviews/my-interviews', {
      params: undefined,
    })
    expect(result[0]!.id).toBe('iv-1')
  })

  it('forwards status filter param', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: [] } })

    await interviewService.getMyInterviews({ status: 'SCHEDULED' })

    expect(apiClient.get).toHaveBeenCalledWith('/vietrecruit/interviews/my-interviews', {
      params: { status: 'SCHEDULED' },
    })
  })
})

// ── scheduleInterview ─────────────────────────────────────────────────────────

describe('interviewService.scheduleInterview', () => {
  it('calls POST /vietrecruit/interviews and returns created interview', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { data: mockInterview } })

    const payload = {
      applicationId: 'app-1',
      jobId: 'job-1',
      scheduledAt: '2026-06-01T10:00:00Z',
      interviewerIds: ['user-1'],
      location: 'Room 3B',
    }
    const result = await interviewService.scheduleInterview(payload)

    expect(apiClient.post).toHaveBeenCalledWith('/vietrecruit/interviews', payload)
    expect(result.id).toBe('iv-1')
  })

  it('propagates error when POST fails', async () => {
    vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Conflict'))

    await expect(
      interviewService.scheduleInterview({
        applicationId: 'app-1',
        jobId: 'job-1',
        scheduledAt: '2026-06-01T10:00:00Z',
        interviewerIds: ['user-1'],
      }),
    ).rejects.toThrow('Conflict')
  })
})

// ── updateStatus ──────────────────────────────────────────────────────────────

describe('interviewService.updateStatus', () => {
  it('calls PATCH /vietrecruit/interviews/{id}/status and returns updated interview', async () => {
    const updated: Interview = { ...mockInterview, status: 'COMPLETED' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: { data: updated } })

    const result = await interviewService.updateStatus('iv-1', { status: 'COMPLETED' })

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/vietrecruit/interviews/iv-1/status',
      { status: 'COMPLETED' },
    )
    expect(result.status).toBe('COMPLETED')
  })
})
