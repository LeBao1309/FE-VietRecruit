# UI vs BE-Flows Gap Report

Generated: 2026-03-22
Project: vietrecruit-fe (v0.0.0)
Scanned: **87** .vue files | **6** flows | **~65** API endpoints (OpenAPI 3.1)

---

## ✅ SOURCES LOADED

```
api.json          → ~65 endpoints mapped (OpenAPI 3.1, 7162 lines)
BE flows          → 6 flows: Auth, Candidate, Employer&HR, Interviewer, SYSTEM, StateMachine
route-names.ts    → 32 routes
stores/           → 7 stores (auth, org, payment, subscription, team, pipeline, workspace)
composables/      → 4 composables (useIntersectionObserver, useSectionLazy, useWorkspace, useOnboarding)
feature services  → 14 services (auth, job, application, interview, scorecard, offer, payment, subscription, onboarding, company, org, team, candidate, plan)
```

---

## 📁 SCAN COMPLETE

```
Total .vue files found       : 87
Files with hardcoded data    : 21
Files already wired to API   : 42
Files with mock data only    : 5
Files with no API call       : 24 (some correctly static, e.g. landing components)
Files with loading state     : 42
Files missing loading state  : 3  (where they should have one)
```

---

## 📊 Executive Summary

| Metric | Count |
|--------|-------|
| Flows defined in BE-document | 6 |
| Flows fully implemented in UI | 2 |
| Flows partially implemented | 3 |
| Flows not started | 1 |
| .vue files with hardcoded data | 21 |
| .vue files missing loading state | 3 |
| .vue files missing error state | 2 |
| API endpoints unused by FE | ~8 |
| API endpoints called but wrong | 2 |
| Enum mismatches with BE | 1 (critical) |

**Overall UI health: 🟠 Needs work**

---

## 🔴 CRITICAL GAPS

### [FLOW: Workspace Dashboard — All data is mock]
- **File**: `src/stores/useWorkspaceStore.ts` + `src/features/workspace/composables/useWorkspace.ts`
- **Issue**: `fetchWorkspaceData()` loads ALL data from `pipeline.mock.ts` (mockJobs, mockApplications, mockInterviews). No real API call is made. Uses `setTimeout(500)` to fake latency.
- **BE Flow spec**: Should call real API endpoints for jobs, applications, and interviews
- **Current behavior**: Always shows the same 2 mock jobs, 2 mock applications, 1 mock interview — regardless of actual data
- **Impact**: 🔴 Employer dashboard shows completely fabricated recruitment data
- **Fix needed**: Replace mock imports with real API calls:
  - `GET /vietrecruit/jobs` for recent jobs
  - `GET /vietrecruit/applications` for application pipeline
  - `GET /vietrecruit/interviews` for upcoming interviews
- **TODO markers found**: `// TODO(api-ready): replace mock → GET /api/workspace/dashboard` (line 18, 33 of useWorkspace.ts)

---

### [FLOW: Pipeline Sidebar — Stats fully hardcoded]
- **File**: `src/features/workspace/components/PipelineSidebar.vue`
- **Lines**: 34-40
- **Issue**: Stats array is hardcoded with static values:
  ```
  { label: "Đã nộp", count: 12, percent: 100, color: "#008C8C" }
  { label: "Sàng lọc", count: 4, percent: 33, color: "#008C8C" }
  { label: "Phỏng vấn", count: 2, percent: 17, color: "#008C8C" }
  { label: "Đề nghị", count: 1, percent: 8, color: "#008C8C" }
  { label: "Đã tuyển", count: 1, percent: 8, color: "#059669" }
  ```
- **BE Flow spec**: Pipeline stats should be computed from `GET /vietrecruit/applications?jobId=...` grouped by status
- **Current behavior**: Shows static numbers (12, 4, 2, 1, 1) regardless of selected job or real data
- **Impact**: 🔴 HR sees completely wrong pipeline statistics on every job
- **Fix needed**: Compute stats reactively from `usePipelineStore().applicationsByStatus` or add a dedicated stats endpoint
- **Additional issue**: Hardcoded conversion rate "8.3%" at line 126

---

