"use client";
import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Conteneur de filtres réutilisable. */
export function FilterBar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-sm",
        className,
      )}
    >
      <span className="mr-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filtres
      </span>
      {children}
    </div>
  );
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Liste plate d'options. */
  options?: FilterOption[];
  /** Options regroupées (en-tête de groupe optionnel). Prioritaire sur `options`. */
  groups?: { label?: string; options: FilterOption[] }[];
  placeholder?: string;
  className?: string;
}

/** Select de filtre prêt à l'emploi (liste plate ou groupée). */
export function FilterSelect({ value, onValueChange, options, groups, placeholder, className }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("h-9 w-auto min-w-[150px]", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {groups
          ? groups.map((g, i) => (
              <SelectGroup key={g.label ?? `g-${i}`}>
                {g.label && <SelectLabel>{g.label}</SelectLabel>}
                {g.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))
          : (options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
      </SelectContent>
    </Select>
  );
}
