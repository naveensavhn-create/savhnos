# Deploying savhnos on Hostinger — one app, one file

This is the **entire product — API and website — as a single Node.js
application**. One Hostinger "Node.js App", one domain, one process, one
port. No CORS to configure, no second app to manage.

How: `src/index.ts` runs one Express server. NestJS (the backend) is
mounted underneath it at `/api`; everything else is handed to Next.js (the
website). Both were originally built as separate services — this
repackages them to share a single process specifically for hosts like
Hostinger's shared/Business plans, where "Setup Node.js App" (Phusion
Passenger) runs exactly one Node process per application.

This was tested end-to-end before packaging: a clean `npm install` from
scratch, a full build, booting the exact compiled entry point
(`dist/index.js`), and a real browser login through it — confirmed `/api/*`
requests hit NestJS, everything else renders the Next.js app, and the
dashboard loads real data through the same origin.

## 0. You need a PostgreSQL database

Hostinger's shared/Business hosting only provisions **MySQL** — there's no
managed Postgres on this tier, and this app uses Postgres (via Prisma).
Get a free external one before you start:

- **[Neon](https://neon.tech)** (recommended) or **Supabase** — both work
  with zero code changes. Create a project, copy the connection string
  (looks like `postgresql://user:password@host/dbname?sslmode=require`).

## 1. Upload this folder

Upload the **contents** of this folder (not a nested folder) to somewhere
like `~/savhnos` on Hostinger, via File Manager or SFTP.

Do **not** upload `node_modules`, `dist`, or `web/.next` — they aren't
included on purpose. Prisma's query engine is a native binary that must be
generated on the exact server it runs on; you'll build fresh on Hostinger
so it matches.

## 2. Create the Node.js App in hPanel

hPanel → **Advanced → Node.js** → Create Application:

- **Node.js version**: 18 or newer
- **Application mode**: Production
- **Application root**: the folder you uploaded (e.g. `savhnos`)
- **Application URL**: your domain, e.g. `app.yourdomain.com` — this one
  domain now serves both the website and the API (at `/api`)
- **Application startup file**: `dist/index.js`

hPanel will give you an "Enter to the virtual environment" command (looks
like `source /home/.../nodevenv/savhnos/18/bin/activate && cd
/home/.../savhnos`) — use that, via SSH or the hPanel terminal, for every
command below.

## 3. Set environment variables

In the same hPanel Node.js App screen, add:

| Key | Value |
|---|---|
| `DATABASE_URL` | the Postgres connection string from step 0 |
| `JWT_SECRET` | any long random string — don't reuse the example, generate your own |
| `JWT_EXPIRES_IN` | `8h` (optional, this is the default) |

`PORT` is injected automatically by Passenger — don't set it. `REDIS_URL`
isn't used by any code yet — skip it.

`NEXT_PUBLIC_API_URL` is **already handled** — `web/.env.production` ships
with it set to empty, which makes the frontend call `/api/...` as a
same-origin relative path. You don't need to touch this unless you later
split the API back out to its own domain.

## 4. Install, migrate, build

```bash
npm install                 # resolves vendor/shared + everything else, one install for both halves
npx prisma migrate deploy   # creates the tables on your Postgres instance
npm run build                # compiles the API (tsc) AND builds the website (next build)
```

If you want the seeded demo company/users:

```bash
npx prisma db seed
```

(Login: `owner@skyline.dev` / `Password123!` — change this password or
delete the seed data before going live.)

## 5. Restart the app

hPanel → Node.js App → **Restart**. Passenger `require()`s `dist/index.js`,
which starts one Express server listening on the port Passenger provides.

## 6. Verify

Visit `https://app.yourdomain.com/login` — sign in page should render, and
logging in should reach the dashboard with real numbers. You can also
directly check the API:

```bash
curl https://app.yourdomain.com/api/dashboard/summary
```

A `401 Unauthorized` JSON response means the API is up (that endpoint
requires a login token — 401 is correct, not an error).

## Troubleshooting

- **502 / app won't start**: check the app's log in hPanel. Usually
  `DATABASE_URL` wrong/unreachable, or `npm run build` wasn't run (no
  `dist/` or `web/.next` folder yet).
- **"Can't reach database server"**: add `?sslmode=require` to your
  connection string if your Postgres provider needs it (Neon/Supabase do).
- **Prisma engine errors** (`Query engine library for current platform "X"
  could not be found`): `npm install` (which runs `prisma generate`
  automatically) was run somewhere other than this server. Always run it
  **on Hostinger itself** — never upload a `node_modules` built elsewhere.
- **Website loads but shows "Failed to load dashboard" / every API call
  fails**: confirm `web/.env.production` still has `NEXT_PUBLIC_API_URL=`
  (empty) and that you ran `npm run build` *after* any change to it —
  Next.js bakes that value in at build time, restarting the app alone
  won't pick up a change.
- **Styles look broken / unstyled HTML**: the website build didn't run
  from inside `web/` — this is handled by the `build:web` script already,
  but if you ever build manually, always `cd web && next build`, never
  `next build web` from the root (Tailwind resolves its config from the
  current directory, not the target directory).
