"use client";

import * as React from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { DEMO_USER } from "@/lib/mock-data";
import { hasPermission } from "@/lib/permissions";
import type { Permission } from "@/lib/permissions";
import { useStore } from "@/components/app-shell/data-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/lib/roles";
import type { UserProfile } from "@/lib/types";
import { COUNTRIES, getCountry, type CountryConfig } from "@/config/countries";
import { ACADEMIC_YEARS, CURRENT_ACADEMIC_YEAR, type AcademicYear } from "@/lib/countries";

interface AppContextValue {
  user: UserProfile;
  realRole: UserRole;
  effectiveRole: UserRole;
  isPreview: boolean;
  setPreviewRole: (role: UserRole) => void;
  exitPreview: () => void;
  country: CountryConfig;
  setCountryCode: (code: string) => void;
  regionCode: string | null;
  setRegionCode: (code: string | null) => void;
  academicYear: AcademicYear;
  setAcademicYearId: (id: string) => void;
  can: (permission: Permission) => boolean;
}

const AppContext = React.createContext<AppContextValue | null>(null);

const LS_KEY = "eduweb.context.v1";

/** Mode backend figé au build (variables NEXT_PUBLIC_*). */
const REAL_MODE = isSupabaseConfigured();

/**
 * Profil « invité » utilisé en mode réel AVANT le chargement du profil Supabase.
 * Rôle au plus faible privilège : aucune interface d'administration ne peut fuiter
 * pendant le chargement, et tout échec de chargement reste sans privilège (fail-closed).
 */
const GUEST_USER: UserProfile = {
  ...DEMO_USER,
  id: "",
  firstName: "",
  lastName: "",
  displayName: "—",
  email: "",
  phone: undefined,
  avatarUrl: null,
  role: "eleve",
  status: "pending",
  jobTitle: "",
};

type ProfileState = "loading" | "ready" | "error";

interface PersistedState {
  previewRole: UserRole | null;
  countryCode: string;
  regionCode: string | null;
  academicYearId: string;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Mode démo : utilisateur factice (administrateur de la vitrine) — accès complet voulu.
  // Mode réel : profil chargé depuis Supabase ; tout échec → AUCUN accès (jamais admin par défaut).
  const [user, setUser] = React.useState<UserProfile>(REAL_MODE ? GUEST_USER : DEMO_USER);
  const [profileState, setProfileState] = React.useState<ProfileState>(REAL_MODE ? "loading" : "ready");
  const realRole = user.role;
  const { roleOverrides, userGrants } = useStore();

  React.useEffect(() => {
    if (!REAL_MODE) return; // mode démo : on conserve DEMO_USER (vitrine)
    let active = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!active) return;
        if (!authUser) {
          // Pas de session côté client → aucun accès (le middleware aurait dû rediriger).
          setProfileState("error");
          return;
        }
        let { data: p } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
        if (!active) return;
        // Auto-provisionnement : compte authentifié sans profil (créé avant le trigger) →
        // on crée un profil au plus faible privilège (élève / en attente), jamais admin.
        if (!p) {
          const { data: created } = await supabase
            .from("profiles")
            .insert({ id: authUser.id, email: authUser.email ?? null, role: "eleve", status: "pending" })
            .select("*")
            .maybeSingle();
          if (!active) return;
          p = created ?? null;
        }
        if (!p || !p.role) {
          // Profil introuvable / illisible / sans rôle → fail-closed (aucun privilège).
          setProfileState("error");
          return;
        }
        const profile = p;
        setUser((prev) => ({
          ...prev,
          id: authUser.id,
          email: (profile.email as string) || authUser.email || prev.email,
          firstName: (profile.first_name as string) || prev.firstName,
          lastName: (profile.last_name as string) || prev.lastName,
          displayName:
            (profile.display_name as string) ||
            [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
            authUser.email ||
            prev.displayName,
          phone: (profile.phone as string) ?? prev.phone,
          avatarUrl: (profile.avatar_url as string) ?? prev.avatarUrl,
          // Rôle AUTORITAIRE issu de la base — plus aucun repli sur le rôle précédent.
          role: profile.role as UserRole,
          status: (profile.status as UserProfile["status"]) || prev.status,
          jobTitle: (profile.job_title as string) ?? prev.jobTitle,
        }));
        setProfileState("ready");
      } catch {
        // Erreur réseau / base → aucun accès (pas de repli sur un rôle privilégié).
        if (active) setProfileState("error");
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const [previewRole, setPreviewRoleState] = React.useState<UserRole | null>(null);
  const [countryCode, setCountryCodeState] = React.useState<string>(user.countryCode);
  const [regionCode, setRegionCodeState] = React.useState<string | null>(user.academicRegionCode ?? null);
  const [academicYearId, setAcademicYearIdState] = React.useState<string>(CURRENT_ACADEMIC_YEAR.id);

  // Hydrate depuis localStorage après montage (évite les écarts d'hydratation).
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedState;
        if (parsed.previewRole) setPreviewRoleState(parsed.previewRole);
        if (parsed.countryCode) setCountryCodeState(parsed.countryCode);
        setRegionCodeState(parsed.regionCode ?? null);
        if (parsed.academicYearId) setAcademicYearIdState(parsed.academicYearId);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persist = React.useCallback(
    (next: Partial<PersistedState>) => {
      const state: PersistedState = {
        previewRole,
        countryCode,
        regionCode,
        academicYearId,
        ...next,
      };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(state));
      } catch {
        /* ignore */
      }
    },
    [previewRole, countryCode, regionCode, academicYearId],
  );

