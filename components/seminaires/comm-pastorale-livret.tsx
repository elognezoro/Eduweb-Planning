import * as React from "react";
import { cn } from "@/lib/utils";
import type {
  CommSeminaire,
  CommSlide,
  CommSlideBlock,
} from "@/lib/seminaires/communication-pastorale";

/* ============================================================================
   Livret imprimable A4 du séminaire « Communication pastorale ».
   - Pages A4 portrait via .seminaire-page (style print déjà en place)
   - Entête répétée + filigrane discret
   - Couverture + présentation + 14 slides + ateliers + méthodes + glossaire
   ========================================================================== */

/**
 * Branding du livret (filigrane, entête, pied de page). Valeurs par défaut =
 * séminaire « Communication pastorale » (SENEC) — préservées à l'identique.
 * Une autre formation (ex. IA) peut fournir ses propres libellés via la prop
 * `branding` de CommLivret.
 */
export interface LivretBranding {
  watermark: string;
  headerLabel: string;
  footerLine: string;
}

const DEFAULT_BRANDING: LivretBranding = {
  watermark: "Séminaire EduWeb · Communication pastorale",
  headerLabel: "Communication pastorale — SENEC",
  footerLine: "EduWeb Planner · Séminaire SENEC · 24 juin 2026",
};

const BrandingContext = React.createContext<LivretBranding>(DEFAULT_BRANDING);

export function CommLivret({
  seminaire,
  branding,
}: {
  seminaire: CommSeminaire;
  branding?: LivretBranding;
}) {
  let p = 0;
  const next = () => ++p;
  return (
    <BrandingContext.Provider value={branding ?? DEFAULT_BRANDING}>
    <div id="seminaire-print" className="space-y-6">
      <CoverPage seminaire={seminaire} />
      <PresentationPage seminaire={seminaire} pageNumber={next()} />
      <ObjectivesPage seminaire={seminaire} pageNumber={next()} />
      {seminaire.slides.map((s) => (
        <SlidePage key={s.num} slide={s} pageNumber={next()} />
      ))}
      <ActivitiesPage seminaire={seminaire} pageNumber={next()} />
      <MethodesPage seminaire={seminaire} pageNumber={next()} />
      <PlanPage seminaire={seminaire} pageNumber={next()} />
      <SchedulePage seminaire={seminaire} pageNumber={next()} />
      <ReperesGlossaryPage seminaire={seminaire} pageNumber={next()} />
      <ClosingPage seminaire={seminaire} pageNumber={next()} />
    </div>
    </BrandingContext.Provider>
  );
}

/* -------- Page A4 wrapper -------- */
function Page({
  children,
  pageNumber,
  withCover,
  className,
}: {
  children: React.ReactNode;
  pageNumber?: number;
  withCover?: boolean;
  className?: string;
}) {
  const branding = React.useContext(BrandingContext);
  return (
    <section
      className={cn(
        "seminaire-page relative mx-auto bg-white px-[18mm] py-[18mm] text-[11.5px] leading-relaxed text-gray-900 shadow-sm",
        "w-[210mm] min-h-[297mm]",
        className,
      )}
      style={{ pageBreakAfter: "always" }}
    >
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
            {branding.watermark}
          </span>
        </div>
      ) : null}

      {!withCover ? (
        <header className="relative z-10 mb-3 flex items-center justify-between border-b border-ew-green-700 pb-1.5 text-[9.5px]">
          <div className="flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo.png" alt="" className="h-4 w-4 object-contain" />
            <span className="font-bold uppercase tracking-wide text-ew-green-800">EduWeb Planner</span>
          </div>
          <span className="font-display font-bold uppercase tracking-wide text-gray-700">
            {branding.headerLabel}
          </span>
          <span className="text-gray-500">{`Page ${pageNumber}`}</span>
        </header>
      ) : null}

      <div className="relative z-10">{children}</div>

      {!withCover ? (
        <footer className="absolute bottom-[10mm] left-[18mm] right-[18mm] flex items-center justify-between border-t border-gray-300 pt-1 text-[9px] text-gray-500">
          <span>{branding.footerLine}</span>
          <span>Page {pageNumber}</span>
        </footer>
      ) : null}
    </section>
  );
}

