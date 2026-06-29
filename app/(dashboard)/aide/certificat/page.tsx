"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  FileDown,
  Award,
  BookOpenCheck,
  Stamp,
  Save,
  CheckCircle2,
  ListOrdered,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TRAINING_SYLLABUS } from "@/lib/guides/training-manual-data";
import { useStore } from "@/components/app-shell/data-store";
import { useApp } from "@/components/app-shell/app-context";
import { etabExportMeta } from "@/lib/etab-config";
import { fetchImageData } from "@/lib/exports/image";
import {
  consumeNextCertificateNumber,
  peekNextCertificateNumber,
} from "@/lib/cert-sequence";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { nextCertificateNumber } from "@/lib/certificates/certificates-server";
import { getCourse } from "@/lib/formations/catalog";
import { CourseCertificate } from "@/components/formations/course-certificate";
import {
  beneficiaryDisplayName,
  certificateNumber,
  getCertificateConfig,
  resolveCertificateDate,
} from "@/lib/formations/certificate";

/**
 * Page autonome du Certificat de fin de formation EduWeb Planner.
 *
 * - Pré-remplissage automatique :
 *   - N° du certificat = séquence par établissement + année courante.
 *   - Date de délivrance = aujourd'hui (JJ/MM/AAAA).
 *   - Identité de l'établissement, signature scannée et cachet repris depuis
 *     la configuration de l'établissement (loadEtabConfig → etabExportMeta).
 *
 * - Actions :
 *   - « Imprimer / PDF » : impression directe.
 *   - « Télécharger Word (.docx) » : POST vers /api/docx/certificat avec le
 *     payload complet, déclenche le téléchargement du DOCX généré.
 *   - « Enregistrer dans le journal » : consomme un numéro de séquence,
 *     persiste l'entrée dans le data-store et propose un lien vers le journal.
 */
export default function CertificatPage() {
  // useSearchParams() exige une frontière Suspense dans l'App Router.
  return (
    <React.Suspense fallback={null}>
      <CertificatRouter />
    </React.Suspense>
  );
}

/**
 * Aiguillage : certificat PAR COURS (nouveau modèle visuel) si `?course=<id>`
 * est présent, sinon certificat générique.
 *
 * IMPORTANT : on lit le paramètre via `useSearchParams()` (réactif, fiable
 * côté client et lors des navigations « soft »). L'ancienne lecture dans un
 * initialiseur `useState(() => window.location.search)` s'exécutait au rendu
 * serveur/statique (où `window` est indéfini) et renvoyait toujours `null`,
 * d'où l'affichage systématique du certificat générique.
 */
function CertificatRouter() {
  const courseId = useSearchParams().get("course");
  if (courseId) {
    return <CourseCertificateView courseId={courseId} />;
  }
  return <GenericTrainingCertificate />;
}

