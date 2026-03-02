# How to run the Meetra application

Follow these steps in order. All commands assume you are in the **Meetra repo root** (`~/src/Meetra` or `/home/mahdiar/src/Meetra`) unless otherwise stated.

---

## Architecture Overview

Meetra uses a **microservices architecture** with separate services:


| Service           | Port | Description                              |
| ----------------- | ---- | ---------------------------------------- |
| **Auth Service**  | 8002 | Authentication (login, register, tokens) |
| **Core API**      | 9000 | Events, profiles, resumes, admin         |
| **Web Frontend**  | 3000 | Next.js UI                               |
| **Celery Worker** | —    | Resume parsing (background)              |
| **PostgreSQL**    | 5432 | Database (Docker)                        |
| **Redis**         | 6379 | Cache/queue (Docker)                     |


---

## Quick Start (4 terminals)

### Terminal 1: Start Infrastructure

```bash
cd ~/src/Meetra
pnpm docker:up
pnpm db:upgrade
pnpm auth:db:upgrade
```

### Terminal 2: Core API (port 9000)

```bash
cd ~/src/Meetra/apps/api
conda activate meetra-api
uvicorn app.main:app --reload --host 0.0.0.0 --port 9000
```

### Terminal 3: Auth Service (port 8002)

```bash
cd ~/src/Meetra/apps/auth-service
conda activate meetra-api
uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

### Terminal 4: Resume Parser (Celery)

```bash
cd ~/src/Meetra/apps/api
conda activate meetra-api
celery -A app.worker.celery_app worker --loglevel=info
```

### Terminal 5: Web Frontend (optional, needs Node 20+)

```bash
source ~/.nvm/nvm.sh
nvm use 20
node -v
npm run devVerify Services
```

```bash
curl http://localhost:9000/health   # Core API
curl http://localhost:8002/health   # Auth Service
```

---

## Preflight checks (run these before starting)

### 0) Go to the repo root

```bash
cd /home/mahdiar/src/Meetra
```

**Expected:** you are in the repo root (running `pwd` prints `/home/mahdiar/src/Meetra`).

---

### 1) Check Node + pnpm

```bash
node -v
pnpm -v
```

**Expected:**

- Node is **v20+** (e.g. `v20.11.1`)
- pnpm prints a version (any recent version is fine)

---

### 2) Check conda env exists (API)

```bash
conda env list | grep -E '^meetra-api\s'
```

**Expected:** a line containing `meetra-api` (the environment name).

If you use a different env name, use that name in the start commands below.

---

### 3) Check Docker is running

```bash
docker info >/dev/null && echo "docker: ok"
```

**Expected:** `docker: ok`

If this fails, start Docker (or ensure the Docker daemon is running) and retry.

---

### 4) Decide how you will open the web app (IMPORTANT)

**If you open the site on the same machine as the server** (browser on the server):

- Use `http://localhost:3000`
- Frontend API URL should be `http://localhost:9000` (recommended)

**If you open the site from another machine** (e.g. your laptop hitting the server IP):

- You will open `http://<SERVER_IP>:3000` (example: `http://131.234.29.111:3000`)
- The browser will NOT be able to reach `http://localhost:<PORT>` on the server
- Frontend API URL MUST be `http://<SERVER_IP>:<API_PORT>`

This is the #1 reason you see **"Network error… (Failed to fetch)"** on Register/Login.

---

### 5) Check ports are free (or know what's using them)

Default ports used:

- Web: **3000**
- API: **9000** (recommended; avoids conflicts with 8000)
- Auth Service: **8002**
- Adminer: **8082**

```bash
lsof -i:3000 -i:9000 -i:8002 || true
```

**Expected (before starting):** no output for those ports.

If you see something listening, stop it or choose a different port.

```bash
fuser -k 9000/tcp 8002/tcp  # Force kill processes on these ports
```

---

## Prerequisites (one-time setup)

