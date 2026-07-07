# Tabeza Crew

The waiter PWA for the Tabeza hospitality platform.

**Production**: https://crew.tabeza.co.ke  
**Dev server**: `pnpm dev` → http://localhost:3004

---

## What This Is

A Progressive Web App (PWA) for hospitality staff — waiters, bartenders, captains — working at venues on the Tabeza network. No app store install required; staff open the browser, scan or type the URL, and tap "Add to Home Screen".

### Screens

| Route | Screen |
|-------|--------|
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

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (utility classes + CSS custom properties for theming)
- **lucide-react** (icons)
- **Supabase** (to be wired — auth, database, realtime, storage)

---

## Getting Started

```bash
# Install dependencies
pnpm install      # or: npm install

# Start dev server
pnpm dev          # runs on http://localhost:3004

# Build for production
pnpm build

# Start production server
pnpm start
```

---

## Theme

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

---

## Backend Integration

The project is fully integrated with Supabase. All screens use real API calls:
- Authentication via Supabase Auth
- Staff profile data via `/api/staff/profile`
- Shift management via `/api/shifts`
- Job marketplace via `/api/jobs`
- Shift history via `/api/history`
- Notifications via `/api/notifications`

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
cd /path/to/tabeza-crew
git init
git add .
git commit -m "Initial boilerplate"
git remote add origin https://github.com/YOUR_ORG/tabeza-crew.git
git push -u origin main
```

### 2. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `tabeza-crew` GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Click **Deploy**

### 3. Add Custom Domain

1. In Vercel project → **Settings → Domains**
2. Add `crew.tabeza.co.ke`
3. In your DNS provider (Cloudflare / GoDaddy / etc.), add:
   ```
   Type: CNAME
   Name: crew
   Value: cns1.vercel-dns.com
   ```
4. Vercel auto-provisions SSL — done.

### 4. Environment Variables (when backend is wired)

In Vercel → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
```

---

## File Structure

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

## Icons Required

Vercel will deploy without icons (they'll show as broken in the manifest), but for a proper PWA install experience add these files before launch:

- `public/icons/icon-192.png` — 192×192px, amber background, fork/dish icon
- `public/icons/icon-512.png` — 512×512px, same design

---

## Related Projects

| Project | Repo | URL |
|---------|------|-----|
| Customer app | `tabeza-customer` | app.tabeza.co.ke |
| Venue staff app | `tabeza-staff` | tabeza.co.ke |
| **Waiter PWA** | **`tabeza-crew`** | **crew.tabeza.co.ke** |

All three connect to the same Supabase project. See `tabeza-technical-documents/Staff_Layer_Implementation_Strategy.md` for the full backend spec.

---

*Built with ❤️ in Nairobi, Kenya.*
