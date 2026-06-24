"use client";

import * as React from "react";
import { Download, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/components/app-shell/app-context";
import { etabExportMeta } from "@/lib/etab-config";
import {
  FORMATION_ROLES,
  FORMATION_ROLE_META,
  type FormationRole,
} from "@/lib/formations/formation-roles";

/* ============================================================================
   Éditeur de liste d'inscrits — « jeu de sélection » pour composer puis
   PRODUIRE (éditer) la liste : choix des RÔLES (groupes), des INSCRITS un par un
   (inclure/exclure), et du FORMAT (PDF / CSV / Word). La liste produite est
   GROUPÉE PAR RÔLE de formation. Réutilisable côté admin et côté enseignant.
   ========================================================================== */

export interface ComposerEnrollee {
  id: string;
  name: string;
  email: string;
  globalRole: string;
  formationRole: FormationRole;
  source: string;
  enrolledAt: string;
  expiresAt: string;
}

const COLUMNS = ["N°", "Nom & prénoms", "E-mail", "Rôle global", "Source", "Inscrit·e le", "Expire"];

function rowOf(e: ComposerEnrollee, n: number): (string | number)[] {
  return [n, e.name, e.email || "—", e.globalRole, e.source, e.enrolledAt, e.expiresAt];
}

/** Échappe un champ CSV (séparateur « ; ») + neutralise l'injection de formule. */
function csvField(v: string): string {
  const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function EnrolledListComposer({
  courseTitle,
  schoolYear,
  enrollees,
  triggerLabel = "Éditer la liste",
  triggerClassName,
}: {
  courseTitle: string;
  schoolYear: string;
  enrollees: ComposerEnrollee[];
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const app = useApp();
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [roles, setRoles] = React.useState<Set<FormationRole>>(new Set());
  const [excluded, setExcluded] = React.useState<Set<string>>(new Set());
  const [format, setFormat] = React.useState<"pdf" | "csv" | "word">("pdf");

  const presentRoles = FORMATION_ROLES.filter((r) => enrollees.some((e) => e.formationRole === r));

  function openDialog() {
    setRoles(new Set(presentRoles));
    setExcluded(new Set());
    setOpen(true);
  }
  function toggleRole(r: FormationRole) {
    setRoles((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  }
  function togglePerson(id: string) {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Inscrits visibles selon les rôles cochés ; sélectionnés = non exclus.
  const visible = enrollees
    .filter((e) => roles.has(e.formationRole))
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const selected = visible.filter((e) => !excluded.has(e.id));

  /** Groupes (rôle → inscrits sélectionnés), dans l'ordre des rôles. */
  function groups() {
    return FORMATION_ROLES.filter((r) => roles.has(r))
      .map((r) => ({
        role: r,
        list: selected.filter((e) => e.formationRole === r),
      }))
      .filter((g) => g.list.length > 0);
  }

  function downloadBlob(content: string, mime: string, ext: string) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscrits-${slugify(courseTitle)}-par-role.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function buildPayload() {
    const meta = etabExportMeta();
    return {
      title: `Inscrits — ${courseTitle}`,
      subtitle: `Groupés par rôle de formation · ${selected.length} inscrit·e·s`,
      country: meta.countryName,
      institution: meta.institution,
      period: schoolYear,
      author: app.user.displayName,
      generatedAt: new Date().toLocaleDateString("fr-FR"),
      official: meta.official,
      ministry: meta.ministry,
      slogan: meta.slogan,
      schoolYear,
      emblem: meta.nationalEmblem,
      sections: groups().map((g) => ({
        heading: `${FORMATION_ROLE_META[g.role].label} — ${g.list.length} inscrit·e·s`,
        table: { columns: COLUMNS, rows: g.list.map((e, i) => rowOf(e, i + 1)) },
      })),
    };
  }

  function buildCsv() {
    const headers = ["Rôle formation", ...COLUMNS];
    const lines = [headers.join(";")];
    for (const g of groups()) {
      g.list.forEach((e, i) => {
        lines.push(
          [FORMATION_ROLE_META[g.role].label, ...rowOf(e, i + 1)]
            .map((c) => csvField(String(c)))
            .join(";"),
        );
      });
    }
    return "﻿" + lines.join("\r\n");
  }

  async function produce() {
    if (!selected.length) return;
    setBusy(true);
    try {
      if (format === "csv") {
        downloadBlob(buildCsv(), "text/csv;charset=utf-8", "csv");
      } else if (format === "word") {
        const { downloadReportWord } = await import("@/lib/exports/word");
        await downloadReportWord(buildPayload(), `inscrits-${slugify(courseTitle)}-par-role.docx`);
      } else {
        const { downloadReportPdf } = await import("@/lib/exports/pdf");
        await downloadReportPdf(buildPayload(), `inscrits-${slugify(courseTitle)}-par-role.pdf`);
      }
      setOpen(false);
    } catch {
      window.alert("Échec de la génération du document. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={openDialog}
        disabled={enrollees.length === 0}
        className={triggerClassName}
      >
        <ListChecks className="h-4 w-4" /> {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Éditer la liste des inscrits</DialogTitle>
          </DialogHeader>

          {presentRoles.length === 0 ? (
            <p className="text-sm italic text-muted-foreground">Aucun inscrit à ce cours.</p>
          ) : (
            <div className="space-y-4">
              {/* 1. Rôles (groupes) */}
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Rôles à inclure
                </p>
                <div className="flex flex-wrap gap-2">
                  {presentRoles.map((r) => {
                    const n = enrollees.filter((e) => e.formationRole === r).length;
                    return (
                      <label
                        key={r}
                        className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={roles.has(r)}
                          onChange={() => toggleRole(r)}
                          className="h-4 w-4 accent-primary"
                        />
                        {FORMATION_ROLE_META[r].label}
                        <Badge tone="blue">{n}</Badge>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. Inscrits individuels (cocher qui apparaît) */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Inscrits ({selected.length}/{visible.length})
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setExcluded(new Set())}
                      className="text-xs text-ew-green-700 hover:underline"
                    >
                      Tout cocher
                    </button>
                    <button
                      type="button"
                      onClick={() => setExcluded(new Set(visible.map((e) => e.id)))}
                      className="text-xs text-muted-foreground hover:underline"
                    >
                      Tout décocher
                    </button>
                  </div>
                </div>
                <div className="max-h-52 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                  {visible.length === 0 ? (
                    <p className="px-1 py-2 text-sm italic text-muted-foreground">
                      Aucun inscrit pour les rôles cochés.
                    </p>
                  ) : (
                    visible.map((e) => (
                      <label key={e.id} className="flex items-center gap-2 px-1 text-sm">
                        <input
                          type="checkbox"
                          checked={!excluded.has(e.id)}
                          onChange={() => togglePerson(e.id)}
                          className="h-4 w-4 accent-primary"
                        />
                        <span className="flex-1 truncate">{e.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {FORMATION_ROLE_META[e.formationRole].label}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* 3. Format */}
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Format
                </p>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as "pdf" | "csv" | "word")}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="pdf">PDF</option>
                  <option value="word">Word (.docx)</option>
                  <option value="csv">CSV (Excel)</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              size="sm"
              onClick={produce}
              disabled={busy || selected.length === 0}
            >
              <Download className="h-4 w-4" /> {busy ? "Génération…" : `Produire (${selected.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
