# Coding Standards and Team Conventions

## TypeScript Standards

- Enable strict TypeScript mode in frontend and backend.
- Avoid `any`; prefer explicit types and generics.
- Keep shared domain types in a dedicated package.

## Code Organization

- Keep files small and focused by feature/module.
- Prefer composition over deep inheritance.
- Enforce clear naming for services, DTOs, and hooks.
- In the API (`apps/api`), keep every DTO in a module-local `dto/` folder (for example, `modules/users/dto/update-profile.dto.ts`).

## API and Data Conventions

- Use consistent naming conventions between API and DB models.
- Normalize date/time handling in UTC.
- Keep enums and status transitions explicit.

## Error Handling

- Never swallow errors silently.
- Return user-safe messages and keep internals in logs.
- Include correlation IDs to support debugging.

## Documentation Rules

- Keep technical docs under `/docs/tech` with one topic per file.
- Update related tech docs in the same PR as implementation changes.
- Record architecture decisions as ADRs when major choices change.
