"use client";

/* ============================================================================
   Composants académiques pour le « Support de formation EduWeb Planner ».
   Conçus pour rendu écran (aperçu) ET impression A4 (Ctrl+P → PDF).
   Chaque composant correspond à une partie canonique d'un manuel pédagogique :
   couverture, colophon, avant-propos, table des matières, syllabus, modules,
   QCM, exercice, glossaire, index, bibliographie, annexes.
   ========================================================================== */

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------------- */
/*  Types                                                                  */
/* ---------------------------------------------------------------------- */

export interface ManuelIdentification {
  code: string;
  intitule: string;
  intituleAbrege?: string;
  version: string;
  dateValidite: string;
  langue?: string;
  publicVise?: string;
}

export interface ManuelSyllabus {
  identification: ManuelIdentification;
  preambule: string;
  presentationGenerale: string;
  objectifsGeneraux: string[];
  competencesVisees: {
    savoirs: string[];
    savoirFaire: string[];
    savoirEtre: string[];
    savoirAgir: string[];
  };
  publicEtPrerequis: string;
  methodologiePedagogique: { methode: string; description: string; proportion: string }[];
  volumeHoraire: {
    repartitionParModule: { moduleCode: string; titre: string; duree: string }[];
    dureeTotal: string;
    sequencementRecommande: string;
  };
  modalitesEvaluation: {
    diagnostique: string;
    formative: string;
    certificative: string;
    ponderation: string;
  };
  criteresValidation: string[];
  ressourcesBibliographie: {
    titre: string;
    auteur: string;
    editeur?: string;
    annee?: string;
    type: string;
    url?: string;
  }[];
  charteApprenant: string[];
}

export interface ManuelAssessment {
  roleKey: string;
  roleLabel: string;
  moduleCode: string;
  preTest: { question: string }[];
  qcm: {
    question: string;
    choix: string[];
    bonneReponseIndex: number;
    explication: string;
  }[];
  exercice: {
    titre: string;
    introduction: string;
    scenarios: {
      niveau: string;
      contexte: string;
      consignes: string[];
      criteresEvaluation: string[];
    }[];
  };
  syntheseFormative: { question: string }[];
}

export interface ManuelProgression {
  indexGeneral: { terme: string; definition: string; references: string[] }[];
  grilleProgression: { palier: number; niveau: string; descripteur: string }[];
}

/* ---------------------------------------------------------------------- */
/*  Composant racine : page A4                                             */
/* ---------------------------------------------------------------------- */

