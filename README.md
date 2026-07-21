# Gamebox

Gamebox is a private-friendly social game diary for a small group. Players can discover games through IGDB, rate them from one to five stars, write reviews, browse other players, add friends, and follow new friend activity.

## What is included

- Username/password accounts with bcrypt password hashes; no email required
- Opaque, random session tokens stored in secure HTTP-only cookies and hashed in PostgreSQL
- IGDB game discovery, search, cover art, metadata, and popular-game lists
- Curated fallback games when IGDB is not configured, so the UI remains usable
- One rating/review per player and game, editable or removable at any time
- Searchable player directory and public review-only profiles
- One-click friends and an unread friend-review activity feed
- PostgreSQL migrations with database constraints for rating bounds and self-friendships
- Responsive Next.js App Router interface built with TypeScript, Tailwind CSS, and shadcn/ui
- Docker Compose production stack with PostgreSQL, a one-shot Prisma migrator, Next.js, and Caddy HTTPS

## Local development

Requirements: Node.js 20.19 or newer and PostgreSQL.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and change the database connection:

   ```bash
   cp .env.example .env
   ```

3. Apply migrations and generate the client:

   ```bash
   npm run db:deploy
   npm run db:generate
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## IGDB setup

Gamebox works with its fallback catalog without credentials. To enable the complete catalog:

1. Register an application in the Twitch developer console.
2. Put the application's client ID and secret in `.env` as `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET`.
3. Restart the app.

The secret is only read by server code. Search calls go through `/api/games/search`, so credentials are never sent to a browser. App access tokens are cached in memory until shortly before expiry.

## Checks

Run the same checks expected before a release:

```bash
npm run db:deploy
npm test
npm run lint
npm run typecheck
npm run build
```

## Oracle Free Tier deployment

An Ampere A1 VM with Ubuntu and Docker is a good fit. For a small friend group, 1 GB of memory can work, but 2 GB or a small swap file gives builds more breathing room.

1. Point an `A`/`AAAA` DNS record for your domain at the VM.
2. In Oracle Cloud's network security list and the VM firewall, allow inbound TCP 80 and 443 and UDP 443. Keep PostgreSQL port 5432 closed publicly.
3. Install Docker Engine and the Docker Compose plugin.
4. Clone the repository, then create `.env` from `.env.example`:

   ```env
   POSTGRES_PASSWORD=use-a-long-random-password
   APP_DOMAIN=games.example.com
   IGDB_CLIENT_ID=your-client-id
   IGDB_CLIENT_SECRET=your-client-secret
   ```

5. Build and start:

   ```bash
   docker compose up -d --build
   ```

The database must become healthy first. Compose then runs every pending Prisma migration exactly once, starts the Next.js standalone server, and finally exposes it through Caddy. Caddy provisions and renews the HTTPS certificate automatically.

Useful operations:

```bash
docker compose ps
docker compose logs -f app caddy
docker compose pull
docker compose up -d --build
```

Persistent data lives in named Docker volumes. Back up `postgres_data` before major server changes. The app service has no published port, and the database is only reachable on the private Compose network.

## Session behavior

Sessions last 30 days. The browser receives only a random token in an HTTP-only, same-site cookie; PostgreSQL stores only its SHA-256 hash. The `Secure` cookie flag is enabled in production. Signing out removes both the current database session and its browser cookie.
