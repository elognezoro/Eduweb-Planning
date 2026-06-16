/**
 * Helpers métier multi-pays : ré-exporte la config et fournit les années scolaires.
 */
export * from "@/config/countries";

import { DEFAULT_COUNTRY_CODE } from "@/config/countries";

export interface AcademicYear {
  id: string;
  label: string;
  startsOn: string;
  endsOn: string;
  isCurrent: boolean;
}

export const ACADEMIC_YEARS: AcademicYear[] = [
  { id: "ay-2025", label: "2025 — 2026", startsOn: "2025-09-15", endsOn: "2026-07-10", isCurrent: true },
  { id: "ay-2024", label: "2024 — 2025", startsOn: "2024-09-16", endsOn: "2025-07-12", isCurrent: false },
  { id: "ay-2023", label: "2023 — 2024", startsOn: "2023-09-18", endsOn: "2024-07-13", isCurrent: false },
];

export const CURRENT_ACADEMIC_YEAR =
  ACADEMIC_YEARS.find((y) => y.isCurrent) ?? ACADEMIC_YEARS[0];

export { DEFAULT_COUNTRY_CODE };
