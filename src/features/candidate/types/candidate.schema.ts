import { z } from 'zod'

export const CandidateUpdateSchema = z.object({
  headline: z.string().optional(),
  summary: z.string().optional(),
  desiredPosition: z.string().optional(),
  desiredPositionLevel: z.string().optional(),
  yearsOfExperience: z.number().int().optional(),
  skills: z.array(z.string()).optional(),
  primaryLanguage: z.string().optional(),
  workType: z.enum(['REMOTE', 'ONSITE', 'HYBRID', 'ANY']).optional(),
  desiredSalaryMin: z.number().int().nullable().optional(),
  desiredSalaryMax: z.number().int().nullable().optional(),
  availableFrom: z.string().optional(),
  educationLevel: z.string().optional(),
  educationMajor: z.string().optional(),
  isOpenToWork: z.boolean().optional(),
})

export const CandidateProfileResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  headline: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  desiredPosition: z.string().nullable().optional(),
  desiredPositionLevel: z.string().nullable().optional(),
  yearsOfExperience: z.number().int().nullable().optional(),
  skills: z.array(z.string()).optional(),
  primaryLanguage: z.string().nullable().optional(),
  workType: z.string().nullable().optional(),
  desiredSalaryMin: z.number().int().nullable().optional(),
  desiredSalaryMax: z.number().int().nullable().optional(),
  availableFrom: z.string().nullable().optional(),
  educationLevel: z.string().nullable().optional(),
  educationMajor: z.string().nullable().optional(),
  isOpenToWork: z.boolean().nullable().optional(),
  defaultCvUrl: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const UserUpdateSchema = z.object({
  fullName: z.string().min(1, 'FullName is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  dob: z.string().optional(),
  gender: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
})

export const UserProfileResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  phone: z.string().nullable().optional(),
  roles: z.array(z.string()).optional(),
  companyId: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  bannerUrl: z.string().nullable().optional(),
  emailVerified: z.boolean().optional(),
  location: z.string().nullable().optional(),
  dob: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  linkedinUrl: z.string().nullable().optional(),
  githubUrl: z.string().nullable().optional(),
  portfolioUrl: z.string().nullable().optional(),
  createdAt: z.string().optional(),
})

export const CvUploadResponseSchema = z.object({
  cvUrl: z.string(),
  cvOriginalFilename: z.string(),
  cvContentType: z.string(),
  cvFileSizeBytes: z.number(),
  cvUploadedAt: z.string(),
})

export type CandidateUpdateRequest = z.infer<typeof CandidateUpdateSchema>
export type CandidateProfileResponse = z.infer<typeof CandidateProfileResponseSchema>
export type UserUpdateRequest = z.infer<typeof UserUpdateSchema>
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>
export type CvUploadResponse = z.infer<typeof CvUploadResponseSchema>
