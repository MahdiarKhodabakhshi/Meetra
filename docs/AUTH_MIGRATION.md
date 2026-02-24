# Auth Microservice Migration Guide

This document describes the migration from monolithic authentication to the auth-service microservice.

## Overview

The authentication system has been extracted into a separate microservice (`apps/auth-service`) that:
- Owns user identity (email, password, role, status)
- Issues RS256-signed JWTs
- Manages refresh tokens and sessions

The core API (`apps/api`) now:
- Verifies JWTs using the public key (stateless)
- Trusts JWT claims without database lookups
- Owns domain data (events, profiles, resumes)

## Architecture Changes

### Before (Monolith)
```
Browser → Core API → users table (auth + profile data)
```

### After (Microservices)
```
Browser → Traefik Gateway
              ├── /v1/auth/* → Auth Service → auth.users
              └── /v1/*      → Core API    → public.events, profiles, etc.
```

## Migration Steps

### Phase 1: Setup (Parallel Running)

Both auth-service and core API can handle authentication during migration.

1. **Generate RS256 keys**:
   ```bash
   cd keys
   openssl genrsa -out jwt-private.pem 2048
   openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
   chmod 600 jwt-private.pem
   ```

2. **Start infrastructure**:
   ```bash
   pnpm docker:up
   ```

3. **Run auth-service migrations**:
   ```bash
   pnpm auth:db:upgrade
   ```

4. **Migrate existing users**:
   ```bash
   python scripts/migrate_users_to_auth.py
   
   # Verify:
   docker exec meetra-postgres psql -U meetra -d meetra \
     -c "SELECT email, role, status FROM auth.users;"
   ```

5. **Update frontend to use gateway**:
   ```bash
   # In apps/web/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:80
   ```

6. **Start all services**:
   ```bash
   pnpm dev:all
   ```

### Phase 2: Cutover

Route authentication through auth-service while keeping core API unchanged.

1. **Test the flow**:
   - Register at `/register` → tokens from auth-service
   - Login at `/login` → tokens from auth-service
   - Protected routes → core API validates JWT with public key
   - Refresh → auth-service rotates tokens
   - Logout → auth-service revokes tokens

2. **Verify JWT validation**:
   ```bash
   # Get a token from auth-service
   TOKEN=$(curl -s -X POST http://localhost:80/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}' \
     | jq -r '.access_token')
   
   # Call core API with the token
   curl -H "Authorization: Bearer $TOKEN" http://localhost:80/v1/events
   ```

### Phase 3: Cleanup

After successful cutover, remove legacy auth code from core API.

1. **Remove auth routes from core API**:
   - Delete `apps/api/app/api/v1/auth.py`
   - Remove `auth_router` from `apps/api/app/api/v1/router.py`

2. **Remove legacy auth dependencies**:
   - Remove `create_access_token` from core (only verification needed)
   - Remove refresh token handling from core

3. **Update admin user management**:
   - Core API proxies to auth-service for role/status changes
   - Or admin UI calls auth-service directly

## Configuration Reference

### Auth Service (`apps/auth-service/.env`)
```env
AUTH_DATABASE_URL=postgresql+psycopg://meetra:meetra@localhost:5432/meetra
AUTH_DB_SCHEMA=auth
JWT_PRIVATE_KEY_PATH=../../keys/jwt-private.pem
JWT_PUBLIC_KEY_PATH=../../keys/jwt-public.pem
JWT_ISSUER=meetra-auth
JWT_AUDIENCE=meetra
```

### Core API (`apps/api/.env`)
```env
AUTH_MODE=jwt
JWT_PUBLIC_KEY_PATH=../../keys/jwt-public.pem
JWT_ALG=RS256
JWT_ISSUER=meetra-auth
JWT_AUDIENCE=meetra
```

### Frontend (`apps/web/.env.local`)
```env
# Through gateway (recommended)
NEXT_PUBLIC_API_URL=http://localhost:80

# Direct to core API (bypass auth-service)
# NEXT_PUBLIC_API_URL=http://localhost:9000
```

## Rollback Procedure

If issues occur, you can rollback to monolith mode:

1. **Core API**: Set `JWT_USE_LEGACY_HS256=true` and restore `JWT_SECRET`
2. **Frontend**: Point directly to core API instead of gateway
3. **Stop auth-service**: `docker stop meetra-auth` or kill the process

## Troubleshooting

### "JWT_PUBLIC_KEY not configured"
- Check `JWT_PUBLIC_KEY_PATH` points to valid PEM file
- Verify file permissions allow reading

### "invalid access token"
- Ensure `JWT_ISSUER` matches between auth-service and core API
- Ensure `JWT_AUDIENCE` matches
- Check token hasn't expired

### "user not found in database"
- Run user migration: `python scripts/migrate_users_to_auth.py`
- For new users, they only exist in auth.users, not public.users

### Gateway not routing correctly
- Check Traefik labels in `docker-compose.override.yml`
- Verify services are running: `docker ps`
- Check Traefik dashboard at http://localhost:8081

## Security Notes

1. **Never commit private keys** - `keys/` is in `.gitignore`
2. **Use HTTPS in production** - Set `REFRESH_COOKIE_SECURE=true`
3. **Rotate keys periodically** - Generate new key pair and update both services
4. **Monitor for replay attacks** - Auth-service logs family revocations
