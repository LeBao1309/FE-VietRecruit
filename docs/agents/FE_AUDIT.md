# FE_AUDIT.md -- Frontend Codebase Audit

> Generated: 2026-03-25 | Lead Orchestrator Agent | Documentation Only
> Scope: FE-VietRecruit (Vue 3 + TypeScript + Pinia + Tailwind CSS)

---

## 1. Technology Stack Snapshot

| Dependency | Version | Notes |
|-----------|---------|-------|
| Vue | 3.5.25 | Composition API, `<script setup lang="ts">` |
| Vite | 7.3.1 | Build tool + dev server |
| TypeScript | (via vue-tsc) | Strict mode |
| Pinia | 3.0.4 | State management (setup syntax) |
| Tailwind CSS | 3.4.19 | Utility-first CSS |
| Zod | 4.3.6 | DTO + form validation |
| Axios | 1.13.5 | HTTP client with interceptors |
| Vue Router | 5.x | File-based routing with guards |
| pnpm | enforced | Package manager (`.npmrc`) |

**Missing:** No i18n framework (vue-i18n). No error boundary library. No a11y testing tool.

---

## 2. Architecture Assessment

### Pattern: Feature-Driven Design

```
src/
├── core/           # Infrastructure layer
│   ├── api/        # Axios instance, token service
│   ├── constants/  # Enums, pipeline stages, storage keys
│   ├── router/     # Route definitions + guards
│   ├── stores/     # Cross-feature stores (auth, team, payment, subscription, org)
│   └── utils/      # Error utils
├── features/       # 12 business domains
│   ├── admin/
│   ├── auth/
│   ├── candidate/
│   ├── company/
│   ├── interview/
│   ├── job/
│   ├── landing/
│   ├── offer/
│   ├── onboarding/
│   ├── payment/
│   ├── pipeline/
│   ├── plan/
│   ├── subscription/
│   └── workspace/
├── components/     # Shared UI primitives
└── stores/         # Global stores (workspace, pipeline)
```

**API Flow:** `Service (Axios) -> Store (Pinia) -> Composable (storeToRefs) -> Component`

### Structural Issues

| Issue | Severity | Location |
|-------|----------|----------|
| Duplicate pipeline stores | MEDIUM | `src/stores/usePipelineStore.ts` AND `src/features/pipeline/stores/usePipelineStore.ts` |
| Duplicate application services | MEDIUM | `features/candidate/services/application.service.ts` AND `features/pipeline/services/application.service.ts` AND `features/offer/services/application.service.ts` |
| Global stores split across two locations | LOW | `src/core/stores/` and `src/stores/` both contain cross-feature stores |
| No shared workspace layout | HIGH | Admin and Candidate have layout components; Workspace does not |
| Onboarding store wrong redirect | MEDIUM | `onboarding.store.ts` redirects candidate to WORKSPACE instead of JOB_BOARD |

---

## 3. Service Layer Inventory

22 service files across features:

| Feature | Service Files | Notes |
|---------|--------------|-------|
| admin | `admin.service.ts`, `knowledge.service.ts` | Admin operations + AI knowledge management |
| auth | `auth.service.ts` | Login, register, OTP, OAuth2, password flows |
| candidate | `candidate.service.ts`, `application.service.ts`, `user.service.ts`, `job.service.ts` | Profile, applications, user data, job board |
| company | `company.service.ts`, `team.service.ts`, `org.service.ts` | Company profile, team members, org structure |
| interview | `interview.service.ts`, `scorecard.service.ts`, `ai-interview.service.ts` | Scheduling, scoring, AI question generation |
| job | `job.service.ts`, `ai-job.service.ts` | Job CRUD, AI JD generation |
| offer | `offer.service.ts`, `application.service.ts` | Offer management, application context |
| onboarding | `onboarding.service.ts` | Employer/candidate onboarding |
| payment | `payment.service.ts` | PayOS payment flows |
| pipeline | `application.service.ts` | Pipeline application tracking |
| plan | `plan.service.ts` | Subscription plan listing |
| subscription | `subscription.service.ts` | Active subscription management |

---

## 4. Store Layer Inventory

19 stores identified:

