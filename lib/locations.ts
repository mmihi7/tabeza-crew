// lib/locations.ts

// Kenya counties and major towns
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
  { id: 'ruaka', name: 'Ruaka', county: 'Kiambu', type: 'town' },
  { id: 'kikuyu', name: 'Kikuyu', county: 'Kiambu', type: 'town' },
  { id: 'ngong', name: 'Ngong', county: 'Kajiado', type: 'town' },
  { id: 'rongai', name: 'Rongai', county: 'Kajiado', type: 'town' },
  { id: 'thika-road', name: 'Thika Road', county: 'Nairobi', type: 'area' },
  
  // Major Cities/Towns
  { id: 'mombasa', name: 'Mombasa', county: 'Mombasa', type: 'city' },
  { id: 'kisumu', name: 'Kisumu', county: 'Kisumu', type: 'city' },
  { id: 'nakuru', name: 'Nakuru', county: 'Nakuru', type: 'city' },
  { id: 'eldoret', name: 'Eldoret', county: 'Uasin Gishu', type: 'city' },
  { id: 'thika', name: 'Thika', county: 'Kiambu', type: 'city' },
  { id: 'malindi', name: 'Malindi', county: 'Kilifi', type: 'town' },
  { id: 'kitale', name: 'Kitale', county: 'Trans Nzoia', type: 'town' },
  { id: 'nanyuki', name: 'Nanyuki', county: 'Laikipia', type: 'town' },
  { id: 'meru', name: 'Meru', county: 'Meru', type: 'town' },
  { id: 'nairobi', name: 'Nairobi', county: 'Nairobi', type: 'city' },
  
  // Popular areas in other counties
  { id: 'nyali', name: 'Nyali', county: 'Mombasa', type: 'suburb' },
  { id: 'bamburi', name: 'Bamburi', county: 'Mombasa', type: 'suburb' },
  { id: 'ukunda', name: 'Ukunda', county: 'Kwale', type: 'town' },
  { id: 'diani', name: 'Diani', county: 'Kwale', type: 'town' },
  { id: 'watamu', name: 'Watamu', county: 'Kilifi', type: 'town' },
  { id: 'kilifi', name: 'Kilifi', county: 'Kilifi', type: 'town' },
  { id: 'vihiga', name: 'Vihiga', county: 'Vihiga', type: 'town' },
  { id: 'kakamega', name: 'Kakamega', county: 'Kakamega', type: 'town' },
  { id: 'bungoma', name: 'Bungoma', county: 'Bungoma', type: 'town' },
  { id: 'busia', name: 'Busia', county: 'Busia', type: 'town' },
  { id: 'homa-bay', name: 'Homa Bay', county: 'Homa Bay', type: 'town' },
  { id: 'kisii', name: 'Kisii', county: 'Kisii', type: 'town' },
  { id: 'nyamira', name: 'Nyamira', county: 'Nyamira', type: 'town' },
  { id: 'kericho', name: 'Kericho', county: 'Kericho', type: 'town' },
  { id: 'narok', name: 'Narok', county: 'Narok', type: 'town' },
  { id: 'naivasha', name: 'Naivasha', county: 'Nakuru', type: 'town' },
  { id: 'gilgil', name: 'Gilgil', county: 'Nakuru', type: 'town' },
  { id: 'nyahururu', name: 'Nyahururu', county: 'Laikipia', type: 'town' },
  { id: 'nanyuki', name: 'Nanyuki', county: 'Laikipia', type: 'town' },
  { id: 'isiolo', name: 'Isiolo', county: 'Isiolo', type: 'town' },
  { id: 'garissa', name: 'Garissa', county: 'Garissa', type: 'town' },
  { id: 'wajir', name: 'Wajir', county: 'Wajir', type: 'town' },
  { id: 'mandera', name: 'Mandera', county: 'Mandera', type: 'town' },
  { id: 'lodwar', name: 'Lodwar', county: 'Turkana', type: 'town' },
  { id: 'kapenguria', name: 'Kapenguria', county: 'West Pokot', type: 'town' },
  { id: 'iten', name: 'Iten', county: 'Elgeyo Marakwet', type: 'town' },
  { id: 'kapsabet', name: 'Kapsabet', county: 'Nandi', type: 'town' },
  { id: 'maralal', name: 'Maralal', county: 'Samburu', type: 'town' },
  { id: 'machakos', name: 'Machakos', county: 'Machakos', type: 'town' },
  { id: 'kangundo', name: 'Kangundo', county: 'Machakos', type: 'town' },
  { id: 'kitui', name: 'Kitui', county: 'Kitui', type: 'town' },
  { id: 'mwingi', name: 'Mwingi', county: 'Kitui', type: 'town' },
  { id: 'nanyuki', name: 'Nanyuki', county: 'Laikipia', type: 'town' },
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