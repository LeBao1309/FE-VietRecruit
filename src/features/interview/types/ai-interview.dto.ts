// src/features/interview/types/ai-interview.dto.ts
// DTOs for AI-generated interview questions (endpoint #16).

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface AiQuestion {
  question: string
  category: string | null
  difficulty: QuestionDifficulty | null
  hint: string | null
}

export interface GenerateInterviewQuestionsRequest {
  jobTitle: string
  candidateProfile?: string
  difficulty?: QuestionDifficulty
}

export interface GenerateInterviewQuestionsResponse {
  questions: AiQuestion[]
}
