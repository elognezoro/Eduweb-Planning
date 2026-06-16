import { NextResponse } from "next/server";
import { parseCsv, toMoodleCsv, MOODLE_COLUMNS } from "@/lib/imports/csv";

/**
 * Convertit un CSV source en CSV compatible Moodle.
 * body: { csv: string, mapping?: Record<moodleColumn, sourceHeader> }
 */
export async function POST(request: Request) {
  try {
    const { csv, mapping } = (await request.json()) as {
      csv?: string;
      mapping?: Record<string, string>;
    };
    if (!csv) return NextResponse.json({ error: "Champ 'csv' manquant" }, { status: 400 });

    const parsed = parseCsv(csv);
    const map = mapping ?? Object.fromEntries(MOODLE_COLUMNS.map((c) => [c, c]));

    const records = parsed.rows.map((row) => {
      const rec: Record<string, string> = {};
      MOODLE_COLUMNS.forEach((col) => {
        const src = map[col];
        const idx = src ? parsed.headers.indexOf(src) : -1;
        rec[col] = idx >= 0 ? row[idx] ?? "" : "";
      });
      return rec;
    });

    const output = toMoodleCsv(records);
    return new NextResponse(output, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=export-moodle.csv",
      },
    });
  } catch {
    return NextResponse.json({ error: "Conversion impossible" }, { status: 400 });
  }
}
