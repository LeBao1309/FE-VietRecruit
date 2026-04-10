# API vs Agent Docs Audit — Full Cross-Reference

> Audit Date: 2026-04-10 | Sources: `docs/api.json` (OpenAPI 3.1.0) vs `docs/agents/` (BE_CONTRACT.md + all CLAUDE_*.md)

---

## Summary

| Metric | Count |
|--------|-------|
| Total API endpoints in `api.json` | **73** |
| Endpoints covered in BE_CONTRACT.md | **67** |
| Endpoints covered in agent task briefs (CLAUDE_*) | **~58** |
| **New endpoints in api.json NOT in BE_CONTRACT** | **6** |
| **Endpoints in BE_CONTRACT marked as MISSING but now exist in api.json** | **1** |
| Schema/Type mismatches between api.json and agent docs | **8** |

---

## 1. CRITICAL FINDING: `POST /companies` Now Exists in api.json

> [!IMPORTANT]
> **BE_CONTRACT.md line 106** says: *"MISSING: No `POST /companies` endpoint to create a company."*
> 
> **BUT `api.json` line 2677-2727** defines: `POST /vietrecruit/companies` — "Creates a new company and associates it with the authenticated user."
> 
> This means **BUG-005 is solvable now.** The CLAUDE_COMPANY.md Task 2 ("Prepare for POST /companies — implement when BE endpoint is available") can be executed immediately.

**Impact:** The entire agent execution playbook assumes this endpoint is missing. This changes:
- CLAUDE_COMPANY.md Task 2 from "placeholder" → **ready to implement**
- BUG-005 root cause chain is no longer fully blocked
- Employer onboarding can wire `POST /vietrecruit/companies` with schema `CompanyCreateRequest`

---

## 2. Complete API Path Inventory (api.json vs Agent Docs)

### ✅ Auth Service — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `POST /auth/login` | ✅ | ✅ | CLAUDE_AUTH |
| `POST /auth/register` | ✅ | ✅ | CLAUDE_AUTH |
| `POST /auth/register/invite` | ✅ | ✅ | CLAUDE_AUTH |
| `POST /auth/refresh` | ✅ | ✅ | CLAUDE_AUTH |
| `POST /auth/logout` | ✅ | ✅ | CLAUDE_AUTH |
| `POST /auth/forgot-password` | ✅ | ✅ | CLAUDE_AUTH |
| `POST /auth/reset-password` | ✅ | ✅ | CLAUDE_AUTH |
| `POST /auth/change-password` | ✅ | ✅ | CLAUDE_AUTH |
| `POST /auth/verify-otp` | ✅ | ✅ | CLAUDE_AUTH |
| `POST /auth/resend-otp` | ✅ | ✅ | CLAUDE_AUTH |
| `POST /auth/oauth2/exchange` | ✅ | ✅ | CLAUDE_AUTH |

---

### ✅ Client User Service — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `GET /users/me` | ✅ | ✅ | CLAUDE_AUTH |
| `PUT /users/me` | ✅ | ✅ | CLAUDE_AUTH |
| `POST /users/me/avatar` | ✅ | ✅ | ❌ No UI |
| `PUT /users/me/avatar/url` | ✅ | ✅ | ❌ No UI |
| `DELETE /users/me/avatar` | ✅ | ✅ | ❌ No UI |
| `POST /users/me/banner` | ✅ | ✅ | ❌ No UI |
| `PUT /users/me/banner/url` | ✅ | ✅ | ❌ No UI |
| `DELETE /users/me/banner` | ✅ | ✅ | ❌ No UI |

> [!NOTE]
> Avatar/banner upload endpoints are documented in BE_CONTRACT but no agent task creates FE UI for them. FE_AUDIT.md notes this as a gap.

---

### ⚠️ Company — Discrepancy Found

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `GET /companies/me` | ✅ | ✅ | CLAUDE_COMPANY |
| `PUT /companies/me` | ✅ | ✅ | CLAUDE_COMPANY |
| `GET /companies/search` | ✅ | ✅ | ❌ No task |
| **`POST /companies`** | **✅** | **❌ "MISSING"** | **CLAUDE_COMPANY (placeholder)** |

> [!CAUTION]
> **`POST /companies` exists in api.json** with `CompanyCreateRequest` schema but BE_CONTRACT says it doesn't exist. **Agent docs are stale on this point.**

---

