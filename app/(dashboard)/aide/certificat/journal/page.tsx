"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Award, Download, Search, Trash2, Plus, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore, type DeliveredCertificate } from "@/components/app-shell/data-store";

/**
 * Journal des certificats de fin de formation délivrés.
 *
 * - Table avec colonnes : N°, Bénéficiaire, Rôle, Établissement, Délivré le,
 *   Délivré par, Référence formation, Action.
 * - Recherche libre (nom / rôle / numéro) et filtre par année d'émission.
 * - Export CSV (compatible Excel — séparateur « ; », encodage UTF-8 BOM).
 * - Suppression d'une entrée avec confirmation.
 */
export default function CertificatJournalPage() {
  const store = useStore();
  const [search, setSearch] = React.useState("");
  const [yearFilter, setYearFilter] = React.useState<string>("all");

  const certificates = store.certificates;
  const years = React.useMemo(() => {
    const set = new Set<string>();
    certificates.forEach((c) => {
      const y = extractYear(c.issueDate);
      if (y) set.add(y);
    });
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [certificates]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return certificates.filter((c) => {
      if (yearFilter !== "all" && extractYear(c.issueDate) !== yearFilter) return false;
      if (!q) return true;
      return (
        c.beneficiaryName.toLowerCase().includes(q) ||
        c.beneficiaryRole.toLowerCase().includes(q) ||
        c.number.toLowerCase().includes(q) ||
        c.establishment.toLowerCase().includes(q)
      );
    });
  }, [certificates, search, yearFilter]);

  function exportCsv() {
    const header = [
      "N° certificat",
      "Bénéficiaire",
      "Rôle",
      "Établissement",
      "Délivré le",
      "Délivré par",
      "Référence formation",
      "Version",
      "Validité",
      "Enregistré le",
    ];
    const rows = filtered.map((c) => [
      c.number,
      c.beneficiaryName,
      c.beneficiaryRole,
      c.establishment,
      c.issueDate,
      c.deliveredBy,
      c.formationCode,
      c.formationVersion,
      c.validUntil,
      c.registeredAt,
    ]);
    const csv = [header, ...rows]
      .map((line) => line.map(escapeCsvCell).join(";"))
      .join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `Journal-Certificats-EduWeb-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleRemove(c: DeliveredCertificate) {
    const ok = window.confirm(
      `Supprimer le certificat ${c.number} (${c.beneficiaryName}) du journal ?\n\nCette action ne révoque pas le certificat délivré, mais retire la trace dans EduWeb Planner.`,
    );
    if (!ok) return;
    store.removeCertificate(c.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/aide/certificat">
              <ArrowLeft className="h-4 w-4" /> Délivrer un certificat
            </Link>
          </Button>
          <div>
            <p className="font-display text-lg font-bold leading-none text-foreground">
              Journal des certificats délivrés
            </p>
            <p className="text-xs text-muted-foreground">
              Traçabilité officielle des certificats de fin de formation EduWeb Planner.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="h-4 w-4" /> Exporter CSV
          </Button>
          <Button size="sm" asChild>
            <Link href="/aide/certificat">
              <Plus className="h-4 w-4" /> Nouveau certificat
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI rapides */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Certificats délivrés" value={certificates.length} icon={<Award className="h-4 w-4" />} />
        <Kpi label="Année en cours" value={countYear(certificates, new Date().getFullYear().toString())} icon={<Award className="h-4 w-4" />} />
        <Kpi label="Affichés (filtre)" value={filtered.length} icon={<Search className="h-4 w-4" />} />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex-1 space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Recherche</label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, rôle, numéro de certificat, établissement…"
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Année</label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Toutes</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {filtered.length === 0 ? (
          <EmptyState hasAny={certificates.length > 0} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <Th>N° certificat</Th>
                  <Th>Bénéficiaire</Th>
                  <Th>Rôle</Th>
                  <Th>Établissement</Th>
                  <Th>Délivré le</Th>
                  <Th>Délivré par</Th>
                  <Th>Formation</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-border align-top">
                    <Td className="font-mono font-bold text-ew-green-800">{c.number}</Td>
                    <Td className="font-medium text-foreground">{c.beneficiaryName}</Td>
                    <Td className="text-muted-foreground">{c.beneficiaryRole}</Td>
                    <Td className="text-muted-foreground">{c.establishment || "—"}</Td>
                    <Td className="whitespace-nowrap">{c.issueDate}</Td>
                    <Td className="text-muted-foreground">{c.deliveredBy || "—"}</Td>
                    <Td className="font-mono text-xs text-muted-foreground">
                      {c.formationCode} <span className="text-muted-foreground/70">v{c.formationVersion}</span>
                    </Td>
                    <Td className="text-right">
                      <button
                        onClick={() => handleRemove(c)}
                        className="inline-flex items-center gap-1 rounded-md border border-transparent px-2 py-1 text-xs text-destructive hover:border-destructive/40 hover:bg-destructive/5"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Retirer
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-display text-2xl font-extrabold text-foreground">{value}</p>
    </div>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="font-display text-base font-bold text-foreground">
        {hasAny ? "Aucun certificat ne correspond aux filtres." : "Le journal est encore vide."}
      </p>
      <p className="max-w-md text-xs text-muted-foreground">
        {hasAny
          ? "Ajustez la recherche ou réinitialisez le filtre par année pour retrouver une entrée."
          : "Dès que vous délivrerez un premier certificat, il sera automatiquement journalisé ici avec un numéro de séquence unique."}
      </p>
      <Button size="sm" asChild className="mt-2">
        <Link href="/aide/certificat">
          <Plus className="h-4 w-4" /> Délivrer un certificat
        </Link>
      </Button>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 text-left font-bold ${className}`}>{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}

function extractYear(issueDate: string): string | null {
  const m = /(\d{4})/.exec(issueDate);
  return m ? m[1] : null;
}

function countYear(list: DeliveredCertificate[], year: string): number {
  return list.filter((c) => extractYear(c.issueDate) === year).length;
}

function escapeCsvCell(value: string | number): string {
  const s = String(value ?? "");
  if (/[";\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
