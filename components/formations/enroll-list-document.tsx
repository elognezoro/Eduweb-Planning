import * as React from "react";
import type { EtabExportMeta } from "@/lib/etab-config";

/* ============================================================================
   DOCUMENT IMPRIMABLE — LISTE DES INSCRITS À UNE / DES FORMATION(S)
   ----------------------------------------------------------------------------
   PROTOCOLE D'ÉDITION (structure normalisée d'une liste d'inscrits) :

   1. EN-TÊTE INSTITUTIONNEL (par cours)
        · Colonne gauche : établissement éditeur + direction régionale + ministère.
        · Colonne droite : République + devise + emblème national (armoiries/drapeau).
   2. TITRE       : « LISTE DES INSCRITS ».
   3. SOUS-TITRE  : intitulé du cours + type (séminaire / manuel / guides) + année scolaire.
   4. MÉTA        : effectif total, date d'édition, édité par (nom de l'agent).
   5. TABLEAU NOMINATIF (trié par nom) :
        N° · Nom & prénoms · Rôle · Rôle dans la formation · Source · Inscrit le · Expire.
   6. PIED        : récapitulatif d'effectif + « Fait à …, le … » + zone cachet/signature.
   7. MULTI-COURS : une section par cours, saut de page entre les sections ;
                    chaque section est autoportante (en-tête + titre + tableau + pied).

   Rendu A4 portrait via window.print() (conteneur #enroll-list-print révélé par
   le bloc @media print de globals.css). Aucune dépendance serveur.
   ========================================================================== */

export interface EnrollListRow {
  name: string;
  role: string;
  formationRole: string;
  source: string;
  enrolledAt: string;
  expiresAt: string | null;
}

export interface EnrollListSection {
  courseTitle: string;
  courseType: string;
  rows: EnrollListRow[];
}

export function EnrollListPrintDocument({
  sections,
  meta,
  editedBy,
  editedAt,
}: {
  sections: EnrollListSection[];
  meta: EtabExportMeta;
  editedBy: string;
  editedAt: string;
}) {
  return (
    <div id="enroll-list-print" aria-hidden>
      {sections.map((section, idx) => (
        <section className="enroll-list-page" key={`${section.courseTitle}-${idx}`}>
          {/* 1. En-tête institutionnel */}
          <div className="enroll-list-header">
            <div className="enroll-list-header-col">
              {meta.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.logo} alt="" className="enroll-list-logo" />
              ) : null}
              <p className="enroll-list-strong">{meta.institution}</p>
              {meta.regionalDirection ? <p>{meta.regionalDirection}</p> : null}
              {meta.ministry ? <p>{meta.ministry}</p> : null}
            </div>
            <div className="enroll-list-header-col enroll-list-header-right">
              <p className="enroll-list-strong">{meta.official}</p>
              {meta.slogan ? <p className="enroll-list-italic">{meta.slogan}</p> : null}
              {meta.nationalEmblem ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.nationalEmblem} alt="" className="enroll-list-emblem" />
              ) : null}
            </div>
          </div>

          {/* 2-3. Titre + sous-titre */}
          <h1 className="enroll-list-title">LISTE DES INSCRITS</h1>
          <p className="enroll-list-subtitle">
            {section.courseTitle} <span className="enroll-list-kind">({section.courseType})</span>
          </p>

          {/* 4. Métadonnées */}
          <div className="enroll-list-meta">
            <span>Année scolaire : {meta.schoolYear}</span>
            <span>Effectif : {section.rows.length} inscrit·e·s</span>
            <span>Édité le {editedAt}</span>
          </div>

          {/* 5. Tableau nominatif */}
          <table className="enroll-list-table">
            <thead>
              <tr>
                <th>N°</th>
                <th>Nom &amp; prénoms</th>
                <th>Rôle</th>
                <th>Rôle formation</th>
                <th>Source</th>
                <th>Inscrit·e le</th>
                <th>Expire</th>
              </tr>
            </thead>
            <tbody>
              {section.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="enroll-list-empty">
                    Aucun inscrit pour ce cours.
                  </td>
                </tr>
              ) : (
                section.rows.map((r, i) => (
                  <tr key={`${r.name}-${i}`}>
                    <td>{i + 1}</td>
                    <td>{r.name}</td>
                    <td>{r.role}</td>
                    <td>{r.formationRole}</td>
                    <td>{r.source}</td>
                    <td>{r.enrolledAt}</td>
                    <td>{r.expiresAt ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* 6. Pied : récapitulatif + signature/cachet */}
          <div className="enroll-list-footer">
            <p>
              Total : <strong>{section.rows.length}</strong> inscrit·e·s — édité par {editedBy}.
            </p>
            <div className="enroll-list-sign">
              <p>
                Fait à {meta.locality || "…"}, le {editedAt}
              </p>
              <p className="enroll-list-sign-label">Le responsable</p>
              {meta.signature ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.signature} alt="" className="enroll-list-signimg" />
              ) : null}
              {meta.stamp ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.stamp} alt="" className="enroll-list-stamp" />
              ) : null}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
