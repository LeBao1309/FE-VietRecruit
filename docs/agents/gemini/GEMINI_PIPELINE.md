# GEMINI_PIPELINE.md -- Pipeline & Application Domain Agent Brief

> Target Agent: Gemini | Domain: Application Pipeline, Status Management, Kanban
> Dependencies: BE_CONTRACT.md, BUG_REGISTER.md (BUG-001, BUG-004)

---

## Domain Scope

Application pipeline (kanban board), application status transitions, status history, candidate application tracking.

## FE Files to Modify

| File | Purpose |
|------|---------|
| `src/features/pipeline/services/application.service.ts` | Pipeline application API |
| `src/features/pipeline/stores/usePipelineStore.ts` | Pipeline state |
| `src/stores/usePipelineStore.ts` | DUPLICATE -- remove after consolidation |
| `src/features/workspace/views/PipelinePage.vue` | Kanban view |
| `src/features/workspace/components/KanbanBoard.vue` | Kanban board component |
| `src/features/candidate/services/application.service.ts` | Candidate application API |
| `src/features/candidate/stores/my-applications.store.ts` | Candidate's applications state |
| `src/features/candidate/views/MyApplicationsPage.vue` | Candidate application list |
| `src/features/candidate/views/ApplicationDetailPage.vue` | Application detail |
| `src/core/constants/pipeline-stages.ts` | Stage config (English labels) |

## BE Endpoints

**Employer:**
- `POST /vietrecruit/applications` -- Apply (CANDIDATE only, requires CV)
- `GET /vietrecruit/applications?jobId=X&status=X&page=X&size=X` -- List applications
- `GET /vietrecruit/applications/{id}` -- Application detail
- `PUT /vietrecruit/applications/{id}/status` -- Change status (`UpdateStatusRequest{status, rejectionReason}`)
- `GET /vietrecruit/applications/{id}/status-history` -- History

**Candidate:**
- `GET /vietrecruit/applications/mine?page=X&size=X&status=X` -- My applications

**AI Screening:**
- `POST /vietrecruit/applications/jobs/{jobId}/screening/trigger` -- Trigger AI screening
- `GET /vietrecruit/applications/jobs/{jobId}/screening` -- Get screening results

## Status Transitions

```
NEW -> SCREENING -> INTERVIEW -> OFFER -> HIRED
  \       \          \           \
   +-------+----------+-----------+---> REJECTED
```

Only forward transitions allowed (except REJECTED which can come from any active stage). Validated server-side via `APPLICATION_INVALID_TRANSITION`.

## Issues

1. **Duplicate pipeline store:** `src/stores/usePipelineStore.ts` and `src/features/pipeline/stores/usePipelineStore.ts` both exist. Agent must consolidate.
2. **Duplicate application service:** Three copies exist (`candidate/`, `pipeline/`, `offer/`). Agent must consolidate into one shared service or clearly separate concerns.
3. **English stage labels (BUG-001):** See GEMINI_WORKSPACE.md for fix.
4. **Error messages in English (BUG-004):** Status transition errors return `APPLICATION_INVALID_TRANSITION` in English.

## Kanban Board Requirements

- Columns: Moi, Sang loc, Phong van, De nghi, Da tuyen, Tu choi
- Drag-and-drop between columns triggers `PUT /{id}/status`
- Validate transition before allowing drop (client-side pre-check)
- Show candidate card with name, position, application date
- Click card -> detail panel (already exists as `CandidateDetailPanel`)

## Testing

- Pipeline store: fetch, filter by status, update status
- Kanban: drag-and-drop status transitions, invalid transition handling
- Status history: timeline display
- AI screening: trigger + display results
