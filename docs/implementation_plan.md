# Implementation Plan — API Audit Gap Resolution

> Source: `docs/api_vs_agents_audit.md`
> Target codebase: `src/` (Vue 3 + TypeScript + Pinia + Tailwind v4)
> All changes are FE-only.

---

## Current State (Confirmed by Code Read)

| Item | Status |
|------|--------|
| `companyService.createCompany()` | ✅ Already implemented |
| `companyStore` — `createCompany` action | ❌ Missing |
| `CompanySetupPage.vue` — handles 403 + creation form | ❓ Needs verification |
| `api-error.ts` — ERROR_MESSAGES map | ⚠️ Partial (~25 codes, 77 total) |
| `enums.ts` — phantom values | ✅ Already clean (no EMPLOYER, EXPIRED, NO_SHOW) |
| `InterviewStatus` — CANCELED spelling | ✅ Correct (`CANCELED`) |
| User avatar/banner upload UI | ❌ Missing (service exists, no UI) |
| `userService` — all avatar/banner methods | ✅ Already implemented |

**Key insight:** The codebase has already progressed significantly beyond the old agent docs. The main remaining gaps are:

1. **`companyStore` missing `createCompany` action** — blocks employer onboarding
2. **`api-error.ts` missing ~52 error codes** — English fallback still fires in many places
3. **No avatar/banner UI** on the shared `ProfilePage.vue`

---

## User Review Required

> [!IMPORTANT]
> **CompanySetupPage.vue behaviour on 403** — The current `companyStore.fetchCompany()` sets `error` state on 403 but doesn't expose whether the error was specifically "not associated with any company". Before implementing Phase 1, confirm: should `CompanySetupPage` show a **"Create Company"** form when `companyStore.error` contains a 403 code, or does it already do that?

> [!WARNING]
> **`api-error.ts` is English** — All current error messages in `ERROR_MESSAGES` are in English but CLAUDE.md says the app is Vietnamese-facing. The audit plan calls for Vietnamese translations. Confirm: should we translate all messages to Vietnamese in this pass, or keep English for now?

---

## Proposed Changes

---

### Phase 0: Error Code Completion (No Dependencies)

**Goal:** Add the ~52 missing BE error codes to `api-error.ts` so all API errors show mapped messages instead of falling through to raw backend messages.

#### [MODIFY] [api-error.ts](file:///c:/Baolqg/project/VietRecruit-project/vietrecruit-fe/src/services/api-error.ts)

Add the following missing codes (mapped from `BE_CONTRACT.md` and `BUG_REGISTER.md`):

```typescript
// Missing Auth codes
AUTH_ACCOUNT_INACTIVE: '...',
AUTH_OTP_COOLDOWN: '...',
AUTH_OTP_LOCKED: '...',
AUTH_TOKEN_INVALID: '...',
AUTH_REFRESH_TOKEN_EXPIRED: '...',
AUTH_REFRESH_TOKEN_INVALID: '...',
AUTH_PASSWORD_MISMATCH: '...',
AUTH_RESET_TOKEN_INVALID: '...',

// Missing User codes  
USER_USERNAME_CONFLICT: '...',
USER_EMAIL_CONFLICT: '...',
USER_AVATAR_INVALID_TYPE: '...',
USER_AVATAR_SIZE_EXCEEDED: '...',
USER_BANNER_INVALID_TYPE: '...',
USER_BANNER_SIZE_EXCEEDED: '...',

// Missing Subscription codes
SUBSCRIPTION_EXPIRED: '...',
SUBSCRIPTION_ALREADY_ACTIVE: '...',

// Missing Payment codes
PAYMENT_CREATION_FAILED: '...',
PAYMENT_NOT_FOUND: '...',
PAYMENT_EXPIRED: '...',
PAYMENT_ACTIVATION_FAILED: '...',
PAYMENT_WEBHOOK_INVALID_SIGNATURE: '...',

// Missing Candidate/File codes
CANDIDATE_NOT_FOUND: '...',
CANDIDATE_CV_INVALID_TYPE: '...',
CANDIDATE_CV_SIZE_EXCEEDED: '...',
FILE_TOO_LARGE: '...',
FILE_TYPE_NOT_ALLOWED: '...',

// Missing Application codes
APPLICATION_DUPLICATE: '...',
APPLICATION_INVALID_TRANSITION: '...',
APPLICATION_CV_REQUIRED: '...',

// Missing Interview codes
INTERVIEW_NOT_FOUND: '...',
INTERVIEW_INVALID_STATUS: '...',
INTERVIEW_INVALID_INTERVIEWER: '...',
INTERVIEW_INVALID_STATUS_TRANSITION: '...',

// Missing Scorecard codes
SCORECARD_NOT_FOUND: '...',
SCORECARD_DUPLICATE: '...',
SCORECARD_NOT_ELIGIBLE: '...',
SCORECARD_INTERVIEW_NOT_READY: '...',

// Missing Offer codes
OFFER_ALREADY_EXISTS: '...',
OFFER_INVALID_TRANSITION: '...',
OFFER_APPLICATION_NOT_READY: '...',

// Missing Invitation codes
INVITATION_NOT_FOUND: '...',
INVITATION_EXPIRED: '...',
INVITATION_ALREADY_ACCEPTED: '...',
INVALID_ACCOUNT_TYPE: '...',
ROLE_GROUP_VIOLATION: '...',

// Missing AI codes
AI_INVALID_RESPONSE: '...',
CV_NOT_PARSED: '...',
CV_IMPROVEMENT_UNAVAILABLE: '...',
INTERVIEW_QUESTIONS_UNAVAILABLE: '...',
SALARY_BENCHMARK_UNAVAILABLE: '...',
JD_GENERATION_UNAVAILABLE: '...',

// Missing Reference codes
DEPARTMENT_NOT_FOUND: '...',
PLAN_NOT_FOUND: '...',
CONCURRENT_MODIFICATION: '...',
CONFLICT: '...',
NOTIFICATION_SEND_FAILED: '...',
SERVICE_UNAVAILABLE: '...',
BAD_REQUEST: '...',
NOT_FOUND: '...',
UNAUTHORIZED: '...',
TOO_MANY_REQUESTS: '...',
```

