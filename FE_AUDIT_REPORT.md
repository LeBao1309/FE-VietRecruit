# FE Audit Report -- VietRecruit ATS

Generated: 2026-04-07
Scope: Full frontend codebase audit cross-referenced against BE controller contracts.

---

## Section 1: Completion Status by User Flow

### CANDIDATE Flows

```
CANDIDATE -- Register + Email Verify + Login
  Status: Implemented
  Done: RegisterPage, VerifyOtpPage, LoginPage, OAuth2CallbackPage
  Services: authService.register, authService.verifyOtp, authService.login, authService.oauth2Exchange
  File refs: src/views/auth/RegisterPage.vue, VerifyOtpPage.vue, LoginPage.vue, OAuth2CallbackPage.vue

CANDIDATE -- Password Recovery
  Status: Implemented
  Done: ForgotPasswordPage, ResetPasswordPage
  Services: authService.forgotPassword, authService.resetPassword
  File refs: src/views/auth/ForgotPasswordPage.vue, ResetPasswordPage.vue

CANDIDATE -- Build/Update Profile + Resume
  Status: Implemented
  Done: CandidateProfilePage (profile editing), CvManagementPage (upload/delete CV)
  Services: candidateService.getProfile, candidateService.updateProfile, candidateService.uploadCv, candidateService.deleteCv
  File refs: src/views/candidate/CandidateProfilePage.vue, CvManagementPage.vue

CANDIDATE -- Search Jobs
  Status: Implemented
  Done: JobBoardPage with full-text search, PublicJobDetailPage for individual job view
  Services: jobService.searchJobs (ES-backed), jobService.autocomplete, jobService.getPublicJob
  File refs: src/views/public/JobBoardPage.vue, PublicJobDetailPage.vue

CANDIDATE -- Apply to Job
  Status: Implemented
  Done: Application creation from job detail
  Services: applicationService.apply
  File refs: src/services/applicationService.ts (apply method), type ApplicationCreateRequest

CANDIDATE -- Track Application Status
  Status: Implemented
  Done: MyApplicationsPage (list), ApplicationDetailPage (detail with status history)
  Services: applicationService.listMyApplications, applicationService.getApplication, applicationService.getStatusHistory
  File refs: src/views/candidate/MyApplicationsPage.vue, ApplicationDetailPage.vue

CANDIDATE -- AI Job Recommendations
  Status: Implemented
  Done: JobRecommendationsPage
  Services: candidateService.getJobRecommendations
  File refs: src/views/candidate/JobRecommendationsPage.vue

CANDIDATE -- CV AI Advice
  Status: Implemented
  Done: Integrated into CvManagementPage
  Services: candidateService.getCvImprovement
  File refs: src/services/candidateService.ts (getCvImprovement method)

CANDIDATE -- Salary Benchmark
  Status: Implemented
  Done: SalaryBenchmarkPage
  Services: candidateService.getSalaryBenchmark
  File refs: src/views/candidate/SalaryBenchmarkPage.vue

CANDIDATE -- Respond to Offer
  Status: Implemented
  Done: Offer response through offer store
  Services: offerService.respondToOffer
  File refs: src/stores/offerStore.ts (respondToOffer action)
```

### EMPLOYER (COMPANY_ADMIN / HR) Flows

