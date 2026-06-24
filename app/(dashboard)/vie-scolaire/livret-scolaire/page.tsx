"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { BookMarked, Award, Heart, FileText, FileType2, Download, Eye } from "lucide-react";
import { ModulePage, SectionCard, TwoColumn } from "@/components/modules/module-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FilterBar, FilterSelect } from "@/components/layout/filter-bar";
import { SimpleTable } from "@/components/data-table/simple-table";
import { initials } from "@/lib/utils";
import { etabExportMeta, type EtabExportMeta } from "@/lib/etab-config";
import { toNomCase, toPrenomCase } from "@/lib/format-name";
import { useStudents } from "@/components/app-shell/use-students";
import type { Student } from "@/lib/students/students-server";
import type { Eleve } from "@/lib/types";
import { LivretSynthese, livretTerms, livretMention, livretOrd, buildLivretSynthese } from "@/components/livret/livret-synthese";
import { LivretEditor } from "@/components/livret/livret-editor";
import { LivretFullModal } from "@/components/livret/livret-document";
import { downloadLivretSynthesePdf, downloadLivretSyntheseWord } from "@/lib/exports/livret-synthese";
import { downloadLivretScolaireWord } from "@/lib/docx/livret-scolaire";
import { useStore } from "@/components/app-shell/data-store";
import { computeLivret, resolveLivret } from "@/lib/livret/autofill";
import { toast } from "sonner";

const COMPETENCES = [
  { label: "Expression écrite", value: 82 },
  { label: "Raisonnement", value: 75 },
  { label: "Autonomie", value: 88 },
  { label: "Travail en groupe", value: 70 },
];

const TRIM_LABELS = ["1ᵉʳ Trimestre", "2ᵉ Trimestre", "3ᵉ Trimestre"];

/** Adapte un élève du référentiel (Student) à la forme Eleve attendue par les
 * composants du livret (les champs average/attendanceRate ne sont pas utilisés). */
function studentToEleve(s: Student): Eleve {
  return {
    id: s.id,
    matricule: s.matricule,
    firstName: s.firstName,
    lastName: s.lastName,
    gender: s.gender === "F" ? "F" : "M",
    birthDate: s.birthDate,
    className: s.className,
    average: 0,
    attendanceRate: 0,
    status: s.status === "archived" ? "suspended" : "active",
  };
}

