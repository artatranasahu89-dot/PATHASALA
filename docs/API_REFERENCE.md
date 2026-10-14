# PATHASALA API Reference — Security Audit

Base path: `/api/v1`. The current implementation is Express + TypeScript. This document describes the intended security boundary on the `security/persistence-audit` branch; verify behavior with tests before production.

## Public endpoints

- `GET /healthz` — service health only.
- `POST /auth/login` — public login; credentials are required.
- `POST /auth/register-student` and other registration routes — public registration flows; validate input and assign roles server-side.
- `POST /parent/login` — parent login; must issue a token recognized by the shared auth service.
- `GET /curriculum/subjects`, `GET /curriculum/chapters`, `GET /curriculum/chapter-bundle/:chapterId` — curriculum content endpoints.

## Authenticated student endpoints

The server must verify a server-issued session and derive learner identity from it; body/path IDs must never establish identity.

- `POST /agent/interact`
- `POST /agent/session/start`
- `POST /agent/step`
- `POST /agent/hint`
- `POST /agent/answer/check`
- `POST /agent/plan/create`
- `POST /agent/plan/update`
- `GET /agent/progress/:learnerId` — the parameter must not allow cross-learner access.
- `GET /agent/trace/:sessionId` — trace must belong to the authenticated learner.
- `GET /learner/profile`, `POST /learner/profile`, `POST /learner/switch`, `GET /learner/progress`
- `POST /study/session/start`, `/pause`, `/resume`, `/pulse`, `/break`, `/end`, `/request-unlock`, `GET /study/session/status/:studentId`
- `POST /sync/batch` — student authentication is required; sync is not considered complete until actions are durably applied.

## Authenticated parent endpoints

All parent routes other than `POST /parent/login` require a verified parent session. Parent ID headers and default IDs are not credentials.

- `GET /parent/children`
- `GET /parent/dashboard/:childId`
- `PUT /parent/policy/:childId`
- `POST /parent/link-with-code`
- `POST /parent/unlock-request/respond`
- `POST /parent/override-pin`
- `POST /parent/emergency-restrict/:childId`
- `GET /parent/alerts`

Direct `POST /parent/link-child` by arbitrary student ID is blocked; use the time-limited pairing-code flow.

## Known implementation gaps

- In-memory Maps are not durable persistence.
- The sync route does not yet apply queued actions to durable state and must not be described as production-ready.
- Complete route-level authorization tests, persistent repository integration, and real sync idempotency tests remain required.
- Keep secrets server-side; never put Firebase Admin credentials or Gemini keys in Vite client configuration.
