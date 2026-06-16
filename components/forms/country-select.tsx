"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { UN_COUNTRIES } from "@/config/un-countries";
import { CountryFlag } from "@/components/app-shell/switchers";
import { cn } from "@/lib/utils";

/**
 * Sélecteur de pays (États membres de l'ONU, drapeaux inclus) avec champ de
 * recherche rapide : la saisie filtre la liste dès les premières lettres.
 * `valueAs` détermine la valeur remontée : code ISO (défaut) ou nom français.
 */
export function CountrySearchSelect({
  value,
  onChange,
  allowAll = false,
  allValue = "all",
  allLabel = "Tous les pays",
  valueAs = "code",
  placeholder = "Choisir un pays…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  allowAll?: boolean;
  allValue?: string;
  allLabel?: string;
  valueAs?: "code" | "name";
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const keyOf = (c: (typeof UN_COUNTRIES)[number]) => (valueAs === "code" ? c.code : c.name);
  const selected = value === allValue ? null : UN_COUNTRIES.find((c) => keyOf(c) === value);
  const q = query.trim().toLowerCase();
  const filtered = q ? UN_COUNTRIES.filter((c) => c.name.toLowerCase().includes(q)) : UN_COUNTRIES;

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {selected ? (
            <>
              <CountryFlag code={selected.code} />
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <span className={cn(allowAll && value === allValue ? "text-foreground" : "text-muted-foreground")}>
              {allowAll && value === allValue ? allLabel : placeholder}
            </span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tapez les premières lettres du pays…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Effacer">
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <ul className="max-h-60 overflow-y-auto p-1">
            {allowAll && !q && (
              <li>
                <button
                  type="button"
                  onClick={() => pick(allValue)}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <span className="font-medium text-foreground">{allLabel}</span>
                  {value === allValue && <Check className="h-4 w-4 shrink-0 text-ew-green-700" />}
                </button>
              </li>
            )}
            {filtered.length === 0 ? (
              <li className="px-2 py-4 text-center text-sm text-muted-foreground">Aucun pays trouvé</li>
            ) : (
              filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => pick(keyOf(c))}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <CountryFlag code={c.code} />
                      <span className="truncate text-foreground">{c.name}</span>
                    </span>
                    {keyOf(c) === value && <Check className="h-4 w-4 shrink-0 text-ew-green-700" />}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
