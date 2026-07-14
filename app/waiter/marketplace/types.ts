export interface CrewResult {
  id: string
  display_name: string
  face_photo_url?: string
  face_thumbnail_url?: string
  preferred_roles: string[]
  preferred_locations: string[]
  performance_score: number
  total_shifts_completed: number
  total_likes: number
  total_approved_orders: number
  total_tips_received: number
  rating?: number
  bio?: string
  phone_number?: string
}

export interface HireRequest {
  id: string
  crew_member_id: string
  bar_id: string
  role: string
  shift_date: string
  shift_start: string
  shift_end: string
  pay_amount: number
  message?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
}

export interface ShiftPosting {
  id: string
  bar_id: string
  role: string
  shift_date: string
  shift_start: string
  shift_end: string
  pay_per_shift: number
  slots_available: number
  preferred_performance_tier?: 'standard' | 'silver' | 'gold'
  status: 'open' | 'filled' | 'cancelled'
  created_at: string
}

export interface HireOffer {
  id: string
  crew_member_id: string
  bar_id: string
  bar_name: string
  role: string
  shift_date: string
  shift_start: string
  shift_end: string
  pay_amount: number
  message?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  expires_at: string
  created_at: string
}

export interface ShiftApplication {
  id: string
  posting_id: string
  crew_member_id: string
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn'
  applied_at: string
  responded_at?: string
  resulting_shift_id?: string
  crew_member: {
    id: string
    display_name: string
    phone_number: string
    performance_score: number
    total_shifts_completed: number
    total_approved_orders: number
    total_tips_received: number
    total_likes: number
  }
  posting: {
    id: string
    role: string
    shift_date: string
    shift_start: string
    shift_end: string
    pay_per_shift: number
  }
}