# Technical Overview

## Purpose

This document defines the technical direction for the AWS Exam Preparation project and aligns implementation decisions with product features from [FEATURES.md](../../FEATURES.md).

## High-Level Architecture

The project uses a full TypeScript stack with clearly separated frontend and backend applications.

- Frontend: Next.js (TypeScript)
- Backend: NestJS (TypeScript)
- Database and Auth data store: Supabase (PostgreSQL)
- User Authentication provider: Supabase

## Core Principles

- Keep frontend and backend fully decoupled through versioned API contracts.
- Keep business logic in backend services, not in frontend UI layers.
- Keep data model ready for multiple certifications beyond SAA-C03.
- Use modular documentation and modular code structure.
- Build for secure-by-default operation and production readiness.

## Suggested Repository Structure

```text
/apps
  /web                # Next.js frontend
  /api                # NestJS backend
/packages
  /types              # Shared TypeScript types (DTOs, API contracts)
  /config             # Shared lint/tsconfig/prettier configs
/docs
  /tech               # Technical documentation
```

## Environment Strategy

Use separate environments:

- Local development
- Staging
- Production

Each environment should have isolated configuration, secrets, and Supabase project where practical.

## Feature Mapping Direction

Architecture should directly support:

- Daily study plan generation and task lifecycle
- Timeline-goal calculations and progress forecasting
- Topic/domain curriculum modeling
- Quiz, mock exam, and flashcard workflows
- Progress analytics, readiness scoring, and weak-area recommendations
- Motivation features (streaks, milestones, badges)
