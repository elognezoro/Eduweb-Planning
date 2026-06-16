import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KpiTone = "green" | "gold" | "blue" | "purple" | "red" | "teal" | "slate";

const TONE_CLASSES: Record<KpiTone, string> = {
  green: "bg-ew-green-100 text-ew-green-700",
  gold: "bg-ew-gold-100 text-ew-gold-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  red: "bg-red-50 text-red-600",
  teal: "bg-cyan-50 text-cyan-600",
  slate: "bg-slate-100 text-slate-600",
};

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: KpiTone;
  delta?: number;
  hint?: string;
}

/** Carte d'indicateur clé (KPI) avec pastille d'icône et variation. */
export function KpiCard({ label, value, icon: Icon, tone = "green", delta, hint }: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="ew-fade-in p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
        </div>
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", TONE_CLASSES[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {(delta !== undefined || hint) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {delta !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold",
                positive ? "bg-ew-green-100 text-ew-green-700" : "bg-red-50 text-red-600",
              )}
            >
              {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {positive ? "+" : ""}
              {delta}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </Card>
  );
}
