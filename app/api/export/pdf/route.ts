import { NextResponse } from "next/server";

/**
 * Les PDF EduWeb Planner sont générés côté client (jsPDF) pour rester légers et
 * interactifs (voir lib/exports/pdf.ts et le composant ExportMenu).
 * Ce point d'entrée est prévu pour une future génération serveur (pdf-lib).
 */
export async function POST() {
  return NextResponse.json({
    ok: true,
    message: "La génération PDF s'effectue côté client via ExportMenu (lib/exports/pdf.ts).",
  });
}
