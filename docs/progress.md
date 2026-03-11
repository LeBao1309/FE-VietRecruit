# VietRecruit FE — Progress Tracker

> Last updated: 2026-03-11

---

## ✅ Completed

### Auth Module (9/9 endpoints — 6 views)
- [x] Login / Logout
- [x] Register → OTP Verify → Resend OTP
- [x] Forgot Password (form + email-sent success state)
- [x] Reset Password (token from email, confirm password, success state)
- [x] Change Password (current + new + confirm, auto-logout on success)

### Plan Module (API integrated)
- [x] `plan.dto.ts` — Zod schema matching SQL constraints
- [x] `plan.service.ts` — `listPlans`, `getPlan`
- [x] `plan.store.ts` — Pinia store with caching
- [x] `PricingSection.vue` — replaced hardcoded tiers with API data + loading/error states

### Workspace UI Components (built — waiting for backend API)
- [x] KanbanBoard, KanbanColumn
- [x] CandidateCard, CandidateDetailPanel
- [x] InterviewSlot, JobPostingRow
- [x] StageProgressBar, ScoreTag, CommentThread, AiScoreBadge
- [x] PipelineSidebar, PipelineTopBar, StageTransitionModal

### Infrastructure
- [x] Axios instance with dual-token interceptor (auto-refresh on 401)
- [x] Token service (localStorage, expiry buffer)
- [x] Router navigation guard (`requiresAuth` + `guestOnly`)
- [x] Shared `ApiResponse<T>` envelope type
- [x] Error utils with Vietnamese error code mapping
- [x] Vercel SPA rewrite (`vercel.json`)

---

## 🔴 Remaining

### Workspace / Pipeline (blocked — backend endpoints not available)
- [ ] `useWorkspaceStore.ts` — replace mock with `GET /workspace/dashboard`
- [ ] `usePipelineStore.ts` — replace mock with `GET /applications`
- [ ] `useWorkspace.ts` composable — same as above
- [ ] `PATCH /applications/:id/status` — update stage on Kanban drag

### User Profile
- [ ] `user.store.ts` — persist user info after login (name, role, avatar)
- [ ] Needs backend endpoint: `GET /auth/me` or equivalent

### UI / UX
- [ ] Global toast/notification system (currently inline errors only)
- [ ] 404 Not Found page (fallback currently redirects to `/`)
- [ ] Empty states for workspace when no data
- [ ] Loading skeletons for WorkspacePage, PipelinePage

### Quality
- [ ] Unit tests for `plan.store.ts`
- [ ] Unit tests for `auth.store.ts` (resetPassword, changePassword)
- [ ] E2E test for login flow (Playwright)

---

## ⏳ Blocked on Backend (endpoints not in API spec yet)

| Feature | Required Endpoint |
|---|---|
| Dashboard metrics | `GET /workspace/dashboard` |
| Application list | `GET /applications?jobId=...` |
| Stage update | `PATCH /applications/:id/status` |
| Current user profile | `GET /auth/me` |
| CV upload | `POST /candidates/cv` |
| Job listing | `GET /jobs` |