### [ENUM MISMATCH: `APPLICATION_STATUS` in `enums.ts` vs BE flow statuses]
- **File**: `src/core/constants/enums.ts` (lines 29-36)
- **Issue**: The global `APPLICATION_STATUS` enum defines:
  ```
  PENDING, REVIEWING, SHORTLISTED, REJECTED, ACCEPTED
  ```
  But the BE flow (StateMachine.md) uses:
  ```
  NEW, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
  ```
- **Mitigation**: `src/features/pipeline/types/application.dto.ts` has the CORRECT statuses (`NEW, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED`) aliased from workspace types
- **Impact**: 🔴 Any component importing from `@/core/constants/enums.ts` instead of `@/features/pipeline/types/application.dto.ts` will use wrong status values
- **Files at risk**: Any new code using `APPLICATION_STATUS` from the global enums file
- **Fix needed**: Update `APPLICATION_STATUS` in `enums.ts` to match BE states: `NEW, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED`

---

### [FLOW: Pipeline Sidebar — Empty nav routes (analytics & settings)]
- **File**: `src/features/workspace/components/PipelineSidebar.vue`
- **Lines**: 24, 29
- **Issue**: Two nav items have `to: ""` (empty string route):
  - `analytics → to: ""`
  - `settings → to: ""`
- **Current behavior**: Clicking shows a toast "Tính năng [...] đang được phát triển" which is UX acceptable but router receives empty string
- **BE Flow spec**: No flow defined for analytics yet, but settings should route to `CompanySettings`
- **Impact**: 🔴 Settings link doesn't go anywhere even though `CompanySettings` route exists
- **Fix needed**: 
  - `settings` → `{ name: ROUTE_NAMES.COMPANY_SETTINGS }`
  - `analytics` → keep toast but add `meta: { comingSoon: true }` pattern

---

### [FLOW: AI Screening — Endpoint path mismatch]
- **File**: `src/features/pipeline/services/application.service.ts`
- **Issue**: FE calls `POST /vietrecruit/applications/{id}/ai-screening` (per test spec at line 125), but BE flow documents `POST /applications/jobs/{jobId}/screening/trigger` (Employer&HR.md line 72)
- **BE Flow spec**: `POST /applications/jobs/{jobId}/screening/trigger` (triggers BATCH screening per job, not per application)
- **Current behavior**: FE sends request per-application ID, BE expects per-job ID
- **Impact**: 🔴 AI screening will 404 or fail silently — feature broken
- **Fix needed**: Change service to call `POST /vietrecruit/applications/jobs/{jobId}/screening/trigger` and batch-trigger per job, not per individual application

---

### [FLOW: Offer Module — Mock API still referenced in codebase]
- **File**: `src/features/offer/mocks/offer.mock.ts`
- **Issue**: A full mock API implementation (`offerApiMock`) exists with fake CRUD operations and `setTimeout(500)` delays. While `useOfferStore` correctly uses `offerService` (real API), the mock file is still imported elsewhere
- **BE Flow spec**: Offer lifecycle: `POST /applications/{id}/offers` → `PUT /offers/{id}/send` → `PUT /offers/{id}/respond`
- **Impact**: 🟠 Mock file exists as dead code; any accidental import will use fake data
- **Fix needed**: Delete `offer.mock.ts` or ensure it's only used in tests

---

## 🟠 MAJOR GAPS

### [FLOW: Pipeline — Hardcoded stage colors in COLUMN_CONFIG]
- **File**: `src/features/workspace/views/PipelinePage.vue` (lines 45-52)
- **Issue**: `COLUMN_CONFIG` hardcodes color hex values for each stage:
  ```
  NEW: '#64748B', SCREENING: '#F59E0B', INTERVIEW: '#3B82F6',
  OFFER: '#8B5CF6', HIRED: '#10B981', REJECTED: '#EF4444'
  ```
  These colors differ from `pipeline.mock.ts` stage colors (e.g. SCREENING: `#009898` vs `#F59E0B`)
- **Impact**: Inconsistent color scheme between PipelinePage and other components using mock stage colors
- **Fix needed**: Create a shared `PIPELINE_STAGE_CONFIG` constant with label + color, use across all components

---

