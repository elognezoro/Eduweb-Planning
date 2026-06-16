/**
 * Liste des États membres de l'ONU (noms français, codes ISO 3166-1 alpha-2).
 * Les drapeaux sont rendus via images (flagcdn) car Windows n'affiche pas les
 * emojis-drapeaux. Les devises et intitulés officiels sont renseignés pour un
 * ensemble de pays ; les autres reçoivent des valeurs par défaut éditables.
 */

export interface UnCountry {
  code: string;
  name: string;
  devise: string;
  official: string;
  ministry: string;
  /** Indicatif téléphonique international, ex. « +225 ». */
  dial: string;
}

const RAW: [string, string][] = [
  ["AF", "Afghanistan"], ["ZA", "Afrique du Sud"], ["AL", "Albanie"], ["DZ", "Algérie"],
  ["DE", "Allemagne"], ["AD", "Andorre"], ["AO", "Angola"], ["AG", "Antigua-et-Barbuda"],
  ["SA", "Arabie saoudite"], ["AR", "Argentine"], ["AM", "Arménie"], ["AU", "Australie"],
  ["AT", "Autriche"], ["AZ", "Azerbaïdjan"], ["BS", "Bahamas"], ["BH", "Bahreïn"],
  ["BD", "Bangladesh"], ["BB", "Barbade"], ["BE", "Belgique"], ["BZ", "Belize"],
  ["BJ", "Bénin"], ["BT", "Bhoutan"], ["BY", "Biélorussie"], ["MM", "Birmanie (Myanmar)"],
  ["BO", "Bolivie"], ["BA", "Bosnie-Herzégovine"], ["BW", "Botswana"], ["BR", "Brésil"],
  ["BN", "Brunei"], ["BG", "Bulgarie"], ["BF", "Burkina Faso"], ["BI", "Burundi"],
  ["KH", "Cambodge"], ["CM", "Cameroun"], ["CA", "Canada"], ["CV", "Cap-Vert"],
  ["CL", "Chili"], ["CN", "Chine"], ["CY", "Chypre"], ["CO", "Colombie"],
  ["KM", "Comores"], ["CG", "Congo (Brazzaville)"], ["CD", "Congo (RDC)"], ["KP", "Corée du Nord"],
  ["KR", "Corée du Sud"], ["CR", "Costa Rica"], ["CI", "Côte d'Ivoire"], ["HR", "Croatie"],
  ["CU", "Cuba"], ["DK", "Danemark"], ["DJ", "Djibouti"], ["DM", "Dominique"],
  ["EG", "Égypte"], ["AE", "Émirats arabes unis"], ["EC", "Équateur"], ["ER", "Érythrée"],
  ["ES", "Espagne"], ["EE", "Estonie"], ["SZ", "Eswatini"], ["US", "États-Unis"],
  ["ET", "Éthiopie"], ["FJ", "Fidji"], ["FI", "Finlande"], ["FR", "France"],
  ["GA", "Gabon"], ["GM", "Gambie"], ["GE", "Géorgie"], ["GH", "Ghana"],
  ["GR", "Grèce"], ["GD", "Grenade"], ["GT", "Guatemala"], ["GN", "Guinée"],
  ["GW", "Guinée-Bissau"], ["GQ", "Guinée équatoriale"], ["GY", "Guyana"], ["HT", "Haïti"],
  ["HN", "Honduras"], ["HU", "Hongrie"], ["IN", "Inde"], ["ID", "Indonésie"],
  ["IQ", "Irak"], ["IR", "Iran"], ["IE", "Irlande"], ["IS", "Islande"],
  ["IL", "Israël"], ["IT", "Italie"], ["JM", "Jamaïque"], ["JP", "Japon"],
  ["JO", "Jordanie"], ["KZ", "Kazakhstan"], ["KE", "Kenya"], ["KG", "Kirghizistan"],
  ["KI", "Kiribati"], ["KW", "Koweït"], ["LA", "Laos"], ["LS", "Lesotho"],
  ["LV", "Lettonie"], ["LB", "Liban"], ["LR", "Liberia"], ["LY", "Libye"],
  ["LI", "Liechtenstein"], ["LT", "Lituanie"], ["LU", "Luxembourg"], ["MK", "Macédoine du Nord"],
  ["MG", "Madagascar"], ["MY", "Malaisie"], ["MW", "Malawi"], ["MV", "Maldives"],
  ["ML", "Mali"], ["MT", "Malte"], ["MA", "Maroc"], ["MH", "Marshall (Îles)"],
  ["MU", "Maurice"], ["MR", "Mauritanie"], ["MX", "Mexique"], ["FM", "Micronésie"],
  ["MD", "Moldavie"], ["MC", "Monaco"], ["MN", "Mongolie"], ["ME", "Monténégro"],
  ["MZ", "Mozambique"], ["NA", "Namibie"], ["NR", "Nauru"], ["NP", "Népal"],
  ["NI", "Nicaragua"], ["NE", "Niger"], ["NG", "Nigeria"], ["NO", "Norvège"],
  ["NZ", "Nouvelle-Zélande"], ["OM", "Oman"], ["UG", "Ouganda"], ["UZ", "Ouzbékistan"],
  ["PK", "Pakistan"], ["PW", "Palaos"], ["PA", "Panama"], ["PG", "Papouasie-Nouvelle-Guinée"],
  ["PY", "Paraguay"], ["NL", "Pays-Bas"], ["PE", "Pérou"], ["PH", "Philippines"],
  ["PL", "Pologne"], ["PT", "Portugal"], ["QA", "Qatar"], ["CF", "République centrafricaine"],
  ["DO", "République dominicaine"], ["CZ", "République tchèque"], ["RO", "Roumanie"], ["GB", "Royaume-Uni"],
  ["RU", "Russie"], ["RW", "Rwanda"], ["KN", "Saint-Christophe-et-Niévès"], ["SM", "Saint-Marin"],
  ["VC", "Saint-Vincent-et-les-Grenadines"], ["LC", "Sainte-Lucie"], ["SB", "Salomon (Îles)"], ["SV", "Salvador"],
  ["WS", "Samoa"], ["ST", "Sao Tomé-et-Principe"], ["SN", "Sénégal"], ["RS", "Serbie"],
  ["SC", "Seychelles"], ["SL", "Sierra Leone"], ["SG", "Singapour"], ["SK", "Slovaquie"],
  ["SI", "Slovénie"], ["SO", "Somalie"], ["SD", "Soudan"], ["SS", "Soudan du Sud"],
  ["LK", "Sri Lanka"], ["SE", "Suède"], ["CH", "Suisse"], ["SR", "Suriname"],
  ["SY", "Syrie"], ["TJ", "Tadjikistan"], ["TZ", "Tanzanie"], ["TD", "Tchad"],
  ["TH", "Thaïlande"], ["TL", "Timor oriental"], ["TG", "Togo"], ["TO", "Tonga"],
  ["TT", "Trinité-et-Tobago"], ["TN", "Tunisie"], ["TM", "Turkménistan"], ["TR", "Turquie"],
  ["TV", "Tuvalu"], ["UA", "Ukraine"], ["UY", "Uruguay"], ["VU", "Vanuatu"],
  ["VE", "Venezuela"], ["VN", "Viêt Nam"], ["YE", "Yémen"], ["ZM", "Zambie"], ["ZW", "Zimbabwe"],
];

