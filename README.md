<div align="center">
  <img src="src/assets/img/logo.svg" alt="VietRecruit ATS" height="48" />
  <h1>VietRecruit ATS — Frontend</h1>
  <p>Enterprise ATS platform for Vietnamese businesses</p>

![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-Proprietary-red)

</div>

---

## System Requirements

| Tool        | Minimum version | Notes                                    |
| ----------- | --------------- | ---------------------------------------- |
| **Node.js** | `>= 20.x`       | Check with: `node --version`             |
| **pnpm**    | `>= 9.x`        | See installation guide below             |
| **Git**     | `>= 2.x`        | —                                        |
| **VS Code** | Latest          | Extensions: Volar, TypeScript Vue Plugin |

> ⚠️ **IMPORTANT:** This project uses **`pnpm` exclusively**. Using `npm` or `yarn`
> will cause `node_modules` conflicts and incompatible lockfiles.
> Any `package-lock.json` or `yarn.lock` files are git-ignored and will be deleted.

### Installing pnpm (if not already installed)

```bash
# Option 1: via npm (one-time setup)
npm install -g pnpm

# Option 2: via Corepack (built into Node 20+, recommended)
corepack enable
corepack prepare pnpm@latest --activate

# Verify
pnpm --version  # must be >= 9.x
```

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/vietrecruit/ats-frontend.git
cd ats-frontend

# 2. Install dependencies (use pnpm — not npm or yarn)
pnpm install

# 3. Create your local environment file from the template
cp .env.example .env.local
# Open .env.local and fill in the required values

# 4. Start the development server
pnpm dev
# → http://localhost:5173

# 5. Build for production
pnpm build

# 6. Preview the production build locally
pnpm preview
```

---

## Environment Variables

Create a `.env.local` file (DO NOT commit this file to git):

```env
# API
VITE_API_BASE_URL=http://localhost:8080/api/v1

# App
VITE_APP_NAME=VietRecruit ATS
VITE_APP_ENV=development   # development | staging | production
```

> All `VITE_` prefixed variables are exposed to the browser bundle.
> **Never store** secret keys, database credentials, or private tokens here.

---

## Scripts

| Command           | Description                             |
| ----------------- | --------------------------------------- |
| `pnpm dev`        | Start dev server at `localhost:5173`    |
| `pnpm build`      | Build for production into `dist/`       |
| `pnpm preview`    | Preview the production build locally    |
| `pnpm type-check` | Run TypeScript compiler check (no emit) |
| `pnpm lint`       | Run ESLint across all of `src/`         |
| `pnpm lint:fix`   | Run ESLint with auto-fix                |

---

## Required VS Code Extensions

Install from the Extensions panel (`Ctrl+Shift+X`):

| Extension                     | ID                          | Purpose                                    |
| ----------------------------- | --------------------------- | ------------------------------------------ |
| **Vue - Official (Volar)**    | `Vue.volar`                 | Vue 3 SFC support + TypeScript integration |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Class name autocomplete                    |
| **ESLint**                    | `dbaeumer.vscode-eslint`    | Real-time linting feedback                 |
| **Error Lens**                | `usernamehw.errorlens`      | Displays errors inline in the editor       |

> ⚠️ If you have **Vetur** installed (the Vue 2 extension), **disable or uninstall it**
> immediately. Vetur conflicts with Volar on Vue 3 projects and produces false TypeScript errors.

---

## Troubleshooting

### 🔴 Error 1: PowerShell — "running scripts is disabled on this system"

**OS:** Windows  
**Symptom:**

```
pnpm : File C:\...\pnpm.ps1 cannot be loaded because running scripts
is disabled on this system.
```

**Cause:** Windows blocks PowerShell scripts from unrecognized sources by default,
which includes pnpm's own scripts.

**Fix:**

```powershell
# Open PowerShell as ADMIN (right-click → "Run as Administrator")
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Confirm by typing Y and pressing Enter
# Verify the fix
pnpm --version
```

> **Explanation:** `RemoteSigned` allows local scripts to run freely while still
> requiring scripts downloaded from the internet to be digitally signed.
> This is the appropriate security level for a development environment.

---

### 🔴 Error 2: "EBUSY: resource busy or locked, rename pnpm-lock.yaml"

**OS:** Windows  
**Symptom:**

```
ERR_PNPM_EBUSY  EBUSY: resource busy or locked,
rename 'C:\...\pnpm-lock.yaml' -> 'C:\...\pnpm-lock.yaml.__deprecated'
```

**Cause:** VS Code or a rogue Node.js process is holding a file lock on
`pnpm-lock.yaml` or the `node_modules` directory.

**Fix:**

```powershell
# Step 1: Fully close VS Code (use Ctrl+Shift+P → "Close Folder" first)

# Step 2: Kill all running Node.js processes
taskkill /F /IM node.exe

# Step 3: (If still failing) Kill VS Code's server process as well
taskkill /F /IM Code.exe

