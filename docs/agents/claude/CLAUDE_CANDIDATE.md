# CLAUDE_CANDIDATE.md -- Candidate Portal Domain Agent Brief

> Target Agent: Claude Code | Domain: Candidate Profile, Job Board, Applications, AI Features
> Protocol: Read this brief -> Read BE_CONTRACT.md Section 5 -> Execute

---

## Mandatory Pre-Read Files

1. `docs/agents/BE_CONTRACT.md` -- Section 5 (Candidate)
2. `src/features/candidate/` -- all files
3. `src/features/onboarding/stores/onboarding.store.ts` -- redirect bug

## Tasks

### Task 1: Fix Onboarding Redirect

`onboarding.store.ts` line 82: candidate post-onboarding redirects to WORKSPACE. Change to `/jobs`.

### Task 2: Add AI Feature UIs

Three BE endpoints have no FE:
1. **Job Recommendations:** `GET /candidates/me/job-recommendations` -- Add "Goi y viec lam" section on job board
2. **CV Improvement:** `POST /candidates/me/cv/improvement` -- Add "Cai thien CV" button on profile page
3. **Salary Benchmark:** `GET /candidates/me/salary-benchmark` -- Add salary info section

### Task 3: Fix ProfileForm.vue `as any`

Remove 1 `as any` cast. Type form data against `UpdateCandidateRequest` DTO.

### Task 4: Consolidate Application Services

`src/features/candidate/services/application.service.ts` handles candidate-side application calls (`POST /applications`, `GET /applications/mine`). Keep this separate from pipeline service which handles employer-side calls.

## Validation

- Update candidate profile -> succeeds
- Upload CV (PDF) -> succeeds, file stored
- Apply to published job -> succeeds
- Apply again -> Vietnamese duplicate error
- Apply without CV -> Vietnamese CV required error
- View my applications -> list renders
- AI recommendations -> data displayed (if BE is running)

## Run Tests

```bash
cd FE-VietRecruit && pnpm test
```
