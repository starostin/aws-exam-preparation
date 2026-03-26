# Authentication and Authorization

## Authentication Provider

- Supabase Auth is the single source of truth for user identity.
- Frontend handles sign-in/sign-up flows via Supabase Auth components or custom forms using Supabase SDK.
- Backend verifies Supabase-issued tokens for protected APIs.

## Authorization Strategy

- User-level access isolation is mandatory for all personal data.
- Future-ready RBAC model should support roles such as:
  - learner
  - admin
  - content_manager

## Session and Token Handling

- Use secure HTTP-only cookie/session strategy where possible.
- Validate token issuer, audience, expiry, and signature.
- Reject requests with missing/invalid authentication context.

## Account Lifecycle

- Support profile updates and account deletion requests.
- Handle password reset and account recovery through Supabase Auth flows.
- Keep user mapping consistency between Supabase identity and internal user table.

## Security Controls

- Rate limit auth-sensitive routes.
- Log suspicious auth events.
- Protect against common web attacks (CSRF/XSS/injection).
