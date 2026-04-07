# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VietRecruit ATS -- Enterprise Applicant Tracking System frontend for Vietnamese businesses. Vue 3 SPA consuming a Spring Boot 3.4.2 REST API. All API endpoints are prefixed `/vietrecruit/`. UI text and error messages target Vietnamese users.

## Tech Stack

| Component | Package | Version |
|-----------|---------|---------|
| Framework | vue | ^3.5.13 |
| State management | pinia | ^2.3.0 |
| HTTP client | axios | ^1.7.9 |
| Router | vue-router | ^4.5.0 |
| CSS framework | tailwindcss | ^4.2.2 |
| Tailwind Vite plugin | @tailwindcss/vite | ^4.2.2 |
| Build tool | vite | ^6.2.0 |
| TypeScript | typescript | ~5.7.2 |
| Type checker | vue-tsc | ^2.2.0 |
| Vue Vite plugin | @vitejs/plugin-vue | ^5.2.1 |

**Not installed** (contrary to prior CLAUDE.md claims): Zod, Vitest, jsdom, Vue Test Utils. No validation library. No test framework.

## Commands

```bash
pnpm dev           # Dev server at localhost:3000
pnpm build         # vue-tsc type-check + Vite production build
pnpm preview       # Preview production build
pnpm type-check    # vue-tsc --noEmit
```

**No test commands exist.** `pnpm test` / `pnpm coverage` are not defined in package.json.

**Package manager:** pnpm only (enforced). Never use npm or yarn.

## Directory Structure

```
src/
├── assets/                        # Global CSS (index.css with Tailwind)
├── components/
│   ├── candidate/
│   │   └── MiniStepper.vue
│   └── common/
│       ├── AppFooter.vue
│       ├── AppHeader.vue
│       ├── AppToast.vue
│       ├── BaseBreadcrumbs.vue
│       ├── BaseEmptyState.vue
│       ├── BaseSkeleton.vue
│       ├── FloatingBackButton.vue
│       ├── GlobalErrorBoundary.vue
│       ├── MediaUpload.vue
│       └── PublicNavbar.vue
├── composables/
│   └── useTheme.ts                # Light/dark mode toggle
├── features/
│   ├── candidate/components/      # CandidateLayout.vue, CandidateNavbar.vue
│   ├── company/composables/       # useCompanySettings, useOrgSettings, useTeamSettings (BROKEN)
│   └── interview/                 # AI interview questions (BROKEN IMPORTS)
│       ├── components/            # AiInterviewQuestionsPanel.vue
│       ├── composables/           # useAiInterviewQuestions.ts
│       ├── services/              # ai-interview.service.ts
│       └── types/                 # ai-interview.dto.ts
├── layouts/
│   ├── AdminLayout.vue
│   ├── AuthLayout.vue
│   ├── CandidateLayout.vue
│   └── EmployerLayout.vue
├── router/
│   └── index.ts                   # All route definitions + navigation guards
├── services/                      # API service layer (one file per domain)
│   ├── http.ts                    # Axios instance, token helpers, interceptors
│   ├── api-error.ts               # Error extraction, ServiceResult<T> pattern
│   ├── authService.ts
│   ├── userService.ts
│   ├── jobService.ts
│   ├── applicationService.ts
│   ├── interviewService.ts
│   ├── offerService.ts
│   ├── candidateService.ts
│   ├── companyService.ts
│   ├── organizationService.ts     # departments, locations, categories
│   ├── planService.ts
│   ├── subscriptionService.ts
│   ├── paymentService.ts
│   ├── invitationService.ts
│   ├── adminUserService.ts
│   └── adminPaymentService.ts
├── stores/                        # Pinia stores (setup syntax)
│   ├── authStore.ts
│   ├── uiStore.ts
│   ├── jobStore.ts
│   ├── applicationStore.ts
│   ├── interviewStore.ts
│   ├── offerStore.ts
│   ├── subscriptionStore.ts
│   └── adminStore.ts
├── types/                         # TypeScript interfaces (plain, no runtime validation)
│   ├── common.ts                  # ApiResponse<T>, PageResponse<T>, SpringPageResponse<T>
│   ├── enums.ts                   # JobStatus, ApplicationStatus, RoleCode, etc.
│   ├── auth.ts
│   ├── user.ts
│   ├── job.ts
│   ├── application.ts
│   ├── ai.ts
│   ├── candidate.ts
│   ├── company.ts
│   ├── organization.ts
│   ├── invitation.ts
│   ├── subscription.ts
│   └── index.ts                   # Barrel export
├── views/
│   ├── auth/                      # Login, Register, VerifyOtp, ForgotPassword, ResetPassword, InviteRegister, OAuth2Callback
│   ├── public/                    # JobBoardPage, PublicJobDetailPage
│   ├── candidate/                 # Dashboard, CandidateProfile, CvManagement, JobRecommendations, SalaryBenchmark, MyApplications, ApplicationDetail
│   ├── employer/                  # Dashboard, CompanySetup, Organization, Team, JobList/Form/Detail, ApplicationPipeline/Detail, InterviewList/Detail, ScorecardForm/Summary, OfferDetail, Pricing, PaymentStatus, Subscription, Billing, InterviewerDashboard
│   ├── admin/                     # UsersPage, TransactionsPage
│   ├── shared/                    # ProfilePage, SettingsPage
│   ├── LandingPage.vue
│   └── NotFoundPage.vue
├── App.vue
└── main.ts
```

