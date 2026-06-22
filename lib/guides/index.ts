import type { GuideContent } from "@/components/guides/guide-layout";
import { guideAdmin } from "./admin";
import { guideChefEtablissement } from "./chef_etablissement";
import { guideEnseignant } from "./enseignant";
import { guideEducateur } from "./educateur";
import { guideEleve } from "./eleve";
import { guideParent } from "./parent";
import { guideInspecteur } from "./inspecteur";
import { guideConseillerPedagogique } from "./conseiller_pedagogique";
import { guideCafopAdmin } from "./cafop_admin";
import { guideCafopDirecteur } from "./cafop_directeur";
import { guideCafopProfesseur } from "./cafop_professeur";
import { guideApfcAdmin } from "./apfc_admin";
import { guideChefAntenne } from "./chef_antenne";
import { guideTransportChauffeur } from "./transport_chauffeur";

export const GUIDES: Record<string, Omit<GuideContent, "icon">> = {
  admin: guideAdmin,
  chef_etablissement: guideChefEtablissement,
  enseignant: guideEnseignant,
  educateur: guideEducateur,
  eleve: guideEleve,
  parent: guideParent,
  inspecteur: guideInspecteur,
  conseiller_pedagogique: guideConseillerPedagogique,
  cafop_admin: guideCafopAdmin,
  cafop_directeur: guideCafopDirecteur,
  cafop_professeur: guideCafopProfesseur,
  apfc_admin: guideApfcAdmin,
  chef_antenne: guideChefAntenne,
  transport_chauffeur: guideTransportChauffeur,
};

export const GUIDE_KEYS = Object.keys(GUIDES) as Array<keyof typeof GUIDES>;
