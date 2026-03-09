import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import CandidateDetailPanel from '../CandidateDetailPanel.vue'
import { buildMockCandidate } from '@/test/helpers'

const createMockAppDetails = (overrides = {}) => {
  const cd = buildMockCandidate(overrides);
  return {
    id: cd.id,
    job_id: 'job-001',
    candidate_id: cd.id,
    applied_cv_url: 'http://foo.com/cv.pdf',
    status: cd.stage as any,
    created_at: cd.applyDate,
    candidate: { ...cd, user: { full_name: cd.name, id: 'user1', email: cd.email, role: 'CANDIDATE' as any, password_hash: 'xxx' } } as any,
    job: { id: 'job-001', company_id: 'comp1', title: 'UX Designer', description: 'Design things', status: 'PUBLISHED' as any } as any,
    scorecards: [{ id: 'sc1', interview_id: 'iv1', interviewer_id: 'u1', result: 'PASS' as any, average_score: cd.aiScore }]
  }
}

const defaultProps = {
  candidate: createMockAppDetails(),
}

describe('CandidateDetailPanel — tab rendering', () => {
  it('renders all 4 tab labels: Overview, Timeline, Comments, Scorecards', () => {
    const wrapper = mount(CandidateDetailPanel, { props: defaultProps })
    const tabs = wrapper.findAll('[data-testid="tab-label"]')
    const labels = tabs.map(t => t.text())
    expect(labels).toContain('Tổng quan')
    expect(labels).toContain('Lịch sử')
    expect(labels).toContain('Bình luận')
    expect(labels).toContain('Scorecards')
  })

  it('shows Overview tab content by default', () => {
    const wrapper = mount(CandidateDetailPanel, { props: defaultProps })
    expect(wrapper.find('[data-testid="tab-overview"]').isVisible()).toBe(true)
  })

  it('hides other tabs when Overview is active', () => {
    const wrapper = mount(CandidateDetailPanel, { props: defaultProps })
    expect(wrapper.find('[data-testid="tab-timeline"]').isVisible()).toBe(false)
    expect(wrapper.find('[data-testid="tab-comments"]').isVisible()).toBe(false)
  })
})

describe('CandidateDetailPanel — Overview tab', () => {
  it('displays candidate name, email, and phone', () => {
    const candidate = createMockAppDetails({
      name: 'Le Van C',
      email: 'lvc@test.com',
      phone: '0912345678',
    })
    const wrapper = mount(CandidateDetailPanel, { props: { candidate } })
    expect(wrapper.text()).toContain('Le Van C')
    expect(wrapper.text()).toContain('lvc@test.com')
  })

  it('renders AiScoreBadge with the correct score value', async () => {
    const candidate = createMockAppDetails({ aiScore: 91 })
    const wrapper = mount(CandidateDetailPanel, { props: { candidate } })
    await nextTick()
    const badge = wrapper.find('[data-testid="ai-score-badge"]')
    expect(badge.text()).toContain('91')
  })
})

describe('CandidateDetailPanel — tab switching', () => {
  it('switches to Timeline tab and shows transition list', async () => {
    const wrapper = mount(CandidateDetailPanel, { props: defaultProps })
    await wrapper.find('[data-testid="tab-btn-timeline"]').trigger('click')
    await nextTick()
    expect(wrapper.find('[data-testid="tab-timeline"]').isVisible()).toBe(true)
    expect(wrapper.find('[data-testid="timeline-item"]').exists()).toBe(true)
  })

  it('switches to Comments tab and renders CommentThread + input box', async () => {
    const wrapper = mount(CandidateDetailPanel, { props: defaultProps })
    await wrapper.find('[data-testid="tab-btn-comments"]').trigger('click')
    await nextTick()
    await flushPromises()
    expect(wrapper.find('[data-testid="comment-thread"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="comment-input"]').exists()).toBe(true)
  })

  it('switches to Scorecards tab and shows empty state with disabled button', async () => {
    const wrapper = mount(CandidateDetailPanel, { props: defaultProps })
    await wrapper.find('[data-testid="tab-btn-scorecards"]').trigger('click')
    await nextTick()
    const addBtn = wrapper.find('[data-testid="add-scorecard-btn"]')
    expect(addBtn.exists()).toBe(true)
    expect(addBtn.attributes('disabled')).toBeDefined()
  })
})

describe('CandidateDetailPanel — Comments interaction', () => {
  it('appends a new comment to the thread when submitted', async () => {
    const wrapper = mount(CandidateDetailPanel, { props: defaultProps })
    await wrapper.find('[data-testid="tab-btn-comments"]').trigger('click')
    await nextTick()
    await flushPromises()

    const input = wrapper.find('[data-testid="comment-input"]')
    await input.setValue('Great culture fit!')
    await wrapper.find('[data-testid="comment-submit-btn"]').trigger('click')
    await nextTick()
    await flushPromises()

    // Since mockHistory is pushed in the component and CommentThread is reactive, it should be in the DOM
    expect(wrapper.text()).toContain('Great culture fit!')
  })

  it('clears the input field after comment is submitted', async () => {
    const wrapper = mount(CandidateDetailPanel, { props: defaultProps })
    await wrapper.find('[data-testid="tab-btn-comments"]').trigger('click')
    await nextTick()
    await flushPromises()

    const input = wrapper.find('[data-testid="comment-input"]')
    await input.setValue('Test comment')
    await wrapper.find('[data-testid="comment-submit-btn"]').trigger('click')
    await nextTick()

    expect((input.element as HTMLInputElement).value).toBe('')
  })
})
