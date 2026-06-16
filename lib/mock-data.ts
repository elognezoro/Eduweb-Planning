/**
 * Données de démonstration EduWeb Planner.
 * Permettent d'afficher des interfaces riches AVANT la connexion à Supabase.
 * Toutes les pages s'appuient sur ces jeux de données ; les remplacer par des
 * requêtes Supabase est trivial (mêmes formes de données).
 */
import type {
  Announcement,
  AuditEntry,
  Eleve,
  Enseignant,
  Etablissement,
  Inspection,
  LessonEntry,
  Recommendation,
  UserProfile,
} from "./types";
import type { UserRole, AccountStatus } from "./roles";
import { generateUserUid } from "./uid";

export const DEMO_USER: UserProfile = {
  id: generateUserUid({ country: "CI", role: "admin", createdAt: "2024-09-01T08:00:00Z", seq: 1 }),
  firstName: "Elogne Guessan",
  lastName: "ZORO",
  displayName: "ZORO Elogne Guessan",
  email: "elognezoro@gmail.com",
  phone: "+225 07 00 00 00 00",
  avatarUrl: null,
  role: "admin",
  status: "active",
  countryCode: "CI",
  etablissementId: null,
  academicRegionCode: "ABJ1",
  jobTitle: "Super administrateur de la plateforme",
  preferredLocale: "fr",
  createdAt: "2024-09-01T08:00:00Z",
  lastLoginAt: "2026-06-09T07:42:00Z",
};

export const ETABLISSEMENTS: Etablissement[] = [
  {
    id: "et-001",
    code: "LMC-ABJ",
    name: "Lycée Moderne de Cocody",
    shortName: "LM Cocody",
    type: "Lycée public",
    countryCode: "CI",
    academicRegionCode: "ABJ1",
    locality: "Abidjan — Cocody",
    status: "active",
    studentsCount: 1840,
    teachersCount: 92,
    classesCount: 42,
    attendanceRate: 94.2,
    successRate: 78.5,
    subscriptionPlan: "Établissement",
    email: "contact@lmcocody.edu.ci",
    phone: "+225 27 22 44 55 66",
  },
  {
    id: "et-002",
    code: "CMT-BKE",
    name: "Collège Municipal de Treichville",
    shortName: "CM Treichville",
    type: "Collège public",
    countryCode: "CI",
    academicRegionCode: "ABJ2",
    locality: "Abidjan — Treichville",
    status: "active",
    studentsCount: 1260,
    teachersCount: 58,
    classesCount: 28,
    attendanceRate: 91.8,
    successRate: 71.2,
    subscriptionPlan: "Établissement",
    email: "contact@cmtreichville.edu.ci",
  },
  {
    id: "et-003",
    code: "GSL-YAM",
    name: "Groupe Scolaire La Lumière",
    shortName: "GS La Lumière",
    type: "Établissement privé",
    countryCode: "CI",
    academicRegionCode: "YAM",
    locality: "Yamoussoukro",
    status: "active",
    studentsCount: 980,
    teachersCount: 47,
    classesCount: 24,
    attendanceRate: 96.1,
    successRate: 84.0,
    subscriptionPlan: "Premium",
  },
  {
    id: "et-004",
    code: "LMB-BKE",
    name: "Lycée Moderne de Bouaké",
    shortName: "LM Bouaké",
    type: "Lycée public",
    countryCode: "CI",
    academicRegionCode: "BKE",
    locality: "Bouaké",
    status: "active",
    studentsCount: 2110,
    teachersCount: 104,
    classesCount: 48,
    attendanceRate: 89.5,
    successRate: 69.8,
    subscriptionPlan: "Établissement",
  },
  {
    id: "et-005",
    code: "CSP-SPD",
    name: "Collège Saint-Pierre",
    shortName: "C Saint-Pierre",
    type: "Établissement confessionnel",
    countryCode: "CI",
    academicRegionCode: "SPD",
    locality: "San-Pédro",
    status: "active",
    studentsCount: 740,
    teachersCount: 36,
    classesCount: 18,
    attendanceRate: 95.4,
    successRate: 81.3,
    subscriptionPlan: "Standard",
  },
];

const PRENOMS = ["Awa", "Koffi", "Mariam", "Yao", "Fatou", "Aboubacar", "Adjoua", "Ibrahim", "Sarah", "Konan", "Aminata", "Serge"];
const NOMS = ["Kouamé", "Traoré", "Diallo", "Bamba", "N'Guessan", "Coulibaly", "Touré", "Yao", "Ouattara", "Koné", "Aka", "Diabaté"];
const CLASSES = ["6ᵉ A", "5ᵉ B", "4ᵉ C", "3ᵉ A", "2ⁿᵈᵉ C", "1ʳᵉ D", "Tˡᵉ A", "Tˡᵉ D"];

export const ELEVES: Eleve[] = Array.from({ length: 200 }, (_, i) => {
  const gender: Eleve["gender"] = i % 2 === 0 ? "F" : "M";
  // Date de naissance déterministe (≈ 11-16 ans) — distingue les homonymes
  const year = 2009 + (i % 6);
  const month = ((i * 7) % 12) + 1;
  const day = ((i * 13) % 28) + 1;
  const birthDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return {
    id: `el-${String(i + 1).padStart(3, "0")}`,
    matricule: `CI-${2025000 + i}`,
    firstName: PRENOMS[i % PRENOMS.length],
    lastName: NOMS[i % NOMS.length],
    gender,
    birthDate,
    className: CLASSES[i % CLASSES.length],
    average: Math.round((9 + Math.random() * 9) * 10) / 10,
    attendanceRate: Math.round((84 + Math.random() * 15) * 10) / 10,
    status: i % 13 === 0 ? "suspended" : "active",
  };
});

