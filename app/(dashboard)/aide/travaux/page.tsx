"use client";

import * as React from "react";
import { ClipboardList, RefreshCw, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFormationRole } from "@/components/formations/use-formation-role";
import { isFacilitatorRole } from "@/lib/formations/formation-roles";
import {
  fetchCourseMatrix,
  fetchCourseProductions,
  type SeminarProductionRow,
} from "@/lib/seminaires/productions-server";
import type { MatrixSubmission } from "@/components/app-shell/data-store";

/* ============================================================================
   « Travaux des participants » — vue consolidée par cours (formateur/admin).
   Agrège, par participant, toutes ses productions (matrices + productions
   génériques : sondage/forum/carte mentale/QCM/correction IA/engagement/
   auto-évaluation). La RLS ne renvoie ces données qu'à un facilitateur du cours
   (ou admin) ; un non-facilitateur ne verrait que les siennes → page gardée.
   ========================================================================== */

const COURSES = [
  { id: "communication-pastorale", label: "Communication pastorale" },
  { id: "ia-communication", label: "IA & communication" },
];

const KIND_LABEL: Record<string, string> = {
  poll: "Sondage",
  forum: "Forum",
  mindmap: "Carte mentale",
  qcm: "QCM",
  aicorrection: "Correction IA",
  engagement: "Engagement",
  selfeval: "Auto-évaluation",
};

interface Participant {
  userId: string;
  name: string;
  role?: string;
  matrices: MatrixSubmission[];
  productions: SeminarProductionRow[];
}

