// ── Auth Callback Route ───────────────────────────────────────────────────
// Handles Google OAuth code exchange and email confirmation links.

import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type')
  const next       = searchParams.get('next') ?? '/waiter'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } }
  )

  // ── Google OAuth code exchange ─────────────────────────────────────────
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Create staff_members record for Google signups
      try {
        await fetch(`${origin}/api/staff/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            display_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
            phone_number: data.user.phone || data.user.email,
            preferred_locations: [],
            latitude: data.user.user_metadata?.latitude || null,
            longitude: data.user.user_metadata?.longitude || null,
          }),
        })
      } catch (err) {
        console.error('[auth/callback] Failed to create staff_members record:', err)
        // Don't block signup on this error
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[auth/callback] code exchange error:', error.message)
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`)
  }

  // ── Email confirmation / password reset ────────────────────────────────
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'recovery',
    })
    if (!error) {
      const destination = type === 'recovery' ? '/auth/reset-password' : next
      return NextResponse.redirect(`${origin}${destination}`)
    }
    console.error('[auth/callback] OTP verify error:', error.message)
    return NextResponse.redirect(`${origin}/auth/login?error=link_expired`)
  }

  return NextResponse.redirect(`${origin}/auth/login?error=unknown_callback`)
}