```
EMPLOYER -- Register Company + Branding Setup
  Status: Partial
  Done: CompanySetupPage view exists, companyService.create/update/getMyCompany
  Missing: No dedicated company store (useCompanyStore referenced but not created).
           CompanySetupPage view exists but useCompanySettings composable has broken imports.
  File refs: src/views/employer/CompanySetupPage.vue, src/features/company/composables/useCompanySettings.ts

EMPLOYER -- Invite HR / INTERVIEWER
  Status: Partial
  Done: invitationService.sendInvitation exists, InviteRegisterPage for accepting invitations
  Missing: No team store (useTeamStore referenced but not created). TeamPage view exists
           but useTeamSettings composable has broken imports. No UI for listing/revoking invitations.
  File refs: src/views/employer/TeamPage.vue, src/features/company/composables/useTeamSettings.ts

EMPLOYER -- Manage Departments/Locations/Categories
  Status: Partial
  Done: organizationService with full CRUD for all three entity types. OrganizationPage view exists.
  Missing: No org store (useOrgStore referenced but not created). useOrgSettings composable
           has broken imports. CRUD operations exist in service but have no state management layer.
  File refs: src/views/employer/OrganizationPage.vue, src/features/company/composables/useOrgSettings.ts

EMPLOYER -- Purchase Subscription (PayOS)
  Status: Implemented
  Done: PricingPage (plan selection), PaymentStatusPage (polling), SubscriptionPage, BillingPage
  Services: planService.getPlans, subscriptionStore.checkout, paymentService.getPaymentStatus,
            subscriptionService.getCurrentSubscription, paymentService.getTransactions
  File refs: src/views/employer/PricingPage.vue, PaymentStatusPage.vue, SubscriptionPage.vue, BillingPage.vue

EMPLOYER -- Create/Edit/Publish/Close Job
  Status: Implemented
  Done: JobListPage, JobFormPage (create+edit), JobDetailPage. Full lifecycle: DRAFT -> PUBLISHED -> CLOSED.
  Services: jobService.createJob, updateJob, publishJob, closeJob. AI JD generation integrated.
  Quota check: jobStore.publishJob checks subscriptionStore.isQuotaFull before publishing.
  File refs: src/views/employer/JobListPage.vue, JobFormPage.vue, JobDetailPage.vue

EMPLOYER -- View Applicants + ATS Pipeline
  Status: Implemented
  Done: ApplicationPipelinePage (Kanban view grouped by status), ApplicationDetailPage
  Services: applicationService.listApplications (filtered by jobId/status), applicationStore.fetchAllForJob (Kanban)
  Status transitions: applicationStore.updateStatus with client-side validation
  Screening: applicationService.triggerScreening, getScreeningResults
  File refs: src/views/employer/ApplicationPipelinePage.vue, ApplicationDetailPage.vue

EMPLOYER -- Schedule Interviews
  Status: Implemented
  Done: InterviewListPage, InterviewDetailPage
  Services: interviewService.scheduleInterview, getInterviews, updateStatus
  File refs: src/views/employer/InterviewListPage.vue, InterviewDetailPage.vue

EMPLOYER -- Scorecard Submission
  Status: Implemented
  Done: ScorecardFormPage, ScorecardSummaryPage
  Services: interviewService.submitScorecard, getScorecards
  Computed: interviewStore exposes averageScore, avgSkill, avgAttitude, avgEnglish, resultCounts
  File refs: src/views/employer/ScorecardFormPage.vue, ScorecardSummaryPage.vue

EMPLOYER -- Generate Offer
  Status: Implemented
  Done: OfferDetailPage with full lifecycle (create -> send -> candidate respond)
  Services: offerService.createOffer, sendOffer, respondToOffer, deleteOffer
  File refs: src/views/employer/OfferDetailPage.vue
```

### INTERVIEWER Flows

```
INTERVIEWER -- View Assigned Interviews
  Status: Implemented
  Done: InterviewerDashboardPage (route: /employer/my-interviews, role: INTERVIEWER)
  Services: interviewService.getMyInterviews
  File refs: src/views/employer/InterviewerDashboardPage.vue

INTERVIEWER -- Submit Scorecard
  Status: Implemented
  Done: ScorecardFormPage (route: /employer/interviews/:id/scorecard, roles include INTERVIEWER)
  Services: interviewService.submitScorecard
  File refs: src/views/employer/ScorecardFormPage.vue
```

### SYSTEM_ADMIN Flows

```
ADMIN -- Manage Users
  Status: Implemented
  Done: UsersPage with CRUD
  Services: adminUserService (create, list, get, update, delete)
  File refs: src/views/admin/UsersPage.vue

ADMIN -- View Transactions
  Status: Implemented
  Done: TransactionsPage with optional companyId filter
  Services: adminPaymentService.getTransactions
  File refs: src/views/admin/TransactionsPage.vue

ADMIN -- Manage Subscription Plans
  Status: Missing
  Done: Nothing -- no admin plan management UI
  Missing: BE has PlanController with GET endpoints only. If plan CRUD is needed admin-side,
           both BE endpoints and FE views are missing.
  Note: Plans are read-only in current architecture (seeded via Flyway).
```

