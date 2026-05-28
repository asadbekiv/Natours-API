# @natours/api-nest

NestJS rewrite of the Natours API (Phase 2). Built **in parallel** with the
Express app in `apps/api` — features are ported one module at a time, and the
Express app keeps running/deploying until Nest reaches parity.

## Status

| Module | Status |
|--------|--------|
| Config + Mongoose connection | ✅ |
| Global validation pipe | ✅ |
| Standardized response envelope (interceptor) | ✅ |
| Error envelope + Mongoose error mapping (filter) | ✅ |
| **Tours** (schema, CRUD, stats, monthly-plan, geo) | ✅ (write routes now guarded) |
| **Auth + Users** (JWT, guards, signup/login/reset, /me, admin CRUD) | ✅ |
| **Reviews** (nested + flat routes, rating recalculation, ownership checks) | ✅ |
| **Bookings (Stripe checkout + webhook)** | ✅ |

Auth uses Bearer tokens (`Authorization: Bearer <token>`), not cookies — the
mobile-ready direction. `JwtAuthGuard` replaces `protect`; `@Roles()` +
`RolesGuard` replace `restrictTo`. Welcome and password-reset emails are sent
via the MailService (NodeMailer; dev SMTP / prod via env).

**Security (Phase 3):** `helmet` security headers, CORS (allowlist via
`CORS_ORIGIN`), and global rate limiting (`@nestjs/throttler`, 100 req/min/IP).

**Image uploads (Phase 3):** user `photo` on PATCH /users/updateMe and tour
`imageCover` + `images` on PATCH /tours/:id are uploaded to **ImageKit** via
`StorageService`; the returned URL is stored in Mongo. Image-only, 5 MB cap.

## Run

From the repo root:

```bash
npm install
npm run build                 # builds @natours/shared first (turbo orders it)
cp apps/api-nest/.env.example apps/api-nest/.env   # then fill in DATABASE
npm run dev --workspace=@natours/api-nest
```

Routes are served under `/api/v1` (e.g. `GET /api/v1/tours`). Use a `PORT`
different from the Express app so both can run side by side.

Responses follow the `@natours/shared` contract:
`{ status: 'success', results?, data }` and `{ status: 'fail' | 'error', message }`.
