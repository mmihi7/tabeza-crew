// lib/skillsDatabase.ts

export interface SkillSuggestion {
  name: string
  category: 'service' | 'beverage' | 'food' | 'language' | 'other'
  level?: 'beginner' | 'intermediate' | 'expert'
}

export const ROLE_SKILLS_MAP: Record<string, SkillSuggestion[]> = {
  // ── FOH Roles ──
  'Waiter': [
    { name: 'Table Service', category: 'service' },
    { name: 'Order Taking', category: 'service' },
    { name: 'Menu Knowledge', category: 'food' },
    { name: 'Customer Service', category: 'service' },
    { name: 'Upselling', category: 'service' },
    { name: 'Cash Handling', category: 'service' },
    { name: 'Tab Management', category: 'service' },
    { name: 'Conflict Resolution', category: 'service' },
  ],
  'Head Waiter': [
    { name: 'Table Service', category: 'service' },
    { name: 'Order Taking', category: 'service' },
    { name: 'Menu Knowledge', category: 'food' },
    { name: 'Customer Service', category: 'service' },
    { name: 'Upselling', category: 'service' },
    { name: 'Staff Supervision', category: 'service' },
    { name: 'Section Management', category: 'service' },
    { name: 'Conflict Resolution', category: 'service' },
    { name: 'Training & Mentoring', category: 'service' },
  ],
  'Bartender': [
    { name: 'Cocktail Preparation', category: 'beverage' },
    { name: 'Mixology', category: 'beverage' },
    { name: 'Speed Bartending', category: 'beverage' },
    { name: 'Wine Service', category: 'beverage' },
    { name: 'Spirits Knowledge', category: 'beverage' },
    { name: 'Customer Service', category: 'service' },
    { name: 'Cash Handling', category: 'service' },
    { name: 'Age Verification', category: 'service' },
    { name: 'Inventory Control', category: 'service' },
  ],
  'Head Bartender': [
    { name: 'Cocktail Preparation', category: 'beverage' },
    { name: 'Advanced Mixology', category: 'beverage' },
    { name: 'Speed Bartending', category: 'beverage' },
    { name: 'Wine Service', category: 'beverage' },
    { name: 'Spirits Knowledge', category: 'beverage' },
    { name: 'Staff Supervision', category: 'service' },
    { name: 'Bar Management', category: 'service' },
    { name: 'Inventory Control', category: 'service' },
    { name: 'Menu Development', category: 'beverage' },
    { name: 'Training & Mentoring', category: 'service' },
  ],
  'Bar Back': [
    { name: 'Glassware Maintenance', category: 'service' },
    { name: 'Stock Management', category: 'service' },
    { name: 'Inventory Control', category: 'service' },
    { name: 'Bar Cleaning', category: 'service' },
    { name: 'Supply Replenishment', category: 'service' },
    { name: 'Ingredient Preparation', category: 'beverage' },
  ],
  'Mixologist': [
    { name: 'Advanced Mixology', category: 'beverage' },
    { name: 'Cocktail Preparation', category: 'beverage' },
    { name: 'Spirits Knowledge', category: 'beverage' },
    { name: 'Liqueur Knowledge', category: 'beverage' },
    { name: 'Flavor Profiling', category: 'beverage' },
    { name: 'Menu Development', category: 'beverage' },
    { name: 'Wine Service', category: 'beverage' },
    { name: 'Customer Service', category: 'service' },
  ],

  // ── BOH Roles ──
  'Chef': [
    { name: 'Food Preparation', category: 'food' },
    { name: 'Cooking Techniques', category: 'food' },
    { name: 'Menu Planning', category: 'food' },
    { name: 'Food Safety', category: 'food' },
    { name: 'HACCP', category: 'food' },
    { name: 'Kitchen Management', category: 'service' },
    { name: 'Staff Supervision', category: 'service' },
    { name: 'Inventory Control', category: 'service' },
  ],
  'Head Chef': [
    { name: 'Food Preparation', category: 'food' },
    { name: 'Advanced Cooking Techniques', category: 'food' },
    { name: 'Menu Planning & Costing', category: 'food' },
    { name: 'Food Safety & HACCP', category: 'food' },
    { name: 'Kitchen Management', category: 'service' },
    { name: 'Staff Supervision', category: 'service' },
    { name: 'Inventory Control', category: 'service' },
    { name: 'Menu Development', category: 'food' },
    { name: 'Training & Mentoring', category: 'service' },
  ],
  'Line Cook': [
    { name: 'Food Preparation', category: 'food' },
    { name: 'Cooking Techniques', category: 'food' },
    { name: 'Station Management', category: 'service' },
    { name: 'Food Safety', category: 'food' },
    { name: 'HACCP', category: 'food' },
    { name: 'Knife Skills', category: 'food' },
  ],
  'Kitchen Assistant': [
    { name: 'Food Preparation', category: 'food' },
    { name: 'Kitchen Cleaning', category: 'service' },
    { name: 'Food Safety', category: 'food' },
    { name: 'HACCP', category: 'food' },
    { name: 'Knife Skills', category: 'food' },
    { name: 'Supply Replenishment', category: 'service' },
  ],

  // ── Management Roles ──
  'Bar Manager': [
    { name: 'Bar Management', category: 'service' },
    { name: 'Inventory Control', category: 'service' },
    { name: 'Staff Supervision', category: 'service' },
    { name: 'Menu Planning', category: 'beverage' },
    { name: 'Cocktail Preparation', category: 'beverage' },
    { name: 'Spirits Knowledge', category: 'beverage' },
    { name: 'Cash Handling', category: 'service' },
    { name: 'Training & Mentoring', category: 'service' },
    { name: 'Conflict Resolution', category: 'service' },
  ],
  'Floor Manager': [
    { name: 'Staff Supervision', category: 'service' },
    { name: 'Customer Service', category: 'service' },
    { name: 'Conflict Resolution', category: 'service' },
    { name: 'Event Management', category: 'service' },
    { name: 'Training & Mentoring', category: 'service' },
    { name: 'Cash Handling', category: 'service' },
    { name: 'Communication Skills', category: 'service' },
  ],
  'Kitchen Manager': [
    { name: 'Kitchen Management', category: 'service' },
    { name: 'Food Safety & HACCP', category: 'food' },
    { name: 'Staff Supervision', category: 'service' },
    { name: 'Inventory Control', category: 'service' },
    { name: 'Menu Planning & Costing', category: 'food' },
    { name: 'Training & Mentoring', category: 'service' },
    { name: 'HACCP', category: 'food' },
  ],

  // ── Support Roles ──
  'Bouncer': [
    { name: 'Conflict Resolution', category: 'service' },
    { name: 'Crowd Control', category: 'service' },
    { name: 'Security Protocols', category: 'service' },
    { name: 'Age Verification', category: 'service' },
    { name: 'Emergency Response', category: 'service' },
    { name: 'Communication Skills', category: 'service' },
  ],
  'Security Guard': [
    { name: 'Conflict Resolution', category: 'service' },
    { name: 'Crowd Control', category: 'service' },
    { name: 'Security Protocols', category: 'service' },
    { name: 'Age Verification', category: 'service' },
    { name: 'Emergency Response', category: 'service' },
    { name: 'Surveillance', category: 'service' },
  ],
  'VIP Host': [
    { name: 'Customer Service', category: 'service' },
    { name: 'VIP Service', category: 'service' },
    { name: 'Event Management', category: 'service' },
    { name: 'Communication Skills', category: 'service' },
    { name: 'Guest Relations', category: 'service' },
    { name: 'Table Management', category: 'service' },
  ],
  'Bottle Service': [
    { name: 'Customer Service', category: 'service' },
    { name: 'VIP Service', category: 'service' },
    { name: 'Upselling', category: 'service' },
    { name: 'Spirits Knowledge', category: 'beverage' },
    { name: 'Guest Relations', category: 'service' },
    { name: 'Table Service', category: 'service' },
  ],
  'Promoter': [
    { name: 'Event Management', category: 'service' },
    { name: 'Customer Service', category: 'service' },
    { name: 'Communication Skills', category: 'service' },
    { name: 'Social Media Marketing', category: 'service' },
    { name: 'Guest Relations', category: 'service' },
    { name: 'Upselling', category: 'service' },
  ],
  'Cashier': [
    { name: 'Cash Handling', category: 'service' },
    { name: 'POS Systems', category: 'service' },
    { name: 'Customer Service', category: 'service' },
    { name: 'Tab Management', category: 'service' },
    { name: 'Inventory Control', category: 'service' },
    { name: 'Communication Skills', category: 'service' },
  ],
  'Cleaner': [
    { name: 'Cleaning Protocols', category: 'service' },
    { name: 'Chemical Handling', category: 'service' },
    { name: 'Hygiene Standards', category: 'service' },
    { name: 'Kitchen Cleaning', category: 'service' },
    { name: 'Supply Replenishment', category: 'service' },
  ],
  'Barista': [
    { name: 'Espresso Preparation', category: 'beverage' },
    { name: 'Coffee Making', category: 'beverage' },
    { name: 'Customer Service', category: 'service' },
    { name: 'Cash Handling', category: 'service' },
    { name: 'Inventory Control', category: 'service' },
    { name: 'Equipment Maintenance', category: 'service' },
    { name: 'Age Verification', category: 'service' },
  ],
}