function CoverPage({ seminaire }: { seminaire: CommSeminaire }) {
  return (
    <Page withCover>
      <div className="relative flex h-[260mm] flex-col items-center text-center">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600">
          République de Côte d&apos;Ivoire — Union Discipline Travail
        </p>
        <p className="mt-1 text-[10px] italic text-gray-600">
          Séminaire des communicateurs de l&apos;Éducation Catholique
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={seminaire.heroImage}
          alt=""
          className="mt-6 h-[80mm] w-[170mm] rounded object-cover shadow"
        />

        <span className="mt-6 flex h-1 w-40 rounded-full bg-ew-gold-500" />
        <p className="mt-4 font-display text-[14px] font-bold uppercase tracking-[0.28em] text-ew-green-700">
          Livret académique
        </p>
        <h1
          className="mt-3 max-w-[150mm] font-display text-3xl font-extrabold leading-tight text-ew-green-900"
          style={{ fontFamily: "'Fraunces', 'Times New Roman', Georgia, serif" }}
        >
          {seminaire.meta.title}
        </h1>
        <p className="mt-2 max-w-[150mm] text-[12px] italic text-gray-700">{seminaire.meta.subtitle}</p>
        <span className="mt-4 flex h-1 w-40 rounded-full bg-ew-gold-500" />

        <div className="mt-8 grid w-[150mm] grid-cols-2 gap-3 text-left text-[10.5px]">
          <CoverRow label="Référence" value={seminaire.meta.reference} />
          <CoverRow label="Date" value={seminaire.meta.referenceDate} />
          <CoverRow label="Format" value={seminaire.meta.format} />
          <CoverRow label="Durée" value={seminaire.meta.duration} />
          <CoverRow label="Niveau" value={seminaire.meta.level} />
          <CoverRow label="Organisateur" value={seminaire.meta.organiser} />
        </div>
        <p className="mt-6 max-w-[150mm] text-[10px] italic text-gray-700">
          <strong>Public cible :</strong> {seminaire.meta.audience}
        </p>

        <div className="mt-auto pt-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ew-green-700">
            EduWeb Planner
          </p>
          <p className="text-[9.5px] italic text-gray-600">
            Plateforme de pilotage scolaire — planning.eduweb.ci
          </p>
        </div>
      </div>
    </Page>
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

function PresentationPage({ seminaire, pageNumber }: { seminaire: CommSeminaire; pageNumber: number }) {
  return (
    <Page pageNumber={pageNumber}>
      <H1>Présentation générale</H1>
      {seminaire.meta.presentation.map((p, i) => (
        <p key={i} className={cn("text-justify", i > 0 && "mt-2")}>
          {p}
        </p>
      ))}
    </Page>
  );
}

function ObjectivesPage({ seminaire, pageNumber }: { seminaire: CommSeminaire; pageNumber: number }) {
  return (
    <Page pageNumber={pageNumber}>
      <H1>Objectifs &amp; compétences</H1>
      <H2>Objectifs pédagogiques</H2>
      <ol className="space-y-1">
        {seminaire.objectives.map((o, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-bold text-ew-green-800">{i + 1}.</span>
            <span>{o}</span>
          </li>
        ))}
      </ol>
      <H2 className="mt-4">Compétences visées</H2>
      <ul className="space-y-0.5">
        {seminaire.competences.map((c, i) => (
          <li key={i} className="flex gap-1.5">
            <span aria-hidden className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </Page>
  );
}

function SlidePage({ slide, pageNumber }: { slide: CommSlide; pageNumber: number }) {
  return (
    <Page pageNumber={pageNumber}>
      <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-ew-gold-600">
        Diapositive {String(slide.num).padStart(2, "0")}
      </p>
      <H1>{slide.title}</H1>
      {slide.subtitle ? <p className="mt-1 text-[11px] italic text-gray-700">{slide.subtitle}</p> : null}
      <div className="mt-3 space-y-2.5">
        {slide.blocks.map((b, i) => (
          <BlockPrint key={i} block={b} />
        ))}
      </div>
      {slide.footer ? (
        <p className="mt-3 rounded border-l-4 border-ew-gold-500 bg-ew-gold-50/70 px-3 py-1.5 italic">
          {slide.footer}
        </p>
      ) : null}
      {slide.facilitatorNote ? (
        <p className="mt-3 rounded border-l-4 border-ew-green-700 bg-ew-green-50/60 px-3 py-1.5 text-[10.5px]">
          <span className="font-bold uppercase tracking-wide text-ew-green-700">Note formateur · </span>
          {slide.facilitatorNote}
        </p>
      ) : null}
    </Page>
  );
}

function BlockPrint({ block: b }: { block: CommSlideBlock }) {
  switch (b.kind) {
    case "paragraph":
      return (
        <p
          className={cn(
            "text-justify",
            b.tone === "lead" && "font-medium",
            b.tone === "muted" && "text-[10.5px] italic text-gray-600",
          )}
        >
          {b.text}
        </p>
      );
    case "highlight":
      return (
        <p
          className={cn(
            "rounded border-l-4 px-3 py-1.5 text-[11px] font-medium",
            b.tone === "info" && "border-blue-500 bg-blue-50",
            b.tone === "pastoral" && "border-purple-500 bg-purple-50",
            b.tone === "warning" && "border-ew-gold-500 bg-ew-gold-50",
            b.tone === "success" && "border-ew-green-500 bg-ew-green-50",
            !b.tone && "border-ew-green-500 bg-ew-green-50",
          )}
        >
          {b.text}
        </p>
      );
    case "bulletList":
      return (
        <div>
          {b.intro ? <p className="italic text-gray-700">{b.intro}</p> : null}
          <ul className="mt-1 space-y-0.5">
            {b.items.map((it, i) => (
              <li key={i} className="flex gap-1.5">
                <span aria-hidden className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-ew-green-700" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "numberedList":
      return (
        <div>
          {b.intro ? <p className="italic text-gray-700">{b.intro}</p> : null}
          <ol className="mt-1 space-y-0.5">
            {b.items.map((it, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="font-bold text-ew-green-700">{i + 1}.</span>
                <span>{it}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case "pillars":
      return (
        <div className={cn("grid gap-2", b.align === "horizontal" ? "grid-cols-3" : "grid-cols-2")}>
          {b.items.map((it, i) => (
            <div key={i} className="rounded border border-ew-green-200 bg-ew-green-50/40 p-2">
              <p className="text-[9.5px] font-bold uppercase tracking-wide text-ew-green-700">{it.label}</p>
              <p className="text-[11px] font-bold text-ew-green-900">{it.title}</p>
              <p className="text-[10px] text-gray-700">{it.description}</p>
            </div>
          ))}
        </div>
      );
    case "principles":
      return (
        <div>
          {b.title ? (
            <p className="text-[10px] font-bold uppercase tracking-wide text-ew-green-700">{b.title}</p>
          ) : null}
          <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {b.items.map((it, i) => (
              <div key={i} className="rounded border border-purple-200 bg-purple-50 p-2">
                <p className="font-display text-2xl font-extrabold text-purple-700">{it.letter}</p>
                <p className="text-[10.5px] font-bold text-purple-700">{it.label}</p>
                <ul className="mt-0.5 space-y-0">
                  {it.points.map((p, j) => (
                    <li key={j} className="text-[10px]">
                      · {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    case "flow":
      return (
        <p className="rounded border border-ew-green-200 bg-ew-green-50/60 px-2 py-1 text-[10.5px] font-medium text-ew-green-900">
          {b.items.join(" › ")}
        </p>
      );
    case "channels":
      return (
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {b.items.map((c, i) => (
            <div key={i} className="rounded border border-gray-300 p-1.5 text-[10px]">
              <p className="font-bold text-ew-green-800">{c.name}</p>
              <p className="italic text-gray-600">{c.purpose}</p>
            </div>
          ))}
        </div>
      );
    case "publics":
      return (
        <table className="w-full border-collapse text-[9.5px]">
          <thead>
            <tr className="bg-ew-green-50 text-ew-green-800">
              {b.headers.map((h, i) => (
                <th key={i} className="border border-gray-300 px-1.5 py-1 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i}>
                <td className="border border-gray-300 px-1.5 py-1 font-bold text-ew-green-800">{r.public}</td>
                <td className="border border-gray-300 px-1.5 py-1">{r.verbs.join(" / ")}</td>
                {r.columns.map((cell, j) => (
                  <td key={j} className="border border-gray-300 px-1.5 py-1">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "steps":
      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {b.items.map((s) => (
            <div key={s.num} className="rounded border border-ew-green-200 p-2 text-[10px]">
              <span
                aria-hidden
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-ew-green-700 text-[10px] font-bold text-white"
              >
                {s.num}
              </span>
              <p className="mt-1 font-bold text-ew-green-900">{s.label}</p>
              <p className="text-gray-700">{s.detail}</p>
            </div>
          ))}
        </div>
      );
  }
}

function ActivitiesPage({ seminaire, pageNumber }: { seminaire: CommSeminaire; pageNumber: number }) {
  return (
    <Page pageNumber={pageNumber}>
      <H1>Ateliers interactifs</H1>
      <p className="italic text-gray-700">
        Sept ateliers permettent de transformer les repères de la présentation en compétences
        opérationnelles dans votre institution.
      </p>
      <div className="mt-3 space-y-2.5">
        {seminaire.activities.map((a) => (
          <div key={a.id} className="rounded border border-gray-300 p-2.5">
            <p className="text-[11px] font-bold">
              <span aria-hidden className="mr-1.5 rounded bg-ew-purple-500 px-1.5 py-0.5 font-mono text-[9px] text-white">
                {a.num}
              </span>
              {a.title}
            </p>
            {a.recommendation ? (
              <p className="mt-0.5 text-[9.5px] italic text-gray-600">{a.recommendation}</p>
            ) : null}
            {a.instructions.map((ins, i) => (
              <p key={i} className="mt-1 text-[10.5px]">
                {ins}
              </p>
            ))}
            {a.items ? (
              <ul className="mt-1.5 space-y-0.5 text-[10px]">
                {a.items.map((it, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span aria-hidden className="mt-1 h-2.5 w-2.5 shrink-0 rounded border border-gray-500" />
                    <span>
                      <strong>{it.label}</strong>
                      {it.helper ? ` — ${it.helper}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {a.qcm ? (
              <ol className="mt-1.5 space-y-1.5 text-[10px]">
                {a.qcm.map((q, i) => (
                  <li key={i}>
                    <p className="font-bold">
                      Q{i + 1}. {q.question}
                    </p>
                    <ul className="ml-3 space-y-0">
                      {q.options.map((o, j) => (
                        <li key={j} className={cn(j === q.correctIdx && "font-bold text-ew-green-800")}>
                          {String.fromCharCode(65 + j)}. {o} {j === q.correctIdx ? "✓" : ""}
                        </li>
                      ))}
                    </ul>
                    {q.rationale ? (
                      <p className="mt-0.5 italic text-gray-600">{q.rationale}</p>
                    ) : null}
                  </li>
                ))}
              </ol>
            ) : null}
            {a.tableHeaders && a.tableRows ? (
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
                  {a.tableRows.map((rl, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-1.5 py-1 font-bold">{rl}</td>
                      {Array.from({ length: a.tableHeaders!.length - 1 }).map((_, j) => (
                        <td key={j} className="h-5 border border-gray-300 px-1.5 italic text-gray-400">
                          …
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {a.deliverable ? (
              <p className="mt-1 text-[10px]">
                <strong>Livrable :</strong> {a.deliverable}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </Page>
  );
}

function MethodesPage({ seminaire, pageNumber }: { seminaire: CommSeminaire; pageNumber: number }) {
  // Formation IA : méthode P.A.S.T.O.R.A.L. (prompt) + règle des 5 V.
  if (seminaire.promptMethod || seminaire.fiveV) {
    return (
      <Page pageNumber={pageNumber}>
        <H1>Méthodes &amp; règles d&apos;or</H1>
        {seminaire.promptMethod ? (
          <>
            <H2>Méthode P.A.S.T.O.R.A.L. — rédiger un bon prompt</H2>
            <p className="italic text-gray-700">
              Huit repères pour formuler une consigne claire, contextualisée et exploitable.
            </p>
            <ul className="mt-2 grid grid-cols-2 gap-2">
              {seminaire.promptMethod.map((p, i) => (
                <li key={i} className="rounded border border-ew-green-200 bg-ew-green-50/40 p-2 text-[10.5px]">
                  <p className="font-display text-lg font-extrabold text-ew-green-700">{p.letter}</p>
                  <p className="font-bold text-ew-green-800">{p.label}</p>
                  <p className="text-gray-700">{p.detail}</p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {seminaire.fiveV ? (
          <>
            <H2 className="mt-4">Règle des 5 V — avant toute publication assistée par IA</H2>
            <ul className="mt-2 grid grid-cols-2 gap-2">
              {seminaire.fiveV.map((v, i) => (
                <li key={i} className="rounded border border-purple-200 bg-purple-50 p-2 text-[10.5px]">
                  <p className="font-display text-lg font-extrabold text-purple-700">{v.letter}</p>
                  <p className="font-bold text-purple-700">{v.label}</p>
                  <p className="text-gray-700">{v.detail}</p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </Page>
    );
  }
  // Séminaire numérique : méthode RAPIDE + règle des 4V.
  return (
    <Page pageNumber={pageNumber}>
      <H1>Méthodes &amp; règles d&apos;or</H1>
      <H2>Méthode RAPIDE</H2>
      <p className="italic text-gray-700">Grille de relecture en six critères avant toute publication.</p>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {(seminaire.rapide ?? []).map((r) => (
          <li key={r.letter} className="rounded border border-ew-green-200 bg-ew-green-50/40 p-2 text-[10.5px]">
            <p className="font-display text-lg font-extrabold text-ew-green-700">{r.letter}</p>
            <p>{r.label}</p>
          </li>
        ))}
      </ul>
      <H2 className="mt-4">Règle des 4V — publication assistée par IA</H2>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {(seminaire.fourV ?? []).map((v, i) => (
          <li key={i} className="rounded border border-purple-200 bg-purple-50 p-2 text-[10.5px]">
            <p className="font-display text-lg font-extrabold text-purple-700">{v.letter}</p>
            <p className="font-bold text-purple-700">{v.label}</p>
            <p className="text-gray-700">{v.detail}</p>
          </li>
        ))}
      </ul>
    </Page>
  );
}

function PlanPage({ seminaire, pageNumber }: { seminaire: CommSeminaire; pageNumber: number }) {
  // Formation IA : protocole d'usage responsable en N points.
  if (seminaire.protocol) {
    return (
      <Page pageNumber={pageNumber}>
        <H1>Protocole d&apos;usage responsable de l&apos;IA</H1>
        <p className="italic text-gray-700">
          Cadre simple à adopter dans votre cellule de communication avant tout usage de
          l&apos;intelligence artificielle.
        </p>
        <div className="mt-3 space-y-2">
          {seminaire.protocol.map((p) => (
            <div key={p.num} className="rounded border border-ew-green-200 bg-ew-green-50/40 p-2 text-[10.5px]">
              <p className="font-bold text-ew-green-800">
                {p.num}. {p.title}
              </p>
              <ul className="mt-1 list-disc pl-4 text-gray-700">
                {p.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Page>
    );
  }
  // Séminaire numérique : modèle de plan d'action.
  if (!seminaire.actionPlanTemplate) return null;
  const plan = seminaire.actionPlanTemplate;
  return (
    <Page pageNumber={pageNumber}>
      <H1>Modèle de plan d&apos;action</H1>
      <p className="italic text-gray-700">{plan.intro}</p>
      <table className="mt-3 w-full border-collapse text-[10.5px]">
        <thead>
          <tr className="bg-ew-green-50 text-ew-green-800">
            {plan.columns.map((c, i) => (
              <th key={i} className="border border-gray-300 px-2 py-1 text-left">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {plan.examples.map((row, i) => (
            <tr key={i}>
              {row.values.map((v, j) => (
                <td key={j} className="border border-gray-300 px-2 py-1">
                  {v}
                </td>
              ))}
            </tr>
          ))}
          {/* 3 lignes vides à remplir */}
          {Array.from({ length: 3 }).map((_, i) => (
            <tr key={`empty-${i}`}>
              {plan.columns.map((_, j) => (
                <td key={j} className="h-6 border border-gray-300 px-2 italic text-gray-400">
                  …
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}

function SchedulePage({ seminaire, pageNumber }: { seminaire: CommSeminaire; pageNumber: number }) {
  return (
    <Page pageNumber={pageNumber}>
      <H1>Déroulé proposé — 120 minutes</H1>
      <p className="italic text-gray-700">
        Le séminaire articule une présentation de 20 minutes et 100 minutes d&apos;ateliers
        interactifs.
      </p>
      <table className="mt-3 w-full border-collapse text-[10.5px]">
        <thead>
          <tr className="bg-ew-green-50 text-ew-green-800">
            <th className="border border-gray-300 px-2 py-1 text-left">Plage</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Activité</th>
          </tr>
        </thead>
        <tbody>
          {seminaire.schedule.map((s, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-2 py-1 font-mono font-bold">{s.hours}</td>
              <td className="border border-gray-300 px-2 py-1">{s.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
}

function ReperesGlossaryPage({ seminaire, pageNumber }: { seminaire: CommSeminaire; pageNumber: number }) {
  return (
    <Page pageNumber={pageNumber}>
      <H1>Les 10 repères du communicateur catholique</H1>
      <ol className="space-y-1">
        {seminaire.references10.map((r) => (
          <li key={r.num} className="flex gap-2">
            <span className="font-bold text-ew-green-700">{r.num}.</span>
            <span>{r.text}</span>
          </li>
        ))}
      </ol>
      <H2 className="mt-5">Glossaire</H2>
      <dl className="space-y-1.5 text-[10.5px]">
        {seminaire.glossary.map((g) => (
          <div key={g.term}>
            <dt className="font-bold text-ew-green-800">{g.term}</dt>
            <dd>{g.definition}</dd>
          </div>
        ))}
      </dl>
    </Page>
  );
}

function ClosingPage({ seminaire, pageNumber }: { seminaire: CommSeminaire; pageNumber: number }) {
  return (
    <Page pageNumber={pageNumber}>
      <H1>Message de clôture</H1>
      {seminaire.closingMessage.split("\n\n").map((p, i) => (
        <p key={i} className={cn("text-justify", i > 0 && "mt-2")}>
          {p}
        </p>
      ))}
      <p className="mt-8 text-center text-[10px] italic text-gray-500">
        Fin du livret académique — EduWeb Planner · Séminaire SENEC · 24 juin 2026
      </p>
    </Page>
  );
}

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 font-display text-[18px] font-extrabold uppercase tracking-wide text-ew-green-800">
      {children}
    </h2>
  );
}
function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3
      className={cn(
        "mb-1.5 mt-2 font-display text-[12px] font-bold uppercase tracking-wide text-ew-green-700",
        className,
      )}
    >
      {children}
    </h3>
  );
}
