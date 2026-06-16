import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn, formatDateShort } from "@/lib/utils";
import type { AuditEntry, Recommendation } from "@/lib/types";

/* ----------------------- Attendance heatmap ----------------------- */
function heatColor(v: number): string {
  if (v === 0) return "bg-slate-100 text-slate-300";
  if (v >= 96) return "bg-ew-green-700 text-white";
  if (v >= 92) return "bg-ew-green-600 text-white";
  if (v >= 88) return "bg-ew-green-100 text-ew-green-800";
  if (v >= 84) return "bg-ew-gold-100 text-ew-gold-600";
  return "bg-red-400 text-white";
}

export function AttendanceHeatmap({
  data,
}: {
  data: { days: string[]; slots: string[]; values: number[][] };
}) {
  return (
    <div className="overflow-x-auto">
      {/* Tuiles compactes et fluides : taille auto-adaptée à la largeur (responsive),
          plafonnée pour ne pas grossir sur les grands écrans. */}
      <div
        className="grid gap-1 sm:gap-1.5"
        style={{ gridTemplateColumns: "clamp(52px,11vw,72px) repeat(6, minmax(0, clamp(34px,7vw,52px)))" }}
      >
        <div />
        {data.slots.map((s) => (
          <div key={s} className="text-center text-[10px] font-semibold text-muted-foreground sm:text-[11px]">
            {s}
          </div>
        ))}
        {data.days.map((day, di) => (
          <div key={day} className="contents">
            <div className="flex items-center text-[10px] font-semibold text-muted-foreground sm:text-[11px]">{day}</div>
            {data.values[di].map((v, si) => (
              <div
                key={si}
                title={`${day} ${data.slots[si]} — ${v === 0 ? "Pas de cours" : `${v}% présents`}`}
                className={cn(
                  "flex aspect-square items-center justify-center rounded text-[10px] font-bold sm:rounded-md sm:text-[11px]",
                  heatColor(v),
                )}
              >
                {v === 0 ? "—" : v}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-ew-green-700" /> ≥ 96 %
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-ew-gold-100" /> 84–88 %
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-red-400" /> &lt; 84 %
        </span>
      </div>
    </div>
  );
}

/* --------------------- Recommendation tracker --------------------- */
const PRIORITY: Record<string, { label: string; tone: "red" | "gold" | "slate" }> = {
  high: { label: "Priorité haute", tone: "red" },
  medium: { label: "Priorité moyenne", tone: "gold" },
  low: { label: "Priorité basse", tone: "slate" },
};

export function RecommendationTracker({ items }: { items: Recommendation[] }) {
  return (
    <div className="space-y-3">
      {items.map((rec) => (
        <div key={rec.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{rec.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{rec.description}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <StatusBadge status={rec.status} />
              <Badge tone={PRIORITY[rec.priority].tone}>{PRIORITY[rec.priority].label}</Badge>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Progress
              value={rec.progress}
              indicatorClassName={rec.status === "overdue" ? "bg-red-500" : undefined}
              className="flex-1"
            />
            <span className="w-10 text-right text-sm font-bold text-foreground">{rec.progress}%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Responsable : {rec.assignedTo}</span>
            <span>Échéance : {formatDateShort(rec.dueDate)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------- Audit timeline ------------------------- */
const SEVERITY = {
  info: { icon: Info, cls: "bg-blue-50 text-blue-600" },
  warning: { icon: AlertTriangle, cls: "bg-ew-gold-100 text-ew-gold-600" },
  critical: { icon: ShieldAlert, cls: "bg-red-50 text-red-600" },
} as const;

export function AuditTimeline({ entries }: { entries: AuditEntry[] }) {
  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {entries.map((e) => {
        const sev = SEVERITY[e.severity];
        const Icon = sev.icon;
        return (
          <li key={e.id} className="relative">
            <span
              className={cn(
                "absolute -left-[34px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-background",
                sev.cls,
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-foreground">{e.action}</p>
              <time className="text-xs text-muted-foreground">
                {new Date(e.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </time>
            </div>
            <p className="text-sm text-muted-foreground">
              {e.actor} · {e.entityType}
            </p>
            {e.metadata && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {Object.entries(e.metadata).map(([k, v]) => (
                  <span key={k} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    {k}: <span className="font-semibold text-foreground">{String(v)}</span>
                  </span>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
