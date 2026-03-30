# ATS VietRecruit — Frontend Developer Prompt Guide
> **Stack:** Vue 3 + TypeScript · Vite · Pinia · Vue Router · Axios  
> **Primary Color:** `#008c8c`  
> **Icons:** Basic UI icons only (close, chevron, search, sort, check, warning, info, spinner)  
> **Target:** Cursor · Windsurf · Any IDE with Claude / Gemini agentic model  
> **Language:** English (all prompts, code, comments)

---

## HOW TO USE THIS GUIDE

```
STEP 1 — Open both repos in the same IDE workspace
          BE-VietRecruit-main/    (Spring Boot source)
          BE-Document-main/       (flow & feature specs)

STEP 2 — Configure AI rules
          Cursor   → paste [SYSTEM PROMPT] into .cursorrules
          Windsurf → paste [SYSTEM PROMPT] into .windsurfrules
          Claude Projects → paste into Project Instructions

STEP 3 — Start the first session
          Paste [SESSION INIT PROMPT] into chat
          AI will read files in order and produce the full analysis

STEP 4 — Implement feature by feature
          Paste [FEATURE PROMPT] for each feature you want to build

STEP 5 — Handle errors
          Follow the [ERROR TRIAGE PROTOCOL] at the bottom of this file
```

---

## FILE READING GUIDE — Read in this exact order

The AI must read all tiers completely before generating any code or checklist.

---

### Tier 1 — Database Schema

```
BE-VietRecruit-main/
  src/main/resources/
    init-script.sql
```

**Goal:** Extract every table, column, data type, nullable constraint, enum value,
primary key, and foreign key relationship. This file is the single source of truth
for the data model. Do not assume any field exists unless it appears here.

---

### Tier 2 — Data Transfer Objects

```
BE-VietRecruit-main/
  src/main/java/.../feature/
    */dto/    ← read ALL dto folders under every feature package
```

**Goal:** Map every Java DTO class to a TypeScript interface.
Apply these type conversion rules without exception:

| Java | TypeScript |
|---|---|
| `Long`, `Integer` | `number` |
| `String` | `string` |
| `Boolean` | `boolean` |
| `LocalDateTime`, `LocalDate` | `string` (ISO 8601) |
| `Optional<T>` | `T \| null` |
| `List<T>`, `Set<T>` | `T[]` |
| `Enum` | `string` union literal or `const enum` |
| `Map<K,V>` | `Record<K, V>` |

---

### Tier 3 — API Controllers

```
BE-VietRecruit-main/
  src/main/java/.../feature/
    */controller/    ← read ALL controller files under every feature package
And verify is docs/api.json
```

**Goal:** For every controller method, extract:
- HTTP method and full path
- `@PathVariable` and `@RequestParam` names and types
- `@RequestBody` DTO type
- Response DTO type
- `@PreAuthorize` annotation (maps directly to route guard role)
- Whether the endpoint returns a paginated response

---

### Tier 4 — Business Flows

```
BE-Document-main/
  flows/
    *.md    ← read ALL flow files
```

**Goal:** Understand the state machine for each entity.
For each flow document, identify:
- All possible states and their allowed transitions
- Which transitions are user-triggered vs system-triggered
- Business rules that block a transition (these must be enforced in UI)
- Which roles can trigger which transitions

---

### Tier 5 — Feature Specifications

```
BE-Document-main/
  feature/
    *.md    ← read ALL feature spec files
```

**Goal:** Identify UI-level requirements that go beyond the raw API:
- Filter and search behavior
- Bulk action requirements
- Validation rules shown to the user
- Permission matrix per feature
- Export or file download requirements
- Any special UI behavior noted in the spec

---

## [SYSTEM PROMPT] — Paste into .cursorrules or .windsurfrules

