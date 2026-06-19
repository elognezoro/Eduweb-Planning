import { NextResponse } from "next/server";
import { buildSeminaireDocx } from "@/lib/docx/seminaire";
import { buildCommPastoraleDocx } from "@/lib/docx/comm-pastorale";
import { SEMINAIRES_REGISTRY } from "@/lib/seminaires/magnifica-humanitas";
import { COMMUNICATION_PASTORALE } from "@/lib/seminaires/communication-pastorale";
import { IA_COMMUNICATION } from "@/lib/seminaires/ia-communication";

export const runtime = "nodejs";

/**
 * Renvoie le livret académique d'un séminaire au format Word (.docx).
 * Les slugs reconnus sont :
 *  - "magnifica-humanitas" → livret académique modulaire (9 modules)
 *  - "communication-pastorale" → livret SENEC (14 diapositives + 7 ateliers)
 *  - "ia-communication" → livret IA (diapositives + modules + ateliers)
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Séminaire diapositif Communication pastorale.
    if (slug === COMMUNICATION_PASTORALE.meta.slug) {
      const buffer = await buildCommPastoraleDocx(COMMUNICATION_PASTORALE);
      const filename = `Seminaire-Communication-Pastorale-Livret.docx`;
      return docxResponse(buffer, filename);
    }

    // Formation IA & communication (réutilise le même builder générique).
    if (slug === IA_COMMUNICATION.meta.slug) {
      const buffer = await buildCommPastoraleDocx(IA_COMMUNICATION);
      const filename = `Formation-IA-Communication-Livret.docx`;
      return docxResponse(buffer, filename);
    }

    // Séminaires modulaires existants (Magnifica Humanitas, etc.).
    const seminaire = (SEMINAIRES_REGISTRY as Record<string, (typeof SEMINAIRES_REGISTRY)[keyof typeof SEMINAIRES_REGISTRY] | undefined>)[slug];
    if (!seminaire) {
      return NextResponse.json(
        { error: `Séminaire « ${slug} » introuvable.` },
        { status: 404 },
      );
    }
    const buffer = await buildSeminaireDocx(seminaire);
    const safeTitle = seminaire.meta.title
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
    return docxResponse(buffer, `Seminaire-${safeTitle}-Livret.docx`);
  } catch (e) {
    return NextResponse.json(
      { error: "Échec de génération du livret.", detail: (e as Error).message },
      { status: 500 },
    );
  }
}

function docxResponse(buffer: Buffer, filename: string): NextResponse {
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "no-store",
    },
  });
}
