// src/features/offer/types/application.schema.ts
import { z } from 'zod';

export const ApplicationStatusSchema = z.enum(["NEW", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"]);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const ApplicationSummarySchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  jobTitle: z.string(),
  candidateName: z.string(),
  status: ApplicationStatusSchema,
  createdAt: z.string(),
});

export type ApplicationSummary = z.infer<typeof ApplicationSummarySchema>;

export interface PageableObject {
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  offset: number;
  unpaged: boolean;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type PageResponseApplicationSummary = PageResponse<ApplicationSummary>;
