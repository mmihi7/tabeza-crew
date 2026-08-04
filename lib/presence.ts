import { redis } from './redis'

/**
 * Crew member online presence tracking using Redis with TTL-based heartbeats.
 *
 * How it works:
 * 1. Crew member signs in / starts shift → setPresence() with TTL=120s
 * 2. Client sends heartbeat every 60s → refreshPresence() extends TTL
 * 3. If no heartbeat for 120s → key expires automatically (offline)
 * 4. Crew member signs out / ends shift → removePresence()
 *
 * This is purely ephemeral — no database writes. The source of truth for
 * who's ACTUALLY on-shift is still the `shifts` table in Postgres.
 * Redis presence just tells you who's currently ONLINE.
 */

export interface CrewPresence {
  /** Staff member database ID */
  crewMemberId: string
  /** Display name */
  displayName: string
  /** Current shift status: on-shift, on-break, off-shift */
  status: 'on-shift' | 'on-break' | 'browsing'
  /** Bar/venue ID they're working at (if on-shift) */
  barId?: string | null
  /** Bar name for display */
  barName?: string | null
  /** Role they're currently working */
  role?: string | null
  /** Unix timestamp of last heartbeat */
  lastSeen: number
}

/** Redis key prefix for presence entries */
const PRESENCE_PREFIX = 'presence:crew:online'

/** TTL in seconds — presence expires after this if no heartbeat */
const PRESENCE_TTL = 120

/** Heartbeat interval — client should refresh every 60 seconds */
export const HEARTBEAT_INTERVAL_MS = 60_000

/**
 * Set or update a crew member's online presence.
 * Call on sign-in and every 60s as heartbeat.
 */
export async function setPresence(presence: CrewPresence): Promise<void> {
  const key = `${PRESENCE_PREFIX}:${presence.crewMemberId}`
  try {
    await redis.set(key, JSON.stringify({ ...presence, lastSeen: Date.now() }), {
      ex: PRESENCE_TTL,
    })
  } catch (error) {
    console.error(`[presence] Failed to set presence for ${presence.crewMemberId}:`, error)
  }
}

/**
 * Refresh the TTL on an existing presence entry (heartbeat).
 * Call every 60s from the client while the user is online.
 */
export async function refreshPresence(crewMemberId: string): Promise<boolean> {
  const key = `${PRESENCE_PREFIX}:${crewMemberId}`
  try {
    const exists = await redis.exists(key)
    if (exists) {
      // Update lastSeen timestamp and reset TTL
      const current = await redis.get<string>(key)
      if (current) {
        const parsed = JSON.parse(current) as CrewPresence
        parsed.lastSeen = Date.now()
        await redis.set(key, JSON.stringify(parsed), { ex: PRESENCE_TTL })
      }
      return true
    }
    return false
  } catch {
    return false
  }
}

/**
 * Remove a crew member's presence (sign out / end shift).
 */
export async function removePresence(crewMemberId: string): Promise<void> {
  const key = `${PRESENCE_PREFIX}:${crewMemberId}`
  try {
    await redis.del(key)
  } catch (error) {
    console.error(`[presence] Failed to remove presence for ${crewMemberId}:`, error)
  }
}

/**
 * Get presence for a single crew member.
 * Returns null if offline (key expired).
 */
export async function getPresence(
  crewMemberId: string
): Promise<CrewPresence | null> {
  const key = `${PRESENCE_PREFIX}:${crewMemberId}`
  try {
    const raw = await redis.get<string>(key)
    if (!raw) return null
    return JSON.parse(raw) as CrewPresence
  } catch {
    return null
  }
}

/**
 * Get all currently online crew members.
 * Uses Redis KEYS — fine for moderate scale (< 1000 online).
 * For larger scale, switch to SCAN or a SET-based approach.
 */
export async function getAllOnlineCrew(): Promise<CrewPresence[]> {
  try {
    const keys = await redis.keys(`${PRESENCE_PREFIX}:*`)
    if (keys.length === 0) return []

    const pipeline = redis.pipeline()
    for (const key of keys) {
      pipeline.get(key)
    }
    const results = await pipeline.exec()

    const presences: CrewPresence[] = []
    for (const result of results) {
      if (result && typeof result === 'string') {
        try {
          presences.push(JSON.parse(result) as CrewPresence)
        } catch {
          // skip malformed entries
        }
      }
    }
    return presences
  } catch {
    return []
  }
}

/**
 * Get online crew filtered by bar/venue.
 */
export async function getOnlineCrewAtBar(barId: string): Promise<CrewPresence[]> {
  const all = await getAllOnlineCrew()
  return all.filter((p) => p.barId === barId)
}

/**
 * Check if a crew member is currently online.
 */
export async function isOnline(crewMemberId: string): Promise<boolean> {
  const key = `${PRESENCE_PREFIX}:${crewMemberId}`
  try {
    const exists = await redis.exists(key)
    return exists === 1
  } catch {
    return false
  }
}

/**
 * Count online crew members total and at a specific bar.
 */
export async function getOnlineCounts(): Promise<{
  total: number
  onShift: number
  browsing: number
}> {
  const all = await getAllOnlineCrew()
  return {
    total: all.length,
    onShift: all.filter((p) => p.status === 'on-shift').length,
    browsing: all.filter((p) => p.status === 'browsing').length,
  }
}