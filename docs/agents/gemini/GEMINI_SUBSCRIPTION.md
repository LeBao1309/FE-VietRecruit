# GEMINI_SUBSCRIPTION.md -- Subscription & Payment Domain Agent Brief

> Target Agent: Gemini | Domain: Subscription Plans, Payment (PayOS), Billing
> Dependencies: BE_CONTRACT.md

---

## Domain Scope

Subscription plan browsing, checkout via PayOS, payment status tracking, subscription management.

## FE Files to Modify

| File | Purpose |
|------|---------|
| `src/features/plan/services/plan.service.ts` | Plan listing API |
| `src/features/plan/stores/plan.store.ts` | Plan state |
| `src/features/subscription/services/subscription.service.ts` | Subscription API |
| `src/core/stores/subscription.store.ts` | Subscription state |
| `src/features/payment/services/payment.service.ts` | Payment API |
| `src/core/stores/payment.store.ts` | Payment state |
| `src/features/subscription/pages/SubscriptionDashboard.vue` | Subscription management |
| `src/features/payment/pages/PaymentStatusPage.vue` | Payment callback page |

## BE Endpoints

**Plans (public):**
- `GET /vietrecruit/plans` -- List all available plans
- `GET /vietrecruit/plans/{planId}` -- Plan detail

**Subscriptions (COMPANY_ADMIN):**
- `GET /vietrecruit/subscriptions/current` -- Active subscription
- `GET /vietrecruit/subscriptions/current/quota` -- Remaining job posting quota
- `PUT /vietrecruit/subscriptions/current/cancel` -- Cancel subscription

**Payment (COMPANY_ADMIN):**
- `POST /vietrecruit/payment/checkout` -- Create PayOS link (`CheckoutRequest{planId, billingCycle[MONTHLY|YEARLY]}`)
- `GET /vietrecruit/payment/payment-status/{orderCode}` -- Check payment status
- `GET /vietrecruit/payment/transactions` -- My transaction history

## Payment Flow

```
1. User selects plan -> POST /payment/checkout
2. BE creates PayOS link -> returns checkout URL
3. FE redirects to PayOS hosted checkout
4. PayOS redirects back to /payment/status?orderCode=XXX
5. FE calls GET /payment/payment-status/{orderCode}
6. BE verifies with PayOS + activates subscription
7. PayOS also sends webhook to POST /webhooks/payos (BE background)
```

## Error Codes

- `SUBSCRIPTION_REQUIRED` -- No active subscription (trying to publish job)
- `SUBSCRIPTION_EXPIRED` -- Subscription lapsed
- `QUOTA_EXCEEDED` -- Job posting limit reached
- `PAYMENT_CREATION_FAILED` -- PayOS API failure (circuit-breaker protected)
- `PAYMENT_ALREADY_PENDING` -- Prevent duplicate checkouts
- `PAYMENT_EXPIRED` -- Link expired

## Business Rules

- Only COMPANY_ADMIN can manage subscriptions
- Publishing a job deducts from quota
- Closing a job does NOT return quota
- Plans: FREE (0 jobs), PRO (N jobs), ENTERPRISE (unlimited)
- Billing cycles: MONTHLY, YEARLY

## Testing

- Plan listing: display all plans, pricing
- Checkout flow: plan selection -> PayOS redirect -> callback handling
- Subscription display: active plan, quota remaining, expiry date
- Cancellation: confirm dialog, post-cancel state
- Error handling: duplicate payment, expired link
