# CLAUDE_PIPELINE.md -- Pipeline & Application Domain Agent Brief

> Target Agent: Claude Code | Domain: Application Pipeline, Kanban, Status Management
> Protocol: Read this brief -> Read BE_CONTRACT.md Section 6 -> Execute

---

## Mandatory Pre-Read Files

1. `docs/agents/BE_CONTRACT.md` -- Section 6 (Application Module)
2. `src/features/pipeline/services/application.service.ts`
3. `src/features/pipeline/stores/usePipelineStore.ts`
4. `src/features/workspace/views/PipelinePage.vue`
5. `src/features/workspace/components/KanbanBoard.vue`

## Tasks

### Task 1: Consolidate Duplicate Services

Three `application.service.ts` files exist:
- `features/candidate/services/application.service.ts` -- candidate-side
- `features/pipeline/services/application.service.ts` -- employer pipeline
- `features/offer/services/application.service.ts` -- offer context

Evaluate overlap. If they call different endpoints, keep separate. If duplicated, extract shared calls to a common application API module.

### Task 2: Consolidate Duplicate Stores

Delete `src/stores/usePipelineStore.ts`. All imports should use `src/features/pipeline/stores/usePipelineStore.ts`.

### Task 3: KanbanBoard Type Safety

Remove `as any` cast in `KanbanBoard.vue`. Type drag-and-drop handlers against `ApplicationResponse` DTO.

### Task 4: Status Transition Client-Side Validation

Before calling `PUT /applications/{id}/status`, validate the transition is allowed:
- NEW -> SCREENING, REJECTED
- SCREENING -> INTERVIEW, REJECTED
- INTERVIEW -> OFFER, REJECTED
- OFFER -> HIRED, REJECTED

Show Vietnamese error if invalid transition attempted via drag-and-drop.

## Validation

- Kanban columns show Vietnamese labels
- Drag card between valid columns -> status updates
- Drag card to invalid column -> Vietnamese error toast
- Pipeline sidebar stats match kanban counts

## Run Tests

```bash
cd FE-VietRecruit && pnpm test
```