### CUSTOMER_SERVICE Flows

```
CUSTOMER_SERVICE -- All Flows
  Status: Missing
  Done: Nothing -- no CUSTOMER_SERVICE routes or views exist
  Missing: No dedicated portal. CUSTOMER_SERVICE role is defined in enums but has no FE routes.
  Note: BE grants CUSTOMER_SERVICE limited access but no FE surfaces exist for it.
```

### Cross-Cutting

```
CROSS-CUTTING -- OAuth2 Login (Google, GitHub)
  Status: Implemented
  Done: OAuth2CallbackPage handles redirect, authService.oauth2Exchange sends code to BE
  File refs: src/views/auth/OAuth2CallbackPage.vue

CROSS-CUTTING -- Password Reset
  Status: Implemented
  Done: ForgotPasswordPage + ResetPasswordPage
  File refs: src/views/auth/ForgotPasswordPage.vue, ResetPasswordPage.vue

CROSS-CUTTING -- Token Refresh
  Status: Implemented
  Done: Auto-refresh on 401 in response interceptor with request queue
  File refs: src/services/http.ts (lines 67-139)

CROSS-CUTTING -- Notification Center
  Status: Missing
  Done: Nothing -- no in-app notification UI
  Missing: BE has notification module (Kafka + email). No FE notification list, badge, or real-time updates.
```

---

## Section 2: UI/Logic Issues Found

```
FILE: src/services/http.ts:36
ISSUE: parseJwt() returns `any` type. Used in authStore to decode roles from JWT.
       No validation that decoded payload actually contains a `roles` array.
SEVERITY: Medium

FILE: src/stores/authStore.ts:44
ISSUE: Roles cast as `userRoles as RoleCode[]` without validation.
       If BE changes role format, this silently assigns invalid roles.
SEVERITY: Medium

FILE: src/stores/authStore.ts:122-138
ISSUE: hydrate() restores auth from localStorage but never fetches fresh profile.
       If user data changed server-side, local state is stale until explicit fetchProfile().
SEVERITY: Low

FILE: src/features/interview/services/ai-interview.service.ts:4
ISSUE: Imports from non-existent `@/core/api/axios.instance`. Entire file non-functional.
SEVERITY: Critical

FILE: src/features/interview/composables/useAiInterviewQuestions.ts:7
ISSUE: Imports from non-existent `@/core/utils/error`. Composable non-functional.
SEVERITY: Critical

FILE: src/features/company/composables/useCompanySettings.ts:5
ISSUE: Imports from non-existent `@/features/company/stores/useCompanyStore`.
       CompanySetupPage cannot function.
SEVERITY: Critical

FILE: src/features/company/composables/useOrgSettings.ts:6
ISSUE: Imports from non-existent `@/core/stores/org.store`.
       OrganizationPage (departments/locations/categories management) cannot function.
SEVERITY: Critical

FILE: src/features/company/composables/useTeamSettings.ts:5
ISSUE: Imports from non-existent `@/core/stores/team.store`.
       TeamPage (invitation management) cannot function.
SEVERITY: Critical

FILE: src/features/interview/services/ai-interview.service.ts:11
ISSUE: Endpoint path `/vietrecruit/ai/interview-questions` does not match BE controller.
       BE serves interview questions under /interviews/{id}/questions/generate (via AI interview controller).
       The working interviewService already has correct endpoints for this.
SEVERITY: High (contract mismatch, plus broken imports make it doubly non-functional)

FILE: src/stores/jobStore.ts (publishJob action)
ISSUE: Quota check uses subscriptionStore.isQuotaFull as client-side guard.
       If store state is stale, user sees incorrect quota status.
       BE also enforces quota -- this is a UX issue, not a security issue.
SEVERITY: Low

FILE: src/stores/applicationStore.ts (validTransitions)
ISSUE: Status transition rules hardcoded on FE. If BE adds new transitions
       (e.g., REJECTED -> NEW for reopening), FE will reject valid moves.
SEVERITY: Low

FILE: (project-wide)
ISSUE: No .env.example file exists. Only .env (which likely contains local secrets).
       New developers have no template for environment setup.
SEVERITY: Medium

FILE: (project-wide)
ISSUE: No test infrastructure. Vitest, jsdom, Vue Test Utils are not installed.
       Zero test coverage. Prior CLAUDE.md incorrectly claimed test setup existed.
SEVERITY: High
```

