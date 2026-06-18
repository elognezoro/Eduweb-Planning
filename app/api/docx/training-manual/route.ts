import { NextResponse } from "next/server";
import { buildTrainingManualDocx } from "@/lib/docx/manuel";
import { TRAINING_SYLLABUS } from "@/lib/guides/training-manual-data";

export const runtime = "nodejs";

/**
 * Renvoie le support de formation académique complet au format Word (.docx).
 * Le fichier est :
 * - composé par `buildTrainingManualDocx()` (logo en couverture + entête de
 *   chaque page, table des matières automatique mise à jour à l'ouverture)
 * - téléchargé sous un nom signifiant (code de référence + version)
 */
export async function GET() {
  try {
    const buffer = await buildTrainingManualDocx();
    const id = TRAINING_SYLLABUS.identification;
    const filename = `${id.code}-v${id.version}-Manuel-Formation.docx`;
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
      { error: "Échec de génération du manuel Word.", detail: (e as Error).message },
      { status: 500 },
    );
  }
}
