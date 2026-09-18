// Canonical crew roles.
// `value` is the database token (shift_postings/hire_requests/bar_crew_requests)
// and `label` is the human-facing name stored in crew_members.preferred_roles
// and shown throughout the app.

export interface RoleOption {
  value: string
  label: string
  group: 'Hospitality' | 'Events'
}

export const CREW_ROLES: RoleOption[] = [
  // Hospitality
  { value: 'waiter', label: 'Waiter', group: 'Hospitality' },
  { value: 'bartender', label: 'Bartender', group: 'Hospitality' },
  { value: 'captain', label: 'Captain', group: 'Hospitality' },
  { value: 'chef', label: 'Chef', group: 'Hospitality' },
  { value: 'host', label: 'Host', group: 'Hospitality' },
  // Events
  { value: 'dj', label: 'DJ', group: 'Events' },
  { value: 'mc', label: 'MC / Host', group: 'Events' },
  { value: 'videographer', label: 'Videographer', group: 'Events' },
  { value: 'photographer', label: 'Photographer', group: 'Events' },
  { value: 'lighting_technician', label: 'Lighting Technician', group: 'Events' },
  { value: 'sound_engineer', label: 'Sound Engineer', group: 'Events' },
  { value: 'rigger', label: 'Rigger', group: 'Events' },
  { value: 'comedian', label: 'Comedian', group: 'Events' },
  { value: 'live_musician', label: 'Live Musician', group: 'Events' },
  { value: 'dancer_performer', label: 'Dancer / Performer', group: 'Events' },
  { value: 'event_coordinator', label: 'Event Coordinator', group: 'Events' },
  { value: 'stagehand', label: 'Stagehand', group: 'Events' },
]

// Roles a crew member can attach to when joining a venue roster.
export const CREW_ROSTER_ROLES: { value: string; label: string }[] = [
  { value: 'manager', label: 'Manager' },
  ...CREW_ROLES.map(({ value, label }) => ({ value, label })),
]

export const ROLE_LABEL: Record<string, string> = Object.fromEntries(
  CREW_ROSTER_ROLES.map(({ value, label }) => [value, label])
)

export function roleLabel(value: string | null | undefined): string {
  if (!value) return ''
  return (
    ROLE_LABEL[value] ??
    value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  )
}
