# VietRecruit ATS — Frontend Implementation Guide

> **Generated from**: full backend codebase analysis (database schema, DTOs, controllers, business flows, feature specs)
> **Stack**: Vue 3 + TypeScript, Vite, Pinia, Vue Router, Axios
> **API prefix**: `/vietrecruit`

---

## A. ENTITY MAP

### Core Entities

| # | Table | Key Columns | Relationships | Enum Columns |
|---|-------|------------|---------------|-------------|
| 1 | `companies` | `id` (UUID PK), `name`, `domain` (UNIQUE), `website` | → `users.company_id`, → `departments`, → `locations`, → `categories`, → `jobs` | — |
| 2 | `users` | `id` (UUID PK), `email` (UNIQUE), `password_hash`, `full_name`, `phone`, `avatar_url`, `banner_url`, `linkedin_url`, `github_url`, `portfolio_url`, `location`, `dob`, `gender`, `is_active`, `is_locked`, `failed_attempts`, `lock_until`, `email_verified`, `last_login_at` | → `companies` (FK `company_id`), ↔ `user_roles`, → `applications`, → `candidates` | — |
| 3 | `roles` | `id` (UUID PK), `code` (UNIQUE), `name` | ↔ `user_roles`, ↔ `role_permissions` | — |
| 4 | `permissions` | `id` (UUID PK), `code` (UNIQUE), `name` | ↔ `role_permissions` | — |
| 5 | `user_roles` | `user_id`, `role_id` | → `users`, → `roles` | — |
| 6 | `role_permissions` | `role_id`, `permission_id` | → `roles`, → `permissions` | — |
| 7 | `departments` | `id` (UUID PK), `company_id`, `name`, `description`, `deleted_at` | → `companies`, ← `jobs` | — |
| 8 | `locations` | `id` (UUID PK), `company_id`, `name`, `address` | → `companies`, ← `jobs` | — |
| 9 | `categories` | `id` (UUID PK), `company_id`, `name` | → `companies`, ← `jobs` | — |
| 10 | `jobs` | `id` (UUID PK), `company_id`, `department_id`, `location_id`, `category_id`, `title`, `description`, `requirements`, `min_salary`, `max_salary`, `currency`, `is_negotiable`, `status`, `deadline`, `public_link`, `created_by`, `updated_by` | → `companies`, → `departments`, → `locations`, → `categories`, ← `applications` | `job_status` |
| 11 | `candidates` | `id` (UUID PK), `user_id`, `headline`, `summary`, `skills`, `experience_years`, `education_level`, `desired_position`, `desired_salary_min/max`, `desired_salary_currency`, `work_type`, `is_open_to_work`, `cv_url`, `cv_original_filename`, `cv_file_size`, `cv_content_type`, `cv_object_key` | → `users`, ← `applications` | — |
| 12 | `applications` | `id` (UUID PK), `job_id`, `candidate_id`, `cover_letter`, `status`, `ai_score`, `ai_strengths`, `ai_gaps`, `ai_summary` | → `jobs`, → `candidates`, ← `interviews`, ← `offers`, ← `application_status_history` | `application_status` |
| 13 | `application_status_history` | `id` (UUID PK), `application_id`, `from_status`, `to_status`, `notes`, `changed_by` | → `applications`, → `users` | `application_status` |
| 14 | `interviews` | `id` (UUID PK), `application_id`, `title`, `scheduled_at`, `duration_minutes`, `location_or_link`, `type`, `status`, `created_by` | → `applications`, ↔ `interview_interviewers`, ← `scorecards` | `interview_status` |
| 15 | `interview_interviewers` | `interview_id`, `user_id` | → `interviews`, → `users` | — |
| 16 | `scorecards` | `id` (UUID PK), `interview_id`, `interviewer_id`, `skill_score`, `attitude_score`, `english_score`, `average_score`, `result`, `comments` | → `interviews`, → `users` | `scorecard_result` |
| 17 | `offers` | `id` (UUID PK), `application_id`, `base_salary`, `currency`, `start_date`, `notes`, `offer_letter_url`, `status`, `created_by`, `sent_at`, `responded_at` | → `applications`, → `users` | `offer_status` |
| 18 | `subscription_plans` | `id` (UUID PK), `code`, `name`, `description`, `max_active_jobs`, `job_duration_days`, `resume_access`, `ai_matching`, `priority_listing`, `price_monthly`, `price_yearly`, `currency`, `is_active` | ← `employer_subscriptions` | — |
| 19 | `employer_subscriptions` | `id` (UUID PK), `company_id`, `plan_id`, `status`, `starts_at`, `expires_at`, `auto_renew` | → `companies`, → `subscription_plans` | `subscription_status` |
| 20 | `payment_transactions` | `id` (UUID PK), `company_id`, `plan_id`, `order_code`, `amount`, `currency`, `billing_cycle`, `status`, `checkout_url` | → `companies`, → `subscription_plans` | `payment_status`, `billing_cycle` |
| 21 | `transaction_records` | `id` (UUID PK), `payment_transaction_id`, `counter_account_name`, `transaction_date_time`, `description`, `amount`, `currency`, `status`, `order_code` | → `payment_transactions` | — |

### Enum Definitions

| Enum | Values |
|------|--------|
| `job_status` | `DRAFT`, `PUBLISHED`, `CLOSED` |
| `application_status` | `NEW`, `SCREENING`, `INTERVIEW`, `OFFER`, `HIRED`, `REJECTED` |
| `interview_status` | `SCHEDULED`, `COMPLETED`, `CANCELED` |
| `scorecard_result` | `PASS`, `FAIL`, `CONSIDERING` |
| `offer_status` | `DRAFT`, `SENT`, `ACCEPTED`, `DECLINED` |
| `subscription_status` | `ACTIVE`, `CANCELLED`, `EXPIRED` |
| `payment_status` | `PENDING`, `PAID`, `CANCELLED`, `FAILED`, `EXPIRED` |
| `billing_cycle` | `MONTHLY`, `YEARLY` |

---

## B. TYPESCRIPT TYPE INDEX

> Paste each block into `src/types/<feature>.ts`

### `src/types/common.ts`

```typescript
// ── API Response Wrappers ────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data: T
  timestamp: string // ISO-8601
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface SearchPageResponse<T> extends PageResponse<T> {
  tookMs: number
}

// ── Pagination Request ───────────────────────────────────────────────
export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}
```

