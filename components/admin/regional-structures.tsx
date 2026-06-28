"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Check, X, RotateCcw, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/components/app-shell/app-context";
import { useStore, type RegionalStructure } from "@/components/app-shell/data-store";
import { cn } from "@/lib/utils";

const num = (n: number) => n.toLocaleString("fr-FR");
const ratio = (s: RegionalStructure) => (s.enseignants ? Math.round(s.eleves / s.enseignants) : 0);

/** Construit des structures par défaut à partir des circonscriptions du pays. */
function buildDefaults(regions: { code: string; name: string }[]): RegionalStructure[] {
  return regions.map((r, i) => {
    const seed = [...r.name].reduce((a, c) => a + c.charCodeAt(0), 0) + i * 7;
    const enseignants = 450 + (seed % 50) * 10;
    const eleves = enseignants * (58 + (seed % 22));
    const etablissements = 14 + (seed % 17);
    const reussite = Math.round((70 + (seed % 95) / 10) * 10) / 10;
    return { id: r.code, name: r.name.replace(/^DRENA\b/, "DRENAET"), etablissements, eleves, enseignants, reussite };
  });
}

const EMPTY = { name: "", etablissements: "", eleves: "", enseignants: "", reussite: "" };
const toNum = (v: string) => Number(String(v).replace(",", ".")) || 0;

