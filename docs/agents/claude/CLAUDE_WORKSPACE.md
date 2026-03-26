# CLAUDE_WORKSPACE.md -- Workspace & Layout Domain Agent Brief

> Target Agent: Claude Code | Domain: Workspace Dashboard, Layout System, Pipeline
> Protocol: Read this brief -> Read BUG_REGISTER.md (BUG-001, BUG-002) -> Execute

---

## Execution Context

You are creating the shared workspace layout and fixing pipeline labels. BUG-002 (layout desync) is the primary structural issue. BUG-001 (English labels) is a quick fix.

## Mandatory Pre-Read Files

1. `docs/agents/BUG_REGISTER.md` -- BUG-001 and BUG-002 analysis
2. `src/core/router/routes.ts` -- Current route structure
3. `src/features/admin/components/AdminLayout.vue` -- Reference layout pattern
4. `src/core/constants/pipeline-stages.ts` -- English labels to fix
5. `src/stores/useWorkspaceStore.ts` -- Store issues

## Tasks (Ordered)

### Task 1: Create WorkspaceLayout.vue

**Create:** `src/features/workspace/components/WorkspaceLayout.vue`

Pattern: Follow `AdminLayout.vue` structure.

Contents:
- Sidebar with navigation links: Tong quan (Dashboard), Quy trinh (Pipeline), Tuyen dung (Jobs), Phong van (Interviews), Danh gia (Scorecards), Thu moi (Offers), Cai dat (Settings)
- Header showing company name (from company store) and user info
- `<router-view />` content area
- Role-based nav item visibility (INTERVIEWER sees only My Interviews)

### Task 2: Restructure Workspace Routes

**File:** `src/core/router/routes.ts`

Convert flat workspace routes to nested children under WorkspaceLayout:

```typescript
{
  path: '/workspace',
  component: () => import('@/features/workspace/components/WorkspaceLayout.vue'),
  meta: { requiresAuth: true, allowedRoles: ['COMPANY_ADMIN', 'HR', 'INTERVIEWER'] },
  children: [
    { path: '', name: 'Workspace', component: () => import('@/features/workspace/views/WorkspacePage.vue') },
    { path: 'pipeline', name: 'Pipeline', component: () => import('@/features/workspace/views/PipelinePage.vue') },
    { path: 'jobs', name: 'JobList', component: () => import('@/features/job/views/JobListPage.vue') },
    { path: 'jobs/create', name: 'JobCreate', component: () => import('@/features/job/views/JobFormPage.vue') },
    { path: 'jobs/:id/edit', name: 'JobEdit', component: () => import('@/features/job/views/JobFormPage.vue') },
    { path: 'interviews', name: 'InterviewList', component: () => import('@/features/interview/views/InterviewListPage.vue'), meta: { allowedRoles: ['HR', 'COMPANY_ADMIN'] } },
    { path: 'my-interviews', name: 'InterviewerDashboard', component: () => import('@/features/interview/views/InterviewerDashboard.vue'), meta: { allowedRoles: ['INTERVIEWER'] } },
    { path: 'scorecards', name: 'ScorecardDashboard', component: () => import('@/features/interview/views/ScorecardDashboard.vue'), meta: { allowedRoles: ['HR', 'COMPANY_ADMIN'] } },
    { path: 'offers', name: 'OfferDashboard', component: () => import('@/features/offer/views/OfferDashboardView.vue'), meta: { allowedRoles: ['HR', 'COMPANY_ADMIN'] } },
    { path: 'offers/create', name: 'OfferCreate', component: () => import('@/features/offer/views/OfferCreateView.vue'), meta: { allowedRoles: ['HR', 'COMPANY_ADMIN'] } },
  ]
}
```

Remove the old flat routes for workspace paths. Move `/offers` under `/workspace/offers`. Update any `router.push` calls that reference old routes.

### Task 3: Fix Pipeline Labels

**File:** `src/core/constants/pipeline-stages.ts`

Replace:
```
'New'       -> 'Moi'
'Screening' -> 'Sang loc'
'Interview' -> 'Phong van'
'Offer'     -> 'De nghi'
'Hired'     -> 'Da tuyen'
'Rejected'  -> 'Tu choi'
```

Apply same change to `labelShort`.

### Task 4: Fix Workspace Store

**File:** `src/stores/useWorkspaceStore.ts`

1. Type the API responses properly (remove `as any`)
2. Fix `applicationService.getApplications({ jobId: '', size: 50 })` -- use correct params
3. Use only `scheduledAt` for interview date (remove `startTime`, `date` fallbacks)
4. Replace `console.error(e)` with proper error state
5. Add `error` ref and expose it

### Task 5: Remove Duplicate Pipeline Store

Delete `src/stores/usePipelineStore.ts`. Update any imports to use `src/features/pipeline/stores/usePipelineStore.ts`.

## Validation

- Navigate between all workspace child routes: sidebar and header persist
- Pipeline shows Vietnamese labels
- Workspace dashboard loads without `as any` runtime errors
- No duplicate store imports

## Run Tests

```bash
cd FE-VietRecruit && pnpm test
```
