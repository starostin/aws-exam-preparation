# Frontend Technical Specification (Next.js)

## Stack

- Next.js (App Router)
- TypeScript (strict mode)
- Supabase Auth for authentication UI/session on frontend
- shadcn/ui for component primitives
- Tailwind CSS for styling
- TanStack Query for server-state management
- Zod for runtime validation where needed

## Frontend Architecture

Use a feature-oriented folder organization under the app:

```text
/apps/web/src
  /app
  /features
    /dashboard
    /timeline
    /topics
    /quizzes
    /mock-exams
    /flashcards
    /progress
    /recommendations
  /components
    /ui              # shadcn/ui generated and customized
    /shared
  /lib
    /api
    /auth
    /validation
  /hooks
  /types
```

## Best Practices

- Use Server Components by default and Client Components only where interactivity is required.
- Keep data fetching close to route boundaries.
- Avoid large client-side global state; prefer server state and URL state.
- Validate API response boundaries and handle partial failures gracefully.
- Design reusable, accessible components with shadcn/ui primitives.
- Follow responsive-first layout for desktop and mobile web.

## Authentication on Frontend (Supabase Auth)

- Use Supabase session-based route protection for private app sections.
- Keep public pages minimal (landing, sign-in, sign-up).
- Forward verified user identity to backend via secure token strategy.
- Never place authorization logic only in UI; backend must re-validate access.

## UI Design System (shadcn/ui)

- Build common building blocks: cards, tabs, dialogs, forms, data tables, command palette.
- Define a stable theme token set (colors, spacing, typography, radii).
- Add consistent loading, empty, error, and success states.
- Ensure keyboard accessibility and proper semantic markup.

## Frontend Performance

- Use route segment splitting and dynamic imports for heavy modules.
- Cache and revalidate API calls intentionally.
- Optimize media assets and avoid oversized client bundles.
- Track Core Web Vitals and fix regressions quickly.
