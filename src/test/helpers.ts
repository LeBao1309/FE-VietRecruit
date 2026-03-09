import { flushPromises } from '@vue/test-utils'

/** Simulate the fake 600ms store delay in tests without actually waiting */
export async function resolveStoreLoading() {
  await flushPromises()
}

/** Build a minimal mock candidate for reuse across tests */
export function buildMockCandidate(overrides = {}) {
  return {
    id: 'cand-001',
    name: 'Nguyen Van A',
    email: 'nva@example.com',
    phone: '0901234567',
    stage: 'SCREENING',
    aiScore: 82,
    applyDate: '2026-03-01',
    ...overrides,
  }
}

/** Build a minimal mock job */
export function buildMockJob(overrides = {}) {
  return {
    id: 'job-001',
    title: 'Frontend Engineer',
    department: 'Engineering',
    location: 'Ho Chi Minh City',
    status: 'OPEN',
    applicantCount: 14,
    deadline: '2026-04-01',
    ...overrides,
  }
}