### `src/types/enums.ts`

```typescript
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
  | 'PASS'
  | 'FAIL'
  | 'CONSIDERING'

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
```

### `src/types/auth.ts`

```typescript
import type { AccountType } from './enums'

// ── Requests ─────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string       // @Email
  password: string    // @NotBlank
}

export interface RegisterRequest {
  email: string       // @Email
  password: string    // @Pattern: ≥8 chars, upper+lower+digit+special
  fullName: string    // @NotBlank
  phone?: string
  accountType?: AccountType
}

export interface RegisterByInviteRequest {
  token: string       // @NotBlank
  password: string    // @Pattern: same as RegisterRequest
  fullName: string    // @NotBlank
}

export interface TokenRefreshRequest {
  refreshToken: string // @NotBlank
}

export interface ForgotPasswordRequest {
  email: string       // @Email
}

export interface ResetPasswordRequest {
  email: string       // @Email
  token: string       // @NotBlank
  newPassword: string // @Pattern
}

export interface ChangePasswordRequest {
  currentPassword: string // @NotBlank
  newPassword: string     // @Pattern
}

export interface VerifyOtpRequest {
  email: string  // @Email
  code: string   // @Size(8)
}

export interface ResendOtpRequest {
  email: string  // @Email
}

export interface OAuth2CodeExchangeRequest {
  code: string   // @NotBlank
}

// ── Responses ────────────────────────────────────────────────────────
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

export interface TokenRefreshResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}
```

### `src/types/user.ts`

```typescript
// ── Requests ─────────────────────────────────────────────────────────
export interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  avatarUrl?: string      // must be https://
  linkedinUrl?: string    // must be https://
  githubUrl?: string      // must be https://
  portfolioUrl?: string   // must be https://
  location?: string
  dob?: string            // ISO date (YYYY-MM-DD)
  gender?: string
}

export interface UserRequest {
  fullName: string        // @NotBlank
  email?: string          // @Email
  phone?: string
  avatarUrl?: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  location?: string
  dob?: string
  gender?: string
}

export interface ExternalUrlRequest {
  url: string // @NotBlank, @Pattern(^https://)
}

// ── Responses ────────────────────────────────────────────────────────
export interface UserProfileResponse {
  id: string
  email: string
  fullName: string
  phone: string | null
  avatarUrl: string | null
  bannerUrl: string | null
  linkedinUrl: string | null
  githubUrl: string | null
  portfolioUrl: string | null
  location: string | null
  dob: string | null
  gender: string | null
}

export interface AdminUserResponse extends UserProfileResponse {
  companyId: string | null
  isActive: boolean
  isLocked: boolean
  failedAttempts: number
  lockUntil: string | null
  lastLoginAt: string | null
  roles: string[]
  createdAt: string
  updatedAt: string
}

export interface AvatarUploadResponse {
  avatarUrl: string
  uploadedAt: string
}

export interface BannerUploadResponse {
  bannerUrl: string
  uploadedAt: string
}
```

### `src/types/candidate.ts`

```typescript
// ── Requests ─────────────────────────────────────────────────────────
export interface CandidateUpdateRequest {
  headline?: string
  summary?: string
  desiredPosition?: string
  desiredPositionLevel?: string
  yearsOfExperience?: number
  skills?: string[]
  primaryLanguage?: string
  workType?: string
  desiredSalaryMin?: number
  desiredSalaryMax?: number
  availableFrom?: string
  educationLevel?: string
  educationMajor?: string
  isOpenToWork?: boolean
}

export interface CandidateSearchRequest {
  q?: string
  skills?: string[]
  experienceMin?: number
  isOpenToWork?: boolean
  educationLevel?: string
  workType?: string
  page?: number
  size?: number
}

// ── Responses ────────────────────────────────────────────────────────
export interface CandidateProfileResponse {
  id: string
  userId: string
  headline: string | null
  summary: string | null
  defaultCvUrl: string | null
  cvOriginalFilename: string | null
  cvContentType: string | null
  cvFileSizeBytes: number | null
  cvUploadedAt: string | null
  desiredPosition: string | null
  desiredPositionLevel: string | null
  yearsOfExperience: number | null
  skills: string[] | null
  primaryLanguage: string | null
  workType: string | null
  desiredSalaryMin: number | null
  desiredSalaryMax: number | null
  availableFrom: string | null
  educationLevel: string | null
  educationMajor: string | null
  isOpenToWork: boolean
  createdAt: string
  updatedAt: string
}

export interface CandidateSearchResponse {
  id: string
  headline: string | null
  summary: string | null
  desiredPosition: string | null
  desiredPositionLevel: string | null
  yearsOfExperience: number | null
  skills: string[] | null
  workType: string | null
  desiredSalaryMin: number | null
  desiredSalaryMax: number | null
  educationLevel: string | null
  educationMajor: string | null
  isOpenToWork: boolean
  updatedAt: string
  highlights: Record<string, string[]> | null
  score: number | null
}

export interface CvUploadResponse {
  cvUrl: string
  cvOriginalFilename: string
  cvContentType: string
  cvFileSizeBytes: number
  cvUploadedAt: string
}
```

### `src/types/company.ts`

```typescript
// ── Requests ─────────────────────────────────────────────────────────
export interface CompanyCreateRequest {
  name: string        // @NotBlank, max 255
  domain?: string     // max 255
  website?: string    // max 255
}

export interface CompanyUpdateRequest {
  name?: string
  domain?: string
  website?: string
}

export interface CompanySearchRequest {
  q?: string
  page?: number
  size?: number
}

// ── Responses ────────────────────────────────────────────────────────
export interface CompanyResponse {
  id: string
  name: string
  domain: string | null
  website: string | null
  createdAt: string
  updatedAt: string
}

export interface CompanySearchResponse {
  id: string
  name: string
  domain: string | null
  website: string | null
  createdAt: string
  highlights: Record<string, string[]> | null
  score: number | null
}
```

### `src/types/organization.ts`

