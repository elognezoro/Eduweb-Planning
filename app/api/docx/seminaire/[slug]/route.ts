import { NextResponse } from "next/server";
import { buildSeminaireDocx } from "@/lib/docx/seminaire";
import { SEMINAIRES_REGISTRY } from "@/lib/seminaires/magnifica-humanitas";

export const runtime = "nodejs";

/**
 * Renvoie le livret académique d'un séminaire au format Word (.docx).
 * Le slug doit correspondre à une entrée du registre des séminaires.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const seminaire = (SEMINAIRES_REGISTRY as Record<string, (typeof SEMINAIRES_REGISTRY)[keyof typeof SEMINAIRES_REGISTRY] | undefined>)[slug];
    if (!seminaire) {
      return NextResponse.json({ error: `Séminaire « ${slug} » introuvable.` }, { status: 404 });
    }
    const buffer = await buildSeminaireDocx(seminaire);
    const safeTitle = seminaire.meta.title
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
    const filename = `Seminaire-${safeTitle}-Livret.docx`;
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
  } catch (e) {
    return NextResponse.json(
      { error: "Échec de génération du livret.", detail: (e as Error).message },
      { status: 500 },
    );
  }
}
