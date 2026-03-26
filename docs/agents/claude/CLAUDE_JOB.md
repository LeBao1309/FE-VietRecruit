# CLAUDE_JOB.md -- Job Management Domain Agent Brief

> Target Agent: Claude Code | Domain: Job CRUD, Publishing, Search, AI JD Generation
> Protocol: Read this brief -> Read BE_CONTRACT.md Section 4 -> Execute

---

## Execution Context

Job management is partially complete. Missing: close/unpublish UI, autocomplete integration, salary benchmark integration. Enum has phantom EXPIRED value.

## Mandatory Pre-Read Files

1. `docs/agents/BE_CONTRACT.md` -- Section 4 (Job Module)
2. `src/features/job/services/job.service.ts`
3. `src/features/job/stores/useJobStore.ts`
4. `src/features/job/views/JobListPage.vue`
5. `src/features/job/views/JobFormPage.vue`

## Tasks

### Task 1: Add Job Close UI

Add a "Dong tin" (Close) button to published jobs in `JobListPage.vue`. Wire to `PUT /vietrecruit/jobs/{id}/close`.

### Task 2: Wire Autocomplete

BE has `GET /vietrecruit/jobs/autocomplete?query=X&size=5`. Wire to job search input for typeahead suggestions.

### Task 3: Remove JOB_STATUS.EXPIRED

Already handled by CLAUDE_ERROR_I18N.md. Verify no job components reference `EXPIRED` status.

### Task 4: Fix JobFormPage.vue `as any`

Remove the 1 `as any` cast. Type the form data properly against `CreateJobRequest`/`UpdateJobRequest` DTOs.

## Validation

- Create draft job -> save succeeds
- Publish job -> quota check passes (or shows Vietnamese error if quota exceeded)
- Close published job -> status changes to CLOSED
- Search with Vietnamese text -> results returned
- Autocomplete -> suggestions appear

## Run Tests

```bash
cd FE-VietRecruit && pnpm test
```
