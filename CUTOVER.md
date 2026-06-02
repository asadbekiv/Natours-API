# Cutover — Express → NestJS

End of Phase 3. The NestJS app in **`apps/api-nest`** is at feature parity
with the legacy Express app in **`apps/api`** and adds: refresh-token auth,
ImageKit uploads, helmet/rate-limit/CORS, OpenAPI docs at `/docs`, and
cursor pagination.

This doc is the operational checklist to flip the live deploy to the Nest
app. The Mongo data stays the same — no migration needed.

---

## 1. Pre-flight (local)

Run a full smoke from `apps/api-nest` against your prod-ish DB:

```bash
npm install
npm run build
cd apps/api-nest && cp .env.example .env   # then fill in values
npm run dev --workspace=@natours/api-nest
```

Hit, in order:

- `GET  /api/v1/tours` and `/api/v1/tours/:id`
- `POST /api/v1/users/signup` → check email lands (Mailtrap in dev / Resend in prod)
- `POST /api/v1/users/login` → grab `token` + `refreshToken`
- `POST /api/v1/users/refresh` → new pair
- `PATCH /api/v1/users/updateMe` (form-data, `photo` file) → ImageKit URL
- `POST /api/v1/bookings/checkout-session/:tourId` → Stripe session URL
- `stripe listen --forward-to localhost:4000/api/v1/bookings/webhook-checkout` → pay test card → booking created
- `GET  /docs` → Swagger UI loads, Authorize works

If anything's red, fix locally before touching prod.

---

## 2. Render — service reconfiguration

In your Render dashboard, on the existing web service:

### Settings
- **Root Directory** → `apps/api-nest` *(was `apps/api`)*
- **Build Command** → `npm install && npm run build`
- **Start Command** → `npm run start` *(runs `node dist/main.js`)*
- **Node Version** → 20 or 22 (matches local)

### Environment variables (Render → Environment)
Add (or update) the following — never commit these:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | (leave blank — Render sets it; the app falls back to 4000 locally) |
| `DATABASE` | your Atlas connection string |
| `JWT_SECRET` | a long random secret |
| `JWT_EXPIRES_IN` | `15m` |
| `REFRESH_TOKEN_EXPIRES_DAYS` | `90` |
| `CORS_ORIGIN` | (optional) comma-separated allowlist of web origins |
| `STRIPE_SECRET_KEY` | `sk_live_…` or `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | from the **deployed** Stripe webhook (next section) |
| `SMTP_HOST` | `smtp.resend.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `resend` |
| `SMTP_PASS` | your Resend API key |
| `EMAIL_FROM` | your verified sender |
| `IMAGEKIT_PUBLIC_KEY` | from ImageKit |
| `IMAGEKIT_PRIVATE_KEY` | from ImageKit |
| `IMAGEKIT_URL_ENDPOINT` | from ImageKit |

### Atlas / Mongo
- Same DB. If the cluster is on the free tier and might be paused, **Resume** it.
- Keep `0.0.0.0/0` whitelisted (Render's IPs are dynamic on free).

Deploy → wait for "Live". The first request will be slower while Mongo
connects; afterwards `GET /api/v1/tours` should respond as before.

---

## 3. Stripe — webhook URL

The webhook path changed in the Nest port:

- **Old:** `https://<host>/webhook-checkout`
- **New:** `https://<host>/api/v1/bookings/webhook-checkout`

In **Stripe Dashboard → Developers → Webhooks**:

1. Open the existing endpoint and either **update the URL** to the new path,
   or **delete it** and create a new endpoint.
2. Listen for `checkout.session.completed` (only — the rest are ignored).
3. Click **Reveal signing secret**, copy the `whsec_…`, and put it in
   `STRIPE_WEBHOOK_SECRET` on Render (then redeploy or restart).

---

## 4. Post-deploy verification

Against the live URL:

- `GET https://<host>/api/v1/tours` → 200 + `{ status, results, data, nextCursor? }`
- `POST /api/v1/users/signup` → email arrives (Resend)
- `POST /api/v1/users/login` → tokens come back
- `GET /docs` → Swagger UI renders
- Stripe → trigger a test checkout → confirm a booking row appears in Mongo
  and the Stripe webhook log shows `200`

If any of those fail, roll back the **Root Directory** to `apps/api` —
that's the instant revert.

---

## 5. Retiring `apps/api` (optional, after confirmation)

Once the Nest deploy has been stable for a few days:

```bash
# Drop the legacy Express app + Pug SSR site:
git rm -r apps/api
git commit -m "chore: retire apps/api (NestJS is the new home)"
```

What goes away:
- Server-rendered Pug pages (`/overview`, `/tour/:slug`, etc.)
- The `public/js/*` bundled frontend
- The Express server + middleware

What you *keep*:
- All Mongo data (untouched)
- All commit history (the old app's history stays in git log)
- ImageKit assets, Stripe customers/subscriptions, etc.

If you want a website later, build it as a separate **web** app in
`apps/web` (Next.js or similar) that consumes the same Nest API.

---

## 6. What's next — Phase 4 mobile

With Nest live and stable, the React Native / Expo app can start:

```
apps/mobile/
```

It'll consume `@natours/shared` types and hit the live Nest URL. The
`/docs` page is your interactive contract while building screens. See the
roadmap in `MEMORY.md` (or ask Claude to scaffold `apps/mobile`).
