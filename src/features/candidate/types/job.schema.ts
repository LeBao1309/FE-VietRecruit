import { z } from 'zod'

export const JobSummaryResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  companyLogoUrl: z.string().nullable().optional(),
  locationId: z.string().optional(),
  locationName: z.string().optional(),
  departmentId: z.string().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  status: z.string(),
  minSalary: z.number().nullable().optional(),
  maxSalary: z.number().nullable().optional(),
  currency: z.string().nullable().optional(),
  isNegotiable: z.boolean(),
  deadline: z.string().nullable().optional(),
  createdAt: z.string(),
})

export const JobResponseSchema = JobSummaryResponseSchema.extend({
  description: z.string().nullable().optional(),
  requirements: z.string().nullable().optional(),
  benefits: z.string().nullable().optional(),
  workingHours: z.string().nullable().optional(),
  workingOptions: z.string().nullable().optional(),
  numOfVacancies: z.number().int().optional(),
  experienceLevel: z.string().nullable().optional(),
  publicLink: z.string().nullable().optional()
})

export const JobSearchParamsSchema = z.object({
  keyword: z.string().optional(),
  categoryId: z.string().optional(),
  locationId: z.string().optional(),
  page: z.number().int().min(0).optional(),
  size: z.number().int().min(1).optional(),
  sort: z.array(z.string()).optional()
})

export type JobSummaryResponse = z.infer<typeof JobSummaryResponseSchema>
export type JobResponse = z.infer<typeof JobResponseSchema>
export type JobSearchParams = z.infer<typeof JobSearchParamsSchema>
