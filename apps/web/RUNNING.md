# How to run the Meetra application

Follow these steps in order. All commands assume you are in the **Meetra repo root** (`~/src/Meetra` or `/home/mahdiar/src/Meetra`) unless otherwise stated.

---

## Prerequisites (one-time setup)

- **Node.js 20+** (Next.js 16 requires it). If you use nvm: `nvm install 20 && nvm use 20`. Otherwise install from [nodejs.org](https://nodejs.org/) or NodeSource.
- **pnpm**: `npm install -g pnpm` (or use npm instead of pnpm in the steps below).
- **Python** with the Meetra API environment (e.g. conda env `meetra-api` or `meetra`).
- **Docker** (for PostgreSQL and Redis).

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

### Step 2: Configure the web app to use the API (one-time)

The frontend must know the API URL. From the **repo root**:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > apps/web/.env.local
```

If you already created `apps/web/.env.local` before, you can skip this or ensure it contains that line.

---

### Step 3: Free port 8000 (if the API was running before)

If you get **"Address already in use"** on port 8000, stop whatever is using it:

```bash
fuser -k 8000/tcp
```

Or find and kill the process:

```bash
lsof -i :8000
kill <PID>
```

---

### Step 4: Start the API and the web app

From the **repo root**, with your **conda environment activated** (e.g. `meetra-api`):

```bash
conda activate meetra-api
pnpm dev
```

This starts:

- **API** at **http://localhost:8000**
- **Web app** at **http://localhost:3000**

Wait until you see something like:

- `[api] INFO:     Uvicorn running on http://0.0.0.0:8000`
- `[web] ✓ Ready in ...`

---

### Step 5: Open the app in your browser

Open:

**http://localhost:3000**

You will be redirected to **http://localhost:3000/events**.

- If you are **not logged in**, you will see a sign-in screen. Click **Register** to create an account, then **Log in**.
- If you are **logged in**, you will see the Events list and the top navigation (Events, Profile, Organizer, Admin).

---

## Optional: run API and web in separate terminals

**Terminal 1 – API** (with conda env active):

```bash
cd ~/src/Meetra
conda activate meetra-api
pnpm dev:api
```

**Terminal 2 – Web** (Node 20):

```bash
cd ~/src/Meetra
pnpm dev:web
```

Then open **http://localhost:3000**.

---

## Stopping the app

- If you ran `pnpm dev`: press **Ctrl+C** in the terminal where it is running.
- To stop Docker (database and Redis): from repo root run `pnpm docker:down` (or `docker compose down`).

---

## Quick reference

| What              | URL or command              |
|-------------------|-----------------------------|
| Web app           | http://localhost:3000       |
| API               | http://localhost:8000       |
| API docs (Swagger) | http://localhost:8000/docs  |
| Start everything  | `pnpm dev` (from repo root) |
| DB + Redis        | `pnpm docker:up`            |
| Migrations        | `pnpm db:upgrade`           |
