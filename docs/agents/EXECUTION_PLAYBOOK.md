# EXECUTION_PLAYBOOK.md -- Agent Orchestration Execution Plan

> Generated: 2026-03-25 | Lead Orchestrator Agent
> Scope: FE-VietRecruit stabilization and feature completion
> Constraint: All work is FE-only unless explicitly noted as requiring BE changes

---

## Phase 0: Foundation (No Dependencies)

**Goal:** Fix cross-cutting issues that affect all domains.
**Estimated Agent Runs:** 2 parallel

### 0A: Error & i18n Fix

**Agent Brief:** `claude/CLAUDE_ERROR_I18N.md` or `gemini/GEMINI_ERROR_I18N.md`

| Step | Action | Files |
|------|--------|-------|
| 1 | Rewrite `ERROR_CODE_MAP` with all 77 BE error codes in Vietnamese | `src/core/utils/error.utils.ts` |
| 2 | Remove raw English fallback, add category-based Vietnamese fallback | `src/core/utils/error.utils.ts` |
| 3 | Fix enum mismatches: remove EMPLOYER, EXPIRED, NO_SHOW; fix CANCELLED -> CANCELED | `src/core/constants/enums.ts` |
| 4 | Translate pipeline stage labels to Vietnamese | `src/core/constants/pipeline-stages.ts` |
| 5 | Grep codebase for broken references to removed/renamed enum values | All `.vue`, `.ts` files |
| 6 | Run `pnpm type-check` and `pnpm test` | - |

**Exit Criteria:** Zero English error messages displayed. All enums match BE. Type check passes.

### 0B: Auth & Router Guard Fix

**Agent Brief:** `claude/CLAUDE_AUTH.md` or `gemini/GEMINI_AUTH.md`

| Step | Action | Files |
|------|--------|-------|
| 1 | Refactor `parseUserFromJwt()` to only read existing JWT claims (sub, roles, email_verified) | `src/core/stores/auth.store.ts` |
| 2 | Add `fetchUserProfile()` action calling `GET /users/me` | `src/core/stores/auth.store.ts` |
| 3 | Call `fetchUserProfile()` in login() and handleOAuthCallback() before routing | `src/core/stores/auth.store.ts` |
| 4 | Fix router guard: replace `companyProfileComplete` with `companyId !== null` check | `src/core/router/index.ts` |
| 5 | Remove `permissions` check from router guard (lines 44-63) | `src/core/router/index.ts` |
| 6 | Fix onboarding store: candidate redirect to `/jobs` instead of workspace | `src/features/onboarding/stores/onboarding.store.ts` |
| 7 | Run `pnpm type-check` and `pnpm test` | - |

**Exit Criteria:** Login routes correctly for all roles. No phantom JWT claims read. Permissions guard removed.

**Dependency:** 0A and 0B can run in parallel. Both must complete before Phase 1.

---

## Phase 1: Structural (Depends on Phase 0)

**Goal:** Fix layout system, consolidate duplicates, stabilize workspace.
**Estimated Agent Runs:** 2 parallel

### 1A: Workspace Layout & Route Restructure

**Agent Brief:** `claude/CLAUDE_WORKSPACE.md` or `gemini/GEMINI_WORKSPACE.md`

| Step | Action | Files |
|------|--------|-------|
| 1 | Create `WorkspaceLayout.vue` (sidebar + header + router-view) | `src/features/workspace/components/WorkspaceLayout.vue` (NEW) |
| 2 | Restructure routes.ts: nest workspace routes under layout | `src/core/router/routes.ts` |
| 3 | Move `/offers` under `/workspace/offers` | `src/core/router/routes.ts` |
| 4 | Update all `router.push` calls referencing old paths | Various `.vue`, `.ts` files |
| 5 | Fix workspace store: remove `as any`, fix types, fix interview date field | `src/stores/useWorkspaceStore.ts` |
| 6 | Delete duplicate pipeline store | `src/stores/usePipelineStore.ts` (DELETE) |
| 7 | Run `pnpm type-check` and `pnpm test` | - |

**Exit Criteria:** Workspace pages share consistent layout. Route navigation works. No duplicates.

### 1B: Company 403 Handling + Admin Fix

**Agent Brief:** `claude/CLAUDE_COMPANY.md` + `claude/CLAUDE_ADMIN.md`

| Step | Action | Files |
|------|--------|-------|
| 1 | Handle 403 gracefully in company store | `src/features/company/stores/useCompanyStore.ts` |
| 2 | Employer onboarding: show company creation placeholder on 403 | `src/features/onboarding/views/EmployerOnboardingPage.vue` |
| 3 | Remove `permissions` meta from admin transactions route | `src/core/router/routes.ts` |
| 4 | Verify knowledge management service endpoints | `src/features/admin/services/knowledge.service.ts` |
| 5 | Run `pnpm type-check` and `pnpm test` | - |

**Exit Criteria:** Employer onboarding shows placeholder (not crash). Admin transactions accessible.

---

