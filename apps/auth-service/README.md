# Meetra Auth Service

Authentication microservice for Meetra, handling user identity, login, registration, and token management.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Traefik   │────▶│ Auth Service│
│             │     │   Gateway   │     │  (port 8001)│
└─────────────┘     │  (port 80)  │     └──────┬──────┘
                    │             │            │
                    │  /v1/auth/* │            ▼
                    │      │      │     ┌─────────────┐
                    │      ▼      │     │  auth.users │
                    │  auth-svc   │     │  auth.      │
                    │             │     │  refresh_   │
                    │  /v1/*      │     │  tokens     │
                    │      │      │     └─────────────┘
                    │      ▼      │
                    │  core-api   │     ┌─────────────┐
                    └─────────────┘     │ Core API    │
                                        │ (port 9000) │
                                        └──────┬──────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │public.events│
                                        │public.      │
                                        │profiles,etc │
                                        └─────────────┘
```

## Features

- **RS256 JWT signing** - Asymmetric keys for secure token verification
- **Refresh token rotation** - Automatic token refresh with family-based revocation
- **Password hashing** - bcrypt with salt
- **Stateless verification** - Core API verifies JWTs without calling auth-service

## Endpoints

### Public Auth Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/v1/auth/register` | Register a new user |
| POST | `/v1/auth/login` | Login and get access token |
| POST | `/v1/auth/refresh` | Refresh access token |
| POST | `/v1/auth/logout` | Logout and revoke refresh token |
| GET | `/v1/auth/me` | Get current user info |
| GET | `/v1/auth/.well-known/jwks` | Get public key for JWT verification |

### Admin Endpoints (requires admin role)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/v1/auth/admin/users` | List all users |
| GET | `/v1/auth/admin/users/{id}` | Get user by ID |
| PATCH | `/v1/auth/admin/users/{id}` | Update user role/status |
| POST | `/v1/auth/admin/users/{id}/revoke-sessions` | Revoke all sessions |
| DELETE | `/v1/auth/admin/users/{id}` | Soft-delete user |

## Configuration

Environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTH_DATABASE_URL` | PostgreSQL connection string | - |
| `AUTH_DB_SCHEMA` | Database schema for auth tables | `auth` |
| `JWT_PRIVATE_KEY_PATH` | Path to RS256 private key PEM | - |
| `JWT_PUBLIC_KEY_PATH` | Path to RS256 public key PEM | - |
| `JWT_ISSUER` | JWT issuer claim | `meetra-auth` |
| `JWT_AUDIENCE` | JWT audience claim | `meetra` |
| `ACCESS_TOKEN_TTL_SECONDS` | Access token lifetime | `900` |
| `REFRESH_TOKEN_TTL_DAYS` | Refresh token lifetime | `30` |

## Development

### Prerequisites

1. Python 3.11+
2. PostgreSQL running (via Docker)
3. RS256 key pair generated in `/keys/`

### Generate Keys (one-time)

```bash
cd /path/to/Meetra/keys
openssl genrsa -out jwt-private.pem 2048
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
chmod 600 jwt-private.pem
```

### Install Dependencies

```bash
cd apps/auth-service
pip install -r requirements.txt
```

### Run Migrations

```bash
# From repo root
pnpm auth:db:upgrade

# Or directly
cd apps/auth-service
alembic upgrade head
```

### Start the Service

```bash
# From repo root
pnpm dev:auth

# Or directly
cd apps/auth-service
uvicorn app.main:app --reload --port 8001
```

### Run All Services (with gateway)

```bash
# Start infrastructure
pnpm docker:up

# Run auth schema migration
pnpm auth:db:upgrade

# Run core API migration
pnpm db:upgrade

# Start all services
pnpm dev:all
```

## Database Schema

The auth service owns the `auth` schema with these tables:

### auth.users
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (preserved from migration) |
| email | VARCHAR(320) | User email (unique, lowercase) |
| password_hash | VARCHAR(255) | bcrypt hash |
| role | ENUM | ATTENDEE, ORGANIZER, ADMIN |
| status | ENUM | ACTIVE, SUSPENDED, DELETED |
| last_login_at | TIMESTAMP | Last successful login |
| created_at | TIMESTAMP | Account creation time |
| updated_at | TIMESTAMP | Last update time |

### auth.refresh_tokens
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users |
| token_hash | VARCHAR(128) | SHA256 hash of token |
| issued_at | TIMESTAMP | Token issue time |
| expires_at | TIMESTAMP | Token expiry time |
| revoked_at | TIMESTAMP | Revocation time (null if valid) |
| replaced_by | UUID | FK to replacement token |
| family_id | UUID | Token family for rotation |

## JWT Claims

Access tokens include:

```json
{
  "sub": "user-uuid",
  "role": "ATTENDEE|ORGANIZER|ADMIN",
  "status": "ACTIVE|SUSPENDED|DELETED",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234568790,
  "iss": "meetra-auth",
  "aud": "meetra"
}
```

## Security Considerations

1. **Private key protection**: Never commit `jwt-private.pem`
2. **HTTPS in production**: Set `REFRESH_COOKIE_SECURE=true`
3. **Token rotation**: Refresh tokens are single-use
4. **Replay detection**: Reused tokens revoke the entire family