function truncate(s: unknown, n = 160): string {
  const t = typeof s === "string" ? s : "";
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

/** Résumé lisible d'une production générique selon son type. */
function summarize(row: SeminarProductionRow): React.ReactNode {
  const p = (row.payload ?? {}) as Record<string, unknown>;
  switch (row.kind) {
    case "poll":
      return <>a voté : <strong>{String(p.value ?? "—")}</strong></>;
    case "forum":
      return <span className="whitespace-pre-line">{truncate(p.content)}</span>;
    case "mindmap":
      return (
        <>
          <em>{String(p.pole ?? "")}/{String(p.category ?? "")}</em> :{" "}
          {truncate(p.content)}
        </>
      );
    case "qcm": {
      const answers = (p.answers ?? {}) as Record<string, unknown>;
      const n = Object.keys(answers).length;
      return (
        <>
          {n} réponse{n > 1 ? "s" : ""} {p.checked ? "· validé" : "· en cours"}
        </>
      );
    }
    case "aicorrection":
      return (
        <div className="space-y-1">
          <div>
            <span className="text-xs font-bold uppercase text-ew-gold-700">Problèmes</span>
            <p className="whitespace-pre-line">{truncate(p.problems) || "—"}</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase text-ew-green-700">Correction</span>
            <p className="whitespace-pre-line">{truncate(p.correction) || "—"}</p>
          </div>
        </div>
      );
    case "engagement": {
      const values = (p.values ?? {}) as Record<string, string>;
      const filled = Object.values(values).filter((v) => (v ?? "").trim()).length;
      return <>{filled} champ{filled > 1 ? "s" : ""} renseigné{filled > 1 ? "s" : ""}</>;
    }
    case "selfeval": {
      const picked = (p.picked ?? {}) as Record<string, number>;
      const n = Object.keys(picked).length;
      return <>{n} compétence{n > 1 ? "s" : ""} auto-évaluée{n > 1 ? "s" : ""}</>;
    }
    default:
      return <span className="text-muted-foreground">{truncate(JSON.stringify(p), 120)}</span>;
  }
}

export default function TravauxParticipantsPage() {
  const [courseId, setCourseId] = React.useState(COURSES[0].id);
  const [loading, setLoading] = React.useState(false);
  const [matrices, setMatrices] = React.useState<MatrixSubmission[]>([]);
  const [productions, setProductions] = React.useState<SeminarProductionRow[]>([]);

  const formationRole = useFormationRole(courseId);
  const canReview = isFacilitatorRole(formationRole);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [m, p] = await Promise.all([
        fetchCourseMatrix(courseId),
        fetchCourseProductions(courseId),
      ]);
      setMatrices(m?.submissions ?? []);
      setProductions(p ?? []);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const participants: Participant[] = React.useMemo(() => {
    const map = new Map<string, Participant>();
    const get = (userId: string, name: string, role?: string) => {
      let p = map.get(userId);
      if (!p) {
        p = { userId, name: name || "—", role, matrices: [], productions: [] };
        map.set(userId, p);
      }
      return p;
    };
    for (const m of matrices) get(m.userId, m.userName, m.userRole).matrices.push(m);
    for (const r of productions) get(r.userId, r.userName, r.userRole).productions.push(r);
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "fr"),
    );
  }, [matrices, productions]);

  const totalProductions = matrices.length + productions.length;

  return (
    <div className="mx-auto max-w-4xl space-y-5 py-2">
      <header className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ew-green-700 text-white">
            <ClipboardList className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground">
              Travaux des participants
            </h1>
            <p className="text-sm text-muted-foreground">
              Toutes les productions d&apos;un séminaire, regroupées par participant.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {COURSES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCourseId(c.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                courseId === c.id
                  ? "border-ew-green-600 bg-ew-green-600 text-white"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
            >
              {c.label}
            </button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
            className="ml-auto"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            {loading ? "Chargement…" : "Rafraîchir"}
          </Button>
        </div>
      </header>

      {!canReview ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
          <Lock className="h-7 w-7 text-ew-gold-600" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Cette vue est réservée aux <strong>formateurs</strong> (administrateur,
            enseignant ou tuteur) du cours. Ton rôle de formation pour «{" "}
            {COURSES.find((c) => c.id === courseId)?.label} » ne le permet pas.
          </p>
        </div>
      ) : participants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm italic text-muted-foreground">
          {loading
            ? "Chargement des travaux…"
            : "Aucune production pour ce séminaire pour le moment. Clique « Rafraîchir » après une séance."}
        </div>
      ) : (
        <>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Users className="h-4 w-4" /> {participants.length} participant
            {participants.length > 1 ? "s" : ""} · {totalProductions} production
            {totalProductions > 1 ? "s" : ""}
          </p>
          <div className="space-y-3">
            {participants.map((p) => (
              <ParticipantCard key={p.userId} p={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ParticipantCard({ p }: { p: Participant }) {
  const [open, setOpen] = React.useState(false);
  // Productions génériques groupées par type.
  const byKind = React.useMemo(() => {
    const g: Record<string, SeminarProductionRow[]> = {};
    for (const r of p.productions) (g[r.kind] ??= []).push(r);
    return g;
  }, [p.productions]);

  const count = p.matrices.length + p.productions.length;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/20"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ew-green-700 px-2.5 py-0.5 text-sm font-bold text-white">
            {p.name}
          </span>
          {p.role ? <Badge tone="blue">{p.role}</Badge> : null}
          <span className="text-xs text-muted-foreground">
            {count} production{count > 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{open ? "−" : "+"}</span>
      </button>

      {open ? (
        <div className="space-y-3 border-t border-border p-4 text-sm">
          {p.matrices.length > 0 ? (
            <section>
              <p className="text-xs font-bold uppercase tracking-wide text-ew-purple-700">
                Matrices ({p.matrices.length})
              </p>
              <ul className="mt-1 space-y-1">
                {p.matrices.map((m) => {
                  const fill = Object.values(m.cells).filter((v) => v && v.trim()).length;
                  const total = m.rowLabels.length * Math.max(0, m.headers.length - 1);
                  return (
                    <li key={m.id} className="text-foreground/90">
                      <span className="font-semibold">{m.activityId}</span> —{" "}
                      {fill}/{total} cellules remplies
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {Object.entries(byKind).map(([kind, rows]) => (
            <section key={kind}>
              <p className="text-xs font-bold uppercase tracking-wide text-ew-green-700">
                {KIND_LABEL[kind] ?? kind} ({rows.length})
              </p>
              <ul className="mt-1 space-y-1.5">
                {rows.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-md border border-border/60 bg-background/40 px-2.5 py-1.5 text-foreground/90"
                  >
                    {summarize(r)}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {p.matrices.length === 0 && p.productions.length === 0 ? (
            <p className="italic text-muted-foreground">Aucune production.</p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
