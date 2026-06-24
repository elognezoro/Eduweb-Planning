import type { ReportPayload } from "@/lib/exports/types";
import type { EtabExportMeta } from "@/lib/etab-config";
import type { EnrollListSection } from "@/components/formations/enroll-list-document";

/* ============================================================================
   Export téléchargeable de la LISTE DES INSCRITS à une / des formation(s).

   - CSV  : fichier tableur (Excel FR : séparateur « ; » + BOM), avec e-mail,
            pour tri / publipostage / ré-import. Inclut une colonne « Cours ».
   - PDF / Word : document officiel construit depuis un `ReportPayload` commun
     (en-tête institutionnel + tableau par cours), via les générateurs existants
     downloadReportPdf / downloadReportWord. Sans e-mail (document de service).

   Tout est purement client (aucune dépendance serveur).
   ========================================================================== */

/** Ligne plate pour le CSV (avec e-mail + nom du cours). */
export interface EnrollCsvRow {
  course: string;
  name: string;
  email: string;
  role: string;
  formationRole: string;
  source: string;
  enrolledAt: string;
  expiresAt: string | null;
}

/**
 * Échappe un champ CSV (séparateur « ; ») et NEUTRALISE l'injection de formule
 * (CWE-1236) : un champ commençant par = + - @ (ou tabulation / retour chariot)
 * est préfixé d'une apostrophe → le tableur (Excel/LibreOffice) le traite comme
 * du texte au lieu d'évaluer une formule (DDE / HYPERLINK). Les données (nom,
 * e-mail) proviennent de profils saisis par l'utilisateur, donc non fiables.
 */
function csvField(v: string): string {
  const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Construit et télécharge un CSV de la liste des inscrits. Les lignes doivent
 * être groupées par cours (la numérotation N° repart à 1 à chaque cours).
 * BOM + « ; » → ouverture directe correcte dans Excel francophone.
 */
export function downloadEnrollListCsv(rows: EnrollCsvRow[], filename: string): void {
  const headers = [
    "Cours",
    "N°",
    "Nom & prénoms",
    "E-mail",
    "Rôle",
    "Rôle formation",
    "Source",
    "Inscrit le",
    "Expire",
  ];
  const lines = [headers.join(";")];
  let lastCourse: string | null = null;
  let n = 0;
  for (const r of rows) {
    if (r.course !== lastCourse) {
      lastCourse = r.course;
      n = 0;
    }
    n += 1;
    lines.push(
      [
        r.course,
        String(n),
        r.name,
        r.email || "—",
        r.role,
        r.formationRole,
        r.source,
        r.enrolledAt,
        r.expiresAt ?? "—",
      ]
        .map((c) => csvField(String(c)))
        .join(";"),
    );
  }
  const csv = "﻿" + lines.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Construit le `ReportPayload` commun (PDF + Word) pour la liste des inscrits :
 * en-tête institutionnel hérité de la configuration + une section (avec tableau)
 * par cours. Colonnes du document de service (sans e-mail).
 */
export function buildEnrollListReport(
  sections: EnrollListSection[],
  meta: EtabExportMeta,
  editedBy: string,
  generatedAt: string,
): ReportPayload {
  const single = sections.length === 1 ? sections[0] : null;
  return {
    title: "Liste des inscrits",
    subtitle: single
      ? `${single.courseTitle} (${single.courseType})`
      : `${sections.length} formation(s)`,
    country: meta.countryName,
    institution: meta.institution,
    period: meta.schoolYear,
    author: editedBy,
    generatedAt,
    official: meta.official,
    ministry: meta.ministry,
    slogan: meta.slogan,
    schoolYear: meta.schoolYear,
    emblem: meta.nationalEmblem,
    sections: sections.map((s) => ({
      heading: `${s.courseTitle} (${s.courseType})`,
      paragraphs: [`Effectif : ${s.rows.length} inscrit·e·s.`],
      table: {
        columns: ["N°", "Nom & prénoms", "Rôle", "Rôle formation", "Source", "Inscrit le", "Expire"],
        rows: s.rows.map((r, i) => [
          i + 1,
          r.name,
          r.role,
          r.formationRole,
          r.source,
          r.enrolledAt,
          r.expiresAt ?? "—",
        ]),
      },
    })),
  };
}