| Location | Store | Pattern |
|----------|-------|---------|
| `core/stores/` | `auth.store.ts` | Setup syntax, router integration |
| `core/stores/` | `team.store.ts` | Team management |
| `core/stores/` | `payment.store.ts` | Payment state |
| `core/stores/` | `subscription.store.ts` | Subscription state |
| `core/stores/` | `org.store.ts` | Organization state |
| `stores/` | `useWorkspaceStore.ts` | Dashboard data aggregation |
| `stores/` | `usePipelineStore.ts` | Pipeline state (DUPLICATE) |
| `features/admin/stores/` | `admin.store.ts` | Admin operations |
| `features/candidate/stores/` | `candidate.store.ts` | Candidate profile |
| `features/candidate/stores/` | `my-applications.store.ts` | Candidate's applications |
| `features/candidate/stores/` | `job-board.store.ts` | Public job board |
| `features/company/stores/` | `useCompanyStore.ts` | Company profile |
| `features/interview/stores/` | `useInterviewStore.ts` | Interview management |
| `features/interview/stores/` | `useScorecardStore.ts` | Scorecard management |
| `features/offer/stores/` | `offer.store.ts` | Offer management |
| `features/onboarding/stores/` | `onboarding.store.ts` | Onboarding flow |
| `features/pipeline/stores/` | `usePipelineStore.ts` | Pipeline state (DUPLICATE) |
| `features/plan/stores/` | `plan.store.ts` | Plan listing |
| `features/job/stores/` | `useJobStore.ts` | Job management |

---

## 5. Route Structure Analysis

32 routes defined in `src/core/router/routes.ts`.

### Layout Wrapping

| Route Group | Layout | Status |
|-------------|--------|--------|
| `/auth/*` | Individual pages (AuthLayout exists but unused in routes) | ISSUE: AuthLayout not used |
| `/admin/*` | `AdminLayout.vue` (nested children) | CORRECT |
| `/candidate/*` | `CandidateLayout.vue` (nested children) | CORRECT |
| `/workspace/*` | NONE -- flat top-level routes | BROKEN (BUG-002) |
| `/onboarding/*` | NONE -- standalone pages | Acceptable |
| `/jobs`, `/offers` | NONE -- standalone | Mixed concern |

### Guard Logic (`src/core/router/index.ts`)

4 guard layers in `beforeEach`:
1. `guestOnly` -- redirect authenticated users
2. `requiresAuth` -- redirect to login
3. `companyProfileComplete` -- COMPANY_ADMIN onboarding gate (BROKEN -- see BUG-003/005)
4. `allowedRoles` + `permissions` -- role/permission check (`permissions` never works -- see BUG-003)

---

## 6. Enum Mismatches (FE vs BE)

| Enum | FE Values | BE DB Values | Delta |
|------|-----------|-------------|-------|
| `USER_ROLES` | SYSTEM_ADMIN, CUSTOMER_SERVICE, COMPANY_ADMIN, HR, INTERVIEWER, **EMPLOYER**, CANDIDATE | SYSTEM_ADMIN, CUSTOMER_SERVICE, COMPANY_ADMIN, HR, INTERVIEWER, CANDIDATE | FE has phantom `EMPLOYER` (not a BE role) |
| `JOB_STATUS` | DRAFT, PUBLISHED, CLOSED, **EXPIRED** | DRAFT, PUBLISHED, CLOSED | FE has phantom `EXPIRED` |
| `INTERVIEW_STATUS` | SCHEDULED, COMPLETED, **CANCELLED**, **NO_SHOW** | SCHEDULED, COMPLETED, **CANCELED** | Spelling mismatch (CANCELLED vs CANCELED) + FE has phantom `NO_SHOW` |
| `OFFER_STATUS` | DRAFT, SENT, ACCEPTED, DECLINED, **EXPIRED** | DRAFT, SENT, ACCEPTED, DECLINED | FE has phantom `EXPIRED` |
| `APPLICATION_STATUS` | NEW, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED | NEW, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED | MATCH |

**Impact:** Phantom enum values will never match BE data. Filter/display logic using phantom values produces dead branches. The `CANCELLED` vs `CANCELED` spelling mismatch causes interview status comparisons to fail silently.

---

## 7. Code Quality Metrics

### Type Safety

| Metric | Count | Files |
|--------|-------|-------|
| `as any` casts | 17 | 8 files (concentrated in workspace components/stores) |

