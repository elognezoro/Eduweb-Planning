"use client";

import * as React from "react";
import { Compass, ListChecks, ShieldCheck, Sparkles, XCircle, CheckCircle2 } from "lucide-react";
import type { CommSeminaire } from "@/lib/seminaires/communication-pastorale";

/* ============================================================================
   Vues spécifiques à la formation IA — réutilisent le type CommSeminaire et
   ses champs optionnels (usageCategories, promptMethod, promptExamples,
   fiveV, protocol). Les autres rubriques (hero, objectifs, diapositives,
   ateliers, auto-évaluation, déroulé, repères, glossaire, clôture) sont
   rendues par les composants génériques de comm-pastorale-views.
   ========================================================================== */

/* -------- Module 1 : carte des usages utiles de l'IA -------- */
export function IaUsageMap({ seminaire }: { seminaire: CommSeminaire }) {
  const categories = seminaire.usageCategories ?? [];
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-ew-green-200 bg-ew-green-50/40 px-4 py-3 text-sm">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          <Compass aria-hidden className="h-4 w-4" /> Comprendre l&apos;IA et ses usages
        </p>
        <p className="mt-1 text-foreground/90">
          L&apos;IA générative produit ou améliore des contenus à partir d&apos;un{" "}
          <strong>prompt</strong>. Elle ne comprend pas le monde comme un humain : elle peut
          être convaincante sans être exacte. Utilisez-la comme un{" "}
          <strong>assistant de préparation</strong>, jamais comme une autorité de décision.
        </p>
      </div>

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

      <p className="rounded-md border-l-4 border-ew-gold-500 bg-ew-gold-50 px-3 py-2 text-sm italic">
        L&apos;IA permet de gagner du temps, mais le gain de temps ne doit jamais se faire au
        détriment de la vérité, de la prudence et de la qualité institutionnelle.
      </p>
    </div>
  );
}

/* -------- Module 2 : méthode de prompt P.A.S.T.O.R.A.L. -------- */
export function IaPromptMethod({ seminaire }: { seminaire: CommSeminaire }) {
  const method = seminaire.promptMethod ?? [];
  const examples = seminaire.promptExamples;
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-ew-green-200 bg-ew-green-50/40 px-4 py-3 text-sm">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          <ListChecks aria-hidden className="h-4 w-4" /> Méthode P.A.S.T.O.R.A.L.
        </p>
        <p className="mt-1 text-foreground/90">
          La qualité d&apos;une réponse dépend de la qualité de la demande. Un bon prompt
          précise le public, le contexte, l&apos;objectif, le ton, le canal, les limites et
          les informations à ne pas inventer.
        </p>
      </div>

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

      {examples ? (
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-red-700">
              <XCircle aria-hidden className="h-4 w-4" /> Prompt faible
            </p>
            <p className="mt-2 text-sm italic text-foreground/90">« {examples.bad} »</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Ne précise ni le contexte, ni le public, ni le ton, ni l&apos;objectif, ni le
              canal, ni les informations à éviter.
            </p>
          </div>
          <div className="rounded-xl border border-ew-green-300 bg-ew-green-50/60 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-ew-green-700">
              <CheckCircle2 aria-hidden className="h-4 w-4" /> Bon prompt
            </p>
            <p className="mt-2 text-sm italic text-foreground/90">« {examples.good} »</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Donne à l&apos;IA un rôle, un contexte, une cible, un objectif, un ton, des
              limites et un format attendu.
            </p>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-4 text-sm">
        <p className="font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          Entraînez-vous
        </p>
        <p className="mt-1 text-muted-foreground">
          Rédigez un prompt P.A.S.T.O.R.A.L. pour l&apos;une de ces situations :
        </p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {[
            "Annoncer une journée portes ouvertes.",
            "Inviter les parents à une messe de rentrée.",
            "Valoriser les résultats d'un établissement.",
            "Annoncer une formation des enseignants.",
            "Préparer un message pastoral pour le temps de l'Avent.",
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span aria-hidden className="font-bold text-ew-green-700">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------- Module 3 : règle des 5 V (éthique & validation) -------- */
export function IaFiveV({ seminaire }: { seminaire: CommSeminaire }) {
  const items = seminaire.fiveV ?? [];
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-ew-purple-200 bg-ew-purple-50/50 px-4 py-3 text-sm">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide text-ew-purple-700">
          <ShieldCheck aria-hidden className="h-4 w-4" /> Éthique, risques, image et validation
        </p>
        <p className="mt-1 text-foreground/90">
          Toute communication engage l&apos;image de l&apos;Église, la confiance des familles,
          la dignité des élèves et la crédibilité de l&apos;institution. L&apos;usage de l&apos;IA
          se règle sur une triple exigence : <strong>vérité</strong>, <strong>dignité</strong>{" "}
          et <strong>responsabilité</strong>.
        </p>
      </div>

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

      <p className="rounded-md border-l-4 border-ew-purple-500 bg-card px-3 py-2 text-sm">
        <strong className="text-ew-purple-700">À retenir :</strong> l&apos;IA peut proposer un
        texte séduisant, mais seul le communicateur responsable peut garantir qu&apos;il est
        vrai, juste, prudent et conforme à la mission.
      </p>
    </div>
  );
}

/* -------- Livrable : protocole d'usage responsable de l'IA -------- */
export function IaProtocol({ seminaire }: { seminaire: CommSeminaire }) {
  const protocol = seminaire.protocol ?? [];
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-ew-green-200 bg-ew-green-50/40 px-4 py-3 text-sm">
        <p className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wide text-ew-green-700">
          <Sparkles aria-hidden className="h-4 w-4" /> Protocole d&apos;usage responsable de l&apos;IA
        </p>
        <p className="mt-1 text-foreground/90">
          Le livrable de la formation : un cadre simple, en {protocol.length} points, à adopter
          dans votre cellule de communication.
        </p>
      </div>

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
