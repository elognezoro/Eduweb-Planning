"use client";

import * as React from "react";
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

interface PersistedState {
  previewRole: UserRole | null;
  countryCode: string;
  regionCode: string | null;
  academicYearId: string;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Mode démo : utilisateur factice. Mode réel : profil chargé depuis Supabase après montage.
  const [user, setUser] = React.useState<UserProfile>(DEMO_USER);
  const realRole = user.role;
  const { roleOverrides, userGrants } = useStore();

  React.useEffect(() => {
    if (!isSupabaseConfigured()) return; // mode démo : on conserve DEMO_USER
    let active = true;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser || !active) return;
        const { data: p } = await supabase.from("profiles").select("*").eq("id", authUser.id).maybeSingle();
        if (!active) return;
        setUser((prev) => ({
          ...prev,
          id: authUser.id,
          email: (p?.email as string) || authUser.email || prev.email,
          firstName: (p?.first_name as string) || prev.firstName,
          lastName: (p?.last_name as string) || prev.lastName,
          displayName:
            (p?.display_name as string) ||
            [p?.first_name, p?.last_name].filter(Boolean).join(" ") ||
            authUser.email ||
            prev.displayName,
          phone: (p?.phone as string) ?? prev.phone,
          avatarUrl: (p?.avatar_url as string) ?? prev.avatarUrl,
          role: (p?.role as UserRole) || prev.role,
          status: (p?.status as UserProfile["status"]) || prev.status,
          jobTitle: (p?.job_title as string) ?? prev.jobTitle,
        }));
      } catch {
        /* conserve l'utilisateur courant en cas d'erreur réseau/DB */
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

  const effectiveRole = previewRole ?? realRole;

  const value: AppContextValue = {
    user,
    realRole,
    effectiveRole,
    isPreview: previewRole !== null,
    setPreviewRole: (role) => {
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
      // En aperçu d'un rôle : on applique le « template » du rôle (surcharges de la matrice incluses).
      if (previewRole !== null) {
        const key = `${effectiveRole}|${permission}`;
        if (key in roleOverrides) return roleOverrides[key];
        return hasPermission(effectiveRole, permission);
      }
      // Rôle réel : permissions du rôle, puis attributions temporaires actives (additives, jamais restrictives).
      if (hasPermission(effectiveRole, permission)) return true;
      const now = Date.now();
      return userGrants.some(
        (g) => g.userId === user.id && g.permission === permission && (g.expiresAt === null || new Date(g.expiresAt).getTime() > now),
      );
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp doit être utilisé dans <AppProvider>");
  return ctx;
}

export { COUNTRIES };
