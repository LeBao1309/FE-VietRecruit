// ── AI Feature Types ─────────────────────────────────────────────────

// ── JD Generator ─────────────────────────────────────────────────────
export interface GeneratedJobDescription {
  overview: string
  responsibilities: string[]
  requirements: string[]
  niceToHave: string[]
  benefits: string
}

export interface JdGenerateRequest {
  title: string
  departmentId?: string
  employmentType: string
  keyResponsibilities: string[]
  requiredSkills: string[]
  niceToHaveSkills?: string[]
  yearsOfExperience?: number
  tone: 'PROFESSIONAL' | 'STARTUP' | 'CORPORATE'
}

export interface JdGenerateResponse {
  title: string
  generatedDescription: GeneratedJobDescription
  biasFlags: string[]
  generatedAt: string
}

export interface ApplyDescriptionRequest {
  generatedDescription: GeneratedJobDescription
}

// ── Salary Benchmark ─────────────────────────────────────────────────
export interface SalaryRange {
  min: number
  median: number
  max: number
}

export interface SalaryBenchmarkResponse {
  jobTitle: string
  location: string | null
  experienceLevel: string | null
  currency: string | null
  range: SalaryRange
  marketPosition: string | null
  dataPoints: number | null
  insights: string[]
  disclaimer: string | null
  generatedAt: string
}

// ── CV Improvement ───────────────────────────────────────────────────
export interface CvImprovementResponse {
  overallScore: number
  suggestions: CvSuggestion[]
  strengths: string[]
  analysedAt: string
}

export interface CvSuggestion {
  priority: string
  section: string
  issue: string
  suggestion: string
  source: string
}

// ── Interview Questions ──────────────────────────────────────────────
export interface InterviewQuestionResponse {
  interviewId: string
  jobTitle: string
  candidateName: string
  generatedAt: string
  questions: InterviewQuestion[]
  source: string
}

export interface InterviewQuestion {
  category: string
  question: string
  intent: string
  difficulty: string
}
