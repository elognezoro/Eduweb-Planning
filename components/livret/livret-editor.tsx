"use client";

import * as React from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/app-shell/app-context";
import { useStore } from "@/components/app-shell/data-store";
import { IdentityPhotoUpload } from "@/components/forms/identity-photo-upload";
import type { EtabExportMeta } from "@/lib/etab-config";
import type { Eleve } from "@/lib/types";
import { computeLivret, resolveLivret } from "@/lib/livret/autofill";
import { mergeLivretOverrides } from "@/lib/livret/overrides";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { deleteLivretRecord, upsertLivretRecord } from "@/lib/livret/livret-server";
import type {
  LivretDiplome,
  LivretEtabSuccessif,
  LivretOverrides,
  LivretParentBlock,
  LivretResolved,
} from "@/lib/livret/types";

/* ============================================================================
   Éditeur de rédaction du livret scolaire (13 pages).

   - Champs IDENTITÉ / NOTES : auto-remplis (lecture seule) depuis la
     configuration de l'établissement et la source de notes partagée.
   - Champs OBSERVATIONS / DÉCISIONS : auto-générés mais ÉDITABLES par une
     personne habilitée (school_record:write pour les observations ;
     school_record:manage pour le visa / la décision du chef). Sauvegarde
     immédiate (au blur) via le store ; « Réinitialiser à l'auto » efface les
     champs édités.
   ========================================================================== */

const GREEN = "#176b45";

const PAGES: { num: number; title: string }[] = [
  { num: 1, title: "Couverture" },
  { num: 2, title: "Identité de l'élève" },
  { num: 3, title: "Instructions" },
  { num: 4, title: "Observations médicales" },
  { num: 5, title: "Adresses des parents / tuteurs" },
  { num: 6, title: "1er Cycle — Notes" },
  { num: 7, title: "1er Cycle — Appréciations & décision" },
  { num: 8, title: "2e Cycle — Notes" },
  { num: 9, title: "2e Cycle — Appréciations & décision" },
  { num: 10, title: "Établissements successifs (A)" },
  { num: 11, title: "Établissements successifs (B)" },
  { num: 12, title: "Diplômes obtenus" },
  { num: 13, title: "Extension" },
];

const fmtDate = (iso?: string) => {
  if (!iso || !iso.includes("-")) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const f2 = (n: number | null) => (n == null ? "—" : n.toFixed(2));
const ord = (n: number | null) => (n == null ? "—" : n === 1 ? "1er" : `${n}e`);

/* ----------------------------- Champs de base ------------------------------ */
function ReadField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

function EditableText({
  value,
  onCommit,
  disabled,
  multiline,
  placeholder,
}: {
  value: string;
  onCommit: (v: string) => void;
  disabled?: boolean;
  multiline?: boolean;
  placeholder?: string;
}) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => setV(value), [value]);
  const commit = () => {
    if (v !== value) onCommit(v);
  };
  const base =
    "w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:border-ew-green-500 focus:outline-none focus:ring-1 focus:ring-ew-green-500 disabled:cursor-not-allowed disabled:bg-muted/40 disabled:text-muted-foreground";
  if (multiline) {
    return (
      <textarea
        value={v}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(ev) => setV(ev.target.value)}
        onBlur={commit}
        rows={3}
        className={cn(base, "resize-y")}
      />
    );
  }
  return (
    <input
      value={v}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(ev) => setV(ev.target.value)}
      onBlur={commit}
      className={cn(base, "h-9")}
    />
  );
}

function EditField({
  label,
  value,
  onCommit,
  canEdit,
  multiline,
  hint,
}: {
  label: string;
  value: string;
  onCommit: (v: string) => void;
  canEdit: boolean;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        {canEdit ? (
          <Pencil className="h-3 w-3 text-ew-green-600" aria-label="Éditable" />
        ) : (
          <Lock className="h-3 w-3 text-muted-foreground" aria-label="Lecture seule" />
        )}
        {hint ? <span className="text-[10px] italic text-muted-foreground">· {hint}</span> : null}
      </div>
      <EditableText value={value} onCommit={onCommit} disabled={!canEdit} multiline={multiline} />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-sm font-extrabold" style={{ color: GREEN }}>
      {children}
    </h3>
  );
}

