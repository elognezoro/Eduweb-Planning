"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Crown,
  BadgeCheck,
  MessageSquare,
  Headphones,
  Users,
  Check,
  Percent,
  Ticket,
  ChevronDown,
  CreditCard,
  Smartphone,
  GraduationCap,
  Star,
  ArrowLeft,
  BellRing,
  Download,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { ModulePage, SectionCard } from "@/components/modules/module-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStore, type Subscription } from "@/components/app-shell/data-store";
import { useApp } from "@/components/app-shell/app-context";
import { getRoleLabel } from "@/lib/roles";
import { etabExportMeta } from "@/lib/etab-config";
import { downloadReportPdf } from "@/lib/exports";

/* --------------------------------- Données --------------------------------- */
const HERO_FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: BadgeCheck, title: "Bulletins officiels", desc: "Tampon + signature numérique" },
  { icon: MessageSquare, title: "SMS automatiques", desc: "Alertes parents en temps réel" },
  { icon: Headphones, title: "Support prioritaire", desc: "Assistance 7j/7" },
];

const PLANS = [
  { id: "petit", name: "Petit établissement", capacity: "Moins de 800 élèves", fcfa: 300000, eur: 458, popular: false },
  { id: "grand", name: "Grand établissement", capacity: "800 élèves et plus", fcfa: 500000, eur: 763, popular: true },
] as const;

const INCLUDED = [
  "Signature électronique sur les bulletins",
  "Tampon officiel sur les bulletins PDF",
  "Statistiques avancées multi-niveaux",
  "Support prioritaire 7j/7",
  "Mises à jour premium incluses",
];

const DISCOUNTS = [
  { code: "E-SCHOOL2025", label: "Abonné E-School EduWeb", pct: 20, preferential: true },
  { code: "EARLYBIRD", label: "Early bird (avant sept.)", pct: 10, preferential: false },
  { code: "GROUPE5", label: "Groupe 5+ établissements", pct: 15, preferential: false },
  { code: "IZEN50", label: "IZEN Allocation – Soutien 50%", pct: 50, preferential: true },
  { code: "IZEN100", label: "IZEN Allocation – Soutien complet", pct: 100, preferential: true },
];

/** Types de réduction qu'un établissement peut demander (instruits dans « Approbations de codes promo »). */
const REQUEST_TYPES: { label: string; pct: number }[] = [
  { label: "IZEN Allocation – Soutien 50%", pct: 50 },
  { label: "IZEN Allocation – Soutien complet", pct: 100 },
  { label: "Abonné E-School EduWeb", pct: 20 },
  { label: "Groupe 5+ établissements", pct: 15 },
  { label: "Early bird (avant sept.)", pct: 10 },
];

const PAYMENTS: { id: string; name: string; desc: string; icon: LucideIcon }[] = [
  { id: "cb", name: "Carte bancaire", desc: "Visa, Mastercard", icon: CreditCard },
  { id: "wave", name: "Wave", desc: "Mobile Money", icon: Smartphone },
  { id: "orange", name: "Orange Money", desc: "Mobile Money", icon: Smartphone },
  { id: "mtn", name: "MTN Money", desc: "Mobile Money", icon: Smartphone },
  { id: "moov", name: "Moov Money", desc: "Mobile Money", icon: Smartphone },
];

const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
const eur2 = (n: number) => `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
const eurInt = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} EUR`;

