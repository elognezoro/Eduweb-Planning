import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Détection du pays de l'utilisateur à partir de son IP, via les en-têtes de
 * géolocalisation injectés par l'hébergeur (Vercel : `x-vercel-ip-country` ;
 * Cloudflare : `cf-ipcountry`). Retourne `{ country: "CI" | null }` (ISO2).
 * Aucun appel externe : best-effort, l'utilisateur peut toujours ajuster.
 */
export async function GET(request: Request) {
  const h = request.headers;
  const raw =
    h.get("x-vercel-ip-country") ||
    h.get("cf-ipcountry") ||
    h.get("x-country-code") ||
    "";
  const code = raw.trim().toUpperCase();
  const country = /^[A-Z]{2}$/.test(code) && code !== "XX" ? code : null;
  return NextResponse.json({ country });
}
