"use client";

import * as React from "react";
import { FileDown } from "lucide-react";
import { useApp } from "@/components/app-shell/app-context";
import { useFormationRole } from "@/components/formations/use-formation-role";
import { etabExportMeta } from "@/lib/etab-config";
import { buildSeminarContentPayload } from "@/lib/seminaires/comm-seminar-pdf";
import type { CommSeminaire } from "@/lib/seminaires/communication-pastorale";

/**
 * Bouton « Version PDF (sans corrigé) » du contenu d'une formation.
 *
 * RÉSERVÉ : visible uniquement si l'utilisateur est, POUR CE COURS, admin /
 * enseignant / tuteur (égalité stricte — exclut volontairement gestionnaire et
 * étudiant). L'admin applicatif/super-admin ressort « admin » via useFormationRole.
 * Le PDF est généré côté client (jsPDF) à partir d'un mapper par liste blanche
 * qui n'inclut AUCUN corrigé. Polices +2 pt (fontBump).
 */
export function SeminarPdfButton({
  courseId,
  seminaire,
  className,
}: {
  courseId: string;
  seminaire: CommSeminaire;
  className?: string;
}) {
  const app = useApp();
  const role = useFormationRole(courseId);
  const allowed = role === "admin" || role === "enseignant" || role === "tuteur";
  const [busy, setBusy] = React.useState(false);

  if (!allowed) return null;

  async function download() {
    if (busy) return;
    setBusy(true);
    try {
      const { downloadReportPdf } = await import("@/lib/exports/pdf");
      const payload = buildSeminarContentPayload(
        seminaire,
        etabExportMeta(),
        app.user.displayName,
        new Date().toLocaleDateString("fr-FR"),
      );
      await downloadReportPdf(payload, `support-${seminaire.meta.slug}.pdf`, { fontBump: 2 });
    } catch {
      // best-effort : échec silencieux de génération (jsPDF), pas d'état cassé.
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={busy}
      title="Réservé : admin, enseignant, tuteur. Contenu sans corrigé."
      className={
        className ??
        "inline-flex items-center gap-2 rounded-lg border border-ew-green-700 bg-card px-4 py-2 text-sm font-semibold text-ew-green-700 transition-colors hover:bg-ew-green-50 disabled:opacity-60"
      }
    >
      <FileDown className="h-4 w-4" /> {busy ? "Génération…" : "Version PDF (sans corrigé)"}
    </button>
  );
}
