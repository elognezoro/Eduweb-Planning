"use client";

import * as React from "react";
import { Search, Check, ChevronsUpDown, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loadCiEtablissements,
  searchCiEtablissements,
  type CiEtablissement,
} from "@/lib/etablissements/ci-etablissements";

/** Établissement sélectionné (réel ou saisi manuellement). */
export interface EtablissementSelection {
  /** Code EduWeb (null si saisie libre). */
  eduwebCode: string | null;
  dspsCode: string | null;
  name: string;
  /** true = établissement saisi à la main (hors référentiel). */
  custom: boolean;
}

export function toSelection(e: CiEtablissement): EtablissementSelection {
  return { eduwebCode: e.eduwebCode, dspsCode: e.dspsCode, name: e.name, custom: false };
}

/**
 * Liste déroulante recherchable des établissements secondaires de Côte d'Ivoire
 * (référentiel 2921), avec zone de saisie rapide et **repli en saisie libre**
 * si l'établissement n'est pas dans la liste.
 */
export function EtablissementCombobox({
  value,
  onChange,
  placeholder = "Rechercher un établissement…",
  allowCustom = true,
  disabled = false,
  id,
  className,
  countryCode = "CI",
  customList,
}: {
  value: EtablissementSelection | null;
  onChange: (sel: EtablissementSelection | null) => void;
  placeholder?: string;
  allowCustom?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  /** Pays dont on liste les établissements. « CI » → référentiel officiel
   *  (2921, chargé du JSON) ; tout autre code → la liste `customList` fournie
   *  par l'appelant (établissements du pays). */
  countryCode?: string;
  customList?: CiEtablissement[];
}) {
  const isCI = (countryCode || "CI") === "CI";
  const [ciList, setCiList] = React.useState<CiEtablissement[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [customMode, setCustomMode] = React.useState(false);
  const [customName, setCustomName] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isCI) {
      setLoaded(true);
      return;
    }
    let alive = true;
    void loadCiEtablissements().then((l) => {
      if (alive) {
        setCiList(l);
        setLoaded(true);
      }
    });
    return () => {
      alive = false;
    };
  }, [isCI]);

  // CI → référentiel officiel ; autre pays → la liste fournie par l'appelant.
  const list = isCI ? ciList : customList ?? [];

  // Fermeture au clic extérieur.
  React.useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const results = React.useMemo(
    () => searchCiEtablissements(list, query, 60),
    [list, query],
  );

  function pick(e: CiEtablissement) {
    onChange(toSelection(e));
    setOpen(false);
    setQuery("");
  }
  function confirmCustom() {
    const n = customName.trim();
    if (!n) return;
    onChange({ eduwebCode: null, dspsCode: null, name: n, custom: true });
    setCustomMode(false);
    setCustomName("");
    setOpen(false);
  }
  function clear() {
    onChange(null);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-left text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
        )}
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {value ? (
            <>
              {value.name}
              {value.custom ? (
                <span className="ml-1 rounded bg-ew-gold-100 px-1 text-[10px] font-bold text-ew-gold-700">
                  saisi
                </span>
              ) : value.eduwebCode ? (
                <span className="ml-1 text-[11px] text-muted-foreground">
                  · {value.eduwebCode}
                </span>
              ) : null}
            </>
          ) : (
            placeholder
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {value ? (
            <X
              aria-label="Effacer"
              className="h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
            />
          ) : null}
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </span>
      </button>

      {open ? (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          {!customMode ? (
            <>
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nom, code DSPS, commune, DRENA…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="border-b border-border px-3 py-1 text-[11px] text-muted-foreground">
                {!loaded
                  ? "Chargement du référentiel…"
                  : `${list.length.toLocaleString("fr-FR")} établissements · ${results.length} affiché(s) — tapez pour affiner`}
              </div>
              <ul className="max-h-72 overflow-y-auto py-1" role="listbox">
                {results.length === 0 ? (
                  <li className="px-3 py-3 text-center text-sm text-muted-foreground">
                    {!loaded ? "Chargement du référentiel…" : "Aucun résultat."}
                  </li>
                ) : (
                  results.map((e) => {
                    const selected = value?.eduwebCode === e.eduwebCode;
                    return (
                      <li key={e.eduwebCode}>
                        <button
                          type="button"
                          onClick={() => pick(e)}
                          className={cn(
                            "flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50",
                            selected && "bg-ew-green-50",
                          )}
                          role="option"
                          aria-selected={selected}
                        >
                          <Check
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0 text-ew-green-700",
                              selected ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-foreground">
                              {e.name}
                            </span>
                            <span className="block truncate text-[11px] text-muted-foreground">
                              {[e.commune, e.drena, e.statut].filter(Boolean).join(" · ")}
                              {e.dspsCode ? ` · DSPS ${e.dspsCode}` : ""} · {e.eduwebCode}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
              {allowCustom ? (
                <button
                  type="button"
                  onClick={() => {
                    setCustomMode(true);
                    setCustomName(query);
                  }}
                  className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-ew-green-700 hover:bg-muted/50"
                >
                  <Pencil className="h-4 w-4" /> Établissement non listé — saisir manuellement
                </button>
              ) : null}
            </>
          ) : (
            <div className="space-y-2 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Saisie manuelle
              </p>
              <input
                autoFocus
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmCustom();
                }}
                placeholder="Nom de l'établissement"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/40"
                >
                  Retour
                </button>
                <button
                  type="button"
                  disabled={!customName.trim()}
                  onClick={confirmCustom}
                  className="rounded-md bg-ew-green-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-ew-green-800 disabled:opacity-50"
                >
                  Valider
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
