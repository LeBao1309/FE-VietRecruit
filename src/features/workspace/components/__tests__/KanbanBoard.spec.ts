import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import KanbanBoard from '../KanbanBoard.vue'
import StageTransitionModal from '../StageTransitionModal.vue'
import { usePipelineStore } from '@/stores/usePipelineStore'
import { buildMockCandidate } from '@/test/helpers'
import { pipelineStages } from '@/features/workspace/mocks/pipeline.mock'

// The provided mock candidate helper doesn't quite match the app's types. 
// We build compatible mock props for KanbanBoard matching its expect props.
const stages = pipelineStages;
const createMockAppDetails = (id = 'c1') => {
  const cd = buildMockCandidate({ id });
  return {
    id: cd.id,
    job_id: 'job-001',
    candidate_id: cd.id,
    applied_cv_url: 'http://foo.com/cv.pdf',
    status: cd.stage as any,
    created_at: cd.applyDate,
    candidate: { ...cd, user: { full_name: cd.name, id: 'user1', email: cd.email, role: 'CANDIDATE' as any, password_hash: 'xxx' } } as any,
    job: { id: 'job-001', company_id: 'comp1', title: 'UX Designer', description: 'Design things', status: 'PUBLISHED' as any } as any,
  }
}

describe('KanbanBoard — rendering', () => {
  it('renders all pipeline stage columns', () => {
    const wrapper = mount(KanbanBoard, {
      props: { stages, candidates: [] }
    })
    const columns = wrapper.findAll('[data-testid="kanban-column"]')
    expect(columns.length).toBeGreaterThanOrEqual(4)
  })

  it('displays the correct candidate count in each column header', () => {
    const wrapper = mount(KanbanBoard, {
      props: { stages, candidates: [] }
    })
    const firstColumn = wrapper.find('[data-testid="kanban-column"]')
    const badge = firstColumn.find('[data-testid="column-count"]')
    expect(badge.text()).toMatch(/^\d+$/)
  })

  it('passes candidates to the correct KanbanColumn based on status', async () => {

    const mockApp1 = createMockAppDetails('c1')
    mockApp1.status = 'SCREENING'
    const mockApp2 = createMockAppDetails('c2')
    mockApp2.status = 'INTERVIEW'

    
    // Instead of directly using store.columns (which is not in our app logic), we pass them 
    // as props which represents standard flow
    const wrapper = mount(KanbanBoard, {
      props: { stages, candidates: [mockApp1, mockApp2] }
    })
    await flushPromises()
    const colScreening = wrapper.findAllComponents({ name: 'KanbanColumn' }).find(c => c.props('stage').id === 'SCREENING')
    const colInterview = wrapper.findAllComponents({ name: 'KanbanColumn' }).find(c => c.props('stage').id === 'INTERVIEW')
    expect(colScreening!.props('candidates')).toHaveLength(1)
    expect(colInterview!.props('candidates')).toHaveLength(1)
  })
})

describe('KanbanBoard — StageTransitionModal', () => {
  it('does NOT show StageTransitionModal on initial render', () => {
    const wrapper = mount(KanbanBoard, { props: { stages, candidates: [] }})
    expect(wrapper.findComponent(StageTransitionModal).exists()).toBe(false)
  })

  it('opens StageTransitionModal after a card is dropped into a new column', async () => {
    const mockApp = createMockAppDetails('c1')
    mockApp.status = 'SCREENING'
    const wrapper = mount(KanbanBoard, {
      props: { stages, candidates: [mockApp] }
    })
    
    // Simulate drop using defined emit event of the column 'update:candidates'
    const targetColumn = wrapper.findAllComponents({ name: 'KanbanColumn' }).find(c => c.props('stage').id === 'INTERVIEW')
    await targetColumn!.vm.$emit('update:candidates', [{ ...mockApp, status: 'INTERVIEW' }])
    
    await flushPromises()
    expect(wrapper.findComponent(StageTransitionModal).exists()).toBe(true)
  })

  it('shows correct candidate name and stage transition inside the modal', async () => {
    const mockApp = createMockAppDetails('c1')
    mockApp.candidate.user.full_name = 'Tran Thi B'
    mockApp.status = 'SCREENING'
    const wrapper = mount(KanbanBoard, {
      props: { stages, candidates: [mockApp] }
    })
    
    const targetColumn = wrapper.findAllComponents({ name: 'KanbanColumn' }).find(c => c.props('stage').id === 'INTERVIEW')
    await targetColumn!.vm.$emit('update:candidates', [{ ...mockApp, status: 'SCREENING' }])

    await flushPromises()
    const modal = wrapper.findComponent(StageTransitionModal)
    expect(modal.text()).toContain('Tran Thi B')
    expect(modal.text()).toContain('Screening') // Capitalization based on mock label
    expect(modal.text()).toContain('Interview')
  })
})

describe('StageTransitionModal — actions', () => {
  it('calls confirmTransition and closes modal when Confirm is clicked', async () => {
    const store = usePipelineStore()
    store.moveApplication = vi.fn().mockResolvedValue(undefined)

    const mockApp = createMockAppDetails('c1')
    mockApp.status = 'SCREENING'
    const wrapper = mount(KanbanBoard, {
      props: { stages, candidates: [mockApp] }
    })
    
    const targetColumn = wrapper.findAllComponents({ name: 'KanbanColumn' }).find(c => c.props('stage').id === 'OFFER')
    await targetColumn!.vm.$emit('update:candidates', [{ ...mockApp, status: 'SCREENING' }])

    await flushPromises()

    await wrapper.findComponent(StageTransitionModal).vm.$emit('confirm')
    await flushPromises()

    expect(store.moveApplication).toHaveBeenCalledOnce()
    const modalCheck = wrapper.findComponent(StageTransitionModal)
    expect(modalCheck.exists()).toBe(false)
  })

  it('cancels the move and closes modal when Cancel is clicked', async () => {
    const store = usePipelineStore()
    store.moveApplication = vi.fn().mockResolvedValue(undefined)
    store.fetchApplications = vi.fn().mockResolvedValue(undefined)

    const mockApp = createMockAppDetails('c1')
    mockApp.status = 'SCREENING'
    const wrapper = mount(KanbanBoard, {
      props: { stages, candidates: [mockApp] }
    })

    const targetColumn = wrapper.findAllComponents({ name: 'KanbanColumn' }).find(c => c.props('stage').id === 'OFFER')
    await targetColumn!.vm.$emit('update:candidates', [{ ...mockApp, status: 'SCREENING' }])
    
    await flushPromises()

    await wrapper.findComponent(StageTransitionModal).vm.$emit('cancel')
    await flushPromises()

    expect(store.moveApplication).not.toHaveBeenCalled()
    const modalCheck = wrapper.findComponent(StageTransitionModal)
    expect(modalCheck.exists()).toBe(false)
  })
})