```typescript
// ── Department ───────────────────────────────────────────────────────
export interface DepartmentRequest {
  name: string        // @NotBlank, max 255
  description?: string
}

export interface DepartmentResponse {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

// ── Location ─────────────────────────────────────────────────────────
export interface LocationRequest {
  name: string        // @NotBlank, max 255
  address?: string
}

export interface LocationResponse {
  id: string
  name: string
  address: string | null
  createdAt: string
  updatedAt: string
}

// ── Category ─────────────────────────────────────────────────────────
export interface CategoryRequest {
  name: string        // @NotBlank, max 255
}

export interface CategoryResponse {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}
```

### `src/types/job.ts`

```typescript
import type { JobStatus } from './enums'

// ── Requests ─────────────────────────────────────────────────────────
export interface JobCreateRequest {
  title: string             // @NotBlank, max 255
  description: string       // @NotBlank, max 50000
  requirements?: string     // max 50000
  departmentId?: string
  locationId?: string
  categoryId?: string
  minSalary?: number
  maxSalary?: number
  currency?: string         // max 10
  isNegotiable?: boolean
  deadline?: string          // ISO date
}

export interface JobUpdateRequest {
  title?: string
  description?: string
  requirements?: string
  departmentId?: string
  locationId?: string
  categoryId?: string
  minSalary?: number
  maxSalary?: number
  currency?: string
  isNegotiable?: boolean
  deadline?: string
}

export interface JobSearchRequest {
  q?: string
  locationId?: string
  categoryId?: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  page?: number
  size?: number
  sort?: string     // default: 'relevance'
}

// ── Responses ────────────────────────────────────────────────────────
export interface JobResponse {
  id: string
  departmentId: string | null
  locationId: string | null
  categoryId: string | null
  title: string
  description: string
  requirements: string | null
  minSalary: number | null
  maxSalary: number | null
  currency: string | null
  isNegotiable: boolean | null
  status: JobStatus
  deadline: string | null
  publicLink: string | null
  createdBy: string
  updatedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface JobSummaryResponse {
  id: string
  title: string
  status: JobStatus
  minSalary: number | null
  maxSalary: number | null
  currency: string | null
  isNegotiable: boolean | null
  deadline: string | null
  createdAt: string
}

export interface JobSearchResponse {
  id: string
  title: string
  description: string | null
  requirements: string | null
  companyName: string | null
  categoryName: string | null
  locationName: string | null
  minSalary: number | null
  maxSalary: number | null
  currency: string | null
  isNegotiable: boolean | null
  status: string | null
  publicLink: string | null
  createdAt: string
  highlights: Record<string, string[]> | null
  score: number | null
}

export interface JobRecommendationResponse {
  jobId: string
  title: string
  companyName: string
  location: string | null
  matchScore: number
  matchReason: string
}
```

### `src/types/application.ts`

```typescript
import type { ApplicationStatus, InterviewStatus, ScorecardResult, OfferStatus } from './enums'

// ── Application ──────────────────────────────────────────────────────
export interface ApplicationCreateRequest {
  jobId: string          // @NotNull
  coverLetter?: string
}

export interface ApplicationStatusUpdateRequest {
  status: ApplicationStatus  // @NotNull
  notes?: string
}

export interface ApplicationResponse {
  id: string
  jobId: string
  jobTitle: string
  candidateId: string
  candidateName: string
  appliedCvUrl: string | null
  coverLetter: string | null
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}

export interface ApplicationSummaryResponse {
  id: string
  jobId: string
  jobTitle: string
  candidateName: string
  status: ApplicationStatus
  createdAt: string
}

export interface ApplicationScreeningResponse {
  applicationId: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  similarityScore: number | null
  aiScore: number | null
  scoreBreakdown: Record<string, number> | null
  strengths: string[]
  gaps: string[]
  summary: string | null
  applicationStatus: string
}

export interface ApplicationStatusHistoryResponse {
  id: string
  oldStatus: ApplicationStatus | null
  newStatus: ApplicationStatus
  notes: string | null
  changedByName: string
  changedAt: string
}

// ── Interview ────────────────────────────────────────────────────────
export interface InterviewCreateRequest {
  title: string                // @NotBlank
  scheduledAt: string          // ISO datetime
  durationMinutes?: number
  locationOrLink?: string
  interviewType?: string
  interviewerIds: string[]     // @NotEmpty
}

export interface InterviewStatusUpdateRequest {
  status: InterviewStatus      // @NotNull
}

export interface InterviewResponse {
  id: string
  applicationId: string
  title: string
  scheduledAt: string
  durationMinutes: number | null
  locationOrLink: string | null
  interviewType: string | null
  status: InterviewStatus
  interviewers: InterviewerResponse[]
  createdAt: string
}

export interface InterviewerResponse {
  id: string
  fullName: string
  email: string
}

// ── Scorecard ────────────────────────────────────────────────────────
export interface ScorecardCreateRequest {
  skillScore: number           // 1-10
  attitudeScore: number        // 1-10
  englishScore: number         // 1-10
  result: ScorecardResult      // @NotNull
  comments?: string
}

export interface ScorecardResponse {
  id: string
  interviewId: string
  interviewerId: string
  interviewerName: string
  skillScore: number
  attitudeScore: number
  englishScore: number
  averageScore: number
  result: ScorecardResult
  comments: string | null
  createdAt: string
}

// ── Offer ────────────────────────────────────────────────────────────
export interface OfferCreateRequest {
  baseSalary: number           // @NotNull
  currency?: string
  startDate?: string           // ISO date
  note?: string
  offerLetterUrl?: string
}

export interface OfferRespondRequest {
  action: 'ACCEPT' | 'DECLINE' // @NotNull
}

export interface OfferResponse {
  id: string
  applicationId: string
  offerLetterUrl: string | null
  baseSalary: number
  currency: string | null
  startDate: string | null
  note: string | null
  status: OfferStatus
  createdAt: string
}
```

### `src/types/invitation.ts`

```typescript
export interface CreateInvitationRequest {
  email: string     // @Email @NotBlank
  role: string      // 'HR' | 'INTERVIEWER'
}

export interface InvitationResponse {
  invitationId: string
  expiresAt: string
}
```

### `src/types/subscription.ts`

