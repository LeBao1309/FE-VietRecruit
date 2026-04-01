# GEMINI_INTERVIEW.md -- Interview & Scorecard Domain Agent Brief

> Target Agent: Gemini | Domain: Interview Scheduling, Scorecards, AI Questions
> Dependencies: BE_CONTRACT.md, FE_AUDIT.md

---

## Domain Scope

Interview scheduling per application, status management, scorecard submission by interviewers, AI question generation.

## FE Files to Modify

| File | Purpose |
|------|---------|
| `src/features/interview/services/interview.service.ts` | Interview API |
| `src/features/interview/services/scorecard.service.ts` | Scorecard API |
| `src/features/interview/services/ai-interview.service.ts` | AI question generation |
| `src/features/interview/stores/useInterviewStore.ts` | Interview state |
| `src/features/interview/stores/useScorecardStore.ts` | Scorecard state |
| `src/features/interview/views/InterviewListPage.vue` | HR interview list |
| `src/features/interview/views/InterviewerDashboard.vue` | Interviewer's view |
| `src/features/interview/views/ScorecardDashboard.vue` | Scorecard overview |
| `src/core/constants/enums.ts` | INTERVIEW_STATUS enum (SPELLING BUG) |

## BE Endpoints

**Interviews:**
- `POST /vietrecruit/applications/{id}/interviews` -- Schedule (`CreateInterviewRequest{scheduledAt, interviewerIds, location, notes}`)
- `GET /vietrecruit/applications/{id}/interviews` -- List interviews for application
- `GET /vietrecruit/interviews/{id}` -- Interview detail
- `PUT /vietrecruit/interviews/{id}/status` -- Update status (`SCHEDULED -> COMPLETED | CANCELED`)

**Scorecards:**
- `POST /vietrecruit/interviews/{id}/scorecards` -- Submit (`CreateScorecardRequest{rating, recommendation[STRONG_YES|YES|NO|STRONG_NO], notes}`)
- `GET /vietrecruit/interviews/{id}/scorecards` -- List scorecards

**AI Questions:**
- `POST /vietrecruit/interviews/{id}/questions/generate` -- Generate AI questions
- `GET /vietrecruit/interviews/{id}/questions` -- Get generated questions

## Enum Bug: CANCELLED vs CANCELED

**Critical:** FE uses `CANCELLED` (two Ls), BE uses `CANCELED` (one L). Fix:
```typescript
export const INTERVIEW_STATUS = {
  SCHEDULED:  'SCHEDULED',
  COMPLETED:  'COMPLETED',
  CANCELED:   'CANCELED',    // WAS: CANCELLED (wrong spelling)
  // NO_SHOW:    'NO_SHOW',  // REMOVE (phantom, not in BE)
} as const
```

This fix must propagate to all components that check interview status.

## Status Transitions

```
SCHEDULED -> COMPLETED
SCHEDULED -> CANCELED
```

Only these two transitions are valid. `NO_SHOW` does not exist in BE.

## Scorecard Constraints

- One scorecard per interviewer per interview (enforced by `SCORECARD_DUPLICATE`)
- Only assigned interviewers can submit (`SCORECARD_NOT_ELIGIBLE`)
- Interview must be `COMPLETED` before scorecard submission (`SCORECARD_INTERVIEW_NOT_READY`)
- Recommendation values: `STRONG_YES`, `YES`, `NO`, `STRONG_NO`

## Workspace Store Interview Issue

`useWorkspaceStore.ts` filters upcoming interviews with triple fallback:
```typescript
new Date(i.scheduledAt ?? i.startTime ?? i.date)
```

The BE field is `scheduledAt`. Use only that field. Remove `startTime` and `date` fallbacks.

## Testing

- Interview store: schedule, update status, validation
- Scorecard: submit, duplicate prevention, eligibility check
- AI questions: generate, display, use in interview prep
- Interviewer dashboard: only see assigned interviews
