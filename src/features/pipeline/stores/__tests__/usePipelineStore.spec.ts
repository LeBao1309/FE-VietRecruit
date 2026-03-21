// src/features/pipeline/stores/__tests__/usePipelineStore.spec.ts
// Unit tests for usePipelineStore.
// Critical coverage: optimistic update, rollback on failure, AI pending flag.
// Pattern mirrors src/features/job/stores/__tests__/useJobStore.spec.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePipelineStore } from '@/features/pipeline/stores/usePipelineStore'
import { applicationService } from '@/features/pipeline/services/application.service'
import type { Application, ApplicationListResponse } from '@/features/pipeline/types/application.dto'

vi.mock('@/features/pipeline/services/application.service', () => ({
  applicationService: {
    getApplications: vi.fn(),
    updateStatus: vi.fn(),
    triggerAiScreening: vi.fn(),
    getApplicationDetail: vi.fn(),
  },
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeApp(overrides: Partial<Application> = {}): Application {
  return {
    id: 'app-1',
    jobId: 'job-1',
    candidateId: 'cand-1',
    status: 'NEW',
    aiScore: null,
    coverLetter: null,
    cvUrl: 'https://example.com/cv.pdf',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeListResponse(apps: Application[]): ApplicationListResponse {
  return { content: apps, totalElements: apps.length, totalPages: 1, number: 0, size: 200 }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ── Initial state ─────────────────────────────────────────────────────────────

describe('usePipelineStore — initial state', () => {
  it('initializes all 6 status columns as empty arrays', () => {
    const store = usePipelineStore()
    const statuses = ['NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'] as const
    for (const s of statuses) {
      expect(store.applicationsByStatus[s]).toEqual([])
    }
  })

  it('starts with isLoading = false and error = null', () => {
    const store = usePipelineStore()
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('totalApplications starts at 0', () => {
    const store = usePipelineStore()
    expect(store.totalApplications).toBe(0)
  })
})

// ── fetchApplications ─────────────────────────────────────────────────────────

describe('usePipelineStore — fetchApplications', () => {
  it('sets isLoading to true during fetch then clears it', async () => {
    vi.mocked(applicationService.getApplications).mockResolvedValueOnce(makeListResponse([]))
    const store = usePipelineStore()
    const p = store.fetchApplications('job-1')
    expect(store.isLoading).toBe(true)
    await p
    expect(store.isLoading).toBe(false)
  })

  it('groups applications by status correctly', async () => {
    const apps = [
      makeApp({ id: 'a1', status: 'NEW' }),
      makeApp({ id: 'a2', status: 'SCREENING' }),
      makeApp({ id: 'a3', status: 'SCREENING' }),
    ]
    vi.mocked(applicationService.getApplications).mockResolvedValueOnce(makeListResponse(apps))
    const store = usePipelineStore()
    await store.fetchApplications('job-1')

    expect(store.applicationsByStatus.NEW).toHaveLength(1)
    expect(store.applicationsByStatus.SCREENING).toHaveLength(2)
    expect(store.applicationsByStatus.INTERVIEW).toHaveLength(0)
    expect(store.totalApplications).toBe(3)
  })

  it('sets error when fetch fails and clears isLoading', async () => {
    vi.mocked(applicationService.getApplications).mockRejectedValueOnce(new Error('Net fail'))
    const store = usePipelineStore()
    await store.fetchApplications('job-1')
    expect(store.error).toBe('Net fail')
    expect(store.isLoading).toBe(false)
  })
})

// ── moveApplication — optimistic update ──────────────────────────────────────

describe('usePipelineStore — moveApplication optimistic update', () => {
  it('moves card to target column instantly before API resolves', async () => {
    const app = makeApp({ id: 'a1', status: 'NEW' })
    vi.mocked(applicationService.getApplications).mockResolvedValueOnce(makeListResponse([app]))

    // updateStatus resolves after a tick — we check state before awaiting
    let resolveUpdate!: (v: Application) => void
    vi.mocked(applicationService.updateStatus).mockReturnValueOnce(
      new Promise<Application>((res) => { resolveUpdate = res }),
    )

    const store = usePipelineStore()
    await store.fetchApplications('job-1')

    // Kick off move but do NOT await
    const movePromise = store.moveApplication('a1', 'SCREENING')

    // Optimistic: card already in SCREENING, removed from NEW
    expect(store.applicationsByStatus.NEW).toHaveLength(0)
    expect(store.applicationsByStatus.SCREENING).toHaveLength(1)
    expect(store.applicationsByStatus.SCREENING[0]?.id).toBe('a1')

    // Let the API resolve with confirmed data
    resolveUpdate({ ...app, status: 'SCREENING' })
    await movePromise

    // Card still in SCREENING with confirmed status
    expect(store.applicationsByStatus.SCREENING[0]?.status).toBe('SCREENING')
  })

  it('replaces optimistic card with server-confirmed data after API resolves', async () => {
    const app = makeApp({ id: 'a1', status: 'NEW', aiScore: null })
    const confirmed = { ...app, status: 'SCREENING' as const, aiScore: 88 }
    vi.mocked(applicationService.getApplications).mockResolvedValueOnce(makeListResponse([app]))
    vi.mocked(applicationService.updateStatus).mockResolvedValueOnce(confirmed)

    const store = usePipelineStore()
    await store.fetchApplications('job-1')
    await store.moveApplication('a1', 'SCREENING')

    expect(store.applicationsByStatus.SCREENING[0]?.aiScore).toBe(88)
  })

  it('rolls back card to original column on API failure', async () => {
    const app = makeApp({ id: 'a1', status: 'NEW' })
    vi.mocked(applicationService.getApplications).mockResolvedValueOnce(makeListResponse([app]))
    vi.mocked(applicationService.updateStatus).mockRejectedValueOnce(new Error('Server error'))

    const store = usePipelineStore()
    await store.fetchApplications('job-1')

    await expect(store.moveApplication('a1', 'SCREENING')).rejects.toThrow('Server error')

    // Rollback: card is back in NEW, SCREENING is empty
    expect(store.applicationsByStatus.NEW).toHaveLength(1)
    expect(store.applicationsByStatus.NEW[0]?.id).toBe('a1')
    expect(store.applicationsByStatus.SCREENING).toHaveLength(0)
    expect(store.error).toBe('Server error')
  })

  it('does nothing when source and target status are the same', async () => {
    const app = makeApp({ id: 'a1', status: 'NEW' })
    vi.mocked(applicationService.getApplications).mockResolvedValueOnce(makeListResponse([app]))

    const store = usePipelineStore()
    await store.fetchApplications('job-1')
    await store.moveApplication('a1', 'NEW') // same column

    expect(applicationService.updateStatus).not.toHaveBeenCalled()
    expect(store.applicationsByStatus.NEW).toHaveLength(1)
  })
})

// ── triggerAiScreening ────────────────────────────────────────────────────────

describe('usePipelineStore — triggerAiScreening', () => {
  it('marks application as AI pending after successful trigger', async () => {
    vi.mocked(applicationService.triggerAiScreening).mockResolvedValueOnce(undefined)
    const store = usePipelineStore()

    expect(store.isAiPending('app-1')).toBe(false)
    await store.triggerAiScreening('app-1')
    expect(store.isAiPending('app-1')).toBe(true)
  })

  it('sets error and rethrows when trigger fails', async () => {
    vi.mocked(applicationService.triggerAiScreening).mockRejectedValueOnce(new Error('AI down'))
    const store = usePipelineStore()

    await expect(store.triggerAiScreening('app-1')).rejects.toThrow('AI down')
    expect(store.error).toBe('AI down')
    expect(store.isAiPending('app-1')).toBe(false)
  })
})
