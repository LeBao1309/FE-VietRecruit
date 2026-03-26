# GEMINI_ADMIN.md -- Admin Panel Domain Agent Brief

> Target Agent: Gemini | Domain: System Admin, User Management, Transactions, Knowledge
> Dependencies: BE_CONTRACT.md

---

## Domain Scope

Admin panel for SYSTEM_ADMIN and CUSTOMER_SERVICE roles. User management, company oversight, transaction history, AI knowledge document management.

## FE Files to Modify

| File | Purpose |
|------|---------|
| `src/features/admin/services/admin.service.ts` | Admin API calls |
| `src/features/admin/services/knowledge.service.ts` | Knowledge document API |
| `src/features/admin/stores/admin.store.ts` | Admin state |
| `src/features/admin/components/AdminLayout.vue` | Admin layout (CORRECT pattern) |
| `src/features/admin/views/AdminCompanyListPage.vue` | Company management |
| `src/features/admin/views/AdminUserListPage.vue` | User management |
| `src/features/admin/views/AdminTransactionHistoryPage.vue` | Transaction history |

## BE Endpoints

**Admin Users (`/vietrecruit/admin/users`):**
- `POST` -- Create user
- `GET` -- List users (`page, size, role, search`)
- `GET /{id}` -- Get user
- `PUT /{id}` -- Update user
- `DELETE /{id}` -- Delete user

**Admin Transactions (`/vietrecruit/admin/payment/transactions`):**
- `GET` -- All transactions (`page, size, status, search`)

**Admin Knowledge (`/vietrecruit/admin/knowledge`):**
- `POST` -- Upload knowledge document (multipart PDF)
- `GET` -- List knowledge documents
- `DELETE /{documentId}` -- Delete knowledge document

**Company Search (public):**
- `GET /vietrecruit/companies/search` -- Search companies for admin view

## Route Structure

Admin routes are correctly nested under `AdminLayout`:
```typescript
{ path: '/admin', component: AdminLayout, children: [
  { path: 'companies', ... },
  { path: 'users', ... },
  { path: 'transactions', meta: { permissions: ['TRANSACTION:VIEW_ALL'] } },
]}
```

## Permissions Issue

`AdminTransactions` route has `permissions: ['TRANSACTION:VIEW_ALL']` in meta. The BE JWT does NOT include `permissions` claim. The router guard (lines 44-63) checks for permissions that never exist, making this route inaccessible.

**Fix:** Either:
1. Remove `permissions` meta and rely on `allowedRoles: ['SYSTEM_ADMIN']` only
2. Wait for BE to add permissions to JWT

Recommended: Option 1 (simpler, permissions are already role-gated on BE).

## Knowledge Management

Admin can upload PDF documents to the AI knowledge base. These are ingested via Kafka, parsed by Apache Tika, chunked, and stored in pgvector for RAG queries.

The `knowledge.service.ts` file exists. Verify it connects to:
- `POST /vietrecruit/admin/knowledge` (multipart upload)
- `GET /vietrecruit/admin/knowledge` (list)
- `DELETE /vietrecruit/admin/knowledge/{documentId}`

## Testing

- Admin layout: sidebar navigation, role-based visibility
- User CRUD: create, list, update, delete
- Transaction list: pagination, status filter
- Knowledge: upload PDF, list, delete