export default function AcademiePremiumPage() {
  const t = useTranslations();
  const router = useRouter();
  const { subscription, smsAlerts, subscribe, cancelSubscription, setSmsAlerts, etablissements, updateEtablissement, promoRequests, addPromoRequest } = useStore();
  const { user: me, effectiveRole } = useApp();
  const [planId, setPlanId] = React.useState<string>("petit");
  const [paymentId, setPaymentId] = React.useState("cb");
  const [promo, setPromo] = React.useState("");
  const [appliedCode, setAppliedCode] = React.useState<string | null>(null);
  const [showPromoGen, setShowPromoGen] = React.useState(false);
  const [showSmsParents, setShowSmsParents] = React.useState(false);

  // Établissement courant (configuration) — pour rattacher et suivre les demandes de code.
  const [etabName, setEtabName] = React.useState("Établissement");
  React.useEffect(() => setEtabName(etabExportMeta().institution), []);
  const [requestOpen, setRequestOpen] = React.useState(false);

  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0];
  const payment = PAYMENTS.find((p) => p.id === paymentId) ?? PAYMENTS[0];
  // Codes acceptés : réductions du catalogue + codes générés via « Approbations de codes promo ».
  const approvedReqCodes = promoRequests.filter((r) => r.status === "approved" && r.code);
  const applied =
    DISCOUNTS.find((d) => d.code === appliedCode) ?? approvedReqCodes.find((r) => r.code === appliedCode) ?? null;
  const pct = applied?.pct ?? 0;
  const totalFcfa = Math.round(plan.fcfa * (1 - pct / 100));
  const totalEur = plan.eur * (1 - pct / 100);

  const applyCode = (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code) return;
    const found = DISCOUNTS.find((d) => d.code.toUpperCase() === code);
    const foundReq = approvedReqCodes.find((r) => (r.code ?? "").toUpperCase() === code);
    if (found || foundReq) {
      const finalCode = found ? found.code : foundReq!.code!;
      const finalPct = found ? found.pct : foundReq!.pct;
      setAppliedCode(finalCode);
      setPromo(finalCode);
      toast.success(`Code « ${finalCode} » appliqué`, { description: `Réduction de ${finalPct}% sur la formule.` });
    } else {
      toast.error("Code promo invalide");
    }
  };

  // Demandes de l'établissement / de l'utilisateur courant.
  const myRequests = promoRequests.filter((r) => r.requester === me.displayName || r.etablissement === etabName);
  const submitRequest = (type: string, typePct: number, justification: string) => {
    addPromoRequest({
      requester: me.displayName,
      requesterRole: getRoleLabel(effectiveRole),
      etablissement: etabName,
      type,
      pct: typePct,
      justification,
    });
    setRequestOpen(false);
    toast.success("Demande de code promo envoyée", {
      description: "Suivez son statut ici — validation dans « Approbations de codes promo ».",
    });
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("fr-FR");

  const downloadReceipt = async (sub: Subscription) => {
    const meta = etabExportMeta();
    await downloadReportPdf(
      {
        title: "Reçu d'abonnement — Académie Premium",
        subtitle: `${sub.planName} · Réf. ${sub.reference}`,
        country: meta.countryName,
        institution: meta.institution !== "Établissement" ? meta.institution : "Établissement",
        period: `${fmtDate(sub.startsAt)} → ${fmtDate(sub.expiresAt)}`,
        author: meta.headName || "Établissement",
        generatedAt: new Date().toLocaleString("fr-FR"),
        official: meta.official,
        ministry: meta.ministry,
        slogan: meta.slogan,
        schoolYear: meta.schoolYear,
        emblem: meta.nationalEmblem,
        sections: [
          {
            heading: "Détails de l'abonnement",
            table: {
              columns: ["Élément", "Valeur"],
              rows: [
                ["Formule", sub.planName],
                ["Effectif", sub.capacity],
                ["Réduction", sub.discountCode ? `${sub.discountCode} (-${sub.discountPct}%)` : "Aucune"],
                ["Montant payé", `${fcfa(sub.amountFcfa)} (${eur2(sub.amountEur)})`],
                ["Moyen de paiement", sub.paymentMethod],
                ["Référence", sub.reference],
                ["Début", fmtDate(sub.startsAt)],
                ["Échéance", fmtDate(sub.expiresAt)],
              ],
            },
          },
          {
            heading: "Mentions",
            paragraphs: [
              "Abonnement annuel à l'Académie Premium d'EduWeb Planner. Ce reçu fait foi de paiement.",
              "Renouvellement à l'échéance. Support : support@eduweb.ci.",
            ],
          },
        ],
      },
      `recu-premium-${sub.reference}.pdf`,
    );
  };

  const confirmSubscription = async () => {
    const now = new Date();
    const expiry = new Date(now);
    expiry.setFullYear(expiry.getFullYear() + 1);
    const sub: Subscription = {
      active: true,
      planId: plan.id,
      planName: plan.name,
      capacity: plan.capacity,
      amountFcfa: totalFcfa,
      amountEur: totalEur,
      discountCode: appliedCode,
      discountPct: pct,
      paymentMethod: payment.name,
      reference: `EWP-PREM-${now.getTime().toString(36).toUpperCase().slice(-6)}`,
      startsAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
    };
    subscribe(sub);
    if (etablissements[0]) updateEtablissement(etablissements[0].id, { subscriptionPlan: "Premium" });
    toast.success("Abonnement Premium activé", {
      description: `${sub.planName} — ${fcfa(sub.amountFcfa)} · réf. ${sub.reference}. Reçu en téléchargement.`,
    });
    try {
      await downloadReceipt(sub);
    } catch {
      /* génération du reçu best-effort */
    }
  };

  const cancel = () => {
    cancelSubscription();
    if (etablissements[0]) updateEtablissement(etablissements[0].id, { subscriptionPlan: "Standard" });
    toast("Abonnement résilié", { description: "L'Académie Premium est désactivée." });
  };

  const subscribeSms = () => {
    setSmsAlerts(true);
    toast.success("Alertes SMS activées", { description: "Les parents pourront recevoir les notifications." });
  };

  return (
    <ModulePage title={t("pages.vieScolaireAcademiePremium.title")} description={t("pages.vieScolaireAcademiePremium.description")}
      icon={Crown}
      permission="premium:view"
      sections={[
        { id: "formules", label: "Formules" },
        { id: "inclus", label: "Inclus" },
        { id: "sms", label: "Alertes SMS" },
        { id: "reductions", label: "Réductions" },
        { id: "paiement", label: "Paiement" },
        { id: "aides", label: "Aides & réductions" },
      ]}
    >
      {/* Hero */}
      <div className="ew-hero-gradient ew-mesh rounded-2xl p-5 text-white sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <Crown className="h-6 w-6 text-ew-gold-500" />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold">Pourquoi passer Premium ?</h2>
            <p className="mt-1 max-w-2xl text-sm text-white/80">
              Bulletins officiels signés et tamponnés, notifications SMS automatiques, statistiques avancées et support prioritaire.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {HERO_FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex items-center gap-3 rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
                <Icon className="h-5 w-5 shrink-0 text-ew-gold-500" />
                <div>
                  <p className="text-sm font-bold leading-tight">{f.title}</p>
                  <p className="text-xs text-white/70">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* État de l'abonnement (actif) */}
      {subscription?.active && (
        <div className="rounded-2xl border border-ew-green-600/40 bg-ew-green-50 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ew-green-100 text-ew-green-700">
                <BadgeCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-ew-green-900">Abonnement Premium actif — {subscription.planName}</p>
                <p className="mt-0.5 text-sm text-ew-green-900/80">
                  Réf. {subscription.reference} · {fcfa(subscription.amountFcfa)} payé via {subscription.paymentMethod}
                  {subscription.discountCode ? ` · ${subscription.discountCode} (−${subscription.discountPct}%)` : ""}
                </p>
                <p className="text-xs text-ew-green-900/70">
                  Valable du {fmtDate(subscription.startsAt)} au {fmtDate(subscription.expiresAt)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" onClick={() => downloadReceipt(subscription)}>
                <Download className="h-4 w-4" /> Reçu
              </Button>
              <Button variant="outline" onClick={cancel}>
                Résilier
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Formules */}
      <div id="formules" className="scroll-mt-24">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Choisissez votre formule</p>
        <p className="mb-3 text-sm text-muted-foreground">Tarifs annuels en FCFA selon l&apos;effectif de votre établissement.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {PLANS.map((p) => {
            const active = p.id === planId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlanId(p.id)}
                className={cn(
                  "relative rounded-2xl border-2 bg-card p-5 text-left shadow-sm transition-colors",
                  active ? "border-ew-green-600 ring-2 ring-ew-green-600/20" : "border-border hover:border-ew-green-600/40",
                )}
              >
                {p.popular && (
                  <span className="absolute right-3 top-3 rounded-full bg-ew-green-700 px-2.5 py-0.5 text-[11px] font-bold text-white">
                    Populaire
                  </span>
                )}
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ew-green-100 text-ew-green-700">
                  <Users className="h-5 w-5" />
                </span>
                <p className="mt-3 font-bold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.capacity}</p>
                <p className="mt-3 text-2xl font-extrabold text-ew-green-700">
                  {fcfa(p.fcfa)}
                  <span className="text-sm font-semibold text-muted-foreground">/an</span>
                </p>
                <p className="text-xs text-muted-foreground">({eurInt(p.eur)})</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inclus dans toutes les formules */}
      <SectionCard id="inclus" title="Inclus dans toutes les formules">
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {INCLUDED.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-ew-green-600" />
              {item}
            </li>
          ))}
        </ul>
      </SectionCard>

      {/* Alertes SMS automatiques aux parents */}
      <div id="sms" className="scroll-mt-24 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <BellRing className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-foreground">Alertes SMS automatiques aux parents</p>
              <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
                Informer les parents en temps réel : absences, notes, convocations. Offre souscrite séparément, par élève et par
                année scolaire.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-blue-100 px-2.5 py-1 font-semibold text-blue-800">2 000 FCFA (6,08 EUR) / élève / an</span>
                <span className="rounded-full bg-white px-2.5 py-1 font-medium text-muted-foreground ring-1 ring-border">Réduction multi-enfants</span>
                <span className="rounded-full bg-white px-2.5 py-1 font-medium text-muted-foreground ring-1 ring-border">Souscription par les parents</span>
              </div>
            </div>
          </div>
          {smsAlerts ? (
            <Button className="shrink-0" variant="outline" disabled>
              <Check className="h-4 w-4" /> Activé
            </Button>
          ) : (
            <Button className="shrink-0" onClick={subscribeSms}>
              <BellRing className="h-4 w-4" /> Souscrire
            </Button>
          )}
        </div>
      </div>

      {/* Réductions disponibles */}
      <SectionCard
        id="reductions"
        title="Réductions disponibles"
        action={
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ew-gold-100 text-ew-gold-600">
            <Percent className="h-4 w-4" />
          </span>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DISCOUNTS.map((d) => {
            const active = appliedCode === d.code;
            return (
              <button
                key={d.code}
                type="button"
                onClick={() => applyCode(d.code)}
                className={cn(
                  "rounded-xl border p-3 text-left transition-colors",
                  d.preferential ? "border-ew-gold-500/40 bg-ew-gold-100/50" : "border-border bg-card hover:border-ew-green-600/40",
                  active && "ring-2 ring-ew-green-600",
                )}
              >
                {d.preferential && (
                  <span className="mb-1 inline-block rounded-full bg-ew-orange/15 px-2 py-0.5 text-[10px] font-bold uppercase text-ew-orange">
                    Taux préférentiel
                  </span>
                )}
                <p className="text-sm font-semibold text-foreground">{d.label}</p>
                <p className="text-xl font-extrabold text-ew-green-700">−{d.pct}%</p>
                <p className="font-mono text-[11px] text-muted-foreground">{d.code}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex gap-2">
          <Input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Entrez votre code promo" onKeyDown={(e) => e.key === "Enter" && applyCode(promo)} />
          <Button variant="outline" className="shrink-0" onClick={() => applyCode(promo)}>
            Appliquer
          </Button>
        </div>

        {/* Demande de code promo par l'établissement */}
        <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-foreground">Vous n&apos;avez pas encore de code ?</p>
              <p className="text-xs text-muted-foreground">
                Déposez une demande — elle sera instruite par l&apos;administrateur dans « Approbations de codes promo ».
              </p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => setRequestOpen(true)}>
              <Ticket className="h-4 w-4" /> Demander un code promo
            </Button>
          </div>

          {myRequests.length > 0 && (
            <ul className="mt-3 space-y-2">
              {myRequests.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="font-medium text-foreground">
                      {r.type} · −{r.pct}%
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Demande du {fmtDate(r.requestedAt)}
                      {r.status === "rejected" && r.reason ? ` — motif : ${r.reason}` : ""}
                    </span>
                  </span>
                  {r.status === "pending" && <Badge tone="gold">En attente</Badge>}
                  {r.status === "rejected" && <Badge tone="red">Refusée</Badge>}
                  {r.status === "approved" && r.code && (
                    <span className="flex items-center gap-2">
                      <code className="rounded bg-ew-green-50 px-2 py-0.5 font-mono text-xs font-bold text-ew-green-800 ring-1 ring-ew-green-600/30">
                        {r.code}
                      </code>
                      <Button size="sm" onClick={() => applyCode(r.code!)}>
                        Utiliser
                      </Button>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionCard>

      {/* Générer un code promo client (repliable) */}
      <SectionCard contentClassName="p-0">
        <button
          type="button"
          onClick={() => setShowPromoGen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left sm:px-5"
        >
          <span className="flex items-center gap-2 font-bold text-foreground">
            <Ticket className="h-4 w-4 text-ew-green-700" /> Générer un code promo client
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showPromoGen && "rotate-180")} />
        </button>
        {showPromoGen && (
          <div className="space-y-3 border-t border-border px-4 py-4 sm:px-5">
            <p className="text-sm text-muted-foreground">
              Générez un code de réduction personnalisé à transmettre à un établissement client (réservé aux partenaires).
            </p>
            <div className="flex flex-wrap gap-2">
              <Input placeholder="Nom du client / partenaire" className="flex-1" />
              <Button variant="outline" onClick={() => toast.success("Code promo généré", { description: "PARTENAIRE-" + Math.random().toString(36).slice(2, 7).toUpperCase() })}>
                <Ticket className="h-4 w-4" /> Générer
              </Button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Mode de paiement */}
      <SectionCard id="paiement" title="Mode de paiement">
        <div className="grid gap-3 sm:grid-cols-2">
          {PAYMENTS.map((p) => {
            const Icon = p.icon;
            const active = p.id === paymentId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPaymentId(p.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border-2 bg-card p-3 text-left transition-colors",
                  active ? "border-ew-green-600 ring-2 ring-ew-green-600/15" : "border-border hover:border-ew-green-600/40",
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                {active && <Check className="h-4 w-4 shrink-0 text-ew-green-700" />}
              </button>
            );
          })}
        </div>

        {/* Récapitulatif */}
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Récapitulatif</p>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Formule</span>
            <span className="font-medium text-foreground">{plan.name}</span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Tarif de base</span>
            <span className="text-foreground">{fcfa(plan.fcfa)} ({eur2(plan.eur)})</span>
          </div>
          {pct > 0 && (
            <div className="flex justify-between py-1 text-sm text-ew-green-700">
              <span>Réduction {appliedCode} (−{pct}%)</span>
              <span>−{fcfa(plan.fcfa - totalFcfa)}</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="font-bold text-foreground">Total</span>
            <span className="text-lg font-extrabold text-foreground">{fcfa(totalFcfa)} ({eur2(totalEur)})</span>
          </div>
          <div className="flex justify-between pt-1 text-xs text-muted-foreground">
            <span>Paiement via</span>
            <span>{payment.name}</span>
          </div>
        </div>

        <Button className="mt-4 w-full" size="lg" onClick={confirmSubscription}>
          <CreditCard className="h-4 w-4" /> {subscription?.active ? "Renouveler l'abonnement" : "Confirmer le paiement"}
        </Button>
      </SectionCard>

      {/* Allocations IZEN */}
      <div id="aides" className="scroll-mt-24 rounded-2xl border border-ew-green-600/30 bg-ew-green-50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ew-green-100 text-ew-green-700">
            <GraduationCap className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-ew-green-900">Allocations IZEN — Institut ZORO de l&apos;Éducation Numérique</p>
            <p className="mt-1 text-sm text-ew-green-900/80">
              Les étudiants bénéficiaires des allocations de la Fondation IZEN bénéficient de réductions spéciales : 50% (code
              <span className="font-mono"> IZEN50</span>) ou 100% pour le soutien complet (code <span className="font-mono">IZEN100</span>).
              Contactez le support pour vérifier votre éligibilité.
            </p>
          </div>
        </div>
      </div>

      {/* Taux préférentiel E-School EduWeb */}
      <div className="rounded-2xl border border-ew-gold-500/40 bg-ew-gold-100/50 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ew-gold-100 text-ew-gold-600">
            <Star className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-foreground">Taux préférentiel E-School EduWeb</p>
            <p className="mt-1 text-sm text-muted-foreground">
              L&apos;établissement abonné à E-School EduWeb bénéficie d&apos;un taux préférentiel de réduction de 20% sur toutes les
              formules. Utilisez le code <span className="font-mono">ESCHOOL2025</span> lors du paiement.
            </p>
          </div>
        </div>
      </div>

      {/* Alertes SMS — Abonnement parents (repliable) */}
      <div className="overflow-hidden rounded-2xl border border-blue-200 bg-blue-50/50">
        <button
          type="button"
          onClick={() => setShowSmsParents((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left sm:px-5"
        >
          <span className="flex items-center gap-2 font-bold text-foreground">
            <MessageSquare className="h-4 w-4 text-blue-700" /> Alertes SMS — Abonnement parents
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showSmsParents && "rotate-180")} />
        </button>
        {showSmsParents && (
          <div className="border-t border-blue-200 px-4 py-4 text-sm text-muted-foreground sm:px-5">
            <p>
              <span className="font-semibold text-foreground">2 000 FCFA (6,08 EUR)</span> / élève · par enfant · réduction pour
              plusieurs enfants. L&apos;abonnement est souscrit directement par les parents pour recevoir les notifications de leur
              enfant.
            </p>
          </div>
        )}
      </div>

      {/* Pied : actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </Button>
        <Button onClick={confirmSubscription}>
          <Crown className="h-4 w-4" /> {subscription?.active ? "Renouveler l'abonnement" : "Souscrire Académie Premium"}
        </Button>
      </div>

      {requestOpen && <RequestPromoDialog etablissement={etabName} onCancel={() => setRequestOpen(false)} onSubmit={submitRequest} />}
    </ModulePage>
  );
}

/* ----------------------- Demande de code promo (établissement) ----------------------- */
function RequestPromoDialog({
  etablissement,
  onCancel,
  onSubmit,
}: {
  etablissement: string;
  onCancel: () => void;
  onSubmit: (type: string, pct: number, justification: string) => void;
}) {
  const [typeIdx, setTypeIdx] = React.useState("0");
  const [justification, setJustification] = React.useState("");
  const chosen = REQUEST_TYPES[Number(typeIdx)] ?? REQUEST_TYPES[0];

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demander un code promo</DialogTitle>
          <DialogDescription>
            Demande au nom de <strong>{etablissement}</strong> — instruite par l&apos;administrateur dans « Approbations de
            codes promo ».
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Type de réduction</Label>
            <Select value={typeIdx} onValueChange={setTypeIdx}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPES.map((t, i) => (
                  <SelectItem key={t.label} value={String(i)}>
                    {t.label} (−{t.pct}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>
              Justification <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Ex : n° de dossier IZEN, contrat E-School, liste des établissements du groupe…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button disabled={!justification.trim()} onClick={() => onSubmit(chosen.label, chosen.pct, justification.trim())}>
            <Ticket className="h-4 w-4" /> Envoyer la demande
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
