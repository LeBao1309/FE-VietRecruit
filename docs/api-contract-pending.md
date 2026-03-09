# API Contract Pending List

This document keeps track of the fields used in the UI that are currently simulated via mocks, pending API endpoint availability.
All fields map directly to `Script_Database.md`.

| Component        | Prop/Field   | DB Table.Column                  | API Endpoint                        | Status     |
| ---------------- | ------------ | -------------------------------- | ----------------------------------- | ---------- |
| WorkspacePage    | jobs         | jobs.\*                          | GET /api/workspace/dashboard        | ⏳ pending |
| WorkspacePage    | applications | applications.\*                  | GET /api/workspace/dashboard        | ⏳ pending |
| WorkspacePage    | interviews   | interviews.\*                    | GET /api/workspace/dashboard        | ⏳ pending |
| JobPostingRow    | headcount    | - (not in DB explicitly)         | GET /api/jobs (computed/aggregated) | ⏳ pending |
| StageProgressBar | applications | applications.status              | GET /api/workspace/dashboard        | ⏳ pending |
| CandidateCard    | score        | scorecards.average_score         | GET /api/applications/:id           | ⏳ pending |
| CandidateCard    | status       | applications.status              | PATCH /api/applications/:id/status  | ⏳ pending |
| CommentThread    | notes        | application_status_history.notes | POST /api/applications/:id/comments | ⏳ pending |
