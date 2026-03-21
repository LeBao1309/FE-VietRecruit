// src/features/interview/stores/__tests__/useScorecardStore.spec.ts
// Unit tests for useScorecardStore.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useScorecardStore } from '@/features/interview/stores/useScorecardStore'
import { scorecardService } from '@/features/interview/services/scorecard.service'
import type { Scorecard, ScorecardSummaryResponse } from '@/features/interview/types/interview.dto'

vi.mock('@/features/interview/services/scorecard.service', () => ({
  scorecardService: {
    getScorecardSummary: vi.fn(),
    submitScorecard:     vi.fn(),
  },
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockScorecard: Scorecard = {
  id:            'sc-1',
  interviewId:   'iv-1',
  applicationId: 'app-1',
  reviewerId:    'user-1',
  skillScore:    8,
  attitudeScore: 7,
  englishScore:  9,
  averageScore:  8.0,
  overallNote:   'Strong candidate',
  result:        'PASS',
  createdAt:     '2026-06-02T00:00:00Z',
}

const mockSummary: ScorecardSummaryResponse = {
  interviewId:     'iv-1',
  scorecards:      [mockScorecard],
  totalReviewers:  1,
  averageSkill:    8,
  averageAttitude: 7,
  averageEnglish:  9,
  averageOverall:  8.0,
  resultBreakdown: { PASS: 1, FAIL: 0, CONSIDERING: 0 },
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// ── Initial state ─────────────────────────────────────────────────────────────

describe('useScorecardStore — initial state', () => {
  it('starts with null summary, no error, not submitting', () => {
    const store = useScorecardStore()
    expect(store.summary).toBeNull()
    expect(store.isLoading).toBe(false)
    expect(store.isSubmitting).toBe(false)
    expect(store.error).toBeNull()
    expect(store.submitSuccess).toBe(false)
  })
})

// ── fetchSummary ──────────────────────────────────────────────────────────────

describe('useScorecardStore — fetchSummary', () => {
  it('sets isLoading during fetch and populates summary', async () => {
    vi.mocked(scorecardService.getScorecardSummary).mockResolvedValueOnce(mockSummary)
    const store = useScorecardStore()

    const p = store.fetchSummary('iv-1')
    expect(store.isLoading).toBe(true)
    await p
    expect(store.isLoading).toBe(false)
    expect(store.summary).toEqual(mockSummary)
    expect(store.summary!.totalReviewers).toBe(1)
  })

  it('sets error when fetch fails', async () => {
    vi.mocked(scorecardService.getScorecardSummary).mockRejectedValueOnce(new Error('Not found'))
    const store = useScorecardStore()
    await store.fetchSummary('iv-bad')
    expect(store.error).toBe('Not found')
    expect(store.summary).toBeNull()
  })

  it('resets summary to null at start of each fetch', async () => {
    vi.mocked(scorecardService.getScorecardSummary)
      .mockResolvedValueOnce(mockSummary)
      .mockResolvedValueOnce({ ...mockSummary, totalReviewers: 2 })
    const store = useScorecardStore()

    await store.fetchSummary('iv-1')
    expect(store.summary!.totalReviewers).toBe(1)

    await store.fetchSummary('iv-1')
    expect(store.summary!.totalReviewers).toBe(2)
  })
})

// ── submitScorecard ───────────────────────────────────────────────────────────

describe('useScorecardStore — submitScorecard', () => {
  it('sets submitSuccess to true after successful submission', async () => {
    vi.mocked(scorecardService.submitScorecard).mockResolvedValueOnce(mockScorecard)
    const store = useScorecardStore()

    const result = await store.submitScorecard('iv-1', {
      skillScore:    8,
      attitudeScore: 7,
      englishScore:  9,
      result:        'PASS',
    })

    expect(result.id).toBe('sc-1')
    expect(store.submitSuccess).toBe(true)
    expect(store.isSubmitting).toBe(false)
  })

  it('sets error and rethrows on submission failure', async () => {
    vi.mocked(scorecardService.submitScorecard).mockRejectedValueOnce(
      new Error('Already submitted'),
    )
    const store = useScorecardStore()

    await expect(
      store.submitScorecard('iv-1', {
        skillScore:    5,
        attitudeScore: 5,
        englishScore:  5,
        result:        'FAIL',
      }),
    ).rejects.toThrow('Already submitted')
    expect(store.error).toBe('Already submitted')
    expect(store.submitSuccess).toBe(false)
  })

  it('resetSubmitState clears submitSuccess and error', async () => {
    vi.mocked(scorecardService.submitScorecard).mockResolvedValueOnce(mockScorecard)
    const store = useScorecardStore()

    await store.submitScorecard('iv-1', {
      skillScore: 8, attitudeScore: 7, englishScore: 9, result: 'PASS',
    })
    expect(store.submitSuccess).toBe(true)

    store.resetSubmitState()
    expect(store.submitSuccess).toBe(false)
    expect(store.error).toBeNull()
  })
})
