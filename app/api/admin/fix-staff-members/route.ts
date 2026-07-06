import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase'

/**
 * POST /api/admin/fix-staff-members
 * 
 * Admin utility to check and create staff_members records for existing users.
 * Body: { user_ids: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const db = createServiceRoleClient()
    const { user_ids } = await request.json()

    if (!user_ids || !Array.isArray(user_ids)) {
      return NextResponse.json({ error: 'user_ids array required' }, { status: 400 })
    }

    const results = []

    for (const userId of user_ids) {
      const result: any = { user_id: userId }

      // Check if user exists in auth.users
      const { data: user, error: userError } = await db.auth.admin.getUserById(userId)
      
      if (userError || !user) {
        result.status = 'user_not_found'
        result.error = userError?.message || 'User not found'
        results.push(result)
        continue
      }

      result.email = user.email
      result.metadata = user.user_metadata

      // Check if staff_members record exists
      const { data: staffMember, error: staffError } = await db
        .from('staff_members')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (staffError) {
        result.status = 'error'
        result.error = staffError.message
        results.push(result)
        continue
      }

      if (staffMember) {
        result.status = 'exists'
        result.staff_member = {
          id: staffMember.id,
          display_name: staffMember.display_name,
          phone_number: staffMember.phone_number,
          onboarding_status: staffMember.onboarding_status,
        }
      } else {
        // Create staff_members record
        const { data: newStaff, error: createError } = await db
          .from('staff_members')
          .insert({
            user_id: userId,
            display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
            phone_number: user.phone || user.email,
            preferred_locations: user.user_metadata?.area ? [user.user_metadata.area] : [],
            latitude: user.user_metadata?.latitude || null,
            longitude: user.user_metadata?.longitude || null,
            onboarding_status: 'pending',
          })
          .select()
          .single()

        if (createError) {
          result.status = 'create_failed'
          result.error = createError.message
        } else {
          result.status = 'created'
          result.staff_member = {
            id: newStaff.id,
            display_name: newStaff.display_name,
            phone_number: newStaff.phone_number,
          }
        }
      }

      results.push(result)
    }

    return NextResponse.json({ results })

  } catch (err: any) {
    console.error('[fix-staff-members] error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