# Step 4: Retry
pnpm install
```

> **Prevention:** Always press `Ctrl+C` to stop `pnpm dev` before running
> `pnpm install` or closing the terminal.

---

### 🔴 Error 3: TresJS — "Cannot find module '@tresjs/core' (TS2307)"

**OS:** All platforms  
**Symptom:**

```
Cannot find module '@tresjs/core' or its corresponding type declarations. ts(2307)
```

**Cause:** VS Code's TypeScript Language Server is using a stale cache and
has not yet recognized the newly installed package in `node_modules`.

**Fix (try in order):**

```
Option 1 — Fastest (resolves 90% of cases):
  Ctrl+Shift+P → type "TypeScript: Restart TS Server" → Enter

Option 2 — If Option 1 is not enough:
  Ctrl+Shift+P → type "Developer: Reload Window" → Enter

Option 3 — If still failing (confirm the package is actually installed):
```

```bash
# Check if the package exists in node_modules
ls node_modules/@tresjs/

# If missing — reinstall
pnpm add @tresjs/core @tresjs/cientos three
pnpm add -D @types/three

# Then go back to Option 1
```

> **Important note:** A TS2307 error in VS Code does **not** mean the build will fail.
> This is a Language Server error, not a compiler error.
> Run `pnpm type-check` to see actual TypeScript compiler errors.

---

## Project Structure (Summary)

```
.
├── docs/
│   ├── ARCHITECTURE.md
│   └── TECH_STACK.md
├── src/
│   ├── assets/
│   ├── components/ui/
│   ├── core/
│   │   ├── api/
│   │   ├── router/
│   │   └── stores/
│   └── features/
│       ├── landing/
│       └── auth/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── pnpm-lock.yaml       # COMMIT this file — ensures reproducible builds
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

> See `docs/ARCHITECTURE.md` for detailed rules on code organization.
> See `docs/TECH_STACK.md` for detailed rationale on all technology choices.

---

## Contact & Support

| Channel      | Address                 |
| ------------ | ----------------------- |
| Tech Lead    | @your-tech-lead (Slack) |
| Bug reports  | GitHub Issues           |
| Design specs | Figma (internal link)   |

---

## Troubleshooting — Authentication

### 🔴 Error Auth-1: Infinite 401 Loop

**Symptom:**

The user cannot complete any API request. The Network tab in DevTools shows a
continuous stream of requests to `POST /vietrecruit/auth/refresh`, each one
receiving a `401 Unauthorized` response.

**Cause:**

The Refresh Token has expired or been invalidated server-side (e.g. the backend
rotated its JWT signing key, or the user was signed out from all devices).
When the Access Token expires, the Interceptor calls `/auth/refresh`, but the
Refresh Token is equally invalid — the backend rejects it, and a loop forms if
the anti-loop guard fails.

**Prevention already in the codebase:**

```typescript
// src/core/api/axios.instance.ts
// This guard breaks the loop: if the /refresh endpoint itself returns 401
// → the session is fully expired → force logout immediately
if (originalRequest.url?.includes("/auth/refresh")) {
  tokenService.clearAll();
  window.location.href = "/login";
  return Promise.reject(error);
}
```

**Manual fix for a stuck user:**

```javascript
// Open the browser DevTools Console (F12) and run:
localStorage.removeItem("vr_access_token");
localStorage.removeItem("vr_refresh_token");
localStorage.removeItem("vr_expires_at");
window.location.href = "/login";
```

> **Developer note:** If the loop occurs despite the guard being in place,
> check whether `originalRequest.url` is `undefined` (this happens when
> `baseURL` is misconfigured in `axios.instance.ts`). Verify the value of
> `VITE_API_BASE_URL` in your `.env.local` file.

---

### 🔴 Error Auth-2: Zod Parsing Failure on Login

**Symptom:**

After entering correct credentials and receiving a `200 OK` from the backend,
the app does not navigate to `/workspace`. The browser Console shows an error
of the form:

```
ZodError: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["accessToken"],
    "message": "Required"
  }
]
```

**Cause:**

The backend changed the response shape of `POST /vietrecruit/auth/login`
(e.g. renamed `accessToken` → `access_token`, or added/removed a required field)
without notifying the frontend. The Zod Schema in `auth.dto.ts` no longer
matches the actual API payload.

**Fix:**

**Step 1:** Inspect the actual response payload from the backend:

```bash
# Use curl to verify the real API response shape
curl -X POST http://localhost:8080/vietrecruit/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}' \
  | python -m json.tool
```

**Step 2:** Update the Zod schema to match:

```typescript
// src/features/auth/types/auth.dto.ts
export const LoginResponseSchema = z.object({
  accessToken: z.string(), // ← Confirm exact field name (camelCase vs snake_case)
  refreshToken: z.string(), // ← Confirm no renames occurred
  expiresIn: z.number(),
  tokenType: z.string().default("Bearer"),
});
```

**Step 3:** After updating the schema, run the type-checker to confirm no
downstream TypeScript errors were introduced:

```bash
pnpm type-check
```

> **Process rule:** When the backend changes an OpenAPI specification, the backend
> developer is **responsible** for notifying the frontend team immediately.
> Every breaking change to a response schema must be reflected in
> `src/features/auth/types/auth.dto.ts` before deployment.
> See also: [`docs/features/AUTH_ARCHITECTURE.md`](docs/features/AUTH_ARCHITECTURE.md)
