import { NextResponse } from "next/server";
import { parseCsv } from "@/lib/imports/csv";

/** Valide un CSV : renvoie en-têtes, nombre de lignes et un aperçu. */
export async function POST(request: Request) {
  try {
    const { csv } = (await request.json()) as { csv?: string };
    if (!csv) return NextResponse.json({ error: "Champ 'csv' manquant" }, { status: 400 });

    const parsed = parseCsv(csv);
    const errorRows = parsed.rows.filter((r) => r.some((c) => c === "")).length;

    return NextResponse.json({
      separator: parsed.separator,
      headers: parsed.headers,
      rowCount: parsed.rows.length,
      validRows: parsed.rows.length - errorRows,
      errorRows,
      preview: parsed.rows.slice(0, 20),
    });
  } catch {
    return NextResponse.json({ error: "CSV invalide" }, { status: 400 });
  }
}