**Hotspots:**
- `useWorkspaceStore.ts`: 3 casts -- `jobsRes.value.content as any`, `applicationsRes.value.content as any`, `interviewsRes.value as any`
- `useWorkspace.ts` composable: 3 casts
- `KanbanBoard.vue`: 1 cast
- `JobFormPage.vue`: 1 cast
- `ProfileForm.vue`: 1 cast

### Console Statements in Production Code

| Metric | Count | Files |
|--------|-------|-------|
| `console.log/warn/error` | 5 | 2 files |

**Locations:**
- `useWorkspaceStore.ts`: `console.error(e)` -- catch-all error swallowing
- `useWorkspace.ts` composable: 4 instances -- excessive logging

### TODO/FIXME/HACK Comments

| Metric | Count | Files |
|--------|-------|-------|
| `TODO/FIXME/HACK` | 5 | 4 files |

**Locations:**
- `useWorkspace.ts`: 1 TODO
- `JobPostingRow.vue`: 2 TODOs
- `CommentThread.vue`: 1 TODO
- SVG asset: 1 (irrelevant)

---

## 8. Workspace Store Deep Issues

`src/stores/useWorkspaceStore.ts` has multiple quality problems:

```typescript
// Issue 1: Empty jobId parameter -- what does this fetch?
applicationService.getApplications({ jobId: '', size: 50 })

// Issue 2: Triple fallback for interview date field -- fragile
.filter((i: any) => new Date(i.scheduledAt ?? i.startTime ?? i.date) >= now)

// Issue 3: Heavy as-any casting masks type errors
recentJobs.value = (jobsRes.value.content as any) ?? [];
```

**Root Problem:** The workspace store was migrated from mock data to real API calls but the response shapes were not properly typed. The `as any` casts paper over DTO mismatches between what the API returns and what the store expects.

---

## 9. Auth Architecture Issues

### JWT Claim Mismatch

