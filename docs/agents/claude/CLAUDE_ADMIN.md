# CLAUDE_ADMIN.md -- Admin Panel Domain Agent Brief

> Target Agent: Claude Code | Domain: Admin User Management, Transactions, Knowledge
> Protocol: Read this brief -> Read BE_CONTRACT.md Section 2, 7, 10 -> Execute

---

## Mandatory Pre-Read Files

1. `docs/agents/BE_CONTRACT.md` -- Section 2 (Admin Users), Section 7 (Admin Transactions), Section 10 (Knowledge)
2. `src/features/admin/services/admin.service.ts`
3. `src/features/admin/services/knowledge.service.ts`
4. `src/features/admin/views/AdminTransactionHistoryPage.vue`

## Tasks

### Task 1: Fix Admin Transactions Route Permission

In `src/core/router/routes.ts`, the admin transactions route has:
```typescript
meta: { permissions: ['TRANSACTION:VIEW_ALL'] }
```

This permissions check always fails because JWT never includes permissions. Fix: remove `permissions` meta and rely on parent `allowedRoles: ['SYSTEM_ADMIN', 'CUSTOMER_SERVICE']`.

Alternatively, restrict to SYSTEM_ADMIN only:
```typescript
meta: { allowedRoles: ['SYSTEM_ADMIN'] }
```

### Task 2: Verify Knowledge Management

Ensure `knowledge.service.ts` connects to:
- `POST /vietrecruit/admin/knowledge` (multipart PDF upload)
- `GET /vietrecruit/admin/knowledge` (list documents)
- `DELETE /vietrecruit/admin/knowledge/{documentId}`

If no UI exists for knowledge management in admin views, note it as a gap but do not create UI unless instructed.

### Task 3: Verify Admin User CRUD

Ensure `admin.service.ts` covers all admin user endpoints. Test list, create, update, delete flows.

## Validation

- Admin dashboard: loads without errors
- User list: pagination, role filter, search work
- Transaction list: accessible by SYSTEM_ADMIN (no permission check failure)
- Knowledge: upload/list/delete work

## Run Tests

```bash
cd FE-VietRecruit && pnpm test
```
