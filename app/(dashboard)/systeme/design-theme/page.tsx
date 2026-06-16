"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Palette, RotateCcw, Check, Save } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { DEFAULT_THEME, EW_COLORS } from "@/config/theme";

const PRESETS = [
  { name: "Vert bouteille", primary: EW_COLORS.green700, secondary: EW_COLORS.gold500 },
  { name: "Vert profond", primary: EW_COLORS.green900, secondary: EW_COLORS.gold600 },
  { name: "Émeraude", primary: "#0f766e", secondary: "#f59e0b" },
  { name: "Indigo", primary: "#4338ca", secondary: "#f59e0b" },
];

export default function DesignThemePage() {
  const t = useTranslations();
  const [primary, setPrimary] = React.useState(DEFAULT_THEME.primaryColor);
  const [secondary, setSecondary] = React.useState(DEFAULT_THEME.secondaryColor);
  const [radius, setRadius] = React.useState(DEFAULT_THEME.radius);
  const [compact, setCompact] = React.useState(false);

  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--ring", primary);
    root.style.setProperty("--secondary", secondary);
    root.style.setProperty("--radius", `${radius}px`);
  }, [primary, secondary, radius]);

  const reset = () => {
    setPrimary(DEFAULT_THEME.primaryColor);
    setSecondary(DEFAULT_THEME.secondaryColor);
    setRadius(DEFAULT_THEME.radius);
    setCompact(false);
    toast.success("Thème EduWeb restauré");
  };

  return (
    <ModulePage title={t("pages.systemeDesignTheme.title")} description={t("pages.systemeDesignTheme.description")}
      icon={Palette}
      permission="system:customize_theme"
      sections={[
        { id: "reglages", label: "Thèmes & réglages" },
        { id: "preview", label: "Prévisualisation" },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Thème par défaut
          </Button>
          <Button onClick={() => toast.success("Thème enregistré", { description: "Appliqué à votre périmètre." })}>
            <Save className="h-4 w-4" /> Enregistrer
          </Button>
        </div>
      }
    >
      <TwoColumn id="reglages" className="lg:grid-cols-[1fr_1fr]">
        <div className="space-y-6">
          <SectionCard title="Thèmes prédéfinis">
            <div className="grid grid-cols-2 gap-3">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setPrimary(p.primary);
                    setSecondary(p.secondary);
                  }}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted"
                >
                  <span className="flex gap-1">
                    <span className="h-6 w-6 rounded-full" style={{ background: p.primary }} />
                    <span className="h-6 w-6 rounded-full" style={{ background: p.secondary }} />
                  </span>
                  <span className="text-sm font-semibold">{p.name}</span>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Couleurs">
            <div className="space-y-4">
              <ColorRow label="Couleur principale" value={primary} onChange={setPrimary} />
              <ColorRow label="Couleur secondaire" value={secondary} onChange={setSecondary} />
            </div>
          </SectionCard>

          <SectionCard title="Mise en forme">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Rayon d&apos;arrondi : {radius}px</Label>
                <input
                  type="range"
                  min={4}
                  max={28}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full accent-ew-green-700"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="font-normal">Mode compact</Label>
                <Switch checked={compact} onCheckedChange={setCompact} />
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard id="preview" title="Prévisualisation" description="Aperçu en direct de la charte appliquée">
          <div className={compact ? "space-y-2" : "space-y-4"}>
            <div className="flex flex-wrap gap-2">
              <Button>Bouton principal</Button>
              <Button variant="secondary">Secondaire</Button>
              <Button variant="outline">Contour</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="green">Actif</Badge>
              <Badge tone="gold">En attente</Badge>
              <Badge tone="blue">Information</Badge>
              <Badge tone="red">Critique</Badge>
            </div>
            <Card className="p-4">
              <p className="font-bold text-foreground">Carte de synthèse</p>
              <p className="text-sm text-muted-foreground">Exemple de carte avec la charte active.</p>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ew-green-100 text-ew-green-700">
                  <Check className="h-4 w-4" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: "68%" }} />
                </div>
              </div>
            </Card>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold">Élément</th>
                    <th className="px-3 py-2 text-left font-bold">Valeur</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2">Exemple</td>
                    <td className="px-3 py-2 text-muted-foreground">123</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>
      </TwoColumn>
    </ModulePage>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="font-normal">{label}</Label>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground">{value}</span>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-md border border-border bg-transparent"
        />
      </div>
    </div>
  );
}
