# Technical Documentation

This document is the main entry point for all technology decisions in the project.

The project is designed as a full TypeScript system:

- Frontend: Next.js
- Backend: NestJS
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- UI Component System: shadcn/ui

All technical materials are split into separate files to keep them easy to update.

## Index

- [01. Technical Overview](docs/tech/01-overview.md)
- [02. Frontend Technical Specification (Next.js)](docs/tech/02-frontend-nextjs.md)
- [03. Backend Technical Specification (NestJS)](docs/tech/03-backend-nestjs.md)
- [04. Database Specification (Supabase)](docs/tech/04-database-supabase.md)
- [05. Authentication and Authorization](docs/tech/05-authentication-authorization.md)
- [06. API Contracts and Integration](docs/tech/06-api-contracts.md)
- [07. Quality, Testing, and Reliability](docs/tech/07-quality-testing.md)
- [08. DevOps, Delivery, and Security](docs/tech/08-devops-security.md)
- [09. Coding Standards and Team Conventions](docs/tech/09-coding-standards.md)

## Notes

- The technical architecture aligns with product requirements in [FEATURES.md](FEATURES.md).
- MVP supports AWS SAA-C03 first, while data and module design remain open for additional certifications.