### [FLOW: Pipeline — Duplicate stage color definitions]
- **Files affected**:
  - `pipeline.mock.ts` (lines 53-60): `#6B7280, #009898, #7C3AED, #D97706, #059669, #DC2626`
  - `PipelinePage.vue` (lines 46-51): `#64748B, #F59E0B, #3B82F6, #8B5CF6, #10B981, #EF4444`
  - `PipelineSidebar.vue` (lines 35-39): `#008C8C, #008C8C, #008C8C, #008C8C, #059669`
- **Issue**: Three different color palettes for the same pipeline stages
- **Impact**: Confusing UX — sidebar, kanban board, and workspace show different colors for same stages
- **Fix needed**: Single source of truth: `PIPELINE_STAGE_COLORS` constant

---

### [FLOW: Workspace Dashboard — Team Presence is mock HTML]
- **File**: `src/features/workspace/views/WorkspacePage.vue` (line 368)
- **Issue**: "Team Presence" section is commented as `<!-- Team Presence (Mock) -->` with static HTML avatars
- **BE Flow spec**: Should fetch from `GET /invitations` or team members endpoint
- **Impact**: Always shows same fake team members
- **Fix needed**: Wire to `useTeamStore().fetchAll()` or display actual company members

---

### [FLOW: Candidate Screening — FE GET endpoint mismatch]
- **File**: `src/features/pipeline/services/application.service.ts`
- **Issue**: FE uses `GET /vietrecruit/applications` with `jobId` param to fetch screening results, but BE flow specifies a dedicated `GET /applications/jobs/{jobId}/screening` endpoint that returns `ApplicationScreeningResponse[]` sorted by `aiScore desc`
- **Impact**: Screening results may not be properly sorted by AI score; may miss screening-specific response fields
- **Fix needed**: Add dedicated screening results fetcher using `GET /vietrecruit/applications/jobs/{jobId}/screening`

---

### [FLOW: OFFER_STATUS enum mismatch with BE]
- **File**: `src/core/constants/enums.ts` (lines 46-53)
- **Issue**: FE `OFFER_STATUS` has `PENDING` but BE `StateMachine.md` uses `SENT`. FE uses `DECLINED` but BE uses `DECLINED`. FE has `EXPIRED` but no `SENT` status.
  ```
  FE: DRAFT, PENDING, ACCEPTED, DECLINED, EXPIRED
  BE: DRAFT, SENT, ACCEPTED, DECLINED
  ```
- **Impact**: Offer status display may show wrong badges. Status transitions may fail.
- **Fix needed**: Change `PENDING` → `SENT` in `OFFER_STATUS`, verify `EXPIRED` handling

---

## 🟡 MINOR GAPS

### [FLOW: Workspace Pipeline — updateApplicationStage uses mock logic]
- **File**: `src/features/workspace/composables/useWorkspace.ts` (line 32-38)
- **Issue**: `updateApplicationStage()` mutates local array directly instead of calling API
- **TODO marker**: `// TODO(api-ready): replace mock → PATCH /api/applications/:id/stage`
- **BE Flow spec**: `PUT /applications/{id}/status`
- **Impact**: Stage changes are lost on refresh
- **Fix needed**: Call `applicationService.updateStatus(id, { status: newStage })`
- **Note**: `usePipelineStore.moveApplication()` already has correct optimistic update logic — consolidate

---

### [FLOW: JobPostingRow — Mock headcount field]
- **File**: `src/features/workspace/components/JobPostingRow.vue` (line 39)
- **TODO marker**: `<!-- TODO(api-ready): replace mock field job.headcount → jobs.headcount -->`
- **Impact**: Headcount display shows mock value
- **Fix needed**: Map from `JobResponse` API field once available

---

### [FLOW: CommentThread — Mock user lookup]
- **File**: `src/features/workspace/components/CommentThread.vue` (line 33)
- **TODO marker**: `<!-- TODO(api-ready): history.changed_by → fetch user detail -->`
- **Impact**: Status change history shows raw user ID instead of name
- **Fix needed**: Resolve `changed_by` UUID to user name via user service

---

