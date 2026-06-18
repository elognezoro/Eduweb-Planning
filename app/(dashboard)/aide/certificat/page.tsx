"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Printer, FileDown, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManuelCertificate } from "@/components/guides/training-manual";
import { TRAINING_SYLLABUS } from "@/lib/guides/training-manual-data";

/**
 * Page autonome du Certificat de fin de formation EduWeb Planner.
 * - Affichage écran (pré-impression)
 * - Boutons : impression PDF, téléchargement Word (.docx), retour
 * - Saisie pré-remplissage facultative (nom du bénéficiaire, rôle, numéro,
 *   date d'émission) via une mini-formulaire au-dessus du certificat.
 */
export default function CertificatPage() {
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [certificateNumber, setCertificateNumber] = React.useState("");
  const [issueDate, setIssueDate] = React.useState("");

  const docxQuery = new URLSearchParams();
  if (name) docxQuery.set("name", name);
  if (role) docxQuery.set("role", role);
  if (certificateNumber) docxQuery.set("number", certificateNumber);
  if (issueDate) docxQuery.set("date", issueDate);
  const docxUrl = `/api/docx/certificat${docxQuery.toString() ? "?" + docxQuery.toString() : ""}`;

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
              Modèle officiel — {TRAINING_SYLLABUS.identification.code}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={docxUrl}>
              <FileDown className="h-4 w-4" /> Télécharger Word (.docx)
            </a>
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Imprimer / PDF
          </Button>
        </div>
      </div>

      {/* Formulaire de pré-remplissage (facultatif) */}
      <div className="no-print rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-ew-green-700" />
          <p className="font-display text-base font-bold text-foreground">
            Pré-remplir le certificat (facultatif)
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Renseignez les champs ci-dessous pour personnaliser le certificat avant impression ou
          téléchargement Word. Laissez vides pour garder un modèle vierge à compléter à la main.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Nom et prénoms" value={name} onChange={setName} placeholder="ZORO Elogne Guessan" />
          <Field label="Rôle / fonction" value={role} onChange={setRole} placeholder="Chef d'établissement" />
          <Field label="N° certificat" value={certificateNumber} onChange={setCertificateNumber} placeholder="2026-001" />
          <Field label="Délivré le" value={issueDate} onChange={setIssueDate} placeholder="JJ / MM / AAAA" />
        </div>
      </div>

      {/* Le certificat (affichage écran + impression) */}
      <div id="manuel-print" className="space-y-10 bg-muted/40 py-8 print:bg-white print:py-0">
        <ManuelCertificate
          identification={TRAINING_SYLLABUS.identification}
          beneficiaryName={name}
          beneficiaryRole={role}
          duration={TRAINING_SYLLABUS.volumeHoraire.dureeTotal}
          issueDate={issueDate}
          certificateNumber={certificateNumber}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
