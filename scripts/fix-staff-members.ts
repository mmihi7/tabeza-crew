/**
 * Utility script to check and create staff_members records for existing users
 * Run with: npx tsx scripts/fix-staff-members.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY!

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const USER_IDS = [
  '7952b427-293f-4698-9899-64648af051c6',
  '7ed6cc0b-2ff0-4a58-b00d-2704be240585'
]

async function fixStaffMembers() {
  console.log('🔍 Checking staff_members for users...\n')

  for (const userId of USER_IDS) {
    console.log(`\n--- User: ${userId} ---`)

    // Check if user exists in auth.users
    const { data: authData, error: userError } = await supabase.auth.admin.getUserById(userId)
    
    if (userError || !authData?.user) {
      console.log(`❌ User not found in auth.users: ${userError?.message}`)
      continue
    }

    const user = authData.user
    console.log(`✅ User found: ${user.email}`)
    console.log(`   Metadata:`, user.user_metadata)

    // Check if staff_members record exists
    const { data: staffMember, error: staffError } = await supabase
      .from('staff_members')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (staffError) {
      console.log(`❌ Error checking staff_members: ${staffError.message}`)
      continue
    }

    if (staffMember) {
      console.log(`✅ staff_members record exists:`, {
        id: staffMember.id,
        display_name: staffMember.display_name,
        phone_number: staffMember.phone_number,
        onboarding_status: staffMember.onboarding_status,
      })
    } else {
      console.log(`⚠️  No staff_members record found. Creating one...`)

      // Create staff_members record
      const { data: newStaff, error: createError } = await supabase
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
        console.log(`❌ Failed to create staff_members: ${createError.message}`)
      } else {
        console.log(`✅ Created staff_members record:`, {
          id: newStaff.id,
          display_name: newStaff.display_name,
          phone_number: newStaff.phone_number,
        })
      }
    }
  }

  console.log('\n✨ Done!')
}

fixStaffMembers().catch(console.error)
