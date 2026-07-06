// ─── Mock data for UI development ────────────────────────────────────────────
// Swap these out for real API calls when backend is wired.

import type {
  StaffMember, Shift, AssignedTab, ShiftPosting,
  HireRequest, ShiftHistory, TipRecord, OrderRecord,
  AvailabilitySlot, Notification,
} from './types'

export const MOCK_STAFF: StaffMember = {
  id: 'staff-001',
  displayName: 'James Mwangi',
  phoneNumber: '+254712345678',
  bio: '5+ years experience in fine dining. Fluent in English, Swahili, and basic French. Love creating memorable guest experiences.',
  badgeTier: 'gold',
  performanceScore: 4.8,
  totalShifts: 247,
  totalApprovedOrders: 1240,
  approvalRate: 96.7,
  totalTipsEarned: 45300,
  totalLikes: 312,
  totalPoints: 6847,
  marketplaceVisible: true,
}

export const MOCK_ACTIVE_SHIFT: Shift = {
  id: 'shift-001',
  barName: 'The Alchemist',
  barId: 'bar-001',
  role: 'Waiter',
  shiftStart: '2026-07-03T18:00:00',
  shiftEnd: '2026-07-04T02:00:00',
  status: 'active',
  checkedInAt: '2026-07-03T17:58:00',
}

export const MOCK_UPCOMING_SHIFT: Shift = {
  id: 'shift-002',
  barName: 'J\'s Fresh Bar',
  barId: 'bar-002',
  role: 'Waiter',
  shiftStart: '2026-07-04T18:00:00',
  shiftEnd: '2026-07-05T01:00:00',
  status: 'scheduled',
  payAmount: 1200,
}

export const MOCK_ASSIGNED_TABS: AssignedTab[] = [
  {
    id: 'tab-001',
    tableNumber: 5,
    customerName: 'Sarah K.',
    currentBalance: 2340,
    roundCount: 2,
    hasPendingOrder: true,
    hasTip: false,
  },
]

export const MOCK_JOB_POSTINGS: ShiftPosting[] = [
  {
    id: 'post-001',
    barName: 'The Alchemist',
    barRating: 4.7,
    role: 'Waiter',
    shiftDate: 'Tonight',
    shiftStart: '8:00 PM',
    shiftEnd: '2:00 AM',
    payPerShift: 800,
    slotsAvailable: 1,
    location: 'Westlands',
    lat: -1.2641,
    lng: 36.8027,
  },
]

export const MOCK_HIRE_REQUESTS: HireRequest[] = [
  {
    id: 'hr-001',
    barName: 'The Alchemist',
    managerName: 'David K.',
    role: 'Waiter',
    shiftDate: 'Sat 29 Jun',
    shiftStart: '6:00 PM',
    shiftEnd: '2:00 AM',
    payAmount: 1200,
    message: "Hi James, we'd love to have you for our busy Saturday night shift. Looking forward to working with you again!",
    status: 'pending',
    expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
  },
]

export const MOCK_SHIFT_HISTORY: ShiftHistory[] = [
  {
    id: 'sh-001',
    barName: 'The Alchemist',
    date: 'Fri 27 Jun',
    startTime: '6:00 PM',
    endTime: '2:00 AM',
    durationHours: 8,
    ordersApproved: 12,
    tipsEarned: 350,
    rating: 4.9,
    reviewCount: 3,
  },
]

export const MOCK_TIPS: TipRecord[] = [
  {
    id: 'tip-001',
    amount: 200,
    fromName: 'Sarah K.',
    tableNumber: 5,
    barName: 'The Alchemist',
    date: '27 Jun',
    mpesaCode: 'QAB7X8Y2',
  },
]

export const MOCK_ORDERS: OrderRecord[] = [
  {
    id: 'ord-001',
    items: '2x Tusker, 1x Nyama Choma',
    tableNumber: 5,
    status: 'approved',
    amount: 1490,
    points: 5,
    timestamp: '9:14 PM',
  },
]

export const MOCK_AVAILABILITY: AvailabilitySlot[] = [
  { dayOfWeek: 5, availableFrom: '18:00', availableUntil: '03:00', availabilityType: 'available' },
]

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-001',
    type: 'hire_request_received',
    title: 'New shift offer',
    body: 'The Alchemist — Sat 29 Jun, 6PM–2AM · KES 1,200',
    priority: 'urgent',
    actionUrl: '/waiter/jobs',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getHoursUntilExpiry(expiresAt: string): number {
  return Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)))
}

export function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString()}`
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function getBadgeLabel(tier: string): string {
  return { gold: '🥇 Gold Waiter', silver: '🥈 Silver Waiter', standard: 'Standard' }[tier] ?? 'Standard'
}

export function getDefaultAvatarStyle(name: string): { background: string; initials: string } {
  const palette = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6']
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
  const background = palette[hash % palette.length]
  const initials = name.split(' ').map(n => n[0] ?? '').join('').toUpperCase().slice(0, 2)
  return { background, initials }
}

// ─── Nearby venues for off-shift home ────────────────────────────────────────
export interface NearbyVenue {
  id: string
  name: string
  location: string
  rating: number
  reviewCount: number
  openSlots: number           // 0 = no current opening
  slotRole?: string           // 'Waiter' | 'Bartender' | 'Captain'
  slotPay?: number            // KES per shift
  slotDate?: string           // 'Tonight' | 'Saturday' etc.
  slotStart?: string
  slotEnd?: string
  distance?: string           // '1.2 km'
  isRecentlyWorked?: boolean  // show "You've worked here" tag
}

export const MOCK_NEARBY_VENUES: NearbyVenue[] = [
  {
    id: 'v-001',
    name: 'The Alchemist',
    location: 'Westlands',
    rating: 4.7,
    reviewCount: 142,
    openSlots: 1,
    slotRole: 'Waiter',
    slotPay: 800,
    slotDate: 'Tonight',
    slotStart: '8:00 PM',
    slotEnd: '2:00 AM',
    distance: '0.8 km',
    isRecentlyWorked: true,
  },
]