interface Detail {
  devise: string;
  official: string;
  ministry?: string;
}

const M_EDU = "MINISTÈRE DE L'ÉDUCATION NATIONALE";

const DETAILS: Record<string, Detail> = {
  CI: { devise: "Union – Discipline – Travail", official: "RÉPUBLIQUE DE CÔTE D'IVOIRE", ministry: "MINISTÈRE DE L'ÉDUCATION NATIONALE ET DE L'ALPHABÉTISATION" },
  FR: { devise: "Liberté, Égalité, Fraternité", official: "RÉPUBLIQUE FRANÇAISE" },
  SN: { devise: "Un Peuple, Un But, Une Foi", official: "RÉPUBLIQUE DU SÉNÉGAL" },
  ML: { devise: "Un Peuple, Un But, Une Foi", official: "RÉPUBLIQUE DU MALI" },
  BF: { devise: "Unité – Progrès – Justice", official: "BURKINA FASO" },
  BJ: { devise: "Fraternité – Justice – Travail", official: "RÉPUBLIQUE DU BÉNIN" },
  TG: { devise: "Travail – Liberté – Patrie", official: "RÉPUBLIQUE TOGOLAISE" },
  NE: { devise: "Fraternité – Travail – Progrès", official: "RÉPUBLIQUE DU NIGER" },
  GN: { devise: "Travail – Justice – Solidarité", official: "RÉPUBLIQUE DE GUINÉE" },
  CM: { devise: "Paix – Travail – Patrie", official: "RÉPUBLIQUE DU CAMEROUN" },
  GA: { devise: "Union – Travail – Justice", official: "RÉPUBLIQUE GABONAISE" },
  CG: { devise: "Unité – Travail – Progrès", official: "RÉPUBLIQUE DU CONGO" },
  CD: { devise: "Justice – Paix – Travail", official: "RÉPUBLIQUE DÉMOCRATIQUE DU CONGO" },
  TD: { devise: "Unité – Travail – Progrès", official: "RÉPUBLIQUE DU TCHAD" },
  CF: { devise: "Unité – Dignité – Travail", official: "RÉPUBLIQUE CENTRAFRICAINE" },
  MG: { devise: "Amour – Patrie – Progrès", official: "RÉPUBLIQUE DE MADAGASCAR" },
  MR: { devise: "Honneur – Fraternité – Justice", official: "RÉPUBLIQUE ISLAMIQUE DE MAURITANIE" },
  DZ: { devise: "Par le peuple et pour le peuple", official: "RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE" },
  MA: { devise: "Dieu – la Patrie – le Roi", official: "ROYAUME DU MAROC" },
  TN: { devise: "Liberté – Ordre – Justice", official: "RÉPUBLIQUE TUNISIENNE" },
  DE: { devise: "Einigkeit und Recht und Freiheit", official: "RÉPUBLIQUE FÉDÉRALE D'ALLEMAGNE" },
  ZA: { devise: "L'unité dans la diversité", official: "RÉPUBLIQUE D'AFRIQUE DU SUD" },
  AL: { devise: "Ti Shqipëri, më jep nder, më jep emrin Shqipëtar", official: "RÉPUBLIQUE D'ALBANIE" },
  AD: { devise: "Virtus Unita Fortior", official: "PRINCIPAUTÉ D'ANDORRE" },
  AO: { devise: "Virtus Unita Fortior", official: "RÉPUBLIQUE D'ANGOLA" },
  BE: { devise: "L'union fait la force", official: "ROYAUME DE BELGIQUE" },
  CA: { devise: "D'un océan à l'autre", official: "CANADA" },
  US: { devise: "In God We Trust", official: "ÉTATS-UNIS D'AMÉRIQUE" },
  GB: { devise: "Dieu et mon droit", official: "ROYAUME-UNI" },
  ES: { devise: "Plus Ultra", official: "ROYAUME D'ESPAGNE" },
  HT: { devise: "L'union fait la force", official: "RÉPUBLIQUE D'HAÏTI" },
  CH: { devise: "Un pour tous, tous pour un", official: "CONFÉDÉRATION SUISSE" },
  IT: { devise: "", official: "RÉPUBLIQUE ITALIENNE" },
  PT: { devise: "", official: "RÉPUBLIQUE PORTUGAISE" },
  RW: { devise: "Unité – Travail – Patriotisme", official: "RÉPUBLIQUE DU RWANDA" },
  BI: { devise: "Unité – Travail – Progrès", official: "RÉPUBLIQUE DU BURUNDI" },
};

