import { NextResponse } from "next/server";
import { buildCertificateDocx, type CertificateData } from "@/lib/docx/certificat";

export const runtime = "nodejs";

/**
 * Renvoie le « Certificat de fin de formation » au format Word (.docx).
 *
 * - GET  → version simple via query string (compat. modèle vierge depuis la
 *          bibliothèque d'aide). Convient quand on n'a pas besoin de signature
 *          scannée ou de cachet — les champs facultatifs (name, role, number,
 *          date) pré-remplissent le certificat.
 * - POST → version riche avec body JSON pouvant transporter, en plus des
 *          champs ci-dessus, l'identité de l'établissement (institution,
 *          headName, headFunction, ministère, pays, devise) ainsi que la
 *          signature scannée et le cachet de l'établissement encodés en
 *          data URL (PNG/JPEG en base64). Utilisé depuis la page interactive
 *          de délivrance des certificats.
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
    return docxResponse(buffer, "Certificat-EduWeb-Planner.docx");
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CertificateData;
    const buffer = await buildCertificateDocx(body);
    const safeName = sanitizeFilename(body.beneficiaryName);
    const safeNumber = sanitizeFilename(body.certificateNumber);
    const filename = safeName
      ? `Certificat-${safeName}${safeNumber ? `-${safeNumber}` : ""}.docx`
      : "Certificat-EduWeb-Planner.docx";
    return docxResponse(buffer, filename);
  } catch (e) {
    return errorResponse(e);
  }
}

function docxResponse(buffer: Buffer, filename: string): NextResponse {
  return new NextResponse(buffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(buffer.length),
      "Cache-Control": "no-store",
    },
  });
}

function errorResponse(e: unknown): NextResponse {
  return NextResponse.json(
    { error: "Échec de génération du certificat.", detail: (e as Error).message },
    { status: 500 },
  );
}

function sanitizeFilename(value?: string | null): string {
  if (!value) return "";
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
