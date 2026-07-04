// ── Supabase clients for tabeza-crew ─────────────────────────────────────────
// Two clients:
//   createBrowserClient() — used in 'use client' components and hooks
//   createServerClient()  — used in Server Components, Route Handlers, middleware
//
// Uses @supabase/ssr which correctly handles cookie-based sessions for
// Next.js App Router (avoids the localStorage-only issue with the bare client).

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    'Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and ' +
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local'
  )
}

// ── Browser client (singleton) ────────────────────────────────────────────
// Safe to call multiple times — @supabase/ssr returns the same instance.
export function createBrowserClient() {
  return _createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}

// ── App URL helper ────────────────────────────────────────────────────────
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3004'
}