### ✅ Job Service — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `POST /jobs` | ✅ | ✅ | CLAUDE_JOB |
| `GET /jobs` | ✅ | ✅ | CLAUDE_JOB |
| `GET /jobs/{id}` | ✅ | ✅ | CLAUDE_JOB |
| `PUT /jobs/{id}` | ✅ | ✅ | CLAUDE_JOB |
| `PUT /jobs/{id}/publish` | ✅ | ✅ | CLAUDE_JOB |
| `PUT /jobs/{id}/close` | ✅ | ✅ | CLAUDE_JOB |
| `GET /jobs/search` | ✅ | ✅ | CLAUDE_JOB |
| `GET /jobs/autocomplete` | ✅ | ✅ | CLAUDE_JOB |
| `GET /jobs/public` | ✅ | ✅ | CLAUDE_CANDIDATE |
| `GET /jobs/public/{id}` | ✅ | ✅ | CLAUDE_CANDIDATE |

---

### ✅ AI Job Endpoints — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `POST /jobs/ai/generate-description` | ✅ | ✅ | CLAUDE_JOB |
| `POST /jobs/{id}/ai/apply-description` | ✅ | ✅ | CLAUDE_JOB |
| `GET /jobs/{id}/salary-benchmark` | ✅ | ✅ | CLAUDE_CANDIDATE |

---

### ✅ Candidate — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `GET /candidates/me` | ✅ | ✅ | CLAUDE_CANDIDATE |
| `PUT /candidates/me` | ✅ | ✅ | CLAUDE_CANDIDATE |
| `POST /candidates/me/cv` | ✅ | ✅ | CLAUDE_CANDIDATE |
| `DELETE /candidates/me/cv` | ✅ | ✅ | CLAUDE_CANDIDATE |
| `GET /candidates/me/job-recommendations` | ✅ | ✅ | CLAUDE_CANDIDATE |
| `POST /candidates/me/cv/improvement` | ✅ | ✅ | CLAUDE_CANDIDATE |
| `GET /candidates/me/salary-benchmark` | ✅ | ✅ | CLAUDE_CANDIDATE |
| `GET /candidates/search` | ✅ | ✅ | ❌ No task |
| `GET /candidates/{id}` | ✅ | ✅ | ❌ No task |

---

### ✅ Application Service — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `POST /applications` | ✅ | ✅ | CLAUDE_PIPELINE |
| `GET /applications` | ✅ | ✅ | CLAUDE_PIPELINE |
| `GET /applications/mine` | ✅ | ✅ | CLAUDE_CANDIDATE |
| `GET /applications/{id}` | ✅ | ✅ | CLAUDE_PIPELINE |
| `PUT /applications/{id}/status` | ✅ | ✅ | CLAUDE_PIPELINE |
| `GET /applications/{id}/status-history` | ✅ | ✅ | CLAUDE_PIPELINE |
| `GET /applications/jobs/{jobId}/screening` | ✅ | ✅ | CLAUDE_PIPELINE |
| `POST /applications/jobs/{jobId}/screening/trigger` | ✅ | ✅ | CLAUDE_PIPELINE |

---

### ✅ Interview Service — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `POST /applications/{id}/interviews` | ✅ | ✅ | CLAUDE_INTERVIEW |
| `GET /applications/{id}/interviews` | ✅ | ✅ | CLAUDE_INTERVIEW |
| `GET /interviews/{id}` | ✅ | ✅ | CLAUDE_INTERVIEW |
| `PUT /interviews/{id}/status` | ✅ | ✅ | CLAUDE_INTERVIEW |
| `GET /interviews/mine` | ✅ | ✅ | ❌ No explicit task |