**Note:** There is no `src/core/` directory. The old CLAUDE.md described a `core/` structure that does not exist. Services, stores, types, and composables live directly under `src/`.

## Key Patterns

### API Flow

`Service (Axios) -> Store (Pinia) -> Component`

- Services wrap Axios calls, return `ServiceResult<T> = { data: T | null, error: AppError | null }`
- Services unwrap `ApiResponse<T>.data` before returning
- Stores call services, manage loading/error state, expose computed getters
- Components consume store state directly or via `storeToRefs`

### HTTP Client (`services/http.ts`)

- Axios instance with `baseURL` from `VITE_API_BASE_URL` (default: `/vietrecruit`)
- Timeout: 30 seconds
- Request interceptor: injects `Bearer` token from `localStorage` key `vr_access_token`
- Response interceptor: auto-refreshes on 401 using `vr_refresh_token`, queues concurrent requests during refresh, redirects to `/login` on refresh failure

### Token Management

Token helpers are exported directly from `services/http.ts` -- there is no separate `tokenService` module.
- `getAccessToken()` / `getRefreshToken()` / `setTokens()` / `clearTokens()` / `parseJwt()`
- localStorage keys: `vr_access_token`, `vr_refresh_token`
- `parseJwt()` returns `any` (no typed interface)

### Route Guards (`router/index.ts`)

- `beforeEach` guard checks `meta.requiresAuth`, `meta.guestOnly`, `meta.roles`
- **Meta fields used:** `requiresAuth` (boolean), `guestOnly` (boolean), `roles` (RoleCode[]), `title` (string)
- **Not used:** `allowedRoles`, `permissions` (contrary to prior CLAUDE.md claims)
- Guest routes redirect authenticated users to role-appropriate dashboard
- Protected routes redirect unauthenticated users to `/login` with redirect query param
- Role check uses `auth.hasAnyRole(...requiredRoles)`

### Error Handling (`services/api-error.ts`)

- `extractError()` maps Axios errors to `AppError` objects with user-friendly messages
- Predefined mappings for BE error codes (AUTH_*, QUOTA_EXCEEDED, etc.)
- All services use try/catch, never throw -- return `fail(error)` instead
- Stores call `uiStore.toastError()` on failures

### Pagination

- BE returns Spring `Page<T>` with `number` (0-indexed current page)
- FE normalizes via `normalizeSpringPage()` in `types/common.ts` to `PageResponse<T>` with `page` field

## Feature Inventory

