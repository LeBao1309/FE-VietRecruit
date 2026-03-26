# GEMINI_CANDIDATE.md -- Candidate Portal Domain Agent Brief

> Target Agent: Gemini | Domain: Candidate Profile, Job Board, Applications, AI Features
> Dependencies: BE_CONTRACT.md, FE_AUDIT.md

---

## Domain Scope

Candidate profile management, CV upload, public job board, job applications, AI-powered features (CV improvement, job recommendations, salary benchmark).

## FE Files to Modify

| File | Purpose |
|------|---------|
| `src/features/candidate/services/candidate.service.ts` | Profile API |
| `src/features/candidate/services/application.service.ts` | Application API (DUPLICATE) |
| `src/features/candidate/services/user.service.ts` | User data API |
| `src/features/candidate/services/job.service.ts` | Public job API |
| `src/features/candidate/stores/candidate.store.ts` | Profile state |
| `src/features/candidate/stores/my-applications.store.ts` | Applications state |
| `src/features/candidate/stores/job-board.store.ts` | Job board state |
| `src/features/candidate/components/CandidateLayout.vue` | Layout (CORRECT pattern) |
| `src/features/candidate/components/ProfileForm.vue` | Profile form (1 `as any`) |
| `src/features/candidate/views/CandidateProfilePage.vue` | Profile page |
| `src/features/candidate/views/JobBoardPage.vue` | Public job board |
| `src/features/candidate/views/JobDetailPage.vue` | Job detail |
| `src/features/candidate/views/MyApplicationsPage.vue` | My applications |
| `src/features/candidate/views/ApplicationDetailPage.vue` | Application detail |

## BE Endpoints

**Profile:**
- `GET /vietrecruit/candidates/me` -- Get profile
- `PUT /vietrecruit/candidates/me` -- Update profile
- `POST /vietrecruit/candidates/me/cv` -- Upload CV (PDF, max 5MB)
- `DELETE /vietrecruit/candidates/me/cv` -- Remove CV

**AI Features (CANDIDATE auth):**
- `GET /vietrecruit/candidates/me/job-recommendations` -- AI job matching
- `POST /vietrecruit/candidates/me/cv/improvement` -- AI CV advice
- `GET /vietrecruit/candidates/me/salary-benchmark` -- Salary benchmark

**Applications:**
- `POST /vietrecruit/applications` -- Apply (`{jobId, coverLetter}`, requires CV)
- `GET /vietrecruit/applications/mine` -- My applications

**Public (no auth):**
- `GET /vietrecruit/jobs/search` -- Job search (ES)
- `GET /vietrecruit/jobs/public` -- Public listing
- `GET /vietrecruit/jobs/public/{id}` -- Public detail
- `GET /vietrecruit/jobs/autocomplete` -- Search autocomplete

## Missing AI Features (No FE yet)

1. **Job Recommendations:** BE endpoint exists (`GET /candidates/me/job-recommendations`). No FE page. Create a "Recommended Jobs" section in candidate dashboard or job board.
2. **CV Improvement:** BE endpoint exists (`POST /candidates/me/cv/improvement`). No FE page. Add a "Improve CV" button on profile page that triggers analysis and displays advice.
3. **Salary Benchmark:** BE endpoint exists (`GET /candidates/me/salary-benchmark`). No FE page. Add to profile or as standalone tool.

## Onboarding Bug

`onboarding.store.ts` line 82: After candidate profile update, redirects to WORKSPACE route. Should redirect to `/jobs` (job board).

## Application Flow

```
1. Candidate uploads CV (required)
2. Candidate browses job board or uses AI recommendations
3. Candidate views job detail
4. Candidate clicks "Apply" -> POST /applications
5. Application tracked in "My Applications"
6. Status updates visible in ApplicationDetailPage
7. If offer received: respond via PUT /offers/{id}/respond
```

## Error Handling

- `APPLICATION_DUPLICATE` -- Already applied to this job
- `APPLICATION_CV_REQUIRED` -- Must upload CV before applying
- `JOB_NOT_PUBLISHED` -- Job no longer available
- `CANDIDATE_CV_INVALID_TYPE` -- Only PDF allowed
- `CANDIDATE_CV_SIZE_EXCEEDED` -- Max 5MB

All of these errors will display in English (BUG-004). Agent should map them in error.utils.ts.

## Testing

- Profile: update, CV upload/delete
- Job board: search, pagination, filters
- Application: apply, duplicate prevention, status tracking
- AI features: recommendations display, CV improvement display
