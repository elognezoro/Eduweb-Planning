"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  Gauge,
  ListChecks,
  PencilLine,
  ShieldCheck,
  Sparkles,
  Target,
  Wand2,
  XCircle,
} from "lucide-react";
import type { CommSeminaire } from "@/lib/seminaires/communication-pastorale";
import { IA_CONTENT } from "@/lib/seminaires/ia-communication";

/* ============================================================================
   Vues spécifiques à la formation IA. Réutilisent le type CommSeminaire et
   ses champs optionnels (usageCategories, promptMethod, promptExamples,
   fiveV, protocol) pour les éléments structurés, et IA_CONTENT pour le
   contenu narratif scénarisé (narratifs, activités, synthèses, études de cas).
   ========================================================================== */

/* -------- Briques réutilisables -------- */
function SectionIntro({
  icon,
  title,
  children,
  tone = "green",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  tone?: "green" | "purple";
}) {
  return (
    <div
      className={
        tone === "purple"
          ? "rounded-xl border border-ew-purple-200 bg-ew-purple-50/50 px-4 py-3 text-sm"
          : "rounded-xl border border-ew-green-200 bg-ew-green-50/40 px-4 py-3 text-sm"
      }
    >
      <p
        className={
          "flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide " +
          (tone === "purple" ? "text-ew-purple-700" : "text-ew-green-700")
        }
      >
        {icon} {title}
      </p>
      <div className="mt-1 space-y-2 text-foreground/90">{children}</div>
    </div>
  );
}

function Synthesis({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-md border-l-4 border-ew-gold-500 bg-ew-gold-50 px-3 py-2 text-sm">
      <strong className="text-ew-gold-700">Synthèse du module :</strong> {children}
    </p>
  );
}

function PromptBox({
  label,
  text,
  tone,
  icon,
}: {
  label: string;
  text: string;
  tone: "red" | "green" | "neutral";
  icon: React.ReactNode;
}) {
  const cls =
    tone === "red"
      ? "border-red-200 bg-red-50/60"
      : tone === "green"
        ? "border-ew-green-300 bg-ew-green-50/60"
        : "border-border bg-card";
  const labelCls =
    tone === "red" ? "text-red-700" : tone === "green" ? "text-ew-green-700" : "text-ew-green-800";
  return (
    <div className={"rounded-xl border p-4 " + cls}>
      <p className={"flex items-center gap-2 text-xs font-bold uppercase tracking-wide " + labelCls}>
        {icon} {label}
      </p>
      <p className="mt-2 whitespace-pre-line text-sm italic text-foreground/90">{text}</p>
    </div>
  );
}

/* ============================================================================
   Séquence 2 — Diagnostic interactif de maturité IA (avant le Module 1)
   ========================================================================== */
