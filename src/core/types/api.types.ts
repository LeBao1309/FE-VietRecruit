// src/core/types/api.types.ts
// Shared API response envelope — matches backend ApiResponse<T>
import { z } from 'zod'

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success:   z.boolean(),
    code:      z.string().optional(),
    message:   z.string(),
    data:      dataSchema,
    timestamp: z.string().optional(),
  })

export type ApiResponse<T> = {
  success:    boolean
  code?:      string
  message:    string
  data:       T
  timestamp?: string
}
