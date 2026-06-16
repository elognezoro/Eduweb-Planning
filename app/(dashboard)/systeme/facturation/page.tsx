"use client";

import { CreditCard, Check, Wallet, TrendingUp, Clock, Building2, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { SimpleTable } from "@/components/data-table/simple-table";
import { ExportMenu } from "@/components/layout/export-menu";
import { useStore } from "@/components/app-shell/data-store";
import { SUBSCRIPTION_PLANS, PAYMENTS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function FacturationPage() {
  const router = useRouter();
  const { subscription, etablissements } = useStore();
  const etabName = etablissements[0]?.name ?? "Votre établissement";
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR");
  const payments = subscription?.active
    ? [
        {
          id: subscription.reference,
          etablissement: etabName,
          plan: "Académie Premium",
          amount: subscription.amountFcfa,
          status: "paid" as const,
          provider: subscription.paymentMethod,
          paidAt: subscription.startsAt.slice(0, 10),
        },
        ...PAYMENTS,
      ]
    : PAYMENTS;
  const revenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);

  return (
    <ModulePage
      title="Facturation"
      description="Abonnements, paiements et plans. Intégration Stripe, extensible aux paiements mobile money."
      icon={CreditCard}
      permission="system:manage_billing"
      kpis={[
        { label: "Revenus encaissés", value: formatCurrency(revenue), icon: Wallet, tone: "green", delta: 6.2 },
        { label: "Abonnements actifs", value: 4, icon: Building2, tone: "blue" },
        { label: "Paiements en attente", value: PAYMENTS.filter((p) => p.status === "pending").length, icon: Clock, tone: "gold" },
        { label: "Taux de renouvellement", value: "92 %", icon: TrendingUp, tone: "purple" },
      ]}
      sections={[
        { id: "abonnement", label: "Mon abonnement" },
        { id: "plans", label: "Plans" },
        { id: "paiements", label: "Paiements" },
        { id: "integration", label: "Intégration" },
      ]}
    >
      {/* Mon abonnement (depuis le store) */}
      {subscription?.active ? (
        <SectionCard id="abonnement" className="border-ew-green-600/40 bg-ew-green-50">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ew-green-100 text-ew-green-700">
                <Crown className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-ew-green-900">Académie Premium — {subscription.planName}</p>
                  <Badge tone="green">Actif</Badge>
                </div>
                <p className="mt-0.5 text-sm text-ew-green-900/80">
                  {etabName} · Réf. {subscription.reference} · {formatCurrency(subscription.amountFcfa)} via {subscription.paymentMethod}
                </p>
                <p className="text-xs text-ew-green-900/70">
                  Valable du {fmtDate(subscription.startsAt)} au {fmtDate(subscription.expiresAt)}
                </p>
              </div>
            </div>
            <Button variant="outline" className="shrink-0" onClick={() => router.push("/vie-scolaire/academie-premium")}>
              Gérer l&apos;abonnement
            </Button>
          </div>
        </SectionCard>
      ) : (
        <SectionCard id="abonnement" className="border-ew-gold-500/40 bg-ew-gold-100/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ew-gold-100 text-ew-gold-600">
                <Crown className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-foreground">Aucun abonnement Académie Premium actif</p>
                <p className="text-sm text-muted-foreground">
                  Souscrivez pour activer les bulletins officiels signés/tamponnés, les alertes SMS et le support prioritaire.
                </p>
              </div>
            </div>
            <Button className="shrink-0" onClick={() => router.push("/vie-scolaire/academie-premium")}>
              <Crown className="h-4 w-4" /> Souscrire
            </Button>
          </div>
        </SectionCard>
      )}

      {/* Plans */}
      <div id="plans" className="scroll-mt-24 grid gap-4 lg:grid-cols-3">
        {SUBSCRIPTION_PLANS.map((plan, i) => (
          <SectionCard key={plan.code} className={i === 1 ? "ring-2 ring-ew-green-600" : ""}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-foreground">{plan.name}</h3>
              {i === 1 && <Badge tone="green">Populaire</Badge>}
            </div>
            <p className="mt-2">
              <span className="text-2xl font-extrabold text-ew-green-700">{formatCurrency(plan.price)}</span>
              <span className="text-sm text-muted-foreground"> / {plan.interval}</span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-ew-green-600" /> {f}
                </li>
              ))}
            </ul>
            <Button
              className="mt-5 w-full"
              variant={i === 1 ? "default" : "outline"}
              onClick={() => toast.info("Redirection vers le paiement Stripe (démo)")}
            >
              Souscrire
            </Button>
          </SectionCard>
        ))}
      </div>

      <SectionCard id="paiements" title="Paiements" description="Historique des paiements et factures">
        <SimpleTable
          rows={payments}
          getKey={(r) => r.id}
          columns={[
            { key: "etablissement", header: "Établissement", render: (r) => <span className="font-semibold">{r.etablissement}</span> },
            { key: "plan", header: "Plan", render: (r) => <Badge tone="slate">{r.plan}</Badge> },
            { key: "amount", header: "Montant", render: (r) => formatCurrency(r.amount) },
            { key: "provider", header: "Moyen", render: (r) => <Badge tone="blue">{r.provider}</Badge> },
            { key: "status", header: "Statut", render: (r) => <StatusBadge status={r.status} /> },
            {
              key: "actions",
              header: "",
              align: "right",
              render: (r) => (
                <ExportMenu
                  filename={`facture-${r.id}`}
                  buildPayload={() => ({
                    title: "Facture",
                    subtitle: r.etablissement,
                    country: "Côte d'Ivoire",
                    institution: r.etablissement,
                    author: "Service facturation EduWeb Planner",
                    generatedAt: new Date().toLocaleString("fr-FR"),
                    sections: [
                      {
                        heading: "Détail",
                        table: {
                          columns: ["Désignation", "Montant"],
                          rows: [
                            [`Abonnement ${r.plan}`, formatCurrency(r.amount)],
                            ["Statut", r.status],
                            ["Moyen de paiement", r.provider],
                          ],
                        },
                      },
                    ],
                  })}
                />
              ),
            },
          ]}
        />
      </SectionCard>

      <SectionCard id="integration" title="Intégration des paiements">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Badge tone="purple">Stripe</Badge> Webhook configuré sur <code>/api/stripe/webhook</code>.
          <Badge tone="gold">Mobile Money</Badge> Couche d&apos;abstraction prête pour les fournisseurs locaux (Orange,
          MTN, Wave).
        </div>
      </SectionCard>
    </ModulePage>
  );
}
