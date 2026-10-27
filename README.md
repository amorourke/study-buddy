# Study Buddy

React + TypeScript + Tailwind front end with an Express + SQLite API. A rewrite of the Flask Week 8 Study Buddy app.

## Stack

- **Client:** React 19, React Router (data routers: loaders + actions), Tailwind CSS v4, Vite
- **Server:** Express 5 running TypeScript natively on Node (no build step)
- **Database:** SQLite via Node's built-in `node:sqlite` (no native packages to compile)
- **Validation:** Zod schemas in `shared/`, used by both client and server
- **Auth:** bcrypt password hashes, JWT in an httpOnly cookie
- **Email:** Nodemailer (same local SMTP setup as the Flask version)

## Requirements

Node.js 22.22 or newer (Node 24 LTS recommended).

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173. The API runs on port 3000 and Vite proxies `/api` to it.

The database is created at `data/app.db` on first run and seeded with the four default topics. To wipe it and start fresh:

```bash
npm run db:reset
```

## Email

Removing a member sends them an email. To see these locally, run the same debug SMTP server as before in another terminal:

```bash
python -m aiosmtpd -n -l 127.0.0.1:8025
```

If no mail server is running, the member is still removed and the error is logged.

## Configuration

Copy `.env.example` to `.env` to change the port, database path, JWT secret or mail settings.

## Production

```bash
npm run build
npm start
```

Set `NODE_ENV=production` and a real `JWT_SECRET` in `.env` first. The server then serves the built client from `dist/`.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | API (with watch) and Vite dev server together |
| `npm run build` | Type-checks everything and builds the client |
| `npm start` | Runs the API (and serves `dist/` in production) |
| `npm run typecheck` | Type-checks client, server and config |
| `npm run db:reset` | Drops all tables, recreates them and seeds topics |

## Project structure

```
shared/            Zod schemas and types used by client and server
server/
  index.ts         Express app
  db.ts            Schema, seed data and query helpers
  auth.ts          Cookie/JWT session handling
  mail.ts          Removal email
  routes/          auth, topics/venues, groups and bookings
src/
  router.tsx       All routes
  lib/             API client, auth helpers, form handling, flash messages
  components/      Layout, navbar and reusable UI
  pages/           One component per page, grouped by feature,
                   with each feature's loaders/actions in *.data.ts
```
