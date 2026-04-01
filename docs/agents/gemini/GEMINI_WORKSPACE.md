# GEMINI_WORKSPACE.md -- Workspace & Layout Domain Agent Brief

> Target Agent: Gemini | Domain: Workspace Dashboard, Layout System, Pipeline
> Dependencies: BE_CONTRACT.md, BUG_REGISTER.md (BUG-001, BUG-002)

---

## Domain Scope

Workspace dashboard, shared layout system, pipeline/kanban board, and workspace navigation.

## FE Files to Modify

| File | Purpose |
|------|---------|
| `src/stores/useWorkspaceStore.ts` | Dashboard data aggregation (NEEDS FIX) |
| `src/features/workspace/composables/useWorkspace.ts` | Workspace composable (4 console logs, TODOs) |
| `src/features/workspace/views/WorkspacePage.vue` | Dashboard page |
| `src/features/workspace/views/PipelinePage.vue` | Kanban pipeline |
| `src/features/workspace/components/KanbanBoard.vue` | Kanban component (1 `as any`) |
| `src/features/workspace/components/JobPostingRow.vue` | Job row (2 TODOs) |
| `src/features/workspace/components/CommentThread.vue` | Comments (1 TODO) |
| `src/features/workspace/components/PipelineSidebar.vue` | Pipeline sidebar |
| `src/core/router/routes.ts` | Route structure (needs layout wrapper) |
| `src/core/constants/pipeline-stages.ts` | English labels (BUG-001) |
| Missing: `src/features/workspace/components/WorkspaceLayout.vue` | MUST CREATE |

## Critical Bugs in This Domain

### BUG-002: No Shared Workspace Layout

**Root Cause:** Workspace routes are flat top-level routes. No parent layout wraps them.

**Agent Task:**
1. Create `WorkspaceLayout.vue` with:
   - Shared sidebar navigation (Dashboard, Pipeline, Jobs, Interviews, Scorecards, Offers, Settings)
   - Consistent header with user info, company name
   - `<router-view />` slot for child content
2. Restructure routes.ts:
   ```typescript
   {
     path: '/workspace',
     component: () => import('.../WorkspaceLayout.vue'),
     meta: { requiresAuth: true, allowedRoles: ['COMPANY_ADMIN', 'HR', 'INTERVIEWER'] },
     children: [
       { path: '', name: 'Workspace', component: WorkspacePage },
       { path: 'pipeline', name: 'Pipeline', component: PipelinePage },
       { path: 'jobs', name: 'JobList', component: JobListPage },
       { path: 'jobs/create', name: 'JobCreate', component: JobFormPage },
       { path: 'jobs/:id/edit', name: 'JobEdit', component: JobFormPage },
       { path: 'interviews', name: 'InterviewList', component: InterviewListPage },
       { path: 'my-interviews', name: 'InterviewerDashboard', component: InterviewerDashboard },
       { path: 'scorecards', name: 'ScorecardDashboard', component: ScorecardDashboard },
       { path: 'offers', name: 'OfferDashboard', component: OfferDashboardView },
     ]
   }
   ```
3. Move `/offers` under `/workspace/offers`

### BUG-001: English Pipeline Labels

**Agent Task:**
Replace in `pipeline-stages.ts`:
```
'New'       -> 'Moi'
'Screening' -> 'Sang loc'
'Interview' -> 'Phong van'
'Offer'     -> 'De nghi'
'Hired'     -> 'Da tuyen'
'Rejected'  -> 'Tu choi'
```

## Workspace Store Issues

`useWorkspaceStore.ts` requires:
1. Replace `as any` casts with proper DTO types
2. Remove empty `jobId: ''` parameter -- use proper API params
3. Fix interview date field: determine actual BE field name (likely `scheduledAt`)
4. Remove `console.error(e)` -- use proper error state
5. Add loading/error/empty states

## Duplicate Store

Both `src/stores/usePipelineStore.ts` and `src/features/pipeline/stores/usePipelineStore.ts` exist. Consolidate to the feature-level store and remove the root-level one.

## BE Endpoints Used

- `GET /vietrecruit/jobs?page=0&size=10` -> `PageResponse<JobResponse>`
- `GET /vietrecruit/applications?jobId=&size=50` -> `PageResponse<ApplicationResponse>`
- (Interview listing endpoint -- check BE contract)

## Testing

- WorkspaceLayout: renders sidebar, switches views
- Pipeline stages: correct Vietnamese labels
- Workspace store: proper typing, error handling
