"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Users,
  Medal,
  TrendingUp,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  ImageIcon,
  Printer,
  Download,
  ListTree,
  LayoutPanelTop,
} from "lucide-react";
import { toast } from "sonner";
import { ForbiddenState } from "@/components/layout/states";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApp } from "@/components/app-shell/app-context";
import {
  etabExportMeta,
  etabPeriods,
  loadEtabConfig,
  REPORT_PLAN_OPTIONS,
  REPORT_FORMAT_OPTIONS,
  type StoredEtabConfig,
} from "@/lib/etab-config";
import { downloadReportPdf, downloadReportWord, type ReportPayload } from "@/lib/exports";
import {
  ETABLISSEMENTS,
  ATTENDANCE_SERIES,
  SUBJECT_AVERAGES,
  GRADE_DISTRIBUTION,
  ENROLLMENT_BY_LEVEL,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** « Trimestre 1 » → « 1er Trimestre », « Semestre 2 » → « 2e Semestre ». */
function ordinalPeriod(label: string): string {
  const m = label.match(/^(\D+?)\s*(\d+)$/);
  if (!m) return label;
  const unit = m[1].trim();
  const n = Number(m[2]);
  return `${n === 1 ? "1er" : `${n}e`} ${unit}`;
}

/** Présence moyenne de la période, calculée sur la tranche correspondante du registre d'appel. */
function presenceForPeriod(idx: number, count: number): number {
  const size = Math.max(1, Math.ceil(ATTENDANCE_SERIES.length / Math.max(1, count)));
  const slice = ATTENDANCE_SERIES.slice(idx * size, idx * size + size);
  const arr = slice.length ? slice : ATTENDANCE_SERIES;
  return arr.reduce((s, m) => s + m.presence, 0) / arr.length;
}

const VERT_BTN = "bg-ew-green-700 text-white hover:bg-ew-green-800";

/* ----- Plans du rapport : titres et sous-titres (structure configurable) ----- */
type SubSection = { subtitle?: string; blocks: string[] };
type PlanSection = { id: string; title: string; sub: SubSection[] };

const PLAN_SECTIONS: Record<string, PlanSection[]> = {
  officiel: [
    { id: "intro", title: "INTRODUCTION", sub: [{ blocks: ["intro"] }] },
    {
      id: "ch1",
      title: "CHAPITRE I. VIE PÉDAGOGIQUE ET RÉSULTATS SCOLAIRES",
      sub: [
        { subtitle: "I.1 Résultats scolaires", blocks: ["resultats"] },
        { subtitle: "I.2 Conseils et évaluations", blocks: ["conseils"] },
      ],
    },
    { id: "ch2", title: "CHAPITRE II. EFFECTIFS ET PYRAMIDES", sub: [{ blocks: ["effectifs"] }] },
    {
      id: "ch3",
      title: "CHAPITRE III. VIE SCOLAIRE",
      sub: [
        { subtitle: "III.1 Assiduité", blocks: ["presence"] },
        { subtitle: "III.2 Discipline et activités", blocks: ["discipline"] },
      ],
    },
    { id: "ch4", title: "CHAPITRE IV. LES PERSONNELS", sub: [{ blocks: ["personnels"] }] },
    { id: "ch5", title: "CHAPITRE V. MATÉRIELS ET FINANCES", sub: [{ blocks: ["materiels"] }] },
    { id: "conclusion", title: "CONCLUSION", sub: [{ blocks: ["conclusion"] }] },
  ],
  synthetique: [
    { id: "intro", title: "INTRODUCTION", sub: [{ blocks: ["intro"] }] },
    { id: "bilan", title: "BILAN PÉDAGOGIQUE ET RÉSULTATS", sub: [{ blocks: ["resultats", "presence"] }] },
    { id: "moyens", title: "EFFECTIFS ET PERSONNELS", sub: [{ blocks: ["effectifs", "personnels"] }] },
    { id: "conclusion", title: "CONCLUSION", sub: [{ blocks: ["conclusion"] }] },
  ],
  detaille: [
    { id: "intro", title: "INTRODUCTION", sub: [{ blocks: ["intro"] }] },
    {
      id: "d1",
      title: "I. RÉSULTATS SCOLAIRES",
      sub: [
        { subtitle: "I.1 Moyennes et taux de réussite", blocks: ["resultats"] },
        { subtitle: "I.2 Conseils de classe", blocks: ["conseils"] },
      ],
    },
    { id: "d2", title: "II. EFFECTIFS ET SCOLARISATION", sub: [{ subtitle: "II.1 Effectif et classes", blocks: ["effectifs"] }] },
    {
      id: "d3",
      title: "III. ASSIDUITÉ ET VIE SCOLAIRE",
      sub: [
        { subtitle: "III.1 Présence et assiduité", blocks: ["presence"] },
        { subtitle: "III.2 Discipline et activités", blocks: ["discipline"] },
      ],
    },
    { id: "d4", title: "IV. RESSOURCES HUMAINES", sub: [{ subtitle: "IV.1 Personnel enseignant", blocks: ["personnels"] }] },
    { id: "d5", title: "V. MOYENS MATÉRIELS ET FINANCIERS", sub: [{ subtitle: "V.1 Infrastructures et finances", blocks: ["materiels"] }] },
    { id: "reco", title: "RECOMMANDATIONS", sub: [{ blocks: ["recommandations"] }] },
    { id: "conclusion", title: "CONCLUSION", sub: [{ blocks: ["conclusion"] }] },
  ],
};

export default function RapportEtablissementPage() {
  const t = useTranslations();
  const { can } = useApp();
  // Configuration de l'établissement (plan & présentation par défaut), chargée après montage.
  const [cfg, setCfg] = React.useState<StoredEtabConfig>({});
  const [periodIdx, setPeriodIdx] = React.useState(0);
  const [open, setOpen] = React.useState<Record<string, boolean>>({ intro: true });
  const [planId, setPlanId] = React.useState("officiel");
  const [formatId, setFormatId] = React.useState("accordeon");
  React.useEffect(() => {
    const c = loadEtabConfig();
    setCfg(c);
    if (c.reportPlan && PLAN_SECTIONS[c.reportPlan]) setPlanId(c.reportPlan);
    if (c.reportFormat && REPORT_FORMAT_OPTIONS.some((f) => f.id === c.reportFormat)) setFormatId(c.reportFormat);
  }, []);

  if (!can("institution_report:view")) return <ForbiddenState />;

  const meta = etabExportMeta(cfg);
  const periods = etabPeriods(cfg);
  const safeIdx = Math.min(periodIdx, periods.length - 1);
  const periodLabel = ordinalPeriod(periods[safeIdx]?.label ?? "Trimestre 1");
  const sections = PLAN_SECTIONS[planId] ?? PLAN_SECTIONS.officiel;

  // ---- Données recueillies dans les modules de l'établissement ----
  const etab = ETABLISSEMENTS.find((e) => meta.code && e.code.toUpperCase() === meta.code.toUpperCase()) ?? ETABLISSEMENTS[0];
  const effectif = etab.studentsCount;
  const enseignants = etab.teachersCount;
  const classes = etab.classesCount;
  const ratioClasse = Math.round(effectif / classes);
  const ratioEnseignant = Math.round(effectif / enseignants);

  const moyenneBase = SUBJECT_AVERAGES.reduce((s, x) => s + x.moyenne, 0) / SUBJECT_AVERAGES.length;
  const totalNotes = GRADE_DISTRIBUTION.reduce((s, g) => s + g.eleves, 0);
  const reussiteBase = (GRADE_DISTRIBUTION.filter((g) => parseInt(g.tranche, 10) >= 10).reduce((s, g) => s + g.eleves, 0) / totalNotes) * 100;
  const sortedSubjects = [...SUBJECT_AVERAGES].sort((a, b) => b.moyenne - a.moyenne);
  const topSubjects = sortedSubjects.slice(0, 2).map((s) => s.matiere).join(", ");
  const weakSubjects = sortedSubjects.slice(-2).map((s) => s.matiere).join(", ");

  const fTot = ENROLLMENT_BY_LEVEL.reduce((s, l) => s + l.filles, 0);
  const gTot = ENROLLMENT_BY_LEVEL.reduce((s, l) => s + l.garcons, 0);
  const filles = Math.round(effectif * (fTot / (fTot + gTot)));
  const garcons = effectif - filles;

  const presence = presenceForPeriod(safeIdx, periods.length);
  const moyenne = Math.min(20, moyenneBase + safeIdx * 0.4);
  const reussite = Math.min(100, reussiteBase + safeIdx * 4);

  const institutionName = meta.institution && meta.institution !== "Établissement" ? meta.institution : etab.name;
  const statut = meta.type || etab.type || "Public";

  // ---- Blocs de contenu (auto-générés à partir des données) ----
  const blocks: Record<string, string[]> = {
    intro: [
      `Le présent rapport rend compte des activités pédagogiques et administratives menées au sein de l'établissement au cours du ${periodLabel} de l'année scolaire ${meta.schoolYear}.`,
      "Il est rédigé automatiquement à partir des données saisies dans les modules de fonctionnement de l'établissement : Notes & bulletins, Registre d'appel, Effectifs et Personnels.",
    ],
    resultats: [
      `D'après les notes saisies, la moyenne générale s'établit à ${moyenne.toFixed(2)}/20, pour un taux de réussite (moyenne ≥ 10/20) de ${reussite.toFixed(1)} % au ${periodLabel}.`,
      `Les disciplines aux meilleurs résultats sont ${topSubjects}, tandis que ${weakSubjects} appellent un accompagnement renforcé.`,
    ],
    conseils: [
      "Les conseils d'enseignement et les conseils de classe se sont tenus conformément au calendrier. Les évaluations harmonisées ont été organisées dans l'ensemble des disciplines.",
    ],
    effectifs: [
      `L'établissement accueille un effectif total de ${effectif.toLocaleString("fr-FR")} élèves (${filles.toLocaleString("fr-FR")} filles, ${garcons.toLocaleString("fr-FR")} garçons), répartis sur ${classes} classes, soit un ratio moyen de ${ratioClasse} élèves par classe.`,
      "La pyramide des effectifs demeure équilibrée, avec une légère prédominance féminine dans les classes d'examen.",
    ],
    presence: [
      `Le registre d'appel fait ressortir un taux de présence moyen de ${presence.toFixed(1)} % sur le ${periodLabel}. L'assiduité et la ponctualité demeurent satisfaisantes.`,
    ],
    discipline: [
      "Les activités socio-éducatives (clubs, coopérative scolaire, journées culturelles) se sont déroulées normalement et le suivi disciplinaire a été assuré par la vie scolaire.",
    ],
    personnels: [
      `Le personnel enseignant compte ${enseignants} professeurs, soit un encadrement moyen de ${ratioEnseignant} élèves par enseignant, appuyés par le personnel administratif, de surveillance et de service.`,
      "La couverture des postes est globalement assurée ; les besoins éventuels en personnel sont signalés à la direction régionale.",
    ],
    materiels: [
      "L'état des infrastructures et des équipements pédagogiques, ainsi que la situation des recettes et des dépenses de la période, sont renseignés à partir du module de gestion matérielle et financière.",
      "Des besoins en matériel de laboratoire et en équipement informatique complémentaire sont signalés.",
    ],
    recommandations: [
      `Au vu des résultats, il est recommandé de renforcer l'accompagnement en ${weakSubjects}, de poursuivre le suivi de l'assiduité et de compléter les équipements signalés.`,
    ],
    conclusion: [
      `Au terme du ${periodLabel}, avec une moyenne générale de ${moyenne.toFixed(2)}/20, un taux de réussite de ${reussite.toFixed(1)} % et une présence moyenne de ${presence.toFixed(1)} %, l'établissement poursuit la mise en œuvre de son projet d'établissement. Les recommandations formulées feront l'objet d'un suivi à la période suivante.`,
    ],
  };
  const resolve = (ids: string[]) => ids.flatMap((id) => blocks[id] ?? []);

  const toggle = (id: string) => setOpen((p) => ({ ...p, [id]: !p[id] }));

  const buildPayload = (): ReportPayload => ({
    title: `Rapport d'établissement — Fin du ${periodLabel}`,
    subtitle: institutionName,
    country: meta.countryName,
    institution: institutionName,
    period: periodLabel,
    author: meta.headName ? `${meta.headFunction} — ${meta.headName}` : "Chef d'établissement",
    generatedAt: new Date().toLocaleString("fr-FR"),
    official: meta.official,
    ministry: meta.ministry,
    slogan: meta.slogan,
    schoolYear: meta.schoolYear,
    emblem: meta.nationalEmblem,
    sections: [
      {
        heading: "Indicateurs clés",
        table: {
          columns: ["Indicateur", "Valeur"],
          rows: [
            ["Effectif total", effectif.toLocaleString("fr-FR")],
            ["Moyenne générale", `${moyenne.toFixed(2)}/20`],
            ["Taux de réussite", `${reussite.toFixed(1)} %`],
            ["Taux de présence", `${presence.toFixed(1)} %`],
            ["Enseignants", String(enseignants)],
          ],
        },
      },
      ...sections.flatMap((sec) =>
        sec.sub.map((s) => ({
          heading: s.subtitle ? `${sec.title} — ${s.subtitle}` : sec.title,
          paragraphs: resolve(s.blocks),
        })),
      ),
    ],
  });

  const fileBase = `rapport-${(meta.code || etab.code || "etablissement").toLowerCase()}-${periodLabel.replace(/\s+/g, "-").toLowerCase()}`;
  const handlePdf = async () => {
    try {
      await downloadReportPdf(buildPayload(), `${fileBase}.pdf`);
      toast.success("Le rapport PDF est prêt", { description: "Le téléchargement a démarré." });
    } catch {
      toast.error("Export impossible", { description: "Une erreur est survenue lors de la génération." });
    }
  };
  const handleWord = async () => {
    try {
      await downloadReportWord(buildPayload(), `${fileBase}.docx`);
      toast.success("Le rapport Word est prêt", { description: "Le téléchargement a démarré." });
    } catch {
      toast.error("Export impossible", { description: "Une erreur est survenue lors de la génération." });
    }
  };

  const kpis = [
    { value: effectif.toLocaleString("fr-FR"), label: "Effectif total", icon: Users, tone: "bg-blue-100 text-blue-600" },
    { value: `${moyenne.toFixed(2)}/20`, label: "Moyenne générale", icon: Medal, tone: "bg-ew-gold-100 text-ew-gold-600" },
    { value: `${reussite.toFixed(1)}%`, label: "Taux de réussite", icon: TrendingUp, tone: "bg-ew-green-100 text-ew-green-700" },
    { value: String(enseignants), label: "Enseignants", icon: GraduationCap, tone: "bg-slate-100 text-slate-600" },
  ];

  const subtitle =
    formatId === "synthese" ? "Résumé condensé du rapport" : formatId === "tableau" ? "Vue tabulaire des rubriques" : "Cliquez sur un chapitre pour voir son contenu";

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{t("pages.vieScolaireRapportEtablissement.title")}</h1>
          <p className="text-sm text-muted-foreground">
            Rédigé automatiquement à partir des données saisies dans les modules de votre établissement.
          </p>
        </div>
        <Select value={String(safeIdx)} onValueChange={(v) => setPeriodIdx(Number(v))}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p, i) => (
              <SelectItem key={p.label} value={String(i)}>
                {ordinalPeriod(p.label)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bannière officielle */}
      <div className="relative rounded-2xl border border-border bg-card p-5">
        <p className="absolute right-5 top-4 text-xs text-muted-foreground">
          Année Scolaire : <span className="font-semibold text-foreground">{meta.schoolYear}</span>
        </p>
        <div className="flex flex-wrap items-start justify-between gap-6 pr-40">
          <div className="text-sm leading-tight">
            <p className="font-bold uppercase text-foreground">{meta.official}</p>
            {meta.slogan && <p className="text-xs italic text-muted-foreground">{meta.slogan}</p>}
            <p className="mt-1 text-xs font-semibold uppercase text-ew-green-700">{meta.ministry}</p>
            {meta.regionalDirection && <p className="text-xs font-semibold text-muted-foreground">{meta.regionalDirection}</p>}
            <p className="text-xs tracking-widest text-muted-foreground">{meta.locality || etab.locality || "—————————"}</p>
          </div>
          <div className="flex items-center gap-3">
            {meta.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={meta.logo} alt="Logo de l'établissement" className="h-16 w-16 rounded-lg object-contain" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
              </span>
            )}
            <div className="text-left">
              <p className="font-bold text-foreground">{institutionName}</p>
              <p className="text-xs text-muted-foreground">Code : {meta.code || etab.code || "000000"} · Statut : {statut}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bandeau du rapport */}
      <div className="rounded-xl border-2 border-border bg-muted/20 px-5 py-5 text-center">
        <p className="text-lg font-extrabold uppercase tracking-wide text-ew-green-700">
          Rapport de fin du {periodLabel}
        </p>
      </div>

      {/* Indicateurs clés */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-foreground">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", k.tone)}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
          );
        })}
      </div>

      {/* Corps du rapport — plan & présentation au choix du chef d'établissement */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-bold text-foreground">Sommaire du Rapport</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <LayoutPanelTop className="h-3.5 w-3.5" /> Présentation
            </span>
            <Select value={formatId} onValueChange={setFormatId}>
              <SelectTrigger className="h-9 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_FORMAT_OPTIONS.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <ListTree className="h-3.5 w-3.5" /> Plan
            </span>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="h-9 w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_PLAN_OPTIONS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Présentation : Accordéon */}
        {formatId === "accordeon" && (
          <ul className="divide-y divide-border">
            {sections.map((sec) => {
              const isOpen = !!open[sec.id];
              return (
                <li key={sec.id}>
                  <button
                    type="button"
                    onClick={() => toggle(sec.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/30"
                  >
                    <span className={cn("text-sm font-bold", isOpen ? "text-ew-green-700" : "text-foreground")}>{sec.title}</span>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="space-y-3 bg-muted/20 px-5 py-3">
                      {sec.sub.map((s, i) => (
                        <div key={i} className="space-y-1.5">
                          {s.subtitle && <p className="text-xs font-bold uppercase tracking-wide text-foreground">{s.subtitle}</p>}
                          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
                            {resolve(s.blocks).map((p, j) => (
                              <p key={j}>{p}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* Présentation : Synthèse compacte */}
        {formatId === "synthese" && (
          <div className="space-y-3 px-5 py-5 text-sm leading-relaxed text-muted-foreground">
            <p>{blocks.intro[0]}</p>
            {blocks.resultats.map((p, i) => (
              <p key={`r${i}`}>{p}</p>
            ))}
            <p>{blocks.presence[0]}</p>
            <p>{blocks.effectifs[0]}</p>
            <p>{blocks.conclusion[0]}</p>
          </div>
        )}

        {/* Présentation : Vue tableau */}
        {formatId === "tableau" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-1/3 px-5 py-2.5">Rubrique</th>
                  <th className="px-5 py-2.5">Contenu</th>
                </tr>
              </thead>
              <tbody>
                {sections.flatMap((sec) =>
                  sec.sub.map((s, i) => (
                    <tr key={`${sec.id}-${i}`} className="border-t border-border align-top">
                      <td className="px-5 py-2.5 font-semibold text-foreground">{s.subtitle ?? sec.title}</td>
                      <td className="px-5 py-2.5 text-muted-foreground">{resolve(s.blocks).join(" ")}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Télécharger le rapport */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4">
        <div>
          <h2 className="font-bold text-foreground">Télécharger le rapport</h2>
          <p className="text-sm text-muted-foreground">Générez le rapport complet au format Word ou PDF</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePdf}>
            <Printer className="h-4 w-4" /> Imprimer / PDF
          </Button>
          <Button className={VERT_BTN} onClick={handleWord}>
            <Download className="h-4 w-4" /> Télécharger Word
          </Button>
        </div>
      </div>
    </div>
  );
}