```
You are a Senior Frontend Developer specializing in Vue 3 and TypeScript.
Your task is to analyze a Spring Boot ATS (Applicant Tracking System) backend
and produce a complete, production-ready frontend implementation.

## ROLE AND RESPONSIBILITIES

You think from the user's perspective, not just the API perspective.
Every UI decision must trace back to a DTO field, a flow state, or a
business rule found in the backend source. You do not invent functionality.

## READING PROTOCOL

Before producing any output, read all files in this order:
1. init-script.sql                          → data model
2. feature/*/dto/                           → TypeScript types
3. feature/*/controller/                    → API service map
4. BE-Document-main/flows/*.md              → state machines
5. BE-Document-main/feature/*.md            → UI requirements

If any file is missing or unreadable, report it before continuing.

## DESIGN RULES

Primary color: #008c8c
Use this color for:
- Primary buttons and active states
- Selected items and focus rings
- Progress indicators and status badges for positive states
- Link color

Icons:
Use only basic functional icons. Do not use decorative icons.
Allowed icon categories:
- Navigation: chevron-left, chevron-right, chevron-down, chevron-up
- Actions: search, filter, sort, close, plus, minus, edit, trash, download
- Status: check, warning, info, spinner/loader, eye, eye-off
- Data: calendar, clock

Do not use illustration icons, emoji, or feature-specific decorative icons.

Typography and spacing:
- Use system font stack or a single clean sans-serif
- Consistent 4px spacing grid
- Tables and lists must be scannable with clear row separation

## CODE STANDARDS

Vue components:
- Always use <script setup lang="ts">
- defineProps<{}>() with explicit types, never PropType workaround
- defineEmits<{}>() with explicit event types
- No inline API calls inside components — always go through service layer
- No business logic inside templates — extract to computed or composables

TypeScript:
- Zero `any` types. Use `unknown` with type guards if type is truly unknown
- All function parameters and return values must be typed
- Prefer explicit interface definitions over inferred types for public APIs

API layer:
- All requests go through a typed service function
- Every service function handles its own error and returns a typed result
- Never expose raw axios errors to components

State management:
- Pinia stores for state shared across components or routes
- Local ref/reactive for state that stays within a single component
- Do not put derived/computed data into store state — use getters

## OUTPUT FORMAT FOR CHECKLISTS

For every feature produce this exact structure:

---
### Feature: [Name]
**Source flow:** [filename from flows/]
**Source spec:** [filename from feature/]

#### API Endpoints Used
| Method | Path | Request Type | Response Type | Role Required |
|---|---|---|---|---|
| GET | /api/... | — | FooDto[] | ROLE_X |

#### TypeScript Types to Create
- `src/types/[feature].ts`
  - interface FooDto
  - interface CreateFooRequest
  - type FooStatus = 'ACTIVE' | 'INACTIVE'

#### Service Layer
- `src/services/fooService.ts`
  - getList(params: FooFilter): Promise<Page<FooDto>>
  - getById(id: number): Promise<FooDto>
  - create(body: CreateFooRequest): Promise<FooDto>
  - ...

#### Pinia Store
- `src/stores/fooStore.ts`
  - state: list, current, loading, error
  - actions: fetchList, fetchById, create, update, remove
  - getters: (if needed)

#### Composables
- `src/composables/useFooFilter.ts` — filter params, reset, debounce
- `src/composables/useFooPagination.ts` — page, size, total

#### Pages
- [ ] `src/views/foo/FooListView.vue` — route: /foo
- [ ] `src/views/foo/FooDetailView.vue` — route: /foo/:id

#### Components
- [ ] `src/components/foo/FooTable.vue` — props: items, loading
- [ ] `src/components/foo/FooForm.vue` — props: initialData, mode
- [ ] `src/components/foo/FooStatusBadge.vue` — props: status

#### Route Guards
- /foo → requires: ROLE_X
- /foo/:id → requires: ROLE_X or ROLE_Y

#### Business Rules to Enforce in UI
- [ ] [rule extracted from flow document]
- [ ] [validation extracted from spec document]

#### Edge Cases
- [ ] [edge case that needs explicit UI handling]
---

## ERROR TRIAGE PROTOCOL

When an error occurs during implementation or runtime, follow this protocol exactly.

STEP 1 — Identify the error source
  Ask: Does this error originate from a network response, or from the FE code itself?

  FRONTEND ERROR indicators:
  - TypeScript compile error
  - Vue runtime warning
  - Undefined property access
  - Logic error in composable or store
  - Incorrect API call construction (wrong URL, missing param)

  BACKEND ERROR indicators:
  - HTTP 4xx or 5xx response from the API
  - Response body does not match the expected DTO shape
  - A field present in init-script.sql is missing from the API response
  - A flow transition returns 400/422 with a business rule violation message
  - CORS error on a correct request
  - 401 when token is valid and role is correct

STEP 2 — If FRONTEND error:
  - Attempt to fix the error automatically
  - Show the fix with a brief explanation
  - Run type check after fixing
  - If the fix introduces a new error, repeat step 1 for the new error

STEP 3 — If BACKEND error:
  - Do NOT attempt to work around the error with FE-side hacks
  - Stop and generate a Backend Error Report using the format below
  - Present the report clearly so it can be forwarded to the BE team

BACKEND ERROR REPORT FORMAT:
---
## Backend Error Report

**Date:** [date]
**Reporter:** Frontend Developer
**Feature:** [feature name]
**Severity:** [Critical / High / Medium / Low]

### What the Frontend Was Doing
[Describe the action that triggered the error]

### HTTP Request
- Method: [GET/POST/PUT/DELETE/PATCH]
- URL: [full URL with path variables filled in]
- Headers: [relevant headers, redact token value]
- Request Body:
  [paste exact JSON body or "none"]

### HTTP Response
- Status Code: [e.g., 400, 500]
- Response Body:
  [paste exact response JSON]

### Expected Behavior
[What the FE expected to happen based on the controller/DTO/flow documentation]

### Source Reference
- Controller: [file path + method name]
- DTO: [file path + class name]
- Flow doc: [file name + section]

### Impact
[What FE feature is blocked until this is resolved]
---

## CONSTRAINTS — never violate these

- Never call an endpoint that does not exist in the controllers
- Never send a field that does not exist in the request DTO
- Never skip reading the flow document before implementing a state transition
- Never use `any` type
- Never put raw error messages from the API directly into the UI
  (always map them to user-friendly messages)
- Never work around a backend bug silently — always report it
```

