# Backend Technical Specification (NestJS)

## Stack

- NestJS with TypeScript
- Supabase PostgreSQL as primary data store
- Drizzle ORM for database access and migrations
- Supabase Auth token verification in backend guard/middleware
- Redis (optional but recommended) for caching and queues

## Backend Architecture

Use modular domain-driven Nest modules:

- Auth Integration Module (Supabase identity mapping)
- Users Module
- Study Plan Module
- Topics/Curriculum Module
- Quizzes Module
- Mock Exams Module
- Flashcards Module
- Progress Module
- Recommendations Module
- Gamification Module

## API Design

- REST API with versioning (`/api/v1/...`).
- Use DTO validation and serialization at the controller boundary.
- Keep controllers thin; business logic belongs to services.
- Use consistent error response contract.

## Security and Authorization

- Verify Supabase-issued tokens on every protected endpoint.
- Map Supabase Auth user IDs to internal user records.
- Enforce per-user data isolation at service/query level.

## Data and Domain Logic

- Daily plans should be generated from goals, performance, and remaining timeline.
- Recommendations should use weak-area signals and recent attempt history.
- Readiness score should be a transparent weighted model.
- Keep scoring/recommendation logic testable and deterministic.