export const ENSEIGNANTS: Enseignant[] = [
  { id: "en-001", firstName: "Paul", lastName: "Kouassi", specialty: "Mathématiques", classesCount: 5, inspectionScore: 16.5, lessonBookRate: 92, attendanceRate: 97, status: "active" },
  { id: "en-002", firstName: "Hélène", lastName: "Brou", specialty: "Français", classesCount: 4, inspectionScore: 17.8, lessonBookRate: 98, attendanceRate: 99, status: "active" },
  { id: "en-003", firstName: "Moussa", lastName: "Doumbia", specialty: "Physique-Chimie", classesCount: 6, inspectionScore: 14.2, lessonBookRate: 81, attendanceRate: 93, status: "active" },
  { id: "en-004", firstName: "Grace", lastName: "Tanoh", specialty: "SVT", classesCount: 5, inspectionScore: 15.9, lessonBookRate: 88, attendanceRate: 96, status: "active" },
  { id: "en-005", firstName: "Daniel", lastName: "Yao", specialty: "Histoire-Géographie", classesCount: 4, inspectionScore: 13.5, lessonBookRate: 74, attendanceRate: 90, status: "active" },
  { id: "en-006", firstName: "Awa", lastName: "Cissé", specialty: "Anglais", classesCount: 6, inspectionScore: 16.0, lessonBookRate: 90, attendanceRate: 95, status: "active" },
  { id: "en-007", firstName: "Jean", lastName: "Aka", specialty: "Philosophie", classesCount: 3, inspectionScore: 15.1, lessonBookRate: 85, attendanceRate: 94, status: "pending" },
  { id: "en-008", firstName: "Mariam", lastName: "Koné", specialty: "EPS", classesCount: 8, inspectionScore: 14.8, lessonBookRate: 79, attendanceRate: 92, status: "active" },
];

export const RECOMMENDATIONS: Recommendation[] = [
  { id: "rec-001", title: "Renforcer l'usage des supports numériques", description: "Intégrer des séquences vidéo en classe de 3ᵉ.", assignedTo: "Paul Kouassi", priority: "medium", status: "in_progress", dueDate: "2026-06-30", progress: 60 },
  { id: "rec-002", title: "Améliorer la gestion du temps de classe", description: "Optimiser la phase d'introduction des séances.", assignedTo: "Moussa Doumbia", priority: "high", status: "open", dueDate: "2026-06-20", progress: 15 },
  { id: "rec-003", title: "Régularité du cahier de texte", description: "Mettre à jour les entrées sous 48 h.", assignedTo: "Daniel Yao", priority: "high", status: "overdue", dueDate: "2026-05-25", progress: 30 },
  { id: "rec-004", title: "Différenciation pédagogique", description: "Proposer des activités par niveau de maîtrise.", assignedTo: "Grace Tanoh", priority: "medium", status: "done", dueDate: "2026-05-10", progress: 100 },
  { id: "rec-005", title: "Évaluations formatives plus fréquentes", description: "Au moins une évaluation courte par semaine.", assignedTo: "Hélène Brou", priority: "low", status: "in_progress", dueDate: "2026-07-05", progress: 45 },
  { id: "rec-006", title: "Encadrement des élèves en difficulté", description: "Mettre en place un tutorat ciblé.", assignedTo: "Awa Cissé", priority: "high", status: "open", dueDate: "2026-06-28", progress: 0 },
];

export const INSPECTIONS: Inspection[] = [
  { id: "ins-001", teacher: "Paul Kouassi", inspector: "M. Konan", etablissement: "Lycée Moderne de Cocody", subject: "Mathématiques", className: "3ᵉ A", plannedAt: "2026-06-12T09:00:00Z", status: "planned" },
  { id: "ins-002", teacher: "Hélène Brou", inspector: "Mme Diabaté", etablissement: "Lycée Moderne de Cocody", subject: "Français", className: "2ⁿᵈᵉ C", plannedAt: "2026-06-05T10:00:00Z", status: "completed", globalScore: 17.8 },
  { id: "ins-003", teacher: "Moussa Doumbia", inspector: "M. Konan", etablissement: "Lycée Moderne de Bouaké", subject: "Physique-Chimie", className: "1ʳᵉ D", plannedAt: "2026-06-15T08:00:00Z", status: "planned" },
  { id: "ins-004", teacher: "Daniel Yao", inspector: "Mme Touré", etablissement: "Collège Municipal de Treichville", subject: "Histoire-Géo", className: "4ᵉ C", plannedAt: "2026-06-02T11:00:00Z", status: "in_progress" },
  { id: "ins-005", teacher: "Grace Tanoh", inspector: "Mme Diabaté", etablissement: "Groupe Scolaire La Lumière", subject: "SVT", className: "Tˡᵉ D", plannedAt: "2026-05-28T09:30:00Z", status: "completed", globalScore: 15.9 },
];