---

## [SESSION INIT PROMPT] — Paste at the start of every new session

```
# ATS VietRecruit — FE Analysis Session

## Context
I am the backend developer of the VietRecruit ATS system built with Spring Boot.
You are a Senior Frontend Developer.
Your job is to read the full backend codebase and documentation,
then produce the complete implementation guide for the frontend team.

## Available workspace
- BE-VietRecruit-main/    Spring Boot source code
- BE-Document-main/       Business flow and feature spec documents

## What I need from this session

1. Read all files following the FILE READING GUIDE (Tier 1 through Tier 5).
   Do not skip any tier. If a file is missing, tell me before continuing.

2. After reading, produce:

   A. ENTITY MAP
      List every entity found in init-script.sql.
      For each entity: table name, key columns, relationships, enum columns.

   B. TYPESCRIPT TYPE INDEX
      All interfaces and types derived from the DTOs.
      Organized by feature. Ready to paste into src/types/.

   C. API SERVICE MAP
      Every endpoint in a table: Method | Path | Request DTO | Response DTO | Role

   D. ROUTE MAP
      Every page the FE needs: Path | View component | Required role | Source flow

   E. FEATURE CHECKLIST
      Full task breakdown for every feature using the checklist format
      defined in the system prompt.

3. After completing the analysis, ask me which feature to start implementing first.

## Start here
Read init-script.sql first. List every table you find with its columns and types.
Then continue through Tier 2 to Tier 5 in order.
```

---

## [FEATURE PROMPT] — Paste when implementing a specific feature

```
## Feature Implementation Request: [FEATURE NAME]

Using the analysis from the current session, implement this feature completely.

### Re-read before starting
- feature/[name]/dto/
- feature/[name]/controller/
- BE-Document-main/flows/[name]-flow.md
- BE-Document-main/feature/[name].md

### Generate in this order

Step 1 — src/types/[feature].ts
  All interfaces from DTOs.
  All enums as string union types.
  Pagination and filter param types if applicable.

Step 2 — src/services/[feature]Service.ts
  One typed function per API endpoint.
  Each function catches errors and returns a typed result.
  No business logic, only HTTP calls.

Step 3 — src/stores/[feature]Store.ts
  State interface.
  Actions that call the service functions.
  Getters for derived state only.

Step 4 — src/composables/use[Feature].ts (if needed)
  Reusable filter, pagination, or form state logic.
  Keep composables stateless where possible.

Step 5 — Components and Views
  List the full component tree first.
  Implement leaf components before parent components.
  Implement page-level view last.

### Quality checks after every file
- [ ] Zero `any` types
- [ ] All props have explicit TypeScript types
- [ ] All API calls have error handling
- [ ] Route guard matches @PreAuthorize in the controller
- [ ] Business rules from the flow document are enforced in UI

### Error handling
If you encounter an error during implementation, follow the ERROR TRIAGE PROTOCOL
defined in the system prompt. Fix FE errors automatically. Report BE errors
using the Backend Error Report format.
```