- **Node.js 20+** (Next.js 16 requires it). If you use nvm: `nvm install 20 && nvm use 20`. Otherwise install from [nodejs.org](https://nodejs.org/) or NodeSource.
- **pnpm**: `npm install -g pnpm` (or use npm instead of pnpm in the steps below).
- **Python** with the Meetra API environment (e.g. conda env `meetra-api` or `meetra`).
- **Docker** (for PostgreSQL and Redis).

---

## Authentication configuration (important!)

Meetra uses **RS256 JWT tokens** issued by the Auth Service.

### Database Setup

The auth service uses a separate `auth` schema in PostgreSQL:

```bash
# Run auth-service migrations (creates auth.users, auth.refresh_tokens)
pnpm auth:db:upgrade

# Run core API migrations
pnpm db:upgrade
```

### JWT Keys (RS256)

JWT keys are in the `keys/` folder:

- `keys/jwt-private.pem` - Used by Auth Service to sign tokens
- `keys/jwt-public.pem` - Used by Core API to verify tokens

If keys don't exist, generate them:

```bash
cd keys
openssl genrsa -out jwt-private.pem 2048
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
chmod 600 jwt-private.pem
```

### Environment Files

**Auth Service** (`apps/auth-service/.env`):

```env
AUTH_DATABASE_URL=postgresql+psycopg://meetra:meetra@localhost:5432/meetra
AUTH_DB_SCHEMA=auth
JWT_PRIVATE_KEY_PATH=../../keys/jwt-private.pem
JWT_PUBLIC_KEY_PATH=../../keys/jwt-public.pem
JWT_ISSUER=meetra-auth
JWT_AUDIENCE=meetra
```

**Core API** (`apps/api/.env`):

```env
AUTH_MODE=jwt
JWT_PUBLIC_KEY_PATH=../../keys/jwt-public.pem
JWT_ISSUER=meetra-auth
JWT_AUDIENCE=meetra
```

---

## Step-by-step: run the app

### Step 1: Start database and Redis

From the **repo root**:

```bash
pnpm docker:up
```

Wait until you see the containers running (postgres, redis, adminer, traefik). Then run migrations:

```bash
pnpm db:upgrade        # Core API migrations
pnpm auth:db:upgrade   # Auth Service migrations
```

You should see Alembic migration messages and no errors.

---

### Step 2: Configure the web app to use the API (recommended port: 9000)

The frontend must know the API URL. From the **repo root**:

#### Option A: browser is on the same machine (localhost)

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:9000" > apps/web/.env.local
```

#### Option B: browser is on another device (use server IP)

Replace the IP below with your server's network IP:

```bash
echo "NEXT_PUBLIC_API_URL=http://131.234.29.111:9000" > apps/web/.env.local
```

---

### Step 3: Start the services

You need **4 terminals** (all with `conda activate meetra-api`):

**Terminal 1 – Core API:**

```bash
cd ~/src/Meetra/apps/api
conda activate meetra-api
uvicorn app.main:app --reload --host 0.0.0.0 --port 9000
```

**Terminal 2 – Auth Service:**

```bash
cd ~/src/Meetra/apps/auth-service
conda activate meetra-api
uvicorn app.main:app --reload --host 0.0.0.0 --port 8002
```

**Terminal 3 – Celery Worker (resume parsing):**

```bash
cd ~/src/Meetra/apps/api
conda activate meetra-api
celery -A app.worker.celery_app worker --loglevel=info
```

**Terminal 4 – Web Frontend (needs Node 20+):**

```bash
cd ~/src/Meetra/apps/web
npm run dev
```

---

### Step 4: Verify services are running

```bash
curl http://localhost:9000/health   # Should return {"status":"ok"}
curl http://localhost:8002/health   # Should return {"status":"ok","service":"auth-service"}
```

---

### Step 5: Open the app in your browser

Open **one** of these (depending on where your browser is):

- If the browser is on the same machine: **[http://localhost:3000](http://localhost:3000)**
- If the browser is on another device: **http://SERVER_IP:3000** (example: **[http://131.234.29.111:3000](http://131.234.29.111:3000)**)

You will be redirected to `/events`.

- If you are **not logged in**, you will see a sign-in screen. Click **Register** to create an account, then **Log in**.
- If you are **logged in**, you will see the Events list and the top navigation (Events, Profile, Organizer, Admin).

---

## Stopping the app

- Press **Ctrl+C** in each terminal to stop that service
- To stop Docker: `pnpm docker:down`

---

## Checking users (who has signed in)

Users are stored in **two schemas**:

- `auth.users` - Identity data (email, password_hash, role, status)
- `public.users` - Profile data (name, avatar_url)

### Option A: Adminer (web UI)

With Docker running (`pnpm docker:up`), open **[http://localhost:8082](http://localhost:8082)**. Log in:

- **System:** PostgreSQL
- **Server:** postgres (or leave blank)
- **Username:** meetra
- **Password:** meetra
- **Database:** meetra

Then select the `auth` schema and open the `users` table.

### Option B: psql (command line)

```bash
# List auth users (identity)
docker exec -it meetra-postgres psql -U meetra -d meetra \
  -c "SELECT id, email, role, status FROM auth.users;"

# List public users (profile)
docker exec -it meetra-postgres psql -U meetra -d meetra \
  -c "SELECT id, email, name FROM public.users;"
```

### Making a user an admin

```bash
docker exec -it meetra-postgres psql -U meetra -d meetra \
  -c "UPDATE auth.users SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

---

## Admin dashboard

- **URL:** **[http://localhost:3000/admin](http://localhost:3000/admin)**
- **Access:** Only if you are logged in with **role = ADMIN**

---

## Quick reference


| What                | URL or command                                             |
| ------------------- | ---------------------------------------------------------- |
| Web app (local)     | [http://localhost:3000](http://localhost:3000)             |
| Web app (network)   | http://SERVER_IP:3000                                      |
| Core API            | [http://localhost:9000](http://localhost:9000)             |
| Auth Service        | [http://localhost:8002](http://localhost:8002)             |
| API docs (Swagger)  | [http://localhost:9000/docs](http://localhost:9000/docs)   |
| Auth docs (Swagger) | [http://localhost:8002/docs](http://localhost:8002/docs)   |
| Admin dashboard     | [http://localhost:3000/admin](http://localhost:3000/admin) |
| DB admin (Adminer)  | [http://localhost:8082](http://localhost:8082)             |
| Start Core API      | `uvicorn app.main:app --reload --port 9000`                |
| Start Auth Service  | `uvicorn app.main:app --reload --port 8002`                |
| Start Celery worker | `celery -A app.worker.celery_app worker --loglevel=info`   |
| DB + Redis          | `pnpm docker:up`                                           |
| Core migrations     | `pnpm db:upgrade`                                          |
| Auth migrations     | `pnpm auth:db:upgrade`                                     |


---

## API Endpoints (curl examples)

The frontend uses microservices mode: **Auth Service (8002)** for authentication, **Core API (9000)** for everything else.

### Authentication (Auth Service - port 8002)

```bash
# Login
curl -X POST http://localhost:8002/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Register
curl -X POST http://localhost:8002/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "name": "User"}'

# Get current user
curl http://localhost:8002/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Refresh token
curl -X POST http://localhost:8002/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{}'

# Logout
curl -X POST http://localhost:8002/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Core API (port 9000)

```bash
# List events
curl http://localhost:9000/v1/events \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get profile
curl http://localhost:9000/v1/profiles/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Upload resume
curl -X POST http://localhost:9000/v1/resumes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@resume.pdf"

```

### Auth service — admin (identity)

```bash
# List users (admin JWT)
curl 'http://localhost:8002/v1/auth/admin/users?limit=50' \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

---

## Troubleshooting

### "Address already in use"

```bash
fuser -k 9000/tcp 8002/tcp  # Kill processes on these ports
```

### "invalid access token"

- Ensure both services use the same `JWT_ISSUER` and `JWT_AUDIENCE`
- Check that JWT keys exist in `keys/` folder

### "ModuleNotFoundError: No module named 'bcrypt'"

```bash
conda activate meetra-api
pip install bcrypt cryptography
```

### Node.js version error

Next.js requires Node 20+:

```bash
nvm install 20 && nvm use 20
```

