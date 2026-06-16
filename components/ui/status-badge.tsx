import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  CircleDot,
  Archive,
  CalendarClock,
  Loader2,
  CheckCheck,
  Ban,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "./badge";
import type { BadgeTone } from "@/lib/roles";

interface StatusInfo {
  label: string;
  tone: BadgeTone | "outline";
  icon: LucideIcon;
}

/** Dictionnaire centralisé : code de statut → libellé FR + couleur + icône. */
const STATUS_MAP: Record<string, StatusInfo> = {
  // Comptes
  active: { label: "Actif", tone: "green", icon: CheckCircle2 },
  pending: { label: "En attente", tone: "gold", icon: Clock },
  suspended: { label: "Suspendu", tone: "red", icon: Ban },
  archived: { label: "Archivé", tone: "slate", icon: Archive },
  // Présence
  present: { label: "Présent", tone: "green", icon: CheckCircle2 },
  absent: { label: "Absent", tone: "red", icon: XCircle },
  late: { label: "En retard", tone: "gold", icon: Clock },
  excused: { label: "Excusé", tone: "blue", icon: CircleDot },
  // Inspection / activités
  planned: { label: "Planifiée", tone: "blue", icon: CalendarClock },
  in_progress: { label: "En cours", tone: "gold", icon: Loader2 },
  completed: { label: "Terminée", tone: "green", icon: CheckCheck },
  cancelled: { label: "Annulée", tone: "slate", icon: Ban },
  // Recommandations
  open: { label: "Ouverte", tone: "blue", icon: CircleDot },
  done: { label: "Réalisée", tone: "green", icon: CheckCheck },
  overdue: { label: "En retard", tone: "red", icon: AlertTriangle },
  // Paiements
  paid: { label: "Payé", tone: "green", icon: CheckCircle2 },
  failed: { label: "Échec", tone: "red", icon: XCircle },
  // SMS
  delivered: { label: "Délivré", tone: "green", icon: CheckCircle2 },
  queued: { label: "En file", tone: "slate", icon: Clock },
  // Cahier de texte
  draft: { label: "Brouillon", tone: "slate", icon: CircleDot },
  published: { label: "Publié", tone: "green", icon: Send },
  // RDV
  confirmed: { label: "Confirmé", tone: "green", icon: CheckCircle2 },
  convocation: { label: "Convocation", tone: "blue", icon: CalendarClock },
};

interface StatusBadgeProps {
  status: string;
  label?: string;
}

/** Badge d'état avec icône + texte (jamais la couleur seule — accessibilité). */
export function StatusBadge({ status, label }: StatusBadgeProps) {
  const info = STATUS_MAP[status] ?? { label: status, tone: "slate" as const, icon: CircleDot };
  const Icon = info.icon;
  return (
    <Badge tone={info.tone}>
      <Icon className="h-3 w-3" />
      {label ?? info.label}
    </Badge>
  );
}
