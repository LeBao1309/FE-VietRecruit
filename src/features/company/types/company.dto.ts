// src/features/company/types/company.dto.ts
// Re-exports company schemas from onboarding (single source of truth)
// + any company-specific additions for the settings page.

export {
  CompanyUpdateRequestSchema,
  CompanyResponseSchema,
  type CompanyUpdateRequest,
  type CompanyResponse,
} from '@/features/onboarding/types/onboarding.dto'
