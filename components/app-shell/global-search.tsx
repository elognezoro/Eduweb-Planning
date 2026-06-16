"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, FileText, Users, Building2, LayoutGrid } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useApp } from "./app-context";
import { ALL_NAV_ITEMS } from "@/lib/navigation";
import { ETABLISSEMENTS, ELEVES, ENSEIGNANTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface Result {
  group: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: React.ElementType;
}

export function GlobalSearch({ trigger }: { trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const { can } = useApp();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const results = React.useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const pages: Result[] = ALL_NAV_ITEMS.filter((it) => can(it.permission)).map((it) => ({
      group: "Pages",
      label: it.label,
      href: it.href,
      icon: it.icon,
    }));
    const etabs: Result[] = ETABLISSEMENTS.map((e) => ({
      group: "Établissements",
      label: e.name,
      sublabel: e.locality,
      href: "/systeme/etablissements",
      icon: Building2,
    }));
    const students: Result[] = ELEVES.slice(0, 12).map((s) => ({
      group: "Élèves",
      label: `${s.firstName} ${s.lastName}`,
      sublabel: `${s.className} · ${s.matricule}`,
      href: "/statistiques/par-classe",
      icon: Users,
    }));
    const teachers: Result[] = ENSEIGNANTS.map((t) => ({
      group: "Enseignants",
      label: `${t.firstName} ${t.lastName}`,
      sublabel: t.specialty,
      href: "/statistiques/performance-enseignants",
      icon: FileText,
    }));
    const all = [...pages, ...etabs, ...teachers, ...students];
    if (!q) return pages.slice(0, 8);
    return all.filter((r) => (r.label + " " + (r.sublabel ?? "")).toLowerCase().includes(q)).slice(0, 14);
  }, [query, can]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      {trigger(() => setOpen(true))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-24 max-w-xl translate-y-0 p-0">
          <DialogTitle className="sr-only">Recherche globale</DialogTitle>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un élève, enseignant, établissement, rapport…"
              className="h-12 border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <div className="max-h-[55vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                Aucun résultat pour «&nbsp;{query}&nbsp;».
              </p>
            ) : (
              <Grouped results={results} onSelect={go} />
            )}
          </div>
          <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="h-3 w-3" /> pour ouvrir
            </span>
            <span className="flex items-center gap-1">
              <LayoutGrid className="h-3 w-3" /> Recherche globale (démo)
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Grouped({ results, onSelect }: { results: Result[]; onSelect: (href: string) => void }) {
  const groups = Array.from(new Set(results.map((r) => r.group)));
  return (
    <>
      {groups.map((g) => (
        <div key={g} className="mb-2">
          <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{g}</p>
          {results
            .filter((r) => r.group === g)
            .map((r, i) => {
              const Icon = r.icon;
              return (
                <button
                  key={i}
                  onClick={() => onSelect(r.href)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-ew-green-50",
                  )}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate font-medium text-foreground">{r.label}</span>
                  {r.sublabel && <span className="truncate text-xs text-muted-foreground">{r.sublabel}</span>}
                </button>
              );
            })}
        </div>
      ))}
    </>
  );
}