export const AUDIT_ENTRIES: AuditEntry[] = [
  { id: "a-001", actor: "ZORO Elogne Guessan", action: "Connexion à la plateforme", entityType: "auth", severity: "info", createdAt: "2026-06-09T07:42:00Z" },
  { id: "a-002", actor: "ZORO Elogne Guessan", action: "Modification du rôle d'un utilisateur", entityType: "profile", severity: "warning", createdAt: "2026-06-09T07:50:00Z", metadata: { utilisateur: "Jean Aka", nouveau_role: "enseignant" } },
  { id: "a-003", actor: "Chef étab. Cocody", action: "Validation de bulletins", entityType: "report_card", severity: "info", createdAt: "2026-06-08T16:10:00Z", metadata: { classe: "3ᵉ A", nombre: 38 } },
  { id: "a-004", actor: "Inspecteur Konan", action: "Création d'une inspection", entityType: "inspection", severity: "info", createdAt: "2026-06-08T14:05:00Z" },
  { id: "a-005", actor: "Système", action: "Import CSV cohorte CAFOP", entityType: "import", severity: "warning", createdAt: "2026-06-07T09:30:00Z", metadata: { lignes: 124, erreurs: 3 } },
  { id: "a-006", actor: "Service facturation", action: "Paiement reçu", entityType: "payment", severity: "info", createdAt: "2026-06-06T11:20:00Z", metadata: { montant: "1 200 000 FCFA" } },
  { id: "a-007", actor: "ZORO Elogne Guessan", action: "Suppression tentée (refusée)", entityType: "etablissement", severity: "critical", createdAt: "2026-06-05T18:45:00Z" },
];

/* ------------------------------------------------------------------ */
/* Séries pour graphiques Recharts                                     */
/* ------------------------------------------------------------------ */

export const ATTENDANCE_SERIES = [
  { mois: "Sept.", presence: 96.2, absence: 3.8 },
  { mois: "Oct.", presence: 94.8, absence: 5.2 },
  { mois: "Nov.", presence: 93.1, absence: 6.9 },
  { mois: "Déc.", presence: 91.5, absence: 8.5 },
  { mois: "Jan.", presence: 94.0, absence: 6.0 },
  { mois: "Fév.", presence: 95.1, absence: 4.9 },
  { mois: "Mars", presence: 93.7, absence: 6.3 },
  { mois: "Avr.", presence: 92.4, absence: 7.6 },
  { mois: "Mai", presence: 94.6, absence: 5.4 },
];

export const ENROLLMENT_BY_LEVEL = [
  { niveau: "6ᵉ", filles: 320, garcons: 298 },
  { niveau: "5ᵉ", filles: 300, garcons: 280 },
  { niveau: "4ᵉ", filles: 285, garcons: 270 },
  { niveau: "3ᵉ", filles: 268, garcons: 255 },
  { niveau: "2ⁿᵈᵉ", filles: 240, garcons: 232 },
  { niveau: "1ʳᵉ", filles: 210, garcons: 205 },
  { niveau: "Tˡᵉ", filles: 190, garcons: 188 },
];

export const ENROLLMENT_PIE = [
  { name: "Premier cycle", value: 2376 },
  { name: "Second cycle", value: 1455 },
  { name: "Préscolaire/Primaire", value: 980 },
];

export const GRADE_DISTRIBUTION = [
  { tranche: "0–5", eleves: 42 },
  { tranche: "5–8", eleves: 118 },
  { tranche: "8–10", eleves: 196 },
  { tranche: "10–12", eleves: 264 },
  { tranche: "12–14", eleves: 188 },
  { tranche: "14–16", eleves: 96 },
  { tranche: "16–20", eleves: 38 },
];

export const SUBJECT_AVERAGES = [
  { matiere: "Français", moyenne: 11.8 },
  { matiere: "Maths", moyenne: 10.4 },
  { matiere: "Physique-Chimie", moyenne: 9.9 },
  { matiere: "SVT", moyenne: 12.1 },
  { matiere: "Hist-Géo", moyenne: 11.2 },
  { matiere: "Anglais", moyenne: 12.6 },
  { matiere: "Philosophie", moyenne: 10.8 },
];

export const TEACHER_RADAR = [
  { axe: "Préparation", valeur: 16 },
  { axe: "Animation", valeur: 14 },
  { axe: "Évaluation", valeur: 15 },
  { axe: "Gestion classe", valeur: 13 },
  { axe: "Supports", valeur: 17 },
  { axe: "Suivi élèves", valeur: 15 },
];

export const REGION_STATS = [
  { region: "Abidjan 1", etablissements: 124, eleves: 86200, reussite: 76.2 },
  { region: "Abidjan 2", etablissements: 98, eleves: 71400, reussite: 72.8 },
  { region: "Bouaké", etablissements: 76, eleves: 58300, reussite: 69.4 },
  { region: "Yamoussoukro", etablissements: 54, eleves: 39800, reussite: 78.1 },
  { region: "Daloa", etablissements: 61, eleves: 44100, reussite: 71.0 },
  { region: "Korhogo", etablissements: 49, eleves: 35600, reussite: 67.5 },
  { region: "San-Pédro", etablissements: 43, eleves: 31200, reussite: 73.9 },
];

export const RECOMMENDATION_COMPLETION = [
  { mois: "Jan.", taux: 42 },
  { mois: "Fév.", taux: 48 },
  { mois: "Mars", taux: 55 },
  { mois: "Avr.", taux: 61 },
  { mois: "Mai", taux: 68 },
  { mois: "Juin", taux: 73 },
];

