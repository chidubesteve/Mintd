# Mintd

Web3 platform for luxury watch owners to verify ownership and mint verifiable
ERC-721 digital certificates on Polygon. Business model: sell
provenance/verification data to jewellers, watch dealers, and insurers (per
Alex, the founder/stakeholder this project is built for).

V1 scope is deliberately narrow: registration, catalogue verification, KYC,
per-watch possession proof (KYA), minting, certificate + provenance history.
No marketplace, no transfers, no "stolen watch" flagging yet — the smart
contract already has those functions (request/approve/cancel/reject
transfer), but they're V2/V3, not wired into the app. Don't build toward them
unless explicitly asked.

## Monorepo layout

- `apps/web` — Next.js (App Router), Tailwind v4, shadcn-style components
  (hand-rolled, not CLI-generated — follow existing patterns in
  `components/ui/` when adding primitives), Zustand (auth store), TanStack
  Query, react-hook-form + zod.
- `apps/server` — Express + Mongoose. Mongoose discriminator pattern for
  `User` → `Collector`/`Admin`.
- `packages/contracts` — Hardhat 3 + Solidity. Has transfer/stolen-watch
  functions already written; not connected to the apps at all yet (no
  ethers/wagmi/viem in apps/web, no deployed address/ABI referenced
  anywhere).

Root `package.json` is actually unrelated Hardhat boilerplate (README too) —
historical artifact, not worth "fixing," just don't be confused by it.

## Feature status (as of this writing)

**Built and working:**
- Auth (signup/login/email-verify-via-OTP/password-reset), session restore
  via httpOnly refresh-token cookie (`SessionProvider`).
- Watch registration wizard (4 steps: Identify/Details/Photos/Review),
  catalogue brand/model/reference matching against `WatchCatalogue`
  (seeded from `apps/server/src/seed/data/Mintd v1.1 Database.json`, ~24k
  entries), custom-brand fallback routes to `PENDING_REVIEW`.
- Vault (watch list) + watch detail page.
- Image upload → ImageKit (bg removal + status-specific branded overlay,
  see gotchas below) → stored on `Watch.images[]`.
- Admin dashboard, first slice: `/admin` (stats) + `/admin/watches`
  (catalogue review queue — approve one-off or approve+add-to-catalogue,
  reject with reason), gated by `requireRole('ADMIN')` server-side and a
  client-side redirect. `AdminAuditLog` records every action.

