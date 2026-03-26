# CLAUDE_SUBSCRIPTION.md -- Subscription & Payment Domain Agent Brief

> Target Agent: Claude Code | Domain: Plans, Subscriptions, PayOS Payment
> Protocol: Read this brief -> Read BE_CONTRACT.md Section 7 -> Execute

---

## Mandatory Pre-Read Files

1. `docs/agents/BE_CONTRACT.md` -- Section 7 (Subscription & Payment)
2. `src/features/subscription/services/subscription.service.ts`
3. `src/features/payment/services/payment.service.ts`
4. `src/features/plan/services/plan.service.ts`
5. `src/features/subscription/pages/SubscriptionDashboard.vue`
6. `src/features/payment/pages/PaymentStatusPage.vue`

## Tasks

### Task 1: Verify Complete Payment Flow

Test end-to-end:
1. Plan listing -> all plans render with pricing
2. Select plan -> checkout request sent
3. PayOS redirect -> browser navigates to PayOS
4. Callback -> PaymentStatusPage loads with order code
5. Status check -> subscription activated

### Task 2: Quota Display

Ensure `GET /subscriptions/current/quota` is wired and displayed:
- On subscription dashboard: show remaining/total quota
- On job creation: if quota exceeded, show Vietnamese error

### Task 3: Error Handling

Payment errors must show Vietnamese (depends on CLAUDE_ERROR_I18N.md being done first):
- `SUBSCRIPTION_REQUIRED` -> Subscription needed message
- `QUOTA_EXCEEDED` -> Quota limit message
- `PAYMENT_ALREADY_PENDING` -> Duplicate payment message

## Validation

- View plans -> renders correctly
- Active subscription -> shows details, quota
- Cancel subscription -> confirmation dialog, success
- Payment callback -> status displays correctly

## Run Tests

```bash
cd FE-VietRecruit && pnpm test
```