export default function LivretScolairePage() {
  const t = useTranslations();
  const { students } = useStudents();
  const classOptions = React.useMemo(
    () => [...new Set(students.map((e) => e.className).filter(Boolean))].sort(),
    [students],
  );
  const [cls, setCls] = React.useState("");
  React.useEffect(() => {
    if (!cls && classOptions.length) setCls(classOptions[0]);
  }, [classOptions, cls]);
  const classStudents = React.useMemo(
    () => students.filter((e) => e.className === cls && e.status !== "archived"),
    [students, cls],
  );
  const [studentId, setStudentId] = React.useState("");

  // Garder un élève valide quand la classe change.
  React.useEffect(() => {
    if (!classStudents.some((s) => s.id === studentId)) setStudentId(classStudents[0]?.id ?? "");
  }, [classStudents, studentId]);

  const studentRaw = classStudents.find((s) => s.id === studentId) ?? classStudents[0];
  const student: Eleve | undefined = studentRaw ? studentToEleve(studentRaw) : undefined;
  const effectif = classStudents.length;

  const store = useStore();
  const [meta, setMeta] = React.useState<EtabExportMeta>(() => etabExportMeta({}));
  React.useEffect(() => setMeta(etabExportMeta()), []);

  const [openSynthese, setOpenSynthese] = React.useState(false);
  const [openFull, setOpenFull] = React.useState(false);

  const terms = React.useMemo(() => (student ? livretTerms(student.id, effectif) : []), [student, effectif]);
  const results = terms.map((t, i) => ({
    periode: TRIM_LABELS[i],
    moyenne: t.moyGen.toFixed(2).replace(".", ","),
    rang: `${livretOrd(t.rangEleve)} / ${effectif}`,
    mention: livretMention(t.moyGen),
  }));
  const annual = terms.length ? terms.reduce((a, t) => a + t.moyGen, 0) / terms.length : 0;
  const conduite = terms[2]?.conduite ?? "Bonne";

  if (!student) return null;
  const fullName = `${toNomCase(student.lastName)} ${toPrenomCase(student.firstName)}`;

  const recapFile = `recapitulatif-${`${student.lastName}-${student.firstName}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()}`;
  const downloadRecap = (fmt: "pdf" | "word") => {
    const data = buildLivretSynthese(student, meta, effectif);
    if (fmt === "pdf") {
      void downloadLivretSynthesePdf(data, `${recapFile}.pdf`).then(() => toast.success("Récapitulatif PDF téléchargé"));
    } else {
      void downloadLivretSyntheseWord(data, `${recapFile}.docx`).then(() => toast.success("Récapitulatif Word téléchargé"));
    }
  };

  const livretFile = `livret-scolaire-${`${student.lastName}-${student.firstName}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()}`;
  const downloadFullWord = () => {
    const record = store.livretRecords.find(
      (r) => r.studentId === student.id && r.schoolYear === meta.schoolYear,
    );
    const resolved = resolveLivret(
      computeLivret({ student, meta, grades: store.livretGrades, classmates: classStudents, schoolYear: meta.schoolYear }),
      record?.overrides,
    );
    void downloadLivretScolaireWord(resolved, `${livretFile}.docx`).then(() => toast.success("Livret (Word) téléchargé"));
  };

  return (
    <ModulePage title={t("pages.vieScolaireLivretScolaire.title")} description={t("pages.vieScolaireLivretScolaire.description")}
      icon={BookMarked}
      permission="school_record:view"
      sections={[
        { id: "redaction", label: "Rédaction (13 pages)" },
        { id: "documents", label: "Documents du livret" },
        { id: "parcours", label: "Élève & résultats" },
      ]}
      actions={
        <Button onClick={() => setOpenSynthese(true)}>
          <Download className="h-4 w-4" /> Synthèse PDF
        </Button>
      }
    >
      <FilterBar>
        <FilterSelect
          value={cls}
          onValueChange={setCls}
          options={classOptions.map((c) => ({ value: c, label: c }))}
        />
        <FilterSelect
          value={studentId}
          onValueChange={setStudentId}
          options={classStudents.map((s) => ({ value: s.id, label: `${toNomCase(s.lastName)} ${toPrenomCase(s.firstName)}` }))}
        />
      </FilterBar>

      {/* Rédaction automatisée du livret (13 pages) */}
      <SectionCard id="redaction" title="Rédaction automatisée du livret (13 pages)">
        <p className="mb-3 text-sm text-muted-foreground">
          Identité (établissement &amp; élève) et notes auto-remplies ; observations auto-générées et modifiables par
          les personnes habilitées (enseignant, chef d&apos;établissement, administrateur).
        </p>
        <LivretEditor
          student={student}
          meta={meta}
          classmates={classStudents}
          schoolYear={meta.schoolYear}
        />
      </SectionCard>

      {/* Documents téléchargeables du livret */}
      <SectionCard id="documents" title="Documents du livret scolaire">
        <div className="space-y-3">
          {/* Livret officiel — modèle 13 pages (auto-rempli) */}
          <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-ew-green-200 bg-ew-green-50/40 p-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ew-green-100 text-ew-green-700">
                <BookMarked className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-foreground">Livret officiel — modèle 13 pages (auto‑rempli)</p>
                <p className="text-sm text-muted-foreground">
                  Couverture, identité, suivi médical, parents, notes par cycle, appréciations &amp; décision,
                  établissements successifs, diplômes, extension. Auto‑rempli depuis la configuration et les notes ;
                  observations rédigées dans la section « Rédaction (13 pages) ».
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" onClick={() => setOpenFull(true)}>
                <Eye className="h-4 w-4" /> Aperçu &amp; PDF
              </Button>
              <Button variant="outline" onClick={downloadFullWord}>
                <FileType2 className="h-4 w-4" /> Word
              </Button>
            </div>
          </div>

          {/* Livret complet (7 pages, imprimable) */}
          <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ew-green-100 text-ew-green-700">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-foreground">Livret complet (modèle officiel — 7 pages)</p>
                <p className="text-sm text-muted-foreground">
                  Couverture, identification, parents &amp; parcours, résultats des 3 trimestres, bilan annuel, compétences et suivi
                  médical. Auto‑renseigné depuis la configuration, imprimable en PDF.
                </p>
              </div>
            </div>
            <Button variant="outline" className="shrink-0" onClick={() => setOpenSynthese(true)}>
              <Eye className="h-4 w-4" /> Aperçu &amp; PDF
            </Button>
          </div>

          {/* Récapitulatif annuel synthétique (1 page) — Word & PDF */}
          <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ew-gold-100 text-ew-gold-600">
                <FileType2 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-foreground">Récapitulatif annuel synthétique (1 page)</p>
                <p className="text-sm text-muted-foreground">
                  Tableau des moyennes &amp; rangs par matière (1ᵉʳ / 2ᵉ / 3ᵉ trimestre &amp; M.G.A), appréciations, décision du
                  conseil et mention. Téléchargeable en Word ou PDF.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" onClick={() => downloadRecap("word")}>
                <FileType2 className="h-4 w-4" /> Word
              </Button>
              <Button onClick={() => downloadRecap("pdf")}>
                <Download className="h-4 w-4" /> PDF
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>

      <TwoColumn className="scroll-mt-24 lg:grid-cols-[1fr_2fr]" id="parcours">
        <SectionCard>
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-xl">{initials(fullName)}</AvatarFallback>
            </Avatar>
            <h2 className="mt-3 text-lg font-bold text-foreground">{fullName}</h2>
            <p className="text-sm text-muted-foreground">
              {student.className} · {student.matricule}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge tone="green">Moyenne annuelle {annual.toFixed(2).replace(".", ",")}/20</Badge>
              <Badge tone="blue">{livretMention(annual)}</Badge>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <p className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Award className="h-4 w-4 text-ew-green-700" /> Compétences
            </p>
            {COMPETENCES.map((c) => (
              <div key={c.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{c.label}</span>
                  <span className="font-semibold">{c.value}%</span>
                </div>
                <Progress value={c.value} className="mt-1" />
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Résultats par période">
            <SimpleTable
              rows={results}
              getKey={(r) => r.periode}
              columns={[
                { key: "periode", header: "Période", render: (r) => <span className="font-semibold">{r.periode}</span> },
                { key: "moyenne", header: "Moyenne", render: (r) => <Badge tone="green">{r.moyenne}</Badge> },
                { key: "rang", header: "Rang" },
                { key: "mention", header: "Mention", render: (r) => <Badge tone="blue">{r.mention}</Badge> },
              ]}
            />
          </SectionCard>

          <TwoColumn>
            <SectionCard title="Conduite">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ew-green-100 text-ew-green-700">
                  <Heart className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-foreground">{conduite}</p>
                  <p className="text-sm text-muted-foreground">
                    {terms[2]?.absJust ?? 0}h justifiées · {terms[2]?.retards ?? 0} retard(s)
                  </p>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Appréciation générale">
              <p className="text-sm text-foreground">
                {annual >= 14
                  ? "Élève sérieux(se) et régulier(ère), en bonne progression sur l'année. Encouragements du conseil de classe."
                  : annual >= 10
                    ? "Parcours correct sur l'année. L'élève doit consolider ses acquis et viser plus haut."
                    : "Année difficile. Un accompagnement renforcé est recommandé pour la suite."}
              </p>
            </SectionCard>
          </TwoColumn>
        </div>
      </TwoColumn>

      <LivretSynthese
        open={openSynthese}
        student={student}
        meta={meta}
        effectif={effectif}
        onClose={() => setOpenSynthese(false)}
      />

      <LivretFullModal
        open={openFull}
        student={student}
        meta={meta}
        classmates={classStudents}
        schoolYear={meta.schoolYear}
        onClose={() => setOpenFull(false)}
      />
    </ModulePage>
  );
}
