export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED'

export type ApplicationStatus =
  | 'NEW'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED'

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED'

export type ScorecardResult =
  | 'STRONG_HIRE'
  | 'HIRE'
  | 'NO_HIRE'
  | 'STRONG_NO_HIRE'

export type OfferStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED'

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'EXPIRED'

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'CANCELLED'
  | 'FAILED'
  | 'EXPIRED'

export type BillingCycle = 'MONTHLY' | 'YEARLY'

export type AccountType = 'CANDIDATE' | 'EMPLOYER'

export type RoleCode =
  | 'CANDIDATE'
  | 'COMPANY_ADMIN'
  | 'HR'
  | 'INTERVIEWER'
  | 'SYSTEM_ADMIN'
  | 'CUSTOMER_SERVICE'
