import { NextResponse } from "next/server";
import { buildGuideDocx } from "@/lib/docx/guide";
import { GUIDES } from "@/lib/guides";

export const runtime = "nodejs";

interface Context {
  params: Promise<{ role: string }>;
}

/**
 * Renvoie le guide utilisateur du rôle demandé au format Word (.docx).
 * Le fichier inclut le logo en couverture et dans l'entête de chaque page,
 * ainsi qu'une table des matières qui se met à jour à l'ouverture (champ Word).
 */
export async function GET(_req: Request, { params }: Context) {
  const { role } = await params;
  if (!GUIDES[role]) {
    return NextResponse.json({ error: "Guide inconnu." }, { status: 404 });
  }

  try {
    const buffer = await buildGuideDocx(role);
    const safeLabel = GUIDES[role].roleLabel
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9-]+/g, "-")
      .replace(/-+|-$/g, (m) => (m === "-" ? "-" : ""));
    const filename = `Guide-EduWeb-Planner-${safeLabel}.docx`;
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Échec de génération du guide Word.", detail: (e as Error).message },
      { status: 500 },
    );
  }
}
