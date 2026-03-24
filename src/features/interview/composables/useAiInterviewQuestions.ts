// src/features/interview/composables/useAiInterviewQuestions.ts
// Wraps AI interview question generation with loading/error state.
// Caller can retry by invoking generate() again after an error.

import { ref } from 'vue'
import { aiInterviewService } from '@/features/interview/services/ai-interview.service'
import { getErrorMessage } from '@/core/utils/error'
import type { AiQuestion, QuestionDifficulty } from '@/features/interview/types/ai-interview.dto'

export function useAiInterviewQuestions() {
  const questions = ref<AiQuestion[] | null>(null)
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  async function generate(context: {
    jobTitle: string
    candidateProfile?: string
    difficulty?: QuestionDifficulty
  }): Promise<void> {
    isGenerating.value = true
    error.value = null
    try {
      const data = await aiInterviewService.generateQuestions(context)
      questions.value = data.questions
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      isGenerating.value = false
    }
  }

  function reset(): void {
    questions.value = null
    error.value = null
  }

  return { questions, isGenerating, error, generate, reset }
}
