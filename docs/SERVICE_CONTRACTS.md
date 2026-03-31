# Service contracts (HTTP)

This document is the stable API contract for cross-service integration and client routing.

## Auth service (`apps/auth-service`)

### Public key distribution (PEM)

- **GET** `/v1/auth/public-key`
  - **200**: `{ algorithm, public_key, issuer, audience }`
  - **503**: public key not configured

> Compatibility: `/v1/auth/.well-known/jwks` is a deprecated alias and is **not** a real JWKS.

### Identity lifecycle

- **POST** `/v1/auth/register`
  - request: `{ email, password, name? }`
  - response: `{ access_token, token_type, expires_in, user_id, email, name?, role, status }`
  - `name` is deprecated and will be removed; identity does not own profile/display fields.
  - sets refresh cookie (`HttpOnly`, `Secure` outside local, `SameSite` configurable)

- **POST** `/v1/auth/login`
  - request: `{ email, password }`
  - response: tokens (sets refresh cookie)

- **POST** `/v1/auth/refresh`
  - request: `{ refresh_token? }` or cookie
  - response: tokens (rotates refresh cookie)

- **POST** `/v1/auth/logout`
  - request: `{ refresh_token? }` or cookie
  - response: `{ status: "ok" }` (revokes refresh, clears cookie)

### Admin identity APIs

All admin writes (role/status changes, session revocation) live in auth-service. The core API does not mutate identity in microservice mode.

## Core API (`apps/api`)

### Admin event moderation (core-owned)

Requires `UserRole.ADMIN` on the JWT.

- **GET** `/v1/admin/events?page=&page_size=&status=&hidden=&featured=&q=`
  - Lists **all** events (any status), with optional filters. Intended for the admin dashboard.

- **PATCH** `/v1/admin/events/{event_id}/moderation`
  - Body (partial): `{ "is_hidden"?: bool, "is_featured"?: bool, "moderation_note"?: string | null }`
  - **Hidden** published events are omitted from the public **`GET /v1/events`** catalog; organizers (and admins) can still open the event by id; **RSVP** and **join-by-code** are denied for non-organizers/non-admins when hidden.
  - **Featured** published events sort **first** in **`GET /v1/events`**, then by `starts_at`.

### Domain routes

- `/v1/events/*`: events + RSVP
- `/v1/profiles/*`: profile read/write and resume-derived suggestions
- `/v1/resumes/*`: resume upload/status

### Authentication

Core API requires `Authorization: Bearer <access_token>` for protected endpoints.

Core API verifies:
- RS256 signature using distributed public key
- `iss` and `aud`
- `exp`
- `status == ACTIVE`

### Error shape

For domain/service-layer errors, core uses structured errors where possible:

```json
{
  "detail": {
    "code": "SOME_CODE",
    "message": "human readable"
  }
}
```

Auth-service currently returns standard FastAPI `detail` strings for some cases; keep this compatible and converge gradually.