```typescript
import type { BillingCycle } from './enums'

export interface PlanResponse {
  id: string
  code: string
  name: string
  description: string | null
  maxActiveJobs: number      // -1 = unlimited
  jobDurationDays: number
  resumeAccess: boolean
  aiMatching: boolean
  priorityListing: boolean
  priceMonthly: number
  priceYearly: number
  currency: string
}

export interface SubscriptionResponse {
  id: string
  planName: string
  planCode: string
  status: string
  startedAt: string
  expiresAt: string
  autoRenew: boolean
}

export interface QuotaResponse {
  maxActiveJobs: number
  jobsActive: number
  jobsPosted: number
  cycleStart: string
  cycleEnd: string
}
```

### `src/types/payment.ts`

```typescript
import type { BillingCycle } from './enums'

export interface CheckoutRequest {
  planId: string          // @NotNull
  billingCycle: BillingCycle // @NotNull
}

export interface CheckoutResponse {
  checkoutUrl: string
  orderCode: number
}

export interface PaymentStatusResponse {
  orderCode: number
  status: string
  planName: string
  amount: number
  createdAt: string
}

export interface TransactionHistoryResponse {
  counterAccountName: string | null
  transactionDateTime: string
  description: string | null
  amount: number
  currency: string | null
  status: string
  orderCode: number
}
```

### `src/types/ai.ts`

```typescript
export interface CvImprovementResponse {
  overallScore: number
  suggestions: CvSuggestion[]
  strengths: string[]
  analysedAt: string
}

export interface CvSuggestion {
  priority: string
  section: string
  issue: string
  suggestion: string
  source: string
}

export interface InterviewQuestionResponse {
  interviewId: string
  jobTitle: string
  candidateName: string
  generatedAt: string
  questions: InterviewQuestion[]
  source: string
}

export interface InterviewQuestion {
  category: string
  question: string
  intent: string
  difficulty: string
}

export interface GeneratedJobDescription {
  overview: string
  responsibilities: string[]
  requirements: string[]
  niceToHave: string[]
  benefits: string
}

export interface JdGenerateRequest {
  title: string
  departmentId?: string
  employmentType: string
  keyResponsibilities: string[]
  requiredSkills: string[]
  niceToHaveSkills?: string[]
  yearsOfExperience?: number
  tone: 'PROFESSIONAL' | 'STARTUP' | 'CORPORATE'
}

export interface JdGenerateResponse {
  title: string
  generatedDescription: GeneratedJobDescription
  biasFlags: string[]
  generatedAt: string
}

export interface ApplyDescriptionRequest {
  generatedDescription: GeneratedJobDescription
}

export interface SalaryRange {
  min: number
  median: number
  max: number
}

export interface SalaryBenchmarkResponse {
  jobTitle: string
  location: string | null
  experienceLevel: string | null
  currency: string | null
  range: SalaryRange
  marketPosition: string | null
  dataPoints: number | null
  insights: string[]
  disclaimer: string | null
  generatedAt: string
}
```

### `src/types/knowledge.ts`

```typescript
export interface KnowledgeDocumentResponse {
  id: string
  title: string
  category: string
  fileName: string
  chunkCount: number
  status: string
  uploadedBy: string
  createdAt: string
  updatedAt: string
}

export interface KnowledgeUploadResponse {
  documentId: string
  title: string
  category: string
  status: string
}
```

---

## C. API SERVICE MAP

> All paths are relative to base prefix `/vietrecruit`.
> All responses wrapped in `ApiResponse<T>`.

### Auth Service (`/auth`)

| Method | Path | Request Body | Response `data` | Auth | Notes |
|--------|------|-------------|-----------------|------|-------|
| POST | `/auth/login` | `LoginRequest` | `LoginResponse` | ✗ | Rate: `authStrict` |
| POST | `/auth/register` | `RegisterRequest` | `Map<string, object>` | ✗ | Rate: `authStrict` |
| POST | `/auth/register/invite` | `RegisterByInviteRequest` | `void` | ✗ | Email pre-verified |
| POST | `/auth/refresh` | `TokenRefreshRequest` | `TokenRefreshResponse` | ✗ | Rate: `authModerate` |
| POST | `/auth/logout` | — (Bearer header) | `void` | ✓ | Revokes refresh token |
| POST | `/auth/forgot-password` | `ForgotPasswordRequest` | `void` | ✗ | Sends reset email |
| POST | `/auth/reset-password` | `ResetPasswordRequest` | `void` | ✗ | Token from email |
| POST | `/auth/change-password` | `ChangePasswordRequest` | `void` | ✓ | Revokes all sessions |
| POST | `/auth/verify-otp` | `VerifyOtpRequest` | `void` | ✗ | 8-digit code |
| POST | `/auth/resend-otp` | `ResendOtpRequest` | `void` | ✗ | Rate: `otpSend` (3/5min) |
| POST | `/auth/oauth2/exchange` | `OAuth2CodeExchangeRequest` | `LoginResponse` | ✗ | One-time code exchange |

### User Service (`/users`)

| Method | Path | Request | Response `data` | Auth | Role |
|--------|------|---------|-----------------|------|------|
| GET | `/users/me` | — | `UserProfileResponse` | ✓ | Any |
| PUT | `/users/me` | `UpdateProfileRequest` | `UserProfileResponse` | ✓ | Any |
| POST | `/users/me/avatar` | `multipart/form-data` (`file`) | `AvatarUploadResponse` | ✓ | Any |
| PUT | `/users/me/avatar/url` | `ExternalUrlRequest` | `void` | ✓ | Any |
| DELETE | `/users/me/avatar` | — | `void` | ✓ | Any |
| POST | `/users/me/banner` | `multipart/form-data` (`file`) | `BannerUploadResponse` | ✓ | Any |
| PUT | `/users/me/banner/url` | `ExternalUrlRequest` | `void` | ✓ | Any |
| DELETE | `/users/me/banner` | — | `void` | ✓ | Any |

### Admin User Service (`/admin/users`)

| Method | Path | Request | Response `data` | Perm |
|--------|------|---------|-----------------|------|
| POST | `/admin/users` | `UserRequest` | `AdminUserResponse` | `USER:MANAGE` |
| GET | `/admin/users` | Pageable params | `PageResponse<AdminUserResponse>` | `USER:MANAGE` |
| GET | `/admin/users/{id}` | — | `AdminUserResponse` | `USER:MANAGE` |
| PUT | `/admin/users/{id}` | `UserRequest` | `AdminUserResponse` | `USER:MANAGE` |
| DELETE | `/admin/users/{id}` | — | `void` | `USER:DELETE` |

### Company Service (`/companies`)

