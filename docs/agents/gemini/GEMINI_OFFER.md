# GEMINI_OFFER.md -- Offer Domain Agent Brief

> Target Agent: Gemini | Domain: Offer Management, Candidate Response
> Dependencies: BE_CONTRACT.md, FE_AUDIT.md

---

## Domain Scope

Offer creation, sending to candidates, candidate acceptance/decline, offer lifecycle.

## FE Files to Modify

| File | Purpose |
|------|---------|
| `src/features/offer/services/offer.service.ts` | Offer API calls |
| `src/features/offer/services/application.service.ts` | Application context (DUPLICATE) |
| `src/features/offer/stores/offer.store.ts` | Offer state |
| `src/features/offer/views/OfferDashboardView.vue` | Offer list |
| `src/features/offer/views/OfferCreateView.vue` | Offer creation form |
| `src/core/constants/enums.ts` | OFFER_STATUS enum |

## BE Endpoints

- `POST /vietrecruit/applications/{id}/offers` -- Create offer (`CreateOfferRequest{salary, startDate, expiresAt, notes}`)
- `GET /vietrecruit/applications/{id}/offers` -- List offers per application
- `GET /vietrecruit/offers/{id}` -- Offer detail
- `PUT /vietrecruit/offers/{id}/send` -- Send to candidate (status DRAFT -> SENT)
- `PUT /vietrecruit/offers/{id}/respond` -- Candidate response (`RespondOfferRequest{accepted}`)
- `DELETE /vietrecruit/offers/{id}` -- Delete draft offer

## Status Transitions

```
DRAFT -> SENT -> ACCEPTED
              -> DECLINED
```

## Enum Bug

FE `OFFER_STATUS` has phantom `EXPIRED` value. Remove:
```typescript
export const OFFER_STATUS = {
  DRAFT:    'DRAFT',
  SENT:     'SENT',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  // EXPIRED: 'EXPIRED',  // REMOVE (not in BE)
} as const
```

## Duplicate Service

`src/features/offer/services/application.service.ts` duplicates `src/features/pipeline/services/application.service.ts`. Consolidate: offer module should import from pipeline or a shared location.

## Business Rules

- Application must be in `OFFER` status before creating an offer (`OFFER_APPLICATION_NOT_READY`)
- Only one active offer per application (`OFFER_ALREADY_EXISTS`)
- Only draft offers can be deleted
- Only sent offers can be responded to

## Missing FE Feature

No candidate-side offer response UI. The candidate views their application detail but there's no explicit "Accept/Decline Offer" button wired to `PUT /offers/{id}/respond`.

**Agent Task:** Add offer response UI to `ApplicationDetailPage.vue` or create a dedicated offer response component visible when application status is OFFER and an offer exists with status SENT.

## Testing

- Offer store: create, send, respond, delete lifecycle
- Validation: salary required, start date in future
- Candidate response: accept/decline flow
