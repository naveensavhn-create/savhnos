# savhnos

An enterprise SaaS ERP + HRMS + Project Management platform for **construction,
architecture, interior design, MEP/structural consulting and design-build**
companies — multi-company, role-based, with geofenced field attendance,
drawing approval workflows, project management, CRM and accounting.

This is a **single full-stack Next.js 15 application** — one `package.json`,
one `node_modules`, one `git push` to deploy. There is no separate backend
service, no monorepo/workspace tooling, and no Docker required for
deployment.

## Try it now — demo login

The app ships with a seed script that creates a fully populated demo
workspace: 3 real projects (active/delayed/completed), 11 staff across every
role, live attendance for today, a CRM pipeline, drawing approvals waiting
for review, and invoices/expenses. Run the seed (see below), start the app,
and go to `/login` — the right-hand panel lists one-click demo logins for
every role. Manual credentials, all sharing one password:

| Role | Email | Password |
| --- | --- | --- |
| Owner | `owner@savhnos.dev` | `Demo@12345` |
| Super Admin | `admin@savhnos.dev` | `Demo@12345` |
| HR | `hr@savhnos.dev` | `Demo@12345` |
| Architect | `architect@savhnos.dev` | `Demo@12345` |
| Project Engineer | `projectengineer@savhnos.dev` | `Demo@12345` |
| Site Engineer | `siteengineer@savhnos.dev` | `Demo@12345` |
| Interior Designer | `interiordesigner@savhnos.dev` | `Demo@12345` |
| Drafting Engineer | `draftingengineer@savhnos.dev` | `Demo@12345` |
| Accountant | `accountant@savhnos.dev` | `Demo@12345` |
| QC Engineer | `qcengineer@savhnos.dev` | `Demo@12345` |
| Employee | `employee@savhnos.dev` | `Demo@12345` |
| Client | `client@savhnos.dev` | `Demo@12345` |

The seed is idempotent — re-run `npm run prisma:seed` any time (e.g. right
before a live demo) to wipe and rebuild the demo company with fresh "today"
attendance timestamps. It never touches other companies in the database.

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

### Built

- **Multi-company / multi-tenant core** — every table is scoped by
  `companyId`; a company can have branches, its own users, employees,
  clients, projects, invoices, documents.
- **Auth + RBAC** — [Auth.js](https://authjs.dev) v5 with the Credentials
  provider and JWT sessions. `POST /api/auth/register` creates a company and
  its OWNER; sign-in happens through Auth.js itself. A `withAuth()` wrapper
  around Route Handlers enforces per-route role lists across all 12 roles
  (OWNER, SUPER_ADMIN, HR, ARCHITECT, SITE_ENGINEER, DRAFTING_ENGINEER,
  INTERIOR_DESIGNER, PROJECT_ENGINEER, ACCOUNTANT, QC_ENGINEER, CLIENT,
  EMPLOYEE). `middleware.ts` gates page access at the edge using a
  bcrypt-free split Auth.js config (see Architecture below).
- **HRMS core** — employee profiles linked 1:1 to a user account, branches,
  designations, leave requests.
- **Projects + soft geofencing** — creating a project can set a
  latitude/longitude/radius geofence. `radiusMeters` is the hard zone,
  `softToleranceMeters` extends it (e.g. 150m + 100m soft tolerance).
  Employees are assigned to projects via `ProjectAssignment`.
- **Geofenced attendance** — `POST /api/attendance/clock-in` takes the
  employee's lat/lng, computes the great-circle (haversine) distance to the
  project's geofence, and rejects the clock-in with a 403 (distance +
  allowed radius reported) if they're outside `radius + softTolerance`.
  Admins can force an entry via `POST /api/attendance/override/:employeeId`.
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
- **Web app** — Next.js 15 (App Router, React 19) + Tailwind, with working
  register/login, a stat-card dashboard, and CRUD-ish pages for projects
  (incl. geofence fields), employees, clients, drawings, and an attendance
  page that uses the browser's Geolocation API to actually clock in/out.
- **Premium design system + app shell** — see "Frontend design system"
  below: collapsible sidebar, Ctrl+K command palette, real charts, a proper
  data table, dark mode, and a flagship project detail page.

### Explicitly not built (roadmap)

Everything else in the original brief is roadmap, not implemented:
AI assistant/insights, live GPS map + playback mode, anti-fake-GPS/mock
location detection, photo/video verification and AI progress comparison,
BOQ/RFI/submittals, accounting depth (GST/TDS, bank reconciliation,
cost centers), procurement/inventory/equipment tracking, document OCR,
company chat/video calls, WhatsApp/Teams/Slack notifications, the Flutter
mobile app, SSO/MFA/biometric login, and BIM/drone/AR/IoT integrations.
The schema and module structure are built so these can be added as new
route handlers + Prisma models without restructuring what's here.

## Frontend design system

The web app is a proper enterprise SaaS product (Linear/Vercel/
Stripe-Dashboard register), not a themed admin template.

**Design tokens** (`tailwind.config.ts`, `app/globals.css`): HSL CSS
variables for `background`/`foreground`/`card`/`border`/`primary`/
`success`/`warning`/`danger`/`info`, switched by `next-themes` via a `.dark`
class — light and dark are both first-class, dark uses a charcoal palette
(`hsl(222 18% 9%)`), never pure black. Inter via `next/font`, 14–18px radius
scale, soft/card/popover shadow tokens.

**Component library** (`components/ui`): Button, Card, Badge, Avatar
(deterministic color + initials), Input/Textarea/NativeSelect, Skeleton
(+ SkeletonCard/SkeletonTable), EmptyState, Tabs/Dialog/DropdownMenu/Tooltip
(Radix primitives, styled), StatCard (animated count-up, sparkline, trend
arrow, recharts), and a generic `DataTable` (TanStack Table: sorting, global
search, column visibility, pagination).

