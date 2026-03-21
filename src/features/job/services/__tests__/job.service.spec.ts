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
    put: vi.fn(),
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

describe('jobService.publishJob', () => {
  it('calls PUT /vietrecruit/jobs/:id/publish and returns the published job', async () => {
    const publishedJob: Job = { ...mockJob, status: 'PUBLISHED' }
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { data: publishedJob } })

    const result = await jobService.publishJob('job-1')

    expect(apiClient.put).toHaveBeenCalledWith('/vietrecruit/jobs/job-1/publish')
    expect(result.status).toBe('PUBLISHED')
  })

  it('propagates Axios error when publish fails', async () => {
    const axiosError = Object.assign(new Error('Request failed'), { isAxiosError: true })
    vi.mocked(apiClient.put).mockRejectedValueOnce(axiosError)

    await expect(jobService.publishJob('job-1')).rejects.toThrow('Request failed')
  })
})

describe('jobService.closeJob', () => {
  it('calls PUT /vietrecruit/jobs/:id/close and returns the closed job', async () => {
    const closedJob: Job = { ...mockJob, status: 'CLOSED' }
    vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { data: closedJob } })

    const result = await jobService.closeJob('job-1')

    expect(apiClient.put).toHaveBeenCalledWith('/vietrecruit/jobs/job-1/close')
    expect(result.status).toBe('CLOSED')
  })
})

