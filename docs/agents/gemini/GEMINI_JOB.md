# GEMINI_JOB.md -- Job Management Domain Agent Brief

> Target Agent: Gemini | Domain: Job CRUD, Publishing, Search, AI JD Generation
> Dependencies: BE_CONTRACT.md, FE_AUDIT.md

---

## Domain Scope

Job creation/editing, status lifecycle (DRAFT -> PUBLISHED -> CLOSED), public job board, ES search, autocomplete, AI job description generation.

## FE Files to Modify

| File | Purpose |
|------|---------|
| `src/features/job/services/job.service.ts` | Job API calls |
| `src/features/job/services/ai-job.service.ts` | AI JD generation |
| `src/features/job/stores/useJobStore.ts` | Job state management |
| `src/features/job/views/JobListPage.vue` | Employer job list |
| `src/features/job/views/JobFormPage.vue` | Job create/edit form (1 `as any`) |
| `src/features/candidate/services/job.service.ts` | Public job API (candidate side) |
| `src/features/candidate/stores/job-board.store.ts` | Job board state |
| `src/features/candidate/views/JobBoardPage.vue` | Public job board |
| `src/features/candidate/views/JobDetailPage.vue` | Public job detail |
| `src/core/constants/enums.ts` | JOB_STATUS enum |

## BE Endpoints

**Employer (auth required):**
- `POST /vietrecruit/jobs` -- Create job (checks subscription quota)
- `PUT /vietrecruit/jobs/{id}` -- Update job
- `PUT /vietrecruit/jobs/{id}/publish` -- Publish job (checks quota)
- `PUT /vietrecruit/jobs/{id}/close` -- Close job
- `GET /vietrecruit/jobs` -- List company jobs (`page, size, status, search`)
- `GET /vietrecruit/jobs/{id}` -- Job detail

**Public (no auth):**
- `GET /vietrecruit/jobs/search` -- ES full-text search (`query, categoryId, locationId, salaryMin, salaryMax, page, size`)
- `GET /vietrecruit/jobs/autocomplete` -- Title autocomplete (`query, size`)
- `GET /vietrecruit/jobs/public` -- Public listing
- `GET /vietrecruit/jobs/public/{id}` -- Public detail

**AI:**
- `POST /vietrecruit/jobs/ai/generate-description` -- Generate JD
- `POST /vietrecruit/jobs/{id}/ai/apply-description` -- Apply generated JD to job
- `GET /vietrecruit/jobs/{id}/salary-benchmark` -- Salary benchmark

## Enum Issue

FE `JOB_STATUS` has `EXPIRED` which does not exist in BE. Remove it:
```typescript
export const JOB_STATUS = {
  DRAFT:     'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED:    'CLOSED',
  // EXPIRED:   'EXPIRED',  <-- REMOVE (phantom)
} as const
```

## Missing FE Features

1. **Job close/unpublish:** No UI button to close a published job. BE has `PUT /{id}/close`.
2. **Draft management:** No explicit save-as-draft flow in JobFormPage.
3. **Autocomplete:** BE has `/autocomplete` endpoint -- not wired in FE search.
4. **Salary benchmark on job detail:** BE has `GET /{id}/salary-benchmark` -- no FE integration.

## Search Integration

Job board search should use `GET /vietrecruit/jobs/search` with ES params. Verify:
- Vietnamese diacritics handled by ES analyzer (not FE responsibility if queries go to analyzed fields)
- Category/location filters pass IDs, not names
- Salary range filters work correctly

## Testing

- Job store: create, update, publish, close lifecycle
- Job form: Zod validation, required fields, draft vs publish
- Job board: search, pagination, filter combinations
- AI JD: generate -> preview -> apply flow
