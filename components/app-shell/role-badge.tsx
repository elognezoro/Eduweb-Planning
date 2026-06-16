import { Badge } from "@/components/ui/badge";
import { getRole } from "@/lib/roles";
import type { UserRole } from "@/lib/roles";

/** Badge du rôle, couleur dérivée de la définition centralisée des rôles. */
export function RoleBadge({ role, short = false }: { role: UserRole; short?: boolean }) {
  const def = getRole(role);
  return <Badge tone={def.tone}>{short ? def.shortLabel : def.label}</Badge>;
}
