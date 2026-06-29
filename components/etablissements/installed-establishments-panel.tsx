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
  etablissementCode,
  deleteInstalledEstablishment,
} from "@/lib/etablissements/etablissements-server";
import type { Etablissement } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Panneau « Établissements installés » — lit le RÉPERTOIRE du store, qui est la
 * SOURCE UNIQUE hydratée depuis Supabase par EtablissementsSync (mode réel). La
 * liste est donc IDENTIQUE d'un poste/navigateur à l'autre. Limité au pays actif
 * et regroupé par région académique (replié par défaut).
 *
 * La région d'une ligne vient de son champ `academicRegionCode` ; à défaut, du
 * référentiel (par code). Elle est NORMALISÉE vers le nom canonique de la région
 * du pays (fusionne « ABIDJAN 1 » du référentiel et « DRENA Abidjan 1 » de la
 * config — qui désignent la même région — au lieu de créer deux groupes).
 */
const REAL = isSupabaseConfigured();
const NO_REGION = "Sans région académique";

/** Jeton de comparaison : sans accents, sans préfixe DRENA/DREN, alphanumérique. */
function regionToken(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b(drenaet|drena|dren|dr)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "");
}

export function InstalledEstablishmentsPanel() {
  const { country } = useApp();
  const cc = country.code;
  const regions = useAcademicRegions(cc);
  const { etablissements, addEtablissement, removeEtablissement } = useStore();

  const [refMap, setRefMap] = React.useState<Map<string, CiEtablissement>>(new Map());
  const [sel, setSel] = React.useState<EtablissementSelection | null>(null);
  const [adding, setAdding] = React.useState(false);
  const [open, setOpen] = React.useState<Set<string>>(new Set());

  // Référentiel du pays actif → carte code → établissement (région de repli).
  React.useEffect(() => {
    let alive = true;
    const loader = cc === "CI" ? loadCiEtablissements() : loadCountryEtablissements(cc);
    void loader.then((list) => {
      if (!alive) return;
      setRefMap(new Map(list.map((e) => [e.eduwebCode, e])));
    });
    return () => {
      alive = false;
    };
  }, [cc]);

  // Résout une région (code OU nom OU libellé référentiel) vers le NOM canonique.
  const regionName = React.useCallback(
    (raw: string | null | undefined): string => {
      const v = (raw ?? "").trim();
      if (!v) return NO_REGION;
      const byCode = regions.find((r) => r.code === v);
      if (byCode) return byCode.name;
      const byName = regions.find((r) => r.name.toLowerCase() === v.toLowerCase());
      if (byName) return byName.name;
      const t = regionToken(v);
      if (t) {
        const loose = regions.find((r) => regionToken(r.code) === t || regionToken(r.name) === t);
        if (loose) return loose.name;
      }
      return v; // saisie libre non reconnue
    },
    [regions],
  );

  // Lignes du pays actif, avec région résolue (champ propre, sinon référentiel).
  const rows = React.useMemo(() => {
    return etablissements
      .filter((e) => e.countryCode === cc)
      .map((e) => {
        const raw = (e.academicRegionCode || "").trim() || refMap.get(e.code ?? "")?.drena || "";
        return { etab: e, region: regionName(raw) };
      });
  }, [etablissements, cc, refMap, regionName]);

  const groups = React.useMemo(() => {
    const map = new Map<string, typeof rows>();
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
    if (!sel) return;
    if (!REAL) {
      // Démo : ajout local direct.
      addEtablissement(buildEtab(sel, cc));
      toast.success("Établissement ajouté", { description: sel.name });
      setSel(null);
      return;
    }
    setAdding(true);
    const res = await ensureEstablishment(createClient(), sel);
    setAdding(false);
    if (res.id) {
      addEtablissement({ ...buildEtab(sel, cc), id: res.id });
      toast.success("Établissement installé", { description: sel.name });
      setSel(null);
    } else {
      toast.error("Ajout impossible", { description: res.error });
    }
  }

  async function remove(e: Etablissement) {
    if (REAL) {
      const res = await deleteInstalledEstablishment(createClient(), e.id);
      if (!res.ok) {
        toast.error("Suppression impossible", {
          description:
            res.error?.includes("foreign key") || res.error?.includes("violates")
              ? "Cet établissement est utilisé (transport, comptes…) — détachez-le d'abord."
              : res.error,
        });
        return;
      }
    }
    removeEtablissement(e.id);
  }

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
        ({country.academicRegionLabel}). La liste est partagée en ligne — identique sur tous
        les postes. Créez-en via « Créer », ou installez-en un du référentiel ci-dessous.
      </p>

      {/* Installation depuis le référentiel du pays actif */}
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
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-background/60 p-3 text-center text-sm text-muted-foreground">
          Aucun établissement pour {country.nameFr}. Créez-en via « Créer » ou installez-en un ci-dessus.
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
                    {list.map(({ etab: e }) => (
                      <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-foreground">{e.name}</span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {e.code ? `EduWeb ${e.code}` : "—"}
                            {e.locality ? ` · ${e.locality}` : ""}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => void remove(e)}
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

/** Construit une entrée de répertoire minimale à partir d'une sélection du référentiel. */
function buildEtab(sel: EtablissementSelection, countryCode: string): Omit<Etablissement, "id"> {
  const name = sel.name;
  return {
    code: etablissementCode(sel),
    name,
    shortName: name.split(/\s+/).slice(0, 2).join(" "),
    type: "—",
    countryCode,
    academicRegionCode: "",
    locality: "",
    status: "active",
    studentsCount: 0,
    teachersCount: 0,
    classesCount: 0,
    attendanceRate: 0,
    successRate: 0,
    subscriptionPlan: "Standard",
  };
}
