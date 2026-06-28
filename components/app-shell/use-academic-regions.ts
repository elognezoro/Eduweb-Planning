"use client";

import { getCountry, type AcademicRegionSeed } from "@/config/countries";
import { useStore } from "./data-store";

/**
 * Régions académiques EFFECTIVES d'un pays : la liste éditée à l'exécution
 * (data-store `customRegions`, modifiable par l'admin) prend le pas sur la
 * configuration statique du pays. Sert le sélecteur de régions ET les
 * formulaires d'établissement.
 */
export function useAcademicRegions(countryCode: string): AcademicRegionSeed[] {
  const { customRegions } = useStore();
  return customRegions[countryCode] ?? getCountry(countryCode).academicRegions;
}