/** Conteneur d'une page A4 (210×297 mm). Le print CSS gère le saut. */
export function ManuelPage({
  children,
  className,
  pageNumber,
  pageLabel,
  watermark,
}: {
  children: React.ReactNode;
  className?: string;
  pageNumber?: number | string;
  pageLabel?: string;
  /** Texte de filigrane (institution, mention « Confidentiel », etc.). Vide → pas de filigrane. */
  watermark?: string;
}) {
  return (
    <section
      className={cn(
        "manuel-page relative mx-auto overflow-hidden bg-white text-black shadow-md print:shadow-none",
        "min-h-[297mm] w-[210mm] px-[18mm] py-[16mm]",
        "font-display-fallback",
        className,
      )}
      style={{ fontFamily: "'Source Sans Pro', 'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* Filigrane diagonal (très discret, ne masque pas le texte) */}
      {watermark && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex select-none items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <span
            className="whitespace-nowrap font-display text-[68px] font-extrabold uppercase tracking-[0.18em] text-gray-300"
            style={{ opacity: 0.085, transform: "rotate(-32deg)" }}
          >
            {watermark}
          </span>
        </div>
      )}

      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>

      {(pageNumber || pageLabel) && (
        <div className="absolute inset-x-[18mm] bottom-[8mm] flex items-end justify-between text-[9px] uppercase tracking-[0.18em] text-gray-500" style={{ zIndex: 2 }}>
          <span>{pageLabel ?? "EduWeb Planner — Support de formation"}</span>
          {pageNumber !== undefined && <span className="font-bold">{pageNumber}</span>}
        </div>
      )}
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/*  En-tête courant (apparaît en haut de chaque page de chapitre)          */
/* ---------------------------------------------------------------------- */

function RunningHeader({ left, right }: { left: string; right: string }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-3 border-b-2 border-gray-800 pb-2 text-[9px] uppercase tracking-[0.18em] text-gray-700">
      <span className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/logo.png" alt="EduWeb Planner" className="h-5 w-5 object-contain" />
        <span className="font-bold">{left}</span>
      </span>
      <span className="text-gray-500">{right}</span>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  PAGE 1 — Couverture                                                    */
/* ---------------------------------------------------------------------- */

export function ManuelCover({
  identification,
  institutionName,
  countryFlag,
  countryName,
}: {
  identification: ManuelIdentification;
  institutionName?: string;
  countryFlag?: string;
  countryName?: string;
}) {
  return (
    <ManuelPage className="overflow-hidden">
      {/* En-tête institutionnel */}
      <div className="text-center text-[11px] uppercase tracking-[0.18em] text-gray-700">
        <p className="font-bold">République de {countryName ?? "Côte d'Ivoire"}</p>
        <p className="mt-1 italic">Union — Discipline — Travail</p>
        <p className="mt-3 font-bold">Ministère de l'Éducation Nationale</p>
      </div>

      {/* Logo officiel — pièce maîtresse de la couverture */}
      <div className="mt-8 flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo.png"
          alt="Logo EduWeb Planner"
          className="h-32 w-32 object-contain drop-shadow-sm"
        />
      </div>

      {/* Identifiant du document */}
      <div className="mt-6 text-center">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-ew-gold-600">
          Document de référence pédagogique
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-gray-500">
          Code : <span className="font-bold text-gray-800">{identification.code}</span>
        </p>
      </div>

      {/* Titre */}
      <div className="mt-12 flex flex-col items-center text-center">
        <span className="flex h-1.5 w-24 rounded-full bg-ew-gold-500" />
        <h1
          className="mt-6 font-display text-[34px] font-extrabold leading-tight tracking-tight text-ew-green-900"
          style={{ fontFamily: "'Fraunces', 'Times New Roman', Georgia, serif" }}
        >
          {identification.intitule.split(" — ")[0]}
        </h1>
        {identification.intitule.includes(" — ") && (
          <p className="mt-3 text-xl italic text-ew-green-700">
            {identification.intitule.split(" — ").slice(1).join(" — ")}
          </p>
        )}
        <span className="mt-6 flex h-1.5 w-24 rounded-full bg-ew-gold-500" />
      </div>

      {/* Sous-titre / mention */}
      <div className="mt-12 text-center">
        <p className="font-display text-base font-bold uppercase tracking-wider text-gray-800">
          Manuel académique de formation
        </p>
        <p className="mt-2 text-sm italic text-gray-600">
          Support complet du formateur et de l'apprenant
        </p>
      </div>

      {/* Plateforme & version */}
      <div className="mt-16 rounded border-2 border-ew-green-800/30 bg-ew-green-50/40 p-5 text-center">
        <p className="font-display text-lg font-extrabold text-ew-green-800">EduWeb Planner</p>
        <p className="mt-1 text-xs italic text-gray-600">
          Plateforme de pilotage scolaire — https://planning.eduweb.ci
        </p>
        <p className="mt-3 text-[11px] uppercase tracking-wide text-gray-700">
          Version <span className="font-bold">{identification.version}</span> · Validité{" "}
          <span className="font-bold">{identification.dateValidite}</span>
        </p>
      </div>

      {/* Pied de couverture */}
      <div className="absolute inset-x-[18mm] bottom-[16mm] flex items-end justify-between border-t border-gray-300 pt-4 text-[10px] text-gray-600">
        <div>
          <p className="font-bold uppercase tracking-wide">Édition officielle</p>
          {institutionName && <p className="mt-1 italic">{institutionName}</p>}
        </div>
        <div className="text-right">
          <p className="font-bold uppercase tracking-wide">Langue d'enseignement</p>
          <p className="mt-1 italic">{identification.langue ?? "Français"}</p>
        </div>
      </div>
    </ManuelPage>
  );
}

/* ---------------------------------------------------------------------- */
/*  PAGE 2 — Colophon (mentions légales, version, propriété)               */
/* ---------------------------------------------------------------------- */

export function ManuelColophon({ identification, watermark }: { identification: ManuelIdentification; watermark?: string }) {
  const year = new Date().getFullYear();
  return (
    <ManuelPage pageLabel="Colophon" pageNumber="II" watermark={watermark}>
      <RunningHeader left="Colophon" right={identification.code} />
      <h2 className="font-display text-2xl font-bold text-ew-green-900">Mentions légales et copyright</h2>
      <div className="mt-6 space-y-4 text-[12px] leading-relaxed text-gray-800">
        <p>
          <span className="font-bold">Titre :</span> {identification.intitule}
        </p>
        <p>
          <span className="font-bold">Code de référence :</span> {identification.code}
        </p>
        <p>
          <span className="font-bold">Version :</span> {identification.version}
        </p>
        <p>
          <span className="font-bold">Date de validité :</span> {identification.dateValidite}
        </p>
        <p>
          <span className="font-bold">Langue :</span> {identification.langue ?? "Français"}
        </p>
        <p>
          <span className="font-bold">Public visé :</span> {identification.publicVise}
        </p>
      </div>
      <div className="mt-10 border-t border-gray-300 pt-6 text-[12px] leading-relaxed text-gray-800">
        <p className="font-bold uppercase tracking-wide text-gray-700">Propriété intellectuelle</p>
        <p className="mt-2">
          © {year} EduWeb Planner. Tous droits réservés. La reproduction de ce document, en tout ou en partie, à des
          fins commerciales est interdite sans autorisation écrite préalable. Une utilisation à des fins de
          formation institutionnelle non lucrative est autorisée sous réserve de citer la source.
        </p>
      </div>
      <div className="mt-8 border-t border-gray-300 pt-6 text-[12px] leading-relaxed text-gray-800">
        <p className="font-bold uppercase tracking-wide text-gray-700">Confidentialité et données personnelles</p>
        <p className="mt-2">
          Les exemples et copies d'écran présentés dans ce manuel utilisent des données fictives. Les
          utilisateurs sont tenus, dans leur pratique professionnelle, de respecter la confidentialité des
          données scolaires et personnelles conformément aux dispositions légales en vigueur.
        </p>
      </div>
      <div className="mt-8 border-t border-gray-300 pt-6 text-[12px] leading-relaxed text-gray-800">
        <p className="font-bold uppercase tracking-wide text-gray-700">Citation recommandée</p>
        <p className="mt-2 italic">
          EduWeb Planner. ({year}). {identification.intitule}. Référence{" "}
          {identification.code}, version {identification.version}.
        </p>
      </div>
    </ManuelPage>
  );
}

/* ---------------------------------------------------------------------- */
/*  PAGE 3 — Avant-propos                                                  */
/* ---------------------------------------------------------------------- */

export function ManuelForeword({ syllabus, pageNumber = "III", watermark }: { syllabus: ManuelSyllabus; pageNumber?: string | number; watermark?: string }) {
  return (
    <ManuelPage pageLabel="Avant-propos" pageNumber={pageNumber} watermark={watermark}>
      <RunningHeader left="Avant-propos" right={syllabus.identification.code} />
      <h2 className="font-display text-3xl font-extrabold text-ew-green-900">Avant-propos</h2>
      <div className="mt-6 columns-1 gap-8 text-[12px] leading-[1.7] text-gray-800">
        {syllabus.preambule.split(/\n\n+/).map((p, i) => (
          <p key={i} className={cn("mb-4 hyphens-auto text-justify", i === 0 && "first-letter:font-display first-letter:text-5xl first-letter:font-extrabold first-letter:text-ew-green-800 first-letter:mr-1 first-letter:float-left first-letter:leading-[0.85]")}>
            {p}
          </p>
        ))}
      </div>
      <div className="mt-8 border-l-4 border-ew-gold-500 bg-ew-gold-100/30 p-4 italic text-[11px] leading-relaxed text-gray-700">
        Ce manuel est conçu comme un outil de référence pour le formateur et un support d'autoformation pour
        l'apprenant. Les modules peuvent être suivis dans leur intégralité ou sélectionnés en fonction du rôle
        exercé par l'utilisateur.
      </div>
    </ManuelPage>
  );
}

/* ---------------------------------------------------------------------- */
/*  PAGE — Table des matières                                              */
/* ---------------------------------------------------------------------- */

export function ManuelTOC({
  entries,
  pageNumber = "IV",
  watermark,
}: {
  entries: { roman?: string; arabic?: number; label: string; level?: 1 | 2; href?: string }[];
  pageNumber?: string | number;
  watermark?: string;
}) {
  return (
    <ManuelPage pageLabel="Table des matières" pageNumber={pageNumber} watermark={watermark}>
      <RunningHeader left="Table des matières" right="EduWeb Planner" />
      <h2 className="font-display text-3xl font-extrabold text-ew-green-900">Table des matières</h2>
      <ul className="mt-6 space-y-2 text-[12px]">
        {entries.map((e, i) => (
          <li key={i} className={cn("flex items-baseline gap-2", e.level === 2 && "ml-6 text-gray-700")}>
            <span className="font-medium text-gray-900">{e.label}</span>
            <span className="flex-1 border-b border-dotted border-gray-400" />
            <span className="font-mono text-[11px] text-gray-600">{e.arabic ?? e.roman ?? "—"}</span>
          </li>
        ))}
      </ul>
    </ManuelPage>
  );
}

/* ---------------------------------------------------------------------- */
/*  PAGE — Liste des abréviations                                          */
/* ---------------------------------------------------------------------- */

export function ManuelAbbreviations({
  abbreviations,
  pageNumber,
  watermark,
}: {
  abbreviations: { code: string; meaning: string }[];
  pageNumber?: string | number;
  watermark?: string;
}) {
  return (
    <ManuelPage pageLabel="Abréviations" pageNumber={pageNumber} watermark={watermark}>
      <RunningHeader left="Liste des abréviations" right="EduWeb Planner" />
      <h2 className="font-display text-3xl font-extrabold text-ew-green-900">Abréviations et acronymes</h2>
      <p className="mt-2 text-[11px] italic text-gray-600">
        Liste des sigles, acronymes et abréviations utilisés dans le présent manuel.
      </p>
      <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-3 text-[12px] sm:grid-cols-2">
        {abbreviations.map((a) => (
          <div key={a.code} className="manuel-no-break flex items-baseline gap-3">
            <dt className="w-24 shrink-0 font-mono font-bold text-ew-green-800">{a.code}</dt>
            <dd className="text-gray-800">{a.meaning}</dd>
          </div>
        ))}
      </dl>
    </ManuelPage>
  );
}

/* ---------------------------------------------------------------------- */
/*  PAGES — Syllabus (multi-pages)                                         */
/* ---------------------------------------------------------------------- */

export function ManuelSyllabusBlock({ syllabus, startPage = 1, watermark }: { syllabus: ManuelSyllabus; startPage?: number; watermark?: string }) {
  const id = syllabus.identification;
  let p = startPage;
  const pages: React.ReactNode[] = [];

  // Page 1 — Identification + présentation
  pages.push(
    <ManuelPage key={`syl-${p}`} pageLabel="Syllabus — Présentation" pageNumber={p++} watermark={watermark}>
      <RunningHeader left="Syllabus de formation" right={id.code} />
      <h2 className="font-display text-3xl font-extrabold text-ew-green-900">Syllabus</h2>
      <p className="mt-1 text-sm italic text-gray-600">Plan général et cadre académique de la formation</p>

      <div className="mt-6 rounded border border-gray-300 bg-gray-50 p-5 text-[11.5px] leading-relaxed">
        <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
          1. Identification du cours
        </p>
        <table className="mt-3 w-full">
          <tbody className="divide-y divide-gray-200">
            <Row label="Code" value={id.code} mono />
            <Row label="Intitulé" value={id.intitule} />
            {id.intituleAbrege && <Row label="Intitulé abrégé" value={id.intituleAbrege} />}
            <Row label="Version" value={id.version} />
            <Row label="Date de validité" value={id.dateValidite} />
            <Row label="Langue d'enseignement" value={id.langue ?? "Français"} />
            <Row label="Public visé" value={id.publicVise ?? "—"} />
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
          2. Présentation générale
        </p>
        <p className="mt-2 text-justify text-[12px] leading-[1.7] text-gray-800">
          {syllabus.presentationGenerale}
        </p>
      </div>

      <div className="mt-6">
        <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
          3. Public et prérequis
        </p>
        <p className="mt-2 text-justify text-[12px] leading-[1.7] text-gray-800">{syllabus.publicEtPrerequis}</p>
      </div>
    </ManuelPage>,
  );

  // Page 2 — Objectifs + Compétences
  pages.push(
    <ManuelPage key={`syl-${p}`} pageLabel="Syllabus — Objectifs et compétences" pageNumber={p++} watermark={watermark}>
      <RunningHeader left="Syllabus de formation" right={id.code} />
      <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
        4. Objectifs généraux
      </p>
      <p className="mt-1 text-[11px] italic text-gray-600">À l'issue de la formation, l'apprenant sera capable de :</p>
      <ol className="mt-3 space-y-2 text-[12px]">
        {syllabus.objectifsGeneraux.map((o, i) => (
          <li key={i} className="manuel-no-break flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ew-green-800 text-[10px] font-bold text-white">
              {i + 1}
            </span>
            <span className="text-gray-800">{o}</span>
          </li>
        ))}
      </ol>

      <p className="mt-7 font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
        5. Compétences visées (référentiel à 4 dimensions)
      </p>
      <div className="mt-3 grid gap-3">
        <CompetenceBox title="Savoirs" subtitle="Connaissances théoriques" items={syllabus.competencesVisees.savoirs} />
        <CompetenceBox title="Savoir-faire" subtitle="Gestes techniques" items={syllabus.competencesVisees.savoirFaire} />
        <CompetenceBox title="Savoir-être" subtitle="Posture professionnelle" items={syllabus.competencesVisees.savoirEtre} />
        <CompetenceBox title="Savoir-agir" subtitle="Décision et arbitrage" items={syllabus.competencesVisees.savoirAgir} />
      </div>
    </ManuelPage>,
  );

  // Page 3 — Méthodologie + Volume horaire
  pages.push(
    <ManuelPage key={`syl-${p}`} pageLabel="Syllabus — Méthodologie et progression" pageNumber={p++} watermark={watermark}>
      <RunningHeader left="Syllabus de formation" right={id.code} />
      <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
        6. Méthodologie pédagogique
      </p>
      <table className="mt-3 w-full border border-gray-400 text-[11.5px]">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-400 px-2 py-1 text-left font-bold">Méthode</th>
            <th className="border border-gray-400 px-2 py-1 text-left font-bold">Description</th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold">Proportion</th>
          </tr>
        </thead>
        <tbody>
          {syllabus.methodologiePedagogique.map((m, i) => (
            <tr key={i}>
              <td className="border border-gray-400 px-2 py-1 font-semibold">{m.methode}</td>
              <td className="border border-gray-400 px-2 py-1">{m.description}</td>
              <td className="border border-gray-400 px-2 py-1 text-center font-mono">{m.proportion}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-7 font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
        7. Volume horaire et progression
      </p>
      <p className="mt-1 text-[11px] italic text-gray-600">
        Durée totale indicative : <span className="font-bold not-italic text-gray-800">{syllabus.volumeHoraire.dureeTotal}</span>
      </p>
      <table className="mt-3 w-full border border-gray-400 text-[11.5px]">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-400 px-2 py-1 text-left font-bold">Code</th>
            <th className="border border-gray-400 px-2 py-1 text-left font-bold">Module</th>
            <th className="border border-gray-400 px-2 py-1 text-center font-bold">Durée</th>
          </tr>
        </thead>
        <tbody>
          {syllabus.volumeHoraire.repartitionParModule.map((m) => (
            <tr key={m.moduleCode}>
              <td className="border border-gray-400 px-2 py-1 font-mono text-ew-green-800">{m.moduleCode}</td>
              <td className="border border-gray-400 px-2 py-1">{m.titre}</td>
              <td className="border border-gray-400 px-2 py-1 text-center font-mono">{m.duree}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] italic text-gray-700">
        Séquencement recommandé : {syllabus.volumeHoraire.sequencementRecommande}
      </p>
    </ManuelPage>,
  );

  // Page 4 — Évaluation + critères + ressources + charte
  pages.push(
    <ManuelPage key={`syl-${p}`} pageLabel="Syllabus — Évaluation et ressources" pageNumber={p++} watermark={watermark}>
      <RunningHeader left="Syllabus de formation" right={id.code} />
      <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
        8. Modalités d'évaluation
      </p>
      <div className="mt-3 grid gap-3 text-[12px]">
        <EvalLine label="Diagnostique" text={syllabus.modalitesEvaluation.diagnostique} />
        <EvalLine label="Formative" text={syllabus.modalitesEvaluation.formative} />
        <EvalLine label="Certificative" text={syllabus.modalitesEvaluation.certificative} />
        <p className="rounded border border-gray-300 bg-gray-50 px-3 py-2 text-[11.5px] text-gray-700">
          <span className="font-bold uppercase tracking-wide">Pondération · </span>
          {syllabus.modalitesEvaluation.ponderation}
        </p>
      </div>

      <p className="mt-6 font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
        9. Critères de validation
      </p>
      <ul className="mt-2 space-y-1.5 text-[12px]">
        {syllabus.criteresValidation.map((c, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-ew-green-700" />
            <span>{c}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
        10. Ressources et bibliographie
      </p>
      <ol className="mt-2 space-y-1.5 text-[11.5px]">
        {syllabus.ressourcesBibliographie.map((r, i) => (
          <li key={i} className="text-gray-800">
            <span className="font-mono text-[10px] text-gray-500">[{i + 1}]</span>{" "}
            <span className="font-semibold">{r.auteur}</span>. {r.titre}
            {r.editeur && <>, {r.editeur}</>}
            {r.annee && <> ({r.annee})</>}. <span className="text-gray-600 italic">{r.type}</span>
            {r.url && <span className="block break-all pl-7 text-[10px] text-gray-500">{r.url}</span>}
          </li>
        ))}
      </ol>

      <p className="mt-6 font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
        11. Charte de l'apprenant
      </p>
      <ul className="mt-2 space-y-1.5 text-[12px]">
        {syllabus.charteApprenant.map((c, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded border border-gray-400" />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </ManuelPage>,
  );

  return { pages, nextPage: p };
}

/* ---------------------------------------------------------------------- */
/*  Module de formation (encart d'ouverture + chapitres reformatés)        */
/* ---------------------------------------------------------------------- */

export interface ManuelModuleProps {
  moduleCode: string;
  roleKey: string;
  roleLabel: string;
  icon?: LucideIcon;
  duration: string;
  level: string;
  audience: string;
  context?: string;
  objectives: string[];
  prerequisites: string[];
  chapters: {
    id: string;
    title: string;
    intro?: string;
    sections: {
      title: string;
      body: string;
      steps?: { instruction: string; navigation?: string; tip?: string; warning?: string }[];
      bestPractices?: string[];
      caveat?: string;
    }[];
  }[];
  startPage: number;
}

export function ManuelModuleBlock({ moduleCode, roleLabel, icon: Icon, duration, level, audience, context, objectives, prerequisites, chapters, startPage, watermark }: ManuelModuleProps & { watermark?: string }) {
  let p = startPage;
  const pages: React.ReactNode[] = [];

  // PAGE DE GARDE DU MODULE
  pages.push(
    <ManuelPage key={`${moduleCode}-cover`} pageLabel={`${moduleCode} — Couverture`} pageNumber={p++} watermark={watermark}>
      <RunningHeader left={`Module ${moduleCode}`} right={roleLabel} />
      <div className="mt-2 flex items-center gap-4">
        {Icon && (
          <span className="flex h-14 w-14 items-center justify-center rounded border-2 border-ew-green-800 bg-ew-green-50 text-ew-green-800">
            <Icon className="h-7 w-7" />
          </span>
        )}
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-ew-gold-600">
            Module {moduleCode}
          </p>
          <h2 className="font-display text-3xl font-extrabold text-ew-green-900">{roleLabel}</h2>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-[11px]">
        <MetaCell label="Niveau" value={level} />
        <MetaCell label="Durée" value={duration} />
        <MetaCell label="Code" value={moduleCode} mono />
      </div>

      <div className="mt-6 rounded border border-gray-300 bg-gray-50 p-4 text-[12px] leading-relaxed text-gray-800">
        <p className="font-bold uppercase text-[10px] tracking-wide text-gray-600">Public visé</p>
        <p className="mt-1">{audience}</p>
        {context && (
          <>
            <p className="mt-3 font-bold uppercase text-[10px] tracking-wide text-gray-600">Contexte d'utilisation</p>
            <p className="mt-1 italic">{context}</p>
          </>
        )}
      </div>

      <p className="mt-6 font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
        Objectifs pédagogiques
      </p>
      <ol className="mt-2 space-y-1.5 text-[12px]">
        {objectives.map((o, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ew-green-100 text-[10px] font-bold text-ew-green-800">
              {i + 1}
            </span>
            <span>{o}</span>
          </li>
        ))}
      </ol>

      <p className="mt-5 font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">Prérequis</p>
      <ul className="mt-2 space-y-1.5 text-[12px]">
        {prerequisites.map((q, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded border border-gray-400" />
            <span>{q}</span>
          </li>
        ))}
      </ul>

      <p className="mt-5 font-display text-xs font-bold uppercase tracking-[0.18em] text-ew-green-700">
        Plan du module
      </p>
      <ol className="mt-2 space-y-1 text-[11.5px]">
        {chapters.map((c, i) => (
          <li key={c.id} className="flex items-start gap-2">
            <span className="font-mono text-ew-green-800">§ {i + 1}.</span>
            <span>{c.title.replace(/^\d+\.\s*/, "")}</span>
          </li>
        ))}
      </ol>
    </ManuelPage>,
  );

  // CHAPITRES — un par "page bloc" (les longues retombent naturellement)
  chapters.forEach((c, ci) => {
    pages.push(
      <ManuelPage key={`${moduleCode}-${c.id}`} pageLabel={`${moduleCode} — ${c.title.slice(0, 36)}`} pageNumber={p++} watermark={watermark}>
        <RunningHeader left={`Module ${moduleCode} · § ${ci + 1}`} right={roleLabel} />
        <h3 className="font-display text-2xl font-extrabold text-ew-green-900">{c.title}</h3>
        {c.intro && <p className="mt-2 text-justify text-[12px] leading-[1.7] italic text-gray-700">{c.intro}</p>}

        <div className="mt-5 space-y-5">
          {c.sections.map((s, si) => (
            <article key={si} className="manuel-no-break">
              <h4 className="font-display text-base font-bold text-ew-green-800">{s.title}</h4>
              <div className="mt-1.5 space-y-1.5 text-justify text-[11.5px] leading-[1.65] text-gray-800">
                {s.body.split(/\n\n+/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {s.steps && s.steps.length > 0 && (
                <ol className="mt-3 space-y-2 border-l-2 border-ew-green-300 pl-3 text-[11.5px]">
                  {s.steps.map((st, i) => (
                    <li key={i} className="manuel-no-break">
                      <p className="font-medium text-gray-900">
                        <span className="mr-1 font-bold text-ew-green-800">{i + 1}.</span>
                        {st.instruction}
                      </p>
                      {st.navigation && (
                        <p className="mt-0.5 pl-4 text-[10.5px] text-gray-600">
                          <span className="font-bold uppercase tracking-wide text-ew-green-700">Chemin</span> · {st.navigation}
                        </p>
                      )}
                      {st.tip && (
                        <p className="mt-1 ml-4 rounded border-l-2 border-blue-400 bg-blue-50 px-2 py-1 text-[10.5px] text-blue-900">
                          <span className="font-bold uppercase tracking-wide">Astuce ·</span> {st.tip}
                        </p>
                      )}
                      {st.warning && (
                        <p className="mt-1 ml-4 rounded border-l-2 border-ew-gold-500 bg-ew-gold-100/50 px-2 py-1 text-[10.5px] text-ew-gold-600">
                          <span className="font-bold uppercase tracking-wide">Attention ·</span> {st.warning}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}

              {s.bestPractices && s.bestPractices.length > 0 && (
                <div className="mt-3 rounded border border-ew-green-200 bg-ew-green-50/60 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-ew-green-700">Bonnes pratiques</p>
                  <ul className="mt-1 space-y-1 text-[11px]">
                    {s.bestPractices.map((bp, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-ew-green-700" />
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {s.caveat && (
                <p className="mt-3 rounded border-l-2 border-ew-gold-500 bg-ew-gold-100/40 px-2 py-1.5 text-[10.5px] text-ew-gold-600">
                  <span className="font-bold uppercase tracking-wide">Mise en garde ·</span> {s.caveat}
                </p>
              )}
            </article>
          ))}
        </div>
      </ManuelPage>,
    );
  });

  return { pages, nextPage: p };
}

/* ---------------------------------------------------------------------- */
/*  Auto-évaluation : QCM + exercices + synthèse formative                 */
/* ---------------------------------------------------------------------- */

export function ManuelAssessmentBlock({ assessment, startPage, watermark }: { assessment: ManuelAssessment; startPage: number; watermark?: string }) {
  let p = startPage;
  const pages: React.ReactNode[] = [];
  const M = assessment.moduleCode;

  // Pré-test
  pages.push(
    <ManuelPage key={`${M}-pretest`} pageLabel={`${M} — Pré-test`} pageNumber={p++} watermark={watermark}>
      <RunningHeader left={`Module ${M} · Évaluation diagnostique`} right={assessment.roleLabel} />
      <h3 className="font-display text-2xl font-extrabold text-ew-green-900">Pré-test diagnostique</h3>
      <p className="mt-1 text-[11px] italic text-gray-600">
        Répondez librement, sans préparation, pour mesurer votre point d'entrée.
      </p>
      <ol className="mt-5 space-y-5 text-[12px]">
        {assessment.preTest.map((q, i) => (
          <li key={i} className="manuel-no-break">
            <p className="font-semibold text-gray-900">
              <span className="font-bold text-ew-green-800">Q{i + 1}.</span> {q.question}
            </p>
            <div className="mt-2 h-16 rounded border border-gray-300 bg-gray-50" />
          </li>
        ))}
      </ol>
    </ManuelPage>,
  );

  // QCM (10 questions) — pages multiples si nécessaire (5 par page)
  const qcmPages = chunk(assessment.qcm, 5);
  qcmPages.forEach((batch, batchIdx) => {
    const offset = batchIdx * 5;
    pages.push(
      <ManuelPage key={`${M}-qcm-${batchIdx}`} pageLabel={`${M} — QCM`} pageNumber={p++} watermark={watermark}>
        <RunningHeader left={`Module ${M} · QCM d'auto-évaluation`} right={assessment.roleLabel} />
        {batchIdx === 0 && (
          <>
            <h3 className="font-display text-2xl font-extrabold text-ew-green-900">QCM d'auto-évaluation</h3>
            <p className="mt-1 text-[11px] italic text-gray-600">
              Pour chaque question, cochez la réponse qui vous paraît correcte. Une seule bonne réponse par question.
              Le corrigé figure à la suite de chaque question.
            </p>
          </>
        )}
        <ol className="mt-5 space-y-5 text-[12px]" start={offset + 1}>
          {batch.map((q, i) => (
            <li key={i} className="manuel-no-break">
              <p className="font-semibold text-gray-900">
                <span className="font-bold text-ew-green-800">Q{offset + i + 1}.</span> {q.question}
              </p>
              <ul className="mt-2 space-y-1.5">
                {q.choix.map((c, ci) => (
                  <li key={ci} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gray-400 text-[9px] font-bold">
                      {String.fromCharCode(65 + ci)}
                    </span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 rounded border-l-2 border-ew-green-700 bg-ew-green-50/50 p-2 text-[10.5px] text-gray-700">
                <span className="font-bold uppercase tracking-wide text-ew-green-700">Corrigé · </span>
                Réponse <span className="font-bold">{String.fromCharCode(65 + q.bonneReponseIndex)}</span>.{" "}
                {q.explication}
              </p>
            </li>
          ))}
        </ol>
      </ManuelPage>,
    );
  });

  // Exercice
  pages.push(
    <ManuelPage key={`${M}-exo`} pageLabel={`${M} — Exercice pratique`} pageNumber={p++} watermark={watermark}>
      <RunningHeader left={`Module ${M} · Exercice pratique`} right={assessment.roleLabel} />
      <h3 className="font-display text-2xl font-extrabold text-ew-green-900">{assessment.exercice.titre}</h3>
      <p className="mt-2 text-justify text-[12px] leading-[1.65] italic text-gray-700">
        {assessment.exercice.introduction}
      </p>
      <div className="mt-5 space-y-5">
        {assessment.exercice.scenarios.map((sc, i) => (
          <article key={i} className="manuel-no-break rounded border border-gray-300 p-4">
            <div className="flex items-center gap-3">
              <span className="rounded bg-ew-green-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Scénario {i + 1}
              </span>
              <span className="text-[10px] italic text-gray-600">{sc.niveau}</span>
            </div>
            <p className="mt-2 text-[11.5px] leading-[1.65] text-gray-800">{sc.contexte}</p>
            <p className="mt-3 text-[10.5px] font-bold uppercase tracking-wide text-ew-green-700">Consignes</p>
            <ol className="mt-1 space-y-1 text-[11.5px]">
              {sc.consignes.map((co, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span className="font-mono text-ew-green-800">{j + 1}.</span>
                  <span>{co}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-[10.5px] font-bold uppercase tracking-wide text-ew-green-700">
              Critères d'évaluation
            </p>
            <ul className="mt-1 space-y-1 text-[11.5px]">
              {sc.criteresEvaluation.map((cr, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-3 w-3 shrink-0 rounded border border-gray-400" />
                  <span>{cr}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </ManuelPage>,
  );

  // Synthèse formative
  pages.push(
    <ManuelPage key={`${M}-synthese`} pageLabel={`${M} — Synthèse formative`} pageNumber={p++} watermark={watermark}>
      <RunningHeader left={`Module ${M} · Synthèse formative`} right={assessment.roleLabel} />
      <h3 className="font-display text-2xl font-extrabold text-ew-green-900">Synthèse formative</h3>
      <p className="mt-1 text-[11px] italic text-gray-600">
        Questions ouvertes de réflexion à compléter en fin de module. Vos réponses seront discutées avec le
        formateur ou utilisées pour votre journal de bord professionnel.
      </p>
      <ol className="mt-5 space-y-5 text-[12px]">
        {assessment.syntheseFormative.map((q, i) => (
          <li key={i} className="manuel-no-break">
            <p className="font-semibold text-gray-900">
              <span className="font-bold text-ew-green-800">Q{i + 1}.</span> {q.question}
            </p>
            <div className="mt-2 h-24 rounded border border-gray-300 bg-gray-50" />
          </li>
        ))}
      </ol>
    </ManuelPage>,
  );

  return { pages, nextPage: p };
}

/* ---------------------------------------------------------------------- */
/*  Annexe — Grille de progression (6 paliers)                              */
/* ---------------------------------------------------------------------- */

export function ManuelProgressionGrid({ progression, pageNumber, watermark }: { progression: ManuelProgression["grilleProgression"]; pageNumber: number; watermark?: string }) {
  return (
    <ManuelPage pageLabel="Annexe — Grille de progression" pageNumber={pageNumber} watermark={watermark}>
      <RunningHeader left="Annexe A · Grille de progression" right="EduWeb Planner" />
      <h2 className="font-display text-3xl font-extrabold text-ew-green-900">Grille de progression</h2>
      <p className="mt-1 text-[11px] italic text-gray-600">
        Référentiel à six paliers pour situer la maîtrise de l'apprenant et orienter l'accompagnement formatif.
      </p>
      <div className="mt-5 space-y-3">
        {progression.map((g) => (
          <div key={g.palier} className="manuel-no-break flex items-stretch gap-3 rounded border border-gray-300">
            <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-ew-green-800 px-2 py-3 text-center text-white">
              <p className="text-[10px] uppercase tracking-wide opacity-80">Palier</p>
              <p className="font-display text-2xl font-extrabold">{g.palier}</p>
            </div>
            <div className="flex flex-1 flex-col p-3">
              <p className="font-display text-base font-bold text-ew-green-900">{g.niveau}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-gray-700">{g.descripteur}</p>
            </div>
          </div>
        ))}
      </div>
    </ManuelPage>
  );
}

/* ---------------------------------------------------------------------- */
/*  Annexe — Glossaire général                                              */
/* ---------------------------------------------------------------------- */

export function ManuelGlossary({
  entries,
  startPage,
  watermark,
}: {
  entries: ManuelProgression["indexGeneral"];
  startPage: number;
  watermark?: string;
}) {
  let p = startPage;
  const pages: React.ReactNode[] = [];
  const sorted = [...entries].sort((a, b) => a.terme.localeCompare(b.terme, "fr"));
  const perPage = 18;
  const batches = chunk(sorted, perPage);

  batches.forEach((batch, idx) => {
    pages.push(
      <ManuelPage key={`glo-${idx}`} pageLabel="Annexe — Glossaire" pageNumber={p++} watermark={watermark}>
        <RunningHeader left="Annexe B · Glossaire général" right="EduWeb Planner" />
        {idx === 0 && (
          <>
            <h2 className="font-display text-3xl font-extrabold text-ew-green-900">Glossaire général</h2>
            <p className="mt-1 text-[11px] italic text-gray-600">
              Définitions des termes employés dans l'ensemble du manuel, classés par ordre alphabétique.
            </p>
          </>
        )}
        <dl className="mt-5 space-y-3 text-[11.5px]">
          {batch.map((e, i) => (
            <div key={i} className="manuel-no-break">
              <dt className="flex items-baseline gap-2">
                <span className="font-bold text-ew-green-800">{e.terme}</span>
                <span className="text-[10px] text-gray-500">
                  {e.references.map((r) => <span key={r} className="ml-1 rounded bg-gray-100 px-1 py-0.5 font-mono">{r}</span>)}
                </span>
              </dt>
              <dd className="mt-0.5 leading-relaxed text-gray-800">{e.definition}</dd>
            </div>
          ))}
        </dl>
      </ManuelPage>,
    );
  });

  return { pages, nextPage: p };
}

/* ---------------------------------------------------------------------- */
/*  PAGE — Signatures (formateur, apprenant, hiérarchie)                   */
/* ---------------------------------------------------------------------- */

export function ManuelSignaturesPage({
  identification,
  pageNumber,
  watermark,
}: {
  identification: ManuelIdentification;
  pageNumber: number;
  watermark?: string;
}) {
  return (
    <ManuelPage pageLabel="Page de signatures" pageNumber={pageNumber} watermark={watermark}>
      <RunningHeader left="Page de signatures" right={identification.code} />
      <h2 className="font-display text-3xl font-extrabold text-ew-green-900">Page de signatures</h2>
      <p className="mt-2 text-[12px] italic text-gray-600">
        À renseigner par le formateur, l&apos;apprenant et son autorité hiérarchique pour attester de la
        bonne conduite de la formation.
      </p>

      <div className="mt-8 space-y-6">
        <SignatureBlock
          title="Formateur"
          subtitle="Atteste de la conduite intégrale de la formation"
          fields={[
            "Nom et prénoms",
            "Fonction / Institution",
            "Date",
          ]}
          stamp
        />
        <SignatureBlock
          title="Apprenant(e)"
          subtitle="Confirme avoir suivi le présent support de formation"
          fields={[
            "Nom et prénoms",
            "Rôle / Établissement",
            "Date",
          ]}
        />
        <SignatureBlock
          title="Visa de la hiérarchie"
          subtitle="Direction d'établissement, DRENA, CAFOP ou APFC selon le cas"
          fields={[
            "Nom et prénoms du visa",
            "Fonction",
            "Date",
          ]}
          stamp
        />
      </div>

      <p className="mt-10 text-[10px] italic text-gray-500">
        Ce feuillet est conservé dans le dossier de formation de l&apos;apprenant et, le cas échéant,
        joint au registre de l&apos;institution organisatrice (DRENA, CAFOP, APFC). Une copie est remise
        à l&apos;intéressé(e).
      </p>
    </ManuelPage>
  );
}

function SignatureBlock({
  title,
  subtitle,
  fields,
  stamp,
}: {
  title: string;
  subtitle: string;
  fields: string[];
  stamp?: boolean;
}) {
  return (
    <div className="manuel-no-break rounded border border-gray-300 p-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-base font-bold text-ew-green-900">{title}</p>
        <p className="text-[10px] italic text-gray-600">{subtitle}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[11px]">
        {fields.map((label) => (
          <div key={label}>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600">{label}</p>
            <div className="mt-1 border-b border-black/60" style={{ minHeight: 18 }} />
          </div>
        ))}
        <div className="col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-600">
            Signature{stamp && " et cachet"}
          </p>
          <div className="mt-1 flex h-20 items-end border border-dashed border-gray-300 p-2">
            <span className="text-[9px] italic text-gray-400">Espace réservé</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  CERTIFICAT DE FIN DE FORMATION (page autonome, A4 paysage ou portrait) */
/* ---------------------------------------------------------------------- */

export function ManuelCertificate({
  identification,
  beneficiaryName,
  beneficiaryRole,
  duration,
  issueDate,
  validUntil,
  certificateNumber,
}: {
  identification: ManuelIdentification;
  beneficiaryName?: string;
  beneficiaryRole?: string;
  duration: string;
  issueDate?: string;
  validUntil?: string;
  certificateNumber?: string;
}) {
  return (
    <ManuelPage className="overflow-hidden border-double" pageLabel="Certificat" pageNumber={undefined}>
      {/* Cadre décoratif double */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[8mm] border-4 border-double border-ew-green-800"
        style={{ borderRadius: 4 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[14mm] border border-ew-gold-500"
        style={{ borderRadius: 2 }}
      />

      <div className="relative z-10 flex h-full min-h-[265mm] flex-col items-center text-center">
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-gray-700">
          République de Côte d&apos;Ivoire
        </p>
        <p className="mt-1 text-[10px] italic text-gray-700">Union — Discipline — Travail</p>
        <p className="mt-3 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-gray-700">
          Ministère de l&apos;Éducation Nationale
        </p>

        <div className="mt-6 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo.png"
            alt="Logo EduWeb Planner"
            className="h-24 w-24 object-contain"
          />
        </div>

        <span className="mt-6 flex h-1 w-32 rounded-full bg-ew-gold-500" />
        <p className="mt-4 font-display text-[13px] font-bold uppercase tracking-[0.3em] text-ew-gold-600">
          Certificat de fin de formation
        </p>
        <span className="mt-2 flex h-1 w-32 rounded-full bg-ew-gold-500" />

        <p className="mt-10 text-[12px] uppercase tracking-[0.18em] text-gray-700">
          Il est certifié que
        </p>

        <div className="mt-3 w-[140mm] border-b-2 border-ew-green-900 pb-1">
          <p
            className="font-display text-3xl font-extrabold text-ew-green-900"
            style={{ fontFamily: "'Fraunces', 'Times New Roman', Georgia, serif" }}
          >
            {beneficiaryName || "…………………………………………………………………"}
          </p>
        </div>
        <p className="mt-2 text-[11px] italic text-gray-600">
          {beneficiaryRole || "Rôle / fonction de l'apprenant(e)"}
        </p>

        <p className="mt-8 max-w-[150mm] text-justify text-[12px] leading-[1.7] text-gray-800">
          a suivi avec succès le support de formation académique{" "}
          <span className="font-bold">« {identification.intitule} »</span> (référence{" "}
          <span className="font-mono font-bold">{identification.code}</span>, version{" "}
          <span className="font-bold">{identification.version}</span>) d&apos;une durée totale indicative
          de <span className="font-bold">{duration}</span>, mobilisant les huit modules de formation
          aux rôles utilisateurs de la plateforme EduWeb Planner, et a satisfait aux modalités
          d&apos;évaluation requises pour la délivrance du présent certificat.
        </p>

        <div className="mt-8 grid w-[150mm] grid-cols-3 gap-4 text-[10px]">
          <div className="rounded border border-gray-400 p-2 text-center">
            <p className="font-bold uppercase tracking-wide text-gray-600">N° du certificat</p>
            <p className="mt-1 font-mono font-bold text-ew-green-800">
              {certificateNumber || "________"}
            </p>
          </div>
          <div className="rounded border border-gray-400 p-2 text-center">
            <p className="font-bold uppercase tracking-wide text-gray-600">Délivré le</p>
            <p className="mt-1 font-bold text-ew-green-800">{issueDate || "____ / ____ / ______"}</p>
          </div>
          <div className="rounded border border-gray-400 p-2 text-center">
            <p className="font-bold uppercase tracking-wide text-gray-600">Validité</p>
            <p className="mt-1 font-bold text-ew-green-800">{validUntil || identification.dateValidite}</p>
          </div>
        </div>

        <div className="mt-10 grid w-[160mm] grid-cols-2 gap-10 text-[10px]">
          <div className="text-center">
            <p className="italic text-gray-700">Le formateur</p>
            <div className="mt-12 border-t border-black" />
            <p className="mt-1 text-[9px] italic text-gray-500">Nom, signature, date</p>
          </div>
          <div className="text-center">
            <p className="italic text-gray-700">L&apos;autorité hiérarchique</p>
            <p className="text-[9px] italic text-gray-500">(Cachet et signature)</p>
            <div className="mt-12 border-t border-black" />
            <p className="mt-1 text-[9px] italic text-gray-500">DRENA / CAFOP / APFC selon le cas</p>
          </div>
        </div>

        <p className="mt-auto text-[9px] italic text-gray-500">
          Document à conserver — toute reproduction frauduleuse est sanctionnée par la loi.
        </p>
      </div>
    </ManuelPage>
  );
}

/* ---------------------------------------------------------------------- */
/*  Pied final — Achèvement du document                                     */
/* ---------------------------------------------------------------------- */

export function ManuelEnd({ identification, pageNumber, watermark }: { identification: ManuelIdentification; pageNumber: number; watermark?: string }) {
  return (
    <ManuelPage pageLabel="Fin du document" pageNumber={pageNumber} watermark={watermark}>
      <RunningHeader left="Fin du manuel" right={identification.code} />
      <div className="flex h-[200mm] flex-col items-center justify-center text-center">
        <span className="flex h-2 w-32 rounded-full bg-ew-gold-500" />
        <p className="mt-8 font-display text-2xl font-extrabold text-ew-green-900">
          Fin du manuel académique
        </p>
        <p className="mt-2 text-[12px] italic text-gray-600">
          {identification.intitule}
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
          Référence {identification.code} · Version {identification.version}
        </p>
        <span className="mt-10 flex h-2 w-32 rounded-full bg-ew-gold-500" />
        <p className="mt-12 max-w-md text-[11px] leading-relaxed italic text-gray-700">
          « Toute formation soutenue par un outil numérique reste, avant tout, une rencontre humaine entre
          enseignants, apprenants et pratiques professionnelles. »
        </p>
      </div>
    </ManuelPage>
  );
}

/* ---------------------------------------------------------------------- */
/*  Helpers privés                                                          */
/* ---------------------------------------------------------------------- */

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <tr>
      <td className="py-1.5 pr-3 text-[10.5px] font-bold uppercase tracking-wide text-gray-600">{label}</td>
      <td className={cn("py-1.5", mono && "font-mono text-ew-green-800")}>{value}</td>
    </tr>
  );
}

function CompetenceBox({ title, subtitle, items }: { title: string; subtitle: string; items: string[] }) {
  return (
    <div className="manuel-no-break rounded border border-gray-300 p-3 text-[11.5px]">
      <p className="font-display text-xs font-bold uppercase tracking-wide text-ew-green-800">{title}</p>
      <p className="text-[10px] italic text-gray-600">{subtitle}</p>
      <ul className="mt-2 space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-1.5">
            <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-ew-green-700" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EvalLine({ label, text }: { label: string; text: string }) {
  return (
    <p className="rounded border-l-4 border-ew-green-700 bg-gray-50 px-3 py-2 text-[11.5px]">
      <span className="font-bold uppercase tracking-wide text-ew-green-700">{label} · </span>
      <span className="text-gray-800">{text}</span>
    </p>
  );
}

function MetaCell({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded border border-gray-300 p-2 text-center">
      <p className="text-[9px] font-bold uppercase tracking-wide text-gray-600">{label}</p>
      <p className={cn("mt-0.5 font-bold text-ew-green-900", mono && "font-mono text-[12px]")}>{value}</p>
    </div>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}