**Stubbed / not built:**
- KYC, KYA (possession proof), minting, Stripe payment, certificate
  generation, public verify page, settings page, privacy/terms pages.
  `PossessionProof.model.ts` exists (schema only, pre-dates most of this
  file's decisions) — matches the KYA design below, nothing wired to it.
- Admin: users list, catalogue CRUD UI, KYA review queue.
- `WatchBase` API verification — explicitly skipped (`Watch.controller.ts`
  has a `// TODO: Call WatchBase API here`), every watch currently either
  matches the local catalogue or goes to `PENDING_REVIEW`.

## KYC/KYA design (discussed at length, not yet built)

- Two separate status axes, not one conflated field:
  `Watch.catalogueStatus` (already exists: brand/model is a real,
  catalogued thing), and a **new** `Watch.verificationStatus`
  (`NOT_STARTED | PENDING | APPROVED | REJECTED` — KYA: does *this* user
  currently possess *this specific* watch), and a **new**
  `User.kycStatus` is partially modeled already (`Collector.kycStatus`).
  Mint-eligible = catalogue accepted AND kycStatus VERIFIED AND
  verificationStatus APPROVED. Vault UI shows "Approved," never
  "Certified" — that word is earned by the actual certificate after
  minting, not before.
- **KYC**: via Didit (MCP available in this environment, org "Mintd"
  exists, no application/workflow created yet — that has to happen in
  Didit's dashboard first, app creation isn't exposed over MCP). Fully
  automatic in v1 — Didit's own decision engine approves instantly on
  doc+liveness, no Mintd-side manual review needed for this part. Webhook
  → `/api/webhooks/didit` flips `kycStatus`.
- **KYA**: custom-built, not a Didit product (possession-of-a-physical-
  object isn't an identity-verification primitive). Flow: generate a
  short-lived single-use code server-side → user writes it on paper next
  to the watch → photo capture (mobile: `capture="environment"` input;
  desktop: live `getUserMedia` canvas-grab, no file picker; desktop→mobile
  handoff via QR encoding a shared `sessionId`, desktop polls
  `GET /api/kya/session/:id/status`) → upload + best-effort EXIF/
  geolocation as fraud-scoring signal, not proof → admin manual review
  (v1) → `verificationStatus` flips.
- Explicitly rejected approaches worth remembering: don't try to encrypt
  client→server image upload against "spoofed requests" — any key shipped
  to a client isn't secret, that's not what TLS + auth + rate-limiting +
  bot-mitigation solve for; don't rely on VPN-blocking (device GPS via
  `navigator.geolocation`, which is what's planned, isn't affected by VPN
  anyway — only IP-based geolocation is, and that's not the plan); don't
  trust EXIF as proof, only as a soft signal.
- V2/later: AI cross-referencing live wristwatch photos against the
  original registration photos, replacing manual KYA review. Explicitly
  out of scope for v1 — flagged as its own ML effort.
- Admin dashboard must-haves identified for when it's built out further:
  role-gated (have this), searchable/sortable/paginated tables (TanStack
  Table v8 — **pin to v8, not v9**, see gotchas), a stats home (have
  this), audit logging (have this), confirmation on destructive actions.

## Gotchas / hard-won fixes

- **ImageKit transform syntax**: chained *steps* are colon-separated;
  commas only join params *within* one step. Overlay layers need the full
  `l-image,i-<path>,...,l-end` block as its own colon-joined step, not
  flattened into one comma list with everything else — got this wrong
  twice before landing on `e-bgremove:l-image,i-...,l-end:f-webp,q-90,w-1200`
  in `ImageKit.utils.ts`. Overlay images are referenced by path relative
  to the ImageKit media library root (same account), not full URLs.
- **`processedUrl` is computed once at registration and persisted** —
  fixing the transform function does *not* retroactively fix already-
  registered watches' stored URLs; only watches registered after the fix
  pick it up. A one-off backfill script (recompute every `Watch`'s
  `images[].url` from the untouched `originalUrl` + current
  `buildProcessedImageUrl`, resave if changed) is the fix for existing
  data, but isn't merged yet — write one if a transform-logic change ever
  needs to apply retroactively again. When KYA/CERTIFIED lands, this
  upload-time-bake-in approach should be replaced with computing the
  transform URL on demand at read time from `originalUrl` + current
  status, not stored once — otherwise a watch that becomes CERTIFIED
  later keeps showing its old badge forever.
- **`@tanstack/react-table` latest resolves to a `9.x` experimental
  rewrite** with a totally different API (no `useReactTable`, no
  `getCoreRowModel`). Pin to `8.x` explicitly.
- No request-logging middleware existed on the server at all until
  `morgan('dev')` was added — if a frontend request seems to vanish with
  no backend trace, check `morgan`'s output first, and check whether
  `FRONTEND_URL` env var is a single clean origin (the old `.env.example`
  placeholder format caused CORS to silently reject everything — fixed,
  but worth remembering why).
- Server-side eslint config is broken repo-wide (missing
  `eslint.config.js`) — pre-existing, not something recent changes broke,
  not yet fixed.
- Known/accepted `npm audit` findings: `diff`/`serialize-javascript` via
  `mocha` and `elliptic` via `ethers`, both only in `packages/contracts`
  dev tooling, neither has a non-breaking fix available. Don't chase
  these without a reason to revisit.
- **Logout didn't actually log anyone out** — two independent cookie bugs
  stacked. (1) `Auth.service.ts`'s `logout()` called `apiClient.get('/auth/logout')`
  but the route is only registered as `router.post('/logout', ...)`, so
  the request 404'd before `authMiddleware`/the controller ever ran —
  `res.clearCookie` never executed. `useLogout`'s `onError` clears local
  Zustand state and redirects either way, so the UI looked like logout
  worked while the server-side `refreshToken` cookie stayed valid. (2)
  `login` and `verify-email` set that cookie with no explicit `path`,
  which browsers default to the request's own directory (`/auth`), while
  `refresh` and `logout` operated on `path: '/'` — two different cookies
  as far as the browser's concerned, so even a working clear would've
  missed the one actually set at login. Net effect: sign out, then any
  page load that calls `SessionProvider`'s `refreshSession()` (i.e. every
  page load) silently re-authenticates off the still-valid cookie. Fixed
  by switching the frontend call to `POST` and making `path: '/'` explicit
  everywhere this cookie is set or cleared (`Auth.controller.ts`); `logout`
  also clears the no-explicit-path variant so already-affected browsers
  (who have the old `/auth`-scoped cookie from before this fix) get it
  cleaned up on their next logout too, not just new logins going forward.

## Working with this repo's owner

- **Always wait for an explicit go-ahead before committing or pushing** —
  this has been asked for repeatedly and explicitly. Make and verify
  changes, then stop and ask, don't commit proactively.
- **Commit message convention**: when a commit is building out a feature,
  prefix the message with `feature/<Name>:` (e.g. `feature/KYC: add Didit
  webhook handler and kycStatus flip`), explaining what was built. Plain
  fixes/docs/chores don't need the prefix — use a normal short description.
- When asked to write a commit message myself, keep attribution footer
  conventions as configured in the session; when given a specific message
  to use verbatim, use only that, no additions.
- No em dashes in any written copy (chat replies, UI copy, email
  templates) — asked for explicitly, applies going forward.
- The owner has repeatedly rebased/force-pushed `develop` from a local
  machine, which has silently dropped already-pushed commits from history
  more than once. Always `git fetch origin develop` and compare before
  pushing; if the remote has diverged non-trivially, check carefully
  whether prior work is still present before assuming a normal merge will
  do, cherry-pick from local commit hashes if something's missing (git
  doesn't immediately garbage-collect unreachable commits, so recovery is
  usually possible if caught promptly).
- For anything involving an external API/transformation syntax this
  session can't directly test (e.g. ImageKit transforms — outbound
  network to third-party media hosts is blocked in this sandbox), give a
  concrete test URL/command and wait for confirmation before assuming a
  fix works or before applying it in bulk (e.g. via a migration script).
- Prefers reusing existing shared components/patterns over one-off
  styling — check `components/ui/` and existing hooks/services
  conventions (`services/*.service.ts` for API calls, `hooks/queries/`
  vs `hooks/mutations/` split) before adding new ones.
