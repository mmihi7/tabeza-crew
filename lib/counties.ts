// lib/counties.ts
// Kenya's 47 counties with their standard 3-letter codes. The crew signup uses
// a County → Area two-step dropdown: pick the county first, then the exact
// area/neighbourhood (anchored by GPS) so crew connect to venues near where
// they actually are.

export interface KenyaCounty {
  code: string;
  number: number;
  name: string;
}

export const KENYA_COUNTIES: KenyaCounty[] = [
  { code: 'MSA', number: 1, name: 'Mombasa' },
  { code: 'KWL', number: 2, name: 'Kwale' },
  { code: 'KLF', number: 3, name: 'Kilifi' },
  { code: 'TRV', number: 4, name: 'Tana River' },
  { code: 'LAM', number: 5, name: 'Lamu' },
  { code: 'TVT', number: 6, name: 'Taita-Taveta' },
  { code: 'GRS', number: 7, name: 'Garissa' },
  { code: 'WJR', number: 8, name: 'Wajir' },
  { code: 'MDR', number: 9, name: 'Mandera' },
  { code: 'MBT', number: 10, name: 'Marsabit' },
  { code: 'ISL', number: 11, name: 'Isiolo' },
  { code: 'MRU', number: 12, name: 'Meru' },
  { code: 'THN', number: 13, name: 'Tharaka-Nithi' },
  { code: 'EMB', number: 14, name: 'Embu' },
  { code: 'KTU', number: 15, name: 'Kitui' },
  { code: 'MCK', number: 16, name: 'Machakos' },
  { code: 'MKN', number: 17, name: 'Makueni' },
  { code: 'NDR', number: 18, name: 'Nyandarua' },
  { code: 'NYR', number: 19, name: 'Nyeri' },
  { code: 'KRG', number: 20, name: 'Kirinyaga' },
  { code: 'MRG', number: 21, name: "Murang'a" },
  { code: 'KMB', number: 22, name: 'Kiambu' },
  { code: 'TRK', number: 23, name: 'Turkana' },
  { code: 'WPK', number: 24, name: 'West Pokot' },
  { code: 'SMB', number: 25, name: 'Samburu' },
  { code: 'TNZ', number: 26, name: 'Trans Nzoia' },
  { code: 'UGS', number: 27, name: 'Uasin Gishu' },
  { code: 'EMK', number: 28, name: 'Elgeyo-Marakwet' },
  { code: 'NDI', number: 29, name: 'Nandi' },
  { code: 'BRG', number: 30, name: 'Baringo' },
  { code: 'LKP', number: 31, name: 'Laikipia' },
  { code: 'NKR', number: 32, name: 'Nakuru' },
  { code: 'NRK', number: 33, name: 'Narok' },
  { code: 'KJD', number: 34, name: 'Kajiado' },
  { code: 'KRC', number: 35, name: 'Kericho' },
  { code: 'BMT', number: 36, name: 'Bomet' },
  { code: 'KKG', number: 37, name: 'Kakamega' },
  { code: 'VHG', number: 38, name: 'Vihiga' },
  { code: 'BGM', number: 39, name: 'Bungoma' },
  { code: 'BSA', number: 40, name: 'Busia' },
  { code: 'SYA', number: 41, name: 'Siaya' },
  { code: 'KSM', number: 42, name: 'Kisumu' },
  { code: 'HMB', number: 43, name: 'Homa Bay' },
  { code: 'MGR', number: 44, name: 'Migori' },
  { code: 'KSI', number: 45, name: 'Kisii' },
  { code: 'NYM', number: 46, name: 'Nyamira' },
  { code: 'NBO', number: 47, name: 'Nairobi' },
];

export function getCountyByCode(code?: string | null): KenyaCounty | undefined {
  if (!code) return undefined;
  const c = code.trim().toUpperCase();
  return KENYA_COUNTIES.find((county) => county.code === c);
}

export function getCountyByName(name?: string | null): KenyaCounty | undefined {
  if (!name) return undefined;
  const n = name.trim().toLowerCase();
  return KENYA_COUNTIES.find(
    (county) =>
      county.name.toLowerCase() === n ||
      county.name.toLowerCase().replace(/[^a-z0-9]/g, '') === n.replace(/[^a-z0-9]/g, '')
  );
}