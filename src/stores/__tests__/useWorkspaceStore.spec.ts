import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWorkspaceStore } from '../useWorkspaceStore'

beforeEach(() => setActivePinia(createPinia()))

describe('useWorkspaceStore — initial state', () => {
  // Adapted from original test request
  it('exposes statsCards (pipelineFunnel, recentJobs, todayInterviews)', () => {
    const store = useWorkspaceStore()
    expect(store.pipelineFunnel).toBeDefined()
    expect(store.recentJobs).toBeDefined()
    expect(store.todayInterviews).toBeDefined()
    expect(store.applications).toBeDefined()
  })

  it('starts with isLoading = false', () => {
    const store = useWorkspaceStore()
    expect(store.isLoading).toBe(false)
  })

  it('pipelineFunnel is an array computation', () => {
    const store = useWorkspaceStore()
    expect(Array.isArray(store.pipelineFunnel)).toBe(true)
    expect(store.pipelineFunnel.length).toBeGreaterThan(0)
  })
})

describe('useWorkspaceStore — fetchDashboard', () => {
  it('sets isLoading to true during fetch then false after', async () => {
    const store = useWorkspaceStore()
    const fetchPromise = store.fetchWorkspaceData()
    expect(store.isLoading).toBe(true)
    await fetchPromise
    expect(store.isLoading).toBe(false)
  })

  it('populates pipelineFunnel with stage name and count after fetch', async () => {
    const store = useWorkspaceStore()
    await store.fetchWorkspaceData()
    expect(store.pipelineFunnel[0]).toHaveProperty('id')
    expect(store.pipelineFunnel[0]).toHaveProperty('count')
  })

  it('recentJobs contains valid job objects after fetch', async () => {
    const store = useWorkspaceStore()
    await store.fetchWorkspaceData()
    const job = store.recentJobs[0]
    expect(job).toHaveProperty('id')
    expect(job).toHaveProperty('title')
    expect(job).toHaveProperty('status')
  })
})

describe('useWorkspaceStore — reactivity', () => {
  it('reflects updated applications count physically when store is mutated directly', () => {
    const store = useWorkspaceStore()
    const indexStr = store.pipelineFunnel.findIndex(f => f.id === 'SCREENING');
    const originalCount = store.pipelineFunnel[indexStr]!.count
    
    // directly inject mock app to applications list affecting funnel
    store.applications.push({ status: 'SCREENING' } as any)
    
    expect(store.pipelineFunnel[indexStr]!.count).toBe(originalCount + 1)
  })
})
