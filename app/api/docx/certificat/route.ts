import { NextResponse } from "next/server";
import { buildCertificateDocx } from "@/lib/docx/certificat";

export const runtime = "nodejs";

/**
 * Renvoie le « Certificat de fin de formation » au format Word (.docx).
 * Les champs facultatifs (name, role, number, date) passent par la query
 * string et pré-remplissent le certificat.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const buffer = await buildCertificateDocx({
      beneficiaryName: url.searchParams.get("name") ?? undefined,
      beneficiaryRole: url.searchParams.get("role") ?? undefined,
      certificateNumber: url.searchParams.get("number") ?? undefined,
      issueDate: url.searchParams.get("date") ?? undefined,
    });
    const filename = "Certificat-EduWeb-Planner.docx";
    return new NextResponse(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Échec de génération du certificat.", detail: (e as Error).message },
      { status: 500 },
    );
  }
}
