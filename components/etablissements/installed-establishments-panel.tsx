"use client";

import * as React from "react";
import { Building2, Plus, Trash2, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { useAcademicRegions } from "@/components/app-shell/use-academic-regions";
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
 * Il affiche l'UNION de deux sources, dédoublonnée par code :
 *   - le RÉPERTOIRE (slice store) : les établissements que vous créez/importez
 *     (leur région provient de leur champ `academicRegionCode`, qui peut être un
 *     code de démo ou un nom de saisie → on normalise vers le nom canonique) ;
 *   - les établissements INSTALLÉS en base (Supabase, mode réel) pour les
 *     fonctionnalités par établissement (région issue du référentiel du pays).
 */
const REAL = isSupabaseConfigured();
const NO_REGION = "Sans région académique";

interface PanelRow {
  key: string;
  id: string;
  name: string;
  code: string | null;
  sub: string;
  region: string;
  source: "store" | "supabase";
}

export function InstalledEstablishmentsPanel() {
  const { country } = useApp();
  const cc = country.code;
  const regions = useAcademicRegions(cc);
  const { etablissements, removeEtablissements } = useStore();

  const [installed, setInstalled] = React.useState<InstalledEstablishment[]>([]);
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
    setInstalled(await fetchInstalledEstablishments(createClient()));
    setLoading(false);
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Référentiel du pays actif → carte code → établissement (région du référentiel).
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

  // Résout une région stockée (code OU nom) vers le NOM canonique de la région.
  const regionName = React.useCallback(
    (raw: string | null | undefined): string => {
      const v = (raw ?? "").trim();
      if (!v) return NO_REGION;
      const byCode = regions.find((r) => r.code === v);
      if (byCode) return byCode.name;
      const byName = regions.find((r) => r.name.toLowerCase() === v.toLowerCase());
      if (byName) return byName.name;
      return v; // saisie libre
    },
    [regions],
  );

  // Union répertoire (store) + installés (Supabase), dédoublonnée par code.
  const rows = React.useMemo<PanelRow[]>(() => {
    const out: PanelRow[] = [];
    const seen = new Set<string>();
    // 1) Répertoire du pays actif.
    for (const e of etablissements) {
      if (e.countryCode !== cc) continue;
      const key = (e.code || e.id).toLowerCase();
      seen.add(key);
      out.push({
        key,
        id: e.id,
        name: e.name,
        code: e.code || null,
        sub: e.locality || "",
        region: regionName(e.academicRegionCode),
        source: "store",
      });
    }
    // 2) Installés Supabase non déjà présents — filtrés sur le PAYS ACTIF via
    //    l'iso2 réel (jointure countries). Repli référentiel/saisie libre pour
    //    d'anciennes lignes sans pays résolu. Région = texte stocké (migr. 041),
    //    sinon référentiel. C'est ce qui rend un établissement custom (créé sur
    //    un autre poste) visible ici, groupé sous sa vraie région.
    for (const it of installed) {
      const code = it.code ?? "";
      const key = (code || it.id).toLowerCase();
      if (seen.has(key)) continue;
      const belongs =
        it.countryCode != null
          ? it.countryCode === cc
          : refMap.has(code) || code.startsWith("LIBRE-");
      if (!belongs) continue;
      seen.add(key);
      out.push({
        key,
        id: it.id,
        name: it.name,
        code: it.code ?? null,
        sub: it.locality || (it.dspsCode ? `DSPS ${it.dspsCode}` : ""),
        region: it.regionName ? regionName(it.regionName) : refMap.get(code)?.drena || NO_REGION,
        source: "supabase",
      });
    }
    return out;
  }, [etablissements, installed, cc, refMap, regionName]);

  const groups = React.useMemo(() => {
    const map = new Map<string, PanelRow[]>();
    for (const r of rows) {
      const arr = map.get(r.region);
      if (arr) arr.push(r);
      else map.set(r.region, [r]);
    }
    return [...map.entries()].sort((a, b) =>
      a[0] === NO_REGION ? 1 : b[0] === NO_REGION ? -1 : a[0].localeCompare(b[0], "fr"),
    );
  }, [rows]);

  const toggle = (region: string) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });

  async function add() {
    if (!sel || !REAL) return;
    setAdding(true);
    const res = await ensureEstablishment(createClient(), sel);
    setAdding(false);
    if (res.id) {
      toast.success("Établissement installé", { description: sel.name });
      setSel(null);
      await load();
    } else {
      toast.error("Ajout impossible", { description: res.error });
    }
  }

  async function remove(r: PanelRow) {
    if (r.source === "store") {
      removeEtablissements([r.id]);
      return;
    }
    const res = await deleteInstalledEstablishment(createClient(), r.id);
    if (res.ok) {
      setInstalled((xs) => xs.filter((x) => x.id !== r.id));
    } else {
      toast.error("Suppression impossible", {
        description:
          res.error?.includes("foreign key") || res.error?.includes("violates")
            ? "Cet établissement est utilisé (transport, comptes…) — détachez-le d'abord."
            : res.error,
      });
    }
  }

  const busy = loading || (REAL && !refLoaded);

  return (
    <div className="space-y-3 rounded-2xl border border-ew-green-200 bg-ew-green-50/30 p-5">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-ew-green-700" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ew-green-700">
          Établissements installés ({country.nameFr}) — {rows.length}
        </h3>
      </div>
      <p className="text-xs text-muted-foreground">
        Vos établissements du pays sélectionné, regroupés par région académique
        ({country.academicRegionLabel}). Créez-en via « Créer », ou installez-en un du
        référentiel ci-dessous.
      </p>

      {/* Installation rapide depuis le référentiel du pays actif (mode réel). */}
      {REAL && (
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
      )}

      {/* Liste repliée par région */}
      {busy ? (
        <p className="px-1 py-3 text-sm text-muted-foreground">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-background/60 p-3 text-center text-sm text-muted-foreground">
          Aucun établissement pour {country.nameFr}. Créez-en via « Créer ».
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
                    {list.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-foreground">{r.name}</span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {r.code ? `EduWeb ${r.code}` : "—"}
                            {r.sub ? ` · ${r.sub}` : ""}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => void remove(r)}
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
