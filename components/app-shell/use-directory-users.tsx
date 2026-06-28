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
  /**
   * Crée un compte CONNECTABLE : en mode réel, un vrai utilisateur Auth (mot de
   * passe, e-mail confirmé) via la route serviceur + le profil ; en démo, ajout
   * local. Renvoie { ok, error? }.
   */
  createAccount: (input: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: UserRole;
    password: string;
    status?: DirectoryUser["status"];
  }) => Promise<{ ok: boolean; error?: string }>;
  updateUser: (id: string, patch: Partial<DirectoryUser>) => void;
  setUserStatus: (id: string, status: DirectoryUser["status"]) => void;
  removeUser: (id: string) => void;
  removeUsers: (ids: string[]) => void;
  /** Suppression DÉFINITIVE (irréversible). Renvoie ok + message d'erreur. */
  deleteUserPermanently: (
    id: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  /** Suppression DÉFINITIVE en lot. Renvoie un récapitulatif. */
  deleteUsersPermanently: (
    ids: string[],
  ) => Promise<{ deleted: number; failed: number; firstError?: string }>;
}

const Ctx = React.createContext<DirectoryUsersValue | null>(null);

const REAL_MODE = isSupabaseConfigured();

/** Profil Supabase → forme `DirectoryUser` utilisée par l'UI. */
function mapProfile(
  row: Record<string, unknown>,
  etabNames: Map<string, string>,
): DirectoryUser {
  const name =
    (row.display_name as string) ||
    [row.last_name, row.first_name].filter(Boolean).join(" ") ||
    (row.email as string) ||
    "—";
  const etabId = (row.etablissement_id as string | null) ?? null;
  return {
    id: row.id as string,
    name,
    email: (row.email as string) ?? "",
    role: ((row.role as UserRole) ?? "eleve") as UserRole,
    status: (row.status as DirectoryUser["status"]) ?? "pending",
    etablissement: etabId ? (etabNames.get(etabId) ?? "") : "",
    etablissementId: etabId,
    region: "",
    phone: (row.phone as string) ?? undefined,
    // Pays réel du profil (ISO2 dénormalisé, migration 034) ; CI par défaut.
    country: ((row.country_code as string) || "CI").toUpperCase(),
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
      const [profilesRes, etabRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("etablissements").select("id, name"),
      ]);
      if (profilesRes.error) {
        toast.error("Chargement des comptes impossible", {
          description: profilesRes.error.message,
        });
        return;
      }
      const etabNames = new Map<string, string>();
      for (const e of etabRes.data ?? []) {
        const row = e as Record<string, unknown>;
        etabNames.set(row.id as string, (row.name as string) ?? "");
      }
      setRealUsers(
        (profilesRes.data ?? []).map((r) =>
          mapProfile(r as Record<string, unknown>, etabNames),
        ),
      );
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
          toast.info("Utilisez « Créer le compte »", {
            description:
              "La création passe par le formulaire (compte Auth + mot de passe).",
          }),
        createAccount: async (input) => {
          try {
            const res = await fetch("/api/admin/users/create", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: input.email,
                password: input.password,
                firstName: input.firstName,
                lastName: input.lastName,
                phone: input.phone ?? "",
                role: input.role,
                status: input.status ?? "pending",
              }),
            });
            const data = (await res.json().catch(() => ({}))) as {
              error?: string;
            };
            if (!res.ok) {
              return { ok: false, error: data.error ?? `Erreur ${res.status}` };
            }
            await refresh();
            return { ok: true };
          } catch {
            return { ok: false, error: "Route de création injoignable (réseau)." };
          }
        },
        updateUser: (id, patch) => {
          const dbPatch: Record<string, unknown> = {};
          if (patch.role) dbPatch.role = patch.role;
          if (patch.name) dbPatch.display_name = patch.name;
          // Rattachement à un établissement (UUID) — null = détacher. Active la
          // délégation chef_etablissement côté RLS transport.
          if (patch.etablissementId !== undefined) {
            dbPatch.etablissement_id = patch.etablissementId;
          }
          if (Object.keys(dbPatch).length === 0) return;
          void patchProfile([id], dbPatch, patch);
        },
        setUserStatus: (id, status) => {
          void patchProfile([id], { status }, { status });
          // Valider un compte doit aussi confirmer son e-mail côté Auth : sinon un
          // compte auto-inscrit (confirmation d'e-mail requise) ne peut pas se
          // connecter, même passé en « actif ».
          if (status === "active") {
            void fetch("/api/admin/users/confirm-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: id }),
            })
              .then((r) => r.json().catch(() => ({})))
              .then((d: { error?: string }) => {
                if (d?.error) {
                  toast.warning("Compte validé, mais e-mail non confirmé", {
                    description: d.error,
                  });
                }
              })
              .catch(() => {});
          }
        },
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
        deleteUserPermanently: async (id) => {
          try {
            const res = await fetch("/api/admin/users/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: id }),
            });
            const data = (await res.json().catch(() => ({}))) as {
              error?: string;
            };
            if (!res.ok) {
              return { ok: false, error: data.error ?? `Erreur ${res.status}` };
            }
            setRealUsers((us) => us.filter((u) => u.id !== id));
            return { ok: true };
          } catch {
            return {
              ok: false,
              error: "Route de suppression injoignable (réseau).",
            };
          }
        },
        deleteUsersPermanently: async (ids) => {
          const deleted: string[] = [];
          let firstError: string | undefined;
          for (const id of ids) {
            try {
              const res = await fetch("/api/admin/users/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: id }),
              });
              const data = (await res.json().catch(() => ({}))) as {
                error?: string;
              };
              if (res.ok) deleted.push(id);
              else if (!firstError) firstError = data.error ?? `Erreur ${res.status}`;
            } catch {
              if (!firstError) firstError = "Erreur réseau";
            }
          }
          if (deleted.length) {
            setRealUsers((us) => us.filter((u) => !deleted.includes(u.id)));
          }
          return { deleted: deleted.length, failed: ids.length - deleted.length, firstError };
        },
      }
    : {
        users: store.users,
        loading: false,
        realMode: false,
        refresh: () => {},
        addUser: store.addUser,
        createAccount: async (input) => {
          store.addUser({
            name: `${input.lastName.trim()} ${input.firstName.trim()}`.trim(),
            email: input.email.trim(),
            role: input.role,
            status: input.status ?? "pending",
            etablissement: "",
            region: "",
            phone: input.phone?.trim() || undefined,
            country: "CI",
            createdAt: new Date().toISOString(),
          });
          return { ok: true };
        },
        updateUser: store.updateUser,
        setUserStatus: store.setUserStatus,
        removeUser: store.removeUser,
        removeUsers: store.removeUsers,
        deleteUserPermanently: async (id) => {
          // Mode démo : suppression locale réelle (le store retire la ligne).
          store.removeUser(id);
          return { ok: true };
        },
        deleteUsersPermanently: async (ids) => {
          store.removeUsers(ids);
          return { deleted: ids.length, failed: 0 };
        },
      };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDirectoryUsers(): DirectoryUsersValue {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useDirectoryUsers doit être utilisé dans <DirectoryUsersProvider>");
  return ctx;
}
