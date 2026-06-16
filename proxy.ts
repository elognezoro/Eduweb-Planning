import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy (ex-Middleware en Next.js 16).
 *
 * En mode démo, il laisse passer toutes les requêtes. En production, c'est ici
 * que l'on rafraîchit la session Supabase (updateSession) et que l'on protège les
 * routes du tableau de bord (redirection vers /login si non authentifié).
 */
export function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