/* Heatmap registre d'appel : 5 jours x 6 créneaux (taux de présence %) */
export const ATTENDANCE_HEATMAP = {
  days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
  slots: ["08h", "09h", "10h", "11h", "14h", "15h"],
  values: [
    [98, 97, 95, 96, 90, 88],
    [96, 95, 94, 93, 89, 85],
    [99, 98, 97, 95, 0, 0],
    [95, 94, 92, 91, 88, 84],
    [97, 96, 93, 90, 86, 80],
  ],
};

/* ------------------------------------------------------------------ */
/* Modules transverses                                                 */
/* ------------------------------------------------------------------ */

export const ANNOUNCEMENTS: Announcement[] = [
  { id: "an-1", title: "Réunion parents-professeurs", body: "La réunion parents-professeurs du second trimestre aura lieu le samedi 25 mai 2026 à partir de 9h. Tous les parents sont invités à y participer pour discuter des résultats de leurs enfants.", priority: "high", important: true, scope: "etablissement", author: "M. KOUADIO Jean-Baptiste", authorRole: "Chef d'établissement", views: 245, date: "2026-05-12T09:00:00Z" },
  { id: "an-2", title: "Examens de fin de trimestre", body: "Les examens de fin du second trimestre se dérouleront du 10 au 15 juin 2026. Les emplois du temps des examens seront affichés prochainement. Les élèves doivent se munir de leur carte d'identité scolaire.", priority: "high", important: true, scope: "etablissement", author: "M. KOUADIO Jean-Baptiste", authorRole: "Chef d'établissement", views: 320, date: "2026-05-08T10:00:00Z" },
  { id: "an-3", title: "Formation continue APFC", body: "Atelier sur l'évaluation par compétences le 14 juin à l'antenne d'Abidjan. Inscriptions ouvertes auprès des conseillers pédagogiques.", priority: "normal", scope: "pays", author: "Direction APFC", authorRole: "Antenne pédagogique", views: 88, date: "2026-06-06T08:30:00Z" },
  { id: "an-4", title: "Sortie pédagogique — 3ᵉ A", body: "La classe de 3ᵉ A effectuera une sortie pédagogique au musée le 20 mai. Autorisation parentale requise avant le 15 mai.", priority: "normal", scope: "classe", audience: "3ᵉ A", author: "P. Kouassi", authorRole: "Professeur principal", views: 54, date: "2026-05-10T11:00:00Z" },
  { id: "an-5", title: "Maintenance plateforme", body: "Une maintenance est prévue dimanche de 02h à 04h. Le service sera momentanément indisponible.", priority: "low", scope: "pays", author: "Équipe technique", authorRole: "Support EduWeb", views: 31, date: "2026-06-04T18:00:00Z" },
];

export const MESSAGES = [
  { id: "m-1", from: "Hélène Brou", subject: "Bulletins 2ⁿᵈᵉ C", preview: "Les bulletins sont prêts pour validation.", date: "2026-06-09T08:10:00Z", read: false },
  { id: "m-2", from: "Parent — M. Traoré", subject: "Absence justifiée", preview: "Bonjour, mon fils était souffrant lundi.", date: "2026-06-08T17:32:00Z", read: false },
  { id: "m-3", from: "Inspecteur Konan", subject: "Rapport d'inspection", preview: "Le rapport est disponible en relecture.", date: "2026-06-08T12:00:00Z", read: true },
  { id: "m-4", from: "Service CAFOP", subject: "Import cohorte", preview: "3 lignes en erreur à corriger.", date: "2026-06-07T09:45:00Z", read: true },
];

export const APPOINTMENTS = [
  { id: "rdv-1", title: "Entretien parent — Awa Kouamé", requester: "Mme Kouamé", participant: "Chef d'établissement", startsAt: "2026-06-11T15:00:00Z", status: "confirmed", location: "Bureau direction" },
  { id: "rdv-2", title: "Suivi pédagogique", requester: "Conseiller", participant: "Daniel Yao", startsAt: "2026-06-12T10:30:00Z", status: "pending", location: "Visioconférence" },
  { id: "rdv-3", title: "Réunion d'antenne", requester: "Chef d'antenne", participant: "Coordonnateurs", startsAt: "2026-06-13T09:00:00Z", status: "confirmed", location: "Antenne Abidjan" },
];

export const SMS_TEMPLATES = [
  { id: "sms-1", trigger: "Absence", text: "Bonjour, votre enfant {eleve} a été absent le {date} au cours de {matiere}.", active: true },
  { id: "sms-2", trigger: "Retard", text: "Bonjour, votre enfant {eleve} est arrivé en retard de {minutes} min le {date}.", active: true },
  { id: "sms-3", trigger: "Note publiée", text: "Les notes du {periode} de {eleve} sont disponibles sur EduWeb Planner.", active: false },
  { id: "sms-4", trigger: "Rendez-vous", text: "Rappel : rendez-vous le {date} à {heure} avec {acteur}.", active: true },
];

