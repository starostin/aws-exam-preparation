# API Contracts and Integration

## Contract Principles

- Backend owns the canonical API contract.
- Frontend consumes typed clients generated or shared from contract types.
- API changes must be backward-compatible within the same version.

## API Standards

- Base path: `/api/v1`
- Use resource-oriented naming.
- Include pagination and filtering on list endpoints.
- Use idempotency keys for critical write operations when needed.

## Error Contract

All error responses should include:

- machine-readable error code
- user-safe message
- trace/correlation ID

## Validation

- Request validation at controller boundary.
- Response shape validation for critical payloads.
- Shared TypeScript models in a dedicated package.

## Key Integration Areas

- Daily dashboard plan retrieval and task updates
- Topic/content retrieval
- Quiz and mock exam attempt submission
- Flashcard review lifecycle
- Progress dashboards and readiness summaries
- Recommendation feed
- Achievement and streak updates