export function RegionalStructures() {
  const { country } = useApp();
  const { regionalStructures, setRegionalStructures } = useStore();
  const defaults = React.useMemo(() => buildDefaults(country.academicRegions), [country]);
  const list = regionalStructures ?? defaults;

  const [add, setAdd] = React.useState(EMPTY);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState(EMPTY);

  const onAdd = () => {
    if (!add.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    const s: RegionalStructure = {
      id: `rs-${Date.now().toString(36)}`,
      name: add.name.trim(),
      etablissements: toNum(add.etablissements),
      eleves: toNum(add.eleves),
      enseignants: toNum(add.enseignants),
      reussite: toNum(add.reussite),
    };
    setRegionalStructures([s, ...list]);
    setAdd(EMPTY);
    toast.success("Structure ajoutée", { description: s.name });
  };

  const startEdit = (s: RegionalStructure) => {
    setEditingId(s.id);
    setDraft({
      name: s.name,
      etablissements: String(s.etablissements),
      eleves: String(s.eleves),
      enseignants: String(s.enseignants),
      reussite: String(s.reussite).replace(".", ","),
    });
  };
  const saveEdit = () => {
    setRegionalStructures(
      list.map((x) =>
        x.id === editingId
          ? { ...x, name: draft.name.trim() || x.name, etablissements: toNum(draft.etablissements), eleves: toNum(draft.eleves), enseignants: toNum(draft.enseignants), reussite: toNum(draft.reussite) }
          : x,
      ),
    );
    setEditingId(null);
    toast.success("Structure mise à jour");
  };
  const remove = (s: RegionalStructure) => {
    setRegionalStructures(list.filter((x) => x.id !== s.id));
    toast.success("Structure supprimée", { description: s.name });
  };
  const resetAll = () => {
    setRegionalStructures(null);
    setEditingId(null);
    toast.success("Structures réinitialisées");
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-foreground">
            <Building2 className="h-4 w-4 text-ew-green-700" /> Gestion des structures régionales ({country.code === "CI" ? "DRENAET" : "Régions"})
          </h2>
          <p className="text-sm text-muted-foreground">Personnalisez selon votre pays.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-ew-green-100 px-2.5 py-1 text-xs font-bold text-ew-green-700">{list.length} structures</span>
          <Button variant="outline" size="sm" onClick={resetAll}>
            <RotateCcw className="h-4 w-4" /> Réinitialiser
          </Button>
        </div>
      </div>

      {/* Ajouter une structure */}
      <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">Ajouter une structure régionale</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <Label className="text-xs">Nom <span className="text-red-500">*</span></Label>
            <Input value={add.name} onChange={(e) => setAdd((a) => ({ ...a, name: e.target.value }))} placeholder="Ex: DRENAET Abidjan 1" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Établissements</Label>
            <Input type="number" value={add.etablissements} onChange={(e) => setAdd((a) => ({ ...a, etablissements: e.target.value }))} placeholder="10" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Élèves</Label>
            <Input type="number" value={add.eleves} onChange={(e) => setAdd((a) => ({ ...a, eleves: e.target.value }))} placeholder="20000" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Enseignants</Label>
            <Input type="number" value={add.enseignants} onChange={(e) => setAdd((a) => ({ ...a, enseignants: e.target.value }))} placeholder="300" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Réussite (%)</Label>
            <Input value={add.reussite} onChange={(e) => setAdd((a) => ({ ...a, reussite: e.target.value }))} placeholder="75" />
          </div>
        </div>
        <Button className="mt-3" variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      </div>

      {/* Tableau (desktop) */}
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border">
            <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2.5 text-left">Nom</th>
              <th className="px-3 py-2.5 text-center">Établ.</th>
              <th className="px-3 py-2.5 text-center">Élèves</th>
              <th className="px-3 py-2.5 text-center">Enseign.</th>
              <th className="px-3 py-2.5 text-center">Réussite</th>
              <th className="px-3 py-2.5 text-center">Ratio</th>
              <th className="px-3 py-2.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => {
              const editing = editingId === s.id;
              return (
                <tr key={s.id} className="border-b border-border/60 hover:bg-muted/30">
                  {editing ? (
                    <>
                      <td className="px-3 py-2"><Input className="h-9" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /></td>
                      <td className="px-3 py-2"><Input className="h-9 text-center" type="number" value={draft.etablissements} onChange={(e) => setDraft((d) => ({ ...d, etablissements: e.target.value }))} /></td>
                      <td className="px-3 py-2"><Input className="h-9 text-center" type="number" value={draft.eleves} onChange={(e) => setDraft((d) => ({ ...d, eleves: e.target.value }))} /></td>
                      <td className="px-3 py-2"><Input className="h-9 text-center" type="number" value={draft.enseignants} onChange={(e) => setDraft((d) => ({ ...d, enseignants: e.target.value }))} /></td>
                      <td className="px-3 py-2"><Input className="h-9 text-center" value={draft.reussite} onChange={(e) => setDraft((d) => ({ ...d, reussite: e.target.value }))} /></td>
                      <td className="px-3 py-2 text-center text-muted-foreground">—</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={saveEdit} className="flex h-8 w-8 items-center justify-center rounded-lg bg-ew-green-700 text-white hover:bg-ew-green-800" aria-label="Enregistrer">
                            <Check className="h-4 w-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted" aria-label="Annuler">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-3 font-semibold text-foreground">{s.name}</td>
                      <td className="px-3 py-3 text-center text-muted-foreground">{s.etablissements}</td>
                      <td className="px-3 py-3 text-center text-muted-foreground">{num(s.eleves)}</td>
                      <td className="px-3 py-3 text-center text-muted-foreground">{s.enseignants}</td>
                      <td className={cn("px-3 py-3 text-center font-bold", s.reussite >= 75 ? "text-ew-green-700" : "text-ew-orange")}>
                        {s.reussite.toFixed(1).replace(".", ",")}%
                      </td>
                      <td className="px-3 py-3 text-center text-muted-foreground">{ratio(s)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => startEdit(s)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Modifier">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => remove(s)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-red-50 hover:text-red-600" aria-label="Supprimer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cartes (mobile) */}
      <div className="mt-4 space-y-2.5 md:hidden">
        {list.map((s) => {
          const editing = editingId === s.id;
          return (
            <div key={s.id} className="rounded-xl border border-border bg-card p-3">
              {editing ? (
                <div className="space-y-2">
                  <Input className="h-9" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Nom" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px]">Établ.</Label>
                      <Input className="h-9" type="number" value={draft.etablissements} onChange={(e) => setDraft((d) => ({ ...d, etablissements: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Élèves</Label>
                      <Input className="h-9" type="number" value={draft.eleves} onChange={(e) => setDraft((d) => ({ ...d, eleves: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Enseign.</Label>
                      <Input className="h-9" type="number" value={draft.enseignants} onChange={(e) => setDraft((d) => ({ ...d, enseignants: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px]">Réussite (%)</Label>
                      <Input className="h-9" value={draft.reussite} onChange={(e) => setDraft((d) => ({ ...d, reussite: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" /> Annuler
                    </Button>
                    <Button size="sm" onClick={saveEdit}>
                      <Check className="h-4 w-4" /> Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <div className="flex shrink-0 gap-1.5">
                      <button onClick={() => startEdit(s)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Modifier">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(s)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-red-50 hover:text-red-600" aria-label="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Établ.</dt><dd className="font-medium text-foreground">{s.etablissements}</dd></div>
                    <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Élèves</dt><dd className="font-medium text-foreground">{num(s.eleves)}</dd></div>
                    <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Enseign.</dt><dd className="font-medium text-foreground">{s.enseignants}</dd></div>
                    <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Ratio</dt><dd className="font-medium text-foreground">{ratio(s)}</dd></div>
                    <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Réussite</dt><dd className={cn("font-bold", s.reussite >= 75 ? "text-ew-green-700" : "text-ew-orange")}>{s.reussite.toFixed(1).replace(".", ",")}%</dd></div>
                  </dl>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