### [FLOW: Auth Login — Login routes to 'Workspace' hardcoded]
- **File**: `src/core/stores/auth.store.ts` (line 54)
- **Issue**: On login, always routes to `{ name: 'Workspace' }` regardless of user role
- **BE Flow spec**: CANDIDATE should go to job board, EMPLOYER/HR to workspace, INTERVIEWER to their dashboard
- **Impact**: Candidates land on employer workspace after login
- **Fix needed**: Route based on `user.role` from token:
  - `CANDIDATE` → `ROUTE_NAMES.JOB_BOARD`
  - `EMPLOYER/HR/COMPANY_ADMIN` → `ROUTE_NAMES.WORKSPACE`
  - `INTERVIEWER` → `ROUTE_NAMES.INTERVIEWER_DASHBOARD`
  - `SYSTEM_ADMIN` → `ROUTE_NAMES.ADMIN_DASHBOARD`

---

## 🔵 INFO / TECH DEBT

### [Hardcoded brand color `#008C8C` across workspace components]
- **Files affected**: PipelineSidebar.vue, PipelineTopBar.vue, KanbanColumn.vue, CandidateCard.vue, CandidateDetailPanel.vue, StageTransitionModal.vue, AiScoreBadge.vue, JobPostingRow.vue
- **Issue**: ~40+ inline Tailwind classes reference `#008C8C`, `#007070`, `#009898`, `#059669`, `#d97706` directly
- **Fix needed**: Extract to Tailwind `theme.extend.colors` (e.g., `brand-teal`, `brand-teal-dark`)

---

### [Duplicate `ApplicationStatus` type definitions]
- **Files**: 
  - `src/core/constants/enums.ts` → `APPLICATION_STATUS` (wrong values)
  - `src/features/workspace/types/index.ts` → `ApplicationStatus` type (correct values)
  - `src/features/pipeline/types/application.dto.ts` → re-exports from workspace (correct)
- **Fix needed**: Remove incorrect `APPLICATION_STATUS` from `enums.ts` or update it; single source of truth

---

### [Pipeline mock file still in production bundle]
- **File**: `src/features/workspace/mocks/pipeline.mock.ts`
- **Issue**: Imported at runtime in `useWorkspaceStore.ts` and `useWorkspace.ts` — not tree-shaken
- **Fix needed**: Remove mock imports once APIs are wired; move to `__tests__/` or `__mocks__/`

---

### [`isDashboard` flag in navItems]
- **File**: `src/features/workspace/components/PipelineSidebar.vue` (lines 9-31)
- **Issue**: `isDashboard` boolean flag controls whether `isExactActive` or `isActive` is used for active styling. This is a workaround for Vue Router's default matching behavior.
- **Fix needed**: Move to proper `exact` prop or route meta instead of per-item flag

---

## 📋 Hardcode Inventory

| File | Lines | Type | Value | Should Come From |
|------|-------|------|-------|-----------------|
| PipelineSidebar.vue | 34-39 | Array | stats[5] with counts (12,4,2,1,1) | Computed from `applicationsByStatus` |
| PipelineSidebar.vue | 34-39 | Color | `#008C8C`, `#059669` | `PIPELINE_STAGE_COLORS` constant |
| PipelineSidebar.vue | 126 | Number | `8.3%` conversion rate | Computed from stats |
| PipelineSidebar.vue | 24, 29 | Route | `to: ""` for analytics/settings | `ROUTE_NAMES.*` or `comingSoon` meta |
| PipelinePage.vue | 46-51 | Object | COLUMN_CONFIG colors | `PIPELINE_STAGE_COLORS` constant |
| pipeline.mock.ts | 54-59 | Array | `pipelineStages` with colors | `PIPELINE_STAGE_COLORS` constant |
| useWorkspaceStore.ts | 38-40 | Import | mockJobs, mockApplications, mockInterviews | Real API calls |
| useWorkspace.ts | 22-24 | Import | mockApplications, mockJobs, mockInterviews | Real API calls |
| enums.ts | 29-35 | Enum | `APPLICATION_STATUS` (wrong values) | Match BE: NEW→HIRED |
| enums.ts | 46-52 | Enum | `OFFER_STATUS.PENDING` | Should be `SENT` per BE |
| WorkspacePage.vue | 368+ | HTML | Team Presence mock avatars | `useTeamStore().members` |
| AiScoreBadge.vue | 9-11 | Color | `#059669`, `#d97706`, `#6b7280` | Tailwind theme colors |
| CandidateDetailPanel.vue | 127-276 | Color | Multiple `#008C8C` references | Tailwind `brand-*` classes |

---

## 🔗 API Endpoints — Usage Status

