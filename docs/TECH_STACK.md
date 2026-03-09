# Technology Stack & Rationale — VietRecruit ATS

> [!CAUTION]
> **AI GENERATION RULE:** Whenever an AI agent reads this file, it MUST strictly adhere to the syntax of the exact versions listed in the [Pinned Version Matrix](#pinned-version-matrix) below. Do **not** use deprecated methods, removed APIs, or future syntaxes not supported by these versions. Pay special attention to:
>
> - **Zod v4.3.6** — v4 has breaking API changes from v3 (e.g., `.required_error` is gone; use `.min(1, 'msg')` pattern). Do NOT use v3 syntax.
> - **TresJS v5.5.0** — component API differs from v4. Always validate against the v5 docs.
> - **Pinia v3.0.4** — Pinia v3 is the Vue 3 Composition API-native version.
> - **Vite v7.3.1** — config API may differ from v4/v5 references found in older tutorials.

> Every technology in this project was chosen deliberately.
> This document explains the _why_ — not just the _what_.

---

## Core Framework

### Vue 3 with Composition API

**Exact Version:** `^3.5.25`

**Why Vue 3 instead of Vue 2 / React:**

| Criterion              | Vue 2   | React 18                | Vue 3 ✅  |
| ---------------------- | ------- | ----------------------- | --------- |
| TypeScript support     | Limited | Good                    | Excellent |
| Bundle size            | ~90KB   | ~45KB                   | ~34KB     |
| Composition API        | ❌      | Hooks (similar concept) | ✅ Native |
| `<script setup>` sugar | ❌      | ❌                      | ✅        |
| Learning curve         | Low     | Medium                  | Low       |

**Mandatory pattern — `<script setup lang="ts">`:**

```vue
<script setup lang="ts">
// No need for: defineComponent, return statement, or `this`
// TypeScript is inferred automatically from defineProps/defineEmits

interface Props {
  userId: string;
  isActive: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update", value: string): void;
  (e: "close"): void;
}>();
</script>
```

---

### Vite

**Exact Version:** `^7.3.1`

**Why Vite instead of Webpack / CRA:**

- **Dev server cold start:** Webpack ~15–30s → Vite ~300ms (50–100× faster)
- **HMR (Hot Module Replacement):** Vite only re-transforms the changed module, not the entire dependency graph
- **Production build:** Uses Rollup, which provides superior tree-shaking for library code
- **Native ESM:** The browser loads modules directly in dev mode with no bundling step required

---

## Styling

### Tailwind CSS v3.4 (Version Pinned)

**Version:** `^3.4.x` — **Do NOT upgrade to v4 without a migration plan**

**Why is v3.4 pinned?**

Tailwind v4 (currently in beta) introduces a completely new configuration API that is not backward-compatible. Shadcn-vue currently supports only Tailwind v3. Upgrading requires a dedicated migration plan.

**JIT (Just-in-Time) compilation — default in v3:**

All utility classes are generated on-demand. Result:

- Dev bundle: contains only the classes currently in use
- Production bundle: ~5–15KB of CSS instead of ~3MB for the full stylesheet

---

## 3D Graphics

### TresJS / Three.js

**Exact Packages:** `@tresjs/core@^5.5.0`, `@tresjs/cientos@^5.4.0`, `three@^0.183.1`

**What is TresJS?**

TresJS is a Vue 3 wrapper around Three.js — it allows you to declare a 3D scene
using Vue component syntax instead of imperative JavaScript:

```vue
<!-- With plain Three.js -->
<!-- JS: scene.add(mesh), renderer.render(scene, camera)... 30+ lines of setup -->

<!-- With TresJS -->
<TresCanvas>
  <TresPerspectiveCamera :position="[0, 2, 5]" />
  <TresMesh>
    <TresTorusKnotGeometry :args="[1, 0.3, 200, 32]" />
    <TresMeshStandardMaterial color="#008C8C" />
  </TresMesh>
  <TresAmbientLight :intensity="0.5" />
</TresCanvas>
```

**Why not use CSS animations for the hero visual?**

CSS animations run on the CPU. GPU-accelerated 3D via WebGL enables:

- Smooth 60fps animation even on mid-range laptops
- Complex lighting, reflection, and distortion effects
- Particle systems (Stars) with thousands of points without dropping frames

**Performance note:** The TresJS canvas is lazy-loaded via `defineAsyncComponent`,
so it never blocks First Contentful Paint.

---

## Validation

### Zod

**Exact Version:** `^4.3.6` — ⚠️ **This project uses Zod v4, NOT v3.** Syntax differs significantly from v3. See the [AI Generation Rule](#) at the top of this file.

**The problem Zod solves:**

TypeScript only validates at **compile time**. When the app receives data from an API
at runtime, TypeScript has no way to verify that the data actually matches its declared shape.

```typescript
// TypeScript trusts you — no runtime check
const user = response.data as User; // Dangerous: the backend could return null

// Zod validates at RUNTIME — throws immediately if the shape is wrong
const user = UserSchema.parse(response.data); // 100% safe
```

**Mandatory pattern — infer types from schemas:**

```typescript
// ✅ Single source of truth: the schema IS the type definition
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "recruiter", "viewer"]),
});

export type User = z.infer<typeof UserSchema>; // Type is auto-generated
// Do NOT write a manual interface User { ... } — it will drift out of sync with the schema
```

---

## State Management

### Pinia

**Exact Version:** `^3.0.4`

**Why Pinia instead of Vuex 4?**

Vuex 4 is maintained for compatibility only. Vuex 5 was cancelled, and the Vue core
team officially recommends Pinia for all new Vue 3 projects.

| Criterion       | Vuex 4                  | Pinia ✅                           |
| --------------- | ----------------------- | ---------------------------------- |
| TypeScript      | Requires manual casting | Native, zero boilerplate           |
| Vue DevTools    | ✅                      | ✅ (improved)                      |
| Mutations       | Required                | Not needed — call actions directly |
| Bundle size     | ~10KB                   | ~1.5KB                             |
| Composition API | Awkward                 | Native                             |

```typescript
// Pinia store — clean, type-safe, no boilerplate
export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const isAuthenticated = computed(() => user.value !== null);

  async function login(credentials: LoginRequest) {
    const response = await authApi.login(credentials);
    user.value = response.user;
  }

  return { user, isAuthenticated, login };
});
```

---

## HTTP Client

### Axios

**Exact Version:** `^1.13.5`

**Why Axios instead of native `fetch`?**

| Criterion            | fetch                   | Axios ✅               |
| -------------------- | ----------------------- | ---------------------- |
| Interceptors         | Manual wrapper required | Built-in               |
| Auto JSON parsing    | Manual                  | Automatic              |
| Request cancellation | AbortController         | Built-in               |
| Error handling       | 4xx/5xx do NOT throw    | Throws for all non-2xx |
| TypeScript generics  | Limited                 | `axios.get<T>()`       |

**Dual-Token Refresh Flow:**

```
Request → [Request Interceptor] → attach Bearer token → Server
                                                             │
Response ←────────────────────────────────────────────────────
    │
    ├── 200 OK → return data normally
    │
    └── 401 Unauthorized
            │
            ├── Is this the refresh token request itself? → Logout + redirect /login
            │
            └── Call POST /auth/refresh with the stored refreshToken
                    │
                    ├── 200 OK → save new accessToken → RETRY the original request
                    └── 401   → Logout + redirect /login
```

---

## Typography

### Be Vietnam Pro via @fontsource

**Package:** `@fontsource/be-vietnam-pro`

**Why Be Vietnam Pro?**

- Designed specifically for Vietnamese with full coverage of all tone marks and diacritical combinations (ổ, ụ, ề, ạ, ữ...)
- Modern, professional aesthetic suitable for enterprise SaaS UI
- Self-hosted via `@fontsource` to avoid three critical issues:
  1. **CLS (Cumulative Layout Shift):** CDN font loads late, causing layout jumps that hurt Lighthouse scores
  2. **FOUT (Flash of Unstyled Text):** Google Fonts loads asynchronously, causing visible font flicker
  3. **Privacy & GDPR:** Every request to Google Fonts transmits the user's IP address

**Import strategy (weight-only imports):**

```typescript
// Each weight is imported individually — NOT index.css (which loads all weights = 500KB+)
import "@fontsource/be-vietnam-pro/400.css"; // Regular — body text
import "@fontsource/be-vietnam-pro/500.css"; // Medium — labels, buttons
import "@fontsource/be-vietnam-pro/600.css"; // SemiBold — subheadings
import "@fontsource/be-vietnam-pro/700.css"; // Bold — headings
import "@fontsource/be-vietnam-pro/800.css"; // ExtraBold — hero display
```

Importing only required weights reduces font payload by **60–70%** versus loading all variants.

---

## Dependency Pinning Strategy

> [!IMPORTANT]
> **AI RULE:** All versions in this project are **exact-pinned** (no `^` or `~` in `package.json`). When writing code, referencing docs, or suggesting package installs, you MUST use the exact version numbers listed in the [Pinned Version Matrix](#pinned-version-matrix) below. Do NOT suggest upgrading any package unless the developer explicitly requests it.

### Why Exact Pinning?

This project pins **all dependency versions exactly** (e.g., `"vue": "3.5.25"` instead of `"^3.5.25"`).
Here is why:

| Problem with `^` ranges                                                                                                                | How exact pinning solves it                                           |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| A minor/patch release can introduce breaking changes (Tailwind v3→v3.5 changed JIT defaults)                                           | `pnpm install` always installs exactly what is listed — zero drift    |
| CI/CD builds on Vercel do a fresh `pnpm install`. A package author pushing a bad patch at the wrong moment breaks the production build | The lockfile AND `package.json` both agree — two layers of protection |
| AI models trained on older docs may suggest incorrect syntax for a newer auto-installed version                                        | Exact versions in this doc anchor the AI to the correct API reference |
| A teammate running `pnpm install` on a new machine gets the exact same tree as everyone else                                           | Reproducible installs across all environments (local, CI, Vercel)     |

### Real incident that triggered this policy

On 2026-03-09, the Vercel build failed with:

```
sh: line 1: run-p: command not found
ELIFECYCLE  Command failed.
```

**Root cause:** `npm-run-all2` (which provides the `run-p` command used in the `build` script) was missing from `devDependencies`. Vercel's clean install did not have it. The package was added, and exact pinning was adopted to prevent similar silent regressions.

### `packageManager` field

`package.json` now declares:

```json
"packageManager": "pnpm@10.28.0"
```

This eliminates the Vercel warning:

> _"Using package.json#engines.pnpm without corepack and package.json#packageManager could lead to failed builds"_

It also ensures all teammates and CI environments use the identical pnpm major version.

### How to upgrade a dependency

1. Check the package's **changelog** for breaking changes.
2. Update the **exact version** in `package.json`.
3. Re-run `pnpm install` to regenerate the lockfile.
4. Update the **Exact Version** and **Critical Notes** columns in the [Pinned Version Matrix](#pinned-version-matrix) below.
5. Update the **Last Updated** date in the matrix header.
6. If the API changed, update any code examples in this file and the relevant `docs/` files.
7. Run `pnpm run build` and `pnpm test` locally before pushing.

---

## Pinned Version Matrix

> [!IMPORTANT]
> The **Exact Version** column reflects the version declared in `package.json` as of the last update to this document (2026-03-09). AI agents and developers **MUST** reference only these versions when generating or reviewing code. All versions are exact-pinned — no `^` or `~` — see the [Dependency Pinning Strategy](#dependency-pinning-strategy) section above.

| Package                      | Exact Version | Environment | Purpose                       | Critical Notes                                                   |
| ---------------------------- | ------------- | ----------- | ----------------------------- | ---------------------------------------------------------------- |
| `vue`                        | **3.5.25**    | prod        | Core framework                | Use Composition API + `<script setup lang="ts">` only            |
| `vite`                       | **7.3.1**     | dev         | Build tool & dev server       | Config API changed from v4/v5 — check v7 docs                    |
| `@vitejs/plugin-vue`         | **6.0.2**     | dev         | Vue SFC support for Vite      |                                                                  |
| `tailwindcss`                | **3.4.19**    | dev         | Utility-first CSS             | ⚠️ v3 only — do NOT use v4 config syntax                         |
| `pinia`                      | **3.0.4**     | prod        | State management              | Use Composition Store pattern (`defineStore('id', ()=>`)         |
| `vue-router`                 | **5.0.3**     | prod        | Client-side routing           |                                                                  |
| `axios`                      | **1.13.5**    | prod        | HTTP client                   | Always use typed generics: `axios.get<T>()`                      |
| `zod`                        | **4.3.6**     | prod        | Runtime schema validation     | ⚠️ **v4 syntax** — `.required_error` removed; use `.min(1, msg)` |
| `@tresjs/core`               | **5.5.0**     | prod        | Vue 3D component wrapper      | ⚠️ v5 API differs from v4 — check TresJS v5 docs                 |
| `@tresjs/cientos`            | **5.4.0**     | prod        | TresJS helper components      | Must match `@tresjs/core` major version                          |
| `three`                      | **0.183.1**   | prod        | WebGL rendering engine        |                                                                  |
| `@types/three`               | **0.183.1**   | dev         | Three.js TypeScript types     | Must match `three` version exactly                               |
| `lucide-vue-next`            | **0.575.0**   | prod        | Icon library                  |                                                                  |
| `@fontsource/be-vietnam-pro` | **5.2.8**     | prod        | Self-hosted Vietnamese font   | Import weight-specific CSS files only                            |
| `@vueuse/core`               | **14.2.1**    | prod        | Vue composable utilities      |                                                                  |
| `dompurify`                  | **3.3.2**     | prod        | HTML sanitation               | Always use with `v-html` to prevent XSS                          |
| `vue-draggable-plus`         | **0.6.1**     | prod        | Drag & Drop library           | Used for Kanban board                                            |
| `clsx`                       | **2.1.1**     | prod        | Class name utility            | Combines conditional class strings                               |
| `tailwind-merge`             | **3.5.0**     | prod        | Tailwind class merge helper   | Prevents conflicting Tailwind utility classes                    |
| `npm-run-all2`               | **8.0.4**     | dev         | Parallel/serial script runner | Provides `run-p` used in `build` script — **MUST be present**    |
| `typescript`                 | **5.9.3**     | dev         | Type checking                 |                                                                  |
| `vitest`                     | **4.0.18**    | dev         | Test runner                   | Vite-native testing environment                                  |
| `@vitest/coverage-v8`        | **4.0.18**    | dev         | Code coverage                 | Always keep in sync with `vitest` version                        |
| `@vue/test-utils`            | **2.4.6**     | dev         | Component testing             |                                                                  |
| `jsdom`                      | **28.1.0**    | dev         | DOM simulation                | Headless DOM for test mounting                                   |
| `vue-tsc`                    | **3.1.5**     | dev         | Vue TypeScript compiler       |                                                                  |
| `postcss`                    | **8.5.6**     | dev         | CSS post-processing           |                                                                  |
| `autoprefixer`               | **10.4.27**   | dev         | CSS vendor prefix automation  |                                                                  |

---

## 2. Security & Network Layer

This section documents the technical rationale for the technologies used in the
authentication module (`features/auth` and `core/api`).

---

### 2.1 Axios Interceptors — Centralized Token Handling

**Problem:**

Without Interceptors, every component and service would need to individually attach
Bearer tokens, catch 401 errors, and trigger token refresh logic. This is the root
cause of duplicated code and Race Conditions.

**Solution — Two global Interceptors:**

| Interceptor              | Responsibility                                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Request Interceptor**  | Automatically attaches `Authorization: Bearer {accessToken}` to every outgoing request. Components have zero awareness of tokens.                                                    |
| **Response Interceptor** | Catches `401 Unauthorized`, automatically calls `POST /auth/refresh` to obtain new tokens, then retries the original request (Silent Refresh). The user experiences no interruption. |

**Race Condition prevention:**

The Interceptor uses a `_retry: boolean` flag to guarantee that each request
attempts token refresh **at most once**. If the retried request receives another
401, the system concludes the Refresh Token has expired and forces a logout.

```typescript
// src/core/api/axios.instance.ts
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean; // Guard flag — prevents infinite retry loop
}

// If the failing request IS the /auth/refresh endpoint → session fully expired
if (originalRequest.url?.includes("/auth/refresh")) {
  tokenService.clearAll();
  window.location.href = "/login";
}
```

**Why is the `/auth/refresh` call made with plain `axios` instead of `apiClient`?**

Using `apiClient` (which has the Interceptor attached) to call `/auth/refresh`
creates an infinite recursive loop if the refresh request itself returns 401.
Using a plain `axios.post()` call (without any Interceptor) breaks this cycle.

---

### 2.2 Zod — Runtime Type-Checking for JWT Payloads

**Problem:**

TypeScript only validates at _compile time_. When the backend silently changes
its response shape without updating the API contract, the application receives
incorrectly-typed data at _runtime_ — TypeScript cannot detect this.

The danger without Zod:

```typescript
// Suppose the backend renames "accessToken" → "access_token"
// TypeScript raises no error — but the app silently breaks
const { accessToken } = response.data as LoginResponse
tokenService.setTokens(accessToken, ...) // accessToken = undefined!
```

**Solution in the Auth Module:**

Zod is used to:

1. **Define schemas** as the single source of truth for all auth DTOs.
2. **Infer TypeScript types** automatically — no manual `interface` declarations
   (eliminates the risk of schemas and types drifting out of sync).
3. **Validate at runtime** — if the backend changes a response shape, Zod throws
   immediately with a clear, actionable error rather than allowing the bug to silently
   propagate to the UI.

```typescript
// src/features/auth/types/auth.dto.ts

// The schema IS the single source of truth
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  tokenType: z.string().default("Bearer"),
});

// Type is INFERRED automatically — no manual interface needed
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
```

**Mandatory rule:** Any time the backend changes an OpenAPI response schema,
`auth.dto.ts` **must be updated immediately**. See the _Troubleshooting_ section
in `README.md` for the step-by-step remediation procedure.

---

### 2.3 Pinia — Centralized Auth Store

**Problem:**

Auth state (`isAuthenticated`, `isLoading`, `error`, `pendingVerificationEmail`)
must be shared across multiple components: `LoginPage`, `RegisterPage`,
`VerifyOtpPage`, the Navigation Guard, and `AppHeader`. Passing this state through
`props/emits` (prop-drilling) across multiple component layers is impractical and
produces unmaintainable code.

**Solution — `useAuthStore` (Pinia Composition Store):**

```typescript
// src/core/stores/auth.store.ts
export const useAuthStore = defineStore("auth", () => {
  // Session state
  const isAuthenticated = ref<boolean>(tokenService.hasSession());
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Passes the email from RegisterPage → VerifyOtpPage
  // without requiring query params or props
  const pendingVerificationEmail = ref<string | null>(null);

  // ...actions: login, register, verifyOtp, logout, forgotPassword
});
```

**Why not `provide/inject` or `props`?**

| Criterion                  | `provide/inject` | `props/emits` | **Pinia Store ✅**              |
| -------------------------- | ---------------- | ------------- | ------------------------------- |
| Sharing scope              | Component tree   | Parent-child  | Entire application              |
| Reactive                   | ✅               | ✅            | ✅                              |
| Vue DevTools               | ❌               | ❌            | ✅ (timeline + state inspector) |
| Testability                | Difficult        | Medium        | Easy (mockable store)           |
| Usable in Navigation Guard | ❌               | ❌            | ✅                              |

The Navigation Guard in `core/router/index.ts` calls `tokenService.hasSession()`
directly (not through Pinia) because the Guard runs before the Vue app is mounted,
at which point Pinia is not yet initialized.