/* ------------------------------- Tableau de notes -------------------------- */
function NotesTable({ data }: { data: LivretResolved }) {
  const { subjects, general } = data.notes;
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr style={{ background: GREEN, color: "#fff" }}>
            <th className="px-2 py-1.5 text-left">Matière</th>
            <th className="px-2 py-1.5 text-center">Coef.</th>
            <th className="px-2 py-1.5 text-center">T1 (moy / place)</th>
            <th className="px-2 py-1.5 text-center">T2 (moy / place)</th>
            <th className="px-2 py-1.5 text-center">T3 (moy / place)</th>
            <th className="px-2 py-1.5 text-center">Moy. ann.</th>
            <th className="px-2 py-1.5 text-center">Class. ann.</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((r) => (
            <tr key={r.subjectKey} className="border-t border-border">
              <td className="px-2 py-1 font-medium">{r.label}</td>
              <td className="px-2 py-1 text-center text-muted-foreground">{r.coef}</td>
              {r.terms.map((c, i) => (
                <td key={i} className="px-2 py-1 text-center">
                  <span className="font-semibold">{f2(c.moy)}</span>
                  <span className="text-muted-foreground"> / {ord(c.place)}</span>
                </td>
              ))}
              <td className="px-2 py-1 text-center font-bold">{f2(r.moyenneAnnuelle)}</td>
              <td className="px-2 py-1 text-center">{ord(r.classementAnnuel)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-ew-green-600 bg-ew-green-50/50 font-bold">
            <td className="px-2 py-1.5" colSpan={2}>
              Moyenne générale
            </td>
            {general.terms.map((g, i) => (
              <td key={i} className="px-2 py-1.5 text-center">
                {f2(g.moy)} / {ord(g.rang)}
              </td>
            ))}
            <td className="px-2 py-1.5 text-center">{f2(general.annuel.moy)}</td>
            <td className="px-2 py-1.5 text-center">{ord(general.annuel.rang)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------- Liste éditable ---------------------------- */
function ListEditor<T extends object>({
  rows,
  columns,
  empty,
  canEdit,
  onChange,
}: {
  rows: T[];
  columns: { key: keyof T; label: string; multiline?: boolean }[];
  empty: T;
  canEdit: boolean;
  onChange: (rows: T[]) => void;
}) {
  const update = (i: number, key: keyof T, v: string) => {
    const next = rows.map((r, j) => (j === i ? ({ ...r, [key]: v } as T) : r));
    onChange(next);
  };
  const add = () => onChange([...rows, { ...empty }]);
  const remove = (i: number) => onChange(rows.filter((_, j) => j !== i));

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-xs italic text-muted-foreground">
          Aucune ligne. {canEdit ? "Cliquez sur « Ajouter » pour saisir une entrée." : ""}
        </p>
      ) : (
        rows.map((row, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {columns.map((c) => (
                <div key={String(c.key)} className={cn(c.multiline && "sm:col-span-2")}>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {c.label}
                  </p>
                  <EditableText
                    value={String(row[c.key] ?? "")}
                    onCommit={(v) => update(i, c.key, v)}
                    disabled={!canEdit}
                    multiline={c.multiline}
                  />
                </div>
              ))}
            </div>
            {canEdit ? (
              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="ghost" onClick={() => remove(i)}>
                  <Trash2 className="h-3.5 w-3.5" /> Retirer
                </Button>
              </div>
            ) : null}
          </div>
        ))
      )}
      {canEdit ? (
        <Button size="sm" variant="outline" onClick={add}>
          <Plus className="h-4 w-4" /> Ajouter
        </Button>
      ) : null}
    </div>
  );
}

function NotApplicable({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm italic text-muted-foreground">
      {children}
    </p>
  );
}

/* ----------------------- Bloc appréciations & décision --------------------- */
function AppreciationEditor({
  data,
  canWrite,
  canManage,
  save,
}: {
  data: LivretResolved;
  canWrite: boolean;
  canManage: boolean;
  save: (patch: Parameters<ReturnType<typeof useStore>["upsertLivretOverrides"]>[2]) => void;
}) {
  const ap = data.appreciation;
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <ReadField label="Moyenne générale annuelle" value={f2(ap.moyenneGeneraleAnnuelle) + " /20"} />
        <ReadField label="Classement général annuel" value={ord(ap.classementGeneralAnnuel)} />
      </div>

      <EditField
        label="Appréciations des professeurs"
        value={ap.appreciationProfesseurs}
        canEdit={canWrite}
        multiline
        onCommit={(v) => save({ appreciation: { appreciationProfesseurs: v } })}
      />
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <EditField
          label="Observation du professeur principal"
          value={ap.observationProfPrincipal}
          canEdit={canWrite}
          multiline
          onCommit={(v) => save({ appreciation: { observationProfPrincipal: v } })}
        />
        <EditField
          label="Date"
          value={ap.dateProfPrincipal}
          canEdit={canWrite}
          onCommit={(v) => save({ appreciation: { dateProfPrincipal: v } })}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <EditField
          label="Visa et observation du chef d'établissement"
          value={ap.visaChef}
          canEdit={canManage}
          hint="chef d'établissement"
          multiline
          onCommit={(v) => save({ appreciation: { visaChef: v } })}
        />
        <EditField
          label="Date"
          value={ap.dateChef}
          canEdit={canManage}
          onCommit={(v) => save({ appreciation: { dateChef: v } })}
        />
      </div>

      <EditField
        label="Décision de fin d'année — Admis(e) en"
        value={ap.decisionAdmisEn}
        canEdit={canManage}
        hint="chef d'établissement"
        onCommit={(v) => save({ appreciation: { decisionAdmisEn: v } })}
      />

      <div>
        <SectionTitle>Distinctions / sanctions en cours d'année</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <EditField label="1er trimestre" value={ap.distinctions.t1} canEdit={canWrite} onCommit={(v) => save({ appreciation: { distinctions: { t1: v } } })} />
          <EditField label="2e trimestre" value={ap.distinctions.t2} canEdit={canWrite} onCommit={(v) => save({ appreciation: { distinctions: { t2: v } } })} />
          <EditField label="3e trimestre" value={ap.distinctions.t3} canEdit={canWrite} onCommit={(v) => save({ appreciation: { distinctions: { t3: v } } })} />
          <EditField label="Mention spéciale" value={ap.distinctions.mentionSpeciale} canEdit={canWrite} onCommit={(v) => save({ appreciation: { distinctions: { mentionSpeciale: v } } })} />
        </div>
      </div>
    </div>
  );
}

/* ================================ Composant ================================ */
export function LivretEditor({
  student,
  meta,
  classmates,
  schoolYear,
}: {
  student: Eleve;
  meta: EtabExportMeta;
  classmates: { id: string }[];
  schoolYear: string;
}) {
  const store = useStore();
  const app = useApp();
  const canWrite = app.can("school_record:write");
  const canManage = app.can("school_record:manage");
  const actor = app.user.displayName;

  const [page, setPage] = React.useState(1);

  const record = React.useMemo(
    () => store.livretRecords.find((r) => r.studentId === student.id && r.schoolYear === schoolYear),
    [store.livretRecords, student.id, schoolYear],
  );
  const data = React.useMemo<LivretResolved>(() => {
    const computed = computeLivret({ student, meta, grades: store.livretGrades, classmates, schoolYear });
    return resolveLivret(computed, record?.overrides);
  }, [student, meta, store.livretGrades, classmates, schoolYear, record]);

  // Accumulateur SYNCHRONE des overrides pour le write-through serveur : évite
  // de fusionner sur un `record` mémoïsé périmé si deux champs sont sauvegardés
  // avant un re-render (le store, lui, fusionne déjà sur l'état frais).
  const pendingRef = React.useRef<LivretOverrides | undefined>(record?.overrides);
  React.useEffect(() => {
    pendingRef.current = record?.overrides;
  }, [record]);

  const save = React.useCallback(
    (patch: LivretOverrides) => {
      store.upsertLivretOverrides(student.id, schoolYear, patch, actor);
      // Write-through Supabase (mode réel) : persiste les overrides COMPLETS
      // fusionnés (depuis l'accumulateur frais), pour un partage durable.
      if (isSupabaseConfigured()) {
        const merged = mergeLivretOverrides(pendingRef.current, patch);
        pendingRef.current = merged;
        void upsertLivretRecord(createClient(), student.id, schoolYear, merged, actor).then((res) => {
          if (!res.ok) {
            toast.error("Livret enregistré localement, mais échec de la synchro en ligne.", {
              id: "livret-online-error",
            });
          }
        });
      }
    },
    [store, student.id, schoolYear, actor],
  );

  const cur = PAGES.find((p) => p.num === page) ?? PAGES[0];
  const cycle = data.cycle;
  const e = data.etab;
  const id = data.identity;

  return (
    <div className="space-y-4">
      {/* Barre d'état + navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3">
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4 text-ew-green-700" />
          <span className="font-semibold text-foreground">
            {id.nom} {id.prenoms}
          </span>
          <Badge tone="green">{id.className}</Badge>
          <Badge tone="blue">{cycle === 1 ? "1er cycle" : "2e cycle"}</Badge>
          <span className="text-muted-foreground">· {schoolYear}</span>
        </div>
        <div className="flex items-center gap-2">
          {canWrite || canManage ? (
            <Badge tone="green">
              <Pencil className="mr-1 inline h-3 w-3" /> Édition autorisée
            </Badge>
          ) : (
            <span className="inline-flex items-center rounded-md border border-border bg-muted/40 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              <Lock className="mr-1 inline h-3 w-3" /> Lecture seule
            </span>
          )}
          {record && (canWrite || canManage) ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (window.confirm("Réinitialiser ce livret à l'auto-remplissage ? Les champs édités seront effacés.")) {
                  store.resetLivretOverrides(student.id, schoolYear);
                  pendingRef.current = undefined;
                  if (isSupabaseConfigured()) {
                    void deleteLivretRecord(createClient(), student.id, schoolYear).then((ok) => {
                      if (!ok) toast.error("Réinitialisé localement, mais échec côté serveur.", { id: "livret-online-error" });
                    });
                  }
                }
              }}
            >
              <RotateCcw className="h-4 w-4" /> Réinitialiser à l'auto
            </Button>
          ) : null}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center gap-1.5">
        {PAGES.map((p) => (
          <button
            key={p.num}
            type="button"
            onClick={() => setPage(p.num)}
            className={cn(
              "h-7 w-7 rounded-md border text-xs font-semibold",
              p.num === page
                ? "border-ew-green-600 bg-ew-green-600 text-white"
                : "border-border bg-background text-muted-foreground hover:bg-muted/30",
            )}
            title={p.title}
          >
            {p.num}
          </button>
        ))}
      </div>

      {/* En-tête de page */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold" style={{ color: GREEN }}>
          Page {cur.num}/13 — {cur.title}
        </h2>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft className="h-4 w-4" /> Précédente
          </Button>
          <Button size="sm" variant="outline" disabled={page >= 13} onClick={() => setPage((p) => Math.min(13, p + 1))}>
            Suivante <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Contenu de page */}
      <div className="rounded-xl border border-border p-4">
        {/* PAGE 1 — Couverture */}
        {page === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadField label="République / Officiel" value={e.official} />
            <ReadField label="Ministère" value={e.ministry} />
            <ReadField label="Devise" value={e.slogan} />
            <ReadField label="Année scolaire" value={e.schoolYear} />
            <ReadField label="Établissement" value={e.institution} />
            <ReadField label="Direction régionale" value={e.regionalDirection} />
            <ReadField label="Localité" value={e.locality} />
            <ReadField label="Code établissement" value={e.code} />
            <ReadField label="N° matricule (élève)" value={id.matricule} />
            <ReadField label="Nom de l'élève" value={`${id.nom} ${id.prenoms}`} />
            <ReadField label="Date de naissance" value={fmtDate(id.dateNaissance)} />
            <p className="text-xs italic text-muted-foreground sm:col-span-2">
              Ces champs proviennent de la configuration de l'établissement (logo, cachet, signature inclus dans
              l'export) et du dossier de l'élève. Modifiez-les dans Paramétrage → Configuration.
            </p>
          </div>
        )}

        {/* PAGE 2 — Identité détaillée */}
        {page === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadField label="Nom" value={id.nom} />
            <ReadField label="Prénoms" value={id.prenoms} />
            <ReadField label="Sexe" value={id.sexe === "M" ? "Masculin" : "Féminin"} />
            <ReadField label="Date de naissance" value={fmtDate(id.dateNaissance)} />
            <EditField
              label="Lieu de naissance"
              value={id.lieuNaissance}
              canEdit={canWrite}
              onCommit={(v) => save({ identity: { lieuNaissance: v } })}
            />
            <EditField
              label="Nationalité"
              value={id.nationalite}
              canEdit={canWrite}
              onCommit={(v) => save({ identity: { nationalite: v } })}
            />
            <ReadField label="Matricule" value={id.matricule} />
            <ReadField label="Classe" value={id.className} />
            <EditField
              label="Série / Option"
              value={id.serie}
              canEdit={canWrite}
              onCommit={(v) => save({ identity: { serie: v } })}
            />
          </div>
        )}

        {/* PAGE 3 — Instructions (statique) */}
        {page === 3 && (
          <div className="space-y-2 text-sm text-foreground">
            <SectionTitle>Instructions</SectionTitle>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Page 4 : Observations diverses (suivi médical) s'il y a lieu.</li>
              <li>Page 5 : Adresse des parents ou tuteurs, à remplir à chaque année scolaire.</li>
              <li>Pages 6 à 7 : 1er Cycle (notes, appréciations et décision).</li>
              <li>Pages 8 à 9 : 2e Cycle (notes, appréciations et décision).</li>
              <li>Pages 10 à 11 : Inscriptions des établissements successifs.</li>
              <li>Page 12 : Inscription des diplômes obtenus.</li>
            </ul>
            <p className="text-xs italic text-muted-foreground">
              Page informative ; aucune saisie élève obligatoire. Le livret est un gabarit propre et extensible.
            </p>
          </div>
        )}

        {/* PAGE 4 — Observations médicales */}
        {page === 4 && (
          <div className="space-y-4">
            <SectionTitle>Observations diverses (suivi médical)</SectionTitle>
            {data.medicalStages.map((m, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <p className="mb-2 text-sm font-bold text-foreground">{m.classe}</p>
                <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
                  <IdentityPhotoUpload
                    label={`Photo — ${m.classe}`}
                    value={m.photo}
                    disabled={!canWrite}
                    onChange={(v) => save({ medicalStages: { [i]: { photo: v } } })}
                  />
                  <EditField
                    label="Observation du médecin (s'il y a lieu)"
                    value={m.observationMedecin}
                    canEdit={canWrite}
                    multiline
                    onCommit={(v) => save({ medicalStages: { [i]: { observationMedecin: v } } })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGE 5 — Adresses parents */}
        {page === 5 && (
          <div className="space-y-2">
            <SectionTitle>Adresse des parents ou tuteurs</SectionTitle>
            <p className="text-xs italic text-muted-foreground">À remplir à chaque année scolaire. Toute adresse doit être complète.</p>
            <ListEditor<LivretParentBlock>
              rows={data.parents}
              canEdit={canWrite}
              empty={{ annee: schoolYear, nom: "", adresse: "", telBureau: "", telDomicile: "" }}
              columns={[
                { key: "annee", label: "Année" },
                { key: "nom", label: "Nom" },
                { key: "adresse", label: "Adresse", multiline: true },
                { key: "telBureau", label: "Tél. bureau" },
                { key: "telDomicile", label: "Tél. domicile" },
              ]}
              onChange={(rows) => save({ parents: rows })}
            />
          </div>
        )}

        {/* PAGE 6 — Notes 1er cycle */}
        {page === 6 &&
          (cycle === 1 ? (
            <NotesTable data={data} />
          ) : (
            <NotApplicable>L'élève est en 2e cycle — voir la page 8 (Notes 2e Cycle).</NotApplicable>
          ))}

        {/* PAGE 7 — Appréciations 1er cycle */}
        {page === 7 &&
          (cycle === 1 ? (
            <AppreciationEditor data={data} canWrite={canWrite} canManage={canManage} save={save} />
          ) : (
            <NotApplicable>L'élève est en 2e cycle — voir la page 9.</NotApplicable>
          ))}

        {/* PAGE 8 — Notes 2e cycle */}
        {page === 8 &&
          (cycle === 2 ? (
            <NotesTable data={data} />
          ) : (
            <NotApplicable>L'élève est en 1er cycle — voir la page 6 (Notes 1er Cycle).</NotApplicable>
          ))}

        {/* PAGE 9 — Appréciations 2e cycle */}
        {page === 9 &&
          (cycle === 2 ? (
            <AppreciationEditor data={data} canWrite={canWrite} canManage={canManage} save={save} />
          ) : (
            <NotApplicable>L'élève est en 1er cycle — voir la page 7.</NotApplicable>
          ))}

        {/* PAGE 10 — Établissements successifs A */}
        {page === 10 && (
          <div className="space-y-2">
            <SectionTitle>Inscriptions des établissements successifs</SectionTitle>
            <ListEditor<LivretEtabSuccessif>
              rows={data.etabSuccessifs}
              canEdit={canWrite}
              empty={{ anneeScolaire: "", classe: "", moyenneAnnuelle: "", nomEtablissement: "", observations: "" }}
              columns={[
                { key: "anneeScolaire", label: "Année scolaire" },
                { key: "classe", label: "Classe" },
                { key: "moyenneAnnuelle", label: "Moyenne annuelle" },
                { key: "nomEtablissement", label: "Nom de l'établissement" },
                { key: "observations", label: "Observations du Directeur / Prof. principal", multiline: true },
              ]}
              onChange={(rows) => save({ etabSuccessifs: rows })}
            />
          </div>
        )}

        {/* PAGE 11 — Établissements successifs B (suite) */}
        {page === 11 && (
          <NotApplicable>
            Page B — suite du tableau des établissements successifs. Les lignes saisies en page 10 constituent un
            historique unique ; la pagination A/B est restituée à l'export (Lot 3).
          </NotApplicable>
        )}

        {/* PAGE 12 — Diplômes */}
        {page === 12 && (
          <div className="space-y-2">
            <SectionTitle>Diplômes obtenus</SectionTitle>
            <ListEditor<LivretDiplome>
              rows={data.diplomes}
              canEdit={canWrite}
              empty={{ etablissement: "", anneeScolaire: "", appreciationPresidentJury: "" }}
              columns={[
                { key: "etablissement", label: "Établissement" },
                { key: "anneeScolaire", label: "Année scolaire" },
                { key: "appreciationPresidentJury", label: "Appréciation du président du jury", multiline: true },
              ]}
              onChange={(rows) => save({ diplomes: rows })}
            />
          </div>
        )}

        {/* PAGE 13 — Extension */}
        {page === 13 && (
          <div className="space-y-2">
            <SectionTitle>Page d'extension du livret</SectionTitle>
            <EditField
              label="Observations complémentaires"
              value={data.extension.observationsComplementaires}
              canEdit={canWrite}
              multiline
              onCommit={(v) => save({ extension: { observationsComplementaires: v } })}
            />
            <p className="text-xs italic text-muted-foreground">Le cachet et la signature sont apposés à l'export.</p>
          </div>
        )}

        {/* Aide contextuelle */}
        {!canWrite && !canManage ? (
          <p className="mt-4 flex items-center gap-1.5 text-xs italic text-muted-foreground">
            <Lock className="h-3 w-3" /> Vous consultez le livret en lecture seule. L'édition des observations est
            réservée aux enseignants, chefs d'établissement et administrateurs.
          </p>
        ) : null}
      </div>
    </div>
  );
}
