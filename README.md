# APT-PA: Assignment Progression Tracker with Predictive Alert

A full-stack web application for Moshood Abiola Polytechnic (MAPOLY), Computer Science Department — Final Year/ND Project.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Database | Neon (Serverless Postgres) |
| ORM | Drizzle ORM |
| Auth | Custom JWT (jose) + bcrypt |
| Styling | Tailwind CSS |
| File Storage | Vercel Blob |
| Notifications | Resend (Email) + In-app polling |
| Charts | Recharts |
| Data Fetching | SWR with polling |
| Deployment | Vercel |

## Features

- **Role-based Auth**: Students, Lecturers, Administrators with JWT httpOnly cookies
- **Assignment Management**: Create, view, track assignments per course
- **Progress Tracking**: Students update % completion; Lecturers view real-time dashboards
- **Predictive Alert Engine**: Rule-based risk scoring with daily cron job
- **Notifications**: In-app notification center with polling + email alerts
- **Reports**: CSV export of completion rates, late submissions, per-course breakdowns
- **Admin Module**: User management, course CRUD, system-wide analytics

## Prerequisites

- Node.js 18+
- A Neon Postgres database ([sign up free](https://neon.tech))
- A Vercel account (for deployment and Blob storage)
- (Optional) A Resend API key for email notifications

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repo-url> apt-pa
cd apt-pa
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `JWT_SECRET` | Random string for JWT signing (`openssl rand -base64 32`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (optional for local dev) |
| `RESEND_API_KEY` | Resend API key (optional for local dev) |
| `CRON_SECRET` | Secret to protect cron endpoints |
| `NEXT_PUBLIC_APP_URL` | App URL (http://localhost:3000 for dev) |

### 3. Database Setup

Generate and push the Drizzle schema to Neon:

```bash
npm run db:generate
npm run db:push
```

Seed the database with demo data:

```bash
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@mapoly.edu.ng | password123 |
| Lecturer 1 | adebayo.ogunleye@mapoly.edu.ng | password123 |
| Lecturer 2 | chinedu.okonkwo@mapoly.edu.ng | password123 |
| Student 1 | ibrahim.olayiwola@mapoly.edu.ng | password123 |

(8 students total — see `src/db/seed.ts` for all emails)

## Architecture

### Three-Tier Architecture (per ND Project Proposal)

1. **Presentation Layer** — Next.js pages/components (responsive, mobile-first UI)
2. **Application Layer** — Next.js Server Actions / API routes with modules:
   - Authentication (JWT issuance, verification, refresh)
   - Assignment Management
   - Progress Tracking
   - Predictive Alert Engine
   - Notification System
   - Reports
3. **Database Layer** — Neon Postgres (via Drizzle ORM):
   - `users`, `courses`, `assignments`, `progress`, `alerts`, `notifications`, `submissions`

### Authorization Model

Since Neon has no Row-Level Security like Supabase, all authorization is enforced in application code:

- **Server Middleware**: `middleware.ts` verifies JWT, attaches user info to request headers
- **API Routes**: Every handler extracts the authenticated user and checks role/permissions
- **Students**: Queries scoped to `WHERE student_id = currentUser.id`
- **Lecturers**: Queries scoped to `WHERE lecturer_id = currentUser.id`
- **Admins**: Unrestricted but still authenticated

### Predictive Alert Engine

A rule-based risk scoring model (no ML required for ND level):

```
risk_score = f(time_remaining, progress, historical_rate, weight)
```

- If progress lags significantly behind expected pace → flagged "at risk"
- Runs daily via Vercel Cron Job (`GET /api/cron/predictive-alerts`)
- Results stored in `alerts` table; notifications created for at-risk students

## Key Routes

| Path | Access | Description |
|------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Sign in |
| `/register` | Public | Create account |
| `/student/dashboard` | Student | Assignment list with risk indicators |
| `/student/assignments/[id]` | Student | Progress update & submission |
| `/lecturer/dashboard` | Lecturer | Course overview & stats |
| `/lecturer/assignments/create` | Lecturer | New assignment form |
| `/lecturer/assignments/[id]/progress` | Lecturer | Student progress table |
| `/lecturer/reports` | Lecturer | Reports & CSV export |
| `/admin/dashboard` | Admin | Analytics with charts |
| `/admin/users` | Admin | User management |
| `/admin/courses` | Admin | Course CRUD |
| `/notifications` | All | Notification center |

## PWA (Progressive Web App)

APT-PA is a fully installable PWA:

- **Offline support**: Service worker caches static assets and serves a fallback for API calls when offline
- **Install prompt**: Chrome/Edge will prompt to install the app (or use the browser's "Install" menu)
- **Fullscreen experience**: Runs in standalone mode like a native app when installed

### PWA Setup (no additional config needed)

The manifest, service worker (`/sw.js`), and app icons are already in the `public/` directory. The root layout includes the manifest link and theme-color meta tag. The `PwaSetup` component registers the service worker on load.

## Browser Push Notifications

APT-PA supports two layers of browser notifications:

1. **Foreground notifications** (tab open) — `PushNotificationSync` component polls for new notifications every 30s and displays them via the Service Worker `showNotification` API
2. **Background/push notifications** (tab closed or mobile) — Web Push API via `web-push` library, triggered from the predictive alert cron job and other notification events

### Setup Push Notifications

Push notifications require VAPID keys. Generate them:

```bash
npx web-push generate-vapid-keys
```

Add the keys to your `.env`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BG...
VAPID_PRIVATE_KEY=...
```

When a user logs in, the "Enable Notifications" button appears in the bottom-right corner. Clicking it requests permission and subscribes the device for push notifications.

### How It Works

1. Service worker (`/sw.js`) handles `push` events and shows notifications
2. `PwaSetup` component registers the SW and subscribes via the Push API
3. Subscription is stored in the `push_subscriptions` table
4. The cron job (`/api/cron/predictive-alerts`) and notification creation endpoints send push notifications to subscribed users
5. `PushNotificationSync` component uses polling to show notifications instantly when the app is open

## Vercel Deployment

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. Configure Vercel Blob storage
5. Set up cron job in Vercel dashboard (or use `vercel.json`)

For the predictive alert cron job, Vercel will call `https://your-app.vercel.app/api/cron/predictive-alerts` daily with the `Authorization: Bearer <CRON_SECRET>` header.

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register pages
│   ├── admin/           # Admin dashboard, user/course management
│   ├── student/         # Student dashboard, assignment detail
│   ├── lecturer/        # Lecturer dashboard, create assignment, progress, reports
│   ├── notifications/   # Notification center
│   └── api/             # API routes (auth, assignments, progress, alerts, etc.)
├── components/          # Shared components (Navbar)
├── db/                  # Drizzle schema, connection, seed
├── lib/                 # Auth utilities, db helpers
└── middleware.ts        # JWT verification & route protection
```

## License

MIT — Academic Project, Computer Science Department, MAPOLY.
