"use client";

import * as React from "react";
import { Building2, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import {
  EtablissementCombobox,
  type EtablissementSelection,
} from "@/components/etablissements/etablissement-combobox";
import {
  ensureEstablishment,
  fetchInstalledEstablishments,
  deleteInstalledEstablishment,
  type InstalledEstablishment,
} from "@/lib/etablissements/etablissements-server";

/**
 * Panneau « Établissements installés (Côte d'Ivoire) ».
 *
 * Source de vérité Supabase des établissements réellement utilisés par les
 * fonctionnalités par établissement (transport, délégation chef…). L'admin
 * ajoute un établissement depuis le référentiel CI (2921) — il est matérialisé
 * (UUID) au moment de l'ajout — et peut le retirer. Inerte hors mode réel.
 */
const REAL = isSupabaseConfigured();

export function InstalledEstablishmentsPanel() {
  const [items, setItems] = React.useState<InstalledEstablishment[]>([]);
  const [loading, setLoading] = React.useState(REAL);
  const [sel, setSel] = React.useState<EtablissementSelection | null>(null);
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!REAL) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setItems(await fetchInstalledEstablishments(createClient()));
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (!REAL) return null;

  async function add() {
    if (!sel) return;
    setAdding(true);
    const res = await ensureEstablishment(createClient(), sel);
    setAdding(false);
    if (res.id) {
      toast.success("Établissement ajouté", { description: sel.name });
      setSel(null);
      await load();
    } else {
      toast.error("Ajout impossible", { description: res.error });
    }
  }

  async function remove(it: InstalledEstablishment) {
    const res = await deleteInstalledEstablishment(createClient(), it.id);
    if (res.ok) {
      setItems((xs) => xs.filter((x) => x.id !== it.id));
    } else {
      toast.error("Suppression impossible", {
        description:
          res.error?.includes("foreign key") || res.error?.includes("violates")
            ? "Cet établissement est utilisé (transport, comptes…) — détachez-le d'abord."
            : res.error,
      });
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-ew-green-200 bg-ew-green-50/30 p-5">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-ew-green-700" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          Établissements installés (Côte d&apos;Ivoire) — {items.length}
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Référentiel officiel de 2921 établissements secondaires. Ajoutez ceux que
        vous exploitez : ils deviennent disponibles pour les fonctionnalités par
        établissement (transport, délégation chef d&apos;établissement…).
      </p>

      {/* Ajout depuis le référentiel */}
      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-ew-green-300 bg-background/60 p-3">
        <div className="min-w-0 flex-1">
          <EtablissementCombobox
            value={sel}
            onChange={setSel}
            placeholder="Rechercher un établissement à installer…"
          />
        </div>
        <button
          type="button"
          disabled={!sel || adding}
          onClick={() => void add()}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-ew-green-700 px-3 text-sm font-semibold text-white hover:bg-ew-green-800 disabled:opacity-50"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Installer
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <p className="px-1 py-3 text-sm text-muted-foreground">Chargement…</p>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-background/60 p-3 text-center text-sm text-muted-foreground">
          Aucun établissement installé. Ajoutez-en depuis le référentiel ci-dessus.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">{it.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {it.code ? `EduWeb ${it.code}` : "—"}
                  {it.dspsCode ? ` · DSPS ${it.dspsCode}` : ""}
                </span>
              </span>
              <button
                type="button"
                onClick={() => void remove(it)}
                className="rounded-md border border-border px-2 py-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                title="Retirer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
