"use client";

import * as React from "react";
import { Plus, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageDrop } from "@/components/forms/image-drop";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Partner } from "@/components/app-shell/data-store";

const DEFAULT_ACCENT = "linear-gradient(135deg, #176b45 0%, #d99a1e 100%)";
const newId = () => "p-" + Math.random().toString(36).slice(2, 9);

/**
 * Dialogue admin de gestion des partenaires affichés sur l'accueil :
 * téléversement du logo (data-URL via ImageDrop), nom, placeholder et texte
 * descriptif, ajout / retrait. Travaille sur une copie locale puis `onSave`.
 */
export function ManagePartnersDialog({
  open,
  onOpenChange,
  partners,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  partners: Partner[];
  onSave: (list: Partner[]) => void;
}) {
  const [rows, setRows] = React.useState<Partner[]>(partners);
  React.useEffect(() => {
    if (open) setRows(partners);
  }, [open, partners]);

  const update = (id: string, patch: Partial<Partner>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () =>
    setRows((rs) => [
      ...rs,
      { id: newId(), name: "Nouveau partenaire", short: "Logo", description: "", accent: DEFAULT_ACCENT },
    ]);

  const save = () => {
    onSave(
      rows.map((r) => ({
        ...r,
        name: r.name.trim() || "Partenaire",
        short: (r.short || r.name).trim() || "Logo",
      })),
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gérer les partenaires</DialogTitle>
          <DialogDescription>
            Téléversez le logo de chaque partenaire et renseignez son texte descriptif (affiché au survol).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {rows.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Aucun partenaire. Cliquez sur «&nbsp;Ajouter un partenaire&nbsp;».
            </p>
          )}
          {rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-border p-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide">Nom du partenaire</Label>
                    <Input
                      value={r.name}
                      onChange={(e) => update(r.id, { name: e.target.value })}
                      placeholder="Ex. ONG Vie d'Amour"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide">Texte du logo provisoire (sans image)</Label>
                    <Input
                      value={r.short}
                      onChange={(e) => update(r.id, { short: e.target.value })}
                      placeholder="Ex. Vie d'Amour"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase tracking-wide">Description (affichée au survol)</Label>
                    <Textarea
                      value={r.description}
                      onChange={(e) => update(r.id, { description: e.target.value })}
                      rows={3}
                      placeholder="Présentation du partenaire…"
                    />
                  </div>
                </div>
                <ImageDrop
                  label="Logo"
                  value={r.logoUrl}
                  onChange={(v) => update(r.id, { logoUrl: v ?? undefined })}
                  icon={Building2}
                />
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(r.id)}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" /> Retirer
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={add} className="w-full">
            <Plus className="h-4 w-4" /> Ajouter un partenaire
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={save}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
