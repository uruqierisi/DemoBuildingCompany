/** URL builders for every page, so links never hand-assemble paths. */
export const routes = {
  home: '/',
  building: (buildingId: string): string => `/objekti/${buildingId}`,
  apartment: (buildingId: string, apartmentId: string): string => `/objekti/${buildingId}/${apartmentId}`,
} as const;
