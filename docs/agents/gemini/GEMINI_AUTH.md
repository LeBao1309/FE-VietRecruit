# GEMINI_AUTH.md -- Auth & Onboarding Domain Agent Brief

> Target Agent: Gemini | Domain: Authentication, Registration, Onboarding
> Dependencies: BE_CONTRACT.md, BUG_REGISTER.md (BUG-003, BUG-005)

---

## Domain Scope

All auth flows (login, register, OTP, OAuth2, password reset/change) and employer/candidate onboarding.

## FE Files to Modify

| File | Purpose |
|------|---------|
| `src/features/auth/services/auth.service.ts` | Auth API calls |
| `src/core/stores/auth.store.ts` | Auth state, JWT parsing, post-login routing |
| `src/core/router/index.ts` | Route guards (companyProfileComplete, permissions) |
| `src/features/auth/views/*.vue` | 8 auth pages |
| `src/features/onboarding/stores/onboarding.store.ts` | Onboarding state |
| `src/features/onboarding/views/EmployerOnboardingPage.vue` | Employer onboarding (BROKEN) |
| `src/features/onboarding/views/CandidateOnboardingPage.vue` | Candidate onboarding |
| `src/core/api/token.service.ts` | Token storage |

## BE Endpoints Used

- `POST /vietrecruit/auth/login` -> `LoginResponse{accessToken, refreshToken, expiresIn, tokenType}`
- `POST /vietrecruit/auth/register` -> void
- `POST /vietrecruit/auth/register/invite` -> void
- `POST /vietrecruit/auth/refresh` -> `LoginResponse`
- `POST /vietrecruit/auth/logout` -> void
- `POST /vietrecruit/auth/verify-otp` -> void
- `POST /vietrecruit/auth/resend-otp` -> void
- `POST /vietrecruit/auth/forgot-password` -> void
- `POST /vietrecruit/auth/reset-password` -> void
- `POST /vietrecruit/auth/change-password` -> void
- `POST /vietrecruit/auth/oauth2/exchange` -> `LoginResponse`
- `GET /vietrecruit/users/me` -> `UserResponse` (for fetching full user context post-login)

## Critical Bugs in This Domain

### BUG-005: Employer Onboarding Blocked

**Root Cause:** Registration creates User with null companyId. JWT lacks company claims. Onboarding page calls `GET /companies/me` which fails with 403.

**Agent Task:** After BE fixes (POST /companies endpoint or company auto-creation), the FE must:
1. Modify `parseUserFromJwt()` to NOT read phantom claims (companyId, companyProfileComplete) from JWT
2. After login, call `GET /users/me` to get full user context including companyId
3. Modify router guard: check companyId from `GET /users/me` response, not JWT
4. Onboarding page: if `GET /companies/me` returns 403, show company creation form -> `POST /companies`
5. After company creation: refresh tokens to get updated claims

### BUG-003: Router Guard Issues

**Agent Task:**
1. Remove `permissions` check from router guard (lines 44-63) until BE includes permissions in JWT
2. The `companyProfileComplete` gate must use data from `GET /users/me`, not JWT claims
3. Add loading states to all view components that fetch on mount

## Onboarding Store Bug

`onboarding.store.ts` line 82: `updateCandidateProfile()` redirects to WORKSPACE instead of JOB_BOARD. Candidates should go to `/jobs` after onboarding.

## Validation Schemas

Auth forms use Zod schemas. All error messages must be Vietnamese. Verify:
- Email format validation
- Password strength (min 8 chars)
- Phone format (Vietnamese mobile: 0[3|5|7|8|9]XXXXXXXX)
- OTP format (6 digits)

## Testing Requirements

- Auth store: test login -> token storage -> user parsing -> routing
- Router guard: test all role/state combinations
- OTP flow: test verify + resend + cooldown
- OAuth2: test callback handling