| Endpoint | Method | Used by FE? | File / Service | Status |
|----------|--------|-------------|----------------|--------|
| `/auth/register` | POST | ✅ Yes | auth.service.ts | ✅ Correct |
| `/auth/register/invite` | POST | ✅ Yes | auth.service.ts | ✅ Correct |
| `/auth/verify-otp` | POST | ✅ Yes | auth.service.ts | ✅ Correct |
| `/auth/login` | POST | ✅ Yes | auth.service.ts | 🟡 No role-based redirect |
| `/auth/logout` | POST | ✅ Yes | auth.service.ts | ✅ Correct |
| `/auth/refresh` | POST | ✅ Yes | token.service.ts | ✅ Correct |
| `/auth/forgot-password` | POST | ✅ Yes | auth.service.ts | ✅ Correct |
| `/auth/reset-password` | POST | ✅ Yes | auth.service.ts | ✅ Correct |
| `/auth/change-password` | POST | ✅ Yes | auth.service.ts | ✅ Correct |
| `/users/me` | GET/PUT | ✅ Yes | user.service.ts | ✅ Correct |
| `/users/me/avatar` | POST/DEL | ✅ Yes | user.service.ts / AvatarBannerUploader | ✅ Correct |
| `/users/me/avatar/url` | PUT | ✅ Yes | user.service.ts | ✅ Correct |
| `/users/me/banner` | POST/DEL | ✅ Yes | user.service.ts / AvatarBannerUploader | ✅ Correct |
| `/candidates/me` | GET/PUT | ✅ Yes | onboarding.service.ts, candidate.service.ts | ✅ Correct |
| `/candidates/me/cv` | POST | ✅ Yes | candidate.service.ts / CvUploader.vue | ✅ Correct |
| `/companies/me` | GET/PUT | ✅ Yes | onboarding.service.ts, company.service.ts | ✅ Correct |
| `/departments` | CRUD | ✅ Yes | org.service.ts / DepartmentsTab.vue | ✅ Correct |
| `/locations` | CRUD | ✅ Yes | org.service.ts / LocationsTab.vue | ✅ Correct |
| `/categories` | CRUD | ✅ Yes | org.service.ts / CategoriesTab.vue | ✅ Correct |
| `/invitations` | POST | ✅ Yes | team.service.ts / TeamManagementTab.vue | ✅ Correct |
| `/plans` | GET | ✅ Yes | plan.service.ts / PricingSection.vue | ✅ Correct |
| `/payment/checkout` | POST | ✅ Yes | payment.service.ts | ✅ Correct |
| `/payment/status` | GET | ✅ Yes | payment.service.ts / PaymentStatusPage.vue | ✅ Correct |
| `/subscriptions/current` | GET | ✅ Yes | subscription.service.ts | ✅ Correct |
| `/subscriptions/current/cancel` | PUT | ✅ Yes | subscription.service.ts | ✅ Correct |
| `/subscriptions/current/quota` | GET | ✅ Yes | subscription.service.ts | ✅ Correct |
| `/jobs` | POST/GET | ✅ Yes | job.service.ts / JobListPage.vue, JobFormPage.vue | ✅ Correct |
| `/jobs/{id}` | GET/PUT | ✅ Yes | job.service.ts / JobFormPage.vue | ✅ Correct |
| `/jobs/{id}/publish` | PUT | ✅ Yes | job.service.ts | ✅ Correct |
| `/jobs/{id}/close` | PUT | ✅ Yes | job.service.ts | ✅ Correct |
| `/jobs/{id}/unpublish` | PUT | ❌ No | — | 🟡 MISSING — BE supports but FE has no unpublish UI |
| `/jobs/public` | GET | ✅ Yes | job.service.ts (candidate) | ✅ Correct |
| `/jobs/public/{id}` | GET | ✅ Yes | job.service.ts (candidate) | ✅ Correct |
| `/applications` | POST/GET | ✅ Yes | application.service.ts | ✅ Correct |
| `/applications/{id}` | GET | ✅ Yes | application.service.ts | ✅ Correct |
| `/applications/{id}/status` | PUT | ✅ Yes | application.service.ts (pipeline) | ✅ Correct |
| `/applications/mine` | GET | ✅ Yes | application.service.ts (candidate) | ✅ Correct |
| `/applications/{id}/status-history` | GET | ❌ No | — | 🟡 MISSING — FE fetches via application detail; no standalone call |
| `/applications/jobs/{jobId}/screening/trigger` | POST | 🔴 Wrong | FE calls per-app `POST /{id}/ai-screening` | 🔴 Path mismatch |
| `/applications/jobs/{jobId}/screening` | GET | ❌ No | — | 🔴 MISSING — no dedicated screening results view |
| `/applications/{id}/interviews` | POST | ✅ Yes | interview.service.ts | ✅ Correct |
| `/interviews/{id}` | GET | ✅ Yes | interview.service.ts | ✅ Correct |
| `/interviews/{id}/status` | PUT | ✅ Yes | interview.service.ts | ✅ Correct |
| `/interviews/{id}/scorecards` | GET/POST | ✅ Yes | scorecard.service.ts | ✅ Correct |
| `/applications/{id}/offers` | POST/GET | ✅ Yes | offer.service.ts | ✅ Correct |
| `/offers/{id}/send` | PUT | ✅ Yes | offer.service.ts | ✅ Correct |
| `/offers/{id}/respond` | PUT | ✅ Yes | offer.service.ts | ✅ Correct |
| `/candidates/me/job-recommendations` | GET | ❌ No | — | 🟡 MISSING — AI job recommendations not implemented |
| `/transactions/mine` | GET | ✅ Yes | payment.service.ts | ✅ Correct |
| `/admin/users` | CRUD | ✅ Yes | admin.store.ts | ✅ Correct (mock service) |
| `/admin/companies` | GET | ✅ Yes | admin.store.ts | ✅ Correct (mock service) |
| `/admin/transactions` | GET | ✅ Yes | admin.store.ts | ✅ Correct (mock service) |

