# WorldCupPath 2026 — Codex Instructions

## Project Mission

Build a polished 2026 FIFA World Cup prediction simulator with a premium sports-broadcast feel. The app should feel like a serious ESPN/FIFA/Apple Sports style dashboard, not a generic student project.

## Tech Stack

Frontend:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Recharts
- Zustand
- Radix primitives
- Lucide icons

Backend:
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- NumPy

## Always Read

Before making frontend or UI changes, read:
- `DESIGN.md`
- relevant component files
- relevant page route files
- existing Tailwind config
- existing shared UI components

## Frontend Rules

- Use TypeScript strictly.
- Do not use `any` unless there is no reasonable alternative.
- Prefer reusable components over duplicated page-specific markup.
- Keep components focused and readable.
- Prefer server components unless client state/interactivity is required.
- Use semantic HTML.
- Prioritize mobile-first responsiveness.
- Maintain WCAG AA contrast.
- Do not introduce new UI libraries unless explicitly requested.
- Do not rewrite the whole app when a targeted component/page update is enough.

## Design Rules

- Follow `DESIGN.md` as the source of truth.
- The visual language is premium football broadcast dashboard.
- Avoid generic SaaS dashboard styling.
- Avoid random bright gradients.
- Use motion sparingly and purposefully.
- Charts should be readable, not decorative.
- Tables should be scan-friendly on desktop and usable on mobile.

## Data Visualization Rules

- Probabilities must be easy to compare.
- Use horizontal bars where possible.
- Always label percentages clearly.
- Avoid tiny legends that require memorization.
- Use empty/skeleton states when data is missing.
- Never fake real scores or fixtures.

## Workflow

For major UI tasks:
1. Inspect current files first.
2. Briefly explain the design problems.
3. Implement the smallest clean redesign.
4. Run lint/typecheck/tests if available.
5. Summarize changed files and remaining issues.

## Commands

Prefer these checks when relevant:
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- backend tests if backend files changed

If a command is missing, report that instead of inventing one.