**Exit criteria:** Zero fallthrough to raw backend `message` field for any known error code.

---

### Phase 1: Employer Onboarding — Create Company (Depends on: Nothing)

**Goal:** Wire the existing `POST /companies` service method into the store + CompanySetupPage, so new COMPANY_ADMIN users can create their company instead of hitting a 403 wall.

#### [MODIFY] [companyStore.ts](file:///c:/Baolqg/project/VietRecruit-project/vietrecruit-fe/src/stores/companyStore.ts)

Add `createCompany` action and `isNew` state flag:

```typescript
// Add to state
const isNew = ref(false)  // true when GET /companies/me returns 403/FORBIDDEN

// Add action
async function createCompany(body: CompanyCreateRequest): Promise<boolean> {
  const ui = useUiStore()
  isSaving.value = true
  error.value = null
  try {
    const result = await companyService.createCompany(body)
    if (result.error) {
      error.value = result.error.message
      ui.toastError('Tạo công ty thất bại', result.error.message)
      return false
    }
    company.value = result.data
    isNew.value = false
    ui.toastSuccess('Thành công', 'Đã tạo hồ sơ công ty.')
    return true
  } finally {
    isSaving.value = false
  }
}

// Modify fetchCompany to detect 403 → set isNew = true
async function fetchCompany(): Promise<void> {
  isLoading.value = true
  error.value = null
  try {
    const result = await companyService.getCompany()
    if (result.error) {
      if (result.error.status === 403) {
        isNew.value = true   // Signal to UI: show creation form
      } else {
        error.value = result.error.message
      }
    } else {
      company.value = result.data
      isNew.value = false
    }
  } finally {
    isLoading.value = false
  }
}
```

#### [MODIFY] [CompanySetupPage.vue](file:///c:/Baolqg/project/VietRecruit-project/vietrecruit-fe/src/views/employer/CompanySetupPage.vue)

Conditionally render "Create Company" vs "Edit Company" form based on `companyStore.isNew`:

```html
<!-- When isNew === true: show creation form with only required fields -->
<template v-if="companyStore.isNew">
  <h2>Thiết lập công ty của bạn</h2>
  <form @submit.prevent="handleCreate">
    <input v-model="form.name" placeholder="Tên công ty *" required />
    <input v-model="form.domain" placeholder="Tên miền (tuỳ chọn)" />
    <input v-model="form.website" placeholder="Website (tuỳ chọn)" />
    <button type="submit" :disabled="companyStore.isSaving">Tạo công ty</button>
  </form>
</template>

<!-- When isNew === false: show edit form as before -->
<template v-else>
  <!-- existing edit form -->
</template>
```

**Exit criteria:** New COMPANY_ADMIN can create a company from the setup page without seeing a raw 403 error.

---

### Phase 2: User Profile — Avatar & Banner Upload UI (Depends on: Nothing)

**Goal:** Add avatar/banner upload controls to `ProfilePage.vue` (shared between employer and candidate). The service layer is already complete (`userService.uploadAvatar`, `userService.uploadBanner`, etc.).

