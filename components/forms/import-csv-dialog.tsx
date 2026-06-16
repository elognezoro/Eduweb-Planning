"use client";

import * as React from "react";
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { parseCsv, buildCsvTemplate, type ParsedCsv } from "@/lib/imports/csv";
import { harmonizeNameByHeader } from "@/lib/format-name";

interface ImportCsvDialogProps {
  trigger: (open: () => void) => React.ReactNode;
  title: string;
  description?: string;
  expectedColumns: string[];
  sampleRow?: string[];
  templateFilename?: string;
}

/** Boîte de dialogue d'import CSV : dépôt, prévisualisation, validation, modèle. */
export function ImportCsvDialog({
  trigger,
  title,
  description,
  expectedColumns,
  sampleRow,
  templateFilename = "modele.csv",
}: ImportCsvDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [parsed, setParsed] = React.useState<ParsedCsv | null>(null);
  const [fileName, setFileName] = React.useState<string>("");

  const onFile = async (file: File) => {
    const text = await file.text();
    setParsed(parseCsv(text));
    setFileName(file.name);
  };

  const matchedCols = parsed ? expectedColumns.filter((c) => parsed.headers.includes(c)).length : 0;
  const errorRows = parsed ? parsed.rows.filter((r) => r.some((cell) => cell === "")).length : 0;
  const validRows = parsed ? parsed.rows.length - errorRows : 0;

  const downloadTemplate = () => {
    const content = buildCsvTemplate(expectedColumns, sampleRow ? [sampleRow] : []);
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateFilename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setParsed(null);
    setFileName("");
  };

  return (
    <>
      {trigger(() => setOpen(true))}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>

          {!parsed ? (
            <div>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-ew-green-50/40 px-6 py-10 text-center transition-colors hover:border-ew-green-600">
                <UploadCloud className="mb-3 h-9 w-9 text-ew-green-600" />
                <span className="font-semibold text-foreground">Déposez votre fichier CSV ou cliquez pour parcourir</span>
                <span className="mt-1 text-xs text-muted-foreground">Séparateur détecté automatiquement (, ou ;)</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                />
              </label>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Colonnes attendues : <code className="text-foreground">{expectedColumns.join(", ")}</code>
                </span>
                <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4" /> Modèle
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileSpreadsheet className="h-4 w-4 text-ew-green-600" />
                <span className="font-semibold text-foreground">{fileName}</span>
                <span className="text-muted-foreground">· {parsed.rows.length} lignes</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <Stat label="Colonnes reconnues" value={`${matchedCols}/${expectedColumns.length}`} tone="green" />
                <Stat label="Lignes valides" value={validRows} tone="green" />
                <Stat label="Lignes en erreur" value={errorRows} tone={errorRows ? "red" : "green"} />
              </div>
              <div className="max-h-56 overflow-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-muted">
                    <tr>
                      {parsed.headers.map((h) => (
                        <th key={h} className="whitespace-nowrap px-2 py-1.5 text-left font-bold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.slice(0, 8).map((row, i) => (
                      <tr key={i} className="border-t border-border">
                        {row.map((cell, j) => (
                          <td key={j} className="whitespace-nowrap px-2 py-1.5 text-muted-foreground">
                            {harmonizeNameByHeader(parsed.headers[j] ?? "", cell) || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {errorRows > 0 ? (
                <p className="flex items-center gap-2 text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4" /> Le fichier contient des lignes incomplètes. Veuillez les corriger.
                </p>
              ) : (
                <p className="flex items-center gap-2 text-sm text-ew-green-700">
                  <CheckCircle2 className="h-4 w-4" /> Le fichier est prêt à être importé.
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            {parsed && (
              <Button variant="outline" onClick={reset}>
                Choisir un autre fichier
              </Button>
            )}
            <Button
              disabled={!parsed}
              onClick={() => {
                toast.success("Import effectué", { description: `${validRows} ligne(s) importée(s) avec succès.` });
                setOpen(false);
                reset();
              }}
            >
              Importer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone: "green" | "red" }) {
  return (
    <div className={`rounded-lg border p-2 ${tone === "red" ? "border-red-200 bg-red-50" : "border-ew-green-100 bg-ew-green-50"}`}>
      <p className={`text-lg font-extrabold ${tone === "red" ? "text-red-600" : "text-ew-green-700"}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
