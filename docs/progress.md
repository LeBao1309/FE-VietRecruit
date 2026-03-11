# VietRecruit FE — Theo dõi tiến độ

> Cập nhật lần cuối: 2026-03-11

---

## ✅ Hoàn thành

### Module Auth (9/9 endpoints)
- [x] Login / Logout
- [x] Register → OTP verify → Resend OTP
- [x] Forgot Password
- [x] Reset Password *(service + store, thiếu UI)*
- [x] Change Password *(service + store, thiếu UI)*

### Module Plan
- [x] [plan.dto.ts] — Zod schema khớp SQL constraints
- [x] [plan.service.ts] — [listPlans], [getPlan]
- [x] [plan.store.ts] — Pinia store với caching
- [x] [PricingSection.vue] — refactor từ hardcode → API

### Workspace UI Components (Chờ API backend)
- [x] KanbanBoard, KanbanColumn
- [x] CandidateCard, CandidateDetailPanel
- [x] InterviewSlot, JobPostingRow
- [x] StageProgressBar, ScoreTag, CommentThread, AiScoreBadge
- [x] PipelineSidebar, PipelineTopBar, StageTransitionModal

---

## 🔴 Còn thiếu

### Router & Navigation
- [ ] `beforeEach` navigation guard — chưa có, `requiresAuth: true` không được thực thi
- [ ] Route `/contact` — `PricingSection` link đến `/contact` nhưng không có route/page
- [ ] Redirect sau login nếu user đã có session khi vào `/login`

### Auth
- [ ] `ResetPasswordPage.vue` — UI cho reset-password (service đã sẵn)
- [ ] `ChangePasswordPage.vue` — UI cho change-password (service đã sẵn)

### User Profile
- [ ] `user.store.ts` — lưu thông tin user sau login (tên, role, avatar)
- [ ] `GET /vietrecruit/auth/me` hoặc tương đương — cần endpoint lấy profile

### Workspace / Pipeline (Chờ backend expose API)
- [ ] [useWorkspaceStore.ts] — thay mock bằng `GET /workspace/dashboard`
- [ ] [usePipelineStore.ts] — thay mock bằng `GET /applications`
- [ ] [useWorkspace.ts] composable — như trên
- [ ] `PATCH /applications/:id/status` — cập nhật stage khi kéo Kanban

### UI / UX
- [ ] Global toast/notification system — hiện chỉ có inline error trong form
- [ ] 404 Not Found page — route fallback đang redirect về `/` thay vì hiển thị 404
- [ ] Empty states — workspace trống khi chưa có dữ liệu
- [ ] Loading skeleton cho WorkspacePage, PipelinePage

### Chất lượng
- [ ] Unit tests cho [plan.store.ts]
- [ ] Unit tests cho [auth.store.ts] (resetPassword, changePassword)
- [ ] E2E test login flow (Playwright)
- [ ] `.env` production — chưa có file `.env.production`

---

## ⏳ Phụ thuộc backend (Chưa có endpoint)

| Tính năng | Endpoint cần có |
|---|---|
| Dashboard metrics | `GET /workspace/dashboard` |
| Danh sách ứng viên | `GET /applications?jobId=...` |
| Cập nhật stage | `PATCH /applications/:id/status` |
| Thông tin user hiện tại | `GET /auth/me` |
| Upload CV | `POST /candidates/cv` |
| Danh sách jobs | `GET /jobs` |