| Method | Path | Request | Response `data` | Auth |
|--------|------|---------|-----------------|------|
| POST | `/companies` | `CompanyCreateRequest` | `CompanyResponse` | ✓ (COMPANY_ADMIN without company) |
| GET | `/companies/me` | — | `CompanyResponse` | ✓ (employer) |
| PUT | `/companies/me` | `CompanyUpdateRequest` | `CompanyResponse` | ✓ (employer) |
| GET | `/companies/search` | `?q=&page=&size=` | `SearchPageResponse<CompanySearchResponse>` | ✗ |

### Department Service (`/departments`)

| Method | Path | Request | Response `data` | Auth |
|--------|------|---------|-----------------|------|
| POST | `/departments` | `DepartmentRequest` | `DepartmentResponse` | ✓ (employer) |
| GET | `/departments` | Pageable | `PageResponse<DepartmentResponse>` | ✓ (employer) |
| GET | `/departments/{id}` | — | `DepartmentResponse` | ✓ (employer) |
| PUT | `/departments/{id}` | `DepartmentRequest` | `DepartmentResponse` | ✓ (employer) |
| DELETE | `/departments/{id}` | — | `void` | ✓ (employer) — soft-delete |

### Location Service (`/locations`)

| Method | Path | Request | Response `data` | Auth |
|--------|------|---------|-----------------|------|
| POST | `/locations` | `LocationRequest` | `LocationResponse` | ✓ (employer) |
| GET | `/locations` | Pageable | `PageResponse<LocationResponse>` | ✓ (employer) |
| GET | `/locations/{id}` | — | `LocationResponse` | ✓ (employer) |
| PUT | `/locations/{id}` | `LocationRequest` | `LocationResponse` | ✓ (employer) |
| DELETE | `/locations/{id}` | — | `void` | ✓ (employer) — hard-delete, FK check |

### Category Service (`/categories`)

| Method | Path | Request | Response `data` | Auth |
|--------|------|---------|-----------------|------|
| POST | `/categories` | `CategoryRequest` | `CategoryResponse` | ✓ (employer) |
| GET | `/categories` | Pageable | `PageResponse<CategoryResponse>` | ✓ (employer) |
| GET | `/categories/{id}` | — | `CategoryResponse` | ✓ (employer) |
| PUT | `/categories/{id}` | `CategoryRequest` | `CategoryResponse` | ✓ (employer) |
| DELETE | `/categories/{id}` | — | `void` | ✓ (employer) — hard-delete, FK check |

### Job Service (`/jobs`)

| Method | Path | Request | Response `data` | Auth | Notes |
|--------|------|---------|-----------------|------|-------|
| POST | `/jobs` | `JobCreateRequest` | `JobResponse` | ✓ (HR/COMPANY_ADMIN) | Creates DRAFT |
| PUT | `/jobs/{id}` | `JobUpdateRequest` | `JobResponse` | ✓ | DRAFT only |
| PUT | `/jobs/{id}/publish` | — | `JobResponse` | ✓ | Quota check → PUBLISHED |
| PUT | `/jobs/{id}/close` | — | `JobResponse` | ✓ | PUBLISHED → CLOSED, quota release |
| GET | `/jobs` | Pageable | `PageResponse<JobSummaryResponse>` | ✓ | Company-scoped |
| GET | `/jobs/{id}` | — | `JobResponse` | ✓ | Company-scoped |
| GET | `/jobs/search` | `JobSearchRequest` params | `SearchPageResponse<JobSearchResponse>` | ✗ | Full-text, Vietnamese |
| GET | `/jobs/autocomplete` | `?q=&limit=` | `string[]` | ✗ | Type-ahead |
| GET | `/jobs/public` | Pageable + filters | `PageResponse<JobSummaryResponse>` | ✗ | PUBLISHED only |
| GET | `/jobs/public/{id}` | — | `JobResponse` | ✗ | PUBLISHED only |

### Candidate Service (`/candidates`)

| Method | Path | Request | Response `data` | Role |
|--------|------|---------|-----------------|------|
| GET | `/candidates/me` | — | `CandidateProfileResponse` | CANDIDATE |
| PUT | `/candidates/me` | `CandidateUpdateRequest` | `CandidateProfileResponse` | CANDIDATE |
| POST | `/candidates/me/cv` | `multipart/form-data` | `CvUploadResponse` | CANDIDATE |
| DELETE | `/candidates/me/cv` | — | `void` | CANDIDATE |
| GET | `/candidates/me/job-recommendations` | `?limit=` | `JobRecommendationResponse[]` | CANDIDATE |
| GET | `/candidates/search` | Query params | `SearchPageResponse<CandidateSearchResponse>` | HR/COMPANY_ADMIN |
| GET | `/candidates/{id}` | — | `CandidateProfileResponse` | HR/COMPANY_ADMIN |

### Application Service (`/applications`)

| Method | Path | Request | Response `data` | Role |
|--------|------|---------|-----------------|------|
| POST | `/applications` | `ApplicationCreateRequest` | `ApplicationResponse` | CANDIDATE |
| GET | `/applications` | `?jobId=&status=` + Pageable | `PageResponse<ApplicationSummaryResponse>` | HR/COMPANY_ADMIN |
| GET | `/applications/mine` | Pageable | `PageResponse<ApplicationSummaryResponse>` | CANDIDATE |
| GET | `/applications/{id}` | — | `ApplicationResponse` | HR/CANDIDATE(own) |
| PUT | `/applications/{id}/status` | `ApplicationStatusUpdateRequest` | `ApplicationResponse` | HR/COMPANY_ADMIN |
| GET | `/applications/{id}/status-history` | — | `ApplicationStatusHistoryResponse[]` | HR/COMPANY_ADMIN |
| GET | `/applications/jobs/{jobId}/screening` | — | `ApplicationScreeningResponse[]` | HR/COMPANY_ADMIN |
| POST | `/applications/jobs/{jobId}/screening/trigger` | — | `string` ("Scoring in progress") | HR/COMPANY_ADMIN |

### Interview Service

