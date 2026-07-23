# savhnos

An enterprise SaaS ERP + HRMS + Project Management platform for **construction,
architecture, interior design, MEP/structural consulting and design-build**
companies — multi-company, role-based, with geofenced field attendance,
drawing approval workflows, project management, CRM and accounting.

## What's actually in this repo

The full brief this project was built against describes a huge platform —
AI insights, live GPS playback, drone photo comparison, BIM/IFC viewers,
face recognition, IoT, a Flutter mobile app, and dozens of modules. That is
not something any single pass can deliver; trying to fake all of it would
just produce hollow screens. Instead, this repo is a **working, extensible
foundation** for that platform: real multi-tenancy, real auth/RBAC, and a
genuinely functional slice of the highest-value, hardest-to-retrofit feature
— **soft-geofenced site attendance** — plus the surrounding modules needed
to exercise it end-to-end (projects, employees, CRM, drawing approvals,
dashboard).

Everything below has been built, and verified: `npm run build` across all
workspaces, a live Postgres migration + seed, and manual smoke tests of
login, RBAC enforcement, the dashboard aggregation endpoint, and both the
accept and reject paths of the geofence check.

### Built

- **Multi-company / multi-tenant core** — every table is scoped by
  `companyId`; a company can have branches, its own users, employees,
  clients, projects, invoices, documents.
- **Auth + RBAC** — JWT auth, `POST /auth/register` creates a company and
  its OWNER, `POST /auth/login` issues a token. A `@Roles()` decorator +
  `RolesGuard` restrict routes per the role list from the brief (OWNER,
  SUPER_ADMIN, HR, ARCHITECT, SITE_ENGINEER, DRAFTING_ENGINEER,
  INTERIOR_DESIGNER, PROJECT_ENGINEER, ACCOUNTANT, QC_ENGINEER, CLIENT,
  EMPLOYEE).
- **HRMS core** — employee profiles linked 1:1 to a user account, branches,
  designations, leave requests.
- **Projects + soft geofencing** — creating a project can set a
  latitude/longitude/radius geofence. `radiusMeters` is the hard zone,
  `softToleranceMeters` extends it (e.g. 150m + 100m soft tolerance),
  matching the brief's "soft geofence" requirement. Employees are assigned
  to projects via `ProjectAssignment`.
- **Geofenced attendance** — `POST /attendance/clock-in` takes the
  employee's lat/lng, computes the great-circle (haversine) distance to the
  project's geofence, and rejects the clock-in with a 403 (distance +
  allowed radius reported) if they're outside `radius + softTolerance`.
  Admins can force an entry via `POST /attendance/override/:employeeId`.
  Verified live: a clock-in 65km away is rejected, a clock-in at the
  geofence center succeeds.
- **CRM** — clients/leads with a pipeline stage (LEAD → SITE_VISIT →
  PROPOSAL → QUOTATION → NEGOTIATION → WON/LOST) and estimated value.
- **Drawing management + approval workflow** — drawings have versioned
  revisions; uploading a new approved revision automatically supersedes the
  previous one; a review endpoint records approve/reject decisions with an
  audit trail (`DrawingReview`).
- **Dashboard aggregation** — one endpoint rolls up project counts by
  status, workforce headcount and who's clocked in right now, pending
  drawing approvals, and revenue/expenses/profit.
- **Domain model for what isn't wired up yet** — the Prisma schema also
  models tasks, invoices, expenses, documents, site reports, notifications
  and an audit log, so the next modules (accounting, task boards, document
  vault, site daily reports) build on a schema that already fits them,
  instead of a redesign.
- **Web app** — Next.js (App Router) + Tailwind, with working
  register/login, a stat-card dashboard, and CRUD-ish pages for projects
  (incl. geofence fields), employees, clients, drawings, and an attendance
  page that uses the browser's Geolocation API to actually clock in/out.

### Explicitly not built (roadmap)

Everything else in the original brief is roadmap, not implemented:
AI assistant/insights, live GPS map + playback mode, anti-fake-GPS/mock
location detection, photo/video verification and AI progress comparison,
BOQ/RFI/submittals, accounting depth (GST/TDS, bank reconciliation,
cost centers), procurement/inventory/equipment tracking, document OCR,
company chat/video calls, WhatsApp/Teams/Slack notifications, the Flutter
mobile app, SSO/MFA/biometric login, and BIM/drone/AR/IoT integrations.
The schema and module structure are built so these can be added as new
Nest modules + Prisma models without restructuring what's here.

## Architecture

```
apps/
  api/      NestJS + Prisma + PostgreSQL — REST API, JWT auth, RBAC
  web/      Next.js 14 (App Router) + Tailwind — dashboard web app
packages/
  shared/   Shared TS types/enums (roles, statuses) + haversine helper
```

- **Backend**: NestJS, Prisma ORM, PostgreSQL, class-validator DTOs,
  Passport JWT strategy.
- **Frontend**: Next.js App Router, Tailwind CSS, plain `fetch` against the
  API (no heavier data-fetching layer yet — swap in React Query when the
  surface grows).
- **Multi-tenancy**: every query is scoped by `companyId` taken from the
  JWT payload, not from client-supplied input.

## Local development

Requires Node 18+ and a PostgreSQL instance (use the provided
`docker-compose.yml`, or point `DATABASE_URL` at any Postgres).

```bash
npm install

# start Postgres + Redis (or use your own Postgres and skip this)
docker compose up -d postgres redis

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

npm run prisma:migrate     # apps/api: creates tables
npm run prisma:seed        # apps/api: demo company + users + project

npm run dev:api            # http://localhost:4000/api
npm run dev:web            # http://localhost:3000
```

Seeded login: `owner@skyline.dev` / `Password123!` (also
`engineer@skyline.dev` and `architect@skyline.dev`, same password) for
"Skyline Builders & Interiors", with one active project ("Sky Heights
Residential Tower") that has a geofence already configured.

### Docker

`docker compose up --build` runs Postgres, Redis, the API and the web app
together. Run migrations against the containerized Postgres the first time
(`DATABASE_URL=postgresql://savhnos:savhnos@localhost:5432/savhnos npm run prisma:migrate --workspace=apps/api`).

## Known follow-ups

- `npm audit` currently reports moderate/high advisories in transitive
  dependencies of Next.js 14 and NestJS 10 (Multer, qs, lodash via
  `@nestjs/config`) that only clear via major-version bumps (Next 16,
  Nest platform-express 11). Worth doing as a deliberate upgrade pass with
  its own testing, not bundled into this one.
- The employee/user invite flow takes a password directly from the admin
  UI; a real deployment should replace this with an email invite + set-password
  link instead.
- No automated test suite yet (unit or e2e) — the modules above were
  verified with a live Postgres instance and manual API calls, documented
  in this PR/commit, but there's no regression safety net checked in.
