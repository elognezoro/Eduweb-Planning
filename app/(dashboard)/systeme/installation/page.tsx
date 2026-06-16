"use client";

import { Wrench, CheckCircle2, AlertTriangle, XCircle, BookOpen, Database, CreditCard, HardDrive, Layers, Terminal } from "lucide-react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type State = "ok" | "warn" | "missing";

const STATUS: { icon: LucideIcon; label: string; state: State; detail: string }[] = [
  { icon: Terminal, label: "Node.js", state: "ok", detail: "v24.x détecté (≥ 20 requis)" },
  { icon: Layers, label: "Variables d'environnement", state: "warn", detail: "Renseigner .env.local (voir .env.example)" },
  { icon: Database, label: "Supabase", state: "missing", detail: "NEXT_PUBLIC_SUPABASE_URL non configuré" },
  { icon: HardDrive, label: "Supabase Storage", state: "missing", detail: "Buckets à créer : avatars, logos, reports…" },
  { icon: CreditCard, label: "Stripe", state: "missing", detail: "Clés Stripe à renseigner" },
  { icon: Database, label: "Migrations SQL", state: "warn", detail: "3 migrations prêtes dans supabase/migrations" },
  { icon: Layers, label: "Seed Côte d'Ivoire", state: "warn", detail: "Exécuter npm run seed après configuration" },
];

const ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SMS_PROVIDER",
];

const STEPS = [
  "Copier .env.example en .env.local et renseigner les clés.",
  "Créer le projet Supabase et exécuter les migrations (001 → 003).",
  "Créer les buckets de stockage et activer le RLS.",
  "Configurer Stripe (clés + webhook) si la facturation est activée.",
  "Exécuter le seed administrateur (npm run seed).",
  "Lancer l'application (npm run dev) puis déployer sur Vercel.",
];

const ICON: Record<State, { icon: LucideIcon; tone: "green" | "gold" | "red" }> = {
  ok: { icon: CheckCircle2, tone: "green" },
  warn: { icon: AlertTriangle, tone: "gold" },
  missing: { icon: XCircle, tone: "red" },
};

export default function InstallationPage() {
  const t = useTranslations();
  const ready = STATUS.filter((s) => s.state === "ok").length;

  return (
    <ModulePage title={t("pages.systemeInstallation.title")} description={t("pages.systemeInstallation.description")}
      icon={Wrench}
      permission="system:view_installation"
      actions={
        <Button variant="outline" asChild>
          <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
            <BookOpen className="h-4 w-4" /> Documentation technique
          </a>
        </Button>
      }
      kpis={[
        { label: "Vérifications OK", value: `${ready}/${STATUS.length}`, icon: CheckCircle2, tone: "green" },
        { label: "Migrations prêtes", value: 3, icon: Database, tone: "blue" },
        { label: "Variables .env", value: ENV_VARS.length, icon: Layers, tone: "gold" },
        { label: "Étapes restantes", value: STATUS.filter((s) => s.state !== "ok").length, icon: AlertTriangle, tone: "red" },
      ]}
      sections={[
        { id: "etat", label: "État de l'environnement" },
        { id: "guide", label: "Guide d'installation" },
        { id: "variables", label: "Variables d'environnement" },
      ]}
    >
      <TwoColumn>
        <SectionCard id="etat" title="État de l'environnement">
          <ul className="space-y-2.5">
            {STATUS.map((s) => {
              const Icon = s.icon;
              const Ind = ICON[s.state];
              const IndIcon = Ind.icon;
              return (
                <li key={s.label} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.detail}</p>
                  </div>
                  <Badge tone={Ind.tone}>
                    <IndIcon className="h-3 w-3" />
                  </Badge>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard id="guide" title="Guide d'installation">
            <ol className="space-y-2.5">
              {STEPS.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ew-green-700 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </SectionCard>

          <SectionCard id="variables" title="Variables d'environnement">
            <div className="flex flex-wrap gap-1.5">
              {ENV_VARS.map((v) => (
                <code key={v} className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">
                  {v}
                </code>
              ))}
            </div>
          </SectionCard>
        </div>
      </TwoColumn>
    </ModulePage>
  );
}