export function IaDiagnostic() {
  const d = IA_CONTENT.diagnostic;
  return (
    <div className="space-y-4">
      <SectionIntro icon={<Gauge aria-hidden className="h-4 w-4" />} title={`Objectif · ${d.durationMin} minutes`}>
        <p>{d.objective}</p>
        <p className="text-xs italic text-muted-foreground">
          Cochez ci-dessous les affirmations vraies pour vous : chaque réponse positive vaut
          1 point. Votre score situe votre niveau de maturité.
        </p>
      </SectionIntro>

      {/* Barème */}
      <div>
        <p className="mb-2 font-display text-sm font-bold text-ew-green-700">Barème d&apos;interprétation</p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-ew-green-50 text-ew-green-800">
              <tr>
                <th className="border-b border-border px-3 py-2 text-left font-bold">Score</th>
                <th className="border-b border-border px-3 py-2 text-left font-bold">Niveau</th>
                <th className="border-b border-border px-3 py-2 text-left font-bold">Interprétation</th>
              </tr>
            </thead>
            <tbody>
              {d.bareme.map((b, i) => (
                <tr key={i} className="border-t border-border align-top">
                  <td className="px-3 py-2 font-mono font-bold text-ew-green-700">{b.range}</td>
                  <td className="px-3 py-2 font-medium">{b.level}</td>
                  <td className="px-3 py-2 text-muted-foreground">{b.interpretation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exploitation pédagogique */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          Échange après le diagnostic
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {d.exploitation.map((q, i) => (
            <li key={i} className="flex items-start gap-2">
              <span aria-hidden className="font-bold text-ew-green-700">
                {i + 1}.
              </span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="rounded-md border-l-4 border-ew-gold-500 bg-ew-gold-50 px-3 py-2 text-sm">
        <strong className="text-ew-gold-700">Message clé :</strong> {d.messageCle}
      </p>
    </div>
  );
}

/* ============================================================================
   Séquence 3 — Module 1 : comprendre l'IA et ses usages
   ========================================================================== */
export function IaUsageMap({ seminaire }: { seminaire: CommSeminaire }) {
  const categories = seminaire.usageCategories ?? [];
  const m = IA_CONTENT.module1;
  return (
    <div className="space-y-4">
      <SectionIntro icon={<Compass aria-hidden className="h-4 w-4" />} title="Comprendre l'IA générative">
        {m.narrative.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </SectionIntro>

      <div>
        <p className="mb-2 font-display text-sm font-bold text-ew-green-700">
          Les principaux usages utiles
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((cat, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-ew-green-800">
                <span
                  aria-hidden
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ew-green-700 text-[11px] font-bold text-white"
                >
                  {i + 1}
                </span>
                {cat.title}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {cat.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span aria-hidden className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Activité guidée */}
      <div className="rounded-2xl border border-ew-green-200 bg-ew-green-50/30 p-4">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          <Wand2 aria-hidden className="h-4 w-4" /> Activité guidée — de la phrase brute au message
        </p>
        <PromptBox
          label="Phrase brute proposée"
          text={m.guidedActivity.rawPhrase}
          tone="red"
          icon={<AlertTriangle aria-hidden className="h-4 w-4" />}
        />
        <p className="mt-3 text-sm text-foreground/90">Ce que l&apos;IA peut faire :</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {m.guidedActivity.canDo.map((c, i) => (
            <span
              key={i}
              className="rounded-full border border-ew-green-300 bg-ew-green-50 px-2.5 py-0.5 text-xs font-medium text-ew-green-900"
            >
              {c}
            </span>
          ))}
        </div>
        <div className="mt-3">
          <PromptBox
            label="Reformulation attendue"
            text={m.guidedActivity.expectedReformulation}
            tone="green"
            icon={<CheckCircle2 aria-hidden className="h-4 w-4" />}
          />
        </div>
      </div>

      <Synthesis>{m.synthesis}</Synthesis>
    </div>
  );
}

/* ============================================================================
   Séquence 4 — Module 2 : bien prompter et produire (P.A.S.T.O.R.A.L.)
   ========================================================================== */
export function IaPromptMethod({ seminaire }: { seminaire: CommSeminaire }) {
  const method = seminaire.promptMethod ?? [];
  const examples = seminaire.promptExamples;
  const m = IA_CONTENT.module2;
  return (
    <div className="space-y-4">
      <SectionIntro icon={<ListChecks aria-hidden className="h-4 w-4" />} title="Bien prompter">
        {m.narrative.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </SectionIntro>

      <div>
        <p className="mb-2 font-display text-sm font-bold text-ew-green-700">
          La méthode P.A.S.T.O.R.A.L.
        </p>
        <ol className="grid gap-2 sm:grid-cols-2">
          {method.map((p, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ew-green-700 font-display text-sm font-extrabold text-white"
              >
                {p.letter}
              </span>
              <div>
                <p className="font-display text-sm font-bold text-ew-green-900">{p.label}</p>
                <p className="text-xs text-foreground/80">{p.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Mauvais vs bon prompt */}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <PromptBox
            label="Prompt faible"
            text={examples ? examples.bad : m.badPrompt}
            tone="red"
            icon={<XCircle aria-hidden className="h-4 w-4" />}
          />
          <div className="mt-2 rounded-md border border-red-100 bg-red-50/40 px-3 py-2 text-xs">
            <p className="font-bold text-red-700">Pourquoi ce prompt est faible — il ne précise pas :</p>
            <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
              {m.whyWeak.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span aria-hidden className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-red-400" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <PromptBox
          label="Bon prompt"
          text={examples ? examples.good : m.goodPrompt}
          tone="green"
          icon={<CheckCircle2 aria-hidden className="h-4 w-4" />}
        />
      </div>

      {/* Exercice pratique */}
      <div className="rounded-xl border border-border bg-card p-4 text-sm">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          <PencilLine aria-hidden className="h-4 w-4" /> Exercice pratique
        </p>
        <p className="mt-1 text-muted-foreground">
          Rédigez un prompt P.A.S.T.O.R.A.L. pour l&apos;une de ces situations :
        </p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {m.exerciseSituations.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span aria-hidden className="font-bold text-ew-green-700">
                {i + 1}.
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <PromptBox
            label="Exemple de bonne réponse"
            text={m.exampleAnswer}
            tone="green"
            icon={<CheckCircle2 aria-hidden className="h-4 w-4" />}
          />
        </div>
      </div>

      <Synthesis>{m.synthesis}</Synthesis>
    </div>
  );
}

/* ============================================================================
   Séquence 5 — Module 3 : éthique, risques, image et validation (5 V)
   ========================================================================== */
export function IaFiveV({ seminaire }: { seminaire: CommSeminaire }) {
  const items = seminaire.fiveV ?? [];
  const m = IA_CONTENT.module3;
  return (
    <div className="space-y-4">
      <SectionIntro
        tone="purple"
        icon={<ShieldCheck aria-hidden className="h-4 w-4" />}
        title="Éthique, risques, image et validation"
      >
        {m.narrative.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </SectionIntro>

      {/* Triple exigence */}
      <div className="grid gap-2 sm:grid-cols-3">
        {m.tripleExigence.map((e, i) => (
          <div key={i} className="rounded-xl border border-ew-purple-200 bg-ew-purple-50 p-3 text-sm">
            <p className="font-display font-bold text-ew-purple-700">{e.label}</p>
            <p className="text-xs text-foreground/80">{e.detail}</p>
          </div>
        ))}
      </div>

      {/* Risques majeurs */}
      <div>
        <p className="mb-2 font-display text-sm font-bold text-ew-purple-700">Les risques majeurs</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {m.majorRisks.map((r, i) => (
            <div key={i} className="rounded-xl border border-red-200 bg-red-50/40 p-3">
              <p className="flex items-center gap-2 font-display text-sm font-bold text-red-700">
                <AlertTriangle aria-hidden className="h-4 w-4 shrink-0" /> {r.title}
              </p>
              <ul className="mt-1.5 space-y-0.5 text-xs">
                {r.items.map((it, j) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <span aria-hidden className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-red-400" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Règle des 5 V */}
      <div>
        <p className="mb-2 font-display text-sm font-bold text-ew-purple-700">
          La règle des 5 V — à vérifier avant publication
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((v, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-ew-purple-200 bg-ew-purple-50 p-3">
              <span
                aria-hidden
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ew-purple-500 font-display text-sm font-extrabold text-white"
              >
                {v.letter}
              </span>
              <div>
                <p className="font-display text-sm font-bold text-ew-purple-700">{v.label}</p>
                <p className="text-xs text-foreground/80">{v.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Étude de cas */}
      <div className="rounded-2xl border border-ew-purple-200 bg-ew-purple-50/30 p-4">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide text-ew-purple-700">
          <Target aria-hidden className="h-4 w-4" /> Étude de cas — un message à corriger
        </p>
        <PromptBox
          label="Message généré par IA"
          text={m.caseStudy.rawMessage}
          tone="red"
          icon={<AlertTriangle aria-hidden className="h-4 w-4" />}
        />
        <div className="mt-2 rounded-md border border-red-100 bg-red-50/40 px-3 py-2 text-xs">
          <p className="font-bold text-red-700">Problèmes à relever :</p>
          <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
            {m.caseStudy.problems.map((p, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span aria-hidden className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-red-400" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-3">
          <PromptBox
            label="Version corrigée"
            text={m.caseStudy.correctedMessage}
            tone="green"
            icon={<CheckCircle2 aria-hidden className="h-4 w-4" />}
          />
        </div>
      </div>

      <Synthesis>{m.synthesis}</Synthesis>
    </div>
  );
}

/* ============================================================================
   Séquence 6 — Atelier pratique : produire, corriger et adapter un message
   ========================================================================== */
export function IaAtelierPratique() {
  const a = IA_CONTENT.atelierPratique;
  return (
    <div className="space-y-4">
      <SectionIntro icon={<Wand2 aria-hidden className="h-4 w-4" />} title={`Consigne générale · ${a.durationMin} minutes`}>
        <p>{a.consigne}</p>
        <p className="text-xs italic text-muted-foreground">
          Travail individuel ou en binôme. Trois étapes : rédiger le prompt, corriger un
          message brut, produire deux versions publiables.
        </p>
      </SectionIntro>

      {/* Étape 1 */}
      <div>
        <p className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-ew-green-700">
          <span
            aria-hidden
            className="flex h-6 w-6 items-center justify-center rounded-full bg-ew-green-700 text-[11px] font-bold text-white"
          >
            1
          </span>
          Rédiger le prompt (méthode P.A.S.T.O.R.A.L.)
        </p>
        <PromptBox
          label="Bonne réponse possible"
          text={a.step1Prompt}
          tone="green"
          icon={<CheckCircle2 aria-hidden className="h-4 w-4" />}
        />
      </div>

      {/* Étape 2 */}
      <div>
        <p className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-ew-green-700">
          <span
            aria-hidden
            className="flex h-6 w-6 items-center justify-center rounded-full bg-ew-green-700 text-[11px] font-bold text-white"
          >
            2
          </span>
          Corriger le message brut
        </p>
        <PromptBox
          label="Message IA brut"
          text={a.step2RawMessage}
          tone="red"
          icon={<AlertTriangle aria-hidden className="h-4 w-4" />}
        />
        <div className="mt-2 rounded-md border border-red-100 bg-red-50/40 px-3 py-2 text-xs">
          <p className="font-bold text-red-700">Problèmes attendus :</p>
          <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
            {a.step2Problems.map((p, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span aria-hidden className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-red-400" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Étape 3 */}
      <div>
        <p className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-ew-green-700">
          <span
            aria-hidden
            className="flex h-6 w-6 items-center justify-center rounded-full bg-ew-green-700 text-[11px] font-bold text-white"
          >
            3
          </span>
          Produire deux versions publiables
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <PromptBox
            label="Version WhatsApp"
            text={a.versionWhatsapp}
            tone="green"
            icon={<CheckCircle2 aria-hidden className="h-4 w-4" />}
          />
          <PromptBox
            label="Version Facebook"
            text={a.versionFacebook}
            tone="green"
            icon={<CheckCircle2 aria-hidden className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Restitution */}
      <div className="rounded-md border-l-4 border-ew-gold-500 bg-ew-gold-50 px-3 py-2 text-sm">
        <strong className="text-ew-gold-700">Restitution :</strong> le formateur corrige selon
        quatre critères —{" "}
        {a.criteres.map((c, i) => (
          <span key={i} className="font-medium">
            {c}
            {i < a.criteres.length - 1 ? ", " : "."}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   Livrable — protocole d'usage responsable de l'IA (7 points)
   ========================================================================== */
export function IaProtocol({ seminaire }: { seminaire: CommSeminaire }) {
  const protocol = seminaire.protocol ?? [];
  return (
    <div className="space-y-4">
      <SectionIntro icon={<Sparkles aria-hidden className="h-4 w-4" />} title="Protocole d'usage responsable de l'IA">
        <p>
          Le livrable de la formation : un cadre simple, en {protocol.length} points, à adopter
          dans votre cellule de communication.
        </p>
      </SectionIntro>

      <div className="grid gap-3 md:grid-cols-2">
        {protocol.map((p) => (
          <div key={p.num} className="rounded-xl border border-border bg-card p-4">
            <p className="flex items-center gap-2 font-display text-sm font-bold text-ew-green-800">
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-ew-green-700 text-[11px] font-bold text-white"
              >
                {p.num}
              </span>
              {p.title}
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {p.items.map((it, j) => (
                <li key={j} className="flex items-start gap-2">
                  <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ew-green-600" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