| Method | Path | Request | Response `data` | Role |
|--------|------|---------|-----------------|------|
| POST | `/applications/{id}/interviews` | `InterviewCreateRequest` | `InterviewResponse` | HR/COMPANY_ADMIN |
| GET | `/applications/{id}/interviews` | — | `InterviewResponse[]` | HR/COMPANY_ADMIN |
| GET | `/interviews/{id}` | — | `InterviewResponse` | HR/INTERVIEWER/CANDIDATE |
| PUT | `/interviews/{id}/status` | `InterviewStatusUpdateRequest` | `InterviewResponse` | HR/COMPANY_ADMIN |

### Scorecard Service

| Method | Path | Request | Response `data` | Role |
|--------|------|---------|-----------------|------|
| POST | `/interviews/{id}/scorecards` | `ScorecardCreateRequest` | `ScorecardResponse` | INTERVIEWER (assigned) |
| GET | `/interviews/{id}/scorecards` | — | `ScorecardResponse[]` | HR/COMPANY_ADMIN |

### Offer Service

| Method | Path | Request | Response `data` | Role |
|--------|------|---------|-----------------|------|
| POST | `/applications/{id}/offers` | `OfferCreateRequest` | `OfferResponse` | HR/COMPANY_ADMIN |
| GET | `/applications/{id}/offers` | — | `OfferResponse[]` | HR/CANDIDATE(own) |
| GET | `/offers/{id}` | — | `OfferResponse` | HR/CANDIDATE |
| PUT | `/offers/{id}/send` | — | `OfferResponse` | HR/COMPANY_ADMIN |
| PUT | `/offers/{id}/respond` | `OfferRespondRequest` | `OfferResponse` | CANDIDATE |
| DELETE | `/offers/{id}` | — | `void` | HR/COMPANY_ADMIN (DRAFT only) |

### Invitation Service (`/invitations`)

| Method | Path | Request | Response `data` | Perm |
|--------|------|---------|-----------------|------|
| POST | `/invitations` | `CreateInvitationRequest` | `InvitationResponse` | `USER:MANAGE` |

### Plan Service (`/plans`)

| Method | Path | Request | Response `data` | Auth |
|--------|------|---------|-----------------|------|
| GET | `/plans` | — | `PlanResponse[]` | ✗ |
| GET | `/plans/{planId}` | — | `PlanResponse` | ✗ |

### Subscription Service (`/subscriptions`)

| Method | Path | Request | Response `data` | Auth |
|--------|------|---------|-----------------|------|
| GET | `/subscriptions/current` | — | `SubscriptionResponse` | ✓ (employer) |
| GET | `/subscriptions/current/quota` | — | `QuotaResponse` | ✓ (employer) |
| PUT | `/subscriptions/current/cancel` | — | `void` | ✓ (employer) |

### Payment Service (`/payment`)

| Method | Path | Request | Response `data` | Auth |
|--------|------|---------|-----------------|------|
| POST | `/payment/checkout` | `CheckoutRequest` | `CheckoutResponse` | ✓ (employer) |
| GET | `/payment/payment-status/{orderCode}` | — | `PaymentStatusResponse` | ✓ (employer) |
| GET | `/payment/transactions` | Pageable | `PageResponse<TransactionHistoryResponse>` | ✓ (employer) |
| GET | `/admin/payment/transactions` | `?companyId=` + Pageable | `PageResponse<TransactionHistoryResponse>` | ✓ (admin) |

### Knowledge Admin Service (`/admin/knowledge`)

| Method | Path | Request | Response `data` | Auth |
|--------|------|---------|-----------------|------|
| GET | `/admin/knowledge` | `?category=&page=&size=` | `PageResponse<KnowledgeDocumentResponse>` | ✓ (admin) |
| POST | `/admin/knowledge` | `multipart/form-data` (`file`) + `?title=&category=` | `KnowledgeUploadResponse` | ✓ (admin) |
| DELETE | `/admin/knowledge/{documentId}` | — | `void` | ✓ (admin) |

### AI Services

| Method | Path | Request | Response `data` | Role |
|--------|------|---------|-----------------|------|
| POST | `/candidates/me/cv/improvement` | — | `CvImprovementResponse` | CANDIDATE |
| GET | `/candidates/me/salary-benchmark` | `?jobTitle=&locationId=` | `SalaryBenchmarkResponse` | CANDIDATE |
| GET | `/jobs/{id}/salary-benchmark` | — | `SalaryBenchmarkResponse` | HR/COMPANY_ADMIN |
| POST | `/jobs/ai/generate-description` | `JdGenerateRequest` | `JdGenerateResponse` | HR/COMPANY_ADMIN |
| POST | `/jobs/{id}/ai/apply-description` | `ApplyDescriptionRequest` | `void` | HR/COMPANY_ADMIN |
| POST | `/interviews/{id}/questions/generate` | — | `InterviewQuestionResponse` | HR/COMPANY_ADMIN/INTERVIEWER |
| GET | `/interviews/{id}/questions` | — | `InterviewQuestionResponse` | HR/COMPANY_ADMIN/INTERVIEWER |

---

## D. ROUTE MAP

### Public Routes (no auth)

| Route | Page | API Calls |
|-------|------|-----------|
| `/` | LandingPage | — |
| `/jobs` | JobBoardPage | `GET /jobs/public`, `GET /jobs/search`, `GET /jobs/autocomplete` |
| `/jobs/:id` | PublicJobDetailPage | `GET /jobs/public/:id` |
| `/login` | LoginPage | `POST /auth/login` |
| `/register` | RegisterPage | `POST /auth/register` |
| `/register/invite` | InviteRegisterPage | `POST /auth/register/invite` |
| `/verify-otp` | OtpVerifyPage | `POST /auth/verify-otp`, `POST /auth/resend-otp` |
| `/forgot-password` | ForgotPasswordPage | `POST /auth/forgot-password` |
| `/reset-password` | ResetPasswordPage | `POST /auth/reset-password` |
| `/oauth2/callback` | OAuth2CallbackPage | `POST /auth/oauth2/exchange` |
| `/pricing` | PricingPage | `GET /plans` |

### Candidate Routes (`/candidate/*`)