| Feature | Views | Store | Service | Types | Status |
|---------|-------|-------|---------|-------|--------|
| auth | 7 pages | authStore | authService | auth.ts | Complete |
| user/profile | 2 shared pages | authStore | userService | user.ts | Complete |
| job (employer) | 3 pages | jobStore | jobService | job.ts | Complete |
| job (public) | 2 pages | -- | jobService | job.ts | Complete |
| application | 2 employer + 2 candidate | applicationStore | applicationService | application.ts | Complete |
| interview | 2 employer pages | interviewStore | interviewService | application.ts | Complete |
| scorecard | 2 employer pages | interviewStore | interviewService | application.ts | Complete |
| offer | 1 employer page | offerStore | offerService | application.ts | Complete |
| candidate | 5 pages | -- | candidateService | candidate.ts | Complete |
| company | 1 page | -- | companyService | company.ts | Partial |
| organization | 1 page | -- | organizationService | organization.ts | Broken (missing store) |
| team | 1 page | -- | invitationService | invitation.ts | Broken (missing store) |
| subscription | 2 pages | subscriptionStore | subscriptionService, planService | subscription.ts | Complete |
| payment | 2 pages | subscriptionStore | paymentService | subscription.ts | Complete |
| admin (users) | 1 page | adminStore | adminUserService | user.ts | Complete |
| admin (transactions) | 1 page | adminStore | adminPaymentService | subscription.ts | Complete |
| interview AI (feature/) | 1 component | -- | ai-interview.service | ai-interview.dto.ts | Broken (bad imports) |

## Environment Variables

```
VITE_API_BASE_URL    # API endpoint (default: /vietrecruit, proxied to localhost:8080 in dev)
VITE_APP_NAME        # App display name
VITE_APP_ENV         # development | staging | production
```

No `.env.example` exists. Only `.env` is present.

## Known Issues

### Broken Imports (5 files, will fail at runtime)

| File | Broken Import | Actual Location |
|------|---------------|-----------------|
| `features/interview/services/ai-interview.service.ts` | `@/core/api/axios.instance` | `@/services/http` |
| `features/interview/services/ai-interview.service.ts` | `@/core/types/api.types` | `@/types/common` |
| `features/interview/composables/useAiInterviewQuestions.ts` | `@/core/utils/error` | `@/services/api-error` |
| `features/company/composables/useCompanySettings.ts` | `@/features/company/stores/useCompanyStore` | Does not exist |
| `features/company/composables/useCompanySettings.ts` | `@/features/company/types/company.dto` | `@/types/company` |
| `features/company/composables/useOrgSettings.ts` | `@/core/stores/org.store` | Does not exist |
| `features/company/composables/useOrgSettings.ts` | `@/features/company/types/org.dto` | `@/types/organization` |
| `features/company/composables/useTeamSettings.ts` | `@/core/stores/team.store` | Does not exist |
| `features/company/composables/useTeamSettings.ts` | `@/features/company/types/team.dto` | `@/types/invitation` (partial) |

### Missing Stores (referenced but not created)

- `features/company/stores/useCompanyStore.ts`
- `core/stores/org.store.ts` (should be a Pinia store wrapping organizationService)
- `core/stores/team.store.ts` (should be a Pinia store wrapping invitationService + user management)

### Type Safety

- `parseJwt()` in `services/http.ts` returns `any` -- should return a typed `JwtPayload` interface
- No runtime validation of API responses (no Zod or equivalent)
- Role casting: `decodedPayload.roles as RoleCode[]` without validation

## Conventions

- Vue 3 Composition API with `<script setup lang="ts">` exclusively
- Import alias: `@` -> `src/`
- Components: PascalCase filenames
- Services: `{domain}Service.ts` exporting a service object
- Stores: `{domain}Store.ts` using Pinia `defineStore` with setup syntax
- Types: plain TypeScript interfaces in `types/{domain}.ts`
- Tailwind for styling, brand primary color: `#009898`
- No test infrastructure exists
