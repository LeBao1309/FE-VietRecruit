# System Architecture — VietRecruit ATS Frontend

> **Document version:** 1.0.0  
> **Last updated:** 2025  
> **Audience:** Frontend Developer, Tech Lead, Code Reviewer

---

## 1. Architectural Philosophy: Feature-Driven Development (FDD)

### The Problem with Layer-Driven Architecture (the old way)

Many projects organize code by _file type_:

```
src/
├── components/    ← all components, every feature mixed together
├── services/      ← all API calls
├── stores/        ← all state
└── types/         ← all TypeScript types
```

**Consequence:** When the "Kanban Pipeline" feature needs a change, the developer
must jump between 4 separate directories. When onboarding a new hire, they cannot
tell which files belong together.

### The Solution: Feature-Driven Architecture

VietRecruit ATS organizes code by _business domain_:

```
src/
├── features/
│   ├── landing/       ← EVERYTHING related to the Landing Page
│   ├── auth/          ← EVERYTHING related to Authentication
│   ├── workspace/     ← EVERYTHING related to the main Dashboard
│   └── kanban/        ← EVERYTHING related to the Pipeline Kanban board
├── components/ui/     ← ONLY: Shadcn-vue primitives (Button, Input...)
├── core/              ← ONLY: Infrastructure (API, Router, global Stores)
└── types/             ← ONLY: Shared types (NOT feature-specific DTOs)
```

**Measurable benefits:**

- Deleting a feature = deleting one directory. Zero orphaned code.
- A new developer understands the scope of their task just by reading the folder name.
- Straightforward route-level code splitting → improved bundle size.

---

## 2. Full Directory Tree

```
src/
│
├── assets/
│   ├── css/
│   │   └── main.css                    # Tailwind directives + global base styles
│   ├── fonts/                          # Self-hosted fonts
│   └── img/                            # Static images and SVGs
│
├── components/
│   ├── layouts/                        # Base layouts (Admin, Auth)
│   └── ui/                             # Shadcn-vue PRIMITIVES ONLY
│
├── core/
│   ├── api/                            # Axios instance + Token handling
│   ├── composables/                    # Global core composables
│   ├── router/                         # Route configuration and Navigation Guards
│   ├── stores/                         # Global Pinia stores (Auth, etc)
│   └── utils/                          # Shared JS utilities
│
├── features/                           # FEATURE-DRIVEN DOMAINS
│   ├── auth/                           # Authentication logic, Types, Modals, Views
│   ├── kanban/                         # Secondary Kanban components
│   ├── landing/                        # Public Marketing / Landing pages
│   └── workspace/                      # Primary ATS Dashboard & Kanban Boards
│
├── test/
│   ├── helpers.ts                      # Test utility helpers
│   └── setup.ts                        # Vitest initialization bounds
│
├── App.vue
└── main.ts
```

---

## 3. Inviolable Rules (Strict Boundaries)

### Rule 1: Cross-Feature Imports Are Forbidden

```typescript
// ❌ WRONG — features/kanban imports from features/auth
// src/features/kanban/components/KanbanBoard.vue
import { useAuthStore } from "@/features/auth/stores/auth.store";

// ✅ CORRECT — import from core (shared infrastructure)
import { useAuthStore } from "@/core/stores/auth.store";
```

**Principle:** If two features share a piece of logic, that logic belongs in `core/` or `types/`.

### Rule 2: Zod DTOs Are Mandatory for All API Payloads

```typescript
// ❌ WRONG — inline type cast cannot validate at runtime
const response = (await api.post("/auth/login", body)) as { token: string };

// ✅ CORRECT — parse and validate with a Zod schema
import { LoginResponseSchema } from "@/features/auth/types/auth.dto";

const raw = await api.post("/auth/login", body);
const validated = LoginResponseSchema.parse(raw.data);
// `validated` is now correctly inferred by TypeScript from the schema
```

**Rationale:** The backend can silently change its response shape without notice.
Zod's `.parse()` throws immediately at runtime with a clear error message, rather
than letting a bug silently propagate until a user sees broken UI.

### Rule 3: Relative Parent Imports Are Forbidden

```typescript
// ❌ WRONG
import { Button } from "../../../components/ui/Button.vue";

// ✅ CORRECT — always use the @/ path alias
import { Button } from "@/components/ui/Button.vue";
```

Configure the alias in `vite.config.ts`:

```typescript
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

### Rule 4: The `any` Type Is Forbidden

```typescript
// ❌ WRONG
function handleError(err: any) {
  console.log(err.message);
}

// ✅ CORRECT
function handleError(err: unknown) {
  if (err instanceof Error) console.log(err.message);
}
```

Enforced via ESLint rule: `"@typescript-eslint/no-explicit-any": "error"`

---

## 4. Data Flow & State Management

```
Component (UI layer)
    │
    ├── reads state   → Pinia Store (core/stores/)
    ├── calls action  → Pinia Store Action
    │                       │
    │                       └── calls API → Axios Instance (core/api/)
    │                                           │
    │                                           ├── Request Interceptor: inject Bearer token
    │                                           └── Response Interceptor: handle 401, refresh token
    │
    └── props/emits   → Parent ↔ Child component communication
```

**Rules:**

- Components **must not** call `axios` directly. All HTTP calls go through Pinia actions.
- When a feature's logic is complex, wrap the Pinia store calls inside a composable (`useXxx.ts`) rather than importing the store directly into `<script setup>`.