The FE `parseUserFromJwt()` reads these claims from the JWT:
- `sub` -- EXISTS in BE JWT
- `roles` -- EXISTS in BE JWT
- `email_verified` -- EXISTS in BE JWT (but FE doesn't use it explicitly in AuthUser)
- `email` -- MISSING from BE JWT (defaults to `''`)
- `fullName` -- MISSING from BE JWT (defaults to `''`)
- `companyId` -- MISSING from BE JWT (defaults to `null`)
- `companyProfileComplete` -- MISSING from BE JWT (defaults to `false`)
- `avatarUrl` -- MISSING from BE JWT (defaults to `null`)
- `accountType` -- MISSING from BE JWT (attempted as roles fallback)

**Impact:** Every COMPANY_ADMIN user has `companyProfileComplete === false` permanently, trapping them in onboarding (BUG-003/005). User display name and email are always empty strings when derived from JWT.

### Token Refresh Behavior

Login response (`LoginResponse.java`) contains only: `accessToken`, `refreshToken`, `expiresIn`, `tokenType`. No user object. The FE falls back to JWT parsing via `response.user ?? parseUserFromJwt(response.accessToken)`, but `response.user` is always `undefined` (no `user` field in BE response). JWT parsing then produces incomplete user data as described above.

---

## 10. Error Handling Assessment

### parseApiError Coverage

```
BE error codes total: ~77
FE error code mappings: 7 (AUTH_001 through AUTH_006, RATE_LIMIT)
FE mappings that match BE codes: 0 (code format mismatch)
Effective coverage: 0%
```

All errors fall through to raw English `backendMessage`. See BUG-004 for full analysis.

### Error State Propagation

- Auth store: Consistent `clearError()` + `handleApiError()` pattern
- Other stores: Not audited individually but the pattern is inconsistent -- some stores propagate errors to components, others swallow them (e.g., `useWorkspaceStore` catches and `console.error`s)

---

## 11. Feature Completion Matrix

| Feature | Views | Service | Store | Tests | Status |
|---------|-------|---------|-------|-------|--------|
| Auth (Login/Register/OTP/Password) | 8 pages | Yes | Yes | Partial | COMPLETE |
| Onboarding (Employer/Candidate) | 2 pages | Yes | Yes | No | BLOCKED (BUG-005) |
| Company Settings | 1 page | Yes | Yes | No | PARTIAL (requires working company association) |
| Workspace Dashboard | 1 page | - | Yes | Yes | PARTIAL (fragile typing, English labels) |
| Pipeline / Kanban | 1 page | Yes | Yes (x2) | Yes | PARTIAL (duplicate stores, English labels) |
| Job Management | 3 pages (list, create, edit) | Yes + AI | Yes | No | PARTIAL (missing unpublish UI, draft management) |
| Interview Management | 3 pages (list, dashboard, scorecard) | Yes + AI | Yes (x2) | No | PARTIAL |
| Offer Management | 2 pages (dashboard, create) | Yes | Yes | No | COMPLETE |
| Candidate Portal (Profile) | 1 page (under layout) | Yes | Yes | No | COMPLETE |
| Job Board (Public) | 2 pages (list, detail) | Yes | Yes | No | COMPLETE |
| My Applications (Candidate) | 2 pages (list, detail) | Yes | Yes | No | COMPLETE |
| Subscription | 1 page | Yes | Yes | No | COMPLETE |
| Payment | 1 page | Yes | Yes | No | COMPLETE |
| Admin (Companies/Users/Transactions) | 3 pages (under layout) | Yes | Yes | No | COMPLETE |
| Plan Listing | - | Yes | Yes | No | COMPLETE (service only) |
| Landing | 1 page | - | - | No | COMPLETE |
| 404 | 1 page | - | - | No | COMPLETE |

### Missing FE Features (vs BE Capabilities)

| BE Capability | FE Status |
|--------------|-----------|
| `POST /companies` (create company) | NO ENDPOINT IN BE EITHER (BUG-005) |
| `GET /candidates/me/job-recommendations` (AI matching) | No FE page/component |
| `POST /candidates/me/cv-improvement` (AI CV advice) | No FE page/component |
| `POST /jobs/generate-description` (AI JD gen) | Exists in `ai-job.service.ts` |
| AI Interview Questions | Exists in `ai-interview.service.ts` |
| AI Salary Benchmark | No FE page/component |
| AI Application Screening | No FE page/component for trigger |
| Department CRUD | No FE page (only used internally?) |
| Invitation flow (send + accept) | Partial -- `InviteRegisterPage` exists for accept side |
| Job unpublish/close | No UI control (only create/edit) |
| Notification preferences | No FE page |
| User avatar/banner upload | No FE page |

---

## 12. Accessibility Assessment

**Not audited in detail.** Surface-level observations:

- No `aria-label` audit performed (would require reading all `.vue` templates)
- No skip-to-content links observed in layout components
- Color contrast for brand primary `#009898` on white background: ~3.7:1 (fails WCAG AA for normal text, passes for large text)
- No prefers-reduced-motion handling observed
- No keyboard navigation testing infrastructure

---

## 13. Test Coverage

### Existing Tests

| File | Type |
|------|------|
| `stores/__tests__/useWorkspaceStore.spec.ts` | Unit (store) |
| `features/workspace/components/__tests__/CandidateDetailPanel.spec.ts` | Unit (component) |
| `features/workspace/components/__tests__/KanbanBoard.spec.ts` | Unit (component) |
| `features/job/stores/__tests__/useJobStore.spec.ts` | Unit (store) |

**Total test files found: 4.** Coverage is minimal. No E2E tests. No integration tests with API mocks. No test utilities or factories beyond Pinia setup.

---

## 14. Priority Issues Summary

| Priority | Issue | Impact |
|----------|-------|--------|
| P0 | BUG-005: Employer onboarding completely broken | All employer functionality blocked |
| P0 | BUG-004: Zero functional error code mappings | All errors display in English |
| P1 | BUG-003: Blank pages from phantom JWT claims | Multiple user flows affected |
| P1 | Enum mismatches (CANCELLED vs CANCELED, phantom values) | Silent data comparison failures |
| P1 | BUG-002: No workspace layout wrapper | Visual inconsistency across workspace |
| P2 | BUG-001: English pipeline labels + search diacritics | Vietnamese UX degraded |
| P2 | `as any` casts in workspace stores | Type safety gaps |
| P2 | Duplicate stores/services | Maintenance confusion |
| P3 | Missing AI feature UIs | BE capabilities unused |
| P3 | Minimal test coverage (4 test files) | Regression risk |
| P3 | No i18n framework | Systematic localization impossible |
