// ── Auth Callback Route ───────────────────────────────────────────────────
// Handles:
//   1. Google OAuth redirect (code exchange)
//   2. Email confirmation links (token_hash + type=signup)
//   3. Password reset links (type=recovery)
//
// Supabase redirects the user here after Google OAuth consent or email click.
// We exchange the code/token for a session and redirect to the app.

import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const code       = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type')
  const next       = searchParams.get('next') ?? '/waiter'

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll()        { return cookieStore.getAll() },
        setAll(list)    { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )

  // ── Google OAuth code exchange ─────────────────────────────────────────
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[auth/callback] code exchange error:', error.message)
    return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`)
  }

  // ── Email confirmation / password reset ────────────────────────────────
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as 'signup' | 'recovery' })
    if (!error) {
      const destination = type === 'recovery' ? '/auth/reset-password' : next
      return NextResponse.redirect(`${origin}${destination}`)
    }
    console.error('[auth/callback] OTP verify error:', error.message)
    return NextResponse.redirect(`${origin}/auth/login?error=link_expired`)
  }

  // Unknown callback — send to login
  return NextResponse.redirect(`${origin}/auth/login?error=unknown_callback`)
}
