# Meetra Architecture (Core + Auth Service)

## Goals (“definition of done”)

- **Single source of truth for identity**: `apps/auth-service` owns credentials, refresh tokens, roles/status, and access token issuance.
- **Single source of truth for domain data**: `apps/api` owns events/RSVP, profiles, resumes, and any matching/recommendations logic.
- **Claims-based authorization**: core API trusts signed JWT claims for `sub/role/status` and uses `public.users` as a cache/read-model for foreign keys and local reads.
- **Security baseline**: CORS, request IDs, security headers, rate limiting, safe cookie settings.
- **Operational baseline**: `/health` + `/version` + `/metrics` on both services.

## Service boundaries

### Auth service (`apps/auth-service`)

- **Owns**
  - Register/login/refresh/logout
  - Refresh token rotation + replay-family revocation
  - Admin identity operations (role/status changes, session revocation)
  - RS256 access token signing
  - Public key distribution (PEM)
- **Does not own**
  - Profile/display fields (e.g. `name`)
  - Event, resume, profile domain state

### Core API (`apps/api`)

- **Owns**
  - Events + RSVP + **event moderation** (hide from catalog, feature in catalog, admin notes)
  - Profiles (including display fields)
  - Resumes + ingestion pipeline orchestration
  - Matching/recommendations (future)
- **Does not own**
  - Passwords, refresh tokens, login lifecycle

## Auth claims (single source of truth)

Core API treats access token claims as authoritative for authorization decisions:

- `sub`: user id (UUID string)
- `email`: user email (string, optional)
- `role`: `ATTENDEE | ORGANIZER | ADMIN`
- `status`: `ACTIVE | SUSPENDED | DELETED` (core must reject non-ACTIVE)
- `iss`: issuer (must match config)
- `aud`: audience (must match config)
- `exp`: expiration (unix timestamp)
- `iat`: issued-at (unix timestamp)

## Token verification model (current phase)

- **RS256 verification via distributed public key file**
  - Auth-service signs with private key.
  - Core API verifies locally using `JWT_PUBLIC_KEY_PATH` / `JWT_PUBLIC_KEY`.
  - Auth-service exposes `GET /v1/auth/public-key` for debugging/ops.

> A real JWKS endpoint (with `kid/kty/n/e`) and rotation support is a later milestone.

## Data ownership & caching

- `auth.users` / `auth.refresh_tokens`: owned by auth-service.
- `public.users`: **core-owned cache/read model** (FK anchor for domain tables). Populated/updated from JWT claims (`sub/email/role/status`).
- `public.profiles`: core-owned user profile (including display fields such as `display_name`).

## Request routing (gateway)

- `/v1/auth/*` → auth-service
- `/v1/*` → core API

## Contracts and error shapes

See `docs/SERVICE_CONTRACTS.md`.

