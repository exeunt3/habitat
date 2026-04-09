# Habitat — Living Ecosystem Visualization

A data visualization platform that renders anonymous organizational feedback as a living reef ecosystem. The visual is projected on a wall. No numbers, no labels — just a world that thrives or suffers depending on the collective state of the people it represents.

---

## Quick start with Docker

The fastest path to a running instance:

```bash
# 1. Clone the repo
git clone <your-repo-url> habitat && cd habitat

# 2. Copy and fill in the environment file
cp server/.env.example .env
# Edit .env — at minimum set JWT_SECRET, ADMIN_KEY, and SMTP settings

# 3. Start everything
docker-compose up --build

# The app is now running at http://localhost:3001
```

After the first boot, go to **http://localhost:3001/setup** to create your first deployment.

---

## Local development

### Prerequisites

- Node 20+
- PostgreSQL 14+ (or Docker)

### 1. Install dependencies

```bash
# From the repo root (workspace)
npm install

# Server deps
cd server && npm install

# Client deps
cd ../client && npm install --legacy-peer-deps
```

### 2. Configure the server

```bash
cp server/.env.example server/.env
# Edit server/.env — DATABASE_URL is the only required field for local dev.
# SMTP settings are optional; magic links are printed to console when SMTP_HOST is unset.
```

### 3. Run migrations and seed

```bash
cd server
npx prisma migrate dev    # or: npx prisma db push (for quick local iteration)
npm run seed              # loads sample data: Acme Corp deployment + 8 users
```

### 4. Start the servers

```bash
# Terminal 1 — API server (port 3001)
cd server && npm run dev

# Terminal 2 — Vite dev server (port 5173)
cd client && npm run dev
```

---

## Environment variables

All variables live in `server/.env` (see `server/.env.example` for the full reference).

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes (prod) | Secret for signing JWTs. Defaults to `dev-secret` in development. |
| `ADMIN_KEY` | Yes | Key for the `/setup` page. Set a strong random value. |
| `SMTP_HOST` | No | SMTP host for magic-link emails. Omit to print links to the console. |
| `SMTP_PORT` | No | Defaults to 587 |
| `SMTP_SECURE` | No | Set `true` for port 465 |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | From address for emails |
| `APP_URL` | No | Public URL of the app (used in magic-link emails). Defaults to `http://localhost:5173`. |
| `PORT` | No | Server port. Defaults to 3001. |

---

## Full setup flow

### 1. Create a deployment

Go to **`/setup`** and enter:
- Your **admin key** (from `ADMIN_KEY` env variable)
- Organisation name
- Manager email address
- 3–5 questions (answered 1–10 by team members each week)

Click **Create deployment**. A magic-link email is sent to the manager.

### 2. Add team members

After logging in via the manager console (`/manage/:deploymentId`), add member email addresses via your database or the API. For MVP, insert directly:

```sql
INSERT INTO "User" (id, email, "deploymentId", role, "createdAt")
VALUES (gen_random_uuid(), 'alice@company.com', '<deploymentId>', 'MEMBER', now());
```

Or use the seed script as a template (`server/src/scripts/seed.ts`).

### 3. Send login links

Members visit **`/login`**, enter their email and deployment ID, and receive a magic link.

### 4. Submit feedback

After clicking the magic link, members are taken to **`/submit`** — a minimal form with sliders for each question. Works on mobile.

### 5. Watch the tank

Project **`/tank/:deploymentId`** on a wall. The scene updates every 60 seconds.

### 6. Manager dashboard

**`/dashboard/:deploymentId`** shows current parameter values, trends, participation, and active side quests.

### 7. Side quests

From **`/manage/:deploymentId`**, create side quests (real-world team actions with deadlines). When a manager marks one complete, a special visual event appears in the tank (manta ray, bioluminescence pulse, or sea turtle visit).

---

## URL reference

| Path | Who uses it |
|---|---|
| `/setup` | One-time: creates a new deployment |
| `/login` | Everyone: magic-link request |
| `/auth/verify/:token` | Callback from magic-link email |
| `/submit` | Members: weekly feedback form |
| `/tank/:id` | Projection screen (full-screen, no UI) |
| `/dashboard/:id` | Manager: live metrics + side quest status |
| `/manage/:id` | Manager: create and complete side quests |

---

## Architecture

```
client/          React + Vite + Three.js (R3F)
server/          Express + Prisma + PostgreSQL
  src/
    routes/      auth, tokens, responses, state, sidequests, admin
    engine/      aggregation: maps responses → 0–1 parameter values
    lib/         prisma client, mailer
    middleware/  JWT auth
    scripts/     seed.ts
  prisma/
    schema.prisma
```

The Three.js scene (`ReefScene.tsx`) is parameterized by three values (0–1):
- **coralHealth** — driven by averaged feedback scores
- **fishPopulation** — driven by the number of active participants  
- **waterClarity** — driven by response consistency (variance)

All three smoothly interpolate on the client over 30 seconds so the scene never jerks.

---

## Deployment notes

- The Docker image serves both the API (`/api/*`) and the static client from the same Express process on port 3001.
- `prisma migrate deploy` runs automatically on container start.
- For a production deployment, set `JWT_SECRET` and `ADMIN_KEY` to strong random values and point `APP_URL` to your public hostname.
- HTTPS termination is expected to happen at the load balancer / reverse proxy level (e.g. Caddy or nginx).

---

## Development utilities

```bash
# Run TypeScript type-check
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit

# Seed the database with sample data
cd server && npm run seed

# Dev-only: get a JWT without email (skips magic link)
curl -X POST http://localhost:3001/api/admin/dev-token \
  -H 'Content-Type: application/json' \
  -d '{"email":"manager@example.com","deploymentId":"seed-deployment-1"}'

# Prisma Studio (database browser)
cd server && npm run db:studio
```
