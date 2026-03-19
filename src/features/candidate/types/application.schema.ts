import { z } from 'zod'

export const ApplicationCreateSchema = z.object({
  jobId: z.string().uuid(),
  coverLetter: z.string().optional()
})

export const ApplicationStatusHistorySchema = z.object({
  id: z.string().uuid(),
  oldStatus: z.string(),
  newStatus: z.string(),
  notes: z.string().nullable().optional(),
  changedByName: z.string().nullable().optional(),
  changedAt: z.string()
})

export const ApplicationSummarySchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  jobTitle: z.string(),
  candidateName: z.string(),
  status: z.string(),
  createdAt: z.string()
})

export const ApplicationResponseSchema = ApplicationSummarySchema.extend({
  candidateId: z.string(),
  appliedCvUrl: z.string().nullable().optional(),
  coverLetter: z.string().nullable().optional(),
  updatedAt: z.string().optional()
})

// Reusing Interview and Offer schemas based on API docs
export const InterviewResponseSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  title: z.string(),
  scheduledAt: z.string(),
  durationMinutes: z.number().int(),
  locationOrLink: z.string(),
  interviewType: z.string(),
  status: z.string(),
  interviewers: z.array(z.string()).optional(),
  createdAt: z.string()
})

export const OfferResponseSchema = z.object({
  id: z.string().uuid(),
  applicationId: z.string().uuid(),
  offerLetterUrl: z.string().nullable().optional(),
  baseSalary: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  status: z.string(),
  createdAt: z.string()
})

export const OfferRespondSchema = z.object({
  action: z.enum(['ACCEPT', 'DECLINE'])
})

export type ApplicationCreateRequest = z.infer<typeof ApplicationCreateSchema>
export type ApplicationSummaryResponse = z.infer<typeof ApplicationSummarySchema>
export type ApplicationResponse = z.infer<typeof ApplicationResponseSchema>
export type ApplicationStatusHistoryResponse = z.infer<typeof ApplicationStatusHistorySchema>
export type InterviewResponse = z.infer<typeof InterviewResponseSchema>
export type OfferResponse = z.infer<typeof OfferResponseSchema>
export type OfferRespondRequest = z.infer<typeof OfferRespondSchema>
