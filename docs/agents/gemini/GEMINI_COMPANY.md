# GEMINI_COMPANY.md -- Company & Department Domain Agent Brief

> Target Agent: Gemini | Domain: Company Profile, Department Management, Team
> Dependencies: BE_CONTRACT.md, BUG_REGISTER.md (BUG-005)

---

## Domain Scope

Company profile management, department CRUD, team member management, company search.

## FE Files to Modify

| File | Purpose |
|------|---------|
| `src/features/company/services/company.service.ts` | Company API |
| `src/features/company/services/team.service.ts` | Team management API |
| `src/features/company/services/org.service.ts` | Org structure API |
| `src/features/company/stores/useCompanyStore.ts` | Company state |
| `src/features/company/views/CompanySettingsPage.vue` | Company settings |
| `src/core/stores/team.store.ts` | Team state |
| `src/core/stores/org.store.ts` | Org state |

## BE Endpoints

**Company:**
- `GET /vietrecruit/companies/me` -- Current user's company (requires companyId)
- `PUT /vietrecruit/companies/me` -- Update company profile
- `GET /vietrecruit/companies/search` -- ES company search (`query, page, size`)
- **MISSING: `POST /vietrecruit/companies`** -- Create company (BUG-005)

**Departments:**
- `POST /vietrecruit/departments` -- Create department (company-scoped)
- `GET /vietrecruit/departments` -- List departments
- `GET /vietrecruit/departments/{id}` -- Department detail
- `PUT /vietrecruit/departments/{id}` -- Update department
- `DELETE /vietrecruit/departments/{id}` -- Delete department

**Invitations:**
- `POST /vietrecruit/invitations` -- Invite team member (HR or INTERVIEWER only)

## BUG-005 Impact

All company endpoints call `resolveCompanyId()` which fails for new employers. This domain is blocked until BUG-005 BE fix is deployed.

**FE Preparation:**
1. Company store: add error handling for 403 on GET /companies/me
2. Company settings page: graceful fallback when company data unavailable
3. If BE adds `POST /companies`: wire up company creation form in onboarding or settings

## Department CRUD

No FE page exists for department management. The department endpoints exist in BE but are only used internally (e.g., when creating jobs, department is selected from a dropdown).

**Agent Task:** If a department management UI is needed, create:
- Department list component (table with CRUD)
- Integrate into Company Settings page as a tab/section

## Team Management

The invitation flow allows COMPANY_ADMIN to invite HR and INTERVIEWER members:
1. `POST /vietrecruit/invitations` sends email with invite link
2. Invitee registers via `/auth/register/invite` with token
3. New user is created with the invited role and associated to the company

**FE Side:** `InviteRegisterPage.vue` exists for the accept side. No "Send Invitation" UI exists in the FE yet (team.service.ts may have the API call, but verify).

## Testing

- Company store: fetch, update, handle 403
- Department: CRUD operations if UI built
- Invitation: send invite, track pending invitations