function GenericTrainingCertificate() {
  const store = useStore();
  const meta = React.useMemo(() => etabExportMeta(), []);
  const id = TRAINING_SYLLABUS.identification;

  const today = React.useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const formattedToday = formatDate(today);

  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  // Intitulé imprimé sur le certificat : pré-rempli avec le titre du syllabus,
  // mais éditable pour y écrire le VRAI titre de la formation suivie.
  const [formationTitle, setFormationTitle] = React.useState(
    id.intituleAbrege || id.intitule,
  );
  const [certificateNumber, setCertificateNumber] = React.useState("");
  const [issueDate, setIssueDate] = React.useState(formattedToday);
  const [saving, setSaving] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [savedId, setSavedId] = React.useState<string | null>(null);

  // Suggestion du prochain numéro au montage (sans incrémenter le compteur).
  React.useEffect(() => {
    setCertificateNumber(peekNextCertificateNumber(meta.code, currentYear));
  }, [meta.code, currentYear]);

  async function downloadWord() {
    setDownloading(true);
    try {
      // Signature + cachet de l'autorité EduWeb (DG) — assets plateforme.
      const dgSig = await fetchImageData("/brand/dg-signature.png");
      const dgStamp = await fetchImageData("/brand/eduweb-cachet.png");
      const res = await fetch("/api/docx/certificat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beneficiaryName: name,
          beneficiaryRole: role,
          certificateNumber,
          issueDate,
          // Formations PROPRIÉTÉ d'EdTech EduWeb : marque EduWeb, aucune mention
          // Ministère / République (le certificat n'est pas un diplôme d'État).
          institution: "EdTech EduWeb",
          headName: meta.headName,
          headFunction: meta.headFunction || "Directeur Général",
          officialCountry: "EdTech EduWeb",
          officialSlogan: "EduWeb, le pas dans le futur !",
          ministry: undefined,
          signatureDataUrl: dgSig?.dataUrl,
          stampDataUrl: dgStamp?.dataUrl,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (name || "Certificat")
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^A-Za-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      a.download = `Certificat-${safeName || "EduWeb"}-${certificateNumber || "vierge"}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      window.alert("Échec du téléchargement Word : " + (err as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  async function saveToJournal() {
    if (!name.trim()) {
      window.alert(
        "Renseignez au minimum le nom du bénéficiaire avant d'enregistrer.",
      );
      return;
    }
    setSaving(true);
    try {
      // Numéro ATOMIQUE serveur (unicité cross-poste) ; repli local en mode démo
      // ou si la RPC échoue (la séquence locale reste cohérente côté navigateur).
      let sequencedNumber: string | null = null;
      if (isSupabaseConfigured()) {
        sequencedNumber = await nextCertificateNumber(createClient(), meta.code, currentYear);
      }
      if (!sequencedNumber) {
        sequencedNumber = consumeNextCertificateNumber(meta.code, currentYear);
      }
      store.addCertificate({
        number: sequencedNumber,
        beneficiaryName: name.trim(),
        beneficiaryRole: role.trim(),
        issueDate: issueDate || formattedToday,
        formationCode: id.code,
        formationVersion: id.version,
        validUntil: id.dateValidite,
        establishment: meta.institution,
        establishmentCode: meta.code || "",
        deliveredBy: meta.headName || "—",
      });
      setCertificateNumber(sequencedNumber);
      setSavedId(sequencedNumber);
      // Réinitialise la suggestion suivante après quelques secondes (UX).
      window.setTimeout(() => {
        setCertificateNumber(peekNextCertificateNumber(meta.code, currentYear));
        setSavedId(null);
      }, 6000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Barre d'actions (cachée à l'impression) */}
      <div className="no-print sticky top-16 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur sm:-mx-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/aide">
              <ArrowLeft className="h-4 w-4" /> Bibliothèque
            </Link>
          </Button>
          <div>
            <p className="font-display text-base font-bold leading-none text-foreground">
              Certificat de fin de formation
            </p>
            <p className="text-xs text-muted-foreground">
              Modèle officiel — {id.code} · {meta.institution}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/aide/certificat/journal">
              <ListOrdered className="h-4 w-4" /> Journal des délivrés
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={saveToJournal}
            disabled={saving}
          >
            <Save className="h-4 w-4" />{" "}
            {saving ? "Enregistrement…" : "Enregistrer dans le journal"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadWord}
            disabled={downloading}
          >
            <FileDown className="h-4 w-4" />{" "}
            {downloading ? "Génération…" : "Télécharger Word (.docx)"}
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimer / PDF
          </Button>
        </div>
      </div>

      {/* Bandeau de confirmation après enregistrement */}
      {savedId ? (
        <div className="no-print flex items-center gap-3 rounded-2xl border border-ew-green-300 bg-ew-green-50 px-4 py-3 text-sm text-ew-green-900">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">
              Certificat enregistré dans le journal — n° {savedId}
            </p>
            <p className="text-xs text-ew-green-800">
              Consultez la liste sur la page{" "}
              <Link href="/aide/certificat/journal" className="underline">
                Journal des certificats délivrés
              </Link>
              .
            </p>
          </div>
        </div>
      ) : null}

      {/* Formulaire de pré-remplissage */}
      <div className="no-print rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-ew-green-700" />
          <p className="font-display text-base font-bold text-foreground">
            Personnaliser le certificat
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Le numéro du certificat est <strong>généré automatiquement</strong> à
          partir du code de votre établissement ({meta.code || "—"}) et de
          l&apos;année en cours. Il sera incrémenté lors de
          l&apos;enregistrement dans le journal.
        </p>
        <div className="mt-4">
          <Field
            label="Intitulé de la formation (imprimé sur le certificat)"
            value={formationTitle}
            onChange={setFormationTitle}
            placeholder="Titre réel de la formation suivie"
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Nom et prénoms"
            value={name}
            onChange={setName}
            placeholder="ZORO Elogne Guessan"
          />
          <Field
            label="Rôle / fonction"
            value={role}
            onChange={setRole}
            placeholder="Chef d'établissement"
          />
          <Field
            label="N° certificat (auto)"
            value={certificateNumber}
            onChange={setCertificateNumber}
            mono
          />
          <Field
            label="Délivré le"
            value={issueDate}
            onChange={setIssueDate}
            placeholder="JJ/MM/AAAA"
          />
        </div>

        {/* Synthèse de la configuration utilisée */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ConfigCell
            icon={<BookOpenCheck className="h-3.5 w-3.5" />}
            label="Établissement"
            value={meta.institution || "—"}
          />
          <ConfigCell
            icon={<BookOpenCheck className="h-3.5 w-3.5" />}
            label="Autorité signataire"
            value={meta.headName || "—"}
          />
          <ConfigCell
            icon={<Stamp className="h-3.5 w-3.5" />}
            label="Cachet configuré"
            value={meta.stamp ? "Oui" : "Non — à téléverser dans Configuration"}
          />
          <ConfigCell
            icon={<Stamp className="h-3.5 w-3.5" />}
            label="Signature scannée"
            value={
              meta.signature ? "Oui" : "Non — à téléverser dans Configuration"
            }
          />
        </div>
      </div>

      {/* Aperçu + impression — nouveau modèle visuel unique */}
      <style>{`@media print {
        @page { size: A4 landscape; margin: 0; }
        html, body { height: 100%; margin: 0; overflow: hidden; background: #fff; }
        body * { visibility: hidden !important; }
        #certificat-print, #certificat-print * { visibility: visible !important; }
        #certificat-print {
          position: fixed !important; inset: 0 !important;
          width: 100vw !important; height: 100vh !important; max-width: none !important;
          margin: 0 !important; padding: 0 !important;
          display: flex !important; align-items: center !important; justify-content: center !important;
        }
        #certificat-print > div {
          width: auto !important; height: 100% !important; max-height: 100vh !important;
        }
      }`}</style>
      <div className="bg-muted/40 py-6 print:bg-white print:py-0">
        <CourseCertificate
          certNumber={certificateNumber}
          beneficiaryName={name}
          courseTitle={formationTitle}
          trainerName={role}
          dateLabel={issueDate}
          dgName={meta.headName}
          dgFunction={meta.headFunction || "Directeur Général"}
          signatureUrl="/brand/dg-signature.png"
          stampUrl="/brand/eduweb-cachet.png"
        />
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          mono ? "font-mono" : ""
        }`}
      />
    </div>
  );
}

function ConfigCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background/60 p-2.5">
      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-xs font-bold text-foreground">{value}</p>
    </div>
  );
}

function formatDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/* ============================================================================
   Certificat PAR COURS — nouveau modèle visuel, auto-rempli.
   ========================================================================== */
function CourseCertificateView({ courseId }: { courseId: string }) {
  const app = useApp();
  const store = useStore();
  const meta = React.useMemo(() => etabExportMeta(), []);
  const course = getCourse(courseId);
  const config = getCertificateConfig(courseId, store.certificateConfigs);

  const certNumber = certificateNumber(app.user.id, courseId);
  const dateLabel = React.useMemo(
    () => resolveCertificateDate(config),
    [config],
  );
  const dgName = (config.dgName || meta.headName || "").trim();
  const dgFunction = (
    config.dgFunction ||
    meta.headFunction ||
    "Directeur Général"
  ).trim();

  // Nom du bénéficiaire : pré-rempli depuis le profil, modifiable.
  const autoName = beneficiaryDisplayName(app.user);
  const [name, setName] = React.useState(autoName);
  React.useEffect(() => {
    if (!name && autoName) setName(autoName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoName]);

  const [savedId, setSavedId] = React.useState<string | null>(null);

  function saveToJournal() {
    if (!name.trim()) {
      window.alert("Le nom du bénéficiaire est requis.");
      return;
    }
    store.addCertificate({
      number: certNumber,
      beneficiaryName: name.trim(),
      beneficiaryRole: "",
      issueDate: dateLabel,
      formationCode: courseId,
      formationVersion: "",
      validUntil: "",
      establishment: meta.institution,
      establishmentCode: meta.code || "",
      deliveredBy: (config.trainerName || dgName || "—").trim(),
    });
    setSavedId(certNumber);
    window.setTimeout(() => setSavedId(null), 6000);
  }

  if (!course) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-sm">
        Cours introuvable. Revenez à la{" "}
        <Link href="/aide" className="underline">
          bibliothèque
        </Link>
        .
      </div>
    );
  }

  const missingTrainer = !config.trainerName?.trim();

  return (
    <div className="space-y-5">
      <style>{`@media print {
        @page { size: A4 landscape; margin: 0; }
        html, body { height: 100%; margin: 0; overflow: hidden; background: #fff; }
        body * { visibility: hidden !important; }
        #certificat-print, #certificat-print * { visibility: visible !important; }
        #certificat-print {
          position: fixed !important; inset: 0 !important;
          width: 100vw !important; height: 100vh !important; max-width: none !important;
          margin: 0 !important; padding: 0 !important;
          display: flex !important; align-items: center !important; justify-content: center !important;
        }
        #certificat-print > div {
          width: auto !important; height: 100% !important; max-height: 100vh !important;
        }
      }`}</style>

      {/* Barre d'actions (masquée à l'impression) */}
      <div className="no-print sticky top-16 z-20 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/85 px-4 py-3 backdrop-blur sm:-mx-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/aide">
              <ArrowLeft className="h-4 w-4" /> Bibliothèque
            </Link>
          </Button>
          <div>
            <p className="font-display text-base font-bold leading-none text-foreground">
              Certificat d&apos;achèvement
            </p>
            <p className="text-xs text-muted-foreground">
              {course.shortTitle} · N° {certNumber}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/aide/certificat/journal">
              <ListOrdered className="h-4 w-4" /> Journal
            </Link>
          </Button>
          <Button size="sm" variant="outline" onClick={saveToJournal}>
            <Save className="h-4 w-4" /> Enregistrer dans le journal
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimer / PDF
          </Button>
        </div>
      </div>

      {savedId ? (
        <div className="no-print flex items-center gap-3 rounded-2xl border border-ew-green-300 bg-ew-green-50 px-4 py-3 text-sm text-ew-green-900">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="font-bold">
            Certificat enregistré dans le journal — n° {savedId}
          </p>
        </div>
      ) : null}

      {/* Réglages auto + champ nom */}
      <div className="no-print rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            label="Bénéficiaire (NOM Prénoms)"
            value={name}
            onChange={setName}
            placeholder="ZORO Elogne"
          />
          <ConfigCell
            icon={<BookOpenCheck className="h-3.5 w-3.5" />}
            label="Formation"
            value={course.title}
          />
          <ConfigCell
            icon={<Award className="h-3.5 w-3.5" />}
            label="Formateur (config admin)"
            value={config.trainerName?.trim() || "— à configurer"}
          />
          <ConfigCell
            icon={<Stamp className="h-3.5 w-3.5" />}
            label="Date imprimée"
            value={dateLabel}
          />
        </div>
        {missingTrainer ? (
          <p className="mt-3 text-xs italic text-muted-foreground">
            Astuce : le <strong>formateur</strong> et la <strong>date</strong>{" "}
            se règlent dans Système → Inscriptions aux formations → onglet «
            Réussite du cours ». La <strong>signature</strong> et le{" "}
            <strong>cachet</strong> sont ceux de l&apos;autorité EduWeb (Directeur
            Général).
          </p>
        ) : null}
      </div>

      {/* Aperçu imprimable */}
      <div className="bg-muted/40 py-6 print:bg-white print:py-0">
        <CourseCertificate
          certNumber={certNumber}
          beneficiaryName={name}
          courseTitle={course.title}
          trainerName={config.trainerName}
          dateLabel={dateLabel}
          dgName={dgName}
          dgFunction={dgFunction}
          signatureUrl="/brand/dg-signature.png"
          stampUrl="/brand/eduweb-cachet.png"
        />
      </div>
    </div>
  );
}
