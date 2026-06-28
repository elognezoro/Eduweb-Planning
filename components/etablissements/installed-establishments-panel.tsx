"use client";

import * as React from "react";
import { Building2, Plus, Trash2, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/components/app-shell/app-context";
import {
  EtablissementCombobox,
  type EtablissementSelection,
} from "@/components/etablissements/etablissement-combobox";
import {
  loadCiEtablissements,
  type CiEtablissement,
} from "@/lib/etablissements/ci-etablissements";
import { loadCountryEtablissements } from "@/lib/etablissements/country-etablissements";
import {
  ensureEstablishment,
  fetchInstalledEstablishments,
  deleteInstalledEstablishment,
  type InstalledEstablishment,
} from "@/lib/etablissements/etablissements-server";
import { cn } from "@/lib/utils";

/**
 * Panneau « Établissements installés » — limité au PAYS ACTIF et REGROUPÉ par
 * région académique (replié par défaut).
 *
 * L'appartenance à un pays se déduit du référentiel : un établissement installé
 * n'est affiché que si son code figure dans le référentiel du pays courant (CI =
 * 2921 ; autres pays = fichiers embarqués) — ou s'il s'agit d'une saisie libre.
 * Sa région provient du même référentiel (DRENA / wilaya / DRE…). Inerte hors réel.
 */
const REAL = isSupabaseConfigured();
const NO_REGION = "Sans région académique";

export function InstalledEstablishmentsPanel() {
  const { country } = useApp();
  const cc = country.code;

  const [items, setItems] = React.useState<InstalledEstablishment[]>([]);
  const [loading, setLoading] = React.useState(REAL);
  const [refMap, setRefMap] = React.useState<Map<string, CiEtablissement>>(new Map());
  const [refLoaded, setRefLoaded] = React.useState(false);
  const [sel, setSel] = React.useState<EtablissementSelection | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [open, setOpen] = React.useState<Set<string>>(new Set());

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

  // Référentiel du pays actif → carte code → établissement (membership + région).
  React.useEffect(() => {
    let alive = true;
    setRefLoaded(false);
    const loader = cc === "CI" ? loadCiEtablissements() : loadCountryEtablissements(cc);
    void loader.then((list) => {
      if (!alive) return;
      setRefMap(new Map(list.map((e) => [e.eduwebCode, e])));
      setRefLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, [cc]);

  // Établissements installés appartenant au pays actif (réf. ou saisie libre).
  const filtered = React.useMemo(
    () =>
      items.filter((it) => {
        const code = it.code ?? "";
        return refMap.has(code) || code.startsWith("LIBRE-");
      }),
    [items, refMap],
  );

  // Regroupement par région académique (triées).
  const groups = React.useMemo(() => {
    const map = new Map<string, InstalledEstablishment[]>();
    for (const it of filtered) {
      const region = refMap.get(it.code ?? "")?.drena || NO_REGION;
      const arr = map.get(region);
      if (arr) arr.push(it);
      else map.set(region, [it]);
    }
    return [...map.entries()].sort((a, b) =>
      a[0] === NO_REGION ? 1 : b[0] === NO_REGION ? -1 : a[0].localeCompare(b[0], "fr"),
    );
  }, [filtered, refMap]);

  if (!REAL) return null;

  const toggle = (region: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });

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
          Établissements installés ({country.nameFr}) — {filtered.length}
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Ajoutez les établissements que vous exploitez : ils deviennent disponibles pour les
        fonctionnalités par établissement (transport, délégation chef d&apos;établissement…).
        La liste est limitée au pays sélectionné et regroupée par région académique.
      </p>

      {/* Ajout depuis le référentiel du pays actif */}
      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-ew-green-300 bg-background/60 p-3">
        <div className="min-w-0 flex-1">
          <EtablissementCombobox
            value={sel}
            onChange={setSel}
            countryCode={cc}
            placeholder={`Rechercher un établissement (${country.nameFr})…`}
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

      {/* Liste repliée par région */}
      {loading || !refLoaded ? (
        <p className="px-1 py-3 text-sm text-muted-foreground">Chargement…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-background/60 p-3 text-center text-sm text-muted-foreground">
          Aucun établissement installé pour {country.nameFr}. Ajoutez-en depuis le référentiel ci-dessus.
        </p>
      ) : (
        <div className="space-y-1.5">
          {groups.map(([region, list]) => {
            const isOpen = open.has(region);
            return (
              <div key={region} className="overflow-hidden rounded-lg border border-border bg-card">
                <button
                  type="button"
                  onClick={() => toggle(region)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-muted/40"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", !isOpen && "-rotate-90")} />
                    <span className="truncate text-sm font-semibold text-foreground">{region}</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-ew-green-100 px-2 py-0.5 text-[11px] font-bold text-ew-green-700">
                    {list.length}
                  </span>
                </button>
                {isOpen && (
                  <ul className="divide-y divide-border border-t border-border">
                    {list.map((it) => (
                      <li key={it.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
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
          })}
        </div>
      )}
    </div>
  );
}
