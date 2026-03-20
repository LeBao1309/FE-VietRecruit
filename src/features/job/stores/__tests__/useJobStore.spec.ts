// src/features/job/stores/__tests__/useJobStore.spec.ts
// Unit tests for useJobStore. Pattern matches src/stores/__tests__/useWorkspaceStore.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useJobStore } from '@/features/job/stores/useJobStore'
import { jobService } from '@/features/job/services/job.service'
import { QuotaExceededError } from '@/features/job/types/job.dto'
import type { Job } from '@/features/workspace/types'
import type { JobListResponse } from '@/features/job/types/job.dto'

vi.mock('@/features/job/services/job.service', () => ({
  jobService: {
    getJobs: vi.fn(),
    createJob: vi.fn(),
    updateJobStatus: vi.fn(),
  },
}))

const makeMockJob = (overrides: Partial<Job> = {}): Job => ({
  id: 'job-1',
  company_id: 'comp-1',
  title: 'Software Engineer',
  description: 'Build things well.',
  status: 'DRAFT',
  currency: 'VND',
  is_negotiable: false,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ── Initial state ──────────────────────────────────────────────────────────────
describe('useJobStore — initial state', () => {
  it('exposes jobs, isLoading, error refs', () => {
    const store = useJobStore()
    expect(store.jobs).toBeDefined()
    expect(store.isLoading).toBeDefined()
    expect(store.error).toBeDefined()
  })

  it('starts with isLoading = false and empty jobs array', () => {
    const store = useJobStore()
    expect(store.isLoading).toBe(false)
    expect(store.jobs).toEqual([])
  })

  it('exposes computed draftJobs, publishedJobs, closedJobs', () => {
    const store = useJobStore()
    expect(Array.isArray(store.draftJobs)).toBe(true)
    expect(Array.isArray(store.publishedJobs)).toBe(true)
    expect(Array.isArray(store.closedJobs)).toBe(true)
  })
})

// ── fetchJobs ──────────────────────────────────────────────────────────────────
describe('useJobStore — fetchJobs', () => {
  it('sets isLoading during fetch then clears it', async () => {
    const mockResponse: JobListResponse = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 10,
    }
    vi.mocked(jobService.getJobs).mockResolvedValueOnce(mockResponse)
    const store = useJobStore()
    const fetchPromise = store.fetchJobs()
    expect(store.isLoading).toBe(true)
    await fetchPromise
    expect(store.isLoading).toBe(false)
  })

  it('populates jobs array from API response', async () => {
    const mockJob = makeMockJob()
    const mockResponse: JobListResponse = {
      content: [mockJob],
      totalElements: 1,
      totalPages: 1,
      number: 0,
      size: 10,
    }
    vi.mocked(jobService.getJobs).mockResolvedValueOnce(mockResponse)
    const store = useJobStore()
    await store.fetchJobs()
    expect(store.jobs).toHaveLength(1)
    expect(store.jobs[0]?.id).toBe('job-1')
  })

  it('sets error when fetch fails', async () => {
    vi.mocked(jobService.getJobs).mockRejectedValueOnce(new Error('Network error'))
    const store = useJobStore()
    await store.fetchJobs()
    expect(store.error).toBe('Network error')
    expect(store.isLoading).toBe(false)
  })
})

// ── Computed filters ───────────────────────────────────────────────────────────
describe('useJobStore — computed filters', () => {
  it('draftJobs filters correctly', async () => {
    const mockResponse: JobListResponse = {
      content: [
        makeMockJob({ id: 'job-1', status: 'DRAFT' }),
        makeMockJob({ id: 'job-2', status: 'PUBLISHED' }),
        makeMockJob({ id: 'job-3', status: 'CLOSED' }),
      ],
      totalElements: 3,
      totalPages: 1,
      number: 0,
      size: 10,
    }
    vi.mocked(jobService.getJobs).mockResolvedValueOnce(mockResponse)
    const store = useJobStore()
    await store.fetchJobs()

    expect(store.draftJobs).toHaveLength(1)
    expect(store.draftJobs[0]?.status).toBe('DRAFT')
    expect(store.publishedJobs).toHaveLength(1)
    expect(store.publishedJobs[0]?.status).toBe('PUBLISHED')
    expect(store.closedJobs).toHaveLength(1)
    expect(store.closedJobs[0]?.status).toBe('CLOSED')
  })
})

// ── createJob ──────────────────────────────────────────────────────────────────
describe('useJobStore — createJob', () => {
  it('prepends the new job to the list and returns it', async () => {
    const existingJob = makeMockJob({ id: 'existing', title: 'Existing Job' })
    const newJob = makeMockJob({ id: 'new-job', title: 'New Job' })
    vi.mocked(jobService.createJob).mockResolvedValueOnce(newJob)

    const store = useJobStore()
    store.jobs.push(existingJob) // simulate existing data

    const result = await store.createJob({
      title: 'New Job',
      description: 'Desc',
      department_id: 'dept-1',
      location_id: 'loc-1',
      category_id: 'cat-1',
      currency: 'VND',
      is_negotiable: false,
      deadline: '2026-12-31',
    })

    expect(result.id).toBe('new-job')
    expect(store.jobs[0]?.id).toBe('new-job') // prepended
    expect(store.jobs).toHaveLength(2)
  })
})

// ── publishJob ─────────────────────────────────────────────────────────────────
describe('useJobStore — publishJob', () => {
  it('updates the job status to PUBLISHED in the list', async () => {
    const draftJob = makeMockJob({ id: 'j1', status: 'DRAFT' })
    const publishedJob = makeMockJob({ id: 'j1', status: 'PUBLISHED' })
    vi.mocked(jobService.updateJobStatus).mockResolvedValueOnce(publishedJob)

    const store = useJobStore()
    store.jobs.push(draftJob)
    await store.publishJob('j1')

    expect(store.jobs[0]?.status).toBe('PUBLISHED')
  })

  it('throws QuotaExceededError when backend returns 402', async () => {
    const axiosError = Object.assign(new Error('Quota exceeded'), {
      isAxiosError: true,
      response: {
        status: 402,
        data: { message: 'Your subscription has reached the maximum job quota.' },
      },
    })
    vi.mocked(jobService.updateJobStatus).mockRejectedValueOnce(axiosError)

    const store = useJobStore()
    await expect(store.publishJob('j1')).rejects.toBeInstanceOf(QuotaExceededError)
    expect(store.isLoading).toBe(false)
  })
})

// ── closeJob ───────────────────────────────────────────────────────────────────
describe('useJobStore — closeJob', () => {
  it('updates the job status to CLOSED in the list', async () => {
    const publishedJob = makeMockJob({ id: 'j1', status: 'PUBLISHED' })
    const closedJob = makeMockJob({ id: 'j1', status: 'CLOSED' })
    vi.mocked(jobService.updateJobStatus).mockResolvedValueOnce(closedJob)

    const store = useJobStore()
    store.jobs.push(publishedJob)
    await store.closeJob('j1')

    expect(store.jobs[0]?.status).toBe('CLOSED')
  })
})
