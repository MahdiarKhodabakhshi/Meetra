# How to run the Meetra application

Follow these steps in order. All commands assume you are in the **Meetra repo root** (`~/src/Meetra` or `/home/mahdiar/src/Meetra`) unless otherwise stated.

---

## Fresh terminal quickstart (full capability)

This section is the **do-this-every-time** playbook from a **brand new terminal** to run everything you’ve implemented:

- DB + Redis (Docker)
- API (FastAPI/Uvicorn)
- Web (Next.js)
- Resume parsing worker (Celery) for queued resume jobs

It also includes **preflight checks** with the **expected results** so you can quickly spot what’s wrong before starting.

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

This is the #1 reason you see **“Network error… (Failed to fetch)”** on Register/Login.

---

### 5) Check ports are free (or know what’s using them)

Default ports used:

- Web: **3000**
- API: **9000** (recommended; avoids conflicts with 8000)
- Adminer: **8080**

```bash
lsof -i:3000 -i:9000 -i:8080 || true
```

**Expected (before starting):** no output for those ports.

If you see something listening (especially on **9000**), stop it or choose a different API port (see below).

---

## Prerequisites (one-time setup)

- **Node.js 20+** (Next.js 16 requires it). If you use nvm: `nvm install 20 && nvm use 20`. Otherwise install from [nodejs.org](https://nodejs.org/) or NodeSource.
- **pnpm**: `npm install -g pnpm` (or use npm instead of pnpm in the steps below).
- **Python** with the Meetra API environment (e.g. conda env `meetra-api` or `meetra`).
- **Docker** (for PostgreSQL and Redis).

---

## Authentication configuration (important!)

The API uses **JWT authentication** for the login/register flow. You must configure this in `apps/api/.env`.

### 1. Copy the example env file (if you haven't already)

```bash
cp apps/api/.env.example apps/api/.env
```

### 2. Set secure values for secrets

Open `apps/api/.env` and replace the placeholder values:

```env
# REQUIRED: Set these to secure random values
JWT_SECRET=<generate-a-strong-random-string>
REFRESH_TOKEN_PEPPER=<generate-another-random-string>
```

You can generate secure values with:

```bash
openssl rand -base64 32
```

### 3. Verify AUTH_MODE is set to jwt

```env
AUTH_MODE=jwt
```

If `AUTH_MODE` is missing or set to `dev`, the API will expect dev tokens (like `dev_user@example.com`) instead of real JWTs, and login/register will fail.

### Key JWT settings in `.env`

| Setting | Default | Description |
|---------|---------|-------------|
| `AUTH_MODE` | `jwt` | Must be `jwt` for real authentication |
| `JWT_SECRET` | — | Secret key for signing JWTs (required) |
| `JWT_ISSUER` | `meetra` | JWT issuer claim |
| `JWT_AUDIENCE` | `meetra` | JWT audience claim |
| `ACCESS_TOKEN_TTL_SECONDS` | `900` | Access token lifetime (15 min) |
| `REFRESH_TOKEN_TTL_DAYS` | `30` | Refresh token lifetime |
| `REFRESH_COOKIE_SECURE` | `false` | Set to `true` in production (HTTPS) |

---

## Step-by-step: run the app

### Step 1: Start database and Redis

From the **repo root**:

```bash
pnpm docker:up
```

Wait until you see the containers running (postgres, redis, adminer). Then run migrations:

```bash
pnpm db:upgrade
```

You should see Alembic migration messages and no errors.

---

### Step 2: Configure the web app to use the API (recommended port: 9000)

The frontend must know the API URL. From the **repo root**:

#### Option A: browser is on the same machine (localhost)

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:9000" > apps/web/.env.local
```

**Expected:** `apps/web/.env.local` contains exactly that line.

#### Option B: browser is on another device (use server IP)

Replace the IP below with your server’s network IP:

```bash
echo "NEXT_PUBLIC_API_URL=http://131.234.29.111:9000" > apps/web/.env.local
```

**Expected:** when you open `http://131.234.29.111:3000`, Register/Login can reach the API.

---

### Step 3: Free port 9000 (required if you see "Address already in use")

The **"Network error. Check API URL and CORS settings. (Failed to fetch)"** on login/register usually means the **API did not start** because port 9000 was already in use. Free it first:

```bash
fuser -k 9000/tcp
```

Or find and kill the process:

```bash
lsof -i :9000
kill <PID>
```

Then start the app again (Step 4).

---

### Step 4: Start the API and the web app (recommended)

From the **repo root**, with your **conda environment activated** (e.g. `meetra-api`):

```bash
conda activate meetra-api
PORT=9000 pnpm dev
```

This starts:

- **API** at **[http://localhost:9000](http://localhost:9000)**
- **Web app** at **[http://localhost:3000](http://localhost:3000)**

Wait until you see something like:

- `[api] INFO:     Uvicorn running on http://0.0.0.0:9000`
- `[web] ✓ Ready in ...`

**Quick verification (optional):**

```bash
curl -sS http://localhost:9000/health
```

**Expected:** `{"status":"ok"}`

---

### Step 5 (optional): Start the Celery worker (resume parsing)

Resume uploads are queued; a **Celery worker** must be running for them to be parsed (Queued → Scanning → Extracting → Done). In a **separate terminal**, from the repo root with the same conda env:

```bash
conda activate meetra-api
pnpm dev:worker
```

Leave this running. Resume jobs will then be processed; the profile page will show status updates as they move from Queued to Done.

---

### Step 6: Open the app in your browser

Open **one** of these (depending on where your browser is):

- If the browser is on the same machine: **[http://localhost:3000](http://localhost:3000)**
- If the browser is on another device: **http://****:3000** (example: **[http://131.234.29.111:3000](http://131.234.29.111:3000)**)

You will be redirected to `/events`.

- If you are **not logged in**, you will see a sign-in screen. Click **Register** to create an account, then **Log in**.
- If you are **logged in**, you will see the Events list and the top navigation (Events, Profile, Organizer, Admin).

---

## Optional: run API and web in separate terminals

**Terminal 1 – API** (with conda env active):

```bash
cd ~/src/Meetra
conda activate meetra-api
PORT=9000 pnpm dev:api
```

**Terminal 2 – Web** (Node 20):

```bash
cd ~/src/Meetra
pnpm dev:web
```

Then open **[http://localhost:3000](http://localhost:3000)** (or **[http://131.234.29.111:3000](http://131.234.29.111:3000)** if you use the network IP).

**If you open the site via the network IP** (e.g. `http://131.234.29.111:3000`) from the same machine, the app still calls the API at `localhost:9000`, which is correct. If you open it from **another device** (e.g. your laptop), set the API URL to the server IP so the browser can reach the API:

```bash
echo "NEXT_PUBLIC_API_URL=http://131.234.29.111:9000" > apps/web/.env.local
```

Restart the web app after changing `.env.local`. The API already allows CORS for `http://131.234.29.111:3000` when configured in `apps/api/.env`.

---

## Optional: run the API on a different port (if 9000 is busy)

If **9000 is busy** (or you want multiple environments), you can run the API on another port.

### Start API on a custom port

In an API terminal:

```bash
cd /home/mahdiar/src/Meetra
conda activate meetra-api
PORT=9100 pnpm dev:api
```

**Expected:** `Uvicorn running on http://0.0.0.0:9100`

### Point the web app to that port

If the browser is on the same machine:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:9100" > apps/web/.env.local
```

If the browser is on another device:

```bash
echo "NEXT_PUBLIC_API_URL=http://131.234.29.111:9100" > apps/web/.env.local
```

Then restart the web app (`pnpm dev:web` or `pnpm dev`).

---

## Stopping the app

- If you ran `pnpm dev`: press **Ctrl+C** in the terminal where it is running.
- To stop Docker (database and Redis): from repo root run `pnpm docker:down` (or `docker compose down`).

---

---

## Checking users (who has signed in)

Users are stored in the **PostgreSQL** database in the `**users`** table.

### Option A: Adminer (web UI)

With Docker running (`pnpm docker:up`), open **[http://localhost:8080](http://localhost:8080)**. Log in:

- **System:** PostgreSQL  
- **Server:** postgres (or leave blank)  
- **Username:** meetra  
- **Password:** meetra  
- **Database:** meetra

Then open the `**users`** table. Columns include `id`, `email`, `name`, `role`, `status`, `last_login_at`, `created_at`, `updated_at`.

### Option B: psql (command line)

```bash
# If using Docker (default credentials)
docker exec -it meetra-postgres psql -U meetra -d meetra -c "SELECT id, email, name, role, status, last_login_at FROM users ORDER BY created_at DESC;"
```

To list only emails and roles:

```bash
docker exec -it meetra-postgres psql -U meetra -d meetra -c "SELECT email, role, status FROM users;"
```

### Making a user an admin

The **Admin** link in the nav and the **Admin dashboard** at `/admin` are only visible when the logged-in user has **role = admin**. New registrations get **attendee** by default.

To promote a user to admin in the database:

**Via Adminer:** Edit the `users` row, set **role** to `ADMIN`, save.

**Via psql:**

```bash
docker exec -it meetra-postgres psql -U meetra -d meetra -c "UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

Replace `your@email.com` with the account you use to sign in. Then refresh the app (or log out and log in). The **Admin** link will appear in the nav and **[http://localhost:3000/admin](http://localhost:3000/admin)** will load the Admin dashboard.

---

## Admin dashboard

- **URL:** **[http://localhost:3000/admin](http://localhost:3000/admin)**
- **Access:** Only if you are logged in with **role = admin** (see “Making a user an admin” above). Otherwise you get “You need admin role to access this page.”

On the Admin dashboard you can:

- Search users by email or name
- Change a user’s **role** (attendee, organizer, admin) and **status** (active, suspended, deleted)
- Revoke a user’s sessions

The **Admin** link in the top navigation is only shown when your user has the admin role.

---

## Quick reference


| What                | URL or command                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------- |
| Web app (local)     | [http://localhost:3000](http://localhost:3000)                                              |
| Web app (network)   | http://:3000 (e.g. [http://131.234.29.111:3000](http://131.234.29.111:3000))                |
| API (recommended)   | [http://localhost:9000](http://localhost:9000)                                              |
| API (custom port)   | [http://localhost](http://localhost): (e.g. [http://localhost:9100](http://localhost:9100)) |
| API docs (Swagger)  | [http://localhost](http://localhost):/docs                                                  |
| Admin dashboard     | [http://localhost:3000/admin](http://localhost:3000/admin)                                  |
| DB admin (Adminer)  | [http://localhost:8080](http://localhost:8080)                                              |
| Start web + API     | `PORT=9000 pnpm dev` (from repo root)                                                       |
| Start Celery worker | `pnpm dev:worker` (separate terminal)                                                       |
| DB + Redis          | `pnpm docker:up`                                                                            |
| Migrations          | `pnpm db:upgrade`                                                                           |


