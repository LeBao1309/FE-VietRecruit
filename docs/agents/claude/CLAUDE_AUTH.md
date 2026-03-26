# CLAUDE_AUTH.md -- Auth & Onboarding Domain Agent Brief

> Target Agent: Claude Code | Domain: Authentication, Registration, Onboarding
> Protocol: Read this brief -> Read BUG_REGISTER.md (BUG-003, BUG-005) -> Read BE_CONTRACT.md Section 1-2 -> Execute

---

## Execution Context

You are fixing the auth/onboarding domain. This domain has TWO critical bugs (BUG-003, BUG-005) that block all employer functionality. BUG-005 requires BE changes first; your FE work prepares for and adapts to those changes.

## Mandatory Pre-Read Files

1. `docs/agents/BUG_REGISTER.md` -- Full root cause chains for BUG-003 and BUG-005
2. `docs/agents/BE_CONTRACT.md` -- Section 1 (Auth), Section 2 (User), JWT claims
3. `src/core/stores/auth.store.ts` -- Current auth state management
4. `src/core/router/index.ts` -- Current route guards
5. `src/features/onboarding/stores/onboarding.store.ts` -- Onboarding state

## Tasks (Ordered)

### Task 1: Fix parseUserFromJwt()

**File:** `src/core/stores/auth.store.ts`, function `parseUserFromJwt()`

The function reads JWT claims that do not exist. After login, immediately call `GET /vietrecruit/users/me` to get full user context.

**Changes:**
1. `parseUserFromJwt()` should only extract what JWT actually contains: `sub`, `roles`, `email_verified`
2. Add a `fetchUserProfile()` action that calls `GET /users/me` and fills in `email`, `fullName`, `companyId`, `avatarUrl`
3. In `login()` action: after token storage, call `fetchUserProfile()` before routing
4. In `handleOAuthCallback()`: same pattern

### Task 2: Fix Router Guard

**File:** `src/core/router/index.ts`

1. Lines 27-34: Replace `auth.user?.companyProfileComplete` check with `auth.user?.companyId === null` (sourced from `GET /users/me`)
2. Lines 44-63: Remove `permissions` check entirely (JWT never includes it). Gate admin transaction route by `allowedRoles` only.

### Task 3: Fix Onboarding Store

**File:** `src/features/onboarding/stores/onboarding.store.ts`

1. Line 82: Change candidate post-onboarding redirect from WORKSPACE to `/jobs`
2. Employer onboarding: handle 403 from `GET /companies/me` gracefully -- show company creation form if no company exists

### Task 4: Add Loading/Error States

All auth views must have explicit loading and error UI states. Currently some views render empty on API failure.

## Validation

After changes:
- Login as CANDIDATE: should reach `/jobs`
- Login as COMPANY_ADMIN (new): should reach `/onboarding/employer` and see creation form (not error)
- Login as HR: should reach `/workspace/jobs`
- Login as INTERVIEWER: should reach `/workspace/my-interviews`
- Login as SYSTEM_ADMIN: should reach `/admin`
- Admin transactions route: accessible by SYSTEM_ADMIN without permissions check

## Run Tests

```bash
cd FE-VietRecruit && pnpm test
```
