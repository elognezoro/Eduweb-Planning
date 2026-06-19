import * as React from "react";
import { cn } from "@/lib/utils";
import type { Seminaire, SeminaireBlock, SeminaireModule, SeminaireActivity } from "@/lib/seminaires/types";

/* ============================================================================
   Livret imprimable A4 du séminaire — à utiliser dans la page d'impression
   /aide/seminaire/{slug}/livret.
   - Pages physiques A4 (210 × 297 mm) via .seminaire-page
   - Entête répétée à chaque page (sauf couverture)
   - Filigrane discret
   - Style sobre, académique, prêt à imprimer en PDF
   ========================================================================== */

const WATERMARK = "Séminaire EduWeb · Magnifica Humanitas";

export function SeminaireLivret({ seminaire }: { seminaire: Seminaire }) {
  let pageNum = 1;
  const next = () => pageNum++;
  return (
    <div id="seminaire-print" className="space-y-6">
      <SeminaireCover seminaire={seminaire} />
      <SeminairePresentation seminaire={seminaire} pageNumber={next()} />
      <SeminaireObjectives seminaire={seminaire} pageNumber={next()} />
      <SeminaireArchitectureLivret seminaire={seminaire} pageNumber={next()} />
      {seminaire.modules.map((m) => (
        <ModuleLivretPages key={m.id} module={m} pageNumberStart={pageNum} bumpPageNumber={next} />
      ))}
      <SeminaireQuizzesLivret seminaire={seminaire} pageNumber={next()} />
      <SeminaireCharteLivret seminaire={seminaire} pageNumber={next()} />
      <SeminaireGrilleLivret seminaire={seminaire} pageNumber={next()} />
      <SeminaireGlossaryLivret seminaire={seminaire} pageNumber={next()} />
      <SeminaireFormateurLivret seminaire={seminaire} pageNumber={next()} />
      <SeminaireSchedulesLivret seminaire={seminaire} pageNumber={next()} />
      <SeminaireClosingLivret seminaire={seminaire} pageNumber={next()} />
    </div>
  );
}

/* -------- Page A4 wrapper -------- */
function LivretPage({
  children,
  pageNumber,
  pageLabel,
  withCover,
  className,
}: {
  children: React.ReactNode;
  pageNumber?: number;
  pageLabel?: string;
  withCover?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "seminaire-page relative mx-auto bg-white px-[18mm] py-[18mm] text-[11.5px] leading-relaxed text-gray-900 shadow-sm",
        "w-[210mm] min-h-[297mm]",
        className,
      )}
      style={{ pageBreakAfter: "always" }}
    >
      {/* Filigrane */}
      {!withCover ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <span
            className="whitespace-nowrap font-display text-[60px] font-extrabold uppercase tracking-[0.18em] text-gray-300"
            style={{ opacity: 0.07, transform: "rotate(-32deg)" }}
          >
            {WATERMARK}
          </span>
        </div>
      ) : null}
      {/* Entête */}
      {!withCover ? (
        <header className="relative z-10 mb-3 flex items-center justify-between border-b border-ew-green-700 pb-1.5 text-[9.5px]">
          <div className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="" className="h-4 w-4 object-contain" />
            <span className="font-bold uppercase tracking-wide text-ew-green-800">EduWeb Planner</span>
          </div>
          <span className="font-display font-bold uppercase tracking-wide text-gray-700">
            Magnifica Humanitas — Séminaire
          </span>
          <span className="text-gray-500">{pageLabel ?? `Page ${pageNumber}`}</span>
        </header>
      ) : null}
      <div className="relative z-10">{children}</div>
      {/* Pied */}
      {!withCover ? (
        <footer className="absolute bottom-[10mm] left-[18mm] right-[18mm] flex items-center justify-between border-t border-gray-300 pt-1 text-[9px] text-gray-500">
          <span>EduWeb Planner · Séminaire des écoles catholiques</span>
          <span>{pageNumber ? `Page ${pageNumber}` : ""}</span>
        </footer>
      ) : null}
    </section>
  );
}

