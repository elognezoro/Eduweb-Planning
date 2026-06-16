/** Charge utile commune aux exports PDF et Word. */
export interface ReportTable {
  columns: string[];
  rows: (string | number)[][];
}

export interface ReportSection {
  heading: string;
  paragraphs?: string[];
  table?: ReportTable;
}

export interface ReportPayload {
  title: string;
  subtitle?: string;
  country: string;
  institution?: string;
  period?: string;
  author: string;
  generatedAt: string;
  sections: ReportSection[];
  /** En-tête institutionnel officiel (renseigné depuis la Configuration). */
  official?: string;
  ministry?: string;
  slogan?: string;
  schoolYear?: string;
  /** Emblème national (data-URL armoiries ou URL drapeau), intercalé entre l'officiel et la devise. */
  emblem?: string | null;
}