export const SMS_LOGS = [
  { id: "sl-1", phone: "+225 07 11 22 33 44", trigger: "Absence", status: "delivered", sentAt: "2026-06-09T08:05:00Z" },
  { id: "sl-2", phone: "+225 05 66 77 88 99", trigger: "Retard", status: "delivered", sentAt: "2026-06-09T08:12:00Z" },
  { id: "sl-3", phone: "+225 01 23 45 67 89", trigger: "Absence", status: "pending", sentAt: "2026-06-09T08:20:00Z" },
  { id: "sl-4", phone: "+225 07 98 76 54 32", trigger: "Note publiée", status: "failed", sentAt: "2026-06-08T18:40:00Z" },
];

export const SUBSCRIPTION_PLANS = [
  { code: "standard", name: "Standard", price: 600000, interval: "an", features: ["Vie scolaire", "Notes & bulletins", "Communication", "Jusqu'à 800 élèves"] },
  { code: "etablissement", name: "Établissement", price: 1200000, interval: "an", features: ["Tout Standard", "Statistiques avancées", "Inspections", "Exports illimités", "Élèves illimités"] },
  { code: "premium", name: "Premium", price: 1900000, interval: "an", features: ["Tout Établissement", "Académie Premium", "Alertes SMS incluses", "Support prioritaire"] },
];

export const PAYMENTS = [
  { id: "pay-1", etablissement: "Lycée Moderne de Cocody", plan: "Établissement", amount: 1200000, status: "paid", paidAt: "2026-06-06", provider: "Stripe" },
  { id: "pay-2", etablissement: "Groupe Scolaire La Lumière", plan: "Premium", amount: 1900000, status: "paid", paidAt: "2026-05-30", provider: "Mobile Money" },
  { id: "pay-3", etablissement: "Lycée Moderne de Bouaké", plan: "Établissement", amount: 1200000, status: "pending", paidAt: null, provider: "Stripe" },
  { id: "pay-4", etablissement: "Collège Saint-Pierre", plan: "Standard", amount: 600000, status: "paid", paidAt: "2026-05-22", provider: "Stripe" },
];

/** Les 16 CAFOP officiels de Côte d'Ivoire. */
const CAFOP_CITIES = [
  "Abengourou", "Abidjan", "Aboisso", "Bondoukou", "Bouaké 1", "Bouaké 2", "Gagnoa", "Dabou",
  "Daloa", "Grand-Bassam", "Katiola", "Korhogo", "Man", "Odienné", "San-Pedro", "Yamoussoukro",
];
export const CAFOPS_SEED: import("./types").Cafop[] = CAFOP_CITIES.map((city, i) => {
  const baseCity = city.replace(/\s+\d+$/, "");
  const slug = baseCity.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3);
  return {
    id: `caf-${String(i + 1).padStart(2, "0")}`,
    name: `CAFOP ${/^[AEIOU]/i.test(city) ? "d'" : "de "}${city}`,
    code: `CAF-${slug}-${String(i + 1).padStart(3, "0")}`,
    year: "2026-2027",
    country: "CI",
    region: `DRENA ${baseCity}`,
    locality: city,
    address: `BP ${100 + i * 7}`,
    phone: `+225 27 ${String(20 + i).padStart(2, "0")} ${String((i * 13) % 100).padStart(2, "0")} ${String((i * 31) % 100).padStart(2, "0")} ${String((i * 47) % 100).padStart(2, "0")}`,
    email: `cafop.${city.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "")}@education.ci`,
    director: `${["M. KOUASSI Jean", "Mme BROU Hélène", "M. YAO Daniel", "Mme TANOH Grace", "M. DOUMBIA Moussa", "Mme CISSÉ Awa", "M. AKA Jules", "Mme KONÉ Mariam"][i % 8]}`,
    directorContact: `+225 07 ${String((i * 11) % 100).padStart(2, "0")} ${String((i * 23) % 100).padStart(2, "0")} ${String((i * 37) % 100).padStart(2, "0")} ${String((i * 53) % 100).padStart(2, "0")}`,
    promotions: 2 + (i % 3),
    cohortes: 4 + (i % 6),
    eleves: 240 + (i % 7) * 60,
  };
});

export const CAFOP_PROMOTIONS = [
  { id: "promo-1", center: "CAFOP d'Abidjan", label: "Promotion 2024–2026", cohortes: 3, eleves: 180, progression: 72 },
  { id: "promo-2", center: "CAFOP d'Abidjan", label: "Promotion 2025–2027", cohortes: 3, eleves: 186, progression: 38 },
  { id: "promo-3", center: "CAFOP de Bouaké 1", label: "Promotion 2024–2026", cohortes: 3, eleves: 174, progression: 70 },
];

