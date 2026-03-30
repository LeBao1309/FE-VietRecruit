import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { InterviewStatus } from '@/types/enums'
import type {
  InterviewCreateRequest,
  InterviewResponse,
  ScorecardCreateRequest,
  ScorecardResponse,
} from '@/types/application'
import type { InterviewQuestionResponse } from '@/types/ai'
import { interviewService } from '@/services/interviewService'
import { useUiStore } from './uiStore'

export const useInterviewStore = defineStore('interview', () => {
  // ── State ──────────────────────────────────────────────────────────
  const interviews = ref<InterviewResponse[]>([])
  const currentInterview = ref<InterviewResponse | null>(null)
  const scorecards = ref<ScorecardResponse[]>([])
  const aiQuestions = ref<InterviewQuestionResponse | null>(null)

  const listLoading = ref(false)
  const detailLoading = ref(false)
  const createLoading = ref(false)
  const statusLoading = ref(false)
  const scorecardsLoading = ref(false)
  const submitScorecardLoading = ref(false)
  const questionsLoading = ref(false)
  const generateQuestionsLoading = ref(false)

  // ── Getters ────────────────────────────────────────────────────────
  const interviewCount = computed(() => interviews.value.length)

  const isScheduled = computed(() => currentInterview.value?.status === 'SCHEDULED')
  const isCompleted = computed(() => currentInterview.value?.status === 'COMPLETED')
  const isCanceled = computed(() => currentInterview.value?.status === 'CANCELED')

  /** Only SCHEDULED interviews can be transitioned */
  const canComplete = computed(() => isScheduled.value)
  const canCancel = computed(() => isScheduled.value)

  const averageScore = computed(() => {
    if (scorecards.value.length === 0) return null
    const total = scorecards.value.reduce((sum, sc) => sum + sc.averageScore, 0)
    return Math.round((total / scorecards.value.length) * 10) / 10
  })

  /** Per-dimension averages for radar chart */
  const avgSkill = computed(() => {
    if (scorecards.value.length === 0) return 0
    return Math.round((scorecards.value.reduce((s, sc) => s + sc.skillScore, 0) / scorecards.value.length) * 10) / 10
  })
  const avgAttitude = computed(() => {
    if (scorecards.value.length === 0) return 0
    return Math.round((scorecards.value.reduce((s, sc) => s + sc.attitudeScore, 0) / scorecards.value.length) * 10) / 10
  })
  const avgEnglish = computed(() => {
    if (scorecards.value.length === 0) return 0
    return Math.round((scorecards.value.reduce((s, sc) => s + sc.englishScore, 0) / scorecards.value.length) * 10) / 10
  })

  /** Result distribution */
  const resultCounts = computed(() => {
    const counts = { PASS: 0, FAIL: 0, CONSIDERING: 0 }
    for (const sc of scorecards.value) {
      if (counts[sc.result] !== undefined) counts[sc.result]++
    }
    return counts
  })

  // ── Actions ────────────────────────────────────────────────────────

  /** List all interviews for an application */
  async function fetchInterviews(applicationId: string): Promise<void> {
    listLoading.value = true
    try {
      const result = await interviewService.listInterviews(applicationId)
      if (result.data) {
        interviews.value = result.data
      } else {
        const ui = useUiStore()
        ui.toastError('Failed to load interviews', result.error?.message)
        interviews.value = []
      }
    } finally {
      listLoading.value = false
    }
  }

  /** Get a single interview */
  async function fetchInterview(id: string): Promise<boolean> {
    detailLoading.value = true
    try {
      const result = await interviewService.getInterview(id)
      if (result.data) {
        currentInterview.value = result.data
        return true
      }
      const ui = useUiStore()
      ui.toastError('Interview not found', result.error?.message)
      return false
    } finally {
      detailLoading.value = false
    }
  }

  /** Schedule a new interview for an application */
  async function scheduleInterview(
    applicationId: string,
    body: InterviewCreateRequest,
  ): Promise<boolean> {
    const ui = useUiStore()
    createLoading.value = true
    try {
      const result = await interviewService.scheduleInterview(applicationId, body)
      if (result.data) {
        interviews.value.unshift(result.data)
        ui.toastSuccess('Interview scheduled', `"${result.data.title}" has been scheduled.`)
        return true
      }
      ui.toastError('Failed to schedule', result.error?.message)
      return false
    } finally {
      createLoading.value = false
    }
  }

  /** Mark interview as COMPLETED or CANCELED */
  async function updateStatus(
    id: string,
    status: InterviewStatus,
  ): Promise<boolean> {
    const ui = useUiStore()
    statusLoading.value = true
    try {
      const result = await interviewService.updateInterviewStatus(id, { status })
      if (result.data) {
        currentInterview.value = result.data
        // Also update in list
        const idx = interviews.value.findIndex((i) => i.id === id)
        if (idx !== -1) {
          interviews.value[idx] = result.data
        }
        const label = status === 'COMPLETED' ? 'completed' : 'canceled'
        ui.toastSuccess(`Interview ${label}`, `The interview has been marked as ${label}.`)
        return true
      }
      ui.toastError('Status update failed', result.error?.message)
      return false
    } finally {
      statusLoading.value = false
    }
  }

  // ── Scorecards ──

  /** Fetch scorecards for an interview */
  async function fetchScorecards(interviewId: string): Promise<void> {
    scorecardsLoading.value = true
    try {
      const result = await interviewService.listScorecards(interviewId)
      if (result.data) {
        scorecards.value = result.data
      } else {
        scorecards.value = []
      }
    } finally {
      scorecardsLoading.value = false
    }
  }

  /** Submit a scorecard for an interview (INTERVIEWER) */
  async function submitScorecard(
    interviewId: string,
    body: ScorecardCreateRequest,
  ): Promise<boolean> {
    const ui = useUiStore()
    submitScorecardLoading.value = true
    try {
      const result = await interviewService.submitScorecard(interviewId, body)
      if (result.data) {
        scorecards.value.push(result.data)
        ui.toastSuccess('Scorecard submitted', 'Your evaluation has been recorded.')
        return true
      }
      ui.toastError('Submission failed', result.error?.message)
      return false
    } finally {
      submitScorecardLoading.value = false
    }
  }

  // ── AI Questions ──

  /** Generate AI-powered interview questions */
  async function generateQuestions(interviewId: string): Promise<boolean> {
    const ui = useUiStore()
    generateQuestionsLoading.value = true
    try {
      const result = await interviewService.generateQuestions(interviewId)
      if (result.data) {
        aiQuestions.value = result.data
        ui.toastSuccess('Questions generated', 'AI interview questions are ready.')
        return true
      }
      ui.toastError('Generation failed', result.error?.message)
      return false
    } finally {
      generateQuestionsLoading.value = false
    }
  }

  /** Fetch previously generated questions */
  async function fetchQuestions(interviewId: string): Promise<void> {
    questionsLoading.value = true
    try {
      const result = await interviewService.getQuestions(interviewId)
      if (result.data) {
        aiQuestions.value = result.data
      } else {
        aiQuestions.value = null
      }
    } finally {
      questionsLoading.value = false
    }
  }

  /** Clear detail state */
  function clearCurrent(): void {
    currentInterview.value = null
    scorecards.value = []
    aiQuestions.value = null
  }

  return {
    // state
    interviews,
    currentInterview,
    scorecards,
    aiQuestions,
    listLoading,
    detailLoading,
    createLoading,
    statusLoading,
    scorecardsLoading,
    submitScorecardLoading,
    questionsLoading,
    generateQuestionsLoading,
    // getters
    interviewCount,
    isScheduled,
    isCompleted,
    isCanceled,
    canComplete,
    canCancel,
    averageScore,
    avgSkill,
    avgAttitude,
    avgEnglish,
    resultCounts,
    // actions
    fetchInterviews,
    fetchInterview,
    scheduleInterview,
    updateStatus,
    fetchScorecards,
    submitScorecard,
    generateQuestions,
    fetchQuestions,
    clearCurrent,
  }
})