#### [MODIFY] [ProfilePage.vue](file:///c:/Baolqg/project/VietRecruit-project/vietrecruit-fe/src/views/shared/ProfilePage.vue)

Add a profile image section that:
1. Shows current avatar (from `authStore.user.avatarUrl`) or a placeholder
2. Shows a "Change Photo" button that opens a file picker (accept: `image/jpeg,image/png`)
3. On file selection → calls `userService.uploadAvatar(file)` → updates `authStore.user.avatarUrl`
4. Shows a "Remove Photo" button when avatar exists → calls `userService.deleteAvatar()`
5. Same pattern for banner image (`bannerUrl`)

```typescript
// In script setup
async function handleAvatarUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const result = await userService.uploadAvatar(file)
  if (result.data) {
    authStore.setUser({ ...authStore.user!, avatarUrl: result.data.avatarUrl })
    ui.toastSuccess('Cập nhật ảnh đại diện thành công')
  } else {
    ui.toastError('Lỗi', result.error!.message)
  }
}

async function handleAvatarDelete() {
  const result = await userService.deleteAvatar()
  if (!result.error) {
    authStore.setUser({ ...authStore.user!, avatarUrl: null })
    ui.toastSuccess('Đã xoá ảnh đại diện')
  }
}
```

**Exit criteria:** Avatar upload/delete works for both employer and candidate profile pages. Banner follows same pattern.

---

### Phase 3: Extended User Profile Fields (Quick Fix)

**Goal:** The `api.json` `UpdateProfileRequest` includes `dob`, `gender`, `location`, `linkedinUrl`, `githubUrl`, `portfolioUrl`. The types already have these fields (`user.ts` is correct). But the `ProfilePage.vue` form may not expose all fields.

#### [MODIFY] [ProfilePage.vue](file:///c:/Baolqg/project/VietRecruit-project/vietrecruit-fe/src/views/shared/ProfilePage.vue)

Audit visible form fields vs `UpdateProfileRequest` schema — add any missing inputs for: `location`, `linkedinUrl`, `githubUrl`, `portfolioUrl`, `dob`, `gender`.

**Exit criteria:** All `UpdateProfileRequest` fields are editable in the profile form.

---

## Dependency Graph

```
Phase 0 (Error codes)  ──► No blockers, can start immediately
Phase 1 (Company create) ─► No blockers, can start immediately
Phase 2 (Avatar UI)      ─► No blockers, can start immediately
Phase 3 (Profile fields) ─► No blockers, can start immediately

All 4 phases are independent and can run in parallel.
```

---

## Verification Plan

### After Phase 0
```bash
npm run type-check
```
- Trigger any API error (e.g., wrong password) → Vietnamese/English message shown, not raw backend text

### After Phase 1
- Register a new COMPANY_ADMIN account
- Complete email verification → Login
- Navigate to `/employer/company-setup`
- Should see a "Create Company" form (not a 403 error)
- Fill in company name → Submit → Should redirect or show success

### After Phase 2
- Go to `/employer/profile` or `/candidate/profile`
- Upload a JPEG avatar → Avatar updates in navbar/header immediately
- Remove avatar → Reverts to placeholder

### After Phase 3
```bash
npm run type-check
```
- Go to profile page → All fields (`location`, `linkedinUrl`, etc.) should be visible and saveable

---

## Files Touched Summary

| File | Phase | Change Type |
|------|-------|-------------|
| [api-error.ts](file:///c:/Baolqg/project/VietRecruit-project/vietrecruit-fe/src/services/api-error.ts) | 0 | MODIFY — add ~52 error codes |
| [companyStore.ts](file:///c:/Baolqg/project/VietRecruit-project/vietrecruit-fe/src/stores/companyStore.ts) | 1 | MODIFY — add `createCompany`, `isNew`, fix `fetchCompany` 403 handling |
| [CompanySetupPage.vue](file:///c:/Baolqg/project/VietRecruit-project/vietrecruit-fe/src/views/employer/CompanySetupPage.vue) | 1 | MODIFY — conditional create/edit form |
| [ProfilePage.vue](file:///c:/Baolqg/project/VietRecruit-project/vietrecruit-fe/src/views/shared/ProfilePage.vue) | 2 & 3 | MODIFY — add avatar/banner upload UI + extended fields |

> [!NOTE]
> `companyService.ts` already has `createCompany()` implemented. No service file changes needed.
> `userService.ts` already has all avatar/banner methods. No service file changes needed.
> `enums.ts` is already correct. No enum changes needed.
> The router structure (`/employer/*` under `EmployerLayout`) is already correct per CLAUDE.md architecture.
