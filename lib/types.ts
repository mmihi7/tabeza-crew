// ─── Shared types used across all UI screens ─────────────────────────────────
// These match the database schema in the implementation strategy.
// Replace with real Supabase types after backend is wired.

export type BadgeTier = 'standard' | 'silver' | 'gold'
export type ShiftStatus = 'scheduled' | 'active' | 'ending_soon' | 'ended'
export type HireRequestStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type ApplicationStatus = 'pending' | 'accepted' | 'declined'
export type PhotoType = 'face' | 'half_body' | 'full_body'
export type AvailabilityType = 'available' | 'unavailable' | 'tentative'
export type CredentialType = 'diploma' | 'degree' | 'certificate' | 'license' | 'training' | 'other'

export interface StaffMember {
  id: string
  displayName: string
  phoneNumber: string
  bio: string
  badgeTier: BadgeTier
  performanceScore: number
  totalShifts: number
  totalApprovedOrders: number
  approvalRate: number
  totalTipsEarned: number
  totalLikes: number
  totalPoints: number
  marketplaceVisible: boolean
  facePhotoUrl?: string
  halfBodyPhotoUrl?: string
  fullBodyPhotoUrl?: string
}

export interface Shift {
  id: string
  barName: string
  barId: string
  role: string
  shiftStart: string
  shiftEnd: string
  status: ShiftStatus
  checkedInAt?: string
  payAmount?: number
}

export interface AssignedTab {
  id: string
  tableNumber: number
  customerName: string
  currentBalance: number
  roundCount: number
  hasPendingOrder: boolean
  hasTip: boolean
}

export interface ShiftPosting {
  id: string
  barName: string
  barRating: number
  role: string
  shiftDate: string
  shiftStart: string
  shiftEnd: string
  payPerShift: number
  slotsAvailable: number
  preferredTier?: BadgeTier
  location: string
  lat?: number     // venue latitude  — from bars.latitude
  lng?: number     // venue longitude — from bars.longitude
}

export interface HireRequest {
  id: string
  barName: string
  managerName: string
  managerFaceUrl?: string
  role: string
  shiftDate: string
  shiftStart: string
  shiftEnd: string
  payAmount: number
  message?: string
  status: HireRequestStatus
  expiresAt: string
}

export interface ShiftHistory {
  id: string
  barName: string
  date: string
  startTime: string
  endTime: string
  durationHours: number
  ordersApproved: number
  tipsEarned: number
  rating: number
  reviewCount: number
}

export interface TipRecord {
  id: string
  amount: number
  fromName: string
  tableNumber: number
  barName: string
  date: string
  mpesaCode: string
}

export interface OrderRecord {
  id: string
  items: string
  tableNumber: number
  status: 'approved' | 'declined'
  amount: number
  points: number
  timestamp: string
}

export interface AvailabilitySlot {
  dayOfWeek: number
  availableFrom: string
  availableUntil: string
  availabilityType: AvailabilityType
}

export interface Credential {
  id: string
  type: CredentialType
  title: string           // e.g. "Diploma in Food & Beverage Service"
  institution: string     // e.g. "Kenya Utalii College"
  yearObtained: string    // e.g. "2022"
  isVerified: boolean     // true once Tabeza admin reviews the document
  documentUrl?: string    // Supabase Storage URL of scanned copy
}

export interface Skill {
  id: string
  name: string            // e.g. "Wine Service", "Mixology", "Swahili"
  level: 'beginner' | 'intermediate' | 'expert'
  category: 'service' | 'beverage' | 'food' | 'language' | 'other'
}

export interface Notification {
  id: string
  type: string
  notificationType: string
  title: string
  body: string
  priority: 'urgent' | 'high' | 'normal' | 'low'
  readAt?: string
  actionUrl?: string
  createdAt: string
}

export interface NearbyVenue {
  id: string
  name: string
  location: string
  rating: number
  reviewCount: number
  openSlots: number
  slotRole?: string
  slotPay?: number
  slotDate?: string
  slotStart?: string
  slotEnd?: string
  distance?: string
  isRecentlyWorked?: boolean
}

