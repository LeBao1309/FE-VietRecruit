# BUG_REGISTER.md -- Known Bug Register

> Generated: 2026-03-25 | Lead Orchestrator Agent | Documentation Only
> Source: Full BE + FE codebase deep read

---

## BUG-001: Vietnamese Diacritics Not Handled in Search/Filter

**Severity:** HIGH
**Domain:** Job Search, Candidate Search, Pipeline
**Status:** Open -- Root Cause Confirmed

### Symptom

Searching for Vietnamese text with diacritics (e.g., "Kỹ sư phần mềm") does not produce the same results as searching without diacritics ("Ky su phan mem"). Users expect accent-insensitive matching. Pipeline stage labels and various UI labels display English text instead of Vietnamese.

### Root Cause

Two distinct sub-causes:

**1. FE Pipeline Labels Are Hardcoded English**

`FE-VietRecruit/src/core/constants/pipeline-stages.ts` lines 15-21:
```typescript
{ status: APPLICATION_STATUS.NEW,        label: 'New',       ... },
{ status: APPLICATION_STATUS.SCREENING,  label: 'Screening', ... },
{ status: APPLICATION_STATUS.INTERVIEW,  label: 'Interview', ... },
{ status: APPLICATION_STATUS.OFFER,      label: 'Offer',     ... },
{ status: APPLICATION_STATUS.HIRED,      label: 'Hired',     ... },
{ status: APPLICATION_STATUS.REJECTED,   label: 'Rejected',  ... },
```

Every label string is English. No i18n, no Vietnamese override.

**2. FE Does Not Apply ICU/ASCII Folding to Search Queries**

The BE Elasticsearch indices use custom Vietnamese analyzers with ICU normalization (`ElasticsearchIndexInitializer`). However, the FE search components construct query strings and pass them directly to search API endpoints without any client-side normalization. The effectiveness of diacritics handling depends entirely on whether the BE analyzer configuration correctly applies ICU folding at both index-time and query-time. If the BE analyzer is misconfigured or the FE sends queries to non-analyzed fields, diacritics matching fails.

### Files Involved

| File | Role |
|------|------|
| `FE: src/core/constants/pipeline-stages.ts` | Hardcoded English labels |
| `FE: src/features/job/` (search components) | Query construction without normalization |
| `BE: common/config/elasticsearch/ElasticsearchIndexInitializer.java` | Vietnamese analyzer config |
| `BE: feature/job/service/impl/JobSearchServiceImpl.java` | ES query execution |

### Fix Direction

1. Replace English labels in `pipeline-stages.ts` with Vietnamese: "Moi", "Sang loc", "Phong van", "De nghi", "Tuyen dung", "Tu choi"
2. Audit all FE search inputs -- ensure queries go through analyzed ES fields, not `.keyword` sub-fields
3. Verify BE ES analyzer chain: tokenizer -> ICU normalizer -> lowercase -> ASCII folding at both index and query time

---

## BUG-002: Header/Footer Desync Across Workspace Pages

**Severity:** MEDIUM
**Domain:** Workspace, Layout, Navigation
**Status:** Open -- Root Cause Confirmed

### Symptom

Navigating between workspace pages (Dashboard, Pipeline, Jobs, Interviews, Scorecards, Offers) causes the header, sidebar, or footer to render inconsistently. Some pages show different navigation states. The user experience feels disconnected across what should be a unified workspace.

### Root Cause

**Workspace routes lack a shared layout component.**

`FE-VietRecruit/src/core/router/routes.ts` defines workspace routes as independent top-level routes:
```typescript
{ path: '/workspace',           component: () => import('.../WorkspacePage.vue'), ... },
{ path: '/workspace/pipeline',  component: () => import('.../PipelinePage.vue'), ... },
{ path: '/workspace/jobs',      component: () => import('.../JobListPage.vue'), ... },
{ path: '/workspace/interviews',component: () => import('.../InterviewListPage.vue'), ... },
{ path: '/workspace/scorecards',component: () => import('.../ScorecardDashboard.vue'), ... },
{ path: '/offers',              component: () => import('.../OfferDashboardView.vue'), ... },
```

Each is a standalone route. No parent route with a layout component wrapping them. Compare with Admin and Candidate, which correctly use layout wrappers:

```typescript
// Admin -- CORRECT: nested under AdminLayout
{ path: '/admin', component: () => import('.../AdminLayout.vue'),
  children: [{ path: 'companies', ... }, { path: 'users', ... }] }

// Candidate -- CORRECT: nested under CandidateLayout
{ path: '/candidate', component: () => import('.../CandidateLayout.vue'),
  children: [{ path: 'profile', ... }] }
```

Each workspace page independently renders its own header/sidebar (or doesn't), leading to visual desync.

### Files Involved

| File | Role |
|------|------|
| `FE: src/core/router/routes.ts` lines 76-106 | Workspace routes without parent layout |
| `FE: src/features/admin/components/AdminLayout.vue` | Reference: correct layout pattern |
| `FE: src/features/candidate/components/CandidateLayout.vue` | Reference: correct layout pattern |
| Missing: `FE: src/features/workspace/components/WorkspaceLayout.vue` | Does not exist |

### Fix Direction

1. Create `WorkspaceLayout.vue` with shared sidebar navigation, header, and footer
2. Refactor workspace routes into nested children under a parent `/workspace` route using `WorkspaceLayout` as the component
3. Move `/offers` under `/workspace/offers` for consistency
4. Include navigation items: Dashboard, Pipeline, Jobs, Interviews, Scorecards, Offers, Company Settings, Subscription

---

## BUG-003: Blank Pages on Navigation for Certain Role/State Combinations

**Severity:** HIGH
**Domain:** Router, Auth Guards, Loading States
**Status:** Open -- Multiple Contributing Factors

### Symptom

Users (primarily new COMPANY_ADMIN accounts and edge-case CANDIDATE accounts) occasionally land on blank/white pages after login or during navigation. No error is displayed. The page renders but the component content area is empty.

### Root Cause

Multiple contributing factors identified:

**1. COMPANY_ADMIN Onboarding Trap**

Router guard (`src/core/router/index.ts` lines 27-34):
```typescript
if (
  to.meta.requiresAuth &&
  to.path !== '/onboarding/employer' &&
  auth.user?.roles?.includes('COMPANY_ADMIN') &&
  !auth.user?.companyProfileComplete
) {
  return next({ path: '/onboarding/employer' })
}
```

`companyProfileComplete` is parsed from JWT claims that do not exist in the BE JWT (`JwtService.generateAccessToken()` only includes `sub`, `roles`, `email_verified`). Result: `companyProfileComplete` is always `undefined`/`false`. Every COMPANY_ADMIN is permanently redirected to `/onboarding/employer`.

On the onboarding page, the component calls `GET /vietrecruit/companies/me` which invokes `BaseController.resolveCompanyId()`. Since `user.companyId` is `null` (never set during registration), this throws:

```java
throw new ApiException(ApiErrorCode.FORBIDDEN, "User is not associated with any company");
```

The onboarding page receives a 403 error. If the error is not handled gracefully in the component's `onMounted` hook, the page renders its template shell but with empty data -- appearing blank.

**2. Missing Loading States**

Multiple view components fetch data in `onMounted()` but lack explicit loading/error UI states. When the API call is in-flight or fails silently, the user sees an empty template.

**3. Permission Guard Silent Redirect**

Router guard (`src/core/router/index.ts` lines 44-63) reads `permissions` from JWT payload. The BE JWT does not include a `permissions` claim. The `payload.permissions || []` fallback means any route with `permissions` meta will fail the check and redirect to `resolvePostLoginRoute()`. If the redirect target also has permission requirements, this creates a redirect loop that results in a blank page.

Currently only `AdminTransactions` uses `permissions: ['TRANSACTION:VIEW_ALL']`. This route is inaccessible to all users because the JWT never contains permissions.

### Files Involved

| File | Role |
|------|------|
| `FE: src/core/router/index.ts` lines 27-34, 44-63 | Guard logic with phantom JWT claims |
| `FE: src/core/stores/auth.store.ts` (`parseUserFromJwt`) | Reads non-existent JWT claims |
| `BE: common/security/JwtService.java` | JWT only has `sub`, `roles`, `email_verified` |
| `BE: common/base/BaseController.java` line 35 | Throws when companyId is null |
| `BE: feature/auth/service/impl/AuthServiceImpl.java` line 125-173 | Creates user without companyId |
| `FE: features/onboarding/views/EmployerOnboardingPage.vue` | Calls GET /companies/me on mount |

### Fix Direction

1. **BE**: Add `companyId`, `companyProfileComplete` claims to JWT (or add a dedicated `GET /users/me` endpoint that returns full user context)
2. **BE**: Create `POST /companies` endpoint or modify `PUT /companies/me` to handle company creation for users with null companyId
3. **FE**: Add loading/error/empty states to all view components
4. **FE**: Remove or gate the `permissions` check until BE includes permissions in JWT
5. **FE**: Onboarding page must gracefully handle 403 from `/companies/me` and present a company creation form instead

---

## BUG-004: Notifications and Error Messages Display in English

**Severity:** HIGH
**Domain:** Error Handling, i18n, UX
**Status:** Open -- Root Cause Confirmed

### Symptom

When API errors occur (validation failures, business rule violations, forbidden access), users see English error messages instead of Vietnamese. Toast notifications, form validation errors, and inline error banners all display raw English strings from the backend.

### Root Cause

**The FE error code mapping is completely non-functional against the current BE.**

`FE-VietRecruit/src/core/utils/error.utils.ts` maps these codes:
```typescript
const ERROR_CODE_MAP: Record<string, string> = {
  'AUTH_001': '...',  'AUTH_002': '...',  'AUTH_003': '...',
  'AUTH_004': '...',  'AUTH_005': '...',  'AUTH_006': '...',
  'RATE_LIMIT': '...',
}
```

The BE `ApiErrorCode` enum sends codes in a completely different format:
```
AUTH_INVALID_CREDENTIALS, AUTH_ACCOUNT_LOCKED, AUTH_ACCOUNT_INACTIVE,
AUTH_OTP_INVALID, AUTH_OTP_EXPIRED, AUTH_OTP_COOLDOWN, AUTH_OTP_LOCKED,
AUTH_EMAIL_NOT_VERIFIED, AUTH_PASSWORD_MISMATCH, AUTH_RESET_TOKEN_INVALID,
AUTH_TOKEN_EXPIRED, AUTH_TOKEN_INVALID, AUTH_REFRESH_TOKEN_EXPIRED,
AUTH_REFRESH_TOKEN_INVALID, ...
```

**Zero of the 7 FE mappings match any BE error code.** `AUTH_001` does not exist in the BE. Every error falls through to line 41:
```typescript
const backendMessage = axiosErr.response?.data?.message
if (backendMessage) return backendMessage  // <-- Raw English from BE
```

The BE defines **60+ error codes**, all with English messages. None are mapped in the FE.

Additionally:
- Pipeline stage labels in `pipeline-stages.ts` are all English (see BUG-001)
- `enums.ts` contains an `EMPLOYER` role that does not exist in BE (`UserRole` has no EMPLOYER)
- No i18n framework is installed (no vue-i18n, no locale files)

### Full BE Error Code Inventory (missing from FE)

| Category | Count | Example Codes |
|----------|-------|---------------|
| Generic | 8 | VALIDATION_ERROR, BAD_REQUEST, NOT_FOUND, FORBIDDEN, UNAUTHORIZED, INTERNAL_ERROR, TOO_MANY_REQUESTS, SERVICE_UNAVAILABLE |
| Auth | 14 | AUTH_INVALID_CREDENTIALS, AUTH_TOKEN_EXPIRED, AUTH_ACCOUNT_LOCKED, AUTH_OTP_INVALID, AUTH_EMAIL_NOT_VERIFIED, ... |
| User | 2 | USER_USERNAME_CONFLICT, USER_EMAIL_CONFLICT |
| Notification | 1 | NOTIFICATION_SEND_FAILED |
| Subscription | 3 | SUBSCRIPTION_REQUIRED, SUBSCRIPTION_EXPIRED, SUBSCRIPTION_ALREADY_ACTIVE |
| Payment | 6 | PAYMENT_CREATION_FAILED, PAYMENT_NOT_FOUND, PAYMENT_ALREADY_PENDING, PAYMENT_EXPIRED, PAYMENT_ACTIVATION_FAILED, PAYMENT_WEBHOOK_INVALID_SIGNATURE |
| Candidate/File | 6 | CANDIDATE_NOT_FOUND, CANDIDATE_CV_INVALID_TYPE, CANDIDATE_CV_SIZE_EXCEEDED, FILE_TOO_LARGE, FILE_TYPE_NOT_ALLOWED, STORAGE_UNAVAILABLE |
| Application | 5 | APPLICATION_NOT_FOUND, APPLICATION_DUPLICATE, APPLICATION_INVALID_TRANSITION, APPLICATION_CV_REQUIRED, JOB_NOT_PUBLISHED |
| Interview | 4 | INTERVIEW_NOT_FOUND, INTERVIEW_INVALID_STATUS, INTERVIEW_INVALID_INTERVIEWER, INTERVIEW_INVALID_STATUS_TRANSITION |
| Scorecard | 4 | SCORECARD_NOT_FOUND, SCORECARD_DUPLICATE, SCORECARD_NOT_ELIGIBLE, SCORECARD_INTERVIEW_NOT_READY |
| Offer | 4 | OFFER_NOT_FOUND, OFFER_ALREADY_EXISTS, OFFER_INVALID_TRANSITION, OFFER_APPLICATION_NOT_READY |
| Invitation | 5 | INVITATION_NOT_FOUND, INVITATION_EXPIRED, INVITATION_ALREADY_ACCEPTED, INVALID_ACCOUNT_TYPE, INVALID_INVITATION_ROLE, ROLE_GROUP_VIOLATION |
| AI | 7 | AI_SERVICE_UNAVAILABLE, AI_INVALID_RESPONSE, CV_NOT_PARSED, CV_IMPROVEMENT_UNAVAILABLE, INTERVIEW_QUESTIONS_UNAVAILABLE, SALARY_BENCHMARK_UNAVAILABLE, JD_GENERATION_UNAVAILABLE |
| Quota | 1 | QUOTA_EXCEEDED |
| Department | 1 | DEPARTMENT_NOT_FOUND |
| Concurrency | 1 | CONCURRENT_MODIFICATION |
| Conflict | 1 | CONFLICT |
| User Avatar/Banner | 4 | USER_AVATAR_INVALID_TYPE, USER_AVATAR_SIZE_EXCEEDED, USER_BANNER_INVALID_TYPE, USER_BANNER_SIZE_EXCEEDED |
| Plan | 1 | PLAN_NOT_FOUND |

**Total: ~77 BE error codes. FE maps: 0 (zero functional matches).**

### Files Involved

| File | Role |
|------|------|
| `FE: src/core/utils/error.utils.ts` | 7 non-functional mappings, English fallback |
| `FE: src/core/constants/pipeline-stages.ts` | English pipeline labels |
| `FE: src/core/constants/enums.ts` | Contains phantom EMPLOYER role |
| `BE: common/enums/ApiErrorCode.java` | 77 error codes, all English messages |
| `BE: common/exception/GlobalExceptionHandler.java` | Sends code + English message in response |

### Fix Direction

1. **Replace entire ERROR_CODE_MAP** with correct BE code mappings. All 77 codes need Vietnamese translations
2. **Remove the raw English fallback** on line 41. Replace with a category-based fallback (e.g., all `AUTH_*` -> generic auth error in Vietnamese)
3. **Translate pipeline-stages.ts** labels to Vietnamese
4. **Remove phantom EMPLOYER role** from enums.ts
5. Consider installing `vue-i18n` for systematic i18n if the app will support multiple languages

---

## BUG-005: "User is not associated with any company" Error for New Employers

**Severity:** CRITICAL
**Domain:** Auth, Company, Onboarding
**Status:** Open -- Full Root Cause Chain Traced

### Symptom

A newly registered employer (COMPANY_ADMIN) completes email verification and logs in. They are redirected to `/onboarding/employer`. The onboarding page immediately shows an error: "User is not associated with any company" (HTTP 403). The user cannot proceed. They are permanently locked out of all employer functionality.

### Root Cause -- Full Chain

```
Registration
    |
    v
AuthServiceImpl.register() [BE: auth/service/impl/AuthServiceImpl.java:125-173]
    - Creates User entity with companyId = null
    - Only creates Candidate entity for accountType=CANDIDATE
    - NO Company entity created for EMPLOYER accounts
    - NO companyId assigned
    |
    v
JwtService.generateAccessToken() [BE: common/security/JwtService.java]
    - JWT contains ONLY: sub (userId), roles, email_verified
    - Does NOT include: companyId, email, fullName, companyProfileComplete, avatarUrl
    |
    v
FE: parseUserFromJwt() [FE: core/stores/auth.store.ts]
    - Decodes JWT
    - Reads companyId -> undefined (claim missing)
    - Reads companyProfileComplete -> false (claim missing, defaults to falsy)
    |
    v
FE: Router beforeEach guard [FE: core/router/index.ts:27-34]
    - Detects COMPANY_ADMIN + companyProfileComplete === false
    - Redirects to /onboarding/employer
    |
    v
FE: EmployerOnboardingPage.vue [FE: features/onboarding/views/]
    - Calls GET /vietrecruit/companies/me
    |
    v
CompanyController.getCompany() [BE: feature/company/controller/CompanyController.java]
    - Calls resolveCompanyId() from BaseController
    |
    v
BaseController.resolveCompanyId() [BE: common/base/BaseController.java:26-40]
    - Fetches User by ID
    - user.getCompanyId() returns null
    - THROWS: ApiException(FORBIDDEN, "User is not associated with any company")
    |
    v
HTTP 403 returned to FE. Onboarding page cannot render company data.
User is stuck. No exit path exists.
```

**Critical architectural gap:** No endpoint exists to CREATE a company for a new employer.

- `CompanyController` only has:
  - `GET /companies/me` -- requires existing companyId
  - `PUT /companies/me` -- requires existing companyId
- `CompanyServiceImpl` only has:
  - `getCompany(UUID companyId)` -- requires existing company
  - `updateCompany(UUID companyId, request)` -- requires existing company
- No `POST /companies` endpoint
- No `createCompany()` service method
- Registration does not auto-create a company

### Files Involved

| File | Line(s) | Role |
|------|---------|------|
| `BE: feature/auth/service/impl/AuthServiceImpl.java` | 125-173 | User created with null companyId |
| `BE: common/security/JwtService.java` | generateAccessToken() | Missing company claims |
| `BE: common/base/BaseController.java` | 26-40 | resolveCompanyId() throws on null |
| `BE: feature/company/controller/CompanyController.java` | all | No POST endpoint |
| `BE: feature/company/service/impl/CompanyServiceImpl.java` | all | No create method |
| `FE: core/stores/auth.store.ts` | parseUserFromJwt() | Reads phantom JWT claims |
| `FE: core/router/index.ts` | 27-34 | Permanent onboarding redirect |
| `FE: features/onboarding/views/EmployerOnboardingPage.vue` | onMounted | Calls GET /companies/me |

### Fix Direction (Requires BE Changes)

**Option A: Auto-create company during registration**
- In `AuthServiceImpl.register()`, when accountType=EMPLOYER, create a Company entity, set `user.companyId = company.id`, persist both
- Pros: Simplest fix, single transaction
- Cons: Company name not known at registration time (would need placeholder)

**Option B: Add POST /companies endpoint**
- Add `createCompany()` to CompanyService
- Add `POST /vietrecruit/companies` to CompanyController
- Modify FE onboarding: if GET /companies/me returns 403, show company creation form, call POST /companies
- Pros: Clean separation, company data collected during onboarding
- Cons: Requires FE + BE changes, two-step flow

**Option C: Make PUT /companies/me handle creation (upsert)**
- If `resolveCompanyId()` fails, create a new company and associate it with the user
- Pros: Minimal API surface change
- Cons: PUT semantics are wrong for creation

**Recommended: Option B.** It preserves REST semantics and maps cleanly to the existing onboarding UX flow.

### FE-Side Mitigations (Parallel Track)

1. Onboarding page: catch 403 from GET /companies/me, render company creation form
2. After company creation: refresh JWT (call refresh token endpoint) to get updated claims
3. Add `companyProfileComplete` logic to `GET /users/me` response or new JWT claims
4. Router guard: check against actual user endpoint, not JWT claims

---

## Cross-Bug Dependencies

```
BUG-005 (Company Association) ──blocks──> BUG-003 (Blank Pages, partially)
BUG-004 (English Errors)      ──amplifies──> BUG-005 (error message is English)
BUG-001 (Vietnamese Labels)   ──related──> BUG-004 (both are i18n failures)
BUG-002 (Layout Desync)       ──independent──
```

## Priority Order for Fix

1. **BUG-005** -- CRITICAL. Blocks all employer functionality. Requires BE + FE.
2. **BUG-004** -- HIGH. Every error is English. FE-only fix (error mapping rewrite).
3. **BUG-003** -- HIGH. Blank pages. Partially blocked by BUG-005. FE + guard refactor.
4. **BUG-001** -- HIGH. Vietnamese labels + search. FE-only for labels, audit for search.
5. **BUG-002** -- MEDIUM. Layout desync. FE-only. Independent, can be done anytime.