| Route | Page | API Calls |
|-------|------|-----------|
| `/candidate/dashboard` | CandidateDashboard | `GET /candidates/me`, `GET /applications/mine` |
| `/candidate/profile` | CandidateProfilePage | `GET /candidates/me`, `PUT /candidates/me` |
| `/candidate/cv` | CvManagementPage | `POST/DELETE /candidates/me/cv`, `POST /candidates/me/cv/improvement` |
| `/candidate/applications` | MyApplicationsPage | `GET /applications/mine` |
| `/candidate/applications/:id` | ApplicationDetailPage | `GET /applications/:id`, `GET /offers/:offerId` |
| `/candidate/recommendations` | JobRecommendationsPage | `GET /candidates/me/job-recommendations` |
| `/candidate/salary-benchmark` | SalaryBenchmarkPage | `GET /candidates/me/salary-benchmark` |
| `/candidate/settings` | SettingsPage | `PUT /users/me`, avatar/banner uploads |

### Employer Routes (`/employer/*`)

| Route | Page | API Calls |
|-------|------|-----------|
| `/employer/dashboard` | EmployerDashboard | `GET /subscriptions/current/quota`, `GET /jobs` |
| `/employer/company` | CompanyProfilePage | `GET/PUT /companies/me` |
| `/employer/departments` | DepartmentsPage | CRUD `/departments` |
| `/employer/locations` | LocationsPage | CRUD `/locations` |
| `/employer/categories` | CategoriesPage | CRUD `/categories` |
| `/employer/team` | TeamManagementPage | `POST /invitations` |
| `/employer/jobs` | JobListPage | `GET /jobs` |
| `/employer/jobs/new` | JobFormPage | `POST /jobs`, AI JD generation |
| `/employer/jobs/:id` | JobDetailPage | `GET /jobs/:id`, publish/close |
| `/employer/jobs/:id/edit` | JobFormPage (edit) | `PUT /jobs/:id` |
| `/employer/jobs/:id/applications` | ApplicationPipelinePage | `GET /applications?jobId=`, screening |
| `/employer/applications/:id` | ApplicationDetailPage | Full pipeline view |
| `/employer/applications/:id/interviews` | InterviewListPage | CRUD interviews |
| `/employer/interviews/:id` | InterviewDetailPage | Status, scorecards, AI questions |
| `/employer/offers/:id` | OfferDetailPage | Send, view status |
| `/employer/subscription` | SubscriptionPage | `GET /subscriptions/current`, `PUT .../cancel` |
| `/employer/billing` | BillingPage | `POST /payment/checkout`, `GET /payment/transactions` |
| `/employer/settings` | SettingsPage | `PUT /users/me`, `POST /auth/change-password` |

### Admin Routes (`/admin/*`)

| Route | Page | API Calls |
|-------|------|-----------|
| `/admin/users` | UserManagementPage | CRUD `/admin/users` |
| `/admin/users/:id` | UserDetailPage | `GET /admin/users/:id` |
| `/admin/transactions` | TransactionListPage | `GET /admin/payment/transactions` |
| `/admin/knowledge` | KnowledgeManagementPage | `GET/POST/DELETE /admin/knowledge` |

---

## E. STATE MACHINES

### Application Pipeline

```
NEW → SCREENING → INTERVIEW → OFFER → HIRED
 ↓        ↓           ↓                  
REJECTED  REJECTED    REJECTED   ← OFFER → REJECTED (candidate DECLINE)
```

- `NEW → SCREENING/REJECTED`: HR via `PUT /applications/{id}/status`
- `SCREENING → INTERVIEW/REJECTED`: HR
- `INTERVIEW → OFFER/REJECTED`: HR
- `OFFER → HIRED`: automatic when Candidate accepts offer (`PUT /offers/{id}/respond` `ACCEPT`)
- `OFFER → REJECTED`: automatic when Candidate declines offer (`DECLINE`)

### Job Lifecycle

```
DRAFT → PUBLISHED → CLOSED
```

- `DRAFT → PUBLISHED`: `PUT /jobs/{id}/publish` (quota deducted)
- `PUBLISHED → CLOSED`: `PUT /jobs/{id}/close` (quota released)
- Only `DRAFT` jobs can be edited

### Interview Status

```
SCHEDULED → COMPLETED | CANCELED
```

### Offer Status

```
DRAFT → SENT → ACCEPTED | DECLINED
DRAFT → (deleted)
DECLINED → DRAFT (new offer)
```

### Payment Status

```
PENDING → PAID | CANCELLED | FAILED | EXPIRED
```

### Subscription Status

```
ACTIVE → CANCELLED | EXPIRED
EXPIRED → ACTIVE (re-subscribe)
CANCELLED → ACTIVE (re-subscribe)
```

---

## F. FEATURE IMPLEMENTATION CHECKLIST

### Phase 0 — Foundation

- [x] **F-0.1** Project scaffold (Vite + Vue 3 + TypeScript + Pinia + Vue Router)
- [x] **F-0.2** Design tokens CSS (`#008c8c` primary, 4px grid, Inter font)
- [x] **F-0.3** Axios instance + interceptors (base URL, JWT attach, 401 auto-refresh)
- [x] **F-0.4** `src/types/` — Paste all interfaces from Section B
- [x] **F-0.5** `ApiResponse<T>` unwrapper utility
- [x] **F-0.6** Global error handler (toast/notification)
- [x] **F-0.7** Route guards (auth gate, role gate)

### Phase 1 — Auth

- [x] **F-1.1** Auth store (Pinia): tokens, user profile, roles, `isAuthenticated` computed
- [x] **F-1.2** `authService.ts`: login, register, registerByInvite, refresh, logout, forgotPassword, resetPassword, changePassword, verifyOtp, resendOtp, oauth2Exchange
- [x] **F-1.3** LoginPage — email/password form, OAuth2 buttons (Google/GitHub)
- [x] **F-1.4** RegisterPage — multi-step: account type → form → submit
- [x] **F-1.5** OtpVerifyPage — 8-digit input, resend timer (3 req / 5 min)
- [x] **F-1.6** ForgotPasswordPage + ResetPasswordPage
- [x] **F-1.7** InviteRegisterPage — token from URL, password + fullName
- [x] **F-1.8** OAuth2CallbackPage — exchange code → store tokens → redirect
- [x] **F-1.9** Token refresh interceptor (automatic on 401)
- [x] **F-1.10** Logout (revoke + clear store + redirect)

### Phase 2 — User Profile & Media

- [x] **F-2.1** `userService.ts`: getProfile, updateProfile, uploadAvatar, setAvatarUrl, deleteAvatar, uploadBanner, setBannerUrl, deleteBanner
- [x] **F-2.2** Profile page with edit form (shared between candidate & employer)
- [x] **F-2.3** Avatar/Banner upload component (drag-drop, preview, crop)
- [x] **F-2.4** Settings page: change password, profile edits

