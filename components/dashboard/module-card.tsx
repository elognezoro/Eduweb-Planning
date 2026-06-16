import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KpiTone } from "./kpi-card";

const TONE_CLASSES: Record<KpiTone, string> = {
  green: "bg-ew-green-100 text-ew-green-700",
  gold: "bg-ew-gold-100 text-ew-gold-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  red: "bg-red-50 text-red-600",
  teal: "bg-cyan-50 text-cyan-600",
  slate: "bg-slate-100 text-slate-600",
};

interface ModuleCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone?: KpiTone;
}

/** Carte module cliquable (page d'accueil). */
export function ModuleCard({ href, title, description, icon: Icon, tone = "green" }: ModuleCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", TONE_CLASSES[tone])}>
            <Icon className="h-5 w-5" />
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
        <h3 className="mt-4 font-bold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </Card>
    </Link>
  );
}

interface ActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  tone?: KpiTone;
  onClick?: () => void;
  href?: string;
}

/** Carte d'action rapide (bouton riche). */
export function ActionCard({ title, description, icon: Icon, tone = "green", onClick, href }: ActionCardProps) {
  const content = (
    <Card className="flex items-center gap-3 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", TONE_CLASSES[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-foreground">{title}</p>
        {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
      </div>
    </Card>
  );
  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className="block w-full">
      {content}
    </button>
  );
}
