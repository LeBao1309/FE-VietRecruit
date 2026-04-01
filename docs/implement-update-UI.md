# Implementation Guide: UI Overhaul & Tailwind Refactor

**Objective:** Upgrade the VietRecruit ATs frontend UI from a basic layout to a modern, premium, state-of-the-art interface using Tailwind CSS. All changes must align with strict performance budgets (<10% render time penalty) and accessibility standards.

## 1. Architectural Decisions

*   **Layout Strategy:** Maintain the **Responsive Sidebar** design. Complex workspaces require vertical scalability. The sidebar will remain collapsable on mobile and fixed on desktop.
*   **Performance Constraints:**
    *   Avoid heavy DOM manipulations for effects.
    *   Use CSS hardware-accelerated transforms (`transform`, `opacity`) for all `hover:-translate-y-*` or `hover:opacity-*` micro-animations.
    *   Backdrop blur (`backdrop-blur-sm`) will be applied sparingly (only on modals and mobile drawer overlays) to respect the < 10% performance degradation constraint.
*   **Accessibility (WCAG AA):** Text contrast for the primary color `#008c8c` on white background is currently `~3.7:1` (fails AA for normal text). The updated text utility class will enforce a darker shade (`text-[#007070]` or `text-teal-700`) for smaller typography, while retaining `#008c8c` for thick buttons and headers.

## 2. Refactoring Phases

### Phase 1: Global Theme & Token Injection
1.  **Tailwind Configuration (`index.css` / `tailwind.config.js`):**
    *   Enhance neutral palette to use `slate` standard for a cooler, modern premium feel compared to generic gray.
    *   Ensure focus rings are defined globally (`.focus-visible:ring-2`).

### Phase 2: Shared Component Upgrades
1.  **Forms (`input`, `select`, `textarea`):**
    *   Refactor to use a light filled background (`bg-slate-50`) with subtle borders (`border-slate-200`) and a pure white focus state (`focus:bg-white focus:ring-teal-500/50`).
2.  **Buttons:**
    *   *Primary:* Solid `#008c8c` with subtle hover lift and shadow (`hover:-translate-y-0.5 hover:shadow-md transition-all`).
    *   *Secondary:* Translucent or outlined (`bg-slate-100 text-slate-700 hover:bg-slate-200`).
3.  **Cards & Modals:**
    *   *Cards:* Use `rounded-xl` or `rounded-2xl`, standard `border-slate-200/60`, and subtle hover lift for interactive cards (like job listings).
    *   *Modals:* Apply hardware-accelerated `backdrop-blur-sm bg-slate-900/40` for overlays.

### Phase 3: View & Page Enhancements
1.  **Dashboards (`DashboardPage.vue`, `EmployerLayout.vue`):**
    *   Refactor Stat Cards to look premium (subtle gradient/icon wrappers).
    *   Ensure typography hierarchy is flawless (`text-slate-900` for titles, `text-slate-500` for subtitles).
2.  **Data Tables (`JobListPage.vue`):**
    *   Convert basic data rows to premium list rows with high scannability.
    *   Add hover states to table rows (`hover:bg-slate-50`).

## 3. Execution Standard
All Vue components (`.vue`) will be modified strictly using Tailwind utility classes. No arbitrary custom CSS will be added to `<style scoped>` unless absolutely necessary to avoid bloated bundles.
