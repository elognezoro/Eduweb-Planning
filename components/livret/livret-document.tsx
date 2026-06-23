/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EtabExportMeta } from "@/lib/etab-config";
import type { Eleve } from "@/lib/types";
import { useStore } from "@/components/app-shell/data-store";
import { computeLivret, resolveLivret } from "@/lib/livret/autofill";
import { CYCLE1_SUBJECTS, CYCLE2_SUBJECTS, type LivretSubject } from "@/lib/livret/subjects";
import type { LivretResolved, LivretSubjectRow } from "@/lib/livret/types";

/* ============================================================================
   Rendu imprimable FIDÈLE du livret scolaire (13 pages), conforme au modèle CI.
   Utilise le système d'impression existant : conteneur #livret-print + sections
   .livret-page (cf. globals.css @media print → window.print() = PDF).
   ========================================================================== */

const GREEN = "#176b45";
const GOLD = "#d99a1e";

const f2 = (n: number | null | undefined) => (n == null ? "" : n.toFixed(2));
const ord = (n: number | null | undefined) => (n == null ? "" : n === 1 ? "1er" : `${n}e`);
const fmtDate = (iso?: string) => {
  if (!iso || !iso.includes("-")) return "……/……/………";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

function PageTag({ label, n }: { label: string; n: number }) {
  return (
    <p className="mt-4 text-center text-[8.5px] italic text-gray-400">
      Modèle numérique de livret scolaire — EduWeb Planner · {label} · Page {n}/13
    </p>
  );
}
function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-[15px] font-extrabold" style={{ color: GREEN }}>
      {children}
    </h2>
  );
}
const cell = "border border-gray-400 px-2 py-1";
const headCell = "border border-gray-400 px-2 py-1 text-left";
const dot = "text-gray-300";

