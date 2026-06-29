"use client";

import * as React from "react";
import { GraduationCap, Plus, Pencil, Archive, ArchiveRestore, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImportCsvDialog } from "@/components/forms/import-csv-dialog";
import { useApp } from "@/components/app-shell/app-context";
import { useStudents } from "@/components/app-shell/use-students";
import { toNomCase, toPrenomCase } from "@/lib/format-name";
import type { StudentInput } from "@/lib/students/students-server";

const EMPTY: StudentInput = {
  matricule: "",
  firstName: "",
  lastName: "",
  gender: "",
  birthDate: "",
  birthPlace: "",
  className: "",
};

const fmtDate = (iso: string) => {
  if (!iso || !iso.includes("-")) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
/** Normalise « JJ/MM/AAAA » ou ISO → « AAAA-MM-JJ ». */
function normDate(s: string): string {
  const v = (s || "").trim();
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const m = v.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return "";
}
function normGender(s: string): "M" | "F" | "" {
  const v = (s || "").trim().toLowerCase();
  if (v === "m" || v.startsWith("masc") || v.startsWith("garç") || v === "h") return "M";
  if (v === "f" || v.startsWith("fém") || v.startsWith("fem") || v.startsWith("fil")) return "F";
  return "";
}

const CSV_COLUMNS = ["Matricule", "Nom", "Prénoms", "Sexe", "Date de naissance", "Lieu de naissance", "Classe"];

export default function ElevesPage() {
  const { students, loading, realMode, addStudent, updateStudent, setStatus, importStudents } = useStudents();
  const readOnly = useApp().isReadOnlyPreview; // aperçu (rôle ou utilisateur) = lecture seule

  const [search, setSearch] = React.useState("");
  const [cls, setCls] = React.useState<string>("");
  const [showArchived, setShowArchived] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<StudentInput>(EMPTY);
  const [saving, setSaving] = React.useState(false);

  const classOptions = React.useMemo(
    () => [...new Set(students.map((s) => s.className).filter(Boolean))].sort(),
    [students],
  );

  const rows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (!showArchived && s.status === "archived") return false;
      if (cls && s.className !== cls) return false;
      if (!q) return true;
      return (
        s.lastName.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.matricule.toLowerCase().includes(q)
      );
    });
  }, [students, search, cls, showArchived]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY);
    setDialogOpen(true);
  };
  const openEdit = (id: string) => {
    const s = students.find((x) => x.id === id);
    if (!s) return;
    setEditingId(id);
    setForm({
      matricule: s.matricule,
      firstName: s.firstName,
      lastName: s.lastName,
      gender: s.gender,
      birthDate: s.birthDate,
      birthPlace: s.birthPlace,
      className: s.className,
    });
    setDialogOpen(true);
  };

  const submit = async () => {
    if (!form.lastName.trim() && !form.firstName.trim()) {
      toast.error("Renseignez au moins le nom ou les prénoms.");
      return;
    }
    setSaving(true);
    const res = editingId ? await updateStudent(editingId, form) : await addStudent(form);
    setSaving(false);
    if (res.ok) {
      toast.success(editingId ? "Élève mis à jour." : "Élève ajouté.");
      setDialogOpen(false);
    } else {
      toast.error("Enregistrement impossible", { description: res.error });
    }
  };

  const set = (k: keyof StudentInput, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <ModulePage
      title="Élèves"
      description="Référentiel des élèves, cloisonné par établissement. Source du livret scolaire, des notes et des bulletins."
      icon={GraduationCap}
      permission="students:manage"
      actions={
        <div className="flex gap-2">
          {!readOnly && (
            <>
          <ImportCsvDialog
            title="Importer des élèves (CSV)"
            description="Une ligne par élève. Les élèves seront rattachés à votre établissement."
            expectedColumns={CSV_COLUMNS}
            sampleRow={["CI-2025001", "KOUASSI", "Aya Grace", "F", "12/03/2012", "Abidjan", "6ème"]}
            templateFilename="modele-eleves.csv"
            trigger={(open) => (
              <Button variant="outline" onClick={open}>
                <Upload className="h-4 w-4" /> Importer (CSV)
              </Button>
            )}
            onImport={async (parsed) => {
              const idx = (name: string) =>
                parsed.headers.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
              const iMat = idx("Matricule"), iNom = idx("Nom"), iPre = idx("Prénoms"), iSex = idx("Sexe"),
                iBd = idx("Date de naissance"), iBp = idx("Lieu de naissance"), iCl = idx("Classe");
              const at = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");
              const inputs: StudentInput[] = parsed.rows
                .map((r) => ({
                  matricule: at(r, iMat),
                  lastName: toNomCase(at(r, iNom)),
                  firstName: toPrenomCase(at(r, iPre)),
                  gender: normGender(at(r, iSex)),
                  birthDate: normDate(at(r, iBd)),
                  birthPlace: at(r, iBp),
                  className: at(r, iCl),
                }))
                .filter((s) => s.lastName || s.firstName || s.matricule);
              if (inputs.length === 0) return { imported: 0, failed: 0, error: "Aucune ligne exploitable." };
              const res = await importStudents(inputs);
              return { imported: res.inserted, failed: res.failed, error: res.error };
            }}
          />
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" /> Ajouter un élève
          </Button>
            </>
          )}
        </div>
      }
    >
      <SectionCard>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, prénoms, matricule…"
              className="h-9 pl-9"
            />
          </div>
          <select
            value={cls}
            onChange={(e) => setCls(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          >
            <option value="">Toutes les classes</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="accent-ew-green-700" />
            Afficher les archivés
          </label>
          <span className="ml-auto text-xs text-muted-foreground">
            {rows.length} élève(s){" "}
            {realMode ? (
              <Badge tone="green">En ligne (votre établissement)</Badge>
            ) : (
              <Badge tone="blue">Démo (local)</Badge>
            )}
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-bold">Matricule</th>
                <th className="px-3 py-2 text-left font-bold">Nom &amp; prénoms</th>
                <th className="px-3 py-2 text-left font-bold">Classe</th>
                <th className="px-3 py-2 text-center font-bold">Sexe</th>
                <th className="px-3 py-2 text-left font-bold">Naissance</th>
                <th className="px-3 py-2 text-center font-bold">Statut</th>
                <th className="px-3 py-2 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-3 py-6 text-center italic text-muted-foreground">Chargement…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-6 text-center italic text-muted-foreground">
                  Aucun élève. Ajoutez-en un ou importez une liste CSV.
                </td></tr>
              ) : (
                rows.map((s) => (
                  <tr key={s.id} className="border-t border-border align-top">
                    <td className="px-3 py-1.5 font-mono text-xs">{s.matricule || "—"}</td>
                    <td className="px-3 py-1.5 font-medium text-foreground">{s.lastName} {s.firstName}</td>
                    <td className="px-3 py-1.5">{s.className || "—"}</td>
                    <td className="px-3 py-1.5 text-center">{s.gender || "—"}</td>
                    <td className="px-3 py-1.5 text-xs text-muted-foreground">{fmtDate(s.birthDate)}{s.birthPlace ? ` · ${s.birthPlace}` : ""}</td>
                    <td className="px-3 py-1.5 text-center">
                      {s.status === "archived" ? <Badge tone="purple">Archivé</Badge> : <Badge tone="green">Actif</Badge>}
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(s.id)} disabled={readOnly} className="rounded p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground disabled:opacity-40" aria-label="Modifier">
                          <Pencil className="h-4 w-4" />
                        </button>
                        {s.status === "archived" ? (
                          <button onClick={() => void setStatus(s.id, "active")} disabled={readOnly} className="rounded p-1 text-ew-green-700 hover:bg-ew-green-50 disabled:opacity-40" aria-label="Réactiver">
                            <ArchiveRestore className="h-4 w-4" />
                          </button>
                        ) : (
                          <button onClick={() => void setStatus(s.id, "archived")} disabled={readOnly} className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-40" aria-label="Archiver">
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Modifier l'élève" : "Ajouter un élève"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Matricule"><Input value={form.matricule} onChange={(e) => set("matricule", e.target.value)} /></Field>
            <Field label="Classe"><Input value={form.className} onChange={(e) => set("className", e.target.value)} placeholder="6ème, 2nde C…" /></Field>
            <Field label="Nom"><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
            <Field label="Prénoms"><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
            <Field label="Sexe">
              <select value={form.gender} onChange={(e) => set("gender", e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                <option value="">—</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </Field>
            <Field label="Date de naissance"><Input type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} /></Field>
            <Field label="Lieu de naissance" full><Input value={form.birthPlace} onChange={(e) => set("birthPlace", e.target.value)} /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={submit} disabled={saving}>{saving ? "Enregistrement…" : editingId ? "Enregistrer" : "Ajouter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ModulePage>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
