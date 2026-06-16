"use client";

import * as React from "react";
import { toast } from "sonner";
import { useStore } from "./data-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import type { DirectoryUser } from "@/lib/mock-data";
import type { UserRole } from "@/lib/roles";

/**
 * Source de données « comptes utilisateurs » en double mode.
 * - Mode réel (Supabase configuré) : lit/écrit la table `profiles` (l'admin voit
 *   tous les comptes via RLS, peut valider/suspendre/archiver et changer les rôles).
 * - Mode démo : délègue au store localStorage (comportement vitrine inchangé).
 *
 * Fournie via contexte pour qu'une seule requête alimente la page ET les actions
 * de chaque ligne (pas de rechargement par ligne).
 */
interface DirectoryUsersValue {
  users: DirectoryUser[];
  loading: boolean;
  realMode: boolean;
  refresh: () => void;
  addUser: (u: Omit<DirectoryUser, "id">) => void;
  updateUser: (id: string, patch: Partial<DirectoryUser>) => void;
  setUserStatus: (id: string, status: DirectoryUser["status"]) => void;
  removeUser: (id: string) => void;
  removeUsers: (ids: string[]) => void;
}

const Ctx = React.createContext<DirectoryUsersValue | null>(null);

const REAL_MODE = isSupabaseConfigured();

/** Profil Supabase → forme `DirectoryUser` utilisée par l'UI. */
function mapProfile(row: Record<string, unknown>): DirectoryUser {
  const name =
    (row.display_name as string) ||
    [row.last_name, row.first_name].filter(Boolean).join(" ") ||
    (row.email as string) ||
    "—";
  return {
    id: row.id as string,
    name,
    email: (row.email as string) ?? "",
    role: ((row.role as UserRole) ?? "eleve") as UserRole,
    status: (row.status as DirectoryUser["status"]) ?? "pending",
    etablissement: "",
    region: "",
    phone: (row.phone as string) ?? undefined,
    country: "CI",
    createdAt: (row.created_at as string) ?? undefined,
  };
}

export function DirectoryUsersProvider({ children }: { children: React.ReactNode }) {
  const store = useStore();
  const [realUsers, setRealUsers] = React.useState<DirectoryUser[]>([]);
  const [loading, setLoading] = React.useState(REAL_MODE);

  const refresh = React.useCallback(async () => {
    if (!REAL_MODE) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("Chargement des comptes impossible", { description: error.message });
        return;
      }
      setRealUsers((data ?? []).map((r) => mapProfile(r as Record<string, unknown>)));
    } catch {
      toast.error("Chargement des comptes impossible");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  /** Applique une mise à jour `profiles` puis met l'état local à jour (optimiste). */
  const patchProfile = React.useCallback(
    async (ids: string[], dbPatch: Record<string, unknown>, localPatch: Partial<DirectoryUser>) => {
      try {
        const supabase = createClient();
        const query = supabase.from("profiles").update(dbPatch);
        const { error } = ids.length === 1 ? await query.eq("id", ids[0]) : await query.in("id", ids);
        if (error) {
          toast.error("Mise à jour refusée", { description: error.message });
          void refresh();
          return;
        }
        setRealUsers((us) => us.map((u) => (ids.includes(u.id) ? { ...u, ...localPatch } : u)));
      } catch {
        toast.error("Mise à jour impossible");
        void refresh();
      }
    },
    [refresh],
  );

  const value: DirectoryUsersValue = REAL_MODE
    ? {
        users: realUsers,
        loading,
        realMode: true,
        refresh: () => void refresh(),
        addUser: () =>
          toast.info("Création manuelle indisponible en production", {
            description:
              "Les utilisateurs créent eux-mêmes leur compte (page « Créer un compte ») ; validez-les ici dès leur inscription.",
          }),
        updateUser: (id, patch) => {
          const dbPatch: Record<string, unknown> = {};
          if (patch.role) dbPatch.role = patch.role;
          if (patch.name) dbPatch.display_name = patch.name;
          if (Object.keys(dbPatch).length === 0) return;
          void patchProfile([id], dbPatch, patch);
        },
        setUserStatus: (id, status) => void patchProfile([id], { status }, { status }),
        removeUser: (id) => {
          // Suppression définitive réservée au serveur (RLS) → archivage (réversible).
          void patchProfile([id], { status: "archived" }, { status: "archived" });
          toast("Compte archivé", {
            description: "La suppression définitive d'un compte se fait côté serveur ; le compte a été archivé.",
          });
        },
        removeUsers: (ids) => {
          void patchProfile(ids, { status: "archived" }, { status: "archived" });
          toast("Comptes archivés", {
            description: "La suppression définitive se fait côté serveur ; les comptes ont été archivés.",
          });
        },
      }
    : {
        users: store.users,
        loading: false,
        realMode: false,
        refresh: () => {},
        addUser: store.addUser,
        updateUser: store.updateUser,
        setUserStatus: store.setUserStatus,
        removeUser: store.removeUser,
        removeUsers: store.removeUsers,
      };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDirectoryUsers(): DirectoryUsersValue {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useDirectoryUsers doit être utilisé dans <DirectoryUsersProvider>");
  return ctx;
}
