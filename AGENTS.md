# Tabeza Crew – Waiter PWA Guide

## Project Overview

Tabeza Crew is a Progressive Web App (PWA) for hospitality staff — waiters, bartenders, captains — working at venues on the Tabeza network. It provides staff with tools to manage shifts, accept job offers, track earnings, and maintain their professional profile. No app store install required; staff open the browser, scan or type the URL, and tap "Add to Home Screen".

**Role in Tabeza Ecosystem**: Crew app is the staff-facing interface for individual hospitality workers, working alongside Tabeza Staff (venue operations) and Tabeza Customer (guest experience). All three apps share the same Supabase database.

**Dev server**: `pnpm dev` → http://localhost:3004  
**Production**: https://crew.tabeza.co.ke  
**Deployment**: Vercel

---

## Current State

The project is now fully integrated with Supabase. All screens use real API calls to the backend:
- Authentication via Supabase Auth
- Staff profile data via `/api/staff/profile`
- Shift management via `/api/shifts`
- Job marketplace via `/api/jobs`
- Shift history via `/api/history`
- Notifications via `/api/notifications`

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (utility classes + CSS custom properties for theming)
- **lucide-react** (icons)
- **Supabase** (auth, database, realtime, storage)

---

## Key Pages & Routes

| Route | Purpose |
|-------|---------|
| `/` | Redirects to `/waiter` |
| `/auth/login` | Sign in |
| `/auth/signup` | 3-step account creation |
| `/install` | Add-to-homescreen guide |
| `/waiter` | Home — shift dashboard (active tables, stats, checkout) |
| `/waiter/jobs` | Jobs — hire requests + open shift postings |
| `/waiter/history` | History — shifts / tips / orders sub-tabs |
| `/waiter/me` | Me — profile, stats, badge tier |
| `/waiter/me/photos` | Photo management (face / half-body / full-body) |
| `/waiter/me/availability` | Weekly availability calendar + date overrides |
| `/waiter/me/privacy` | Marketplace visibility + location preferences |

---

## Data Model

### Staff Member Profile
- **Badge Tier**: `standard` | `silver` | `gold` — based on performance and experience
- **Performance Score**: 0-5 rating from venue managers
- **Stats**: Total shifts, approved orders, approval rate, tips earned, likes, points
- **Marketplace Visibility**: Toggle for appearing in job marketplace
- **Photos**: Face, half-body, full-body photos for profile verification

### Shift Management
- **Shift Status**: `scheduled` | `active` | `ending_soon` | `ended`
- **Assigned Tabs**: Tables staff member is currently serving
- **Check-in/out**: Timestamp tracking for shift duration

### Job Marketplace
- **Shift Postings**: Open shifts posted by venues (role, pay, location, time)
- **Hire Requests**: Direct invitations from venue managers with expiry
- **Applications**: Staff can apply to open shift postings
- **Location-based**: Nearby venues shown when off-shift

### History & Earnings
- **Shift History**: Past shifts with ratings, orders, tips
- **Tip Records**: Individual tips with M-Pesa codes
- **Order Records**: Orders approved/declined with points earned

### Availability
- **Weekly Schedule**: Set availability by day and time
- **Date Overrides**: Override availability for specific dates
- **Availability Types**: `available` | `unavailable` | `tentative`

---

## Architecture

### Theme System
The staff app uses **light mode** by default — differentiated from the dark-mode customer and venue apps, while sharing the same amber accent colour (`#f59e0b`) for ecosystem consistency.

All colours are CSS custom properties defined in `app/globals.css`. Never hardcode hex values in components — always use `var(--token-name)`.

```css
/* Key tokens */
--background-primary:   #f8f7f4;
--background-secondary: #ffffff;
--text-primary:         #1a1a2e;
--amber:                #f59e0b;   /* primary actions */
--amber-dark:           #d97706;   /* hover */
--success:              #10b981;
--error:                #ef4444;
```

