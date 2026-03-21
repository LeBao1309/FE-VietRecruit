// src/features/interview/stores/__tests__/useInterviewStore.spec.ts
// Unit tests for useInterviewStore.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useInterviewStore } from '@/features/interview/stores/useInterviewStore'
import { interviewService } from '@/features/interview/services/interview.service'
import type { Interview } from '@/features/interview/types/interview.dto'

vi.mock('@/features/interview/services/interview.service', () => ({
  interviewService: {
    getInterviews:    vi.fn(),
    getMyInterviews:  vi.fn(),
    scheduleInterview: vi.fn(),
    updateStatus:     vi.fn(),
  },
}))

// ── Fixture ───────────────────────────────────────────────────────────────────

function makeInterview(overrides: Partial<Interview> = {}): Interview {
  return {
    id:             'iv-1',
    applicationId:  'app-1',
    jobId:          'job-1',
    scheduledAt:    '2026-06-01T10:00:00Z',
    location:       'Room 3B',
    meetingLink:    null,
    interviewerIds: ['user-1'],
    status:         'SCHEDULED',
    notes:          null,
    createdBy:      'hr-user',
    createdAt:      '2026-01-01T00:00:00Z',
    updatedAt:      '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ── Initial state ─────────────────────────────────────────────────────────────

describe('useInterviewStore — initial state', () => {
  it('starts with empty interviews and no error', () => {
    const store = useInterviewStore()
    expect(store.interviews).toEqual([])
    expect(store.myInterviews).toEqual([])
    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('scheduledInterviews computed is empty on init', () => {
    const store = useInterviewStore()
    expect(store.scheduledInterviews).toEqual([])
  })
})

// ── fetchInterviews ───────────────────────────────────────────────────────────

describe('useInterviewStore — fetchInterviews', () => {
  it('sets isLoading during fetch and populates interviews', async () => {
    const iv = makeInterview()
    vi.mocked(interviewService.getInterviews).mockResolvedValueOnce([iv])
    const store = useInterviewStore()

    const p = store.fetchInterviews({ applicationId: 'app-1' })
    expect(store.isLoading).toBe(true)
    await p
    expect(store.isLoading).toBe(false)
    expect(store.interviews).toHaveLength(1)
    expect(store.scheduledInterviews).toHaveLength(1)
  })

  it('sets error message when fetch fails', async () => {
    vi.mocked(interviewService.getInterviews).mockRejectedValueOnce(new Error('Net fail'))
    const store = useInterviewStore()
    await store.fetchInterviews({ applicationId: 'app-1' })
    expect(store.error).toBe('Net fail')
  })
})

// ── fetchMyInterviews ─────────────────────────────────────────────────────────

describe('useInterviewStore — fetchMyInterviews', () => {
  it('populates myInterviews and updates myScheduled / myCompleted computed', async () => {
    const scheduled  = makeInterview({ id: 'iv-1', status: 'SCHEDULED' })
    const completed  = makeInterview({ id: 'iv-2', status: 'COMPLETED' })
    vi.mocked(interviewService.getMyInterviews).mockResolvedValueOnce([scheduled, completed])
    const store = useInterviewStore()

    await store.fetchMyInterviews()
    expect(store.myScheduled).toHaveLength(1)
    expect(store.myCompleted).toHaveLength(1)
  })
})

// ── scheduleInterview ─────────────────────────────────────────────────────────

describe('useInterviewStore — scheduleInterview', () => {
  it('prepends new interview to the interviews list', async () => {
    const created = makeInterview({ id: 'iv-new' })
    vi.mocked(interviewService.scheduleInterview).mockResolvedValueOnce(created)
    vi.mocked(interviewService.getInterviews).mockResolvedValueOnce([makeInterview()])
    const store = useInterviewStore()
    await store.fetchInterviews({ applicationId: 'app-1' })

    await store.scheduleInterview({
      applicationId: 'app-1', jobId: 'job-1',
      scheduledAt: '2026-08-01T09:00:00Z', interviewerIds: ['u-1'],
    })

    expect(store.interviews[0]!.id).toBe('iv-new')
    expect(store.interviews).toHaveLength(2)
  })

  it('sets error and rethrows on failure', async () => {
    vi.mocked(interviewService.scheduleInterview).mockRejectedValueOnce(new Error('Bad request'))
    const store = useInterviewStore()

    await expect(
      store.scheduleInterview({
        applicationId: 'app-1', jobId: 'job-1',
        scheduledAt: '2026-08-01T09:00:00Z', interviewerIds: ['u-1'],
      }),
    ).rejects.toThrow('Bad request')
    expect(store.error).toBe('Bad request')
  })
})

// ── updateStatus ──────────────────────────────────────────────────────────────

describe('useInterviewStore — updateStatus', () => {
  it('updates the interview in both lists', async () => {
    const iv = makeInterview({ id: 'iv-1', status: 'SCHEDULED' })
    vi.mocked(interviewService.getInterviews).mockResolvedValueOnce([iv])
    vi.mocked(interviewService.getMyInterviews).mockResolvedValueOnce([iv])
    vi.mocked(interviewService.updateStatus).mockResolvedValueOnce({ ...iv, status: 'COMPLETED' })

    const store = useInterviewStore()
    await store.fetchInterviews({ applicationId: 'app-1' })
    await store.fetchMyInterviews()
    await store.updateStatus('iv-1', { status: 'COMPLETED' })

    expect(store.interviews[0]!.status).toBe('COMPLETED')
    expect(store.myInterviews[0]!.status).toBe('COMPLETED')
    expect(store.scheduledInterviews).toHaveLength(0)
    expect(store.completedInterviews).toHaveLength(1)
  })
})
