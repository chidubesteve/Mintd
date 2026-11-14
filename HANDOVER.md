# Mintd — Handover Guide

Monorepo (npm workspaces + Turborepo): `apps/web` (frontend), `apps/server` (backend API), `packages/contracts` (smart contract).

## Running it locally

From the repo root:

```
npm install
npm run dev
```

This runs `apps/web` and `apps/server` together via Turborepo. Each can also be run individually from its own folder with `npm run dev`.

Each app has its own `.env` file (not committed — copy from the matching `.env.example` in that folder and fill in real values):

- `apps/server/.env` — database connection, JWT secrets, email provider, ImageKit, Didit.
- `apps/web/.env` — the backend URL the frontend talks to.

### Getting the account values needed

Didit and Resend are already your own accounts — just pull the existing API key/secret from your dashboard for each, or generate a new one if you'd rather rotate it. Put the values into `apps/server/.env` under the matching variable name already listed in `.env.example`:

- **Didit** (KYC) — `DIDIT_KYC_API_KEY`, `DIDIT_WORKFLOW_ID`, `DIDIT_WEBHOOK_SECRET_KEY` (workflow is OCR + Liveness (passive) + Face Match; webhook should point at `<your backend URL>/api/webhooks/didit`).
- **Resend** (email) — `RESEND_API_KEY`.

Two accounts are currently mine and will need to be set up fresh on your side:

- **MongoDB** — create a cluster (MongoDB Atlas or self-hosted), get the connection string, set `MONGODB_URI`. There's nothing to migrate — every existing document is test/demo data; the only real data is the seeded catalogue (below).
- **ImageKit** — create an account, get the private key, public key, and URL endpoint from the dashboard, set `IMAGEKIT_PRIVATE_KEY` / `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_URL_ENDPOINT`.

### Seeding the database

The watch catalogue (brand/model/reference data the registration wizard matches against) needs seeding once per fresh database:

```
cd apps/server
npm run seed:catalogue
```

This reads from the dataset already in the repo and populates the `WatchCatalogue` collection.

A second script exists for recomputing stored image URLs if the ImageKit transform logic ever changes after watches are already registered: `npm run repair:images` (run from `apps/server`).

## What's built and working

- **Auth** — signup, login, email verification (OTP), password reset, logout. Sessions are a hybrid of server-side session records and JWTs: each login creates a revocable `AuthSession` record (hashed refresh token, TTL-expiring), and a per-user `authVersion` counter invalidates every other active session instantly when bumped (e.g. on password reset). Every request re-checks session validity, not just JWT signature.
- **Watch registration** — a 4-step wizard (identify / details / photos / review). Brand/model/reference are matched against a seeded local catalogue; an unrecognised brand/model routes to a manual review queue instead of being rejected outright.
- **Vault** — the collector's list of registered watches, plus a detail page per watch.
- **Image pipeline** — photos are uploaded to ImageKit, run through background removal, and get a status-specific branded overlay badge composited on top, standardised to WebP.
- **Admin dashboard** — stats overview, a review queue for watches that didn't match the catalogue automatically (approve one-off, or approve and add to the catalogue, or reject with a reason), and an audit log of every admin action.
- **KYC** — identity verification via Didit. A collector starts a hosted verification session (ID document + liveness + face match) from `/kyc`; Didit's decision comes back through a webhook, which updates the user's KYC status automatically.
- **User roles** — two types: `Collector` and `Admin`, via a Mongoose discriminator pattern on a shared base `User` model.

## What's not built / partial

- **KYA (possession proof)** — proving a collector currently possesses a specific registered watch, as opposed to KYC which verifies identity. Designed but not implemented: no challenge-code generation, no photo-capture flow, no admin review queue for it.
- **Minting / NFT certificate** — the smart contract (`packages/contracts`) is built: minting, transfer request/approve/reject/cancel, admin management, pause (for security issues), and stolen-watch flagging. It's been deployed and tested on the Polygon testnet. It has not yet been integrated or wired into the application.
- **Stripe payment** — not started.
- **KYC admin review + email notifications** — KYC status updates automatically via the Didit webhook, but there's no admin queue for ambiguous/declined cases and no transactional emails wired up for any KYC outcome yet.
- **Public verify page, settings page** — built on the UI side, but not yet wired to any API calls or handler functions, so nothing on these pages is functional yet.