### File Structure
```
tabeza-crew/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── install/page.tsx
│   ├── waiter/
│   │   ├── layout.tsx           ← Bottom tab nav wrapper
│   │   ├── page.tsx             ← Home tab
│   │   ├── jobs/page.tsx        ← Jobs tab
│   │   ├── history/page.tsx     ← History tab
│   │   └── me/
│   │       ├── page.tsx         ← Me tab
│   │       ├── photos/page.tsx
│   │       ├── availability/page.tsx
│   │       └── privacy/page.tsx
│   ├── globals.css              ← Theme tokens + utility classes
│   └── layout.tsx               ← Root layout + PWA metadata
├── components/
│   ├── home/
│   │   ├── TableCard.tsx
│   │   └── CheckoutModal.tsx
│   ├── history/
│   │   ├── ShiftHistoryList.tsx
│   │   ├── TipHistoryList.tsx
│   │   └── OrderHistoryList.tsx
│   ├── jobs/
│   │   ├── HireRequestCard.tsx
│   │   ├── JobPostingCard.tsx
│   │   ├── AcceptShiftModal.tsx
│   │   ├── DeclineShiftModal.tsx
│   │   └── ApplyConfirmModal.tsx
│   ├── layout/
│   │   └── BottomTabNav.tsx
│   └── shared/
│       ├── FaceBubble.tsx       ← Cross-app staff avatar component
│       ├── PageHeader.tsx
│       ├── SectionHeading.tsx
│       └── StatCard.tsx
├── lib/
│   ├── mock-data.ts             ← Static data + helpers
│   └── types.ts                 ← TypeScript interfaces
└── public/
    ├── manifest.json            ← PWA manifest
    └── icons/                   ← Add icon-192.png + icon-512.png here
```

---

## Database Tables (When Backend is Wired)

The app will connect to the same Supabase project as Tabeza Staff and Tabeza Customer. Key tables include:

### Staff Tables
- `staff_members` — Staff profiles, badge tiers, performance scores
- `staff_shifts` — Shift assignments and status
- `staff_tips` — Tip records with M-Pesa codes
- `staff_availability` — Weekly availability schedules
- `staff_photos` — Profile photos (face, half-body, full-body)
- `staff_credentials` — Certifications and qualifications
- `staff_skills` — Skills and proficiency levels

### Marketplace Tables
- `shift_postings` — Open shifts posted by venues
- `hire_requests` — Direct invitations from managers
- `shift_applications` — Staff applications to postings

### Shared Tables (with other apps)
- `bars` — Venue information
- `tab_orders` — Orders (staff can approve/decline)
- `staff_performance_events` — Performance tracking

---

## Development Guidelines

### Mock Data Usage
Currently all screens use mock data from `lib/mock-data.ts`. When wiring backend:
1. Replace mock imports with Supabase client calls
2. Replace `alert()` calls with real API routes
3. Connect Supabase Auth to the login/signup flows

### Component Development
- Use CSS custom properties for all colors (never hardcode hex values)
- Follow the existing component structure in `components/`
- Use `lucide-react` for icons (already installed)
- Maintain the light mode theme aesthetic

### Type Safety
All types are defined in `lib/types.ts`. These match the database schema in the implementation strategy. When Supabase is wired, replace these with generated Supabase types.

### PWA Considerations
- The app is designed as a PWA with Add to Home Screen flow
- Icons are required for proper PWA install experience
- Offline support should be considered when backend is wired

---

## Environment Variables

When backend is wired, add these to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
```

For Vercel deployment, add these in Vercel → Settings → Environment Variables.

---

## Deployment

### Push to GitHub
```bash
cd /path/to/tabeza-crew
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_ORG/tabeza-crew.git
git push -u origin main
```

### Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `tabeza-crew` GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Click **Deploy**

### Add Custom Domain
1. In Vercel project → **Settings → Domains**
2. Add `crew.tabeza.co.ke`
3. In your DNS provider, add:
   ```
   Type: CNAME
   Name: crew
   Value: cns1.vercel-dns.com
   ```
4. Vercel auto-provisions SSL — done.

---

## Related Projects

| Project | Repo | URL |
|---------|------|-----|
| Customer app | `tabeza-customer` | app.tabeza.co.ke |
| Venue staff app | `tabeza-staff` | tabeza.co.ke |
| **Waiter PWA** | **`tabeza-crew`** | **crew.tabeza.co.ke** |

All three connect to the same Supabase project. See `tabeza-technical-documents/Staff_Layer_Implementation_Strategy.md` for the full backend spec.

---

## Icons Required

Vercel will deploy without icons (they'll show as broken in the manifest), but for a proper PWA install experience add these files before launch:

- `public/icons/icon-192.png` — 192×192px, amber background, fork/dish icon
- `public/icons/icon-512.png` — 512×512px, same design

---

*Built with ❤️ in Nairobi, Kenya.*