**App shell** (`components/app-shell`): collapsible/animated sidebar
(Framer Motion) with grouped nav, active-route indicator, live badge counts
(pending drawing reviews), pinned favorites + recently-visited
(localStorage-backed, real), and a footer showing live API online/offline
status. Top nav has workspace switcher, global search that opens a Ctrl+K
**command palette** (`cmdk`) searching pages plus live projects/employees/
clients, a notifications dropdown driven by real pending counts,
quick-create menu, theme toggle, and an avatar menu.

**Rebuilt pages, all hitting the same endpoints**: Dashboard (real KPIs +
recharts donut/bar from live project/employee data, a "who's working today"
widget that gracefully degrades to a personal view for non-privileged
roles since `/api/attendance/today` is RBAC-gated), Projects (list +
flagship `/projects/[id]` detail page with header facts, tabs, geofence/
assign dialogs), Employees (card grid ⇄ table toggle, detail drawer),
Clients (drag-and-drop pipeline kanban, native HTML5 DnD, PATCHes the real
stage), Drawings (grid/list, discipline filters, upload/approve/reject),
Attendance (live roster + history table), and an **Approvals** inbox that
aggregates pending drawing reviews across every project client-side.

**Honesty over decoration**: nav sections with no backing feature yet
(Finance depth, HRMS payroll/recruitment, Procurement, Inventory,
Documents, Reports, AI Assistant) render a shared `ComingSoon` component
that states plainly what's needed to build them, rather than showing
fabricated charts or numbers. They're marked "Soon" in the sidebar.

## Architecture

```
app/           Next.js App Router — pages + API route handlers (app/api/**)
components/    Shared UI primitives + app shell (design system)
modules/       Feature modules (crm, projects, employees, attendance, …) —
               each with components/actions/types/hooks/validators/server
hooks/         Shared client-side hooks
lib/           Shared utilities — Prisma client, enums, geo math, API fetch
server/        Business logic — auth, services, validators, permissions
prisma/        schema.prisma, migrations, seed.ts
types/         Ambient type declarations (Auth.js session augmentation)
public/        Static assets
auth.ts        Auth.js config (Credentials provider, JWT session, callbacks)
auth.config.ts Edge-safe subset of the Auth.js config, used by middleware.ts
middleware.ts  Page-level route protection (redirects unauthenticated users)
```

- **Full stack**: Next.js 15 App Router + React 19 + TypeScript, Server
  Actions and Route Handlers instead of a separate REST API service.
- **Auth**: Auth.js v5, Credentials provider, JWT sessions (no database
  adapter). `auth.ts` holds the full config including the bcrypt-based
  Credentials provider; `auth.config.ts` holds only the edge-safe pieces
  (session strategy, pages) so `middleware.ts` never bundles `bcryptjs` into
  the Edge runtime.
- **Database**: Prisma ORM + PostgreSQL (Neon in production). Enums are
  generated from `schema.prisma` and re-exported from `lib/enums.ts` as the
  single source of truth — nothing is hand-duplicated.
- **API layer**: `server/permissions/with-auth.ts` wraps every Route
  Handler with session + role-list enforcement and `ApiError` → JSON
  mapping; `server/validators/parse-body.ts` validates request bodies
  against Zod schemas defined per module under `modules/*/validators`.
- **Frontend data**: plain `fetch` via `lib/api.ts` against same-origin
  `/api/*` routes (the Auth.js session cookie rides along automatically —
  no bearer tokens), Radix UI + `cva` for component primitives, TanStack
  Table for data grids, recharts for charts, Framer Motion for animation,
  `cmdk` for the command palette, `next-themes` for dark mode, `sonner` for
  toasts.
- **Multi-tenancy**: every query is scoped by `companyId` taken from the
  Auth.js session, not from client-supplied input.

## Local development

Requires Node 18+ and a PostgreSQL instance (use the provided
`docker-compose.yml` for local dev only, or point `DATABASE_URL` at any
Postgres — Neon works too).

```bash
npm install
cp .env.example .env       # fill in DATABASE_URL, AUTH_SECRET, AUTH_URL

npx prisma migrate deploy  # creates tables
npm run prisma:seed        # demo company + 12 role logins + sample data

npm run dev                # http://localhost:3000
```

Generate `AUTH_SECRET` with `openssl rand -base64 32`.

### Deployment (Vercel)

Push to a branch connected to a Vercel project. `npm install` runs
`prisma generate` via `postinstall`; set `DATABASE_URL`, `AUTH_SECRET` and
`AUTH_URL` (your production URL) as Vercel environment variables, then run
`npx prisma migrate deploy` against the production database once (Vercel
Postgres/Neon integration can automate this). No separate backend
deployment, no Docker, no build-step configuration beyond the defaults.

## Known follow-ups

- `npm audit` currently reports advisories in transitive dependencies —
  worth a deliberate upgrade pass with its own testing, not bundled into
  this one.
- The employee/user invite flow takes a password directly from the admin
  UI; a real deployment should replace this with an email invite + set-password
  link instead.
- No automated test suite yet (unit or e2e) — the modules above were
  verified with a live Postgres instance, manual API calls, and headless
  browser smoke tests, but there's no regression safety net checked in.
- `recharts@2.x` is in maintenance mode (v3 is current); worth a deliberate
  upgrade + re-test of the dashboard charts rather than bundling into a
  larger change.
- The Approvals page does an N+1 fetch (one `/api/drawings?projectId=` call
  per project) to aggregate pending reviews — fine at seed-data scale,
  worth a dedicated "pending approvals" endpoint if the project count grows
  large.
