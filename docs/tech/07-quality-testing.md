# Quality, Testing, and Reliability

## Testing Pyramid

- Unit tests for domain services and scoring logic
- Integration tests for API-module and database behavior
- End-to-end tests for critical learner flows

## Critical Flows to Cover

- Sign-in and protected routes
- Daily plan generation and completion tracking
- Quiz attempt and scoring pipeline
- Mock exam timing and result review
- Flashcard review scheduling
- Progress and readiness calculation integrity

## Non-Functional Quality

- Performance targets for dashboard and quiz actions
- Resilience under retry scenarios and partial dependency failures
- Accessibility checks for key frontend experiences

## CI Quality Gates

- Lint + type-check must pass
- Unit/integration test thresholds enforced
- E2E smoke tests for staging deployments
- Block deploy on failed quality gates