---

## 🗺️ Flow Implementation Map

| Flow | Steps Total | Steps Done | Steps Broken | Steps Missing | Status |
|------|-------------|------------|--------------|---------------|--------|
| Auth Flow | 12 | 12 | 0 | 0 | 🟢 Complete |
| Candidate Flow | 10 | 8 | 0 | 2 | 🟠 Partial |
| Employer & HR Flow | 18 | 13 | 2 | 3 | 🟠 Partial |
| Interviewer Flow | 3 | 3 | 0 | 0 | 🟢 Complete |
| Workspace Dashboard | 4 | 0 | 4 | 0 | 🔴 All Mock |
| SYSTEM (full lifecycle) | — | — | — | — | 🟠 See component flows |

### Flow Detail Breakdown

**Auth Flow (🟢 Complete — 12/12 steps)**
- ✅ Candidate registration → OTP → Login
- ✅ Employer registration → OTP → Login → Company setup
- ✅ Invite-based register
- ✅ Session management (refresh, logout)
- ✅ Password flows (forgot, reset, change)
- ✅ Profile & media upload (avatar, banner)

**Candidate Flow (🟠 Partial — 8/10 steps)**
- ✅ Profile update (`PUT /candidates/me`)
- ✅ CV upload (`POST /candidates/me/cv`)
- ✅ Browse jobs (`GET /jobs/public`)
- ✅ View job detail (`GET /jobs/public/{id}`)
- ✅ Apply to job (`POST /applications`)
- ✅ View my applications (`GET /applications/mine`)
- ✅ View application detail + offer respond
- ❌ **MISSING**: AI job recommendations (`GET /candidates/me/job-recommendations`)
- ❌ **MISSING**: View interview details from candidate side (component exists but may not be fully wired)

**Employer & HR Flow (🟠 Partial — 13/18 steps)**
- ✅ Company setup (departments, locations, categories)
- ✅ Subscription & payment flow
- ✅ Team invitation
- ✅ Job CRUD (create, list, edit)
- ✅ Job publish/close
- ✅ Application list & pipeline (Kanban)
- ✅ Application status transitions (drag-and-drop)
- ✅ Interview scheduling
- ✅ Offer create, send, respond
- 🔴 **BROKEN**: AI screening trigger (wrong endpoint path)
- ❌ **MISSING**: AI screening results view (`GET /applications/jobs/{jobId}/screening`)
- ❌ **MISSING**: Job unpublish (`PUT /jobs/{id}/unpublish`)
- 🟡 **DEGRADED**: Workspace dashboard shows all mock data