/** Indicatifs téléphoniques internationaux par code ISO (E.164, sans le « + »). */
const DIAL: Record<string, string> = {
  AF: "93", ZA: "27", AL: "355", DZ: "213", DE: "49", AD: "376", AO: "244", AG: "1",
  SA: "966", AR: "54", AM: "374", AU: "61", AT: "43", AZ: "994", BS: "1", BH: "973",
  BD: "880", BB: "1", BE: "32", BZ: "501", BJ: "229", BT: "975", BY: "375", MM: "95",
  BO: "591", BA: "387", BW: "267", BR: "55", BN: "673", BG: "359", BF: "226", BI: "257",
  KH: "855", CM: "237", CA: "1", CV: "238", CL: "56", CN: "86", CY: "357", CO: "57",
  KM: "269", CG: "242", CD: "243", KP: "850", KR: "82", CR: "506", CI: "225", HR: "385",
  CU: "53", DK: "45", DJ: "253", DM: "1", EG: "20", AE: "971", EC: "593", ER: "291",
  ES: "34", EE: "372", SZ: "268", US: "1", ET: "251", FJ: "679", FI: "358", FR: "33",
  GA: "241", GM: "220", GE: "995", GH: "233", GR: "30", GD: "1", GT: "502", GN: "224",
  GW: "245", GQ: "240", GY: "592", HT: "509", HN: "504", HU: "36", IN: "91", ID: "62",
  IQ: "964", IR: "98", IE: "353", IS: "354", IL: "972", IT: "39", JM: "1", JP: "81",
  JO: "962", KZ: "7", KE: "254", KG: "996", KI: "686", KW: "965", LA: "856", LS: "266",
  LV: "371", LB: "961", LR: "231", LY: "218", LI: "423", LT: "370", LU: "352", MK: "389",
  MG: "261", MY: "60", MW: "265", MV: "960", ML: "223", MT: "356", MA: "212", MH: "692",
  MU: "230", MR: "222", MX: "52", FM: "691", MD: "373", MC: "377", MN: "976", ME: "382",
  MZ: "258", NA: "264", NR: "674", NP: "977", NI: "505", NE: "227", NG: "234", NO: "47",
  NZ: "64", OM: "968", UG: "256", UZ: "998", PK: "92", PW: "680", PA: "507", PG: "675",
  PY: "595", NL: "31", PE: "51", PH: "63", PL: "48", PT: "351", QA: "974", CF: "236",
  DO: "1", CZ: "420", RO: "40", GB: "44", RU: "7", RW: "250", KN: "1", SM: "378",
  VC: "1", LC: "1", SB: "677", SV: "503", WS: "685", ST: "239", SN: "221", RS: "381",
  SC: "248", SL: "232", SG: "65", SK: "421", SI: "386", SO: "252", SD: "249", SS: "211",
  LK: "94", SE: "46", CH: "41", SR: "597", SY: "963", TJ: "992", TZ: "255", TD: "235",
  TH: "66", TL: "670", TG: "228", TO: "676", TT: "1", TN: "216", TM: "993", TR: "90",
  TV: "688", UA: "380", UY: "598", VU: "678", VE: "58", VN: "84", YE: "967", ZM: "260",
  ZW: "263",
};

export const UN_COUNTRIES: UnCountry[] = RAW.map(([code, name]) => {
  const d = DETAILS[code];
  return {
    code,
    name,
    devise: d?.devise ?? "",
    official: d?.official ?? name.toUpperCase(),
    ministry: d?.ministry ?? M_EDU,
    dial: DIAL[code] ? `+${DIAL[code]}` : "",
  };
}).sort((a, b) => a.name.localeCompare(b.name, "fr"));

export function getUnCountry(code: string): UnCountry | undefined {
  return UN_COUNTRIES.find((c) => c.code === code);
}

/** Indicatif téléphonique international (ex. « +225 ») pour un code pays ISO. */
export function dialCode(code: string): string {
  const d = DIAL[(code || "").toUpperCase()];
  return d ? `+${d}` : "";
}

/** URL d'un drapeau (image) à partir du code ISO. */
export function flagUrl(code: string, size: "small" | "medium" | "large" = "small"): string {
  if (size === "large") return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
  const dim = size === "small" ? "32x24" : "48x36";
  return `https://flagcdn.com/${dim}/${code.toLowerCase()}.png`;
}
