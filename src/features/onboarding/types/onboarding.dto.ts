// src/features/onboarding/types/onboarding.dto.ts
import { z } from 'zod'

// ─── Shared constants (mapped from SQL constraints) ───────────

// ─────────────────────────────────────────────────────────────
// COMPANY UPDATE
// PUT /vietrecruit/companies/me
// Fields: name(max:255), domain(max:255), website(max:255)
// ─────────────────────────────────────────────────────────────

export const CompanyUpdateRequestSchema = z.object({
  name: z
    .string({ message: 'Tên công ty không được để trống' })
    .min(1, 'Tên công ty không được để trống')
    .max(255, 'Tên công ty không được vượt quá 255 ký tự'),
  domain: z
    .string()
    .max(255, 'Lĩnh vực không được vượt quá 255 ký tự')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .max(255, 'Website không được vượt quá 255 ký tự')
    .optional()
    .or(z.literal('')),
})
export type CompanyUpdateRequest = z.infer<typeof CompanyUpdateRequestSchema>

export const CompanyResponseSchema = z.object({
  id:        z.string().uuid(),
  name:      z.string(),
  domain:    z.string().nullable().optional(),
  website:   z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type CompanyResponse = z.infer<typeof CompanyResponseSchema>

// ─────────────────────────────────────────────────────────────
// CANDIDATE UPDATE
// PUT /vietrecruit/candidates/me
// ─────────────────────────────────────────────────────────────

export const WorkTypeEnum = z.enum(['REMOTE', 'ONSITE', 'HYBRID'])
export type WorkType = z.infer<typeof WorkTypeEnum>

export const CandidateUpdateRequestSchema = z.object({
  headline: z
    .string()
    .max(255, 'Headline không được vượt quá 255 ký tự')
    .optional()
    .or(z.literal('')),
  summary: z
    .string()
    .optional()
    .or(z.literal('')),
  desiredPosition: z
    .string()
    .max(100, 'Vị trí mong muốn không được vượt quá 100 ký tự')
    .optional()
    .or(z.literal('')),
  desiredPositionLevel: z
    .string()
    .max(50, 'Cấp bậc không được vượt quá 50 ký tự')
    .optional()
    .or(z.literal('')),
  yearsOfExperience: z
    .number()
    .int('Số năm kinh nghiệm phải là số nguyên')
    .min(0, 'Số năm kinh nghiệm không được âm')
    .max(50, 'Số năm kinh nghiệm không được vượt quá 50')
    .optional(),
  skills: z
    .array(z.string())
    .optional(),
  primaryLanguage: z
    .string()
    .max(50, 'Ngôn ngữ chính không được vượt quá 50 ký tự')
    .optional()
    .or(z.literal('')),
  workType: WorkTypeEnum.optional(),
  desiredSalaryMin: z
    .number()
    .int()
    .min(0, 'Mức lương không được âm')
    .optional(),
  desiredSalaryMax: z
    .number()
    .int()
    .min(0, 'Mức lương không được âm')
    .optional(),
  availableFrom: z
    .string()
    .optional()
    .or(z.literal('')),
  educationLevel: z
    .string()
    .max(50, 'Trình độ học vấn không được vượt quá 50 ký tự')
    .optional()
    .or(z.literal('')),
  educationMajor: z
    .string()
    .max(100, 'Chuyên ngành không được vượt quá 100 ký tự')
    .optional()
    .or(z.literal('')),
  isOpenToWork: z
    .boolean()
    .optional(),
})
export type CandidateUpdateRequest = z.infer<typeof CandidateUpdateRequestSchema>

export const CandidateProfileResponseSchema = z.object({
  id:                   z.string().uuid(),
  userId:               z.string().uuid(),
  headline:             z.string().nullable().optional(),
  summary:              z.string().nullable().optional(),
  defaultCvUrl:         z.string().nullable().optional(),
  cvOriginalFilename:   z.string().nullable().optional(),
  cvContentType:        z.string().nullable().optional(),
  cvFileSizeBytes:      z.number().nullable().optional(),
  cvUploadedAt:         z.string().nullable().optional(),
  desiredPosition:      z.string().nullable().optional(),
  desiredPositionLevel: z.string().nullable().optional(),
  yearsOfExperience:    z.number().nullable().optional(),
  skills:               z.array(z.string()).nullable().optional(),
  primaryLanguage:      z.string().nullable().optional(),
  workType:             z.string().nullable().optional(),
  desiredSalaryMin:     z.number().nullable().optional(),
  desiredSalaryMax:     z.number().nullable().optional(),
  availableFrom:        z.string().nullable().optional(),
  educationLevel:       z.string().nullable().optional(),
  educationMajor:       z.string().nullable().optional(),
  isOpenToWork:         z.boolean().nullable().optional(),
  createdAt:            z.string(),
  updatedAt:            z.string(),
})
export type CandidateProfileResponse = z.infer<typeof CandidateProfileResponseSchema>