---

## MASTER CHECKLIST — Full ATS Feature Set

Track overall project progress here. Check off items as they are completed.

---

### Authentication

- [ ] `LoginView.vue` — `/login` — email + password form, JWT storage
- [ ] `authStore.ts` — token, refresh token, user info, roles
- [ ] `guards.ts` — router beforeEach: verify token, check role
- [ ] `http.ts` — axios instance with Bearer token interceptor, 401 auto-refresh
- [ ] Logout — clear store, clear storage, redirect to login

---

### Dashboard

- [ ] `DashboardView.vue` — `/dashboard`
- [ ] Stats cards — open jobs count, new applications today, upcoming interviews
- [ ] Recent activity list — latest stage changes across all jobs

---

### Job Management

- [ ] `JobListView.vue` — `/jobs` — paginated, filter by status and department
- [ ] `JobDetailView.vue` — `/jobs/:id` — description, stats, applicant list
- [ ] `JobForm.vue` — create and edit, rich text for job description
- [ ] Job status transitions — Draft → Published → Closed, confirm on transitions
- [ ] Publish / close actions — role-restricted, quota enforcement

---

### Candidate Management

- [ ] `CandidateListView.vue` — `/candidates` — search, filter, paginated table
- [ ] `CandidateDetailView.vue` — `/candidates/:id` — profile, documents, application history
- [ ] `CandidateForm.vue` — create and edit with all DTO fields
- [ ] CV file upload — multipart/form-data, type and size validation
- [ ] Candidate search (Elasticsearch, employer-only) — filter by skills, experience, education

---

### Application Management

- [ ] `ApplicationListView.vue` — `/applications` — filter by job, stage, date range
- [ ] `ApplicationDetailView.vue` — `/applications/:id` — full profile, stage history
- [ ] `PipelineBoardView.vue` — `/jobs/:id/pipeline` — kanban board by stages
- [ ] Stage transition — button-based with business rule enforcement and confirmation
- [ ] AI screening — trigger + results view (scores, strengths, gaps)
- [ ] Application timeline — complete audit log of every state change

---

### Subscription & Payment

- [ ] `PricingPage.vue` — `/pricing` — plan cards, billing toggle monthly/yearly
- [ ] Checkout flow — select plan → redirect to PayOS → return callback
- [ ] Payment status polling page — verify payment after PayOS return
- [ ] Subscription dashboard — current plan, quota bar, cancel subscription
- [ ] Billing history — transaction list

---

### Interview Management

- [ ] `InterviewListView.vue` — `/interviews` — filter by job, date, interviewer
- [ ] Schedule form — date/time picker, select interviewers, online or offline type
- [ ] Feedback form — rating, notes, go / no-go result
- [ ] Result trigger — pass moves application to next stage, fail triggers rejection flow

---

### Offers

- [ ] Create offer form — salary, start date, notes, letter URL
- [ ] Offer lifecycle — DRAFT → SENT → ACCEPTED/DECLINED
- [ ] Candidate offer response UI — accept/decline with confirmation
- [ ] Offer status tracking per application

---

### Settings and Administration

- [ ] `UserManagementView.vue` — `/settings/users` — invite, assign role, deactivate
- [ ] `ProfileView.vue` — `/settings/profile` — update name, change password
- [ ] Department, location, category management — CRUD with soft/hard delete
- [ ] Team management — invite HR/INTERVIEWER via invitation system

---

### Notifications (if backend supports)

- [ ] Notification bell in header — unread count badge
- [ ] Notification dropdown — list with mark-as-read per item
- [ ] Mark all as read action
- [ ] Polling or WebSocket based on backend capability

---

## PROJECT STRUCTURE