## Phase 2: Feature Completion (Depends on Phase 1)

**Goal:** Complete missing features, add AI integrations, consolidate services.
**Estimated Agent Runs:** 4 parallel

### 2A: Pipeline & Application

**Agent Brief:** `claude/CLAUDE_PIPELINE.md` or `gemini/GEMINI_PIPELINE.md`

| Step | Action |
|------|--------|
| 1 | Consolidate duplicate application services |
| 2 | Fix KanbanBoard type safety |
| 3 | Add client-side status transition validation |
| 4 | Verify AI screening trigger/display |

### 2B: Interview & Scorecard

**Agent Brief:** `claude/CLAUDE_INTERVIEW.md` or `gemini/GEMINI_INTERVIEW.md`

| Step | Action |
|------|--------|
| 1 | Verify all interview service endpoints match BE |
| 2 | Fix workspace store interview date field (use only `scheduledAt`) |
| 3 | Verify scorecard submission flow |
| 4 | Wire AI question generation UI |

### 2C: Candidate AI Features

**Agent Brief:** `claude/CLAUDE_CANDIDATE.md` or `gemini/GEMINI_CANDIDATE.md`

| Step | Action |
|------|--------|
| 1 | Add job recommendations section (AI) |
| 2 | Add CV improvement button + display |
| 3 | Add salary benchmark section |
| 4 | Fix ProfileForm.vue type safety |

### 2D: Job & Offer Completion

**Agent Brief:** `claude/CLAUDE_JOB.md` + `claude/CLAUDE_OFFER.md`

| Step | Action |
|------|--------|
| 1 | Add job close/unpublish UI button |
| 2 | Wire autocomplete to search |
| 3 | Add candidate offer response UI (Accept/Decline) |
| 4 | Fix JobFormPage.vue type safety |

---

## Phase 2.5: Subscription & Payment Verification

**Agent Brief:** `claude/CLAUDE_SUBSCRIPTION.md` or `gemini/GEMINI_SUBSCRIPTION.md`

| Step | Action |
|------|--------|
| 1 | Verify complete payment flow end-to-end |
| 2 | Ensure quota display works |
| 3 | Verify cancellation flow |

---

## Dependency Graph

```
Phase 0A (Error/i18n) ──┐
                         ├──> Phase 1A (Layout) ──┐
Phase 0B (Auth/Guard) ──┘                         ├──> Phase 2A (Pipeline)
                         ├──> Phase 1B (Company)──┤    Phase 2B (Interview)
                         │                         ├──> Phase 2C (Candidate AI)
                         │                         ├──> Phase 2D (Job/Offer)
                         │                         └──> Phase 2.5 (Subscription)
```

---

## BE Changes Required (Out of FE Scope)

These items block full resolution of BUG-005 and must be completed by a backend agent:

| Priority | BE Change | Unblocks |
|----------|-----------|----------|
| P0 | Add `POST /vietrecruit/companies` endpoint (or upsert via PUT) | BUG-005 full fix |
| P0 | Add `companyId` claim to JWT (or ensure GET /users/me returns it) | Auth flow completion |
| P1 | Add `companyProfileComplete` to JWT or user response | Router guard accuracy |
| P2 | Add `permissions` claim to JWT | Admin transaction permission |
| P2 | Add `user` object to `LoginResponse` | Eliminate JWT parsing fallback |

---

## Verification Checklist (Post All Phases)

| Scenario | Expected |
|----------|----------|
| Register CANDIDATE -> OTP -> Login | Reaches `/jobs` |
| Register EMPLOYER -> OTP -> Login | Reaches `/onboarding/employer`, sees placeholder (not crash) |
| Login COMPANY_ADMIN with company | Reaches `/workspace` |
| Login HR | Reaches `/workspace/jobs` |
| Login INTERVIEWER | Reaches `/workspace/my-interviews` |
| Login SYSTEM_ADMIN | Reaches `/admin` |
| API error (any) | Vietnamese error message displayed |
| Navigate workspace routes | Sidebar/header persists |
| Pipeline kanban | Vietnamese stage labels |
| Apply to job without CV | Vietnamese "Can tai len CV truoc khi ung tuyen." |
| Exceed job quota | Vietnamese "Da dat gioi han so luong tin tuyen dung." |
| Search Vietnamese text with diacritics | Results returned correctly |
| Admin transactions | Accessible without permissions error |

---

## Agent Assignment Strategy

**For parallel execution:**
- Phase 0: 2 agents simultaneously (0A + 0B)
- Phase 1: 2 agents simultaneously (1A + 1B)
- Phase 2: Up to 4 agents simultaneously (2A + 2B + 2C + 2D)

**Total agent runs:** 8-10 sequential agent invocations, ~4 parallel batches.

**Agent selection:**
- Structural changes (layouts, routing): Claude Code preferred (direct file manipulation)
- Data-heavy changes (error mappings, enum fixes): Either agent works
- New component creation: Gemini preferred for initial scaffold, Claude Code for refinement
