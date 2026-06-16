import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Proxy (ex-Middleware en Next.js 16).
 *
 * En mode démo (Supabase non configuré), `updateSession` laisse passer toutes
 * les requêtes. En mode réel, il rafraîchit la session Supabase et protège les
 * routes du tableau de bord (redirection vers /login si non authentifié).
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
