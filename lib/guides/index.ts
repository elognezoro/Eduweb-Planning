import type { GuideContent } from "@/components/guides/guide-layout";
import { guideAdmin } from "./admin";
import { guideChefEtablissement } from "./chef_etablissement";
import { guideEnseignant } from "./enseignant";
import { guideEducateur } from "./educateur";
import { guideEleve } from "./eleve";
import { guideParent } from "./parent";
import { guideInspecteur } from "./inspecteur";
import { guideConseillerPedagogique } from "./conseiller_pedagogique";

export const GUIDES: Record<string, Omit<GuideContent, "icon">> = {
  admin: guideAdmin,
  chef_etablissement: guideChefEtablissement,
  enseignant: guideEnseignant,
  educateur: guideEducateur,
  eleve: guideEleve,
  parent: guideParent,
  inspecteur: guideInspecteur,
  conseiller_pedagogique: guideConseillerPedagogique,
};

export const GUIDE_KEYS = Object.keys(GUIDES) as Array<keyof typeof GUIDES>;