// ── General skills that apply to most roles ──
export const GENERAL_SKILLS: SkillSuggestion[] = [
  { name: 'Customer Service', category: 'service' },
  { name: 'Communication Skills', category: 'service' },
  { name: 'Cash Handling', category: 'service' },
  { name: 'Conflict Resolution', category: 'service' },
  { name: 'Teamwork', category: 'service' },
  { name: 'Upselling', category: 'service' },
  { name: 'Time Management', category: 'service' },
  { name: 'Adaptability', category: 'service' },
  { name: 'Problem Solving', category: 'service' },
  { name: 'Attention to Detail', category: 'service' },
  { name: 'English', category: 'language' },
  { name: 'Swahili', category: 'language' },
  { name: 'French', category: 'language' },
  { name: 'Italian', category: 'language' },
]

export function getSuggestedSkillsForRoles(selectedRoles: string[]): SkillSuggestion[] {
  if (selectedRoles.length === 0) return GENERAL_SKILLS.slice(0, 10)
  
  const allSkills: SkillSuggestion[] = []
  const skillNames = new Set<string>()
  
  // Get skills from selected roles
  selectedRoles.forEach(role => {
    const roleSkills = ROLE_SKILLS_MAP[role] || []
    roleSkills.forEach(skill => {
      if (!skillNames.has(skill.name)) {
        skillNames.add(skill.name)
        allSkills.push(skill)
      }
    })
  })
  
  // Add some general skills if we have fewer than 10
  if (allSkills.length < 10) {
    GENERAL_SKILLS.forEach(skill => {
      if (!skillNames.has(skill.name) && allSkills.length < 15) {
        skillNames.add(skill.name)
        allSkills.push(skill)
      }
    })
  }
  
  return allSkills
}