# CLAUDE_OFFER.md -- Offer Domain Agent Brief

> Target Agent: Claude Code | Domain: Offer Management, Candidate Response
> Protocol: Read this brief -> Read BE_CONTRACT.md Section 6 (Offers) -> Execute

---

## Mandatory Pre-Read Files

1. `docs/agents/BE_CONTRACT.md` -- Section 6 (Offers subsection)
2. `src/features/offer/services/offer.service.ts`
3. `src/features/offer/stores/offer.store.ts`
4. `src/features/offer/views/OfferDashboardView.vue`
5. `src/features/offer/views/OfferCreateView.vue`

## Tasks

### Task 1: Consolidate Duplicate Application Service

`src/features/offer/services/application.service.ts` likely duplicates pipeline service. Evaluate and consolidate.

### Task 2: Add Candidate Offer Response UI

No UI exists for candidates to accept/decline offers. Add to `ApplicationDetailPage.vue`:
- When application status is OFFER and an offer exists with status SENT
- Show "Chap nhan" (Accept) and "Tu choi" (Decline) buttons
- Wire to `PUT /vietrecruit/offers/{id}/respond` with `{accepted: true|false}`

### Task 3: Remove OFFER_STATUS.EXPIRED

Handled by CLAUDE_ERROR_I18N.md. Verify no offer components reference `EXPIRED`.

## Validation

- Create offer for application in OFFER status -> succeeds
- Send offer -> status DRAFT -> SENT
- Candidate accepts -> status ACCEPTED
- Candidate declines -> status DECLINED
- Delete draft offer -> removed

## Run Tests

```bash
cd FE-VietRecruit && pnpm test
```
