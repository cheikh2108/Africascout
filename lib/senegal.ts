// Les 14 régions officielles du Sénégal
export const REGIONS_SENEGAL = [
  "Dakar",
  "Thiès",
  "Diourbel",
  "Fatick",
  "Kaolack",
  "Kaffrine",
  "Kolda",
  "Louga",
  "Matam",
  "Saint-Louis",
  "Sédhiou",
  "Tambacounda",
  "Ziguinchor",
  "Kédougou",
] as const;

export type RegionSenegal = (typeof REGIONS_SENEGAL)[number];
