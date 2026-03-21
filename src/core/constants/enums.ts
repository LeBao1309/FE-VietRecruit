// All domain enums — single source of truth across FE

export const USER_ROLES = {
  SYSTEM_ADMIN:     'SYSTEM_ADMIN',
  CUSTOMER_SERVICE: 'CUSTOMER_SERVICE',
  COMPANY_ADMIN:    'COMPANY_ADMIN',
  HR:               'HR',
  INTERVIEWER:      'INTERVIEWER',
  EMPLOYER:         'EMPLOYER',
  CANDIDATE:        'CANDIDATE',
} as const
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES]

export const PLANS = {
  FREE:       'FREE',
  PRO:        'PRO',
  ENTERPRISE: 'ENTERPRISE',
} as const
export type Plan = typeof PLANS[keyof typeof PLANS]

export const JOB_STATUS = {
  DRAFT:     'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED:    'CLOSED',
  EXPIRED:   'EXPIRED',
} as const
export type JobStatus = typeof JOB_STATUS[keyof typeof JOB_STATUS]

export const APPLICATION_STATUS = {
  PENDING:    'PENDING',
  REVIEWING:  'REVIEWING',
  SHORTLISTED:'SHORTLISTED',
  REJECTED:   'REJECTED',
  ACCEPTED:   'ACCEPTED',
} as const
export type ApplicationStatus = typeof APPLICATION_STATUS[keyof typeof APPLICATION_STATUS]

export const INTERVIEW_STATUS = {
  SCHEDULED:  'SCHEDULED',
  COMPLETED:  'COMPLETED',
  CANCELLED:  'CANCELLED',
  NO_SHOW:    'NO_SHOW',
} as const
export type InterviewStatus = typeof INTERVIEW_STATUS[keyof typeof INTERVIEW_STATUS]

export const OFFER_STATUS = {
  DRAFT:    'DRAFT',
  PENDING:  'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  EXPIRED:  'EXPIRED',
} as const
export type OfferStatus = typeof OFFER_STATUS[keyof typeof OFFER_STATUS]