/** Les 39 APFC (Antennes de la Pédagogie et de la Formation Continue) de Côte d'Ivoire. */
const APFC_CITIES = [
  "Abidjan 1", "Abidjan 2", "Abidjan 3", "Abidjan 4", "Aboisso", "Abengourou", "Adzopé", "Agboville",
  "Bondoukou", "Bouaké 1", "Bouaké 2", "Bouna", "Boundiali", "Daloa", "Danané", "Dabou",
  "Dimbokro", "Divo", "Ferkessédougou", "Gagnoa", "Grand-Bassam", "Guiglo", "Issia", "Katiola",
  "Korhogo", "Man", "Mankono", "Odienné", "Oumé", "San-Pedro", "Sassandra", "Séguéla",
  "Sinfra", "Soubré", "Tiassalé", "Toumodi", "Yamoussoukro", "Bongouanou", "Bingerville",
];
const APFC_RESPONSABLES = [
  "M. BAMBA Issouf", "Mme TOURÉ Aïcha", "M. AKA Jules", "Mme KONÉ Mariam", "M. DIABATÉ Sékou",
  "Mme BROU Hélène", "M. YAO Daniel", "Mme TANOH Grace", "M. OUATTARA Karim", "Mme CISSÉ Awa",
];
export const APFCS_SEED: import("./types").Apfc[] = APFC_CITIES.map((city, i) => {
  const baseCity = city.replace(/\s+\d+$/, "");
  const slug = baseCity.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 3);
  return {
    id: `apfc-${String(i + 1).padStart(2, "0")}`,
    name: `APFC ${/^[AEIOU]/i.test(city) ? "d'" : "de "}${city}`,
    code: `APFC-${slug}-${String(i + 1).padStart(3, "0")}`,
    country: "CI",
    region: `DRENA ${baseCity}`,
    locality: city,
    address: `BP ${200 + i * 5}`,
    phone: `+225 27 ${String(20 + (i % 60)).padStart(2, "0")} ${String((i * 17) % 100).padStart(2, "0")} ${String((i * 29) % 100).padStart(2, "0")} ${String((i * 41) % 100).padStart(2, "0")}`,
    email: `apfc.${city.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "")}@formation.ci`,
    responsable: APFC_RESPONSABLES[i % APFC_RESPONSABLES.length],
    responsableContact: `+225 07 ${String((i * 13) % 100).padStart(2, "0")} ${String((i * 19) % 100).padStart(2, "0")} ${String((i * 23) % 100).padStart(2, "0")} ${String((i * 31) % 100).padStart(2, "0")}`,
    antennes: 2 + (i % 4),
    coordonnateurs: 5 + (i % 7),
  };
});

/** Années scolaires couvertes par les activités de démonstration. */
export const APFC_PERIODS = ["2025-2026", "2026-2027"];
export const APFC_ACTIVITY_TYPES = [
  "Atelier pédagogique",
  "Séminaire",
  "Journée de formation",
  "Regroupement disciplinaire",
  "Formation continue",
];
const APFC_ACTIVITY_TITLES = [
  "Évaluation par compétences",
  "Différenciation pédagogique",
  "Classe inversée en sciences",
  "Gestion des grands groupes",
  "Intégration du numérique éducatif",
  "Approche par situations",
  "Remédiation et soutien scolaire",
  "Élaboration des progressions annuelles",
  "Pédagogie active et coopérative",
];

/**
 * Activités de formation continue par APFC (enregistrements datés).
 * Le nombre par antenne reprend l'ancien compteur (6 + i%9) réparti sur deux
 * années scolaires : le total « toutes périodes » reste donc identique (381).
 */
export const APFC_ACTIVITIES_SEED: import("./types").ApfcActivity[] = APFCS_SEED.flatMap((apfc, i) => {
  const count = 6 + (i % 9);
  return Array.from({ length: count }, (_, k) => {
    const period = APFC_PERIODS[k % APFC_PERIODS.length];
    const startYear = Number(period.slice(0, 4));
    const month = [10, 11, 12, 1, 2, 3, 4, 5][k % 8];
    const year = month >= 9 ? startYear : startYear + 1;
    const day = ((i + k * 3) % 27) + 1;
    return {
      id: `apfc-act-${apfc.id}-${k + 1}`,
      apfcId: apfc.id,
      date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      schoolYear: period,
      type: APFC_ACTIVITY_TYPES[(i + k) % APFC_ACTIVITY_TYPES.length],
      title: APFC_ACTIVITY_TITLES[(i * 2 + k) % APFC_ACTIVITY_TITLES.length],
    };
  });
});

export const APFC_ANTENNAS = [
  { id: "apfc-1", name: "Antenne APFC Abidjan", region: "Abidjan 1", head: "M. Bamba", activities: 14, coordinators: 9 },
  { id: "apfc-2", name: "Antenne APFC Bouaké", region: "Bouaké", head: "Mme Touré", activities: 9, coordinators: 6 },
  { id: "apfc-3", name: "Antenne APFC Daloa", region: "Daloa", head: "M. Aka", activities: 7, coordinators: 5 },
];

export const APFC_ACTIVITIES = [
  { id: "act-1", antenna: "Antenne APFC Abidjan", title: "Évaluation par compétences", type: "Atelier", startsAt: "2026-06-14T09:00:00Z", status: "planned" },
  { id: "act-2", antenna: "Antenne APFC Abidjan", title: "Classe inversée en SVT", type: "Séminaire", startsAt: "2026-06-02T09:00:00Z", status: "completed" },
  { id: "act-3", antenna: "Antenne APFC Bouaké", title: "Remédiation en mathématiques", type: "Formation", startsAt: "2026-06-18T08:30:00Z", status: "planned" },
];

