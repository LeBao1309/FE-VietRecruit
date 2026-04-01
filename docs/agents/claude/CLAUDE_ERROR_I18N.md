# CLAUDE_ERROR_I18N.md -- Error Handling & i18n Domain Agent Brief

> Target Agent: Claude Code | Domain: Error Code Mapping, Vietnamese i18n, Enum Fixes
> Protocol: Read this brief -> Read BUG_REGISTER.md (BUG-004) -> Read BE_CONTRACT.md Section 13 -> Execute

---

## Execution Context

You are performing a complete rewrite of `error.utils.ts` and fixing all enum mismatches. This is BUG-004 -- the most impactful quality-of-life fix. After this, all 77 BE error codes will display Vietnamese messages.

## Mandatory Pre-Read Files

1. `docs/agents/BUG_REGISTER.md` -- BUG-004 full analysis
2. `docs/agents/BE_CONTRACT.md` -- Section 13 (Error Codes)
3. `src/core/utils/error.utils.ts` -- Current (broken) error mapping
4. `src/core/constants/enums.ts` -- Enum mismatches
5. `docs/agents/gemini/GEMINI_ERROR_I18N.md` -- Full Vietnamese translation map

## Tasks (Ordered)

### Task 1: Rewrite error.utils.ts

**File:** `src/core/utils/error.utils.ts`

1. Delete all entries in `ERROR_CODE_MAP` (AUTH_001-006, RATE_LIMIT)
2. Add all 77 BE error codes with Vietnamese translations (see GEMINI_ERROR_I18N.md for complete map)
3. Replace raw English fallback (line 41) with category-based Vietnamese fallback
4. Keep network error message in Vietnamese

### Task 2: Fix enums.ts

**File:** `src/core/constants/enums.ts`

1. Remove `EMPLOYER` from `USER_ROLES` (not a BE role)
2. Remove `EXPIRED` from `JOB_STATUS` (not in BE)
3. Change `CANCELLED` to `CANCELED` in `INTERVIEW_STATUS` (match BE spelling)
4. Remove `NO_SHOW` from `INTERVIEW_STATUS` (not in BE)
5. Remove `EXPIRED` from `OFFER_STATUS` (not in BE)

After enum changes, search codebase for any usage of removed/renamed values and update.

### Task 3: Fix pipeline-stages.ts

**File:** `src/core/constants/pipeline-stages.ts`

Replace all English labels with Vietnamese (see CLAUDE_WORKSPACE.md Task 3).

## Validation

After changes, test these scenarios:
- Login with wrong password -> Vietnamese "Email hoac mat khau khong chinh xac."
- Submit invalid form -> Vietnamese "Du lieu gui len khong hop le."
- Apply to job without CV -> Vietnamese "Can tai len CV truoc khi ung tuyen."
- Rate limited -> Vietnamese "Ban da thu qua nhieu lan."
- Network offline -> Vietnamese "Khong the ket noi den may chu."
- Unknown error code -> Generic Vietnamese fallback (not English)

## Search for Broken References

After enum changes, grep for:
```
CANCELLED    # should be CANCELED
NO_SHOW      # removed
EMPLOYER     # removed
EXPIRED.*JOB # in job context
EXPIRED.*OFFER # in offer context
```

## Run Tests

```bash
cd FE-VietRecruit && pnpm test
```
