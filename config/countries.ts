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
  {
    code: "MR",
    iso3: "MRT",
    nameFr: "Mauritanie",
    nameEn: "Mauritania",
    flag: "🇲🇷",
    currencyCode: "MRU",
    currencySymbol: "UM",
    timezone: "Africa/Nouakchott",
    defaultLocale: "fr",
    academicRegionLabel: "Wilaya (DREN)",
    teacherTrainingCenterLabel: "ENI / ENS",
    continuingTrainingAntennaLabel: "Antenne régionale",
    isActive: true,
    // Les 15 wilayas (régions administratives = DREN, Directions Régionales de
    // l'Éducation Nationale) — source : annuaires statistiques 2022-2023 du MEN.
    academicRegions: [
      { code: "ADR", name: "Adrar" },
      { code: "ASS", name: "Assaba" },
      { code: "BRA", name: "Brakna" },
      { code: "DKN", name: "Dakhlet Nouadhibou" },
      { code: "GOR", name: "Gorgol" },
      { code: "GUI", name: "Guidimakha" },
      { code: "HEC", name: "Hodh Ech Chargui" },
      { code: "HEG", name: "Hodh El Gharbi" },
      { code: "INC", name: "Inchiri" },
      { code: "NKN", name: "Nouakchott-Nord" },
      { code: "NKO", name: "Nouakchott-Ouest" },
      { code: "NKS", name: "Nouakchott-Sud" },
      { code: "TAG", name: "Tagant" },
      { code: "TIZ", name: "Tiris Zemmour" },
      { code: "TRA", name: "Trarza" },
    ],
  },
  {
    code: "TG",
    iso3: "TGO",
    nameFr: "Togo",
    nameEn: "Togo",
    flag: "🇹🇬",
    currencyCode: "XOF",
    currencySymbol: "FCFA",
    timezone: "Africa/Lome",
    defaultLocale: "fr",
    academicRegionLabel: "Région (DRE)",
    teacherTrainingCenterLabel: "ENI / ENS",
    continuingTrainingAntennaLabel: "Inspection",
    isActive: true,
    // Régions = DRE (Directions Régionales de l'Éducation). Le répertoire officiel
    // DPSSE/MEN ne fournit que des statistiques nationales (ni liste nominative ni
    // découpage régional) → on pose les régions administratives standard, éditables
    // via « Gérer les régions ».
    academicRegions: [
      { code: "GLO", name: "Grand Lomé" },
      { code: "MAR", name: "Maritime" },
      { code: "PLA", name: "Plateaux" },
      { code: "CEN", name: "Centrale" },
      { code: "KAR", name: "Kara" },
      { code: "SAV", name: "Savanes" },
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
    academicRegionLabel: "Région (IA)",
    teacherTrainingCenterLabel: "CRFPE / FASTEF",
    continuingTrainingAntennaLabel: "IEF",
    isActive: true,
    // 14 régions (= Inspections d'Académie). Le fichier source (annuaire public
    // SenegalEcoles) ne fournit que des extraits nominatifs + des totaux ; la base
    // nominative complète (9947 écoles) reste à exporter du MEN. Régions éditables.
    academicRegions: [
      { code: "DKR", name: "Dakar" },
      { code: "DBL", name: "Diourbel" },
      { code: "FTK", name: "Fatick" },
      { code: "KFN", name: "Kaffrine" },
      { code: "KLK", name: "Kaolack" },
      { code: "KGU", name: "Kédougou" },
      { code: "KLD", name: "Kolda" },
      { code: "LGA", name: "Louga" },
      { code: "MTM", name: "Matam" },
      { code: "STL", name: "Saint-Louis" },
      { code: "SDH", name: "Sédhiou" },
      { code: "TBC", name: "Tambacounda" },
      { code: "THS", name: "Thiès" },
      { code: "ZIG", name: "Ziguinchor" },
    ],
  },
  {
    code: "CM",
    iso3: "CMR",
    nameFr: "Cameroun",
    nameEn: "Cameroon",
    flag: "🇨🇲",
    currencyCode: "XAF",
    currencySymbol: "FCFA",
    timezone: "Africa/Douala",
    defaultLocale: "fr",
    academicRegionLabel: "Région",
    teacherTrainingCenterLabel: "ENIEG / ENS",
    continuingTrainingAntennaLabel: "Délégation départementale",
    isActive: true,
    // Les 10 régions (système bilingue FR/EN ; délégations régionales MINEDUB /
    // MINESEC). Source : répertoire MINESEC + annuaires — 189 établissements
    // nominatifs fournis (CSV importable). Régions éditables.
    academicRegions: [
      { code: "ADA", name: "Adamaoua" },
      { code: "CEN", name: "Centre" },
      { code: "EST", name: "Est" },
      { code: "EXN", name: "Extrême-Nord" },
      { code: "LIT", name: "Littoral" },
      { code: "NOR", name: "Nord" },
      { code: "NOU", name: "Nord-Ouest" },
      { code: "OUE", name: "Ouest" },
      { code: "SUD", name: "Sud" },
      { code: "SOU", name: "Sud-Ouest" },
    ],
  },
  {
    code: "CD",
    iso3: "COD",
    nameFr: "RD Congo",
    nameEn: "DR Congo",
    flag: "🇨🇩",
    currencyCode: "CDF",
    currencySymbol: "FC",
    timezone: "Africa/Kinshasa",
    defaultLocale: "fr",
    academicRegionLabel: "Province (PROVED)",
    teacherTrainingCenterLabel: "ISP / IFM",
    continuingTrainingAntennaLabel: "Sous-division (SOUSPROVED)",
    isActive: true,
    // Les 26 provinces (régions académiques = provinces éducationnelles / PROVED).
    // Source : SECOPE/DINACOPE — 702 établissements fournis (province-éducationnelle
    // 1003 Lukunga/Gombe = Kinshasa), CSV importable. Régions éditables.
    academicRegions: [
      { code: "BUL", name: "Bas-Uele" },
      { code: "EQU", name: "Équateur" },
      { code: "HKA", name: "Haut-Katanga" },
      { code: "HLO", name: "Haut-Lomami" },
      { code: "HUE", name: "Haut-Uele" },
      { code: "ITU", name: "Ituri" },
      { code: "KAS", name: "Kasaï" },
      { code: "KAC", name: "Kasaï-Central" },
      { code: "KAO", name: "Kasaï-Oriental" },
      { code: "KIN", name: "Kinshasa" },
      { code: "KOC", name: "Kongo-Central" },
      { code: "KWA", name: "Kwango" },
      { code: "KWI", name: "Kwilu" },
      { code: "LOM", name: "Lomami" },
      { code: "LUA", name: "Lualaba" },
      { code: "MAI", name: "Mai-Ndombe" },
      { code: "MAN", name: "Maniema" },
      { code: "MON", name: "Mongala" },
      { code: "NKV", name: "Nord-Kivu" },
      { code: "NUB", name: "Nord-Ubangi" },
      { code: "SAN", name: "Sankuru" },
      { code: "SKV", name: "Sud-Kivu" },
      { code: "SUB", name: "Sud-Ubangi" },
      { code: "TAN", name: "Tanganyika" },
      { code: "TSH", name: "Tshopo" },
      { code: "TSU", name: "Tshuapa" },
    ],
  },
  {
    code: "HT",
    iso3: "HTI",
    nameFr: "Haïti",
    nameEn: "Haiti",
    flag: "🇭🇹",
    currencyCode: "HTG",
    currencySymbol: "G",
    timezone: "America/Port-au-Prince",
    defaultLocale: "fr",
    academicRegionLabel: "Département (DDE)",
    teacherTrainingCenterLabel: "ENI / CFEF",
    continuingTrainingAntennaLabel: "Bureau de district scolaire (BDS)",
    isActive: true,
    // Les 10 départements (= Directions Départementales d'Éducation). Source :
    // listes MENFP (lycées de la République + EPT/PSUGO) — 567 établissements
    // nominatifs fournis (CSV importable). Régions éditables.
    academicRegions: [
      { code: "ART", name: "Artibonite" },
      { code: "CEN", name: "Centre" },
      { code: "GRA", name: "Grand'Anse" },
      { code: "NIP", name: "Nippes" },
      { code: "NOR", name: "Nord" },
      { code: "NES", name: "Nord-Est" },
      { code: "NOU", name: "Nord-Ouest" },
      { code: "OUE", name: "Ouest" },
      { code: "SUD", name: "Sud" },
      { code: "SES", name: "Sud-Est" },
    ],
  },
  {
    code: "BJ",
    iso3: "BEN",
    nameFr: "Bénin",
    nameEn: "Benin",
    flag: "🇧🇯",
    currencyCode: "XOF",
    currencySymbol: "FCFA",
    timezone: "Africa/Porto-Novo",
    defaultLocale: "fr",
    academicRegionLabel: "Département (DDE)",
    teacherTrainingCenterLabel: "ENI / ENS",
    continuingTrainingAntennaLabel: "Circonscription scolaire",
    isActive: true,
    // Les 12 départements (= Directions Départementales des Enseignements).
    // Source : SuccessCo + OSM/WikiProject CEG — 545 établissements (auto-chargés).
    // Régions éditables.
    academicRegions: [
      { code: "ALI", name: "Alibori" },
      { code: "ATA", name: "Atacora" },
      { code: "ATL", name: "Atlantique" },
      { code: "BOR", name: "Borgou" },
      { code: "COL", name: "Collines" },
      { code: "COU", name: "Couffo" },
      { code: "DON", name: "Donga" },
      { code: "LIT", name: "Littoral" },
      { code: "MON", name: "Mono" },
      { code: "OUE", name: "Ouémé" },
      { code: "PLA", name: "Plateau" },
      { code: "ZOU", name: "Zou" },
    ],
  },
  {
    code: "BF",
    iso3: "BFA",
    nameFr: "Burkina Faso",
    nameEn: "Burkina Faso",
    flag: "🇧🇫",
    currencyCode: "XOF",
    currencySymbol: "FCFA",
    timezone: "Africa/Ouagadougou",
    defaultLocale: "fr",
    academicRegionLabel: "Région (DRE)",
    teacherTrainingCenterLabel: "ENEP / ENS",
    continuingTrainingAntennaLabel: "Direction provinciale (DPE)",
    isActive: true,
    // Les 13 régions (= Directions Régionales de l'Éducation). Source : HDX/Open
    // Data (écoles primaires publiques) + MENAPLN/MESFPT (privés reconnus) —
    // 19 342 établissements (auto-chargés). Régions éditables.
    academicRegions: [
      { code: "BMH", name: "Boucle du Mouhoun" },
      { code: "CAS", name: "Cascades" },
      { code: "CEN", name: "Centre" },
      { code: "CES", name: "Centre-Est" },
      { code: "CNO", name: "Centre-Nord" },
      { code: "COU", name: "Centre-Ouest" },
      { code: "CSU", name: "Centre-Sud" },
      { code: "EST", name: "Est" },
      { code: "HBA", name: "Hauts-Bassins" },
      { code: "NOR", name: "Nord" },
      { code: "PLC", name: "Plateau-Central" },
      { code: "SAH", name: "Sahel" },
      { code: "SOU", name: "Sud-Ouest" },
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
