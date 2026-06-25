import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/** Préfixes des routes du tableau de bord (protégées en mode réel).
 *  NB : tout segment de premier niveau sous app/(dashboard)/ doit figurer ici,
 *  sinon une session expirée n'est pas redirigée vers /login et l'utilisateur
 *  tombe sur l'écran fail-closed « Profil indisponible » (perçu comme « aucune
 *  réaction » au clic). `/aide` (Aide & Formation) et `/formations` manquaient. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/systeme",
  "/vie-scolaire",
  "/statistiques",
  "/inspection-supervision",
  "/parametrage",
  "/pilotage",
  "/aide",
  "/formations",
];
const AUTH_PAGES = ["/login", "/register", "/reset-password"];

const isProtected = (path: string) =>
  PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * Rafraîchit la session Supabase et protège les routes.
 * En mode démo (Supabase non configuré), laisse tout passer.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // IMPORTANT : ne rien exécuter entre createServerClient et getUser (rafraîchit le jeton).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Non authentifié sur une route protégée → redirection vers /login (avec retour).
  if (!user && isProtected(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  // Authentifié sur une page d'auth → redirection vers le tableau de bord.
  if (user && AUTH_PAGES.includes(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
