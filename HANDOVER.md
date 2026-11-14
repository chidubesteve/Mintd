# Mintd — Handover Guide

Monorepo (npm workspaces + Turborepo): `apps/web` (frontend), `apps/server` (backend API), `packages/contracts` (smart contract).

## Running it locally

From the repo root:

```
npm install
npm run dev
```

This runs `apps/web` and `apps/server` together via Turborepo. Node.js 20+ and npm are required. Each can also be run individually from its own folder with `npm run dev`.

Each app has its own `.env` file (not committed — copy from the matching `.env.example` in that folder and fill in real values):

- `apps/server/.env` — database connection, JWT secrets, email provider, ImageKit, Didit.
- `apps/web/.env` — set `NEXT_PUBLIC_API_URL` to the backend API base URL, including `/api` (locally: `http://localhost:4000/api`). This value is exposed to the browser and must **not** contain secrets.

The API listens on port `4000` by default (override with `PORT`). Set `FRONTEND_URL` to the allowed frontend origin(s) for CORS, e.g. `http://localhost:3000`; for deployed sites, use the real HTTPS origin(s), comma-separated. Set `APP_URL` to the externally reachable backend URL where required by the application. The temporary development ngrok tunnel and domain have been removed from API startup; use your own publicly accessible HTTPS backend for Didit webhooks. No ngrok account or token is required to run the API locally.

### Getting the account values needed

Didit and Resend are already Mintd-managed accounts — retrieve the appropriate API key/secret from those dashboards or issue new credentials if needed. Put the values into `apps/server/.env` under the matching variable name already listed in `.env.example`:

- **Didit** (KYC) — `DIDIT_KYC_API_KEY`, `DIDIT_WORKFLOW_ID`, `DIDIT_WEBHOOK_SECRET_KEY` (workflow is OCR + Liveness (passive) + Face Match; webhook should point at `<your backend URL>/api/webhooks/didit`).
- **Resend** (email) — `RESEND_API_KEY`.

The MongoDB and ImageKit development resources are held in the developer's personal accounts; configure Mintd-owned replacements rather than requesting personal-account access:

- **MongoDB** — create a cluster (MongoDB Atlas or self-hosted), get the connection string, set `MONGODB_URI`. There's nothing to migrate — every existing document is test/demo data; the only real data is the seeded catalogue (below).
- **ImageKit** — create an account, get the private key, public key, and URL endpoint from the dashboard, set `IMAGEKIT_PRIVATE_KEY` / `IMAGEKIT_PUBLIC_KEY` / `IMAGEKIT_URL_ENDPOINT`. Existing demo uploads in the developer account are not automatically available from a new account; use fresh uploads when testing.

Other variables in `apps/server/.env.example` cover JWT signing (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — generate separate strong random secrets), admin bootstrap (`ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`), WatchBase catalogue API (`WATCHBASE_API_KEY`, `WATCHBASE_API_URL`), optional/legacy Mailgun settings, `EMAIL_FROM`, and `RESEND_API_KEY`. Do not commit real `.env` files or share personal API credentials. The `.env.example` values are placeholders, not working credentials.

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
- **Image pipeline** — photos are uploaded to ImageKit and displayed using background-removal, resizing and WebP transformations. The status-specific branded badge/tooltip is rendered in the web UI, rather than permanently composited into the uploaded image.
- **Admin dashboard** — stats overview, a review queue for watches that didn't match the catalogue automatically (approve one-off, or approve and add to the catalogue, or reject with a reason), and an audit log of every admin action.
- **KYC** — identity verification via Didit. A collector starts a hosted verification session (ID document + liveness + face match) from `/kyc`; Didit's decision comes back through a webhook, which updates the user's KYC status automatically.
- **User roles** — two types: `Collector` and `Admin`, via a Mongoose discriminator pattern on a shared base `User` model.

## What's not built / partial

- **KYA (possession proof)** — proving a collector currently possesses a specific registered watch, as opposed to KYC which verifies identity. Designed but not implemented: no challenge-code generation, no photo-capture flow, no admin review queue for it.
- **Minting / NFT certificate** — the smart contract (`packages/contracts`) is built: minting, transfer request/approve/reject/cancel, admin management, pause (for security issues), and stolen-watch flagging. It's been deployed and tested on the Polygon testnet. It has not yet been integrated or wired into the application.
- **Stripe payment** — not started.
- **KYC admin review + email notifications** — KYC status updates automatically via the Didit webhook, but there's no admin queue for ambiguous/declined cases and no transactional emails wired up for any KYC outcome yet.
- **Public verify page, settings page** — built on the UI side, but not yet wired to any API calls or handler functions, so nothing on these pages is functional yet.

## Smart contract and deployment notes

The Solidity contract, Hardhat configuration, deployment script and tests live in `packages/contracts`. The contract was developed and tested separately from the web app; **no contract deployment, verification or NFT-minting integration is required for the current web app to run**. Contract actions require their own network configuration only if someone explicitly chooses to run them.

- Polygon Amoy testnet (chain ID `80002`): deployed contract address **pending confirmation from the original deployment record / Polygonscan**. Do not assume the deployment script's output exists in this repository.
- For optional Hardhat network actions, copy `packages/contracts/.env.example` to `packages/contracts/.env` and set `AMOY_URL`, `PRIVATE_KEY` (a dedicated, funded development deployer; never a personal wallet key) and `ETHERSCAN_API_KEY` (for optional contract verification). These are **not** needed for ordinary frontend/backend startup.
- Do not expose a deployment private key through GitHub, client-side environment variables or handover messages. The contract is not currently connected to the API/frontend minting flow.

## Handover status

The repository includes source code and templates, but no live account access or personal API keys. Mintd should configure its own MongoDB and ImageKit resources, use its existing Didit/Resend accounts, and set deployment URLs and credentials in its own environment. No Stripe integration has been implemented. Production hosting/domain arrangements are separate from this local-startup guide.
