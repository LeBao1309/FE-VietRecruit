// src/features/job/services/__tests__/job.service.spec.ts
// Unit tests for jobService. Uses vi.mock to isolate the HTTP layer.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/core/api/axios.instance'
import { jobService } from '@/features/job/services/job.service'
import type { JobListResponse } from '@/features/job/types/job.dto'
import type { Job } from '@/features/workspace/types'

vi.mock('@/core/api/axios.instance', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

const mockJob: Job = {
  id: 'job-1',
  company_id: 'comp-1',
  title: 'Software Engineer',
  description: 'Build things well.',
  status: 'DRAFT',
  currency: 'VND',
  is_negotiable: false,
  created_at: '2026-01-01T00:00:00Z',
}

const mockListResponse: JobListResponse = {
  content: [mockJob],
  totalElements: 1,
  totalPages: 1,
  number: 0,
  size: 10,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('jobService.getJobs', () => {
  it('calls GET /vietrecruit/jobs and unwraps data.data', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: mockListResponse } })

    const result = await jobService.getJobs()

    expect(apiClient.get).toHaveBeenCalledWith('/vietrecruit/jobs', { params: undefined })
    expect(result).toEqual(mockListResponse)
    expect(result.content).toHaveLength(1)
  })

  it('forwards status filter param to the API', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { data: mockListResponse } })

    await jobService.getJobs({ status: 'PUBLISHED', page: 0, size: 20 })

    expect(apiClient.get).toHaveBeenCalledWith('/vietrecruit/jobs', {
      params: { status: 'PUBLISHED', page: 0, size: 20 },
    })
  })
})

describe('jobService.createJob', () => {
  it('calls POST /vietrecruit/jobs with the payload and returns the created job', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { data: mockJob } })

    const payload = {
      title: 'Software Engineer',
      description: 'Build things well.',
      department_id: 'dept-1',
      location_id: 'loc-1',
      category_id: 'cat-1',
      currency: 'VND',
      is_negotiable: false,
      deadline: '2026-12-31',
    }

    const result = await jobService.createJob(payload)

    expect(apiClient.post).toHaveBeenCalledWith('/vietrecruit/jobs', payload)
    expect(result).toEqual(mockJob)
    expect(result.id).toBe('job-1')
  })
})

describe('jobService.updateJobStatus', () => {
  it('calls PATCH /vietrecruit/jobs/:id/status with correct payload', async () => {
    const updatedJob: Job = { ...mockJob, status: 'PUBLISHED' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: { data: updatedJob } })

    const result = await jobService.updateJobStatus('job-1', { status: 'PUBLISHED' })

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/vietrecruit/jobs/job-1/status',
      { status: 'PUBLISHED' },
    )
    expect(result.status).toBe('PUBLISHED')
  })

  it('propagates Axios error when the request fails', async () => {
    const axiosError = Object.assign(new Error('Request failed'), { isAxiosError: true })
    vi.mocked(apiClient.patch).mockRejectedValueOnce(axiosError)

    await expect(
      jobService.updateJobStatus('job-1', { status: 'PUBLISHED' }),
    ).rejects.toThrow('Request failed')
  })
})
