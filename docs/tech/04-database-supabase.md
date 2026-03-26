# Database Specification (Supabase)

## Platform

- Supabase PostgreSQL as the primary relational database
- Supabase Auth is the primary authentication provider
- Supabase services may still be used for storage, backups, and DB tooling

## Data Modeling Guidelines

Primary entities should include at minimum:

- users
- certifications
- domains
- topics
- study_plans
- study_tasks
- quiz_questions
- quiz_attempts
- mock_exams
- mock_exam_attempts
- flashcards
- review_schedules
- progress_snapshots
- readiness_scores
- user_achievements
- external_resources

## Multi-Certification Readiness

- Every study entity should be tied to certification and domain/topic references.
- Avoid hardcoding SAA-C03 assumptions in schema.
- Use metadata/version columns for evolving exam blueprints.

## Database Best Practices

- Use migrations for every schema change.
- Add indexes for high-frequency filters and joins.
- Track created_at and updated_at consistently.
- Prefer soft deletes only where product behavior requires recovery/audit.
- Use transactions for multi-step state updates.

## Security

- Apply least-privilege database roles.
- Enforce strict Row Level Security where direct DB access is possible.
- Keep service-role credentials only on backend, never in frontend.
- Rotate secrets and access keys on a defined schedule.

## Backup and Recovery

- Enable automated backups and test restore process periodically.
- Define Recovery Point Objective (RPO) and Recovery Time Objective (RTO).
- Document recovery runbook as part of operations docs.
