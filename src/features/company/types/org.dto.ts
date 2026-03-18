// src/features/company/types/org.dto.ts
import { z } from 'zod'

export const DepartmentRequestSchema = z.object({
  name: z.string().min(1, 'Tên phòng ban không được để trống').max(255, 'Tên quá dài (tối đa 255 ký tự)'),
  description: z.string().optional()
})
export type DepartmentRequest = z.infer<typeof DepartmentRequestSchema>

export interface DepartmentResponse {
  id: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export const LocationRequestSchema = z.object({
  name: z.string().min(1, 'Tên địa điểm không được để trống').max(255, 'Tên quá dài (tối đa 255 ký tự)'),
  address: z.string().optional()
})
export type LocationRequest = z.infer<typeof LocationRequestSchema>

export interface LocationResponse {
  id: string
  name: string
  address?: string
  createdAt?: string
  updatedAt?: string
}

export const CategoryRequestSchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống').max(255, 'Tên quá dài (tối đa 255 ký tự)')
})
export type CategoryRequest = z.infer<typeof CategoryRequestSchema>

export interface CategoryResponse {
  id: string
  name: string
  createdAt?: string
  updatedAt?: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
  numberOfElements: number
}
