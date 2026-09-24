// lib/locations.ts

// Kenya counties and major towns. Each of the 47 counties has at least one
// selectable area (its county HQ) so the signup County → Area dropdown always
// has options. County names match the canonical names in lib/counties.ts.

export const KENYA_LOCATIONS = [
  // Nairobi Metro
  { id: 'nairobi-cbd', name: 'Nairobi CBD', county: 'Nairobi', type: 'city' },
  { id: 'westlands', name: 'Westlands', county: 'Nairobi', type: 'suburb' },
  { id: 'kilimani', name: 'Kilimani', county: 'Nairobi', type: 'suburb' },
  { id: 'lavington', name: 'Lavington', county: 'Nairobi', type: 'suburb' },
  { id: 'karen', name: 'Karen', county: 'Nairobi', type: 'suburb' },
  { id: 'parklands', name: 'Parklands', county: 'Nairobi', type: 'suburb' },
  { id: 'gigiri', name: 'Gigiri', county: 'Nairobi', type: 'suburb' },
  { id: 'runda', name: 'Runda', county: 'Nairobi', type: 'suburb' },
  { id: 'hurlingham', name: 'Hurlingham', county: 'Nairobi', type: 'suburb' },
  { id: 'upper-hill', name: 'Upper Hill', county: 'Nairobi', type: 'suburb' },
  { id: 'south-b', name: 'South B', county: 'Nairobi', type: 'suburb' },
  { id: 'south-c', name: 'South C', county: 'Nairobi', type: 'suburb' },
  { id: 'langata', name: 'Langata', county: 'Nairobi', type: 'suburb' },
  { id: 'embakasi', name: 'Embakasi', county: 'Nairobi', type: 'suburb' },
  { id: 'kasarani', name: 'Kasarani', county: 'Nairobi', type: 'suburb' },
  { id: 'thika-road', name: 'Thika Road', county: 'Nairobi', type: 'area' },
  { id: 'nairobi', name: 'Nairobi', county: 'Nairobi', type: 'city' },

  // Mombasa
  { id: 'mombasa', name: 'Mombasa', county: 'Mombasa', type: 'city' },
  { id: 'nyali', name: 'Nyali', county: 'Mombasa', type: 'suburb' },
  { id: 'bamburi', name: 'Bamburi', county: 'Mombasa', type: 'suburb' },

  // Kwale
  { id: 'kwale', name: 'Kwale', county: 'Kwale', type: 'town' },
  { id: 'ukunda', name: 'Ukunda', county: 'Kwale', type: 'town' },
  { id: 'diani', name: 'Diani', county: 'Kwale', type: 'town' },

  // Kilifi
  { id: 'kilifi', name: 'Kilifi', county: 'Kilifi', type: 'town' },
  { id: 'malindi', name: 'Malindi', county: 'Kilifi', type: 'town' },
  { id: 'watamu', name: 'Watamu', county: 'Kilifi', type: 'town' },

  // Tana River
  { id: 'hola', name: 'Hola', county: 'Tana River', type: 'town' },

  // Lamu
  { id: 'lamu', name: 'Lamu', county: 'Lamu', type: 'town' },

  // Taita-Taveta
  { id: 'voi', name: 'Voi', county: 'Taita-Taveta', type: 'town' },

  // Garissa
  { id: 'garissa', name: 'Garissa', county: 'Garissa', type: 'town' },

  // Wajir
  { id: 'wajir', name: 'Wajir', county: 'Wajir', type: 'town' },

  // Mandera
  { id: 'mandera', name: 'Mandera', county: 'Mandera', type: 'town' },

  // Marsabit
  { id: 'marsabit', name: 'Marsabit', county: 'Marsabit', type: 'town' },

  // Isiolo
  { id: 'isiolo', name: 'Isiolo', county: 'Isiolo', type: 'town' },

  // Meru
  { id: 'meru', name: 'Meru', county: 'Meru', type: 'town' },

  // Tharaka-Nithi
  { id: 'chuka', name: 'Chuka', county: 'Tharaka-Nithi', type: 'town' },

  // Embu
  { id: 'embu', name: 'Embu', county: 'Embu', type: 'town' },

  // Kitui
  { id: 'kitui', name: 'Kitui', county: 'Kitui', type: 'town' },
  { id: 'mwingi', name: 'Mwingi', county: 'Kitui', type: 'town' },

  // Machakos
  { id: 'machakos', name: 'Machakos', county: 'Machakos', type: 'town' },
  { id: 'kangundo', name: 'Kangundo', county: 'Machakos', type: 'town' },

  // Makueni
  { id: 'wote', name: 'Wote', county: 'Makueni', type: 'town' },

  // Nyandarua
  { id: 'ol-kalou', name: 'Ol Kalou', county: 'Nyandarua', type: 'town' },

  // Nyeri
  { id: 'nyeri', name: 'Nyeri', county: 'Nyeri', type: 'town' },

  // Kirinyaga
  { id: 'kerugoya', name: 'Kerugoya', county: 'Kirinyaga', type: 'town' },

  // Murang'a
  { id: 'muranga', name: "Murang'a", county: "Murang'a", type: 'town' },

  // Kiambu
  { id: 'kiambu', name: 'Kiambu', county: 'Kiambu', type: 'town' },
  { id: 'ruaka', name: 'Ruaka', county: 'Kiambu', type: 'town' },
  { id: 'kikuyu', name: 'Kikuyu', county: 'Kiambu', type: 'town' },
  { id: 'thika', name: 'Thika', county: 'Kiambu', type: 'city' },

  // Turkana
  { id: 'lodwar', name: 'Lodwar', county: 'Turkana', type: 'town' },

  // West Pokot
  { id: 'kapenguria', name: 'Kapenguria', county: 'West Pokot', type: 'town' },

  // Samburu
  { id: 'maralal', name: 'Maralal', county: 'Samburu', type: 'town' },

  // Trans Nzoia
  { id: 'kitale', name: 'Kitale', county: 'Trans Nzoia', type: 'town' },

  // Uasin Gishu
  { id: 'eldoret', name: 'Eldoret', county: 'Uasin Gishu', type: 'city' },

  // Elgeyo-Marakwet
  { id: 'iten', name: 'Iten', county: 'Elgeyo-Marakwet', type: 'town' },

  // Nandi
  { id: 'kapsabet', name: 'Kapsabet', county: 'Nandi', type: 'town' },

  // Baringo
  { id: 'kabarnet', name: 'Kabarnet', county: 'Baringo', type: 'town' },

  // Laikipia
  { id: 'nanyuki', name: 'Nanyuki', county: 'Laikipia', type: 'town' },
  { id: 'nyahururu', name: 'Nyahururu', county: 'Laikipia', type: 'town' },

  // Nakuru
  { id: 'nakuru', name: 'Nakuru', county: 'Nakuru', type: 'city' },
  { id: 'naivasha', name: 'Naivasha', county: 'Nakuru', type: 'town' },
  { id: 'gilgil', name: 'Gilgil', county: 'Nakuru', type: 'town' },

  // Narok
  { id: 'narok', name: 'Narok', county: 'Narok', type: 'town' },

  // Kajiado
  { id: 'kajiado', name: 'Kajiado', county: 'Kajiado', type: 'town' },
  { id: 'ngong', name: 'Ngong', county: 'Kajiado', type: 'town' },
  { id: 'rongai', name: 'Rongai', county: 'Kajiado', type: 'town' },

  // Kericho
  { id: 'kericho', name: 'Kericho', county: 'Kericho', type: 'town' },

  // Bomet
  { id: 'bomet', name: 'Bomet', county: 'Bomet', type: 'town' },

  // Kakamega
  { id: 'kakamega', name: 'Kakamega', county: 'Kakamega', type: 'town' },

  // Vihiga
  { id: 'vihiga', name: 'Vihiga', county: 'Vihiga', type: 'town' },

  // Bungoma
  { id: 'bungoma', name: 'Bungoma', county: 'Bungoma', type: 'town' },

  // Busia
  { id: 'busia', name: 'Busia', county: 'Busia', type: 'town' },

  // Siaya
  { id: 'siaya', name: 'Siaya', county: 'Siaya', type: 'town' },

  // Kisumu
  { id: 'kisumu', name: 'Kisumu', county: 'Kisumu', type: 'city' },

  // Homa Bay
  { id: 'homa-bay', name: 'Homa Bay', county: 'Homa Bay', type: 'town' },

  // Migori
  { id: 'migori', name: 'Migori', county: 'Migori', type: 'town' },

  // Kisii
  { id: 'kisii', name: 'Kisii', county: 'Kisii', type: 'town' },

  // Nyamira
  { id: 'nyamira', name: 'Nyamira', county: 'Nyamira', type: 'town' },
]

export function getLocationById(id: string) {
  return KENYA_LOCATIONS.find(loc => loc.id === id)
}

export function searchLocations(query: string) {
  if (!query || query.length < 2) return []
  const search = query.toLowerCase()
  return KENYA_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(search) ||
    loc.county.toLowerCase().includes(search)
  ).slice(0, 10)
}

export function getLocationsByCounty(county: string) {
  return KENYA_LOCATIONS.filter(loc => 
    loc.county.toLowerCase() === county.toLowerCase()
  )
}