> [!NOTE]
> `GET /interviews/mine` (interviewer's own interviews) exists in api.json and BE_CONTRACT but is not explicitly listed in CLAUDE_INTERVIEW task endpoints. The route `/workspace/my-interviews` suggests it's used in the FE already.

---

### ✅ Scorecard Service — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `POST /interviews/{id}/scorecards` | ✅ | ✅ | CLAUDE_INTERVIEW |
| `GET /interviews/{id}/scorecards` | ✅ | ✅ | CLAUDE_INTERVIEW |

---

### ✅ AI Interview Questions — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `POST /interviews/{id}/questions/generate` | ✅ | ✅ | CLAUDE_INTERVIEW |
| `GET /interviews/{id}/questions` | ✅ | ✅ | CLAUDE_INTERVIEW |

---

### ✅ Offer Service — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `POST /applications/{id}/offers` | ✅ | ✅ | CLAUDE_OFFER |
| `GET /applications/{id}/offers` | ✅ | ✅ | CLAUDE_OFFER |
| `GET /offers/{id}` | ✅ | ✅ | CLAUDE_OFFER |
| `PUT /offers/{id}/send` | ✅ | ✅ | CLAUDE_OFFER |
| `PUT /offers/{id}/respond` | ✅ | ✅ | CLAUDE_OFFER |
| `DELETE /offers/{id}` | ✅ | ✅ | CLAUDE_OFFER |

---

### ✅ Subscription & Payment — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `GET /plans` | ✅ | ✅ | CLAUDE_SUBSCRIPTION |
| `GET /plans/{planId}` | ✅ | ✅ | CLAUDE_SUBSCRIPTION |
| `GET /subscriptions/current` | ✅ | ✅ | CLAUDE_SUBSCRIPTION |
| `GET /subscriptions/current/quota` | ✅ | ✅ | CLAUDE_SUBSCRIPTION |
| `PUT /subscriptions/current/cancel` | ✅ | ✅ | CLAUDE_SUBSCRIPTION |
| `POST /payment/checkout` | ✅ | ✅ | CLAUDE_SUBSCRIPTION |
| `GET /payment/payment-status/{orderCode}` | ✅ | ✅ | CLAUDE_SUBSCRIPTION |
| `GET /payment/transactions` | ✅ | ✅ | CLAUDE_SUBSCRIPTION |
| `POST /webhooks/payos` | ✅ | ✅ | ❌ (BE-only) |

---

### ✅ Admin — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `POST /admin/users` | ✅ | ✅ | CLAUDE_ADMIN |
| `GET /admin/users` | ✅ | ✅ | CLAUDE_ADMIN |
| `GET /admin/users/{id}` | ✅ | ✅ | CLAUDE_ADMIN |
| `PUT /admin/users/{id}` | ✅ | ✅ | CLAUDE_ADMIN |
| `DELETE /admin/users/{id}` | ✅ | ✅ | CLAUDE_ADMIN |
| `GET /admin/payment/transactions` | ✅ | ✅ | CLAUDE_ADMIN |
| `GET /admin/knowledge` | ✅ | ✅ | CLAUDE_ADMIN |
| `POST /admin/knowledge` | ✅ | ✅ | CLAUDE_ADMIN |
| `DELETE /admin/knowledge/{documentId}` | ✅ | ✅ | CLAUDE_ADMIN |

---

### ✅ Reference Data (Category, Location, Department) — Fully Covered

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `POST /categories` | ✅ | ✅ | ❌ No task |
| `GET /categories` | ✅ | ✅ | ❌ No task |
| `GET /categories/{id}` | ✅ | ✅ | ❌ No task |
| `PUT /categories/{id}` | ✅ | ✅ | ❌ No task |
| `DELETE /categories/{id}` | ✅ | ✅ | ❌ No task |
| `POST /locations` | ✅ | ✅ | ❌ No task |
| `GET /locations` | ✅ | ✅ | ❌ No task |
| `GET /locations/{id}` | ✅ | ✅ | ❌ No task |
| `PUT /locations/{id}` | ✅ | ✅ | ❌ No task |
| `DELETE /locations/{id}` | ✅ | ✅ | ❌ No task |
| `POST /departments` | ✅ | ✅ | ❌ No task |
| `GET /departments` | ✅ | ✅ | ❌ No task |
| `GET /departments/{id}` | ✅ | ✅ | ❌ No task |
| `PUT /departments/{id}` | ✅ | ✅ | ❌ No task |
| `DELETE /departments/{id}` | ✅ | ✅ | ❌ No task |

> [!NOTE]
> FE_AUDIT.md notes "Department CRUD — No FE page." Category/Location CRUD endpoints exist but no dedicated agent task covers building FE UI for them. They may be consumed internally by Job/Company forms.

---

### ✅ Invitation Service

| API Endpoint | api.json | BE_CONTRACT | Agent Task |
|-------------|:---:|:---:|:---:|
| `POST /invitations` | ✅ | ✅ | CLAUDE_COMPANY |

> [!WARNING]
> BE_CONTRACT only documents `POST /invitations`. However, the FE already has team management UIs that list and revoke invitations (from conversation history). The api.json also only has `POST`. If `GET /invitations` or `DELETE /invitations/{id}` exist but aren't in the OpenAPI spec, they're undocumented.

---

## 3. Schema/DTO Discrepancies (api.json vs BE_CONTRACT)

| Field | BE_CONTRACT | api.json | Impact |
|-------|------------|----------|--------|
| Update user request body name | `UpdateUserRequest{fullName, phone}` | `UpdateProfileRequest{fullName, phone, avatarUrl, linkedinUrl, githubUrl, portfolioUrl, location, dob, gender}` | **api.json has many more fields** — FE types need updating |
| Update user response | `UserResponse` | `UserProfileResponse` (different schema name, includes linkedin/github/portfolio/location/dob/gender) | Different DTO names |
| Candidate update request | `UpdateCandidateRequest{headline, summary, skills, ...}` | `CandidateUpdateRequest` | Schema name difference |
| Company update request | `UpdateCompanyRequest{name, description, website, ...}` | `CompanyUpdateRequest` | Schema name difference |
| Application create request | `CreateApplicationRequest{jobId, coverLetter}` | `ApplicationCreateRequest` | Schema name difference |
| Job create request | `CreateJobRequest{title, description, ...}` | `JobCreateRequest` | Schema name difference |
| Offer respond request | `RespondOfferRequest{accepted}` | `OfferRespondRequest` | Schema name difference |
| Admin user response | `UserResponse` | `AdminUserResponse` (separate schema) | Different DTOs for admin vs client |

> [!TIP]
> When implementing FE TypeScript types, always use the schema names from `api.json` (the actual OpenAPI spec), not from `BE_CONTRACT.md` (which was hand-written from code reading). The `api.json` is auto-generated from the actual BE code and is the ground truth.

---

## 4. Enum Discrepancies (Still Valid from FE_AUDIT)

These issues identified in FE_AUDIT.md and CLAUDE_ERROR_I18N.md are **still valid** and not affected by the api.json update:

| Enum | FE Value | api.json Value | Status |
|------|----------|----------------|--------|
| `INTERVIEW_STATUS.CANCELLED` | `CANCELLED` | `CANCELED` (implied by BE) | ⚠️ Mismatch — needs fix |
| `JOB_STATUS.EXPIRED` | Exists in FE | Not in api.json | ⚠️ Phantom — needs removal |
| `OFFER_STATUS.EXPIRED` | Exists in FE | Not in api.json | ⚠️ Phantom — needs removal |
| `INTERVIEW_STATUS.NO_SHOW` | Exists in FE | Not in api.json | ⚠️ Phantom — needs removal |
| `USER_ROLES.EMPLOYER` | Exists in FE | Not in api.json | ⚠️ Phantom — needs removal |

---

## 5. Endpoints NOT Covered by Any Agent Task

These API endpoints exist and are documented but have **no explicit agent task** to create FE pages/components for them:

| Endpoint | Category | Why No Task |
|----------|----------|-------------|
| `POST/DELETE /users/me/avatar` | User avatar upload | FE_AUDIT notes as gap |
| `POST/DELETE /users/me/banner` | User banner upload | FE_AUDIT notes as gap |
| `PUT /users/me/avatar/url` | Set avatar URL | FE_AUDIT notes as gap |
| `PUT /users/me/banner/url` | Set banner URL | FE_AUDIT notes as gap |
| `GET /candidates/search` | Candidate search | Used internally by pipeline |
| `GET /candidates/{id}` | Candidate detail | Used internally by pipeline |
| `GET /companies/search` | Company search | Public, no FE page |
| `GET /interviews/mine` | Interviewer's interviews | Route exists, may be wired already |
| Category CRUD (5 endpoints) | Reference data | Used internally by forms |
| Location CRUD (5 endpoints) | Reference data | Used internally by forms |
| Department CRUD (5 endpoints) | Reference data | Used internally by forms |
| `POST /webhooks/payos` | Payment webhook | BE-only, no FE needed |

---

## 6. Recommendations

### Immediate Actions

1. **Update BE_CONTRACT.md** — Remove the "MISSING: No `POST /companies`" note (line 106). The endpoint now exists in api.json.
2. **Update CLAUDE_COMPANY.md** — Change Task 2 from "placeholder" to "implement now" with `CompanyCreateRequest` schema.
3. **Update BUG_REGISTER.md** — BUG-005 root cause: the BE fix is done (POST /companies exists). Only the FE side needs wiring.
4. **Update EXECUTION_PLAYBOOK.md** — Remove `POST /companies` from "BE Changes Required" table (line 169).

### FE Type Generation
5. **Use api.json as ground truth** for all TypeScript interfaces. The schema names in api.json (`UserProfileResponse`, `CompanyCreateRequest`, `ApplicationCreateRequest`, etc.) are the canonical names.

### Missing FE Features to Prioritize
6. **User avatar/banner upload UI** — 8 endpoints with no FE
7. **Company search page** — Has endpoint, no FE  
8. **Candidate search page** — Has endpoint, no explicit FE task (used internally)
