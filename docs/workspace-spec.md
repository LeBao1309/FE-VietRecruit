# Workspace UI Specification

## Overview

The Workspace module serves as the command center for HR personnel and Interviewers. It provides quick access to active job postings, upcoming interviews, and recent applications.

## Flow & Navigation

- The Workspace is accessed after a successful login (managed by Auth store).
- It relies on a generic `AppLayout` incorporating `PipelineTopBar` and `PipelineSidebar`.

## Key Sections

### Dashboard Statistics

- **Jobs Đang mở**: Count of jobs with `status === 'PUBLISHED'`.
- **Ứng viên hôm nay**: Total applications in recent pool (or strictly today's applications).
- **Phỏng vấn sắp tới**: Interviews with `status === 'SCHEDULED'`.

### Action Panel & Pipeline

- **Job Nổi Bật**: Previews of published jobs via `JobPostingRow.vue`.
- **Phễu Tuyển Dụng**: Funnel visualization via `StageProgressBar.vue`.
- **Focus Items / To-Dos**: Temporary mock module. Should eventually tap into an Activity / Task API.

## Design

Adheres completely to `tailwind.config.js` color tokens:

- Primary CTA buttons: `bg-brand` (`#009898`)
- Surfaces: `bg-surface` (`#FFFFFF`) and `bg-surface-soft` (`#F8FAFA`).
- Typography: Uses the configured `Be Vietnam Pro` defaults.
