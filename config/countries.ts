/**
 * Configuration multi-pays.
 * La Côte d'Ivoire est active par défaut mais N'EST PAS codée en dur :
 * tout libellé spécifique (DRENA, CAFOP, APFC, FCFA…) est porté par la config du pays.
 * Ajouter un pays = ajouter une entrée dans `COUNTRIES`.
 */

import { UN_COUNTRIES } from "./un-countries";

export interface AcademicRegionSeed {
  code: string;
  name: string;
}

export interface CountryConfig {
  /** Code ISO 3166-1 alpha-2 */
  code: string;
  iso3: string;
  nameFr: string;
  nameEn: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
  timezone: string;
  defaultLocale: "fr" | "en";
  /** Libellé des régions académiques (ex. « DRENA / DRENAET ») */
  academicRegionLabel: string;
  /** Libellé des centres de formation initiale (ex. « CAFOP ») */
  teacherTrainingCenterLabel: string;
  /** Libellé des antennes de formation continue (ex. « APFC ») */
  continuingTrainingAntennaLabel: string;
  isActive: boolean;
  academicRegions: AcademicRegionSeed[];
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "CI",
    iso3: "CIV",
    nameFr: "Côte d'Ivoire",
    nameEn: "Ivory Coast",
    flag: "🇨🇮",
    currencyCode: "XOF",
    currencySymbol: "FCFA",
    timezone: "Africa/Abidjan",
    defaultLocale: "fr",
    academicRegionLabel: "DRENA / DRENAET",
    teacherTrainingCenterLabel: "CAFOP",
    continuingTrainingAntennaLabel: "APFC",
    isActive: true,
    // Les 41 DRENAET (Directions Régionales de l'Éducation Nationale, de
    // l'Alphabétisation et de l'Enseignement Technique) — source MENA.
    academicRegions: [
      { code: "ABJ1", name: "DRENA Abidjan 1" },
      { code: "ABJ2", name: "DRENA Abidjan 2" },
      { code: "ABJ3", name: "DRENA Abidjan 3" },
      { code: "ABJ4", name: "DRENA Abidjan 4" },
      { code: "ABG", name: "DRENA Abengourou" },
      { code: "ABO", name: "DRENA Aboisso" },
      { code: "ADZ", name: "DRENA Adzopé" },
      { code: "AGB", name: "DRENA Agboville" },
      { code: "BGL", name: "DRENA Bangolo" },
      { code: "BDK", name: "DRENA Bondoukou" },
      { code: "BGN", name: "DRENA Bongouanou" },
      { code: "BKE", name: "DRENA Bouaké 1" },
      { code: "BKE2", name: "DRENA Bouaké 2" },
      { code: "BFL", name: "DRENA Bouaflé" },
      { code: "BNA", name: "DRENA Bouna" },
      { code: "BDL", name: "DRENA Boundiali" },
      { code: "DAB", name: "DRENA Dabou" },
      { code: "DAL", name: "DRENA Daloa" },
      { code: "DNN", name: "DRENA Danané" },
      { code: "DKO", name: "DRENA Daoukro" },
      { code: "DBK", name: "DRENA Dimbokro" },
      { code: "DIV", name: "DRENA Divo" },
      { code: "DKE", name: "DRENA Duékoué" },
      { code: "FER", name: "DRENA Ferkessédougou" },
      { code: "GAG", name: "DRENA Gagnoa" },
      { code: "GBS", name: "DRENA Grand-Bassam" },
      { code: "GUI", name: "DRENA Guiglo" },
      { code: "ISS", name: "DRENA Issia" },
      { code: "KAT", name: "DRENA Katiola" },
      { code: "KOR", name: "DRENA Korhogo" },
      { code: "MAN", name: "DRENA Man" },
      { code: "MKN", name: "DRENA Mankono" },
      { code: "MNG", name: "DRENA Minignan" },
      { code: "ODN", name: "DRENA Odienné" },
      { code: "SPD", name: "DRENA San-Pédro" },
      { code: "SAS", name: "DRENA Sassandra" },
      { code: "SGL", name: "DRENA Séguéla" },
      { code: "SFR", name: "DRENA Sinfra" },
      { code: "SOU", name: "DRENA Soubré" },
      { code: "TIA", name: "DRENA Tiassalé" },
      { code: "YAM", name: "DRENA Yamoussoukro" },
    ],
  },
  {
    code: "SN",
    iso3: "SEN",
    nameFr: "Sénégal",
    nameEn: "Senegal",
    flag: "🇸🇳",
    currencyCode: "XOF",
    currencySymbol: "FCFA",
    timezone: "Africa/Dakar",
    defaultLocale: "fr",
    academicRegionLabel: "Inspection d'Académie",
    teacherTrainingCenterLabel: "CRFPE",
    continuingTrainingAntennaLabel: "Cellule pédagogique",
    isActive: false,
    // Les 16 Inspections d'Académie (une par région).
    academicRegions: [
      { code: "DKR", name: "IA Dakar" },
      { code: "PIK", name: "IA Pikine-Guédiawaye" },
      { code: "RUF", name: "IA Rufisque" },
      { code: "THS", name: "IA Thiès" },
      { code: "DRB", name: "IA Diourbel" },
      { code: "FTK", name: "IA Fatick" },
      { code: "KLK", name: "IA Kaolack" },
      { code: "KFR", name: "IA Kaffrine" },
      { code: "LGA", name: "IA Louga" },
      { code: "SLO", name: "IA Saint-Louis" },
      { code: "MTM", name: "IA Matam" },
      { code: "TMB", name: "IA Tambacounda" },
      { code: "KDG", name: "IA Kédougou" },
      { code: "KLD", name: "IA Kolda" },
      { code: "SED", name: "IA Sédhiou" },
      { code: "ZIG", name: "IA Ziguinchor" },
    ],
  },
  {
    code: "FR",
    iso3: "FRA",
    nameFr: "France",
    nameEn: "France",
    flag: "🇫🇷",
    currencyCode: "EUR",
    currencySymbol: "€",
    timezone: "Europe/Paris",
    defaultLocale: "fr",
    academicRegionLabel: "Académie",
    teacherTrainingCenterLabel: "INSPE",
    continuingTrainingAntennaLabel: "Bassin de formation",
    isActive: false,
    // Les 30 académies (métropole + outre-mer).
    academicRegions: [
      { code: "PAR", name: "Académie de Paris" },
      { code: "VER", name: "Académie de Versailles" },
      { code: "CRE", name: "Académie de Créteil" },
      { code: "AIX", name: "Académie d'Aix-Marseille" },
      { code: "AMI", name: "Académie d'Amiens" },
      { code: "BES", name: "Académie de Besançon" },
      { code: "BDX", name: "Académie de Bordeaux" },
      { code: "CLF", name: "Académie de Clermont-Ferrand" },
      { code: "COR", name: "Académie de Corse" },
      { code: "DIJ", name: "Académie de Dijon" },
      { code: "GRE", name: "Académie de Grenoble" },
      { code: "LIL", name: "Académie de Lille" },
      { code: "LIM", name: "Académie de Limoges" },
      { code: "LYO", name: "Académie de Lyon" },
      { code: "MON", name: "Académie de Montpellier" },
      { code: "NCY", name: "Académie de Nancy-Metz" },
      { code: "NTE", name: "Académie de Nantes" },
      { code: "NIC", name: "Académie de Nice" },
      { code: "NOR", name: "Académie de Normandie" },
      { code: "ORL", name: "Académie d'Orléans-Tours" },
      { code: "POI", name: "Académie de Poitiers" },
      { code: "REI", name: "Académie de Reims" },
      { code: "REN", name: "Académie de Rennes" },
      { code: "STR", name: "Académie de Strasbourg" },
      { code: "TLS", name: "Académie de Toulouse" },
      { code: "GUA", name: "Académie de Guadeloupe" },
      { code: "GUY", name: "Académie de Guyane" },
      { code: "MTQ", name: "Académie de Martinique" },
      { code: "MAY", name: "Académie de Mayotte" },
      { code: "REU", name: "Académie de La Réunion" },
    ],
  },
];

export const DEFAULT_COUNTRY_CODE = "CI";

export function getCountry(code: string): CountryConfig {
  const found = COUNTRIES.find((c) => c.code === code);
  if (found) return found;
  // Pays membre de l'ONU pas encore configuré : on RENVOIE une configuration
  // GÉNÉRIQUE (nom + libellés par défaut, sans régions ni données) plutôt que de
  // retomber sur la Côte d'Ivoire. Permet à l'administrateur système d'ouvrir
  // l'espace de n'importe quel pays (la sélection « tient » et affiche le bon
  // drapeau / nom).
  const un = UN_COUNTRIES.find((u) => u.code === code);
  if (un) {
    return {
      code: un.code,
      iso3: un.code,
      nameFr: un.name,
      nameEn: un.name,
      flag: "",
      currencyCode: "",
      currencySymbol: "",
      timezone: "UTC",
      defaultLocale: "fr",
      academicRegionLabel: "Régions académiques",
      teacherTrainingCenterLabel: "Centres de formation",
      continuingTrainingAntennaLabel: "Antennes de formation",
      isActive: false,
      academicRegions: [],
    };
  }
  return COUNTRIES[0];
}

export const ACTIVE_COUNTRIES = COUNTRIES.filter((c) => c.isActive);