  // L'aperçu de rôle n'est appliqué QUE si le rôle réel y est habilité — un éventuel
  // `previewRole` résiduel (ancienne session démo) ne peut donc jamais élever les droits.
  const canPreviewRoles = hasPermission(realRole, "role_preview:use");
  const effectiveRole: UserRole = canPreviewRoles && previewRole ? previewRole : realRole;
  const isPreview = canPreviewRoles && previewRole !== null;
  // Accès verrouillé tant que le profil réel n'est pas confirmé (mode réel uniquement).
  const accessReady = !REAL_MODE || profileState === "ready";

  const value: AppContextValue = {
    user,
    realRole,
    effectiveRole,
    isPreview,
    setPreviewRole: (role) => {
      if (!canPreviewRoles) return; // garde-fou : rôle non habilité à l'aperçu
      setPreviewRoleState(role);
      persist({ previewRole: role });
    },
    exitPreview: () => {
      setPreviewRoleState(null);
      persist({ previewRole: null });
    },
    country: getCountry(countryCode),
    setCountryCode: (code) => {
      setCountryCodeState(code);
      const c = getCountry(code);
      const firstRegion = c.academicRegions[0]?.code ?? null;
      setRegionCodeState(firstRegion);
      persist({ countryCode: code, regionCode: firstRegion });
    },
    regionCode,
    setRegionCode: (code) => {
      setRegionCodeState(code);
      persist({ regionCode: code });
    },
    academicYear: ACADEMIC_YEARS.find((y) => y.id === academicYearId) ?? CURRENT_ACADEMIC_YEAR,
    setAcademicYearId: (id) => {
      setAcademicYearIdState(id);
      persist({ academicYearId: id });
    },
    can: (permission) => {
      // Fail-closed : aucun droit tant que le profil réel n'est pas chargé/confirmé.
      if (!accessReady) return false;
      // En aperçu d'un rôle (profil habilité) : on applique le « template » du rôle prévisualisé.
      if (isPreview) {
        const key = `${effectiveRole}|${permission}`;
        if (key in roleOverrides) return roleOverrides[key];
        return hasPermission(effectiveRole, permission);
      }
      // Rôle réel : permissions du rôle, puis attributions temporaires actives (additives, jamais restrictives).
      if (hasPermission(realRole, permission)) return true;
      const now = Date.now();
      return userGrants.some(
        (g) => g.userId === user.id && g.permission === permission && (g.expiresAt === null || new Date(g.expiresAt).getTime() > now),
      );
    },
  };

  return (
    <AppContext.Provider value={value}>
      {REAL_MODE && profileState === "loading" ? (
        <ProfileGate variant="loading" />
      ) : REAL_MODE && profileState === "error" ? (
        <ProfileGate variant="error" />
      ) : (
        children
      )}
    </AppContext.Provider>
  );
}

/** Écran de garde affiché tant que le profil réel n'est pas confirmé (chargement / erreur). */
function ProfileGate({ variant }: { variant: "loading" | "error" }) {
  const signOut = async () => {
    try {
      await createClient().auth.signOut();
    } catch {
      /* ignore */
    }
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      {variant === "loading" ? (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-ew-green-700" />
          <p className="text-sm text-muted-foreground">Chargement de votre espace…</p>
        </>
      ) : (
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ew-gold-100">
            <ShieldAlert className="h-6 w-6 text-ew-gold-600" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Profil indisponible</h1>
          <p className="text-sm text-muted-foreground">
            Votre profil n&apos;a pas pu être chargé. Par sécurité, aucun accès n&apos;est accordé. Reconnectez-vous ; si
            le problème persiste, contactez l&apos;administrateur de la plateforme.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Réessayer
            </button>
            <button
              onClick={signOut}
              className="rounded-lg bg-ew-green-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ew-green-800"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function useApp(): AppContextValue {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp doit être utilisé dans <AppProvider>");
  return ctx;
}

export { COUNTRIES };