**Interviewer Flow (🟢 Complete — 3/3 steps)**
- ✅ Login
- ✅ View assigned interviews
- ✅ Submit scorecard

---

## ✅ Already Wired Correctly

| File | Flow | API Called | Store Used |
|------|------|-----------|------------|
| LoginPage.vue | Auth | `POST /auth/login` | useAuthStore |
| RegisterPage.vue | Auth | `POST /auth/register` | useAuthStore |
| InviteRegisterPage.vue | Auth | `POST /auth/register/invite` | useAuthStore |
| VerifyOtpPage.vue | Auth | `POST /auth/verify-otp` | useAuthStore |
| ForgotPasswordPage.vue | Auth | `POST /auth/forgot-password` | useAuthStore |
| ResetPasswordPage.vue | Auth | `POST /auth/reset-password` | useAuthStore |
| ChangePasswordPage.vue | Auth | `POST /auth/change-password` | useAuthStore |
| JobListPage.vue | HR | `GET /jobs` | useJobStore |
| JobFormPage.vue | HR | `POST/PUT /jobs` | useJobStore |
| PipelinePage.vue | HR | `GET /applications` | usePipelineStore |
| InterviewListPage.vue | HR | `GET /interviews` | useInterviewStore |
| InterviewerDashboard.vue | Interviewer | `GET /interviews` | useInterviewStore |
| ScorecardDashboard.vue | HR | `GET /scorecards` | useScorecardStore |
| OfferDashboardView.vue | HR | `GET /offers` | useOfferStore |
| OfferCreateView.vue | HR | `POST /offers` | useOfferStore |
| JobBoardPage.vue | Candidate | `GET /jobs/public` | useJobBoardStore |
| JobDetailPage.vue | Candidate | `GET /jobs/public/{id}` | useJobBoardStore |
| MyApplicationsPage.vue | Candidate | `GET /applications/mine` | useMyApplicationsStore |
| ApplicationDetailPage.vue | Candidate | `GET /applications/{id}` | useMyApplicationsStore |
| CandidateProfilePage.vue | Candidate | `GET/PUT /candidates/me` | useCandidateStore |
| EmployerOnboardingPage.vue | Employer | `PUT /companies/me` | useOnboardingStore |
| CandidateOnboardingPage.vue | Candidate | `PUT /candidates/me` | useOnboardingStore |
| CompanySettingsPage.vue | Employer | Multiple org endpoints | useOrgStore + useCompanyStore |
| SubscriptionDashboard.vue | Employer | `GET /subscriptions/current` | useSubscriptionStore |
| PaymentStatusPage.vue | Employer | `GET /payment/status` | usePaymentStore |

---

## 🎯 Recommended Fix Order

### Priority 1 — Fix before next release (breaks core experience):
1. **`APPLICATION_STATUS` enum mismatch** in `enums.ts` — update to match BE states (NEW/SCREENING/INTERVIEW/OFFER/HIRED/REJECTED)
2. **`OFFER_STATUS.PENDING`** → rename to `SENT` to match BE state machine
3. **AI Screening endpoint path** — change from per-app `/{id}/ai-screening` to per-job `POST /applications/jobs/{jobId}/screening/trigger`
4. **PipelineSidebar stats** — wire to `usePipelineStore().applicationsByStatus` computed

### Priority 2 — Fix this sprint (data correctness):
5. **Workspace dashboard** — replace mock data with real API calls in `useWorkspace.ts` and `useWorkspaceStore.ts`
6. **Pipeline stage colors** — create single `PIPELINE_STAGE_COLORS` constant used everywhere
7. **Login role-based redirect** — route users to appropriate dashboard by role
8. **Settings nav link** — point to `ROUTE_NAMES.COMPANY_SETTINGS`

### Priority 3 — Tech debt, next sprint:
9. Delete `offer.mock.ts` (dead code)
10. Move `pipeline.mock.ts` to `__mocks__/` or `__tests__/`
11. Extract all hardcoded `#008C8C` to Tailwind theme colors
12. Add `GET /candidates/me/job-recommendations` composable for AI recommendations
13. Add unpublish job UI (`PUT /jobs/{id}/unpublish`)
14. Add dedicated AI screening results view
15. Remove `isDashboard` flag pattern from nav items
16. Wire Team Presence section to real member data