/* Emploi du temps — créneaux d'une classe type */
export const TIMETABLE_SLOTS = [
  { id: "ts-1", weekday: 1, start: "08:00", end: "10:00", subject: "Mathématiques", teacher: "P. Kouassi", room: "B12", color: "#176b45" },
  { id: "ts-2", weekday: 1, start: "10:15", end: "12:15", subject: "Français", teacher: "H. Brou", room: "A03", color: "#2563eb" },
  { id: "ts-3", weekday: 2, start: "08:00", end: "10:00", subject: "Physique-Chimie", teacher: "M. Doumbia", room: "Labo 1", color: "#7c3aed" },
  { id: "ts-4", weekday: 2, start: "14:00", end: "16:00", subject: "Anglais", teacher: "A. Cissé", room: "A07", color: "#dc2626" },
  { id: "ts-5", weekday: 3, start: "08:00", end: "10:00", subject: "SVT", teacher: "G. Tanoh", room: "Labo 2", color: "#16a34a" },
  { id: "ts-6", weekday: 4, start: "10:15", end: "12:15", subject: "Histoire-Géo", teacher: "D. Yao", room: "B05", color: "#ea580c" },
  { id: "ts-7", weekday: 5, start: "08:00", end: "10:00", subject: "Philosophie", teacher: "J. Aka", room: "A01", color: "#0891b2" },
  { id: "ts-8", weekday: 5, start: "10:15", end: "12:15", subject: "EPS", teacher: "M. Koné", room: "Gymnase", color: "#65a30d" },
];

/**
 * Emploi du temps rattaché à la classe ET à l'enseignant (démo).
 * Plusieurs classes partagent des enseignants → permet « mes classes » (classes
 * prises par un enseignant) et « collègues sur la même classe ». À remplacer par
 * les vraies données (créneaux Supabase + affectations enseignants) en Phase 2.
 */
export interface ScheduleSlot {
  id: string;
  className: string;
  weekday: number; // 1 = lundi … 5 = vendredi
  start: string;
  end: string;
  subject: string;
  teacher: string;
  room: string;
  color: string;
}

export const SCHOOL_TIMETABLE: ScheduleSlot[] = [
  // 2ⁿᵈᵉ C
  { id: "st-1", className: "2nde C", weekday: 1, start: "08:00", end: "10:00", subject: "Mathématiques", teacher: "P. Kouassi", room: "B12", color: "#176b45" },
  { id: "st-2", className: "2nde C", weekday: 1, start: "10:15", end: "12:15", subject: "Français", teacher: "H. Brou", room: "A03", color: "#2563eb" },
  { id: "st-3", className: "2nde C", weekday: 2, start: "08:00", end: "10:00", subject: "SVT", teacher: "G. Tanoh", room: "Labo 2", color: "#16a34a" },
  { id: "st-4", className: "2nde C", weekday: 2, start: "14:00", end: "16:00", subject: "Anglais", teacher: "A. Cissé", room: "A07", color: "#dc2626" },
  { id: "st-5", className: "2nde C", weekday: 3, start: "08:00", end: "10:00", subject: "Histoire-Géo", teacher: "D. Yao", room: "B05", color: "#ea580c" },
  { id: "st-6", className: "2nde C", weekday: 4, start: "10:15", end: "12:15", subject: "Mathématiques", teacher: "P. Kouassi", room: "B12", color: "#176b45" },
  { id: "st-7", className: "2nde C", weekday: 5, start: "08:00", end: "10:00", subject: "EPS", teacher: "M. Koné", room: "Gymnase", color: "#65a30d" },
  // 1ʳᵉ D
  { id: "st-8", className: "1ere D", weekday: 1, start: "08:00", end: "10:00", subject: "Physique-Chimie", teacher: "M. Doumbia", room: "Labo 1", color: "#7c3aed" },
  { id: "st-9", className: "1ere D", weekday: 1, start: "10:15", end: "12:15", subject: "Mathématiques", teacher: "P. Kouassi", room: "B14", color: "#176b45" },
  { id: "st-10", className: "1ere D", weekday: 2, start: "08:00", end: "10:00", subject: "Anglais", teacher: "A. Cissé", room: "A07", color: "#dc2626" },
  { id: "st-11", className: "1ere D", weekday: 3, start: "10:15", end: "12:15", subject: "SVT", teacher: "G. Tanoh", room: "Labo 2", color: "#16a34a" },
  { id: "st-12", className: "1ere D", weekday: 4, start: "08:00", end: "10:00", subject: "EPS", teacher: "M. Koné", room: "Gymnase", color: "#65a30d" },
  { id: "st-13", className: "1ere D", weekday: 5, start: "10:15", end: "12:15", subject: "Physique-Chimie", teacher: "M. Doumbia", room: "Labo 1", color: "#7c3aed" },
  // Tˡᵉ A
  { id: "st-14", className: "Tle A", weekday: 1, start: "08:00", end: "10:00", subject: "Philosophie", teacher: "J. Aka", room: "A01", color: "#0891b2" },
  { id: "st-15", className: "Tle A", weekday: 2, start: "10:15", end: "12:15", subject: "Français", teacher: "H. Brou", room: "A03", color: "#2563eb" },
  { id: "st-16", className: "Tle A", weekday: 3, start: "08:00", end: "10:00", subject: "Physique-Chimie", teacher: "M. Doumbia", room: "Labo 1", color: "#7c3aed" },
  { id: "st-17", className: "Tle A", weekday: 4, start: "14:00", end: "16:00", subject: "Anglais", teacher: "A. Cissé", room: "A07", color: "#dc2626" },
  { id: "st-18", className: "Tle A", weekday: 5, start: "08:00", end: "10:00", subject: "Histoire-Géo", teacher: "D. Yao", room: "B05", color: "#ea580c" },
  { id: "st-19", className: "Tle A", weekday: 5, start: "10:15", end: "12:15", subject: "EPS", teacher: "M. Koné", room: "Gymnase", color: "#65a30d" },
];

