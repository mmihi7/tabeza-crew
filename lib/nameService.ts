// lib/nameService.ts

/**
 * Formats a display name for public viewing
 * Example: "Faith M" for "Faith Mwangi"
 * Example: "Faith M K" for "Faith Mwangi Kariuki"
 * Example: "Maleche F" for "Maleche Faith"
 */
export function formatPublicName(fullName: string): string {
  if (!fullName) return 'Crew Member'
  
  const parts = fullName.trim().split(/\s+/)
  
  if (parts.length === 1) {
    // Single name - use as is
    return parts[0]
  }
  
  // First name + last name initial
  const firstName = parts[0]
  const lastNameInitial = parts[parts.length - 1].charAt(0).toUpperCase()
  
  // If there are multiple middle names, add their initials too
  if (parts.length > 2) {
    const middleInitials = parts.slice(1, -1).map(p => p.charAt(0).toUpperCase()).join(' ')
    return `${firstName} ${middleInitials} ${lastNameInitial}.`
  }
  
  return `${firstName} ${lastNameInitial}.`
}

/**
 * Validates a display name for uniqueness and format
 */
export function validateDisplayName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' }
  }
  
  if (name.trim().length > 50) {
    return { valid: false, error: 'Name must be less than 50 characters' }
  }
  
  if (!/^[a-zA-Z\s\-']+$/.test(name.trim())) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
  }
  
  return { valid: true }
}

/**
 * Generates suggestions for public name format
 */
export function getPublicNameSuggestions(fullName: string): string[] {
  const suggestions: string[] = []
  
  if (!fullName) return suggestions
  
  const parts = fullName.trim().split(/\s+/)
  
  if (parts.length === 1) {
    suggestions.push(parts[0])
    return suggestions
  }
  
  // First + Last Initial
  suggestions.push(`${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`)
  
  // First + Last (full)
  suggestions.push(`${parts[0]} ${parts[parts.length - 1]}`)
  
  // Last + First Initial (for surnames first)
  if (parts.length > 1) {
    suggestions.push(`${parts[parts.length - 1]} ${parts[0].charAt(0).toUpperCase()}.`)
  }
  
  return suggestions
}