---

## Section 3: API Contract Mismatches

```
FEATURE: interview (features/interview/)
FE call: POST /vietrecruit/ai/interview-questions { jobTitle, candidateProfile, difficulty }
BE controller: POST /interviews/{id}/questions/generate (via AI interview controller, tied to interview ID)
Gap: FE uses standalone endpoint, BE ties generation to a specific interview.
     HOWEVER: interviewService.ts (the working service) correctly calls
     POST /interviews/{id}/questions/generate -- so this mismatch is in dead/broken code only.

FEATURE: application
FE call: GET /applications/mine (candidate own applications)
BE endpoint: GET /applications/{ApiConstants.Application.MINE}
Status: MATCH -- endpoint exists in BE ApplicationController (line 113), uses constant for path.

FEATURE: payment
FE call: POST /payment/checkout { planId, billingCycle }
BE expects: POST /payment/checkout { planId (UUID), billingCycle (BillingCycle) }
Status: MATCH -- fields align. No returnUrl/cancelUrl needed (server-side constructs return URLs).

FEATURE: application (status update)
FE call: PUT /applications/{id}/status { status, notes }
BE endpoint: PUT /applications/{id}/{ApiConstants.Application.STATUS}
Status: MATCH -- endpoint exists in BE ApplicationController (line 146).

FEATURE: application (screening)
FE call: GET /applications/jobs/{jobId}/screening
FE call: POST /applications/jobs/{jobId}/screening/trigger
BE endpoints: Both exist in BE ApplicationController (lines 161, 175).
Status: MATCH

FEATURE: application (status history)
FE call: GET /applications/{id}/status-history
BE endpoint: GET /applications/{id}/{ApiConstants.Application.STATUS_HISTORY}
Status: MATCH -- exists in BE ApplicationController (line 191).

FEATURE: job (AI features)
FE call: POST /jobs/ai/generate-description { title, department, requirements, tone }
FE call: POST /jobs/{id}/ai/apply-description { description }
FE call: GET /jobs/{id}/salary-benchmark
BE endpoints: Exist in AI JD controller and salary controller.
Status: MATCH (paths consistent with AI module controller structure)

FEATURE: candidate
FE call: POST /candidates/me/cv/improvement
BE endpoint: Not visible in CandidateController -- likely served by AI CV controller.
Status: NEEDS VERIFICATION -- endpoint path may differ from BE actual path.

FEATURE: candidate (salary benchmark)
FE call: GET /candidates/me/salary-benchmark?jobTitle=&locationId=
BE endpoint: Exists in AI salary controller.
Status: NEEDS VERIFICATION -- exact path may differ.

FEATURE: interview (AI questions via working service)
FE call: POST /interviews/{id}/questions/generate
FE call: GET /interviews/{id}/questions
BE endpoints: Exist in AI interview controller.
Status: MATCH
```

---

## Section 4: Missing Features (Zero FE Coverage)

