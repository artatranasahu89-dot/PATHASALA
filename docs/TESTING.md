# PATHASALA Testing and Verification Checklist

## Required commands

Run these in the project environment and record actual output before merging:

- `npm test`
- `npm run lint` (TypeScript no-emit check)
- `npm run build`

These commands have not been executed by this GitHub source-edit workflow. Do not mark them passing until they are run against the branch.

## Required security tests

1. Requests without a valid server-issued session receive HTTP 401 for agent, parent, learner-profile/progress, study-session, and sync endpoints.
2. An authenticated student cannot read or mutate another student's profile, progress, agent trace, plan, or session by changing body/path IDs.
3. A student role cannot access parent routes or mutate parental policies.
4. A parent cannot read another parent's child, change another parent's policy, respond to another parent's unlock request, or override an unlinked child.
5. Direct child-ID linking is rejected; pairing codes must be valid, unexpired, and bound to the intended student.
6. Parent-child linking cannot exceed two linked children.
7. Demo credentials work only when explicitly enabled outside production; production rejects predictable demo credentials.
8. Persistent profiles, plans, answers, progress, sessions, policies, unlock requests, and audit events survive server restart when a durable repository is configured.
9. Duplicate `clientActionId` values apply progress exactly once.
10. Failed or unauthenticated sync keeps the mutation in durable client queue for retry; it is never silently discarded.

## Current verification status

The source edits on this branch have not been run through a test suite, TypeScript check, production build, or live API integration test. Persistence and complete offline synchronization remain unimplemented/unverified.