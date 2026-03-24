// src/features/job/schemas/job.schema.ts
// Zod validation schema for the Create Job form.
// Follows the project convention in src/core/types/api.types.ts (z.object style).

import { z } from 'zod'

export const createJobSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters.')
      .max(200, 'Title must not exceed 200 characters.'),

    description: z
      .string()
      .min(10, 'Description must be at least 10 characters.'),

    department_id: z
      .string()
      .min(1, 'Please select a department.'),

    location_id: z
      .string()
      .min(1, 'Please select a location.'),

    category_id: z
      .string()
      .min(1, 'Please select a category.'),

    min_salary: z
      .number({ message: 'Min salary must be a number.' })
      .positive('Min salary must be greater than 0.')
      .optional(),

    max_salary: z
      .number({ message: 'Max salary must be a number.' })
      .positive('Max salary must be greater than 0.')
      .optional(),

    currency: z
      .string()
      .min(1, 'Currency is required.')
      .default('VND'),

    is_negotiable: z.boolean().default(false),

    deadline: z
      .string()
      .min(1, 'Deadline is required.'),

    requirements: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.min_salary !== undefined && data.max_salary !== undefined) {
        return data.max_salary >= data.min_salary
      }
      return true
    },
    {
      message: 'Max salary must be greater than or equal to min salary.',
      path: ['max_salary'],
    },
  )

/**
 * Update schema — all create fields made optional.
 * Used for PUT /vietrecruit/jobs/:id payloads.
 */
export const updateJobSchema = z
  .object({
    title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự.').max(200, 'Tiêu đề không được vượt quá 200 ký tự.').optional(),
    description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự.').optional(),
    department_id: z.string().min(1, 'Vui lòng chọn phòng ban.').optional(),
    location_id: z.string().min(1, 'Vui lòng chọn địa điểm.').optional(),
    category_id: z.string().min(1, 'Vui lòng chọn danh mục.').optional(),
    min_salary: z.number({ message: 'Lương tối thiểu phải là số.' }).positive('Lương tối thiểu phải lớn hơn 0.').optional(),
    max_salary: z.number({ message: 'Lương tối đa phải là số.' }).positive('Lương tối đa phải lớn hơn 0.').optional(),
    currency: z.string().min(1, 'Đơn vị tiền tệ là bắt buộc.').optional(),
    is_negotiable: z.boolean().optional(),
    deadline: z.string().min(1, 'Hạn nộp hồ sơ là bắt buộc.').optional(),
    requirements: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.min_salary !== undefined && data.max_salary !== undefined) {
        return data.max_salary >= data.min_salary
      }
      return true
    },
    {
      message: 'Lương tối đa phải lớn hơn hoặc bằng lương tối thiểu.',
      path: ['max_salary'],
    },
  )

/** Default field values for the create form — use for v-model initialization and reset */
export const createJobDefaults = {
  title: '',
  description: '',
  department_id: '',
  location_id: '',
  category_id: '',
  min_salary: undefined as number | undefined,
  max_salary: undefined as number | undefined,
  currency: 'VND',
  is_negotiable: false,
  deadline: '',
  requirements: '',
}
