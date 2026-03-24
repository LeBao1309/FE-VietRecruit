import { z } from 'zod'

export const KnowledgeDocumentSchema = z.object({
  id: z.string().uuid(),
  filename: z.string(),
  contentType: z.string(),
  fileSize: z.number(),
  status: z.enum(['PROCESSING', 'INDEXED', 'FAILED']),
  uploadedAt: z.string(),
  chunkCount: z.number().optional(),
})
export type KnowledgeDocument = z.infer<typeof KnowledgeDocumentSchema>

export const AdminCompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  domain: z.string().nullable().optional(),
  createdAt: z.string(),
  status: z.enum(['Active', 'Suspended']),
})
export type AdminCompany = z.infer<typeof AdminCompanySchema>

export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  role: z.enum(['SYSTEM_ADMIN', 'COMPANY_ADMIN', 'HR', 'INTERVIEWER', 'CANDIDATE']),
  isBanned: z.boolean(),
})
export type AdminUser = z.infer<typeof AdminUserSchema>

export const GlobalTransactionSchema = z.object({
  id: z.string(), // PayOS ID
  companyId: z.string().uuid(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(['SUCCESS', 'PENDING', 'FAILED']),
  timestamp: z.string(),
})
export type GlobalTransaction = z.infer<typeof GlobalTransactionSchema>
