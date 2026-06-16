"use client";

import * as React from "react";
import { FileSpreadsheet, UploadCloud, Download, Wand2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseCsv, MOODLE_COLUMNS, MOODLE_TEMPLATE, toMoodleCsv, type ParsedCsv } from "@/lib/imports/csv";
import { toNomCase, toPrenomCase } from "@/lib/format-name";

const REQUIRED = ["username", "firstname", "lastname", "email"];

function download(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ConvertisseurCsvPage() {
  const [parsed, setParsed] = React.useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = React.useState<Record<string, string>>({});

  const onFile = async (file: File) => {
    const text = await file.text();
    const p = parseCsv(text);
    setParsed(p);
    // Auto-mapping par similarité de nom
    const auto: Record<string, string> = {};
    MOODLE_COLUMNS.forEach((col) => {
      const found = p.headers.find((h) => h.toLowerCase().replace(/[^a-z]/g, "").includes(col.replace(/[0-9]/g, "")));
      if (found) auto[col] = found;
    });
    setMapping(auto);
  };

  const records =
    parsed?.rows.map((row) => {
      const rec: Record<string, string> = {};
      MOODLE_COLUMNS.forEach((col) => {
        const src = mapping[col];
        const idx = src ? parsed.headers.indexOf(src) : -1;
        const raw = idx >= 0 ? row[idx] ?? "" : "";
        // Harmonisation NOM/Prénoms quelle que soit la casse du fichier source
        rec[col] = col === "lastname" ? toNomCase(raw) : col === "firstname" ? toPrenomCase(raw) : raw;
      });
      return rec;
    }) ?? [];

  const mappedRequired = REQUIRED.filter((c) => mapping[c]).length;
  const errorRows = records.filter((r) => REQUIRED.some((c) => !r[c])).length;
  const validRows = records.length - errorRows;

  return (
    <ModulePage
      title="Convertisseur CSV"
      description="Préparez des fichiers CSV compatibles Moodle : mapping des colonnes, validation et export."
      icon={FileSpreadsheet}
      permission="system:convert_csv"
      actions={
        <Button variant="outline" onClick={() => download(MOODLE_TEMPLATE, "modele-moodle.csv")}>
          <Download className="h-4 w-4" /> Modèle Moodle
        </Button>
      }
      sections={
        parsed
          ? [
              { id: "mapping", label: "Mapping des colonnes" },
              { id: "previsualisation", label: "Prévisualisation Moodle" },
            ]
          : undefined
      }
    >
      {!parsed ? (
        <SectionCard>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-ew-green-50/40 px-6 py-14 text-center transition-colors hover:border-ew-green-600">
            <UploadCloud className="mb-3 h-10 w-10 text-ew-green-600" />
            <span className="font-semibold text-foreground">Déposez votre fichier CSV source</span>
            <span className="mt-1 text-xs text-muted-foreground">Le séparateur est détecté automatiquement</span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>
        </SectionCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard id="mapping" title="Mapping des colonnes" description="Associez chaque colonne Moodle à une colonne source." className="lg:col-span-1">
            <div className="space-y-3">
              {MOODLE_COLUMNS.map((col) => (
                <div key={col} className="flex items-center gap-2">
                  <Label className="w-24 shrink-0 font-mono text-xs">{col}</Label>
                  <Select
                    value={mapping[col] ?? "__none__"}
                    onValueChange={(v) => setMapping((m) => ({ ...m, [col]: v === "__none__" ? "" : v }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Ignorer —</SelectItem>
                      {parsed.headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => setParsed(null)}>
              Changer de fichier
            </Button>
          </SectionCard>

          <div className="space-y-6 lg:col-span-2">
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Colonnes requises" value={`${mappedRequired}/${REQUIRED.length}`} ok={mappedRequired === REQUIRED.length} />
              <StatCard label="Lignes valides" value={validRows} ok />
              <StatCard label="Lignes en erreur" value={errorRows} ok={errorRows === 0} />
            </div>

            <SectionCard id="previsualisation" title="Prévisualisation Moodle" description="20 premières lignes converties">
              <div className="max-h-72 overflow-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-ew-green-700 text-white">
                    <tr>
                      {MOODLE_COLUMNS.map((c) => (
                        <th key={c} className="whitespace-nowrap px-2 py-1.5 text-left font-bold">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 20).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        {MOODLE_COLUMNS.map((c) => (
                          <td
                            key={c}
                            className={`whitespace-nowrap px-2 py-1.5 ${
                              REQUIRED.includes(c) && !r[c] ? "bg-red-50 text-red-600" : "text-muted-foreground"
                            }`}
                          >
                            {r[c] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                {errorRows > 0 ? (
                  <p className="flex items-center gap-2 text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4" /> {errorRows} ligne(s) incomplète(s) sur les colonnes requises.
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-sm text-ew-green-700">
                    <CheckCircle2 className="h-4 w-4" /> Fichier prêt pour l&apos;export Moodle.
                  </p>
                )}
                <Button
                  onClick={() => {
                    download(toMoodleCsv(records.filter((r) => REQUIRED.every((c) => r[c]))), "export-moodle.csv");
                    toast.success("Export Moodle généré", { description: `${validRows} ligne(s) exportée(s).` });
                  }}
                >
                  <Wand2 className="h-4 w-4" /> Exporter CSV Moodle
                </Button>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </ModulePage>
  );
}

function StatCard({ label, value, ok }: { label: string; value: React.ReactNode; ok: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${ok ? "border-ew-green-100 bg-ew-green-50" : "border-red-200 bg-red-50"}`}>
      <p className={`text-xl font-extrabold ${ok ? "text-ew-green-700" : "text-red-600"}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
