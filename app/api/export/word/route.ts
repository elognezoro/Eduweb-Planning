import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { NextResponse } from "next/server";
import type { ReportPayload } from "@/lib/exports";

/** Génère un document Word à partir d'un ReportPayload (génération serveur). */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ReportPayload;
    const children: Paragraph[] = [
      new Paragraph({ children: [new TextRun({ text: "EduWeb Planner", bold: true, size: 32, color: "176B45" })] }),
      new Paragraph({ heading: HeadingLevel.HEADING_1, text: payload.title }),
      new Paragraph({ text: `Pays : ${payload.country} — Généré le ${payload.generatedAt}` }),
    ];
    payload.sections.forEach((s) => {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, text: s.heading }));
      s.paragraphs?.forEach((p) => children.push(new Paragraph({ text: p })));
      s.table?.rows.forEach((row) => children.push(new Paragraph({ text: row.join(" · ") })));
    });

    const doc = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": "attachment; filename=rapport.docx",
      },
    });
  } catch {
    return NextResponse.json({ error: "Génération Word impossible" }, { status: 400 });
  }
}
