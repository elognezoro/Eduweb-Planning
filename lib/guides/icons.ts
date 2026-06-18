import type { LucideIcon } from "lucide-react";
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  Heart,
  SearchCheck,
  Sparkles,
} from "lucide-react";

/** Icône Lucide associée à chaque guide de rôle (utilisée dans l'en-tête + l'index). */
export const GUIDE_ICONS: Record<string, LucideIcon> = {
  admin: ShieldCheck,
  chef_etablissement: Building2,
  enseignant: GraduationCap,
  educateur: Users,
  eleve: BookOpen,
  parent: Heart,
  inspecteur: SearchCheck,
  conseiller_pedagogique: Sparkles,
};