function SeminaireCover({ seminaire }: { seminaire: Seminaire }) {
  const m = seminaire.meta;
  return (
    <LivretPage withCover className="overflow-hidden">
      <div className="relative flex h-[260mm] flex-col items-center text-center">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600">
          République de Côte d&apos;Ivoire — Union Discipline Travail
        </p>
        <p className="mt-1 text-[10px] italic text-gray-600">Séminaire des écoles catholiques</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="" className="mt-8 h-28 w-28 object-contain" />

        <span className="mt-10 flex h-1 w-40 rounded-full bg-ew-gold-500" />
        <p className="mt-6 font-display text-[14px] font-bold uppercase tracking-[0.3em] text-ew-green-700">
          Livret académique
        </p>
        <h1
          className="mt-3 max-w-[140mm] font-display text-3xl font-extrabold leading-tight text-ew-green-900"
          style={{ fontFamily: "'Fraunces', 'Times New Roman', Georgia, serif" }}
        >
          {m.title}
        </h1>
        <p className="mt-2 max-w-[140mm] text-[12px] italic text-gray-700">{m.subtitle}</p>
        <span className="mt-6 flex h-1 w-40 rounded-full bg-ew-gold-500" />

        <div className="mt-12 grid w-[150mm] grid-cols-2 gap-3 text-left text-[10.5px]">
          <CoverRow label="Référence" value={`${m.reference}${m.referenceDate ? ` — ${m.referenceDate}` : ""}`} />
          <CoverRow label="Type de cours" value={m.courseType} />
          <CoverRow label="Durée" value={m.duration} />
          <CoverRow label="Niveau" value={m.level} />
          <CoverRow label="Langue" value={m.language.toUpperCase()} />
          <CoverRow label="Complétion" value={m.completion} />
        </div>
        <p className="mt-6 max-w-[150mm] text-[10px] italic text-gray-700">
          <strong>Public cible :</strong> {m.audience}
        </p>

        <div className="mt-auto pt-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ew-green-700">
            EduWeb Planner
          </p>
          <p className="text-[9.5px] italic text-gray-600">
            Plateforme de pilotage scolaire — planning.eduweb.ci
          </p>
        </div>
      </div>
    </LivretPage>
  );
}

function CoverRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-[11px] font-bold text-foreground">{value}</p>
    </div>
  );
}

function SeminairePresentation({ seminaire, pageNumber }: { seminaire: Seminaire; pageNumber: number }) {
  return (
    <LivretPage pageNumber={pageNumber} pageLabel="Présentation">
      <H1>Présentation générale</H1>
      {seminaire.meta.presentation.map((p, i) => (
        <p key={i} className={cn("text-justify", i > 0 && "mt-2")}>
          {p}
        </p>
      ))}
    </LivretPage>
  );
}

