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

### Phase 1: Global Theme & Token Injection (Completed)
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

## 3. Comprehensive View Refactor Checklist (`src/views/`)

To modernize the entire application uniformly, the following files will be refactored to conform to the rules in `docs/first-prompt.md`, integrating the specific business flows identified in the agent blueprints.

### 3.1 Workspace, Pipeline & Management Features
**Flow Insight:** The workspace governs job creation, the kanban application pipeline, and interview scorecards.
*   [x] **`employer/DashboardPage.vue`**: Layout rounded, hover stat cards added, quota bar stylized.
*   [x] **`employer/JobListPage.vue`**: Borderless table list rows with slick hovers.
*   [x] **`employer/JobFormPage.vue`**: Refactor extensive forms to use the `bg-slate-50` floating inputs. Ensure salary arrays and AI Job Description Generation buttons are prominent.
*   [x] **`employer/ApplicationPipelinePage.vue` (Kanban Board)**: 
    *   Style the 6 kanban columns (Mới, Sàng lọc, Phỏng vấn, Đề nghị, Đã tuyển, Từ chối) with `bg-slate-100/50` fixed-height scrolling containers.
    *   Style candidate draggable cards to clearly show Name, Position, and Application Date. Add hover-lift for drag cues.
    *   Enhance the `CandidateDetailPanel` slide-out drawer layout.
*   [x] **`employer/ScorecardFormPage.vue` & `employer/ScorecardSummaryPage.vue`**: 
    *   Implement prominent, styled radio buttons/toggle chips for the four constraints: `STRONG_YES`, `YES`, `NO`, `STRONG_NO` (e.g., ranging from emerald-green to rose-red).
*   [x] **`employer/InterviewDetailPage.vue`**: Add the "Generate AI Questions" panel UI gracefully alongside the candidate details.
*   [x] **`employer/TeamPage.vue` & `OrganizationPage.vue`**: Convert data tables/lists to new standard with role badges.
*   [x] **Layout Restructure**: Consolidate layouts if necessary (Admin/Employer wrappers) into a unified `WorkspaceLayout.vue` featuring the Sidebar.

### 3.2 Billing / Pricing (PayOS Flow)
**Flow Insight:** Checkout flow jumps to PayOS and returns to a status page.
*   [ ] **`employer/PricingPage.vue`**: Marketing-focused premium pricing cards (FREE, PRO, ENTERPRISE). Add a sleek Monthly/Yearly billing toggle switch.
*   [ ] **`employer/SubscriptionPage.vue`**: Feature the active plan strongly, integrating the remaining quota bar.
*   [ ] **`employer/PaymentStatusPage.vue`**: Distinct success/error status message cards when returning from the PayOS link.

### 3.3 Candidate Portal & AI Features
**Flow Insight:** Candidates upload CVs (PDF <5MB) directly, apply for jobs, and use AI features to prepare.
*   [ ] **`candidate/DashboardPage.vue`**
*   [ ] **`candidate/CandidateProfilePage.vue` & `candidate/CvManagementPage.vue`**: Restyle the CV Upload Drag-and-Drop zone (`border-dashed hover:border-teal-500 bg-slate-50`). Ensure validation errors (<5MB, PDF only) look native.
*   [ ] **Missing AI UIs (`JobRecommendations`, `SalaryBenchmark`)**: Create dedicated modern UI sections for AI recommendations (cards) and Salary Benchmark (charts or progress bars). Add the "Improve CV" action button to the Profile view.
*   [ ] **`candidate/MyApplicationsPage.vue`**: Timeline step styling to track application progress visually through the 6 pipeline stages.

### 3.4 Shared, Administrative & Auth
*   [ ] **`shared/SettingsPage.vue` & `shared/ProfilePage.vue`**
*   [ ] **`admin/UsersPage.vue` & `admin/TransactionsPage.vue`**
*   [ ] **`auth/... (7 files)`**: Create a unified elegant centered authentication layout box.
*   [ ] **`public/JobBoardPage.vue` & `public/PublicJobDetailPage.vue`**: Distinctive, scannable public pages with robust search autocompletion inputs.

## 4. Execution Standard
All Vue components (`.vue`) will be modified strictly using Tailwind utility classes. No arbitrary custom CSS will be added to `<style scoped>` unless absolutely necessary to avoid bloated bundles.
