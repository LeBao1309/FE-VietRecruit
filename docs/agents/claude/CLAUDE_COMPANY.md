# CLAUDE_COMPANY.md -- Company & Department Domain Agent Brief

> Target Agent: Claude Code | Domain: Company Profile, Department, Team, Invitations
> Protocol: Read this brief -> Read BUG_REGISTER.md (BUG-005) -> Read BE_CONTRACT.md Section 3, 8, 9 -> Execute

---

## Mandatory Pre-Read Files

1. `docs/agents/BUG_REGISTER.md` -- BUG-005
2. `docs/agents/BE_CONTRACT.md` -- Section 3 (Company), 8 (Departments), 9 (Invitations)
3. `src/features/company/services/company.service.ts`
4. `src/features/company/stores/useCompanyStore.ts`

## Tasks

### Task 1: Handle Company 403 Gracefully

When `GET /companies/me` returns 403 (BUG-005), the company store must NOT crash.

**Changes to `useCompanyStore.ts`:**
1. Catch 403 error specifically
2. Set a `companyExists: false` flag
3. Expose this flag to components
4. Company settings page: if `companyExists === false`, show message "Chua co thong tin cong ty. Vui long tao ho so cong ty." with creation form (when BE adds POST endpoint)

### Task 2: Prepare for POST /companies

When BE adds `POST /vietrecruit/companies`:
1. Add `createCompany()` to `company.service.ts`
2. Add `create()` action to `useCompanyStore.ts`
3. Wire into employer onboarding flow

This is a placeholder task -- implement when BE endpoint is available.

### Task 3: Verify Invitation Flow

`POST /vietrecruit/invitations` sends invite. Check if `team.service.ts` has this wired. If not, add it. If there's no "Invite Team Member" UI, create a simple form accessible from company settings.

## Validation

- Company settings page: loads without crash even if 403
- Department CRUD: if UI exists, all operations work
- Send invitation: email sent, invitee can register via invite link

## Run Tests

```bash
cd FE-VietRecruit && pnpm test
```
