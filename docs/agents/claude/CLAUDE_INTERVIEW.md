# CLAUDE_INTERVIEW.md -- Interview & Scorecard Domain Agent Brief

> Target Agent: Claude Code | Domain: Interview Scheduling, Scorecards, AI Questions
> Protocol: Read this brief -> Read BE_CONTRACT.md Section 6 -> Execute

---

## Mandatory Pre-Read Files

1. `docs/agents/BE_CONTRACT.md` -- Section 6 (Interviews, Scorecards, AI Questions)
2. `src/features/interview/services/interview.service.ts`
3. `src/features/interview/services/scorecard.service.ts`
4. `src/features/interview/stores/useInterviewStore.ts`
5. `src/core/constants/enums.ts` -- INTERVIEW_STATUS fix

## Critical: Enum Spelling Fix

`CANCELLED` -> `CANCELED` (handled by CLAUDE_ERROR_I18N.md). After that change, grep all interview components for `CANCELLED` references and update.

Also remove `NO_SHOW` from `INTERVIEW_STATUS`.

## Tasks

### Task 1: Verify Service Endpoints

Ensure `interview.service.ts` calls correct endpoints:
- `POST /vietrecruit/applications/{appId}/interviews`
- `GET /vietrecruit/applications/{appId}/interviews`
- `GET /vietrecruit/interviews/{id}`
- `PUT /vietrecruit/interviews/{id}/status`

Ensure `scorecard.service.ts` calls:
- `POST /vietrecruit/interviews/{id}/scorecards`
- `GET /vietrecruit/interviews/{id}/scorecards`

### Task 2: Fix Workspace Store Interview Field

In `useWorkspaceStore.ts`, the interview date filter uses triple fallback:
```typescript
new Date(i.scheduledAt ?? i.startTime ?? i.date)
```

Change to only `i.scheduledAt` (the actual BE field name).

### Task 3: Wire AI Interview Questions

Ensure `ai-interview.service.ts` calls:
- `POST /vietrecruit/interviews/{id}/questions/generate`
- `GET /vietrecruit/interviews/{id}/questions`

Verify the question generation UI exists and works.

## Validation

- Schedule interview for application -> POST succeeds
- Update interview status to COMPLETED -> succeeds
- Update interview status to CANCELED (one L) -> succeeds
- Submit scorecard -> uniqueness enforced
- Generate AI questions -> questions displayed

## Run Tests

```bash
cd FE-VietRecruit && pnpm test
```
