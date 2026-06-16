"use client";

import * as React from "react";
import { CountryFlag } from "@/components/app-shell/switchers";
import { dialCode } from "@/config/un-countries";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  /** Code pays ISO alpha-2 qui pilote l'indicatif (ex. « CI » → « +225 »). */
  countryCode: string;
  /** Valeur complète stockée, ex. « +225 0700000000 ». */
  value: string;
  onChange: (full: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  /** « auth » : grand champ arrondi des pages de connexion ; « field » : champ standard des formulaires. */
  variant?: "auth" | "field";
}

/** Retire un éventuel préfixe « +<indicatif> » en tête pour n'afficher que le numéro national. */
const stripDial = (v: string) => (v || "").replace(/^\+\d+\s?/, "").trimStart();

const VARIANTS = {
  auth: {
    box: "h-12 rounded-xl bg-muted/60 focus-within:bg-card focus-within:ring-2",
    prefix: "pl-3.5 pr-2.5 text-[15px]",
    input: "px-3 text-[15px]",
  },
  field: {
    box: "h-10 rounded-lg border border-input bg-card shadow-sm focus-within:ring-2",
    prefix: "pl-3 pr-2 text-sm",
    input: "px-3 text-sm",
  },
} as const;

/**
 * Champ téléphone dont l'indicatif s'adapte automatiquement au pays sélectionné.
 * L'indicatif est affiché en préfixe (non éditable) ; la valeur remontée via
 * onChange est le numéro international complet (« +225 0700000000 »).
 */
export function PhoneInput({
  countryCode,
  value,
  onChange,
  placeholder = "Numéro de téléphone",
  className,
  id,
  variant = "auth",
}: PhoneInputProps) {
  const dial = dialCode(countryCode) || "+";
  const local = stripDial(value);
  const v = VARIANTS[variant];

  // Resynchronise le préfixe stocké quand le pays (donc l'indicatif) change.
  React.useEffect(() => {
    const l = stripDial(value);
    const next = l ? `${dial} ${l}` : "";
    if (next !== value) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dial]);

  return (
    <div
      className={cn(
        "flex items-center overflow-hidden transition-colors focus-within:ring-ring",
        v.box,
        className,
      )}
    >
      <span className={cn("flex shrink-0 items-center gap-1.5 font-medium text-foreground", v.prefix)}>
        <CountryFlag code={countryCode} /> {dial}
      </span>
      <span className="h-6 w-px shrink-0 bg-border" />
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={local}
        placeholder={placeholder}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d\s]/g, "").replace(/\s+/g, " ").trimStart();
          onChange(digits.trim() ? `${dial} ${digits}` : "");
        }}
        className={cn(
          "h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/70",
          v.input,
        )}
      />
    </div>
  );
}
