"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, CalendarRange, Building2, Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "./app-context";
import { COUNTRIES } from "@/config/countries";
import { UN_COUNTRIES, flagUrl } from "@/config/un-countries";
import { ACADEMIC_YEARS } from "@/lib/countries";
import { ETABLISSEMENTS } from "@/lib/mock-data";
import { LOCALES } from "@/i18n/routing";

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
  const { country, setCountryCode } = useApp();
  // Liste ONU complète : pays opérationnels (configurés) sélectionnables en tête,
  // puis tous les autres États membres, par ordre alphabétique, marqués « bientôt ».
  const active = React.useMemo(() => new Set(COUNTRIES.filter((c) => c.isActive).map((c) => c.code)), []);
  const ordered = React.useMemo(
    () => [...UN_COUNTRIES.filter((c) => active.has(c.code)), ...UN_COUNTRIES.filter((c) => !active.has(c.code))],
    [active],
  );
  return (
    <Select value={country.code} onValueChange={setCountryCode}>
      <SelectTrigger className={triggerCls()} aria-label="Pays">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ordered.map((c) => (
          <SelectItem key={c.code} value={c.code} disabled={!active.has(c.code)}>
            <span className="flex items-center gap-2">
              <CountryFlag code={c.code} />
              {c.name}
              {!active.has(c.code) && " (bientôt)"}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AcademicRegionSwitcher() {
  const { country, regionCode, setRegionCode } = useApp();
  return (
    <Select value={regionCode ?? ""} onValueChange={setRegionCode}>
      <SelectTrigger className={triggerCls()} aria-label="Région académique">
        <MapPin className="h-4 w-4 text-ew-green-700" />
        <SelectValue placeholder="Région" />
      </SelectTrigger>
      <SelectContent>
        {country.academicRegions.map((r) => (
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