### Phase 3 — Employer Onboarding

- [x] **F-3.1** `companyService.ts`: createCompany, getCompany, updateCompany, searchCompanies
- [x] **F-3.2** Company setup wizard (after first employer login, no company → create)
- [x] **F-3.3** `organizationService.ts`: CRUD departments, locations, categories
- [x] **F-3.4** Organization management pages (tables + modals for CRUD)
- [x] **F-3.5** `invitationService.ts`: createInvitation
- [x] **F-3.6** Team management page (invite HR/INTERVIEWER, list pending invites)

### Phase 4 — Subscription & Payment

- [x] **F-4.1** `planService.ts`: listPlans, getPlan
- [x] **F-4.2** `subscriptionService.ts`: getCurrentSubscription, getCurrentQuota, cancelSubscription
- [x] **F-4.3** `paymentService.ts`: checkout, getPaymentStatus, getTransactions
- [x] **F-4.4** Pricing page (plan cards, billing toggle monthly/yearly)
- [x] **F-4.5** Checkout flow (select plan → redirect to PayOS → return callback)
- [x] **F-4.6** Payment status polling page (after PayOS return)
- [x] **F-4.7** Subscription dashboard (current plan, quota bar, cancel)
- [x] **F-4.8** Billing history page (transaction list)

### Phase 5 — Job Management (Employer)

- [x] **F-5.1** `jobService.ts`: createJob, updateJob, publishJob, closeJob, listJobs, getJob, searchJobs, autocomplete, listPublicJobs, getPublicJob
- [x] **F-5.2** Job list page (table with status badges, filter, pagination)
- [x] **F-5.3** Job form page (create/edit with rich text editor)
- [x] **F-5.4** AI JD generator integration (generate → preview → apply)
- [x] **F-5.5** Job detail page (view, publish/close buttons with state machine enforcement)
- [x] **F-5.6** Salary benchmark widget on job detail (`GET /jobs/{id}/salary-benchmark`)
- [x] **F-5.7** Quota guard UI (disable publish when quota full, show upgrade CTA)

### Phase 6 — Public Job Board (Candidate)

- [x] **F-6.1** Job board page (search, filters: location, category, salary range)
- [x] **F-6.2** Type-ahead search (autocomplete API)
- [x] **F-6.3** Job detail public page
- [x] **F-6.4** Apply flow (cover letter form → `POST /applications`)

### Phase 7 — Candidate Profile & CV

- [x] **F-7.1** `candidateService.ts`: getProfile, updateProfile, uploadCv, deleteCv, getRecommendations
- [x] **F-7.2** Candidate profile form (skills tags, salary expectations, work preferences)
- [x] **F-7.3** CV upload/replace/delete (PDF/DOCX/JPEG/PNG, max 5MB)
- [x] **F-7.4** AI CV improvement page (`POST /candidates/me/cv/improvement`)
- [x] **F-7.5** Job recommendations page (AI-matched jobs)
- [x] **F-7.6** Salary benchmark tool for candidates

### Phase 8 — Application Pipeline (Employer)

- [x] **F-8.1** `applicationService.ts`: apply, listApplications, listMyApplications, getApplication, updateStatus, getStatusHistory, getScreeningResults, triggerScreening
- [x] **F-8.2** Application pipeline view (Kanban-style per job)
- [x] **F-8.3** Application detail page (candidate info, CV viewer, status history)
- [x] **F-8.4** Status transition buttons (enforce valid transitions per state machine)
- [x] **F-8.5** AI screening: trigger button + results table (scores, strengths, gaps)

### Phase 9 — Interviews

- [x] **F-9.1** `interviewService.ts`: scheduleInterview, listInterviews, getInterview, updateInterviewStatus
- [x] **F-9.2** Schedule interview dialog (datetime picker, interviewer multi-select)
- [x] **F-9.3** Interview list per application
- [x] **F-9.4** Interview detail page (status, interviewer list, scorecards)
- [x] **F-9.5** AI interview questions (generate + display)

### Phase 10 — Scorecards

- [x] **F-10.1** `scorecardService.ts`: submitScorecard, listScorecards
- [x] **F-10.2** Scorecard form (1-10 sliders for skill/attitude/english, result select, comments)
- [x] **F-10.3** Scorecard summary view (radar chart, average scores)

### Phase 11 — Offers

- [x] **F-11.1** `offerService.ts`: createOffer, listOffers, getOffer, sendOffer, respondToOffer, deleteOffer
- [x] **F-11.2** Create offer form (salary, start date, notes, letter URL)
- [x] **F-11.3** Offer lifecycle view (DRAFT → SENT → ACCEPTED/DECLINED)
- [x] **F-11.4** Candidate offer response UI (accept/decline with confirmation)

### Phase 12 — Candidate Application Tracking

- [x] **F-12.1** My applications page (list with status badges, pagination)
- [x] **F-12.2** Application detail view (status timeline, interview details, offer view)

### Phase 13 — Interviewer Portal

- [ ] **F-13.1** Interviewer dashboard (assigned interviews list)
- [ ] **F-13.2** Interview detail view + scorecard submission
- [ ] **F-13.3** AI-generated interview questions viewer

### Phase 14 — Admin Panel

- [ ] **F-14.1** `adminUserService.ts`: createUser, listUsers, getUser, updateUser, deleteUser
- [ ] **F-14.2** User management table (search, paginate, lock/unlock)
- [ ] **F-14.3** Admin transaction history page
- [ ] **F-14.4** `knowledgeService.ts`: listDocuments, uploadDocument, deleteDocument
- [ ] **F-14.5** Knowledge management page (upload documents, list with category filter, delete)

### Phase 15 — Polish

- [ ] **F-15.1** Loading skeletons for all list/detail pages
- [ ] **F-15.2** Empty state components
- [ ] **F-15.3** Error boundary component
- [ ] **F-15.4** Responsive design (mobile-first)
- [ ] **F-15.5** Dark mode support
- [ ] **F-15.6** Notification toast system
- [ ] **F-15.7** Breadcrumb navigation
- [ ] **F-15.8** Accessibility audit (ARIA, keyboard nav)