/* ------------------------------- Tableau de notes -------------------------- */
function NotesGrid({
  subjects,
  data,
  filled,
}: {
  subjects: LivretSubject[];
  data: LivretResolved;
  filled: boolean;
}) {
  const byKey = new Map<string, LivretSubjectRow>(data.notes.subjects.map((r) => [r.subjectKey, r]));
  const g = data.notes.general;
  return (
    <table className="w-full border-collapse text-[9px]">
      <thead>
        <tr style={{ background: GREEN, color: "#fff" }}>
          <th className={headCell} rowSpan={2}>
            Matières
          </th>
          <th className="border border-gray-400 px-1 py-1 text-center" colSpan={2}>
            1er Trim.
          </th>
          <th className="border border-gray-400 px-1 py-1 text-center" colSpan={2}>
            2e Trim.
          </th>
          <th className="border border-gray-400 px-1 py-1 text-center" colSpan={2}>
            3e Trim.
          </th>
          <th className="border border-gray-400 px-1 py-1 text-center" rowSpan={2}>
            Moy. ann.
          </th>
          <th className="border border-gray-400 px-1 py-1 text-center" rowSpan={2}>
            Class. ann.
          </th>
        </tr>
        <tr style={{ background: GREEN, color: "#fff" }}>
          <th className="border border-gray-400 px-1 py-0.5 text-center">Moy /20</th>
          <th className="border border-gray-400 px-1 py-0.5 text-center">Place</th>
          <th className="border border-gray-400 px-1 py-0.5 text-center">Moy /20</th>
          <th className="border border-gray-400 px-1 py-0.5 text-center">Place</th>
          <th className="border border-gray-400 px-1 py-0.5 text-center">Moy /20</th>
          <th className="border border-gray-400 px-1 py-0.5 text-center">Place</th>
        </tr>
      </thead>
      <tbody>
        {subjects.map((subj) => {
          const r = filled ? byKey.get(subj.key) : undefined;
          return (
            <tr key={subj.key}>
              <td className={cell}>{subj.label}</td>
              {[0, 1, 2].map((t) => (
                <React.Fragment key={t}>
                  <td className={`${cell} text-center font-semibold`}>{r ? f2(r.terms[t]?.moy) : ""}</td>
                  <td className={`${cell} text-center`}>{r ? ord(r.terms[t]?.place) : ""}</td>
                </React.Fragment>
              ))}
              <td className={`${cell} text-center font-bold`}>{r ? f2(r.moyenneAnnuelle) : ""}</td>
              <td className={`${cell} text-center`}>{r ? ord(r.classementAnnuel) : ""}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr style={{ background: "#eef5f0" }} className="font-bold">
          <td className={cell}>Moyenne générale</td>
          {[0, 1, 2].map((t) => (
            <td key={t} className={`${cell} text-center`} colSpan={2}>
              {filled ? `${f2(g.terms[t]?.moy)} · ${ord(g.terms[t]?.rang)}` : ""}
            </td>
          ))}
          <td className={`${cell} text-center`}>{filled ? f2(g.annuel.moy) : ""}</td>
          <td className={`${cell} text-center`}>{filled ? ord(g.annuel.rang) : ""}</td>
        </tr>
      </tfoot>
    </table>
  );
}

/* ----------------------------- Page appréciations -------------------------- */
function AppreciationsPage({ data, filled }: { data: LivretResolved; filled: boolean }) {
  const a = data.appreciation;
  return (
    <>
      <table className="mb-3 w-full border-collapse text-[10px]">
        <tbody>
          <tr>
            <td className={`${cell} text-gray-600`} style={{ width: "30%" }}>
              Moyenne générale annuelle
            </td>
            <td className={`${cell} font-bold`}>{filled ? `${f2(a.moyenneGeneraleAnnuelle)} /20` : ""}</td>
            <td className={`${cell} text-gray-600`} style={{ width: "30%" }}>
              Classement général annuel
            </td>
            <td className={`${cell} font-bold`}>{filled ? ord(a.classementGeneralAnnuel) : ""}</td>
          </tr>
        </tbody>
      </table>

      <p className="text-[10px] font-bold">Appréciations des professeurs</p>
      <div className="mb-3 mt-1 min-h-[42px] rounded border border-gray-300 p-2 text-[10px] italic">
        {filled ? a.appreciationProfesseurs : ""}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] font-bold">Observations du professeur principal</p>
          <div className="mt-1 min-h-[48px] rounded border border-gray-300 p-2 text-[10px] italic">
            {filled ? a.observationProfPrincipal : ""}
          </div>
          <p className="mt-1 text-[9px] text-gray-600">Date : {a.dateProfPrincipal || "……/……/………"} — Signature :</p>
        </div>
        <div>
          <p className="text-[10px] font-bold">Visa et observation du chef d'établissement</p>
          <div className="relative mt-1 min-h-[48px] rounded border border-gray-300 p-2 text-[10px] italic">
            {filled ? a.visaChef : ""}
            {data.etab.stamp ? (
              <img src={data.etab.stamp} alt="" className="absolute bottom-1 right-1 h-10 w-10 object-contain opacity-80" />
            ) : null}
          </div>
          <p className="mt-1 text-[9px] text-gray-600">Date : {a.dateChef || "……/……/………"} — Signature :</p>
        </div>
      </div>

      <table className="mt-3 w-full border-collapse text-[10px]">
        <tbody>
          <tr>
            <td className={`${cell} text-gray-600`} style={{ width: "40%" }}>
              Décision de fin d'année — Admis(e) en
            </td>
            <td className={`${cell} font-semibold`}>{filled ? a.decisionAdmisEn : ""}</td>
          </tr>
        </tbody>
      </table>

      <p className="mt-3 text-[10px] font-bold">Distinctions obtenues ou sanctions encourues en cours d'année</p>
      <table className="mt-1 w-full border-collapse text-[10px]">
        <tbody>
          {[
            ["1er Trimestre", a.distinctions.t1],
            ["2e Trimestre", a.distinctions.t2],
            ["3e Trimestre", a.distinctions.t3],
            ["Mention spéciale", a.distinctions.mentionSpeciale],
          ].map(([k, v]) => (
            <tr key={k}>
              <td className={`${cell} text-gray-600`} style={{ width: "30%" }}>
                {k}
              </td>
              <td className={cell}>{filled ? v : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/* ------------------------- Table d'établissements -------------------------- */
function EtabTable({ data, slice }: { data: LivretResolved; slice: "A" | "B" }) {
  const all = data.etabSuccessifs;
  const rows = slice === "A" ? all.slice(0, 6) : all.slice(6, 12);
  const blanks = Math.max(0, 6 - rows.length);
  return (
    <table className="w-full border-collapse text-[9.5px]">
      <thead>
        <tr style={{ background: GREEN, color: "#fff" }}>
          <th className={headCell} style={{ width: "12%" }}>
            Année scol.
          </th>
          <th className={headCell} style={{ width: "12%" }}>
            Classe
          </th>
          <th className={headCell} style={{ width: "12%" }}>
            Moy. ann.
          </th>
          <th className={headCell}>Établissement · Observations du Directeur ou du Professeur principal · Signature</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td className={cell}>{r.anneeScolaire}</td>
            <td className={cell}>{r.classe}</td>
            <td className={`${cell} text-center`}>{r.moyenneAnnuelle}</td>
            <td className={cell}>
              <span className="font-semibold">{r.nomEtablissement}</span>
              {r.observations ? <span className="text-gray-700"> — {r.observations}</span> : null}
            </td>
          </tr>
        ))}
        {Array.from({ length: blanks }).map((_, i) => (
          <tr key={`b${i}`} className="h-9">
            <td className={`${cell} ${dot}`}>20……</td>
            <td className={cell} />
            <td className={cell} />
            <td className={cell} />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ================================ Document ================================= */
export function LivretFullDocument({ data }: { data: LivretResolved }) {
  const e = data.etab;
  const id = data.identity;
  const cycle = data.cycle;

  return (
    <div id="livret-print" className="text-black" style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      {/* PAGE 1 — Couverture */}
      <section className="livret-page">
        <div className="relative text-center">
          {e.logo ? (
            <img src={e.logo} alt="" className="absolute right-0 top-0 h-12 w-auto object-contain" />
          ) : null}
          <p className="text-[12px] font-semibold uppercase tracking-wide">{e.official}</p>
          <p className="text-[11px] uppercase">Union — Discipline — Travail</p>
          <p className="mt-1 text-[11px]">{e.ministry}</p>
          <p className="text-[10px] text-gray-600">Enseignements Secondaires et Supérieurs</p>
          {e.nationalEmblem ? (
            <img src={e.nationalEmblem} alt="" className="mx-auto my-2 h-16 w-auto object-contain" />
          ) : null}
          <h1 className="mt-3 text-[26px] font-extrabold tracking-tight" style={{ color: GREEN }}>
            LIVRET SCOLAIRE
          </h1>
          <p className="text-[12px] italic text-gray-600">Enseignements Classique, Moderne et Technique</p>
        </div>

        <table className="mx-auto mt-8 w-full border-collapse text-[10.5px]">
          <tbody>
            {[
              ["Établissement", e.institution],
              ["Direction Régionale / Départementale", e.regionalDirection],
              ["Localité", e.locality],
              ["Code établissement", e.code],
              ["Année scolaire", e.schoolYear],
            ].map(([k, v], i) => (
              <tr key={k} className={i % 2 ? "bg-gray-50" : ""}>
                <td className={`${cell} text-gray-600`} style={{ width: "42%" }}>
                  {k}
                </td>
                <td className={cell}>{v || <span className={dot}>……………………………</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="mx-auto mt-6 w-full border-collapse text-[11px]">
          <tbody>
            <tr style={{ background: GREEN, color: "#fff" }}>
              <td className={headCell} colSpan={2}>
                Identité de l'élève
              </td>
            </tr>
            <tr>
              <td className={`${cell} text-gray-600`} style={{ width: "42%" }}>
                N° Matricule
              </td>
              <td className={`${cell} font-semibold`}>{id.matricule}</td>
            </tr>
            <tr>
              <td className={`${cell} text-gray-600`}>Nom de l'élève</td>
              <td className={`${cell} font-semibold`}>
                {id.nom} {id.prenoms}
              </td>
            </tr>
            <tr>
              <td className={`${cell} text-gray-600`}>Date de naissance</td>
              <td className={cell}>{fmtDate(id.dateNaissance)}</td>
            </tr>
          </tbody>
        </table>
        <PageTag label="Couverture" n={1} />
      </section>

      {/* PAGE 2 — Identité détaillée */}
      <section className="livret-page">
        <H>Identité de l'élève</H>
        <table className="w-full border-collapse text-[10px]">
          <tbody>
            {[
              ["Nom", id.nom, "Prénoms", id.prenoms],
              ["Sexe", id.sexe === "M" ? "Masculin" : "Féminin", "Date de naissance", fmtDate(id.dateNaissance)],
              ["Lieu de naissance", id.lieuNaissance, "Nationalité", id.nationalite],
              ["N° Matricule", id.matricule, "Classe", id.className],
              ["Série / Option", id.serie, "Cycle", cycle === 1 ? "1er cycle" : "2e cycle"],
            ].map((row, i) => (
              <tr key={i}>
                <td className={`${cell} text-gray-600`} style={{ width: "22%" }}>
                  {row[0]}
                </td>
                <td className={cell}>{row[1] || <span className={dot}>………………</span>}</td>
                <td className={`${cell} text-gray-600`} style={{ width: "22%" }}>
                  {row[2]}
                </td>
                <td className={cell}>{row[3] || <span className={dot}>………………</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PageTag label="Identité" n={2} />
      </section>

      {/* PAGE 3 — Instructions */}
      <section className="livret-page">
        <H>Instructions</H>
        <ul className="space-y-1.5 text-[11px] text-gray-700">
          <li>Page 4 : Observations diverses (suivi médical) s'il y a lieu.</li>
          <li>Page 5 : Adresse des parents ou tuteurs (à remplir à chaque année scolaire).</li>
          <li>Pages 6 à 7 : 1er Cycle — notes, appréciations et décision.</li>
          <li>Pages 8 à 9 : 2e Cycle — notes, appréciations et décision.</li>
          <li>Pages 10 à 11 : Inscriptions des établissements successifs.</li>
          <li>Page 12 : Inscription des diplômes obtenus.</li>
          <li>Page 13 : Page d'extension du livret.</li>
        </ul>
        <p className="mt-3 text-[10px] italic text-gray-600">
          Ce livret est un gabarit propre et extensible. Les pages de résultats peuvent être dupliquées selon le nombre
          d'années scolaires ou de cycles à gérer.
        </p>
        <PageTag label="Instructions" n={3} />
      </section>

      {/* PAGE 4 — Observations médicales */}
      <section className="livret-page">
        <H>Observations diverses (suivi médical)</H>
        {data.medicalStages.map((m, i) => (
          <div key={i} className="mb-3 flex gap-3">
            <div className="flex h-24 w-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded border border-gray-300 text-center text-[8px] text-gray-400">
              {m.photo ? <img src={m.photo} alt="" className="h-full w-full object-cover" /> : <span>PHOTO<br />{m.classe}</span>}
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold">{m.classe}</p>
              <p className="text-[9px] text-gray-500">Observation du médecin, s'il y a lieu :</p>
              <div className="mt-1 min-h-[44px] rounded border border-gray-300 p-2 text-[10px] italic">{m.observationMedecin}</div>
            </div>
          </div>
        ))}
        <p className="mt-2 text-[10px] text-gray-600">Signature du candidat : ……………………………………</p>
        <PageTag label="Observations" n={4} />
      </section>

      {/* PAGE 5 — Adresses parents */}
      <section className="livret-page">
        <H>Adresse des parents ou tuteurs</H>
        <p className="mb-2 text-[10px] italic text-gray-600">À remplir à chaque année scolaire. Toute adresse doit être complète.</p>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr style={{ background: GREEN, color: "#fff" }}>
              <th className={headCell}>Année</th>
              <th className={headCell}>Nom</th>
              <th className={headCell}>Adresse</th>
              <th className={headCell}>Tél. bureau</th>
              <th className={headCell}>Tél. domicile</th>
            </tr>
          </thead>
          <tbody>
            {(data.parents.length ? data.parents : [{ annee: "", nom: "", adresse: "", telBureau: "", telDomicile: "" }])
              .concat(Array.from({ length: Math.max(0, 6 - data.parents.length) }, () => ({ annee: "", nom: "", adresse: "", telBureau: "", telDomicile: "" })))
              .slice(0, 8)
              .map((p, i) => (
                <tr key={i} className="h-8">
                  <td className={cell}>{p.annee || <span className={dot}>20……</span>}</td>
                  <td className={cell}>{p.nom}</td>
                  <td className={cell}>{p.adresse}</td>
                  <td className={cell}>{p.telBureau}</td>
                  <td className={cell}>{p.telDomicile}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <PageTag label="Parents/Tuteurs" n={5} />
      </section>

      {/* PAGE 6 — Notes 1er cycle */}
      <section className="livret-page">
        <div className="mb-2 flex items-center justify-between">
          <H>1er Cycle — Notes</H>
          <span className="text-[10px] text-gray-600">Classe : {cycle === 1 ? id.className : "……"}</span>
        </div>
        <NotesGrid subjects={CYCLE1_SUBJECTS} data={data} filled={cycle === 1} />
        <PageTag label="1er Cycle - Notes" n={6} />
      </section>

      {/* PAGE 7 — Appréciations 1er cycle */}
      <section className="livret-page">
        <H>1er Cycle — Appréciations et décision</H>
        <AppreciationsPage data={data} filled={cycle === 1} />
        <PageTag label="1er Cycle - Appréciations" n={7} />
      </section>

      {/* PAGE 8 — Notes 2e cycle */}
      <section className="livret-page">
        <div className="mb-2 flex items-center justify-between">
          <H>2e Cycle — Notes</H>
          <span className="text-[10px] text-gray-600">Classe : {cycle === 2 ? id.className : "……"}</span>
        </div>
        <NotesGrid subjects={CYCLE2_SUBJECTS} data={data} filled={cycle === 2} />
        <PageTag label="2e Cycle - Notes" n={8} />
      </section>

      {/* PAGE 9 — Appréciations 2e cycle */}
      <section className="livret-page">
        <H>2e Cycle — Appréciations et décision</H>
        <AppreciationsPage data={data} filled={cycle === 2} />
        <PageTag label="2e Cycle - Appréciations" n={9} />
      </section>

      {/* PAGE 10 — Établissements successifs A */}
      <section className="livret-page">
        <H>Inscriptions des établissements successifs — A</H>
        <EtabTable data={data} slice="A" />
        <PageTag label="Établissements A" n={10} />
      </section>

      {/* PAGE 11 — Établissements successifs B */}
      <section className="livret-page">
        <H>Inscriptions des établissements successifs — B</H>
        <EtabTable data={data} slice="B" />
        <PageTag label="Établissements B" n={11} />
      </section>

      {/* PAGE 12 — Diplômes */}
      <section className="livret-page">
        <H>Diplômes obtenus</H>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr style={{ background: GREEN, color: "#fff" }}>
              <th className={headCell} style={{ width: "16%" }}>
                Année scol.
              </th>
              <th className={headCell} style={{ width: "32%" }}>
                Établissement
              </th>
              <th className={headCell}>Appréciation du Président du jury</th>
            </tr>
          </thead>
          <tbody>
            {data.diplomes
              .concat(Array.from({ length: Math.max(0, 6 - data.diplomes.length) }, () => ({ etablissement: "", anneeScolaire: "", appreciationPresidentJury: "" })))
              .slice(0, 8)
              .map((d, i) => (
                <tr key={i} className="h-9">
                  <td className={cell}>{d.anneeScolaire || <span className={dot}>20……</span>}</td>
                  <td className={cell}>{d.etablissement}</td>
                  <td className={cell}>{d.appreciationPresidentJury}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <PageTag label="Diplômes" n={12} />
      </section>

      {/* PAGE 13 — Extension */}
      <section className="livret-page">
        <H>Page d'extension du livret scolaire</H>
        <p className="mb-2 text-[10px] italic text-gray-600">
          Cette page peut servir de dos de couverture ou de gabarit à dupliquer pour ajouter des observations
          complémentaires, des mentions spéciales ou des champs spécifiques à l'établissement.
        </p>
        <p className="text-[10px] font-bold">Observations complémentaires</p>
        <div className="mt-1 min-h-[120px] rounded border border-gray-300 p-2 text-[10px] italic">
          {data.extension.observationsComplementaires}
        </div>
        <div className="mt-6 flex items-end justify-end gap-2">
          <div className="text-center">
            <p className="text-[10px] text-gray-600">Cachet et signature</p>
            <div className="relative mt-1 h-20 w-40 rounded border border-gray-300">
              {data.etab.stamp ? <img src={data.etab.stamp} alt="" className="absolute inset-0 m-auto h-16 w-16 object-contain opacity-80" /> : null}
              {data.etab.signature ? <img src={data.etab.signature} alt="" className="absolute bottom-1 left-2 h-9 object-contain" /> : null}
            </div>
            <p className="mt-0.5 text-[9px] text-gray-600">{data.etab.headFunction} — {data.etab.headName}</p>
          </div>
        </div>
        <p className="mt-3 text-center text-[9px] italic" style={{ color: GOLD }}>
          S'instruire pour mieux espérer · EduWeb Planner
        </p>
        <PageTag label="Extension" n={13} />
      </section>
    </div>
  );
}

/* ------------------------------- Modale + portail -------------------------- */
export function LivretFullModal({
  open,
  student,
  meta,
  classmates,
  schoolYear,
  onClose,
}: {
  open: boolean;
  student: Eleve;
  meta: EtabExportMeta;
  classmates: { id: string }[];
  schoolYear: string;
  onClose: () => void;
}) {
  const store = useStore();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const data = React.useMemo<LivretResolved>(() => {
    const record = store.livretRecords.find((r) => r.studentId === student.id && r.schoolYear === schoolYear);
    return resolveLivret(
      computeLivret({ student, meta, grades: store.livretGrades, classmates, schoolYear }),
      record?.overrides,
    );
  }, [store.livretRecords, store.livretGrades, student, meta, classmates, schoolYear]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="livret-overlay fixed inset-0 z-[70] overflow-y-auto bg-slate-900/50 p-4 sm:p-8">
      <div className="mx-auto max-w-[840px]">
        <div className="no-print mb-3 flex items-center justify-between gap-2 rounded-xl bg-white px-4 py-2 shadow">
          <span className="text-sm font-semibold text-foreground">Livret scolaire — 13 pages</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4" /> Imprimer / PDF
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>
              <X className="h-4 w-4" /> Fermer
            </Button>
          </div>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-lg sm:p-10">
          <LivretFullDocument data={data} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
