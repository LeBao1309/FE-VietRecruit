# Workspace Component Guide

## Overview

All Workspace-related generic components are localized to `src/features/workspace/components/`.

### JobPostingRow.vue

Displays a brief overview of a job.

- **Props**: `job: JobWithDetails`
- **Features**: Truncates titles, displays status chips dynamically based on `JobStatus` (`DRAFT`, `PUBLISHED`, `CLOSED`).

### InterviewSlot.vue

Row containing metadata for an upcoming interview.

- **Props**: `interview: InterviewWithDetails`
- **Features**: Displays time/date computations, maps over Interviewer `User` objects, auto-colors based on `InterviewStatus`.

### ScoreTag.vue

Minimal Tag for visualizing an applicant's score out of 100.

- **Props**: `result: ScorecardResult`, `score?: number`
- **Features**: Uses `tailwindcss` specific semantic classes depending on `PASS`, `FAIL`, `CONSIDERING`.

### StageProgressBar.vue

Visualization for multi-stage conversion rates (similar to a recruiting funnel).

- **Props**: `stages: Array` containing `id`, `label`, `color`, `count`
- **Features**: Uses tooltips on hover to present absolute counts.

### CommentThread.vue

Used as an inline discussion panel, simulating comments and activity feeds.

- **Props**: `history: ApplicationStatusHistory[]`
- **Events**: `add-comment` when a comment is submitted
- **Features**: Renders chronological history, supports local input state tracking.