```
1. NOTIFICATION MODULE
   BE: feature/notification/ -- async email + in-app alerts via Kafka + Resend
   FE needed: Notification list/dropdown, real-time badge count, read/unread state,
              notification preferences page
   Impact: Users have no visibility into system events (application status changes,
           interview scheduling, offer notifications)

2. CUSTOMER_SERVICE PORTAL
   BE: CUSTOMER_SERVICE role has limited access permissions
   FE needed: Dedicated route group and dashboard for customer service agents
   Impact: Role exists but has no usable UI surface

3. CANDIDATE SEARCH (Employer)
   BE: GET /candidates/search (ES-backed, restricted to HR/COMPANY_ADMIN/SYSTEM_ADMIN)
   FE: candidateService.searchCandidates exists but no view/page uses it
   FE needed: CandidateSearchPage with filters (skills, experience, education, work type)
   Impact: Employers cannot proactively search the candidate pool

4. ADMIN PLAN MANAGEMENT
   BE: PlanController has read-only endpoints (GET /plans, GET /plans/{id})
   FE needed: If plan CRUD is intended for admins, both BE and FE need implementation
   Note: Plans may be intentionally seed-only (managed via Flyway migrations)

5. COMPANY SEARCH (Public)
   BE: GET /companies/search (ES-backed, public)
   FE: companyService.searchCompanies exists but no public company directory page
   FE needed: CompanyDirectoryPage for candidates to browse companies
   Impact: Candidates cannot discover companies independently of job listings

6. KNOWLEDGE MANAGEMENT (AI)
   BE: AI knowledge module with document upload/list/delete
   FE needed: Admin or employer UI for managing AI knowledge documents
   Impact: Knowledge base management requires direct API calls
```

---

## Section 5: Role-Based Access Gaps

```
1. COMPANY_ADMIN vs HR -- Payment Routes
   Route: /employer/pricing, /employer/payment-status, /employer/subscription, /employer/billing
   FE meta: roles: ['COMPANY_ADMIN'] (correct -- only COMPANY_ADMIN)
   BE: POST /payment/checkout requires ROLE_COMPANY_ADMIN (correct)
   Status: ALIGNED

2. INTERVIEWER Access Scope
   Route: /employer/interviews/:id (view interview detail)
   FE meta: roles: ['COMPANY_ADMIN', 'HR', 'INTERVIEWER'] (correct)
   Route: /employer/interviews/:id/scorecard
   FE meta: roles: ['COMPANY_ADMIN', 'HR', 'INTERVIEWER'] (correct)
   Route: /employer/my-interviews
   FE meta: roles: ['INTERVIEWER'] (correct -- interviewer-only dashboard)
   BE: InterviewController allows INTERVIEWER for GET /interviews/mine and scorecard submission
   Status: ALIGNED

3. INTERVIEWER -- Job/Application Access
   Route: /employer/jobs, /employer/jobs/:id, /employer/jobs/:id/applications
   FE meta: roles: ['COMPANY_ADMIN', 'HR'] (INTERVIEWER excluded)
   BE: Job CRUD requires ROLE_HR or ROLE_COMPANY_ADMIN (INTERVIEWER excluded)
   Status: ALIGNED

4. SYSTEM_ADMIN -- No Employer Routes
   FE: /admin/* routes require SYSTEM_ADMIN
   FE: /employer/* routes do NOT include SYSTEM_ADMIN
   BE: Admin endpoints use USER:MANAGE and TRANSACTION:VIEW_ALL authorities
   Status: ALIGNED -- admin has own portal, cannot access employer views

5. CUSTOMER_SERVICE -- No Routes At All
   FE: No routes exist for CUSTOMER_SERVICE role
   BE: CUSTOMER_SERVICE has limited permissions (user view, candidate search)
   Status: GAP -- role has no FE surface. Users with this role will be redirected to
           landing page since no dashboard matches.
   Impact: Medium -- CUSTOMER_SERVICE users cannot use the system through the FE.

6. Candidate Application Detail Access
   Route: /candidate/applications/:id
   FE meta: roles: ['CANDIDATE'] (from parent)
   BE: GET /applications/{id} requires ROLE_HR, ROLE_COMPANY_ADMIN, or ROLE_CANDIDATE
   Status: ALIGNED -- BE allows candidate access to their own applications

7. Public Routes -- No Auth Enforcement
   Routes: /, /jobs, /jobs/:id
   FE meta: no requiresAuth (correctly public)
   BE: @PermitAll on search/public endpoints
   Status: ALIGNED
```

---

## Section 6: Priority Queue

### P0 -- Broken Core Flows