export const LESSON_BOOK_ENTRIES: LessonEntry[] = [
  { id: "lb-1", date: "2026-06-09", subject: "Mathématiques", className: "3ᵉ A", title: "Théorème de Thalès", status: "published", teacher: "P. Kouassi" },
  { id: "lb-2", date: "2026-06-09", subject: "Français", className: "2ⁿᵈᵉ C", title: "L'argumentation", status: "published", teacher: "H. Brou" },
  { id: "lb-3", date: "2026-06-08", subject: "SVT", className: "Tˡᵉ D", title: "La reproduction cellulaire", status: "draft", teacher: "G. Tanoh" },
  { id: "lb-4", date: "2026-06-08", subject: "Physique-Chimie", className: "1ʳᵉ D", title: "Les forces", status: "draft", teacher: "M. Doumbia" },
];

export const EVALUATION_GRID = {
  title: "Grille d'observation de classe — Enseignant",
  domains: [
    {
      domain: "Préparation & planification",
      criteria: [
        { criterion: "Fiche de préparation conforme", max: 5 },
        { criterion: "Objectifs clairs et mesurables", max: 5 },
      ],
    },
    {
      domain: "Conduite de la séance",
      criteria: [
        { criterion: "Gestion du temps", max: 5 },
        { criterion: "Participation des élèves", max: 5 },
        { criterion: "Clarté des consignes", max: 5 },
      ],
    },
    {
      domain: "Évaluation",
      criteria: [
        { criterion: "Évaluation formative intégrée", max: 5 },
        { criterion: "Feedback aux élèves", max: 5 },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Annuaire des comptes & demandes de promotion                        */
/* ------------------------------------------------------------------ */

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  etablissement: string;
  region: string;
  /** Numéro international complet (ex. « +225 07 12 34 56 78 »), pour les notifications SMS. */
  phone?: string;
  /** Code pays ISO (ex. « CI ») — rattachement national de l'utilisateur. */
  country?: string;
  /** Date et heure d'inscription, ISO UTC. */
  createdAt?: string;
  /** Cohorte d'origine pour les comptes créés par dépôt CSV ; absent = inscription manuelle. */
  cohorte?: string;
}

const DIR_ROLES: UserRole[] = [
  "chef_etablissement",
  "enseignant",
  "educateur",
  "inspecteur",
  "conseiller_pedagogique",
  "parent",
  "eleve",
  "drena",
  "cafop_admin",
  "apfc_admin",
  "etablissements_admin",
];
const DIR_STATUS: AccountStatus[] = ["active", "active", "active", "pending", "active", "suspended"];

export const USER_DIRECTORY: DirectoryUser[] = Array.from({ length: 22 }, (_, i) => {
  const role = DIR_ROLES[i % DIR_ROLES.length];
  const country = i % 9 === 4 ? "SN" : i % 9 === 8 ? "FR" : "CI";
  const createdAt = new Date(Date.UTC(2026, (i * 3) % 6, ((i * 7) % 27) + 1, (i * 5) % 24, (i * 13) % 60)).toISOString();
  return {
    // Identifiant technique normé : EWP-<PAYS>-<ANNÉE>-<RÔLE>-<SÉQUENCE>-<CLÉ>
    id: generateUserUid({ country, role, createdAt, seq: i + 1 }),
    name: `${PRENOMS[i % PRENOMS.length]} ${NOMS[(i + 3) % NOMS.length]}`,
    email: `${PRENOMS[i % PRENOMS.length].toLowerCase()}.${NOMS[(i + 3) % NOMS.length].toLowerCase().replace(/['’ ]/g, "")}@eduweb.ci`,
    role,
    status: DIR_STATUS[i % DIR_STATUS.length],
    etablissement: ETABLISSEMENTS[i % ETABLISSEMENTS.length].shortName,
    region: ETABLISSEMENTS[i % ETABLISSEMENTS.length].academicRegionCode,
    phone: `+225 ${["07", "05", "01"][i % 3]} ${String(20 + ((i * 7) % 79)).padStart(2, "0")} ${String((i * 31) % 100).padStart(2, "0")} ${String((i * 53) % 100).padStart(2, "0")} ${String((i * 97) % 100).padStart(2, "0")}`,
    country,
    createdAt,
    cohorte: i % 4 === 1 ? "Cohorte 2026-A (CSV)" : i % 4 === 3 ? "Cohorte 2026-B (CSV)" : undefined,
  };
});

export interface RoleRequest {
  id: string;
  name: string;
  currentRole: UserRole;
  requestedRole: UserRole;
  reason: string;
  date: string;
}

export const ROLE_REQUESTS: RoleRequest[] = [
  { id: "req-1", name: "Paul Kouassi", currentRole: "enseignant", requestedRole: "chef_etablissement", reason: "Nomination comme directeur des études.", date: "2026-06-07" },
  { id: "req-2", name: "Awa Cissé", currentRole: "enseignant", requestedRole: "conseiller_pedagogique", reason: "Affectation à l'accompagnement pédagogique.", date: "2026-06-06" },
  { id: "req-3", name: "Daniel Yao", currentRole: "educateur", requestedRole: "enseignant", reason: "Obtention du diplôme CAFOP.", date: "2026-06-05" },
  { id: "req-4", name: "Mme Touré", currentRole: "inspecteur", requestedRole: "drena", reason: "Promotion au pilotage régional.", date: "2026-06-03" },
];
