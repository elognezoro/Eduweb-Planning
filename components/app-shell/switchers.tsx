"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, CalendarRange, Building2, Languages, Search, Check, ChevronsUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "./app-context";
import { useAcademicRegions } from "./use-academic-regions";
import { COUNTRIES } from "@/config/countries";
import { UN_COUNTRIES, flagUrl } from "@/config/un-countries";
import { ACADEMIC_YEARS } from "@/lib/countries";
import { ETABLISSEMENTS } from "@/lib/mock-data";
import { LOCALES } from "@/i18n/routing";
import { cn } from "@/lib/utils";

function triggerCls() {
  return "h-9 w-auto min-w-[140px] border-transparent bg-muted/60 hover:bg-muted";
}

/** Drapeau en image (Windows n'affiche pas les emojis-drapeaux). */
export function CountryFlag({ code }: { code: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl(code)}
      alt={code}
      className="h-3.5 w-5 shrink-0 rounded-sm object-cover ring-1 ring-black/10"
      loading="lazy"
    />
  );
}

export function CountrySwitcher() {
  const { country, setCountryCode, effectiveRole } = useApp();
  // L'administrateur système accède à TOUS les pays (espaces de tous les pays) ;
  // les autres rôles ne sélectionnent que les pays opérationnels (les autres,
  // marqués « bientôt », restent désactivés).
  const isAdmin = effectiveRole === "admin";
  const active = React.useMemo(() => new Set(COUNTRIES.filter((c) => c.isActive).map((c) => c.code)), []);
  const ordered = React.useMemo(
    () => [...UN_COUNTRIES.filter((c) => active.has(c.code)), ...UN_COUNTRIES.filter((c) => !active.has(c.code))],
    [active],
  );
  const selectable = (code: string) => isAdmin || active.has(code);

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur.
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const filtered = React.useMemo(() => {
    const q = norm(query.trim());
    if (!q) return ordered;
    return ordered.filter((c) => norm(c.name).includes(q) || c.code.toLowerCase().includes(q));
  }, [ordered, query]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Pays"
        className={cn(triggerCls(), "flex items-center justify-between gap-2 rounded-md px-3")}
      >
        <span className="flex items-center gap-2 truncate">
          <CountryFlag code={country.code} />
          <span className="truncate">{country.nameFr}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-64 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un pays…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-1" role="listbox">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-center text-sm text-muted-foreground">Aucun pays.</li>
            ) : (
              filtered.map((c) => {
                const ok = selectable(c.code);
                const current = c.code === country.code;
                return (
                  <li key={c.code}>
                    <button
                      type="button"
                      disabled={!ok}
                      role="option"
                      aria-selected={current}
                      onClick={() => {
                        setCountryCode(c.code);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
                        ok ? "hover:bg-muted/50" : "cursor-not-allowed opacity-50",
                        current && "bg-ew-green-50",
                      )}
                    >
                      <Check className={cn("h-4 w-4 shrink-0 text-ew-green-700", current ? "opacity-100" : "opacity-0")} />
                      <CountryFlag code={c.code} />
                      <span className="truncate">{c.name}</span>
                      {!ok && <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">bientôt</span>}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function AcademicRegionSwitcher() {
  const { country, regionCode, setRegionCode } = useApp();
  const regions = useAcademicRegions(country.code);
  return (
    <Select value={regionCode ?? ""} onValueChange={setRegionCode}>
      <SelectTrigger className={triggerCls()} aria-label="Région académique">
        <MapPin className="h-4 w-4 text-ew-green-700" />
        <SelectValue placeholder="Région" />
      </SelectTrigger>
      <SelectContent>
        {regions.map((r) => (
          <SelectItem key={r.code} value={r.code}>
            {r.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AcademicYearSwitcher() {
  const { academicYear, setAcademicYearId } = useApp();
  return (
    <Select value={academicYear.id} onValueChange={setAcademicYearId}>
      <SelectTrigger className={triggerCls()} aria-label="Année scolaire">
        <CalendarRange className="h-4 w-4 text-ew-green-700" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ACADEMIC_YEARS.map((y) => (
          <SelectItem key={y.id} value={y.id}>
            {y.label}
            {y.isCurrent ? " · en cours" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function InstitutionSwitcher() {
  const { country, regionCode } = useApp();
  const list = ETABLISSEMENTS.filter(
    (e) => e.countryCode === country.code && (!regionCode || e.academicRegionCode === regionCode),
  );
  const options = list.length ? list : ETABLISSEMENTS.filter((e) => e.countryCode === country.code);
  const [value, setValue] = React.useState(options[0]?.id ?? "");

  React.useEffect(() => {
    if (!options.find((o) => o.id === value)) setValue(options[0]?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.code, regionCode]);

  if (!options.length) return null;
  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger className={triggerCls()} aria-label="Établissement">
        <Building2 className="h-4 w-4 text-ew-green-700" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((e) => (
          <SelectItem key={e.id} value={e.id}>
            {e.shortName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function LocaleSwitcher() {
  const router = useRouter();
  const [locale, setLocale] = React.useState<string>("fr");

  React.useEffect(() => {
    const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
    if (match) setLocale(match[1]);
  }, []);

  const change = (next: string) => {
    setLocale(next);
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
    router.refresh();
  };

  return (
    <Select value={locale} onValueChange={change}>
      <SelectTrigger className="h-9 w-auto border-transparent bg-muted/60 hover:bg-muted" aria-label="Langue">
        <Languages className="h-4 w-4 text-ew-green-700" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.flag} {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