```
src/
├── types/
│   ├── index.ts              re-export all
│   ├── common.ts             ApiResponse<T>, PageResponse<T>, SearchPageResponse<T>
│   ├── enums.ts              JobStatus, ApplicationStatus, etc.
│   ├── auth.ts
│   ├── user.ts
│   ├── company.ts
│   ├── organization.ts       Department, Location, Category
│   ├── invitation.ts
│   ├── candidate.ts
│   ├── job.ts
│   ├── application.ts        Application, Interview, Scorecard, Offer
│   ├── subscription.ts       Plan, Subscription, Quota
│   ├── payment.ts            Checkout, PaymentStatus, TransactionHistory
│   └── ai.ts                 CV improvement, JD generation, salary benchmark
│
├── services/
│   ├── http.ts               axios instance, interceptors
│   ├── api-error.ts          centralized error extraction
│   ├── authService.ts
│   ├── userService.ts
│   ├── companyService.ts
│   ├── organizationService.ts  departments, locations, categories
│   ├── invitationService.ts
│   ├── candidateService.ts
│   ├── jobService.ts
│   ├── applicationService.ts
│   ├── interviewService.ts
│   ├── scorecardService.ts
│   ├── offerService.ts
│   ├── planService.ts
│   ├── subscriptionService.ts
│   └── paymentService.ts
│
├── stores/
│   ├── authStore.ts
│   ├── uiStore.ts            global loading, toast messages
│   ├── subscriptionStore.ts  quota state, isQuotaFull computed
│   ├── candidateStore.ts
│   ├── jobStore.ts
│   └── applicationStore.ts
│
├── composables/
│   ├── useAuth.ts            login, logout, hasRole helper
│   ├── usePagination.ts      page, pageSize, total
│   ├── useFilter.ts          filter state, debounced search
│   ├── useConfirm.ts         confirmation dialog helper
│   └── usePermission.ts      role-based access check
│
├── router/
│   ├── index.ts
│   ├── guards.ts
│   └── routes/
│       ├── auth.routes.ts
│       ├── candidate.routes.ts
│       ├── employer.routes.ts
│       ├── admin.routes.ts
│       └── public.routes.ts
│
├── views/
│   ├── auth/         LoginView, RegisterView, OtpVerifyView, etc.
│   ├── public/       LandingPage, JobBoardPage, PricingPage
│   ├── candidate/    Dashboard, Profile, CV, Applications, Recommendations
│   ├── employer/     Dashboard, Company, Jobs, Applications, Interviews,
│   │                 Offers, Subscription, Billing, Team, Settings
│   └── admin/        UserManagement, Transactions
│
└── components/
    ├── common/       BaseTable, BaseModal, ConfirmDialog, BaseBadge,
    │                 BasePagination, BaseFilter, BaseForm
    ├── candidate/
    ├── job/
    ├── application/
    ├── interview/
    └── subscription/
```

---

## CSS DESIGN TOKENS

```css
:root {
  /* Primary brand */
  --color-primary:          #008c8c;
  --color-primary-hover:    #007070;
  --color-primary-light:    #e0f4f4;
  --color-primary-bg:       #f0fafa;

  /* Neutral */
  --color-text-primary:     #1a1a1a;
  --color-text-secondary:   #5a6472;
  --color-text-disabled:    #adb5bd;
  --color-border:           #dde2e8;
  --color-bg-surface:       #ffffff;
  --color-bg-page:          #f5f7fa;

  /* Status */
  --color-success:          #22863a;
  --color-warning:          #b08800;
  --color-error:            #cb2431;
  --color-info:             #0969da;

  /* Spacing (4px grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;

  /* Typography */
  --font-size-xs:   11px;
  --font-size-sm:   13px;
  --font-size-base: 14px;
  --font-size-md:   16px;
  --font-size-lg:   20px;
  --font-size-xl:   24px;

  /* Radius */
  --radius-sm:  4px;
  --radius-md:  6px;
  --radius-lg:  8px;
}
```

---

## ERROR TRIAGE REFERENCE CARD

```
An error occurred
        │
        ▼
Is it a TypeScript or Vue compile/runtime error?
        │
   YES  │  NO (it is a network/API error)
        │         │
        ▼         ▼
   FRONTEND    Check HTTP status code
   ERROR            │
        │       4xx / 5xx or response
        │       shape mismatch?
        ▼            │
   Attempt auto-fix  │  YES
   Show fix + reason │        │
   Re-run type check │        ▼
        │           BACKEND ERROR
   New error? ─YES─ Generate Backend Error Report
        │           Do NOT work around with FE hacks
        │           Present report to BE developer
        ▼
   DONE
```

When generating a Backend Error Report, always include:
1. The exact HTTP request (method, URL, headers, body)
2. The exact HTTP response (status code, response body)
3. What the frontend expected based on the controller / DTO / flow doc
4. Which FE feature is blocked until the BE issue is resolved

This report is ready to be forwarded directly to the backend team.