```
1. Fix broken imports in features/interview/services/ai-interview.service.ts
   - Change `@/core/api/axios.instance` to `@/services/http`
   - Change `@/core/types/api.types` to `@/types/common`
   - OR delete entirely since interviewService.ts already covers this functionality

2. Fix broken imports in features/interview/composables/useAiInterviewQuestions.ts
   - Change `@/core/utils/error` to import extractError from `@/services/api-error`
   - OR delete if duplicating interviewStore.generateQuestions

3. Fix broken imports in features/company/composables/useCompanySettings.ts
   - Create missing store: features/company/stores/useCompanyStore.ts
   - Change type import from `@/features/company/types/company.dto` to `@/types/company`
   - This blocks CompanySetupPage functionality

4. Fix broken imports in features/company/composables/useOrgSettings.ts
   - Create missing store: wrap organizationService in a Pinia store
   - Change type import from `@/features/company/types/org.dto` to `@/types/organization`
   - This blocks OrganizationPage (department/location/category CRUD)

5. Fix broken imports in features/company/composables/useTeamSettings.ts
   - Create missing store: wrap invitationService + user listing in a Pinia store
   - Change type import from `@/features/company/types/team.dto` to `@/types/invitation`
   - This blocks TeamPage (team/invitation management)
```

### P1 -- Missing Flows Required for MVP

```
6. Add notification UI
   - Create notificationService wrapping BE notification endpoints
   - Create notificationStore
   - Add notification dropdown/bell in AppHeader with unread count
   - Add NotificationListPage for full history
   - Critical for ATS workflow visibility (status changes, interview scheduling)

7. Add candidate search page for employers
   - candidateService.searchCandidates already exists
   - Create CandidateSearchPage view under /employer/candidates
   - Add route with roles: ['COMPANY_ADMIN', 'HR']
   - Wire to ES-backed search with skills/experience/education filters

8. Create .env.example for FE
   - Document all VITE_* variables with example values
   - Remove .env from version control if it contains secrets
```

### P2 -- Incomplete Flows That Degrade UX

```
9. Add company directory page (public)
   - companyService.searchCompanies already exists
   - Create CompanyDirectoryPage under /companies
   - Add public route (no auth required)

10. Add CUSTOMER_SERVICE portal
    - Create /support/* route group
    - Add user search/view and candidate search pages
    - Wire to existing adminUserService and candidateService

11. Add change password UI
    - authService.changePassword exists
    - Add form in SettingsPage or standalone ChangePasswordPage
    - Wire to existing service method

12. Improve hydrate() to fetch fresh profile on app load
    - Currently only restores from localStorage
    - Add background fetchProfile() call after hydration
    - Prevents stale user data
```

### P3 -- Polish, Dead Code, Type Safety

```
13. Type parseJwt() return value
    - Create JwtPayload interface with roles: RoleCode[] and standard JWT fields
    - Replace `any` return type in services/http.ts:36

14. Add runtime response validation
    - Install Zod
    - Create schemas for critical response types (LoginResponse, PageResponse, etc.)
    - Validate in service layer before returning

15. Install test infrastructure
    - Add Vitest, jsdom, @vue/test-utils as dev dependencies
    - Create vitest.config.ts with Vue plugin
    - Add test/coverage scripts to package.json
    - Prioritize testing stores and services

16. Clean up duplicate interview feature code
    - features/interview/ duplicates functionality already in interviewStore + interviewService
    - Either fix and integrate, or delete in favor of existing working code

17. Remove dead features/candidate/components/ duplication
    - CandidateLayout.vue exists in both layouts/ and features/candidate/components/
    - Determine which is used and remove the other

18. Add .npmrc enforcement
    - CLAUDE.md claims pnpm is enforced via .npmrc but .npmrc was not found in audit
    - Create .npmrc with engine-strict=true if not present
```

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total source files (TS + Vue) | 107 |
| View pages | 42 |
| Pinia stores | 8 |
| Service files | 16 |
| Type definition files | 12 |
| Broken files (non-functional) | 5 |
| User flows implemented | 18 |
| User flows partial | 3 |
| User flows missing | 3 |
| P0 issues | 5 |
| P1 issues | 3 |
| P2 issues | 4 |
| P3 issues | 6 |