function SeminaireObjectives({ seminaire, pageNumber }: { seminaire: Seminaire; pageNumber: number }) {
  return (
    <LivretPage pageNumber={pageNumber} pageLabel="Objectifs">
      <H1>Objectifs pédagogiques</H1>
      <p className="italic text-gray-700">À l&apos;issue de cette formation, le participant sera capable de :</p>
      <ol className="mt-3 space-y-1.5">
        {seminaire.objectives.map((o, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-bold text-ew-green-800">{i + 1}.</span>
            <span>{o}</span>
          </li>
        ))}
      </ol>

      <H2 className="mt-6">Compétences visées</H2>
      <div className="space-y-3">
        {seminaire.competences.map((c) => (
          <div key={c.category}>
            <p className="font-bold text-ew-green-800">{c.category}</p>
            <ul className="mt-1 space-y-0.5">
              {c.items.map((it, j) => (
                <li key={j} className="flex gap-1.5">
                  <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </LivretPage>
  );
}

function SeminaireArchitectureLivret({
  seminaire,
  pageNumber,
}: {
  seminaire: Seminaire;
  pageNumber: number;
}) {
  return (
    <LivretPage pageNumber={pageNumber} pageLabel="Architecture">
      <H1>Architecture pédagogique recommandée</H1>
      <p className="text-gray-700">
        Le séminaire est structuré pour une intégration dans une plateforme numérique (Moodle, EduWeb,
        Canvas, Chamilo, WordPress LMS) sous forme d&apos;un parcours modulaire de neuf séquences.
      </p>
      <table className="mt-3 w-full border-collapse text-[10.5px]">
        <thead>
          <tr className="bg-ew-green-50 text-ew-green-800">
            <th className="border border-gray-300 px-2 py-1 text-left">Section LMS</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Contenu</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Activité</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Évaluation</th>
          </tr>
        </thead>
        <tbody>
          {seminaire.architecture.map((row, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-2 py-1 font-bold text-ew-green-800">{row.section}</td>
              <td className="border border-gray-300 px-2 py-1">{row.contentType}</td>
              <td className="border border-gray-300 px-2 py-1">{row.activity}</td>
              <td className="border border-gray-300 px-2 py-1">{row.evaluation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </LivretPage>
  );
}

function ModuleLivretPages({
  module: m,
  bumpPageNumber,
}: {
  module: SeminaireModule;
  pageNumberStart: number;
  bumpPageNumber: () => number;
}) {
  const pn1 = bumpPageNumber();
  const pn2 = bumpPageNumber();
  return (
    <>
      <LivretPage pageNumber={pn1} pageLabel={`Module ${m.num}`}>
        <H1>
          {m.title}
        </H1>
        <p className="mt-1 text-[12px] italic text-ew-green-700">{m.displayTitle}</p>
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-gray-600">
          <span>
            <strong>Durée :</strong> {m.duration}
          </span>
          <span>
            <strong>Objectif :</strong> {m.objective}
          </span>
        </div>
        {m.welcomeMessage ? (
          <p className="mt-3 whitespace-pre-line italic text-gray-700">{m.welcomeMessage}</p>
        ) : null}
        {m.resume ? (
          <div className="mt-3 text-justify">
            {m.resume.split("\n\n").map((para, i) => (
              <p key={i} className={i > 0 ? "mt-2" : undefined}>
                {para}
              </p>
            ))}
          </div>
        ) : null}
        {m.centralMessage ? (
          <div className="mt-3 rounded border-l-4 border-ew-gold-500 bg-ew-gold-50/60 px-3 py-2">
            <p className="text-[9.5px] font-bold uppercase tracking-wide text-ew-gold-700">Message central</p>
            <p className="text-[11px] italic">{m.centralMessage}</p>
          </div>
        ) : null}
        {m.retain && m.retain.length ? (
          <div className="mt-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ew-green-700">À retenir</p>
            <ul className="mt-1 space-y-0.5">
              {m.retain.map((r, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <BlocksPrint blocks={m.content} />
      </LivretPage>
      <LivretPage pageNumber={pn2} pageLabel={`Module ${m.num} — activités`}>
        <H1>Module {m.num} — Activités et achèvement</H1>
        <p className="text-[12px] italic text-ew-green-700">{m.displayTitle}</p>
        <div className="mt-3 space-y-3">
          {m.activities.map((a) => (
            <ActivityPrint key={a.id} activity={a} />
          ))}
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-ew-green-700">
            Critères d&apos;achèvement
          </p>
          <ul className="mt-1 space-y-0.5">
            {m.achievement.map((c, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </LivretPage>
    </>
  );
}

function BlocksPrint({ blocks }: { blocks: SeminaireBlock[] }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div className="mt-3 space-y-2">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "paragraph":
            return (
              <p key={i} className="text-justify">
                {b.text}
              </p>
            );
          case "subheading":
            return (
              <p
                key={i}
                className={cn(
                  "font-display font-bold text-ew-green-800",
                  b.level === 2 ? "text-[12px]" : b.level === 3 ? "text-[11px]" : "text-[10px]",
                )}
              >
                {b.text}
              </p>
            );
          case "bulletList":
            return (
              <div key={i}>
                {b.intro ? <p className="italic text-gray-700">{b.intro}</p> : null}
                <ul className="mt-1 space-y-0.5">
                  {b.items.map((it, j) => (
                    <li key={j} className="flex gap-1.5">
                      <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          case "numberedList":
            return (
              <div key={i}>
                {b.intro ? <p className="italic text-gray-700">{b.intro}</p> : null}
                <ol className="mt-1 space-y-0.5">
                  {b.items.map((it, j) => (
                    <li key={j} className="flex gap-1.5">
                      <span className="font-bold text-ew-green-700">{j + 1}.</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          case "principle":
            return (
              <div key={i} className="rounded border border-ew-green-200 bg-ew-green-50/40 p-2">
                <p className="text-[11px] font-bold text-ew-green-800">
                  {b.num}. {b.title}
                </p>
                <p className="mt-0.5 text-[10.5px]">{b.description}</p>
                <p className="mt-0.5 text-[10px] italic text-ew-green-800">
                  <strong>Application :</strong> {b.application}
                </p>
              </div>
            );
          case "deviation":
            return (
              <div key={i} className="rounded border border-ew-gold-200 bg-ew-gold-50/40 p-2">
                <p className="text-[11px] font-bold text-ew-gold-700">
                  {b.num}. {b.title}
                </p>
                <p className="mt-0.5 text-[10.5px]">{b.description}</p>
                <p className="mt-1 text-[10px] font-bold uppercase text-ew-gold-700">Risques</p>
                <ul className="mt-0.5 space-y-0.5 text-[10px]">
                  {b.risks.map((r, j) => (
                    <li key={j} className="flex gap-1">
                      <span className="font-bold text-ew-gold-700">·</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 text-[10px] italic">
                  <strong>Solution :</strong> {b.solution}
                </p>
              </div>
            );
          case "domain":
            return (
              <div key={i} className="rounded border border-gray-300 p-2">
                <p className="text-[11px] font-bold text-ew-green-800">
                  {b.num}. {b.title}
                </p>
                <ul className="mt-0.5 space-y-0.5 text-[10px]">
                  {b.items.map((it, j) => (
                    <li key={j} className="flex gap-1.5">
                      <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-600" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          case "table":
            return (
              <div key={i}>
                {b.caption ? (
                  <p className="text-[10px] italic text-gray-600">{b.caption}</p>
                ) : null}
                <table className="mt-1 w-full border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-ew-green-50 text-ew-green-800">
                      {b.headers.map((h, j) => (
                        <th key={j} className="border border-gray-300 px-1.5 py-1 text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, j) => (
                      <tr key={j}>
                        {row.map((cell, k) => (
                          <td key={k} className="border border-gray-300 px-1.5 py-1">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "callout":
            return (
              <div
                key={i}
                className="rounded border-l-4 border-blue-500 bg-blue-50 px-3 py-1 text-[10.5px]"
              >
                <p className="text-[9px] font-bold uppercase tracking-wide">{b.label}</p>
                <p>{b.text}</p>
              </div>
            );
        }
      })}
    </div>
  );
}

function ActivityPrint({ activity: a }: { activity: SeminaireActivity }) {
  return (
    <div className="rounded border border-gray-300 p-2">
      <p className="text-[11px] font-bold">
        <span className="mr-1.5 rounded bg-ew-green-700 px-1 py-0.5 font-mono text-[9px] text-white">
          {a.num}
        </span>
        {a.title}
      </p>
      {a.recommendation ? (
        <p className="mt-0.5 text-[9.5px] italic text-gray-600">
          <strong>Outil recommandé :</strong> {a.recommendation}
        </p>
      ) : null}
      {a.instructions.map((ins, i) => (
        <p key={i} className="mt-1 text-[10.5px]">
          {ins}
        </p>
      ))}
      {a.qcm ? (
        <ol className="mt-1.5 space-y-1 text-[10px]">
          {a.qcm.map((q, i) => (
            <li key={i}>
              <p className="font-bold">
                Q{i + 1}. {q.question}
              </p>
              <ul className="ml-3 space-y-0.5">
                {q.options.map((o, j) => (
                  <li key={j} className={cn(j === q.correctIdx && "font-bold text-ew-green-800")}>
                    {String.fromCharCode(65 + j)}. {o} {j === q.correctIdx ? "✓" : ""}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      ) : null}
      {a.truefalse ? (
        <ul className="mt-1.5 space-y-1 text-[10px]">
          {a.truefalse.map((t, i) => (
            <li key={i}>
              <span>{t.statement}</span>{" "}
              <span className="font-bold text-ew-green-800">→ {t.answer}</span>
              {t.explanation ? <span className="italic text-gray-600"> — {t.explanation}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
      {a.matchings ? (
        <table className="mt-1.5 w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-1.5 py-1 text-left">Situation</th>
              <th className="border border-gray-300 px-1.5 py-1 text-left">Principe</th>
            </tr>
          </thead>
          <tbody>
            {a.matchings.map((m, i) => (
              <tr key={i}>
                <td className="border border-gray-300 px-1.5 py-1">{m.situation}</td>
                <td className="border border-gray-300 px-1.5 py-1 font-bold text-ew-green-800">
                  {m.principle}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {a.steps ? (
        <ol className="mt-1.5 space-y-1 text-[10px]">
          {a.steps.map((s, i) => (
            <li key={i}>
              <p className="font-bold">Étape {s.num}. {s.description}</p>
              <ul className="ml-3">
                {s.choices.map((c, j) => (
                  <li key={j} className={cn(j === s.bestIdx && "font-bold text-ew-green-800")}>
                    {String.fromCharCode(65 + j)}. {c} {j === s.bestIdx ? "✓ (meilleur choix)" : ""}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      ) : null}
      {a.caseStudy ? (
        <div className="mt-1.5 text-[10px]">
          <p>
            <strong>Cas :</strong> {a.caseStudy.description}
          </p>
          <ol className="mt-1 ml-3 space-y-0.5">
            {a.caseStudy.questions.map((q, i) => (
              <li key={i}>
                {i + 1}. {q}
              </li>
            ))}
          </ol>
          <p className="mt-1 italic">
            <strong>Production attendue :</strong> {a.caseStudy.production}
          </p>
        </div>
      ) : null}
      {a.tableHeaders ? (
        <table className="mt-1.5 w-full border-collapse text-[9.5px]">
          <thead>
            <tr className="bg-gray-100">
              {a.tableHeaders.map((h, i) => (
                <th key={i} className="border border-gray-300 px-1.5 py-1 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {a.tableHeaders.map((_, i) => (
                <td key={i} className="h-6 border border-gray-300 px-1.5 italic text-gray-400">
                  …
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      ) : null}
      {a.deliverable ? (
        <p className="mt-1 text-[10px]">
          <strong>Livrable :</strong> {a.deliverable}
        </p>
      ) : null}
      {a.presentationCriteria ? (
        <div className="mt-1 text-[10px]">
          <p className="font-bold">Critères de présentation</p>
          <ul className="ml-3">
            {a.presentationCriteria.map((c, i) => (
              <li key={i}>· {c}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function SeminaireQuizzesLivret({ seminaire, pageNumber }: { seminaire: Seminaire; pageNumber: number }) {
  return (
    <LivretPage pageNumber={pageNumber} pageLabel="Banque de quiz">
      <H1>Banque de quiz pour intégration LMS</H1>
      <p className="italic text-gray-700">
        Trois quiz auto-corrigés pour évaluer la compréhension, l&apos;application de la Doctrine sociale
        et la maîtrise des risques.
      </p>
      <div className="mt-3 space-y-4">
        {seminaire.quizzes.map((q) => (
          <div key={q.id}>
            <H2>{q.title}</H2>
            <ol className="mt-1 space-y-1.5 text-[10.5px]">
              {q.questions.map((it, i) => (
                <li key={i}>
                  <p className="font-bold">
                    Q{i + 1}. {it.question}
                  </p>
                  <ul className="ml-3 space-y-0.5">
                    {it.options.map((o, j) => (
                      <li key={j} className={cn(j === it.correctIdx && "font-bold text-ew-green-800")}>
                        {String.fromCharCode(65 + j)}. {o} {j === it.correctIdx ? "✓" : ""}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </LivretPage>
  );
}

function SeminaireCharteLivret({ seminaire, pageNumber }: { seminaire: Seminaire; pageNumber: number }) {
  return (
    <LivretPage pageNumber={pageNumber} pageLabel="Charte modèle">
      <H1>Charte d&apos;usage responsable de l&apos;intelligence artificielle</H1>
      <H2>Préambule</H2>
      <p className="text-justify">{seminaire.charte.preambule}</p>
      <H2 className="mt-3">Engagements</H2>
      <ol className="space-y-1.5">
        {seminaire.charte.engagements.map((e) => (
          <li key={e.num}>
            <p className="font-bold text-ew-green-800">
              {e.num}. {e.title}
            </p>
            <p>{e.description}</p>
          </li>
        ))}
      </ol>
      <H2 className="mt-3">Mise en œuvre</H2>
      <ul className="space-y-0.5">
        {seminaire.charte.implementation.map((it, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </LivretPage>
  );
}

function SeminaireGrilleLivret({ seminaire, pageNumber }: { seminaire: Seminaire; pageNumber: number }) {
  return (
    <LivretPage pageNumber={pageNumber} pageLabel="Évaluation finale">
      <H1>Grille d&apos;évaluation du projet final</H1>
      <p className="italic text-gray-700">
        Chaque participant ou groupe doit produire une charte d&apos;usage responsable de l&apos;IA
        adaptée à son institution.
      </p>
      <table className="mt-3 w-full border-collapse text-[10.5px]">
        <thead>
          <tr className="bg-ew-green-50 text-ew-green-800">
            <th className="border border-gray-300 px-2 py-1 text-left">Critère</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Points</th>
          </tr>
        </thead>
        <tbody>
          {seminaire.evaluation.criteria.map((c, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-2 py-1">{c.criterion}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{c.points}</td>
            </tr>
          ))}
          <tr className="bg-ew-green-50/70 font-bold">
            <td className="border border-gray-300 px-2 py-1">Total</td>
            <td className="border border-gray-300 px-2 py-1 text-right">
              {seminaire.evaluation.totalPoints}
            </td>
          </tr>
        </tbody>
      </table>
      <H2 className="mt-4">Niveaux de performance</H2>
      <table className="w-full border-collapse text-[10.5px]">
        <tbody>
          {seminaire.evaluation.levels.map((lv, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-2 py-1 font-mono font-bold">{lv.range}</td>
              <td className="border border-gray-300 px-2 py-1">{lv.label}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <H2 className="mt-4">Badges numériques</H2>
      <ul className="space-y-1">
        {seminaire.badges.map((b) => (
          <li key={b.num}>
            <strong className="text-ew-green-800">
              {b.num}. {b.title}
            </strong>{" "}
            — {b.condition}
          </li>
        ))}
      </ul>

      <H2 className="mt-4">Pondération de l&apos;évaluation globale</H2>
      <table className="w-full border-collapse text-[10.5px]">
        <thead>
          <tr className="bg-ew-green-50 text-ew-green-800">
            <th className="border border-gray-300 px-2 py-1 text-left">Élément</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Pondération</th>
          </tr>
        </thead>
        <tbody>
          {seminaire.achievement.weights.map((w, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-2 py-1">{w.element}</td>
              <td className="border border-gray-300 px-2 py-1 text-right font-bold">{w.weight}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </LivretPage>
  );
}

function SeminaireGlossaryLivret({ seminaire, pageNumber }: { seminaire: Seminaire; pageNumber: number }) {
  return (
    <LivretPage pageNumber={pageNumber} pageLabel="Glossaire et repères">
      <H1>Glossaire</H1>
      <dl className="space-y-1.5 text-[10.5px]">
        {seminaire.glossary.map((g) => (
          <div key={g.term}>
            <dt className="font-bold text-ew-green-800">{g.term}</dt>
            <dd>{g.definition}</dd>
          </div>
        ))}
      </dl>

      <H2 className="mt-5">Les 10 repères d&apos;un usage responsable de l&apos;IA</H2>
      <ol className="space-y-0.5">
        {seminaire.references10.map((r) => (
          <li key={r.num} className="flex gap-2">
            <span className="font-bold text-ew-green-700">{r.num}.</span>
            <span>{r.text}</span>
          </li>
        ))}
      </ol>
    </LivretPage>
  );
}

function SeminaireFormateurLivret({ seminaire, pageNumber }: { seminaire: Seminaire; pageNumber: number }) {
  return (
    <LivretPage pageNumber={pageNumber} pageLabel="Guide formateur">
      <H1>Consignes pour le formateur</H1>
      <H2>Avant la formation</H2>
      <ul className="space-y-0.5">
        {seminaire.formateur.before.map((b, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <H2 className="mt-3">Pendant la formation</H2>
      <ul className="space-y-0.5">
        {seminaire.formateur.during.map((b, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <H2 className="mt-3">Après la formation</H2>
      <ul className="space-y-0.5">
        {seminaire.formateur.after.map((b, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <H2 className="mt-4">Plan d&apos;action à 30 jours</H2>
      <p className="italic">{seminaire.actionPlan.forumInstruction}</p>
      <ol className="mt-1 space-y-0.5">
        {seminaire.actionPlan.questions.map((q, i) => (
          <li key={i}>
            {i + 1}. {q}
          </li>
        ))}
      </ol>

      <H2 className="mt-4">Critères d&apos;achèvement automatique</H2>
      <ul className="space-y-0.5">
        {seminaire.achievement.autoCriteria.map((c, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </LivretPage>
  );
}

function SeminaireSchedulesLivret({ seminaire, pageNumber }: { seminaire: Seminaire; pageNumber: number }) {
  return (
    <LivretPage pageNumber={pageNumber} pageLabel="Programmations">
      <H1>Programmations recommandées</H1>
      <H2>
        {seminaire.scheduleShort.label} — {seminaire.scheduleShort.totalDuration}
      </H2>
      <table className="w-full border-collapse text-[10.5px]">
        <thead>
          <tr className="bg-ew-green-50 text-ew-green-800">
            <th className="border border-gray-300 px-2 py-1 text-left">Heure</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Activité</th>
          </tr>
        </thead>
        <tbody>
          {seminaire.scheduleShort.rows?.map((r, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-2 py-1 font-mono">{r.hours}</td>
              <td className="border border-gray-300 px-2 py-1">{r.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <H2 className="mt-4">
        {seminaire.scheduleLong.label} — {seminaire.scheduleLong.totalDuration}
      </H2>
      {seminaire.scheduleLong.days?.map((day) => (
        <div key={day.num} className="mt-2">
          <p className="font-bold text-ew-green-800">Jour {day.num}</p>
          <table className="w-full border-collapse text-[10.5px]">
            <thead>
              <tr className="bg-ew-green-50 text-ew-green-800">
                <th className="border border-gray-300 px-2 py-1 text-left">Heure</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Activité</th>
              </tr>
            </thead>
            <tbody>
              {day.rows.map((r, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 px-2 py-1 font-mono">{r.hours}</td>
                  <td className="border border-gray-300 px-2 py-1">{r.activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </LivretPage>
  );
}

function SeminaireClosingLivret({ seminaire, pageNumber }: { seminaire: Seminaire; pageNumber: number }) {
  return (
    <LivretPage pageNumber={pageNumber} pageLabel="Synthèse & clôture">
      <H1>Synthèse — Cinq verbes pour rester humains</H1>
      <ol className="space-y-1">
        {seminaire.synthese.map((s) => (
          <li key={s.num}>
            <p className="font-bold text-ew-green-800">
              {s.num}. {s.verb}
            </p>
            <p>{s.description}</p>
          </li>
        ))}
      </ol>

      <H2 className="mt-4">Message de clôture</H2>
      {seminaire.closingMessage.split("\n\n").map((p, i) => (
        <p key={i} className={cn("text-justify", i > 0 && "mt-2")}>
          {p}
        </p>
      ))}

      <H2 className="mt-4">Ressources et intégrations LMS</H2>
      <ul className="space-y-0.5 text-[10.5px]">
        {seminaire.resources.map((r) =>
          r.items.map((it, j) => (
            <li key={`${r.kind}-${j}`} className="flex gap-1.5">
              <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
              <span>
                <strong className="text-ew-green-800">
                  {r.kind === "principale" ? "Référence" : "Pédagogique"} :
                </strong>{" "}
                {it}
              </span>
            </li>
          )),
        )}
      </ul>

      <p className="mt-6 text-center text-[9.5px] italic text-gray-500">
        Fin du livret académique — EduWeb Planner · Séminaire des écoles catholiques
      </p>
    </LivretPage>
  );
}

/* -------- Helpers titres -------- */
function H1({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 font-display text-[18px] font-extrabold uppercase tracking-wide text-ew-green-800">
      {children}
    </h2>
  );
}
function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("mb-1.5 mt-2 font-display text-[12px] font-bold uppercase tracking-wide text-ew-green-700", className)}>
      {children}
    </h3>
  );
}
